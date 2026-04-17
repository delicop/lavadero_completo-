import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CajaService } from '../../core/services/caja.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { formatPrecio } from '../../shared/utils/formatters';
import type {
  CajaDia,
  Factura,
  GastoCaja,
  IngresoManualCaja,
  ResumenCaja,
  TipoPagoCaja,
} from '../../shared/types';

type Vista =
  | 'cargando'
  | 'cerrar_anterior'
  | 'abrir'
  | 'abierta'
  | 'cerrada_hoy';

export interface Movimiento {
  id: string;
  tipo: 'venta' | 'gasto' | 'ingreso';
  concepto: string;
  tipoPago: string;
  monto: number;
  signo: 1 | -1;
  fecha: Date;
  _rawGasto?: GastoCaja;
  _rawIngreso?: IngresoManualCaja;
}

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './caja.component.html',
})
export class CajaComponent implements OnInit {
  private readonly cajaService = inject(CajaService);
  private readonly cdr = inject(ChangeDetectorRef);

  vista: Vista = 'cargando';
  error = '';
  guardando = false;
  private resumenVersion = 0;

  cajaHoy: CajaDia | null = null;
  cajaSinCerrar: CajaDia | null = null;
  resumen: ResumenCaja | null = null;
  resumenAnterior: ResumenCaja | null = null;

  // Apertura
  montoInicial = 0;
  observacionesApertura = '';

  // Formulario gasto
  modalGasto = false;
  gastoConcepto = '';
  gastoMonto: number | null = null;
  gastoTipo: TipoPagoCaja = 'efectivo';

  // Formulario ingreso manual
  modalIngreso = false;
  ingresoConcepto = '';
  ingresoMonto: number | null = null;
  ingresoTipo: TipoPagoCaja = 'efectivo';

  // Modal cierre
  modalCierre = false;

  // Modal detalle de factura
  facturaDetalle: Factura | null = null;

  readonly formatPrecio = formatPrecio;

  async ngOnInit(): Promise<void> {
    await this.verificarEstado();
  }

  async verificarEstado(): Promise<void> {
    this.vista = 'cargando';
    this.error = '';
    try {
      const estado = await this.cajaService.obtenerEstado();
      this.cajaHoy = estado.cajaHoy;
      this.cajaSinCerrar = estado.cajaSinCerrar;

      if (estado.cajaSinCerrar) {
        this.resumenAnterior = await this.cajaService.obtenerResumen(estado.cajaSinCerrar.id);
        this.vista = 'cerrar_anterior';
      } else if (!estado.cajaHoy) {
        this.vista = 'abrir';
      } else if (estado.cajaHoy.estado === 'abierta') {
        this.vista = 'abierta';
        void this.cargarResumenHoy();
      } else {
        this.vista = 'cerrada_hoy';
        void this.cargarResumenHoy();
      }
    } catch {
      this.error = 'No se pudo cargar el estado de la caja.';
      this.vista = 'abrir';
    }
    this.cdr.detectChanges();
  }

  private async cargarResumenHoy(): Promise<void> {
    if (!this.cajaHoy) return;
    const version = ++this.resumenVersion;
    try {
      const resumen = await this.cajaService.obtenerResumen(this.cajaHoy.id);
      if (version === this.resumenVersion) {
        this.resumen = resumen;
        this.cdr.detectChanges();
      }
    } catch {
      if (version === this.resumenVersion) this.error = 'No se pudo cargar el resumen. Intente de nuevo.';
    }
  }

  async cerrarAnterior(): Promise<void> {
    if (!this.cajaSinCerrar) return;
    this.guardando = true;
    try {
      await this.cajaService.cerrar(this.cajaSinCerrar.id);
      await this.verificarEstado();
    } catch {
      this.error = 'Error al cerrar la caja anterior.';
    } finally {
      this.guardando = false;
    }
  }

  async abrirCaja(): Promise<void> {
    this.guardando = true;
    this.error = '';
    try {
      this.cajaHoy = await this.cajaService.abrir(
        this.montoInicial,
        this.observacionesApertura || undefined,
      );
      this.montoInicial = 0;
      this.observacionesApertura = '';
      await this.cargarResumenHoy();
      this.vista = 'abierta';
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Error al abrir la caja.';
    } finally {
      this.guardando = false;
    }
  }

