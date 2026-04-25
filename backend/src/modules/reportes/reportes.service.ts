import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Factura } from '../facturacion/entities/factura.entity';
import { GastoCaja } from '../caja/entities/gasto-caja.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { IngresoManualCaja } from '../caja/entities/ingreso-manual-caja.entity';
import { Turno, EstadoTurno } from '../turnos/entities/turno.entity';
import { Liquidacion, EstadoLiquidacion } from '../liquidaciones/entities/liquidacion.entity';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(GastoCaja)
    private readonly gastoCajaRepo: Repository<GastoCaja>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(IngresoManualCaja)
    private readonly ingresoManualRepo: Repository<IngresoManualCaja>,
    @InjectRepository(Turno)
    private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(Liquidacion)
    private readonly liquidacionRepo: Repository<Liquidacion>,
    private readonly tenantsService: TenantsService,
  ) {}

  async obtenerReporte(tenantId: string, desde?: string, hasta?: string) {
    const tenant = await this.tenantsService.buscarPorId(tenantId);
    const hoy    = this.tenantsService.fechaDesdeZona(tenant.zonaHoraria);
    const offset = this.tenantsService.offsetDesdeZona(tenant.zonaHoraria);
    const inicio = new Date(`${desde ?? hoy}T00:00:00${offset}`);
    const fin    = new Date(`${hasta ?? hoy}T23:59:59${offset}`);

    const [facturas, gastos, ingresosManuales, turnos, liquidaciones, clientesNuevos] = await Promise.all([
      this.facturaRepo.find({
        where: { tenantId, fechaEmision: Between(inicio, fin) },
        relations: ['turno', 'turno.servicio'],
        order: { fechaEmision: 'ASC' },
      }),
      this.gastoCajaRepo.find({
        where: { tenantId, fechaRegistro: Between(inicio, fin) },
      }),
      this.ingresoManualRepo.find({
        where: { tenantId, fechaRegistro: Between(inicio, fin) },
      }),
      this.turnoRepo.find({
        where: { tenantId, estado: EstadoTurno.COMPLETADO, fechaHora: Between(inicio, fin) },
        relations: ['trabajador', 'servicio'],
      }),
      this.liquidacionRepo.find({
        where: { tenantId, estado: EstadoLiquidacion.PAGADA, fechaPago: Between(inicio, fin) },
      }),
      this.clienteRepo.count({
        where: { tenantId, fechaRegistro: Between(inicio, fin) },
      }),
    ]);

    // ── Ingresos ─────────────────────────────────────────────────────────────
    const totalVentas         = facturas.reduce((s, f) => s + Number(f.total), 0);
    const totalIngresosManual = ingresosManuales.reduce((s, i) => s + Number(i.monto), 0);
    const ingresosPeriodo     = totalVentas + totalIngresosManual;

    // ── Gastos ───────────────────────────────────────────────────────────────
    const gastosOperativos = gastos.reduce((s, g) => s + Number(g.monto), 0);

    // ── Comisiones devengadas (ganadas por empleados, pagadas o no) ──────────
    const comisionesDevengadas = turnos.reduce((s, t) => {
      return s + Number(t.servicio.precio) * (Number(t.trabajador.comisionPorcentaje) / 100);
    }, 0);

    // ── Liquidaciones efectivamente pagadas en el período ────────────────────
    const liquidacionesPagadas = liquidaciones.reduce((s, l) => s + Number(l.totalPago), 0);

    const gananciaBruta = ingresosPeriodo - gastosOperativos;
    const gananciaNeta  = gananciaBruta - comisionesDevengadas;

    // ── Ingresos agrupados por día (ventas + manuales) ───────────────────────
    const mapaIngresos = new Map<string, number>();
    for (const f of facturas) {
      const dia = new Date(f.fechaEmision).toLocaleDateString('en-CA', { timeZone: tenant.zonaHoraria });
      mapaIngresos.set(dia, (mapaIngresos.get(dia) ?? 0) + Number(f.total));
    }
    for (const i of ingresosManuales) {
      const dia = new Date(i.fechaRegistro).toLocaleDateString('en-CA', { timeZone: tenant.zonaHoraria });
      mapaIngresos.set(dia, (mapaIngresos.get(dia) ?? 0) + Number(i.monto));
    }
    const ingresosDiarios = [...mapaIngresos.entries()]
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // ── Distribución por servicio ─────────────────────────────────────────────
    const mapaServicios = new Map<string, { nombre: string; cantidad: number; total: number }>();
    for (const f of facturas) {
      const nombre = f.turno?.servicio?.nombre ?? 'Personalizado';
      const prev   = mapaServicios.get(nombre) ?? { nombre, cantidad: 0, total: 0 };
      mapaServicios.set(nombre, { nombre, cantidad: prev.cantidad + 1, total: prev.total + Number(f.total) });
    }
    const rankingServicios = [...mapaServicios.values()].sort((a, b) => b.total - a.total);
    const distribucionServicios = rankingServicios.map(s => ({
      ...s,
      porcentaje: totalVentas > 0 ? Math.round((s.total / totalVentas) * 100) : 0,
    }));

    // ── Tendencia vs período anterior ─────────────────────────────────────────
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;
    const inicioAnterior = new Date(inicio);
    inicioAnterior.setDate(inicioAnterior.getDate() - dias);
    const finAnterior = new Date(inicio);
    finAnterior.setDate(finAnterior.getDate() - 1);
    finAnterior.setHours(23, 59, 59);

    const [facturasAnt, manualesAnt] = await Promise.all([
      this.facturaRepo.find({ where: { tenantId, fechaEmision: Between(inicioAnterior, finAnterior) } }),
      this.ingresoManualRepo.find({ where: { tenantId, fechaRegistro: Between(inicioAnterior, finAnterior) } }),
    ]);
    const ingresosPeriodoAnterior =
      facturasAnt.reduce((s, f) => s + Number(f.total), 0) +
      manualesAnt.reduce((s, i) => s + Number(i.monto), 0);
    const variacion = ingresosPeriodoAnterior > 0
      ? Math.round(((ingresosPeriodo - ingresosPeriodoAnterior) / ingresosPeriodoAnterior) * 1000) / 10
      : ingresosPeriodo > 0 ? 100 : 0;

    return {
      metricas: {
        ingresosPeriodo,
        turnosTotales: facturas.length,
        gananciaNeta,
        clientesNuevos,
      },
      ingresosDiarios,
      distribucionServicios,
      rankingServicios,
      tendencia: {
        periodoActual:   ingresosPeriodo,
        periodoAnterior: ingresosPeriodoAnterior,
        variacion,
      },
      pl: {
        ingresos:              ingresosPeriodo,
        ingresosPorVentas:     totalVentas,
        ingresosManuales:      totalIngresosManual,
        gastosOperativos,
        comisionesDevengadas,
        liquidacionesPagadas,
        gananciaBruta,
        gananciaNeta,
      },
    };
  }
}
