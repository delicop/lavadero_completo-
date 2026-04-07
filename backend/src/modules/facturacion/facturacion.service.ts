import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { TurnosService } from '../turnos/turnos.service';
import { EstadoTurno } from '../turnos/entities/turno.entity';
import { CrearFacturaDto } from './dto/crear-factura.dto';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura)
    private readonly repo: Repository<Factura>,
    private readonly turnosService: TurnosService,
  ) {}

  async crear(dto: CrearFacturaDto): Promise<Factura> {
    const turno = await this.turnosService.buscarPorId(dto.turnoId);

    if (turno.estado !== EstadoTurno.COMPLETADO) {
      throw new BadRequestException(
        `Solo se puede facturar un turno completado. Estado actual: "${turno.estado}"`,
      );
    }

    const facturaExistente = await this.repo.findOne({ where: { turnoId: dto.turnoId } });
    if (facturaExistente) {
      throw new ConflictException('Este turno ya tiene una factura generada');
    }

    const factura = this.repo.create({
      ...dto,
      observaciones: dto.observaciones ?? null,
    });
    return this.repo.save(factura);
  }

  async buscarTodas(): Promise<Factura[]> {
    return this.repo.find({
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async buscarPorId(id: string): Promise<Factura> {
    const factura = await this.repo.findOne({
      where: { id },
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
    });
    if (!factura) {
      throw new NotFoundException(`Factura con id ${id} no encontrada`);
    }
    return factura;
  }

  async buscarPorTurno(turnoId: string): Promise<Factura> {
    const factura = await this.repo.findOne({
      where: { turnoId },
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
    });
    if (!factura) {
      throw new NotFoundException(`No existe factura para el turno ${turnoId}`);
    }
    return factura;
  }
}
