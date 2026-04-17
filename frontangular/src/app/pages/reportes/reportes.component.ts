import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { formatPrecio } from '../../shared/utils/formatters';
import type { ReporteData } from '../../shared/types';

type TabReporte = 'ingresos' | 'servicios' | 'tendencia' | 'pl';
type Periodo = 'semana' | 'mes' | 'personalizado';

const fmt = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
  private readonly reporteSvc = inject(ReporteService);

  readonly formatPrecio = formatPrecio;

  cargando = false;
  error    = '';
  datos: ReporteData | null = null;

  tab: TabReporte = 'ingresos';
  periodo: Periodo = 'mes';
  desde = '';
  hasta = '';

  async ngOnInit(): Promise<void> {
    this.seleccionarPeriodo('mes');
  }

  seleccionarPeriodo(p: Periodo): void {
    this.periodo = p;
    const hoy = new Date();

    if (p === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      this.desde = fmt(lunes);
      this.hasta = fmt(hoy);
      this.cargar();
    } else if (p === 'mes') {
      this.desde = fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      this.hasta = fmt(hoy);
      this.cargar();
    }
    // 'personalizado' no carga automáticamente — el usuario aplica con el botón
  }

  async cargar(): Promise<void> {
    if (!this.desde || !this.hasta) return;
    this.cargando = true;
    this.error    = '';
    try {
      this.datos = await this.reporteSvc.obtener(this.desde, this.hasta);
    } catch {
      this.error = 'No se pudieron cargar los reportes';
    } finally {
      this.cargando = false;
    }
  }

  get maxIngresoDiario(): number {
    const vals = this.datos?.ingresosDiarios.map(d => d.total) ?? [0];
    return Math.max(...vals, 1);
  }

  alturaBarra(total: number): string {
    return `${Math.round((total / this.maxIngresoDiario) * 100)}%`;
  }

  formatDia(fecha: string): string {
    return new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short',
    });
  }

  signoVariacion(v: number): string {
    return v > 0 ? '+' : '';
  }
}
