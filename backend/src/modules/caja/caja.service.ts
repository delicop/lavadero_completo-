import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CajaDia, EstadoCajaDia } from './entities/caja-dia.entity';
import { GastoCaja, TipoPagoCaja } from './entities/gasto-caja.entity';
import { IngresoManualCaja } from './entities/ingreso-manual-caja.entity';
import { Factura } from '../facturacion/entities/factura.entity';
import { Turno } from '../turnos/entities/turno.entity';
import { EstadoTurno } from '../turnos/entities/turno.entity';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { RegistrarGastoDto } from './dto/registrar-gasto.dto';
import { RegistrarIngresoManualDto } from './dto/registrar-ingreso-manual.dto';

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
  ) {}

  private fechaHoy(): string {
    // Fecha en hora Colombia (UTC-5) como 'YYYY-MM-DD'
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
  }

  async obtenerEstado(): Promise<{ cajaHoy: CajaDia | null; cajaSinCerrar: CajaDia | null }> {
    const t = Date.now();
    const hoy = this.fechaHoy();
    const [cajaHoy, cajaSinCerrar] = await Promise.all([
      this.cajaDiaRepo.findOne({ where: { fecha: hoy } }),
      this.cajaDiaRepo.findOne({
        where: { estado: EstadoCajaDia.ABIERTA, fecha: Not(hoy) },
        order: { fecha: 'DESC' },
      }),
    ]);
    console.log(`[PERF] obtenerEstado: ${Date.now() - t}ms`);
    return { cajaHoy, cajaSinCerrar };
  }

  async abrir(dto: AbrirCajaDto, usuarioId: string): Promise<CajaDia> {
    const hoy = this.fechaHoy();

    const existente = await this.cajaDiaRepo.findOne({ where: { fecha: hoy } });
    if (existente) throw new ConflictException('Ya existe una caja para el día de hoy');

    const sinCerrar = await this.cajaDiaRepo.findOne({
      where: { estado: EstadoCajaDia.ABIERTA, fecha: Not(hoy) },
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
    });
    return this.cajaDiaRepo.save(caja);
  }

  async calcularResumen(cajaDiaId: string): Promise<ResumenCaja> {
    const tTotal = Date.now();

    const tFindOne = Date.now();
    const cajaDia = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId } });
    console.log(`[PERF] calcularResumen findOne cajaDia: ${Date.now() - tFindOne}ms`);
    if (!cajaDia) throw new NotFoundException('Caja no encontrada');

    const fecha = cajaDia.fecha; // 'YYYY-MM-DD'

    // Ventas por método leídas desde columnas pre-computadas (sin JOIN a facturas)
    const ventasEfectivo = Number(cajaDia.ventasEfectivo);
    const ventasTransferencia = Number(cajaDia.ventasTransferencia);

    // Queries en paralelo con timings individuales para diagnóstico
    const t0 = Date.now();
    const [turnos, gastos, ingManuales, facturas] = await Promise.all([
      (async () => {
        const t = Date.now();
        const r = await this.turnoRepo
          .createQueryBuilder('t')
          .select(['t.id', 't.trabajadorId', 't.servicioId'])
          .addSelect(['u.id', 'u.nombre', 'u.apellido', 'u.comisionPorcentaje'])
          .addSelect(['s.precio'])
          .innerJoin('t.trabajador', 'u')
          .innerJoin('t.servicio', 's')
          .where('t.estado = :estado', { estado: EstadoTurno.COMPLETADO })
          .andWhere(`t.fechaHora >= :fecha::date AND t.fechaHora < (:fecha::date + INTERVAL '1 day')`, { fecha })
          .getMany();
        console.log(`[PERF] turnos:          ${Date.now() - t}ms (${r.length} filas)`);
        return r;
      })(),
      (async () => {
        const t = Date.now();
        const r = await this.gastoCajaRepo.find({ where: { cajaDiaId } });
        console.log(`[PERF] gastos:          ${Date.now() - t}ms (${r.length} filas)`);
        return r;
      })(),
      (async () => {
        const t = Date.now();
        const r = await this.ingresoManualRepo.find({ where: { cajaDiaId } });
        console.log(`[PERF] ingresos manual: ${Date.now() - t}ms (${r.length} filas)`);
        return r;
      })(),
      (async () => {
        const t = Date.now();
        const r = await this.facturaRepo
          .createQueryBuilder('f')
          .leftJoinAndSelect('f.turno', 't')
          .leftJoinAndSelect('t.cliente', 'c')
          .leftJoinAndSelect('t.vehiculo', 'v')
          .leftJoinAndSelect('t.servicio', 's')
          .leftJoinAndSelect('t.trabajador', 'u')
          .where('f.fechaEmision >= :desde AND f.fechaEmision <= :hasta', {
            desde: new Date(`${fecha}T00:00:00-05:00`),
            hasta: new Date(`${fecha}T23:59:59-05:00`),
          })
          .orderBy('f.fechaEmision', 'ASC')
          .getMany();
        console.log(`[PERF] facturas:        ${Date.now() - t}ms (${r.length} filas)`);
        return r;
      })(),
    ]);
    console.log(`[PERF] Promise.all total: ${Date.now() - t0}ms`);

    // Gastos
    const gastosEfectivo = gastos
      .filter(g => g.tipoPago === TipoPagoCaja.EFECTIVO)
      .reduce((s, g) => s + Number(g.monto), 0);
    const gastosTransferencia = gastos
      .filter(g => g.tipoPago === TipoPagoCaja.TRANSFERENCIA)
      .reduce((s, g) => s + Number(g.monto), 0);
    const totalIngresosManual = ingManuales.reduce((s, i) => s + Number(i.monto), 0);

    // Ganancia por trabajador — usa el % de cada uno sobre sus turnos del día
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

    const result: ResumenCaja = {
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
    console.log(`[PERF] calcularResumen TOTAL: ${Date.now() - tTotal}ms`);
    return result;
  }

  async listarFacturasDia(cajaDiaId: string): Promise<Factura[]> {
    const cajaDia = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId } });
    if (!cajaDia) throw new NotFoundException('Caja no encontrada');

    return this.facturaRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.turno', 't')
      .leftJoinAndSelect('t.cliente', 'c')
      .leftJoinAndSelect('t.vehiculo', 'v')
      .leftJoinAndSelect('t.servicio', 's')
      .leftJoinAndSelect('t.trabajador', 'u')
      .where('f.fechaEmision >= :desde AND f.fechaEmision <= :hasta', {
        desde: new Date(`${cajaDia.fecha}T00:00:00-05:00`),
        hasta: new Date(`${cajaDia.fecha}T23:59:59-05:00`),
      })
      .orderBy('f.fechaEmision', 'ASC')
      .getMany();
  }

  async cerrar(cajaDiaId: string, usuarioId: string): Promise<CajaDia> {
    const caja = await this.cajaDiaRepo.findOne({ where: { id: cajaDiaId } });
    if (!caja) throw new NotFoundException('Caja no encontrada');
    if (caja.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('La caja ya está cerrada');
    }

    caja.estado = EstadoCajaDia.CERRADA;
    caja.usuarioCierreId = usuarioId;
    caja.fechaCierre = new Date();
    return this.cajaDiaRepo.save(caja);
  }

  async registrarGasto(dto: RegistrarGastoDto, usuarioId: string): Promise<GastoCaja> {
    const cajaAbierta = await this.cajaDiaRepo.findOne({
      where: { fecha: this.fechaHoy(), estado: EstadoCajaDia.ABIERTA },
    });
    if (!cajaAbierta) throw new BadRequestException('No hay caja abierta para el día de hoy');

    return this.gastoCajaRepo.save(
      this.gastoCajaRepo.create({ ...dto, cajaDiaId: cajaAbierta.id, usuarioId }),
    );
  }

  async eliminarGasto(gastoId: string): Promise<void> {
    const gasto = await this.gastoCajaRepo.findOne({ where: { id: gastoId } });
    if (!gasto) throw new NotFoundException('Gasto no encontrado');

    const caja = await this.cajaDiaRepo.findOne({ where: { id: gasto.cajaDiaId } });
    if (caja?.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('No se puede modificar una caja cerrada');
    }
    await this.gastoCajaRepo.remove(gasto);
  }

  async registrarIngresoManual(
    dto: RegistrarIngresoManualDto,
    usuarioId: string,
  ): Promise<IngresoManualCaja> {
    const cajaAbierta = await this.cajaDiaRepo.findOne({
      where: { fecha: this.fechaHoy(), estado: EstadoCajaDia.ABIERTA },
    });
    if (!cajaAbierta) throw new BadRequestException('No hay caja abierta para el día de hoy');

    return this.ingresoManualRepo.save(
      this.ingresoManualRepo.create({ ...dto, cajaDiaId: cajaAbierta.id, usuarioId }),
    );
  }

  async eliminarIngresoManual(id: string): Promise<void> {
    const ing = await this.ingresoManualRepo.findOne({ where: { id } });
    if (!ing) throw new NotFoundException('Ingreso manual no encontrado');

    const caja = await this.cajaDiaRepo.findOne({ where: { id: ing.cajaDiaId } });
    if (caja?.estado === EstadoCajaDia.CERRADA) {
      throw new BadRequestException('No se puede modificar una caja cerrada');
    }
    await this.ingresoManualRepo.remove(ing);
  }

  async historial(limit = 30): Promise<CajaDia[]> {
    return this.cajaDiaRepo.find({
      where: { estado: EstadoCajaDia.CERRADA },
      order: { fecha: 'DESC' },
      take: limit,
      relations: ['usuarioApertura', 'usuarioCierre'],
    });
  }
}
