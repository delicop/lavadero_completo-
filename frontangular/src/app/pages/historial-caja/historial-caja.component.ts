import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaService } from '../../core/services/caja.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { formatPrecio } from '../../shared/utils/formatters';
import type { CajaDia, Factura, ResumenCaja } from '../../shared/types';

interface DiaHistorial {
  cajaDia:  CajaDia;
  resumen:  ResumenCaja | null;
  cargando: boolean;
  abierto:  boolean;
}

@Component({
  selector: 'app-historial-caja',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './historial-caja.component.html',
})
export class HistorialCajaComponent implements OnInit {
  private readonly cajaService = inject(CajaService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly formatPrecio = formatPrecio;

  dias:     DiaHistorial[] = [];
  cargando = true;
  error    = '';

  // Modal detalle de factura
  facturaDetalle: Factura | null = null;

  async ngOnInit(): Promise<void> {
    try {
      const cajas = await this.cajaService.historial();
      this.dias = cajas.map((c, i) => ({
        cajaDia:  c,
        resumen:  null,
        cargando: false,
        abierto:  i < 2,       // últimos 2 se abren automáticamente
      }));
      // Cargar resumen de los primeros 2 en paralelo
      await Promise.all(
        this.dias.slice(0, 2).map(d => this.cargarResumen(d)),
      );
    } catch {
      this.error = 'No se pudo cargar el historial de caja.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  async toggle(dia: DiaHistorial): Promise<void> {
    dia.abierto = !dia.abierto;
    if (dia.abierto && !dia.resumen) await this.cargarResumen(dia);
  }

  private async cargarResumen(dia: DiaHistorial): Promise<void> {
    if (dia.resumen || dia.cargando) return;
    dia.cargando = true;
    try {
      dia.resumen = await this.cajaService.obtenerResumen(dia.cajaDia.id);
    } catch {
      /* silencioso — el usuario puede reintentar haciendo toggle */
    } finally {
      dia.cargando = false;
      this.cdr.detectChanges();
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
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  verFactura(f: Factura): void  { this.facturaDetalle = f; }
  cerrarFactura(): void         { this.facturaDetalle = null; }
}
