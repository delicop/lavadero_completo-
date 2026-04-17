import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ClienteService } from '../../core/services/cliente.service';
import { formatFecha } from '../../shared/utils/formatters';
import type { Vehiculo, Cliente, TipoVehiculo } from '../../shared/types';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './vehiculos.component.html',
})
export class VehiculosComponent implements OnInit {
  private readonly svc = inject(VehiculoService);
  private readonly clienteSvc = inject(ClienteService);
  readonly formatFecha = formatFecha;

  vehiculos: Vehiculo[] = [];
  clientes: Cliente[] = [];
  cargando = true;
  busqueda = '';

  get vehiculosFiltrados(): Vehiculo[] {
    const q = this.busqueda.trim().toUpperCase();
    if (!q) return this.vehiculos;
    return this.vehiculos.filter(v => v.placa.toUpperCase().includes(q));
  }

  mostrarForm = false;
  editandoId: string | null = null;
  errorForm = '';

  form = {
    clienteId: '', placa: '', marca: '', modelo: '',
    color: '', tipo: 'auto' as TipoVehiculo,
  };

  readonly tipoLabel: Record<TipoVehiculo, string> = {
    auto: 'Auto', moto: 'Moto', camioneta: 'Camioneta',
  };

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargar(), this.cargarClientes()]);
  }

  async cargar(): Promise<void> {
    this.vehiculos = await this.svc.listar();
    this.cargando = false;
  }

  async cargarClientes(): Promise<void> {
    this.clientes = await this.clienteSvc.listar();
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form = { clienteId: '', placa: '', marca: '', modelo: '', color: '', tipo: 'auto' };
    this.errorForm = '';
    this.mostrarForm = true;
  }

  abrirEditar(v: Vehiculo): void {
    this.editandoId = v.id;
    this.form = {
      clienteId: v.clienteId, placa: v.placa, marca: v.marca,
      modelo: v.modelo, color: v.color, tipo: v.tipo,
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
    const payload = { ...this.form, placa: this.form.placa.toUpperCase() };
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
    if (!confirm('¿Eliminar este vehículo?')) return;
    await this.svc.eliminar(id);
    await this.cargar();
  }
}
