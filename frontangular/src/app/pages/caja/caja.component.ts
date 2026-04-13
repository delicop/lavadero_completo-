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
  | 'cerrar_anterior'   // hay caja sin cerrar del día anterior
  | 'abrir'             // no hay caja de hoy
  | 'abierta'           // caja de hoy abierta
  | 'cerrada_hoy';      // caja de hoy ya cerrada

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
  private resumenVersion = 0; // evita que respuestas lentas sobreescriban datos frescos

  // Datos de estado
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
    console.log('[CAJA] ngOnInit START', Date.now());
    await this.verificarEstado();
    console.log('[CAJA] ngOnInit END', Date.now());
  }

  async verificarEstado(): Promise<void> {
    console.log('[CAJA] verificarEstado START', Date.now());
    this.vista = 'cargando';
    this.error = '';
    try {
      const estado = await this.cajaService.obtenerEstado();
      console.log('[CAJA] obtenerEstado respondió', Date.now(), estado);
      this.cajaHoy = estado.cajaHoy;
      this.cajaSinCerrar = estado.cajaSinCerrar;

      if (estado.cajaSinCerrar) {
        console.log('[CAJA] hay caja sin cerrar — cargando resumen anterior', Date.now());
        this.resumenAnterior = await this.cajaService.obtenerResumen(estado.cajaSinCerrar.id);
        console.log('[CAJA] resumen anterior cargado', Date.now());
        this.vista = 'cerrar_anterior';
      } else if (!estado.cajaHoy) {
        this.vista = 'abrir';
      } else if (estado.cajaHoy.estado === 'abierta') {
        this.vista = 'abierta';
        console.log('[CAJA] vista=abierta, lanzando cargarResumenHoy en background', Date.now());
        void this.cargarResumenHoy();
      } else {
        this.vista = 'cerrada_hoy';
        console.log('[CAJA] vista=cerrada_hoy, lanzando cargarResumenHoy en background', Date.now());
        void this.cargarResumenHoy();
      }
    } catch (e) {
      console.error('[CAJA] ERROR en verificarEstado', Date.now(), e);
      this.error = 'No se pudo cargar el estado de la caja.';
      this.vista = 'abrir';
    }
    this.cdr.detectChanges();
    console.log('[CAJA] verificarEstado END', Date.now());
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
      this.error =
        err instanceof Error ? err.message : 'Error al abrir la caja.';
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
      // Actualizar estado local: sin re-fetch al backend
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
    // Actualizar estado local al instante
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
      void this.cargarResumenHoy(); // revertir si falló
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
      // Actualizar estado local: sin re-fetch al backend
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
    // Actualizar estado local al instante
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
      void this.cargarResumenHoy(); // revertir si falló
    }
  }

  efectivoEnCaja(r: ResumenCaja): number {
    const ingManualEfectivo = r.ingresosManualLista
      .filter(i => i.tipoPago === 'efectivo')
      .reduce((s, i) => s + Number(i.monto), 0);
    return Number(r.ingresos.montoInicial) + Number(r.ingresos.ventasEfectivo) + ingManualEfectivo - Number(r.gastos.efectivo);
  }

  formatFecha(fecha: string): string {
    return new Date(fecha + 'T12:00:00-05:00').toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  verFactura(f: Factura): void  { this.facturaDetalle = f; }
  cerrarFactura(): void         { this.facturaDetalle = null; }
}
