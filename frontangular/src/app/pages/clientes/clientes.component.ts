import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { formatFecha } from '../../shared/utils/formatters';
import type { Cliente } from '../../shared/types';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private readonly svc = inject(ClienteService);
  readonly formatFecha = formatFecha;

  clientes: Cliente[] = [];
  cargando = true;
  error = '';

  mostrarForm = false;
  editandoId: string | null = null;
  errorForm = '';

  form = { nombre: '', apellido: '', telefono: '', email: '' };

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    try {
      this.clientes = await this.svc.listar();
    } catch {
      this.error = 'Error al cargar clientes';
    } finally {
      this.cargando = false;
    }
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form = { nombre: '', apellido: '', telefono: '', email: '' };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  abrirEditar(c: Cliente): void {
    this.editandoId = c.id;
    this.form = { nombre: c.nombre, apellido: c.apellido, telefono: c.telefono, email: c.email ?? '' };
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
      apellido: this.form.apellido,
      telefono: this.form.telefono,
      email: this.form.email || undefined,
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

  async eliminar(id: string): Promise<void> {
    if (!confirm('¿Eliminar este cliente?')) return;
    await this.svc.eliminar(id);
    await this.cargar();
  }
}
