import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { CajaDia, EstadoCajaDia } from './entities/caja-dia.entity';
import { GastoCaja, TipoPagoCaja } from './entities/gasto-caja.entity';
import { IngresoManualCaja } from './entities/ingreso-manual-caja.entity';
import { Factura } from '../facturacion/entities/factura.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { EstadoTurno } from '../turnos/entities/turno.entity';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { RegistrarGastoDto } from './dto/registrar-gasto.dto';
import { RegistrarIngresoManualDto } from './dto/registrar-ingreso-manual.dto';
import { TenantsService } from '../tenants/tenants.service';

export interface GananciaTrabajador {
  trabajadorId: string;
  nombre: string;
  apellido: string;
  comisionPorcentaje: number;
  totalServicios: number;
  ganancia: number;
}

export interface ResumenCaja {
  cajaDia: CajaDia;
  ingresos: {
    montoInicial: number;
    ventasEfectivo: number;
    ventasTransferencia: number;
    ingresosManual: number;
    total: number;
  };
  gastos: {
    efectivo: number;
    transferencia: number;
    total: number;
    lista: GastoCaja[];
  };
  ganancias: {
    trabajadores: GananciaTrabajador[];
    totalEmpleados: number;
    lavadero: number;
    totalDia: number;
  };
  ingresosManualLista: IngresoManualCaja[];
  facturasList: Factura[];
}

@Injectable()
export class CajaService {
  private readonly logger = new Logger(CajaService.name);

  constructor(
    @InjectRepository(CajaDia)
    private readonly cajaDiaRepo: Repository<CajaDia>,
    @InjectRepository(GastoCaja)
    private readonly gastoCajaRepo: Repository<GastoCaja>,
    @InjectRepository(IngresoManualCaja)
    private readonly ingresoManualRepo: Repository<IngresoManualCaja>,
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    private readonly tenantsService: TenantsService,
  ) {}

  // Cierra automáticamente todas las cajas abiertas a las 11pm de cada tenant.
  // Se ejecuta cada minuto entre 23:00 y 23:59 para cubrir distintas zonas horarias.
  @Cron('0 23 * * *', { timeZone: 'America/Bogota' })
  async cerrarCajasAutomaticamente(): Promise<void> {
    this.logger.log('Cron: cerrando cajas abiertas automáticamente...');
    const cajasAbiertas = await this.cajaDiaRepo.find({
      where: { estado: EstadoCajaDia.ABIERTA },
    });
    for (const caja of cajasAbiertas) {
      if (!caja.tenantId) continue;
      const hoy = await this.fechaHoy(caja.tenantId);
      if (caja.fecha === hoy) {
        caja.estado = EstadoCajaDia.CERRADA;
        caja.usuarioCierreId = null;
        caja.fechaCierre = new Date();
        await this.cajaDiaRepo.save(caja);
        this.logger.log(`Caja ${caja.id} (tenant ${caja.tenantId}) cerrada automáticamente.`);
      }
    }
  }

  private async fechaHoy(tenantId: string): Promise<string> {
    const tenant = await this.tenantsService.buscarPorId(tenantId);
    return new Intl.DateTimeFormat('en-CA', { timeZone: tenant.zonaHoraria }).format(new Date());
  }

  private async zonaHorariaTenant(tenantId: string): Promise<string> {
    const tenant = await this.tenantsService.buscarPorId(tenantId);
    return tenant.zonaHoraria;
  }

