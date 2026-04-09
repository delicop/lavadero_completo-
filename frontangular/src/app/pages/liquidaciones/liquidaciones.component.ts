import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { LiquidacionService } from '../../core/services/liquidacion.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { formatFecha, formatPrecio } from '../../shared/utils/formatters';
import type { Liquidacion, Turno, Usuario } from '../../shared/types';

@Component({
  selector: 'app-liquidaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './liquidaciones.component.html',
})
export class LiquidacionesComponent implements OnInit {
  private readonly svc = inject(LiquidacionService);
  private readonly usuarioSvc = inject(UsuarioService);
  readonly formatFecha = formatFecha;
  readonly formatPrecio = formatPrecio;

  liquidaciones: Liquidacion[] = [];
  trabajadores: Usuario[] = [];
  cargando = true;

  mostrarForm = false;
  errorForm = '';

  detalle: Liquidacion | null = null;
  detalleTurnos: Turno[] = [];
  cargandoDetalle = false;

  form = { trabajadorId: '', fechaDesde: '', fechaHasta: '' };

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargar(), this.cargarTrabajadores()]);
  }

  async cargar(): Promise<void> {
    this.liquidaciones = await this.svc.listar();
    this.cargando = false;
  }

  async cargarTrabajadores(): Promise<void> {
    const todos = await this.usuarioSvc.listar();
    this.trabajadores = todos.filter(u => u.activo);
  }

  abrirForm(): void {
    this.form = { trabajadorId: '', fechaDesde: '', fechaHasta: '' };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    try {
      await this.svc.crear(this.form);
      this.cerrarForm();
      await this.cargar();
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al generar';
    }
  }

  async verDetalle(liq: Liquidacion): Promise<void> {
    this.detalle = liq;
    this.cargandoDetalle = true;
    this.detalleTurnos = await this.svc.turnosDeLiquidacion(liq.id);
    this.cargandoDetalle = false;
  }

  cerrarDetalle(): void {
    this.detalle = null;
    this.detalleTurnos = [];
  }

  async marcarPagada(id: string): Promise<void> {
    if (!confirm('¿Confirmar pago de esta liquidación?')) return;
    await this.svc.marcarPagada(id);
    await this.cargar();
  }

  comisionTurno(t: Turno, pct: number): number {
    return Number(t.servicio?.precio ?? 0) * (pct / 100);
  }
}
