import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Liquidacion, EstadoLiquidacion } from './entities/liquidacion.entity';
import { Turno, EstadoTurno } from '../turnos/entities/turno.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CrearLiquidacionDto } from './dto/crear-liquidacion.dto';

@Injectable()
export class LiquidacionesService {
  constructor(
    @InjectRepository(Liquidacion)
    private readonly repo: Repository<Liquidacion>,
    @InjectRepository(Turno)
    private readonly turnosRepo: Repository<Turno>,
    private readonly usuariosService: UsuariosService,
  ) {}

  async crear(dto: CrearLiquidacionDto): Promise<Liquidacion> {
    const trabajador = await this.usuariosService.buscarPorId(dto.trabajadorId);

    const fechaDesde = new Date(`${dto.fechaDesde}T00:00:00`);
    const fechaHasta = new Date(`${dto.fechaHasta}T23:59:59`);

    if (fechaDesde > fechaHasta) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Turnos completados del trabajador en el período sin liquidar
    const turnos = await this.turnosRepo.find({
      where: {
        trabajadorId: dto.trabajadorId,
        estado: EstadoTurno.COMPLETADO,
        liquidacionId: IsNull(),
        fechaHora: Between(fechaDesde, fechaHasta),
      },
      relations: ['servicio'],
    });

    if (turnos.length === 0) {
      throw new BadRequestException(
        'No hay turnos completados sin liquidar para ese trabajador en el período indicado',
      );
    }

    const totalServicios = turnos.reduce((sum, t) => sum + Number(t.servicio.precio), 0);
    const comision = Number((trabajador as { comisionPorcentaje?: number }).comisionPorcentaje ?? 50);
    const totalPago = totalServicios * (comision / 100);

    const liquidacion = this.repo.create({
      trabajadorId: dto.trabajadorId,
      fechaDesde: dto.fechaDesde,
      fechaHasta: dto.fechaHasta,
      cantidadTurnos: turnos.length,
      totalServicios,
      comisionPorcentaje: comision,
      totalPago,
    });

    const guardada = await this.repo.save(liquidacion);

    // Marcar los turnos como liquidados
    await this.turnosRepo.update(
      turnos.map(t => t.id),
      { liquidacionId: guardada.id },
    );

    return this.buscarPorId(guardada.id);
  }

  async buscarTodas(): Promise<Liquidacion[]> {
    return this.repo.find({
      relations: ['trabajador'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Liquidacion> {
    const liquidacion = await this.repo.findOne({
      where: { id },
      relations: ['trabajador'],
    });
    if (!liquidacion) {
      throw new NotFoundException(`Liquidación con id ${id} no encontrada`);
    }
    return liquidacion;
  }

  async buscarTurnosDeLiquidacion(id: string): Promise<Turno[]> {
    await this.buscarPorId(id);
    return this.turnosRepo.find({
      where: { liquidacionId: id },
      relations: ['cliente', 'vehiculo', 'servicio'],
      order: { fechaHora: 'ASC' },
    });
  }

  async buscarPorTrabajador(trabajadorId: string): Promise<Liquidacion[]> {
    return this.repo.find({
      where: { trabajadorId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async marcarPagada(id: string): Promise<Liquidacion> {
    const liquidacion = await this.buscarPorId(id);

    if (liquidacion.estado === EstadoLiquidacion.PAGADA) {
      throw new BadRequestException('Esta liquidación ya fue pagada');
    }

    liquidacion.estado = EstadoLiquidacion.PAGADA;
    liquidacion.fechaPago = new Date();
    return this.repo.save(liquidacion);
  }
}
