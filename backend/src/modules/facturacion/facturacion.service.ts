import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Factura } from './entities/factura.entity';
import { CajaDia, EstadoCajaDia } from '../caja/entities/caja-dia.entity';
import { TurnosService } from '../turnos/turnos.service';
import { TenantsService } from '../tenants/tenants.service';
import { EstadoTurno } from '../turnos/entities/turno.entity';
import { CrearFacturaDto } from './dto/crear-factura.dto';

@Injectable()
export class FacturacionService {
  constructor(
    @InjectRepository(Factura)
    private readonly repo: Repository<Factura>,
    @InjectRepository(CajaDia)
    private readonly cajaDiaRepo: Repository<CajaDia>,
    private readonly turnosService: TurnosService,
    private readonly tenantsService: TenantsService,
  ) {}

  async crear(dto: CrearFacturaDto, tenantId: string): Promise<Factura> {
    const turno = await this.turnosService.buscarPorId(dto.turnoId, tenantId);

    if (turno.estado !== EstadoTurno.COMPLETADO) {
      throw new BadRequestException(
        `Solo se puede facturar un turno completado. Estado actual: "${turno.estado}"`,
      );
    }

    const facturaExistente = await this.repo.findOne({ where: { turnoId: dto.turnoId } });
    if (facturaExistente) {
      throw new ConflictException('Este turno ya tiene una factura generada');
    }

    const factura = this.repo.create({ ...dto, observaciones: dto.observaciones ?? null, tenantId });
    const saved = await this.repo.save(factura);

    // Actualizar columna pre-computada en la caja abierta del tenant
    const cajaAbierta = await this.cajaDiaRepo.findOne({
      where: { estado: EstadoCajaDia.ABIERTA, tenantId },
    });
    if (cajaAbierta) {
      const campo = dto.metodoPago === 'efectivo' ? 'ventasEfectivo' : 'ventasTransferencia';
      await this.cajaDiaRepo.increment({ id: cajaAbierta.id }, campo, Number(dto.total));
    }

    return saved;
  }

  async buscarTodas(tenantId: string, fechaDesde?: string, fechaHasta?: string): Promise<Factura[]> {
    const where: Record<string, unknown> = { tenantId };
    if (fechaDesde && fechaHasta) {
      const offset = await this.tenantsService.offsetParaTenant(tenantId);
      where['fechaEmision'] = Between(
        new Date(`${fechaDesde}T00:00:00${offset}`),
        new Date(`${fechaHasta}T23:59:59${offset}`),
      );
    }
    return this.repo.find({
      where,
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async buscarPorId(id: string, tenantId: string): Promise<Factura> {
    const factura = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
    });
    if (!factura) {
      throw new NotFoundException(`Factura con id ${id} no encontrada`);
    }
    return factura;
  }

  async buscarPorTurno(turnoId: string, tenantId: string): Promise<Factura> {
    const factura = await this.repo.findOne({
      where: { turnoId, tenantId },
      relations: ['turno', 'turno.cliente', 'turno.vehiculo', 'turno.servicio'],
    });
    if (!factura) {
      throw new NotFoundException(`No existe factura para el turno ${turnoId}`);
    }
    return factura;
  }
}