  private offsetDesdeZonaHoraria(zonaHoraria: string): string {
    const fecha = new Date();
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaHoraria,
      timeZoneName: 'shortOffset',
    }).formatToParts(fecha);
    const offsetStr = partes.find(p => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    // offsetStr es algo como "GMT-5" o "GMT+2"
    const match = offsetStr.match(/GMT([+-]\d+)/);
    if (!match) return '+00:00';
    const horas = parseInt(match[1], 10);
    const signo = horas >= 0 ? '+' : '-';
    const absHoras = Math.abs(horas).toString().padStart(2, '0');
    return `${signo}${absHoras}:00`;
  }

  async obtenerEstado(tenantId: string): Promise<{ cajaHoy: CajaDia | null; cajaSinCerrar: CajaDia | null }> {
    const hoy = await this.fechaHoy(tenantId);
    const [cajaHoy, cajaSinCerrar] = await Promise.all([
      this.cajaDiaRepo.findOne({ where: { fecha: hoy, tenantId } }),
      this.cajaDiaRepo.findOne({
        where: { estado: EstadoCajaDia.ABIERTA, fecha: Not(hoy), tenantId },
        order: { fecha: 'DESC' },
      }),
    ]);
    return { cajaHoy, cajaSinCerrar };
  }

  async abrir(dto: AbrirCajaDto, usuarioId: string, tenantId: string): Promise<CajaDia> {
    const hoy = await this.fechaHoy(tenantId);

    const existente = await this.cajaDiaRepo.findOne({ where: { fecha: hoy, tenantId } });
    if (existente) throw new ConflictException('Ya existe una caja para el día de hoy');

    const sinCerrar = await this.cajaDiaRepo.findOne({
      where: { estado: EstadoCajaDia.ABIERTA, fecha: Not(hoy), tenantId },
    });
    if (sinCerrar) {
      throw new BadRequestException(
        `Debe cerrar la caja del ${sinCerrar.fecha} antes de abrir una nueva`,
      );
    }

    const caja = this.cajaDiaRepo.create({
      fecha: hoy,
      montoInicial: dto.montoInicial,
      observaciones: dto.observaciones ?? null,
      estado: EstadoCajaDia.ABIERTA,
      usuarioAperturaId: usuarioId,
      fechaApertura: new Date(),
      tenantId,
    });
    return this.cajaDiaRepo.save(caja);
  }

  async calcularResumen(cajaDiaId: string, tenantId: string): Promise<ResumenCaja> {
    const cajaDia = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId, tenantId } });
    if (!cajaDia) throw new NotFoundException('Caja no encontrada');

    const fecha = cajaDia.fecha;
    const offset = this.offsetDesdeZonaHoraria(await this.zonaHorariaTenant(tenantId));

    const ventasEfectivo = Number(cajaDia.ventasEfectivo);
    const ventasTransferencia = Number(cajaDia.ventasTransferencia);

    const [turnos, gastos, ingManuales, facturas] = await Promise.all([
      this.turnoRepo
        .createQueryBuilder('t')
        .select(['t.id', 't.trabajadorId', 't.servicioId'])
        .addSelect(['u.id', 'u.nombre', 'u.apellido', 'u.comisionPorcentaje'])
        .addSelect(['s.precio'])
        .innerJoin('t.trabajador', 'u')
        .innerJoin('t.servicio', 's')
        .where('t.estado = :estado', { estado: EstadoTurno.COMPLETADO })
        .andWhere('t.tenantId = :tenantId', { tenantId })
        .andWhere(`t.fechaHora >= :fecha::date AND t.fechaHora < (:fecha::date + INTERVAL '1 day')`, { fecha })
        .getMany(),
      this.gastoCajaRepo.find({ where: { cajaDiaId } }),
      this.ingresoManualRepo.find({ where: { cajaDiaId } }),
      this.facturaRepo
        .createQueryBuilder('f')
        .leftJoinAndSelect('f.turno', 't')
        .leftJoinAndSelect('t.cliente', 'c')
        .leftJoinAndSelect('t.vehiculo', 'v')
        .leftJoinAndSelect('t.servicio', 's')
        .leftJoinAndSelect('t.trabajador', 'u')
        .where('f.tenantId = :tenantId', { tenantId })
        .andWhere('f.fechaEmision >= :desde AND f.fechaEmision <= :hasta', {
          desde: new Date(`${fecha}T00:00:00${offset}`),
          hasta: new Date(`${fecha}T23:59:59${offset}`),
        })
        .orderBy('f.fechaEmision', 'ASC')
        .getMany(),
    ]);

    const gastosEfectivo = gastos
      .filter(g => g.tipoPago === TipoPagoCaja.EFECTIVO)
      .reduce((s, g) => s + Number(g.monto), 0);
    const gastosTransferencia = gastos
      .filter(g => g.tipoPago === TipoPagoCaja.TRANSFERENCIA)
      .reduce((s, g) => s + Number(g.monto), 0);
    const totalIngresosManual = ingManuales.reduce((s, i) => s + Number(i.monto), 0);

    const mapaT = new Map<string, { nombre: string; apellido: string; comision: number; total: number }>();
    for (const t of turnos) {
      const u = t.trabajador;
      if (!mapaT.has(u.id)) {
        mapaT.set(u.id, {
          nombre: u.nombre,
          apellido: u.apellido,
          comision: Number(u.comisionPorcentaje),
          total: 0,
        });
      }
      mapaT.get(u.id)!.total += Number(t.servicio.precio);
    }

    const gananciasEmpleados: GananciaTrabajador[] = Array.from(mapaT.entries()).map(
      ([trabajadorId, d]) => ({
        trabajadorId,
        nombre: d.nombre,
        apellido: d.apellido,
        comisionPorcentaje: d.comision,
        totalServicios: d.total,
        ganancia: d.total * (d.comision / 100),
      }),
    );

    const totalGananciaEmpleados = gananciasEmpleados.reduce((s, e) => s + e.ganancia, 0);
    const totalVentas = ventasEfectivo + ventasTransferencia + totalIngresosManual;
    const totalGastos = gastosEfectivo + gastosTransferencia;
    const montoInicial = Number(cajaDia.montoInicial);
    const gananciaLavadero = totalVentas - totalGananciaEmpleados;
    const totalDia = montoInicial + gananciaLavadero - totalGastos;

    return {
      cajaDia,
      ingresos: {
        montoInicial: Number(cajaDia.montoInicial),
        ventasEfectivo,
        ventasTransferencia,
        ingresosManual: totalIngresosManual,
        total: montoInicial + totalVentas,
      },
      gastos: {
        efectivo: gastosEfectivo,
        transferencia: gastosTransferencia,
        total: totalGastos,
        lista: gastos,
      },
      ganancias: {
        trabajadores: gananciasEmpleados,
        totalEmpleados: totalGananciaEmpleados,
        lavadero: gananciaLavadero,
        totalDia,
      },
      ingresosManualLista: ingManuales,
      facturasList: facturas,
    };
  }

  async listarFacturasDia(cajaDiaId: string, tenantId: string): Promise<Factura[]> {
    const cajaDia = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId, tenantId } });
    if (!cajaDia) throw new NotFoundException('Caja no encontrada');

    const offset = this.offsetDesdeZonaHoraria(await this.zonaHorariaTenant(tenantId));

    return this.facturaRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.turno', 't')
      .leftJoinAndSelect('t.cliente', 'c')
      .leftJoinAndSelect('t.vehiculo', 'v')
      .leftJoinAndSelect('t.servicio', 's')
      .leftJoinAndSelect('t.trabajador', 'u')
      .where('f.tenantId = :tenantId', { tenantId })
      .andWhere('f.fechaEmision >= :desde AND f.fechaEmision <= :hasta', {
        desde: new Date(`${cajaDia.fecha}T00:00:00${offset}`),
        hasta: new Date(`${cajaDia.fecha}T23:59:59${offset}`),
      })
      .orderBy('f.fechaEmision', 'ASC')
      .getMany();
  }

  async cerrar(cajaDiaId: string, usuarioId: string, tenantId: string): Promise<CajaDia> {
    const caja = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId, tenantId } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('La caja ya está cerrada');
    }

    caja.estado = EstadoCajaDia.CERRADA;
    caja.usuarioCierreId = usuarioId;
    caja.fechaCierre = new Date();
    return this.cajaDiaRepo.save(caja);
  }

  async reabrir(cajaDiaId: string, tenantId: string): Promise<CajaDia> {
    const caja = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId, tenantId } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === EstadoCajaDia.ABIERTA) {
      throw new BadRequestException('La caja ya está abierta');
    }

    // Solo se puede reabrir la caja del día actual
    const hoy = await this.fechaHoy(tenantId);
    if (caja.fecha !== hoy) {
      throw new BadRequestException('Solo se puede reabrir la caja del día de hoy');
    }

    caja.estado = EstadoCajaDia.ABIERTA;
    caja.usuarioCierreId = null;
    caja.fechaCierre = null;
    return this.cajaDiaRepo.save(caja);
  }

  async registrarGasto(dto: RegistrarGastoDto, usuarioId: string, tenantId: string): Promise<GastoCaja> {
    const cajaAbierta = await this.cajaDiaRepo.findOne({
      where: { fecha: await this.fechaHoy(tenantId), estado: EstadoCajaDia.ABIERTA, tenantId },
    });
    if (!cajaAbierta) throw new BadRequestException('No hay caja abierta para el día de hoy');

    return this.gastoCajaRepo.save(
      this.gastoCajaRepo.create({ ...dto, cajaDiaId: cajaAbierta.id, usuarioId, tenantId }),
    );
  }

  async eliminarGasto(gastoId: string, tenantId: string): Promise<void> {
    const gasto = await this.gastoCajaRepo.findOne({ where: { id: gastoId, tenantId } });
    if (!gasto) throw new NotFoundException('Gasto no encontrado');

    const caja = await this.cajaDiaRepo.findOne({ where: { id: gasto.cajaDiaId, tenantId } });
    if (caja?.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('No se puede modificar una caja cerrada');
    }
    await this.gastoCajaRepo.remove(gasto);
  }

  async registrarIngresoManual(
    dto: RegistrarIngresoManualDto,
    usuarioId: string,
    tenantId: string,
  ): Promise<IngresoManualCaja> {
    const cajaAbierta = await this.cajaDiaRepo.findOne({
      where: { fecha: await this.fechaHoy(tenantId), estado: EstadoCajaDia.ABIERTA, tenantId },
    });
    if (!cajaAbierta) throw new BadRequestException('No hay caja abierta para el día de hoy');

    return this.ingresoManualRepo.save(
      this.ingresoManualRepo.create({ ...dto, cajaDiaId: cajaAbierta.id, usuarioId, tenantId }),
    );
  }

  async eliminarIngresoManual(id: string, tenantId: string): Promise<void> {
    const ing = await this.ingresoManualRepo.findOne({ where: { id, tenantId } });
    if (!ing) throw new NotFoundException('Ingreso manual no encontrado');

    const caja = await this.cajaDiaRepo.findOne({ where: { id: ing.cajaDiaId, tenantId } });
    if (caja?.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('No se puede modificar una caja cerrada');
    }
    await this.ingresoManualRepo.remove(ing);
  }

  async historial(tenantId: string, limit = 30): Promise<CajaDia[]> {
    return this.cajaDiaRepo.find({
      where: { estado: EstadoCajaDia.CERRADA, tenantId },
      order: { fecha: 'DESC' },
      take: limit,
      relations: ['usuarioApertura', 'usuarioCierre'],
    });
  }
}
