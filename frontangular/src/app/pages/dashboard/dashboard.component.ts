import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SesionService } from '../../core/services/sesion.service';
import { TurnoService } from '../../core/services/turno.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ClienteService } from '../../core/services/cliente.service';
import { VehiculoService } from '../../core/services/vehiculo.service';
import { ServicioService } from '../../core/services/servicio.service';
import { CajaService } from '../../core/services/caja.service';
import { FacturacionService } from '../../core/services/facturacion.service';
import { RealtimeService, UsuarioActualizadoEvent } from '../../core/services/realtime.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { formatPrecio } from '../../shared/utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCompletado, mensajeTurnoCreado } from '../../shared/utils/whatsapp';
import type { CajaDia, Turno, Usuario, Factura, MetodoPago, Cliente, Vehiculo, Servicio } from '../../shared/types';

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo: 'Efectivo', transferencia: 'Transferencia',
  debito: 'Débito',    credito: 'Crédito',
};
const METODOS: MetodoPago[] = ['efectivo', 'transferencia', 'debito', 'credito'];

const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' });

function esHoy(fechaIso: string): boolean {
  return fmt.format(new Date(fechaIso)) === fmt.format(new Date());
}

function horaStr(fechaIso: string): string {
  return new Date(fechaIso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent, FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly sesion      = inject(SesionService);
  private readonly turnoSvc    = inject(TurnoService);
  private readonly authSvc     = inject(AuthService);
  private readonly usuarioSvc  = inject(UsuarioService);
  private readonly clienteSvc  = inject(ClienteService);
  private readonly vehiculoSvc = inject(VehiculoService);
  private readonly servicioSvc = inject(ServicioService);
  private readonly cajaService = inject(CajaService);
  private readonly facturaSvc  = inject(FacturacionService);
  private readonly realtime    = inject(RealtimeService);

  readonly formatPrecio = formatPrecio;
  readonly METODO_LABEL = METODO_LABEL;
  readonly METODOS      = METODOS;
  readonly esHoy        = esHoy;
  readonly horaStr      = horaStr;

  esAdmin  = false;
  usuario: Usuario | null = null;
  cargando = true;

  // Admin — operación del día
  enProceso:      Turno[]   = [];
  pendientes:     Turno[]   = [];
  completadosHoy: Turno[]   = [];   // todos los completados de hoy (pagados y sin pagar)
  turnosFacturadosSet = new Set<string>();   // turnoIds que ya tienen factura
  facturasHoy:    Factura[] = [];
  trabajadores:   Usuario[] = [];
  ingresos      = 0;
  ultimoUpdate  = '';

  // Trabajador
  misPendientes:      Turno[] = [];
  misEnProceso:       Turno[] = [];
  misCompletadosHoy:  Turno[] = [];
  gananciaHoy = 0;

  // Caja
  cajaHoy:       CajaDia | null = null;
  cajaSinCerrar: CajaDia | null = null;
  modalAbrirCaja   = false;
  montoInicialCaja = 0;
  guardandoCaja    = false;

  // Modal cobro desde el dashboard
  mostrarModalCobro    = false;
  ordenACobrar: Turno | null = null;
  metodoPago: MetodoPago     = 'efectivo';
  totalFactura   = 0;
  errorCobro     = '';
  guardandoCobro = false;
  facturaGenerada: Factura | null = null;

  // Modal nueva orden
  mostrarFormOrden    = false;
  errorFormOrden      = '';
  guardandoFormOrden  = false;
  clientesOrden:    Cliente[]  = [];
  vehiculosOrden:   Vehiculo[] = [];
  serviciosOrden:   Servicio[] = [];
  private clientesMap  = new Map<string, Cliente>();
  private vehiculosMap = new Map<string, Vehiculo>();
  formOrden = {
    clienteId: '', vehiculoId: '', servicioId: '',
    trabajadorId: '', fechaHora: '', observaciones: '',
  };

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private sub:        Subscription | null = null;
  private subUsuario: Subscription | null = null;

  get hoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  async ngOnInit(): Promise<void> {
    this.usuario = this.sesion.obtener();
    this.esAdmin = this.sesion.esAdmin();
    const tareas: Promise<void>[] = [this.cargar()];
    if (this.esAdmin) {
      tareas.push(this.cargarEstadoCaja());
      tareas.push(this.cargarSelectsOrden());
    }
    await Promise.all(tareas);
    this.intervalo  = setInterval(() => this.cargar(), 60_000);
    this.sub        = this.realtime.onTurnoActualizado$.subscribe(() => this.cargar());
    this.subUsuario = this.realtime.onUsuarioActualizado$.subscribe(
      (evento: UsuarioActualizadoEvent) => {
        if (this.usuario && evento.usuarioId === this.usuario.id) {
          this.usuario = { ...this.usuario, disponible: evento.disponible };
        }
        this.cargar();
      },
    );
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
    this.sub?.unsubscribe();
    this.subUsuario?.unsubscribe();
  }

  async cargar(): Promise<void> {
    this.cargando = false;
    if (this.esAdmin) await this.cargarAdmin();
    else               await this.cargarTrabajador();
  }

  private async cargarAdmin(): Promise<void> {
    const cajaCerrada = this.cajaHoy?.estado === 'cerrada';

    const [ep, pe, co, todasFacturas, usuarios] = await Promise.all([
      this.turnoSvc.listar('en_proceso'),
      this.turnoSvc.listar('pendiente'),
      cajaCerrada ? Promise.resolve([]) : this.turnoSvc.listar('completado'),
      cajaCerrada ? Promise.resolve([]) : this.facturaSvc.listar(),
      this.usuarioSvc.listar(),
    ]);

    this.enProceso           = ep;
    this.pendientes          = pe;
    this.completadosHoy      = cajaCerrada ? [] : co.filter(t => esHoy(t.fechaHora));
    this.turnosFacturadosSet = new Set(todasFacturas.map(f => f.turnoId));

    // Ingresos del día = facturas de los turnos completados HOY (no por fecha de cobro)
    const idsHoy = new Set(this.completadosHoy.map(t => t.id));
    this.facturasHoy = todasFacturas.filter(f => idsHoy.has(f.turnoId));
    this.ingresos    = this.facturasHoy.reduce((s, f) => s + Number(f.total), 0);
    this.trabajadores    = usuarios.filter(u => u.rol === 'trabajador' && u.activo);
    this.ultimoUpdate    = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  private async cargarTrabajador(): Promise<void> {
    if (!this.usuario) return;
    const todos = await this.turnoSvc.listarPorTrabajador(this.usuario.id);
    this.misPendientes     = todos.filter(t => t.estado === 'pendiente');
    this.misEnProceso      = todos.filter(t => t.estado === 'en_proceso');
    this.misCompletadosHoy = todos.filter(t => t.estado === 'completado' && esHoy(t.fechaHora));
    const comision = this.usuario.comisionPorcentaje / 100;
    this.gananciaHoy = this.misCompletadosHoy.reduce(
      (s, t) => s + Number(t.servicio?.precio ?? 0) * comision, 0,
    );
  }

  async iniciarTurno(id: string): Promise<void> {
    await this.turnoSvc.cambiarEstado(id, 'en_proceso');
    await this.cargar();
  }

  async finalizarTurno(turno: Turno): Promise<void> {
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
  }

  // ── Cobro desde el panel ──────────────────────────────────────────

  iniciarCobro(turno: Turno): void {
    this.ordenACobrar    = turno;
    this.metodoPago      = 'efectivo';
    this.totalFactura    = Number(turno.servicio?.precio ?? 0);
    this.errorCobro      = '';
    this.guardandoCobro  = false;
    this.mostrarModalCobro = true;
  }

  cerrarModalCobro(): void {
    this.mostrarModalCobro = false;
    this.ordenACobrar = null;
  }

  async confirmarCobro(): Promise<void> {
    if (!this.ordenACobrar || this.guardandoCobro) return;
    this.errorCobro     = '';
    this.guardandoCobro = true;
    try {
      const factura = await this.facturaSvc.crear({
        turnoId:    this.ordenACobrar.id,
        total:      this.totalFactura,
        metodoPago: this.metodoPago,
      });
      this.facturaGenerada = { ...factura, turno: this.ordenACobrar };
      this.cerrarModalCobro();
      await this.cargar();
    } catch (err: unknown) {
      const e = err as { error?: { message?: string | string[] }; message?: string };
      const raw = e?.error?.message ?? e?.message ?? 'Error al registrar cobro';
      this.errorCobro = Array.isArray(raw) ? raw[0] : String(raw);
    } finally {
      this.guardandoCobro = false;
    }
  }

  cerrarFacturaGenerada(): void { this.facturaGenerada = null; }
  imprimirFactura(): void       { window.print(); }

  totalFacturadoPorTurno(turnoId: string): number {
    return Number(this.facturasHoy.find(f => f.turnoId === turnoId)?.total ?? 0);
  }

  async toggleDisponibilidad(): Promise<void> {
    if (!this.usuario) return;
    await this.authSvc.toggleDisponibilidad(!this.usuario.disponible);
    this.usuario = this.sesion.obtener();
  }

  // ── Nueva orden desde el panel ────────────────────────────────────

  private async cargarSelectsOrden(): Promise<void> {
    const [clientes, servicios] = await Promise.all([
      this.clienteSvc.listar(),
      this.servicioSvc.listar(true),
    ]);
    this.clientesOrden = clientes;
    clientes.forEach(c => this.clientesMap.set(c.id, c));
    this.serviciosOrden = servicios;
  }

  private ahoraLocal(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  abrirFormOrden(): void {
    this.formOrden = {
      clienteId: '', vehiculoId: '', servicioId: '',
      trabajadorId: '', fechaHora: this.ahoraLocal(), observaciones: '',
    };
    this.vehiculosOrden = [];
    this.errorFormOrden = '';
    this.mostrarFormOrden = true;
  }

  cerrarFormOrden(): void {
    this.mostrarFormOrden = false;
  }

  async onClienteOrdenChange(): Promise<void> {
    this.formOrden.vehiculoId = '';
    this.vehiculosOrden = [];
    if (!this.formOrden.clienteId) return;
    const vs = await this.vehiculoSvc.listarPorCliente(this.formOrden.clienteId);
    vs.forEach(v => this.vehiculosMap.set(v.id, v));
    this.vehiculosOrden = vs;
  }

  async guardarOrden(): Promise<void> {
    this.errorFormOrden    = '';
    this.guardandoFormOrden = true;
    try {
      const turno = await this.turnoSvc.crear({
        clienteId:    this.formOrden.clienteId,
        vehiculoId:   this.formOrden.vehiculoId,
        servicioId:   this.formOrden.servicioId,
        trabajadorId: this.formOrden.trabajadorId,
        fechaHora:    new Date(this.formOrden.fechaHora).toISOString(),
        observaciones: this.formOrden.observaciones || undefined,
      });
      this.cerrarFormOrden();
      await this.cargar();
      const cliente  = this.clientesMap.get(turno.clienteId);
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
    } catch (err: unknown) {
      const e = err as { error?: { message?: string | string[] }; message?: string };
      const raw = e?.error?.message ?? e?.message ?? 'Error al guardar la orden';
      this.errorFormOrden = Array.isArray(raw) ? raw[0] : String(raw);
    } finally {
      this.guardandoFormOrden = false;
    }
  }

  // ── Caja ─────────────────────────────────────────────────────────

  async cargarEstadoCaja(): Promise<void> {
    try {
      const estado = await this.cajaService.obtenerEstado();
      this.cajaHoy       = estado.cajaHoy;
      this.cajaSinCerrar = estado.cajaSinCerrar;
    } catch { /* silencioso */ }
  }

  async abrirCaja(): Promise<void> {
    this.guardandoCaja = true;
    try {
      this.cajaHoy       = await this.cajaService.abrir(this.montoInicialCaja);
      this.cajaSinCerrar = null;
      this.modalAbrirCaja    = false;
      this.montoInicialCaja  = 0;
    } finally { this.guardandoCaja = false; }
  }

  async cerrarCaja(): Promise<void> {
    if (!this.cajaHoy) return;
    if (!confirm('¿Confirmar cierre de caja del día?')) return;
    this.guardandoCaja = true;
    try {
      this.cajaHoy = await this.cajaService.cerrar(this.cajaHoy.id);
    } finally { this.guardandoCaja = false; }
  }

  async cerrarCajaAnterior(): Promise<void> {
    if (!this.cajaSinCerrar) return;
    if (!confirm(`¿Cerrar la caja del ${this.cajaSinCerrar.fecha}?`)) return;
    this.guardandoCaja = true;
    try {
      await this.cajaService.cerrar(this.cajaSinCerrar.id);
      this.cajaSinCerrar = null;
    } finally { this.guardandoCaja = false; }
  }
}
