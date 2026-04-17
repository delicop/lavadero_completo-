import { ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { FacturacionService } from '../../core/services/facturacion.service';
import { CajaService } from '../../core/services/caja.service';
import { formatFecha, formatPrecio, fechaLocal } from '../../shared/utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCreado, mensajeTurnoCompletado } from '../../shared/utils/whatsapp';
import type { Turno, Cliente, Vehiculo, Servicio, Usuario, EstadoTurno, MetodoPago, Factura, TipoVehiculo } from '../../shared/types';

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

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  debito: 'Débito',
  credito: 'Crédito',
};

const METODOS: MetodoPago[] = ['efectivo', 'transferencia', 'debito', 'credito'];


@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './turnos.component.html',
})
export class TurnosComponent implements OnInit, OnDestroy {
  private readonly turnoSvc    = inject(TurnoService);
  private readonly clienteSvc  = inject(ClienteService);
  private readonly vehiculoSvc = inject(VehiculoService);
  private readonly servicioSvc = inject(ServicioService);
  private readonly usuarioSvc  = inject(UsuarioService);
  private readonly facturaSvc  = inject(FacturacionService);
  private readonly cajaService = inject(CajaService);
  private readonly realtime    = inject(RealtimeService);
  private readonly cdr         = inject(ChangeDetectorRef);

  cajaAbierta = false;
  private sub: Subscription | null = null;
  private clientesMap  = new Map<string, Cliente>();
  private vehiculosMap = new Map<string, Vehiculo>();

  readonly formatFecha   = formatFecha;
  readonly formatPrecio  = formatPrecio;
  readonly ESTADO_LABEL  = ESTADO_LABEL;
  readonly METODO_LABEL  = METODO_LABEL;
  readonly TRANSICIONES  = TRANSICIONES;
  readonly ESTADOS: EstadoTurno[] = ['pendiente', 'en_proceso', 'completado', 'cancelado'];
  readonly METODOS = METODOS;

  // Datos
  turnos: Turno[] = [];
  clientes: Cliente[] = [];
  vehiculosCliente: Vehiculo[] = [];
  servicios: Servicio[] = [];
  trabajadores: Usuario[] = [];

  // Filtros backend
  filtroDesde: string = fechaLocal();
  filtroHasta: string = fechaLocal();
  filtroEstado: EstadoTurno | '' = '';

  // Filtros locales
  filtroBusqueda    = '';
  filtroTrabajadorId = '';

  cargando      = true;
  mostrarForm   = false;
  errorForm     = '';

  // Modal cobro
  mostrarModalCompletar = false;
  ordenACompletar: Turno | null = null;
  metodoPago: MetodoPago = 'efectivo';
  totalFactura  = 0;
  errorCompletar = '';
  guardandoCompletar = false;

  // Factura generada (mostrar después del cobro)
  facturaGenerada: Factura | null = null;

  // Modal nuevo cliente (desde la orden)
  mostrarModalNuevoCliente = false;
  errorNuevoCliente = '';
  guardandoNuevoCliente = false;
  agregarVehiculoNuevo = false;
  formNuevoCliente = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
  formNuevoVehiculo = { placa: '', tipo: 'auto' as TipoVehiculo, marca: '', modelo: '', color: '' };
  readonly TIPOS_VEHICULO: { valor: TipoVehiculo; label: string }[] = [
    { valor: 'auto',      label: 'Auto' },
    { valor: 'camioneta', label: 'Camioneta / SUV' },
    { valor: 'moto',      label: 'Moto' },
  ];

  // Modal nuevo vehículo (desde la orden)
  mostrarModalNuevoVehiculo = false;
  errorNuevoVehiculo = '';
  guardandoNuevoVehiculo = false;
  formNuevoVehiculoDirecto = { placa: '', tipo: 'auto' as TipoVehiculo, marca: '', modelo: '', color: '' };

  // Set de turnoIds que ya tienen factura (para ocultar botón Cobrar)
  turnosConFactura = new Set<string>();

  form = {
    clienteId: '', vehiculoId: '', servicioId: '',
    trabajadorId: '', fechaHora: '', observaciones: '',
  };