  async abrirModalCierre(): Promise<void> {
    await this.cargarResumenHoy();
    this.modalCierre = true;
  }

  async confirmarCierre(): Promise<void> {
    if (!this.cajaHoy) return;
    this.guardando = true;
    try {
      await this.cajaService.cerrar(this.cajaHoy.id);
      this.modalCierre = false;
      await this.verificarEstado();
    } catch {
      this.error = 'Error al cerrar la caja.';
    } finally {
      this.guardando = false;
    }
  }

  // ── Gastos ────────────────────────────────────────────────────────────────

  async guardarGasto(): Promise<void> {
    if (!this.gastoConcepto || !this.gastoMonto) return;
    const concepto = this.gastoConcepto;
    const monto = this.gastoMonto;
    const tipo = this.gastoTipo;
    this.modalGasto = false;
    this.gastoConcepto = '';
    this.gastoMonto = null;
    this.gastoTipo = 'efectivo';
    this.guardando = true;
    try {
      const gasto = await this.cajaService.registrarGasto(concepto, monto, tipo);
      if (this.resumen) {
        const m = Number(gasto.monto);
        this.resumen.gastos.lista = [...this.resumen.gastos.lista, gasto];
        this.resumen.gastos.efectivo += tipo === 'efectivo' ? m : 0;
        this.resumen.gastos.transferencia += tipo === 'transferencia' ? m : 0;
        this.resumen.gastos.total += m;
        this.resumen.ganancias.lavadero -= m;
      }
    } catch {
      this.error = 'Error al registrar el gasto.';
    } finally {
      this.guardando = false;
    }
  }

  async eliminarGasto(gasto: GastoCaja): Promise<void> {
    if (!confirm(`¿Eliminar gasto "${gasto.concepto}"?`)) return;
    if (this.resumen) {
      const m = Number(gasto.monto);
      const ef = gasto.tipoPago === 'efectivo';
      this.resumen.gastos.lista = this.resumen.gastos.lista.filter(g => g.id !== gasto.id);
      this.resumen.gastos.efectivo -= ef ? m : 0;
      this.resumen.gastos.transferencia -= ef ? 0 : m;
      this.resumen.gastos.total -= m;
      this.resumen.ganancias.lavadero += m;
    }
    try {
      await this.cajaService.eliminarGasto(gasto.id);
    } catch {
      this.error = 'Error al eliminar el gasto.';
      void this.cargarResumenHoy();
    }
  }

  // ── Ingresos manuales ─────────────────────────────────────────────────────

  async guardarIngreso(): Promise<void> {
    if (!this.ingresoConcepto || !this.ingresoMonto) return;
    const concepto = this.ingresoConcepto;
    const monto = this.ingresoMonto;
    const tipo = this.ingresoTipo;
    this.modalIngreso = false;
    this.ingresoConcepto = '';
    this.ingresoMonto = null;
    this.ingresoTipo = 'efectivo';
    this.guardando = true;
    try {
      const ing = await this.cajaService.registrarIngresoManual(concepto, monto, tipo);
      if (this.resumen) {
        const m = Number(ing.monto);
        this.resumen.ingresosManualLista = [...this.resumen.ingresosManualLista, ing];
        this.resumen.ingresos.ingresosManual += m;
        this.resumen.ingresos.total += m;
        this.resumen.ganancias.totalDia += m;
        this.resumen.ganancias.lavadero += m;
      }
    } catch {
      this.error = 'Error al registrar el ingreso.';
    } finally {
      this.guardando = false;
    }
  }

