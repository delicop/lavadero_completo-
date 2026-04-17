import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { formatFecha } from '../../shared/utils/formatters';
import type { Cliente, TipoVehiculo } from '../../shared/types';

interface FormVehiculo {
  placa: string;
  tipo: TipoVehiculo;
  marca: string;
  modelo: string;
  color: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private readonly svc        = inject(ClienteService);
  private readonly vehiculoSvc = inject(VehiculoService);
  readonly formatFecha = formatFecha;

  readonly TIPOS_VEHICULO: { valor: TipoVehiculo; label: string }[] = [
    { valor: 'auto',      label: 'Auto' },
    { valor: 'camioneta', label: 'Camioneta / SUV' },
    { valor: 'moto',      label: 'Moto' },
  ];

  clientes: Cliente[] = [];
  cargando = true;
  error = '';

  mostrarForm = false;
  editandoId: string | null = null;
  errorForm = '';
  guardando = false;
  agregarVehiculo = false;

  form = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
  formVehiculo: FormVehiculo = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };

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
    this.form = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
    this.formVehiculo = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };
    this.agregarVehiculo = false;
    this.errorForm = '';
    this.mostrarForm = true;
  }

  abrirEditar(c: Cliente): void {
    this.editandoId = c.id;
    this.form = { nombre: c.nombre, apellido: c.apellido, telefono: c.telefono, email: c.email ?? '', cedula: '' };
    this.agregarVehiculo = false;
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
    this.editandoId = null;
  }

  vehiculoCompleto(): boolean {
    const v = this.formVehiculo;
    return !!(v.placa && v.marca && v.modelo && v.color);
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    this.guardando = true;
    const payload = {
      nombre:   this.form.nombre,
      apellido: this.form.apellido,
      telefono: this.form.telefono,
      email:    this.form.email  || undefined,
      cedula:   this.form.cedula || undefined,
    };
    try {
      if (this.editandoId) {
        await this.svc.actualizar(this.editandoId, payload);
      } else {
        const nuevoCliente = await this.svc.crear(payload);
        if (this.agregarVehiculo && this.vehiculoCompleto()) {
          await this.vehiculoSvc.crear({
            clienteId: nuevoCliente.id,
            placa:  this.formVehiculo.placa.toUpperCase(),
            tipo:   this.formVehiculo.tipo,
            marca:  this.formVehiculo.marca,
            modelo: this.formVehiculo.modelo,
            color:  this.formVehiculo.color,
          });
        }
      }
      this.cerrarForm();
      await this.cargar();
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al guardar';
    } finally {
      this.guardando = false;
    }
  }

  async eliminar(id: string): Promise<void> {
    if (!confirm('¿Eliminar este cliente?')) return;
    await this.svc.eliminar(id);
    await this.cargar();
  }
}
