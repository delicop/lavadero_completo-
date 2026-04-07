import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Turno, EstadoTurno, TRANSICIONES_VALIDAS } from './entities/turno.entity';
import { ClientesService } from '../clientes/clientes.service';
import { VehiculosService } from '../vehiculos/vehiculos.service';
import { ServiciosService } from '../servicios/servicios.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CrearTurnoDto } from './dto/crear-turno.dto';
import { ActualizarTurnoDto } from './dto/actualizar-turno.dto';
import { ActualizarEstadoDto } from './dto/actualizar-estado.dto';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turno)
    private readonly repo: Repository<Turno>,
    private readonly clientesService: ClientesService,
    private readonly vehiculosService: VehiculosService,
    private readonly serviciosService: ServiciosService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(dto: CrearTurnoDto): Promise<Turno> {
    // Validar que todos los recursos existen
    await this.clientesService.buscarPorId(dto.clienteId);
    await this.usuariosService.buscarPorId(dto.trabajadorId);

    const vehiculo = await this.vehiculosService.buscarPorId(dto.vehiculoId);
    if (vehiculo.clienteId !== dto.clienteId) {
      throw new BadRequestException('El vehículo no pertenece al cliente indicado');
    }

    const turnoActivo = await this.repo.findOne({
      where: {
        vehiculoId: dto.vehiculoId,
        estado: In([EstadoTurno.PENDIENTE, EstadoTurno.EN_PROCESO]),
      },
    });
    if (turnoActivo) {
      throw new BadRequestException(
        `Este vehículo ya tiene un turno ${turnoActivo.estado === EstadoTurno.PENDIENTE ? 'pendiente' : 'en proceso'}. Debe completarse o cancelarse antes de crear uno nuevo.`,
      );
    }

    const servicio = await this.serviciosService.buscarPorId(dto.servicioId);
    if (!servicio.activo) {
      throw new BadRequestException('El servicio seleccionado no está disponible');
    }

    const turno = this.repo.create({
      ...dto,
      fechaHora: new Date(dto.fechaHora),
      observaciones: dto.observaciones ?? null,
    });
    return this.repo.save(turno);
  }

  async buscarTodos(estado?: EstadoTurno, fechaDesde?: string, fechaHasta?: string): Promise<Turno[]> {
    const where: Record<string, unknown> = {};
    if (estado) where['estado'] = estado;
    if (fechaDesde && fechaHasta) {
      where['fechaHora'] = Between(
        new Date(`${fechaDesde}T00:00:00`),
        new Date(`${fechaHasta}T23:59:59`),
      );
    }
    return this.repo.find({
      where,
      relations: ['cliente', 'vehiculo', 'servicio', 'trabajador'],
      order: { fechaHora: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Turno> {
    const turno = await this.repo.findOne({
      where: { id },
      relations: ['cliente', 'vehiculo', 'servicio', 'trabajador'],
    });
    if (!turno) {
      throw new NotFoundException(`Turno con id ${id} no encontrado`);
    }
    return turno;
  }

  async buscarPorTrabajador(trabajadorId: string, fechaDesde?: string, fechaHasta?: string): Promise<Turno[]> {
    const where: Record<string, unknown> = { trabajadorId };
    if (fechaDesde && fechaHasta) {
      where['fechaHora'] = Between(
        new Date(`${fechaDesde}T00:00:00`),
        new Date(`${fechaHasta}T23:59:59`),
      );
    }
    return this.repo.find({
      where,
      relations: ['cliente', 'vehiculo', 'servicio'],
      order: { fechaHora: 'ASC' },
    });
  }

  async actualizar(id: string, dto: ActualizarTurnoDto): Promise<Turno> {
    const turno = await this.buscarPorId(id);

    if (turno.estado !== EstadoTurno.PENDIENTE) {
      throw new BadRequestException('Solo se pueden editar turnos en estado pendiente');
    }

    if (dto.trabajadorId) {
      await this.usuariosService.buscarPorId(dto.trabajadorId);
    }

    Object.assign(turno, {
      ...(dto.trabajadorId && { trabajadorId: dto.trabajadorId }),
      ...(dto.fechaHora && { fechaHora: new Date(dto.fechaHora) }),
      ...(dto.observaciones !== undefined && { observaciones: dto.observaciones }),
    });

    return this.repo.save(turno);
  }

  async cambiarEstado(id: string, dto: ActualizarEstadoDto): Promise<Turno> {
    const turno = await this.buscarPorId(id);

    const transicionesPermitidas = TRANSICIONES_VALIDAS[turno.estado];
    if (!transicionesPermitidas.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar de "${turno.estado}" a "${dto.estado}". ` +
        `Transiciones válidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`,
      );
    }

    turno.estado = dto.estado;
    return this.repo.save(turno);
  }

  async eliminar(id: string): Promise<void> {
    const turno = await this.buscarPorId(id);

    if (turno.estado === EstadoTurno.EN_PROCESO) {
      throw new BadRequestException('No se puede eliminar un turno en proceso');
    }

    await this.repo.remove(turno);
  }
}