  async eliminarIngreso(ing: IngresoManualCaja): Promise<void> {
    if (!confirm(`¿Eliminar ingreso "${ing.concepto}"?`)) return;
    if (this.resumen) {
      const m = Number(ing.monto);
      this.resumen.ingresosManualLista = this.resumen.ingresosManualLista.filter(i => i.id !== ing.id);
      this.resumen.ingresos.ingresosManual -= m;
      this.resumen.ingresos.total -= m;
      this.resumen.ganancias.totalDia -= m;
      this.resumen.ganancias.lavadero -= m;
    }
    try {
      await this.cajaService.eliminarIngresoManual(ing.id);
    } catch {
      this.error = 'Error al eliminar el ingreso.';
      void this.cargarResumenHoy();
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  ingresosResumen(r: ResumenCaja): number {
    return Number(r.ingresos.ventasEfectivo) + Number(r.ingresos.ventasTransferencia) + Number(r.ingresos.ingresosManual);
  }

  egresosResumen(r: ResumenCaja): number {
    return Number(r.gastos.total);
  }

  balanceResumen(r: ResumenCaja): number {
    return this.ingresosResumen(r) - this.egresosResumen(r);
  }

  efectivoEnCaja(r: ResumenCaja): number {
    const ingManualEfectivo = r.ingresosManualLista
      .filter(i => i.tipoPago === 'efectivo')
      .reduce((s, i) => s + Number(i.monto), 0);
    return Number(r.ingresos.montoInicial) + Number(r.ingresos.ventasEfectivo) + ingManualEfectivo - Number(r.gastos.efectivo);
  }

  movimientos(r: ResumenCaja): Movimiento[] {
    const lista: Movimiento[] = [];

    for (const f of r.facturasList ?? []) {
      lista.push({
        id: f.id,
        tipo: 'venta',
        concepto: f.turno?.servicio?.nombre ?? 'Servicio',
        tipoPago: f.metodoPago,
        monto: Number(f.total),
        signo: 1,
        fecha: new Date(f.fechaEmision),
      });
    }

    for (const g of r.gastos.lista) {
      lista.push({
        id: g.id,
        tipo: 'gasto',
        concepto: g.concepto,
        tipoPago: g.tipoPago,
        monto: Number(g.monto),
        signo: -1,
        fecha: new Date(g.fechaRegistro),
        _rawGasto: g,
      });
    }

    for (const i of r.ingresosManualLista) {
      lista.push({
        id: i.id,
        tipo: 'ingreso',
        concepto: i.concepto,
        tipoPago: i.tipoPago,
        monto: Number(i.monto),
        signo: 1,
        fecha: new Date(i.fechaRegistro),
        _rawIngreso: i,
      });
    }

    return lista.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }

  barrasHorarias(r: ResumenCaja): { hora: number; ingresos: number; egresos: number }[] {
    const barras: { hora: number; ingresos: number; egresos: number }[] = Array.from({ length: 24 }, (_, h) => ({
      hora: h, ingresos: 0, egresos: 0,
    }));

    for (const f of r.facturasList ?? []) {
      const h = new Date(f.fechaEmision).getHours();
      barras[h].ingresos += Number(f.total);
    }
    for (const g of r.gastos.lista) {
      const h = new Date(g.fechaRegistro).getHours();
      barras[h].egresos += Number(g.monto);
    }
    for (const i of r.ingresosManualLista) {
      const h = new Date(i.fechaRegistro).getHours();
      barras[h].ingresos += Number(i.monto);
    }

    // Only keep hours that have activity, pad a bit for context
    const activos = barras.filter(b => b.ingresos > 0 || b.egresos > 0);
    if (activos.length === 0) return [];

    const minH = activos[0].hora;
    const maxH = activos[activos.length - 1].hora;
    return barras.slice(Math.max(0, minH - 1), Math.min(23, maxH + 2));
  }

  maxBarra(barras: { ingresos: number; egresos: number }[]): number {
    return Math.max(1, ...barras.map(b => Math.max(b.ingresos, b.egresos)));
  }

  formatHora(h: number): string {
    return h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
  }

  formatFecha(fecha: string): string {
    return new Date(fecha + 'T12:00:00-05:00').toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  verFactura(f: Factura): void  { this.facturaDetalle = f; }
  verFacturaPorId(id: string, lista: Factura[] | undefined): void { this.facturaDetalle = lista?.find(f => f.id === id) ?? null; }
  cerrarFactura(): void         { this.facturaDetalle = null; }
}
