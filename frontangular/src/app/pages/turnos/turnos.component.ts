import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RealtimeService } from '../../core/services/realtime.service';
import { TurnoService } from '../../core/services/turno.service';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ServicioService } from '../../core/services/servicio.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { formatFecha, formatPrecio } from '../../shared/utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCreado, mensajeTurnoCompletado } from '../../shared/utils/whatsapp';
import type { Turno, Cliente, Vehiculo, Servicio, Usuario, EstadoTurno } from '../../shared/types';

const TRANSICIONES: Record<EstadoTurno, EstadoTurno[]> = {
  pendiente: ['en_proceso', 'cancelado'],
  en_proceso: ['completado', 'cancelado'],
  completado: [],
  cancelado: [],
};

const ESTADO_LABEL: Record<EstadoTurno, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './turnos.component.html',
})
export class TurnosComponent implements OnInit, OnDestroy {
  private readonly turnoSvc = inject(TurnoService);
  private readonly clienteSvc = inject(ClienteService);
  private readonly vehiculoSvc = inject(VehiculoService);
  private readonly servicioSvc = inject(ServicioService);
  private readonly usuarioSvc = inject(UsuarioService);

  readonly formatFecha = formatFecha;
  readonly formatPrecio = formatPrecio;
  readonly ESTADO_LABEL = ESTADO_LABEL;
  readonly TRANSICIONES = TRANSICIONES;
  readonly ESTADOS: EstadoTurno[] = ['pendiente', 'en_proceso', 'completado', 'cancelado'];

  turnos: Turno[] = [];
  clientes: Cliente[] = [];
  vehiculosCliente: Vehiculo[] = [];
  servicios: Servicio[] = [];
  trabajadores: Usuario[] = [];

  filtroEstado: EstadoTurno | '' = '';
  cargando = true;
  mostrarForm = false;
  errorForm = '';

  private readonly realtime = inject(RealtimeService);
  private sub: Subscription | null = null;
  private clientesMap = new Map<string, Cliente>();
  private vehiculosMap = new Map<string, Vehiculo>();

  form = {
    clienteId: '',
    vehiculoId: '',
    servicioId: '',
    trabajadorId: '',
    fechaHora: '',
    observaciones: '',
  };

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargar(), this.cargarSelects()]);
    this.sub = this.realtime.onTurnoActualizado$.subscribe(() => this.cargar());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async cargar(): Promise<void> {
    this.turnos = await this.turnoSvc.listar(
      this.filtroEstado || undefined,
    );
    this.cargando = false;
  }

  async cargarSelects(): Promise<void> {
    const [clientes, servicios, usuarios] = await Promise.all([
      this.clienteSvc.listar(),
      this.servicioSvc.listar(true),
      this.usuarioSvc.listar(),
    ]);
    this.clientes = clientes;
    clientes.forEach(c => this.clientesMap.set(c.id, c));
    this.servicios = servicios;
    this.trabajadores = usuarios.filter(u => u.rol === 'trabajador' && u.activo && u.disponible);
  }

  async onClienteChange(): Promise<void> {
    this.form.vehiculoId = '';
    this.vehiculosCliente = [];
    if (!this.form.clienteId) return;
    const vs = await this.vehiculoSvc.listarPorCliente(this.form.clienteId);
    vs.forEach(v => this.vehiculosMap.set(v.id, v));
    this.vehiculosCliente = vs;
  }

  abrirForm(): void {
    this.form = { clienteId: '', vehiculoId: '', servicioId: '', trabajadorId: '', fechaHora: '', observaciones: '' };
    this.vehiculosCliente = [];
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void {
    this.mostrarForm = false;
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    const payload = {
      clienteId: this.form.clienteId,
      vehiculoId: this.form.vehiculoId,
      servicioId: this.form.servicioId,
      trabajadorId: this.form.trabajadorId,
      fechaHora: new Date(this.form.fechaHora).toISOString(),
      observaciones: this.form.observaciones || undefined,
    };
    try {
      const turno = await this.turnoSvc.crear(payload);
      this.cerrarForm();
      await this.cargar();
      const cliente = this.clientesMap.get(turno.clienteId);
      const vehiculo = this.vehiculosMap.get(turno.vehiculoId);
      if (cliente?.telefono && vehiculo) {
        mostrarToastWhatsApp(
          cliente.telefono,
          mensajeTurnoCreado({
            nombreCliente: cliente.nombre,
            placa: vehiculo.placa, marca: vehiculo.marca, modelo: vehiculo.modelo,
            fechaHora: turno.fechaHora,
          }),
          '📅 Turno agendado — avisar al cliente',
        );
      }
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al guardar';
    }
  }

  async cambiarEstado(turno: Turno, estado: EstadoTurno): Promise<void> {
    await this.turnoSvc.cambiarEstado(turno.id, estado);
    await this.cargar();
    if (estado === 'completado') {
      const tel = turno.cliente?.telefono ?? '';
      if (tel) {
        mostrarToastWhatsApp(
          tel,
          mensajeTurnoCompletado({
            nombreCliente: turno.cliente?.nombre ?? '',
            placa: turno.vehiculo?.placa ?? '',
            marca: turno.vehiculo?.marca ?? '',
            modelo: turno.vehiculo?.modelo ?? '',
          }),
          '✅ Turno completado — avisar al cliente',
        );
      }
    }
  }

  transiciones(t: Turno): EstadoTurno[] {
    return TRANSICIONES[t.estado];
  }
}
