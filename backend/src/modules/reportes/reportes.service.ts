import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Factura } from '../facturacion/entities/factura.entity';
import { GastoCaja } from '../caja/entities/gasto-caja.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(GastoCaja)
    private readonly gastoCajaRepo: Repository<GastoCaja>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async obtenerReporte(tenantId: string, desde: string, hasta: string) {
    const inicio = new Date(`${desde}T00:00:00-05:00`);
    const fin    = new Date(`${hasta}T23:59:59-05:00`);

    const [facturas, gastos, clientesNuevos] = await Promise.all([
      this.facturaRepo.find({
        where: { tenantId, fechaEmision: Between(inicio, fin) },
        relations: ['turno', 'turno.servicio'],
        order: { fechaEmision: 'ASC' },
      }),
      this.gastoCajaRepo.find({
        where: { tenantId, fechaRegistro: Between(inicio, fin) },
      }),
      this.clienteRepo.count({
        where: { tenantId, fechaRegistro: Between(inicio, fin) },
      }),
    ]);

    const ingresosPeriodo = facturas.reduce((s, f) => s + Number(f.total), 0);
    const totalGastos     = gastos.reduce((s, g) => s + Number(g.monto), 0);

    // Ingresos agrupados por día
    const mapaIngresos = new Map<string, number>();
    for (const f of facturas) {
      const dia = new Date(f.fechaEmision)
        .toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      mapaIngresos.set(dia, (mapaIngresos.get(dia) ?? 0) + Number(f.total));
    }
    const ingresosDiarios = [...mapaIngresos.entries()]
      .map(([fecha, total]) => ({ fecha, total }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Distribución por nombre de servicio
    const mapaServicios = new Map<string, { nombre: string; cantidad: number; total: number }>();
    for (const f of facturas) {
      const nombre = f.turno?.servicio?.nombre ?? 'Personalizado';
      const prev   = mapaServicios.get(nombre) ?? { nombre, cantidad: 0, total: 0 };
      mapaServicios.set(nombre, {
        nombre,
        cantidad: prev.cantidad + 1,
        total: prev.total + Number(f.total),
      });
    }
    const rankingServicios = [...mapaServicios.values()].sort((a, b) => b.total - a.total);
    const distribucionServicios = rankingServicios.map(s => ({
      ...s,
      porcentaje: ingresosPeriodo > 0 ? Math.round((s.total / ingresosPeriodo) * 100) : 0,
    }));

    // Tendencia — período anterior de la misma duración
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / 86_400_000) + 1;
    const inicioAnterior = new Date(inicio);
    inicioAnterior.setDate(inicioAnterior.getDate() - dias);
    const finAnterior = new Date(inicio);
    finAnterior.setDate(finAnterior.getDate() - 1);
    finAnterior.setHours(23, 59, 59);

    const facturasAnteriores = await this.facturaRepo.find({
      where: { tenantId, fechaEmision: Between(inicioAnterior, finAnterior) },
    });
    const ingresosPeriodoAnterior = facturasAnteriores.reduce((s, f) => s + Number(f.total), 0);
    const variacion = ingresosPeriodoAnterior > 0
      ? Math.round(((ingresosPeriodo - ingresosPeriodoAnterior) / ingresosPeriodoAnterior) * 1000) / 10
      : ingresosPeriodo > 0 ? 100 : 0;

    return {
      metricas: {
        ingresosPeriodo,
        turnosTotales: facturas.length,
        gananciaNeta: ingresosPeriodo - totalGastos,
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
        ingresos:     ingresosPeriodo,
        gastos:       totalGastos,
        gananciaNeta: ingresosPeriodo - totalGastos,
      },
    };
  }
}
