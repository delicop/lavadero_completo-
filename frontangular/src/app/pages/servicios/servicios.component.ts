import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ServicioService } from '../../core/services/servicio.service';
import { formatPrecio } from '../../shared/utils/formatters';
import type { Servicio } from '../../shared/types';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent implements OnInit {
  private readonly svc = inject(ServicioService);
  readonly formatPrecio = formatPrecio;

  servicios: Servicio[] = [];
  cargando = true;
  mostrarForm = false;
  editandoId: string | null = null;
  errorForm = '';

  form = { nombre: '', descripcion: '', duracionMinutos: 30, precio: 0 };

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    this.servicios = await this.svc.listarTodos();
    this.cargando = false;
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form = { nombre: '', descripcion: '', duracionMinutos: 30, precio: 0 };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  abrirEditar(s: Servicio): void {
    this.editandoId = s.id;
    this.form = {
      nombre: s.nombre,
      descripcion: s.descripcion ?? '',
      duracionMinutos: s.duracionMinutos,
      precio: s.precio,
    };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.editandoId = null;
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    const payload = {
      nombre: this.form.nombre,
      descripcion: this.form.descripcion || null,
      duracionMinutos: this.form.duracionMinutos,
      precio: this.form.precio,
    };
    try {
      if (this.editandoId) {
        await this.svc.actualizar(this.editandoId, payload);
      } else {
        await this.svc.crear(payload);
      }
      this.cerrarForm();
      await this.cargar();
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al guardar';
    }
  }

  async toggleActivo(s: Servicio): Promise<void> {
    await this.svc.actualizar(s.id, { activo: !s.activo });
    await this.cargar();
  }

  async eliminar(id: string): Promise<void> {
    if (!confirm('¿Eliminar este servicio?')) return;
    await this.svc.eliminar(id);
    await this.cargar();
  }
}
