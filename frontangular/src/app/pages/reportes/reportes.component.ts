import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../core/services/reporte.service';
import { TenantService } from '../../core/services/tenant.service';
import { formatPrecio } from '../../shared/utils/formatters';
import type { ReporteData } from '../../shared/types';

type TabReporte = 'ingresos' | 'servicios' | 'tendencia' | 'pl';
type Periodo = 'semana' | 'mes' | 'personalizado';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
  private readonly reporteSvc = inject(ReporteService);
  private readonly tenantSvc  = inject(TenantService);

  readonly formatPrecio = formatPrecio;

  cargando = false;
  error    = '';
  datos: ReporteData | null = null;

  tab: TabReporte = 'ingresos';
  periodo: Periodo = 'mes';
  desde = '';
  hasta = '';

  private get zona(): string {
    return this.tenantSvc.configActual?.zonaHoraria ?? 'America/Bogota';
  }

  private fmt(d: Date): string {
    return d.toLocaleDateString('en-CA', { timeZone: this.zona });
  }

  async ngOnInit(): Promise<void> {
    this.seleccionarPeriodo('mes');
  }

  seleccionarPeriodo(p: Periodo): void {
    this.periodo = p;
    const hoy = new Date();

    if (p === 'semana') {
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
      this.desde = this.fmt(lunes);
      this.hasta = this.fmt(hoy);
      this.cargar();
    } else if (p === 'mes') {
      this.desde = this.fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      this.hasta = this.fmt(hoy);
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

  get comisionesPendientes(): number {
    if (!this.datos) return 0;
    return this.datos.pl.comisionesDevengadas - this.datos.pl.liquidacionesPagadas;
  }
}