  // Búsqueda por placa en nueva orden
  busquedaPlaca     = '';
  buscandoPlaca     = false;
  placaNoEncontrada = false;
  vehiculoEncontrado: import('../../shared/types').Vehiculo | null = null;
  private placaTimer: ReturnType<typeof setTimeout> | null = null;

  get turnosVisibles(): Turno[] {
    let lista = this.turnos;
    if (this.filtroBusqueda.trim()) {
      const q = this.filtroBusqueda.trim().toLowerCase();
      lista = lista.filter(t =>
        t.cliente?.nombre.toLowerCase().includes(q) ||
        t.cliente?.apellido.toLowerCase().includes(q) ||
        t.vehiculo?.placa.toLowerCase().includes(q),
      );
    }
    if (this.filtroTrabajadorId) {
      lista = lista.filter(t => t.trabajadorId === this.filtroTrabajadorId);
    }
    return lista;
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargar(), this.cargarSelects(), this.verificarCaja()]);
    this.sub = this.realtime.onTurnoActualizado$.subscribe(() => this.cargar());
  }

  private async verificarCaja(): Promise<void> {
    try {
      const estado = await this.cajaService.obtenerEstado();
      this.cajaAbierta = estado.cajaHoy?.estado === 'abierta';
    } catch {
      this.cajaAbierta = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    const [turnos, facturas] = await Promise.all([
      this.turnoSvc.listar(
        this.filtroEstado || undefined,
        { fechaDesde: this.filtroDesde, fechaHasta: this.filtroHasta },
      ),
      this.facturaSvc.listar(),   // sin filtro de fecha: turnoId es lo que importa
    ]);
    this.turnos = turnos;
    this.turnosConFactura = new Set(facturas.map(f => f.turnoId));
    this.cargando = false;
    this.cdr.detectChanges();
  }

  limpiarFiltros(): void {
    this.filtroDesde       = fechaLocal();
    this.filtroHasta       = fechaLocal();
    this.filtroEstado      = '';
    this.filtroBusqueda    = '';
    this.filtroTrabajadorId = '';
    void this.cargar();
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
    this.trabajadores = usuarios.filter(u => u.rol === 'trabajador' && u.activo);
  }

  onBusquedaPlacaChange(): void {
    if (this.placaTimer) clearTimeout(this.placaTimer);
    this.vehiculoEncontrado = null;
    this.placaNoEncontrada  = false;
    const placa = this.busquedaPlaca.trim();
    if (placa.length < 3) return;
    this.buscandoPlaca = true;
    this.placaTimer = setTimeout(() => void this.buscarPlaca(placa), 500);
  }

  private async buscarPlaca(placa: string): Promise<void> {
    try {
      const v = await this.vehiculoSvc.buscarPorPlaca(placa);
      if (v && v.cliente) {
        this.vehiculoEncontrado = v;
        this.form.clienteId  = v.clienteId;
        this.form.vehiculoId = v.id;
        this.vehiculosCliente = [v];
        this.clientesMap.set(v.clienteId, v.cliente);
        this.vehiculosMap.set(v.id, v);
        this.placaNoEncontrada = false;
      } else {
        this.vehiculoEncontrado = null;
        this.placaNoEncontrada  = true;
      }
    } catch {
      this.vehiculoEncontrado = null;
      this.placaNoEncontrada  = true;
    } finally {
      this.buscandoPlaca = false;
    }
  }

  limpiarBusquedaPlaca(): void {
    this.busquedaPlaca = '';
    this.vehiculoEncontrado = null;
    this.placaNoEncontrada = false;
    this.buscandoPlaca = false;
    this.form.clienteId = '';
    this.form.vehiculoId = '';
    this.vehiculosCliente = [];
  }

  async onClienteSelectChange(): Promise<void> {
    if (this.form.clienteId === '__nuevo__') {
      this.form.clienteId = '';
      this.abrirModalNuevoCliente();
      return;
    }
    await this.onClienteChange();
  }

  async onClienteChange(): Promise<void> {
    this.form.vehiculoId = '';
    this.vehiculosCliente = [];
    if (!this.form.clienteId) return;
    const vs = await this.vehiculoSvc.listarPorCliente(this.form.clienteId);
    vs.forEach(v => this.vehiculosMap.set(v.id, v));
    this.vehiculosCliente = vs;
  }

  onVehiculoSelectChange(): void {
    if (this.form.vehiculoId === '__nuevo_vehiculo__') {
      this.form.vehiculoId = '';
      this.abrirModalNuevoVehiculo();
    }
  }

  abrirModalNuevoVehiculo(): void {
    this.formNuevoVehiculoDirecto = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };
    this.errorNuevoVehiculo = '';
    this.mostrarModalNuevoVehiculo = true;
  }

  vehiculoDirectoCompleto(): boolean {
    const v = this.formNuevoVehiculoDirecto;
    return !!(v.placa && v.color);
  }

  async guardarNuevoVehiculo(): Promise<void> {
    if (!this.form.clienteId) return;
    this.errorNuevoVehiculo = '';
    this.guardandoNuevoVehiculo = true;
    try {
      const nuevoVehiculo = await this.vehiculoSvc.crear({
        clienteId: this.form.clienteId,
        placa:  this.formNuevoVehiculoDirecto.placa.toUpperCase(),
        tipo:   this.formNuevoVehiculoDirecto.tipo,
        marca:  this.formNuevoVehiculoDirecto.marca,
        modelo: this.formNuevoVehiculoDirecto.modelo,
        color:  this.formNuevoVehiculoDirecto.color,
      });
      this.vehiculosMap.set(nuevoVehiculo.id, nuevoVehiculo);
      this.vehiculosCliente = [...this.vehiculosCliente, nuevoVehiculo];
      this.form.vehiculoId = nuevoVehiculo.id;
      this.mostrarModalNuevoVehiculo = false;
    } catch (err) {
      this.errorNuevoVehiculo = err instanceof Error ? err.message : 'Error al crear el vehículo';
    } finally {
      this.guardandoNuevoVehiculo = false;
    }
  }

  abrirForm(): void {
    this.form = { clienteId: '', vehiculoId: '', servicioId: '', trabajadorId: '', fechaHora: '', observaciones: '' };
    this.vehiculosCliente = [];
    this.busquedaPlaca = '';
    this.buscandoPlaca = false;
    this.placaNoEncontrada = false;
    this.vehiculoEncontrado = null;
    this.errorForm = '';
    this.mostrarForm = true;
  }

  cerrarForm(): void { this.mostrarForm = false; }

  abrirModalNuevoCliente(): void {
    this.formNuevoCliente = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
    this.formNuevoVehiculo = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };
    this.agregarVehiculoNuevo = false;
    this.errorNuevoCliente = '';
    this.mostrarModalNuevoCliente = true;
  }

  vehiculoNuevoCompleto(): boolean {
    const v = this.formNuevoVehiculo;
    return !!(v.placa && v.marca && v.modelo && v.color);
  }

  async guardarNuevoCliente(): Promise<void> {
    this.errorNuevoCliente = '';
    this.guardandoNuevoCliente = true;
    try {
      const conVehiculo = this.agregarVehiculoNuevo && this.vehiculoNuevoCompleto();
      const nuevoCliente = await this.clienteSvc.crear({
        nombre:   this.formNuevoCliente.nombre,
        apellido: this.formNuevoCliente.apellido,
        telefono: this.formNuevoCliente.telefono,
        email:    this.formNuevoCliente.email  || undefined,
        cedula:   this.formNuevoCliente.cedula || undefined,
      });
      if (conVehiculo) {
        await this.vehiculoSvc.crear({
          clienteId: nuevoCliente.id,
          placa:  this.formNuevoVehiculo.placa.toUpperCase(),
          tipo:   this.formNuevoVehiculo.tipo,
          marca:  this.formNuevoVehiculo.marca,
          modelo: this.formNuevoVehiculo.modelo,
          color:  this.formNuevoVehiculo.color,
        });
      }
      this.clientes = [...this.clientes, nuevoCliente];
      this.clientesMap.set(nuevoCliente.id, nuevoCliente);
      this.form.clienteId = nuevoCliente.id;
      await this.onClienteChange();
      if (conVehiculo && this.vehiculosCliente.length > 0) {
        this.form.vehiculoId = this.vehiculosCliente[0].id;
      }
      this.mostrarModalNuevoCliente = false;
    } catch (err) {
      this.errorNuevoCliente = err instanceof Error ? err.message : 'Error al crear el cliente';
    } finally {
      this.guardandoNuevoCliente = false;
    }
  }

  async guardar(): Promise<void> {
    this.errorForm = '';
    const payload = {
      clienteId:    this.form.clienteId,
      vehiculoId:   this.form.vehiculoId,
      servicioId:   this.form.servicioId,
      trabajadorId: this.form.trabajadorId,
      fechaHora:    new Date(this.form.fechaHora).toISOString(),
      observaciones: this.form.observaciones || undefined,
    };
    try {
      const turno   = await this.turnoSvc.crear(payload);
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
          '📅 Orden agendada — avisar al cliente',
        );
      }
    } catch (err) {
      this.errorForm = err instanceof Error ? err.message : 'Error al guardar';
    }
  }

  // ── Finalizar orden (trabajo listo → avisa al cliente, sin cobro) ──

  async finalizarOrden(turno: Turno): Promise<void> {
    try {
      await this.turnoSvc.cambiarEstado(turno.id, 'completado');
      await this.cargar();
      const tel = turno.cliente?.telefono ?? '';
      if (tel) {
        mostrarToastWhatsApp(
          tel,
          mensajeTurnoCompletado({
            nombreCliente: turno.cliente?.nombre ?? '',
            placa:  turno.vehiculo?.placa  ?? '',
            marca:  turno.vehiculo?.marca  ?? '',
            modelo: turno.vehiculo?.modelo ?? '',
          }),
          '📞 Orden lista — avisar al cliente para que pase a pagar',
        );
      }
    } catch (err) {
      console.error('Error al finalizar orden', err);
    }
  }

  // ── Cobrar orden (cliente llega, registra pago y genera factura) ──

  iniciarCobrar(turno: Turno): void {
    this.ordenACompletar       = turno;
    this.metodoPago            = 'efectivo';
    this.totalFactura          = Number(turno.servicio?.precio ?? 0);
    this.errorCompletar        = '';
    this.guardandoCompletar    = false;
    this.mostrarModalCompletar = true;
  }

  cerrarModalCompletar(): void {
    this.mostrarModalCompletar = false;
    this.ordenACompletar = null;
  }

  async confirmarCobro(): Promise<void> {
    if (!this.ordenACompletar || this.guardandoCompletar) return;
    this.errorCompletar     = '';
    this.guardandoCompletar = true;
    try {
      const factura = await this.facturaSvc.crear({
        turnoId:    this.ordenACompletar.id,
        total:      this.totalFactura,
        metodoPago: this.metodoPago,
      });
      // Enriquecer la factura con los datos del turno para mostrarla
      this.facturaGenerada = {
        ...factura,
        turno: this.ordenACompletar,
      };
      this.cerrarModalCompletar();
      await this.cargar();
    } catch (err: unknown) {
      const e = err as { error?: { message?: string | string[] }; message?: string };
      const raw = e?.error?.message ?? e?.message ?? 'Error al registrar cobro';
      this.errorCompletar = Array.isArray(raw) ? raw[0] : String(raw);
    } finally {
      this.guardandoCompletar = false;
    }
  }

  cerrarFacturaGenerada(): void {
    this.facturaGenerada = null;
  }

  imprimirFactura(): void {
    window.print();
  }

  // ── Cambiar estado (cancelar, en proceso, etc.) ───────────────────

  async cambiarEstado(turno: Turno, estado: EstadoTurno): Promise<void> {
    await this.turnoSvc.cambiarEstado(turno.id, estado);
    await this.cargar();
  }

  transiciones(t: Turno): EstadoTurno[] {
    return TRANSICIONES[t.estado];
  }
}
