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
import type { CajaDia, Turno, Usuario, Factura, MetodoPago, Cliente, Vehiculo, Servicio, TipoVehiculo } from '../../shared/types';

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
  turnosSemana: { label: string; count: number }[] = [];

  // Gráfica de ingresos
  periodoGrafico: 'diario' | 'semanal' | 'mensual' = 'semanal';
  ingresosGrafico: { label: string; total: number }[] = [];
  cargandoGrafico = false;

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

  // Búsqueda por placa en nueva orden del panel
  busquedaPlacaOrden     = '';
  buscandoPlacaOrden     = false;
  placaNoEncontradaOrden = false;
  vehiculoEncontradoOrden: Vehiculo | null = null;
  private placaTimerOrden: ReturnType<typeof setTimeout> | null = null;

  // Modal nuevo cliente (desde nueva orden del panel)
  mostrarModalNuevoClienteOrden = false;
  errorNuevoClienteOrden        = '';
  guardandoNuevoClienteOrden    = false;
  agregarVehiculoNuevoOrden     = false;
  formNuevoClienteOrden  = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
  formNuevoVehiculoOrden = { placa: '', tipo: 'auto' as TipoVehiculo, marca: '', modelo: '', color: '' };
  readonly TIPOS_VEHICULO: { valor: TipoVehiculo; label: string }[] = [
    { valor: 'auto',      label: 'Auto' },
    { valor: 'camioneta', label: 'Camioneta / SUV' },
    { valor: 'moto',      label: 'Moto' },
  ];

  // Modal nuevo vehículo (desde nueva orden del panel)
  mostrarModalNuevoVehiculoOrden = false;
  errorNuevoVehiculoOrden        = '';
  guardandoNuevoVehiculoOrden    = false;
  formNuevoVehiculoDirectoOrden  = { placa: '', tipo: 'auto' as TipoVehiculo, marca: '', modelo: '', color: '' };

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private sub:        Subscription | null = null;
  private subUsuario: Subscription | null = null;

  get maxIngresoGrafico(): number {
    return Math.max(...this.ingresosGrafico.map(d => d.total), 1);
  }

  async cambiarPeriodoGrafico(p: 'diario' | 'semanal' | 'mensual'): Promise<void> {
    this.periodoGrafico = p;
    await this.cargarIngresosGrafico();
  }

  async cargarIngresosGrafico(): Promise<void> {
    this.cargandoGrafico = true;
    try {
      const hoy      = new Date();
      const fmtDay   = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      const diaHoy   = fmtDay(hoy);
      const horaCol  = (iso: string) => {
        // UTC-5 fijo (Colombia)
        return Math.floor(((new Date(iso).getTime() / 1000) - 5 * 3600) / 3600) % 24;
      };

      if (this.periodoGrafico === 'diario') {
        const horaActual = horaCol(new Date().toISOString());
        const porHora = new Array(horaActual + 1).fill(0);
        for (const f of this.facturasHoy) {
          const h = horaCol(f.fechaEmision);
          if (h >= 0 && h <= horaActual) porHora[h] += Number(f.total);
        }
        this.ingresosGrafico = porHora.map((total, h) => ({ label: `${h}h`, total }));

      } else if (this.periodoGrafico === 'semanal') {
        const lunes = new Date(hoy);
        lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
        const facturas = await this.facturaSvc.listar(fmtDay(lunes), diaHoy);
        const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const result: { label: string; total: number }[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(lunes);
          d.setDate(lunes.getDate() + i);
          if (d > hoy) break;
          const key   = fmtDay(d);
          const total = facturas
            .filter(f => fmtDay(new Date(f.fechaEmision)) === key)
            .reduce((s, f) => s + Number(f.total), 0);
          result.push({ label: DIAS[i], total });
        }
        this.ingresosGrafico = result;

      } else {
        const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const facturas  = await this.facturaSvc.listar(fmtDay(primerDia), diaHoy);
        const result: { label: string; total: number }[] = [];
        for (let dia = 1; dia <= hoy.getDate(); dia++) {
          const d     = new Date(hoy.getFullYear(), hoy.getMonth(), dia);
          const key   = fmtDay(d);
          const total = facturas
            .filter(f => fmtDay(new Date(f.fechaEmision)) === key)
            .reduce((s, f) => s + Number(f.total), 0);
          result.push({ label: String(dia), total });
        }
        this.ingresosGrafico = result;
      }
    } finally {
      this.cargandoGrafico = false;
    }
  }

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
    if (this.esAdmin) void this.cargarIngresosGrafico();
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

    const hoy   = new Date();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    const fmtDate = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    const periodoSemana = { fechaDesde: fmtDate(lunes), fechaHasta: fmtDate(hoy) };

    const [ep, pe, co, todasFacturas, usuarios, turnosSem] = await Promise.all([
      this.turnoSvc.listar('en_proceso'),
      this.turnoSvc.listar('pendiente'),
      cajaCerrada ? Promise.resolve([]) : this.turnoSvc.listar('completado'),
      cajaCerrada ? Promise.resolve([]) : this.facturaSvc.listar(),
      this.usuarioSvc.listar(),
      this.turnoSvc.listar(undefined, periodoSemana),
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

    // Trabajos de la semana — agrupar por día
    const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    this.turnosSemana = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      if (d > hoy) break;
      const key = fmtDate(d);
      const count = turnosSem.filter(t =>
        new Date(t.fechaHora).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) === key
      ).length;
      this.turnosSemana.push({ label: DIAS[i], count });
    }
  }

  get maxTurnoSemana(): number {
    return Math.max(...this.turnosSemana.map(d => d.count), 1);
  }

  get porCobrarHoy(): number {
    return this.completadosHoy.filter(t => !this.turnosFacturadosSet.has(t.id)).length;
  }

  get ingresosPorMetodo(): { label: string; total: number }[] {
    const mapa = new Map<MetodoPago, number>();
    for (const f of this.facturasHoy) {
      mapa.set(f.metodoPago, (mapa.get(f.metodoPago) ?? 0) + Number(f.total));
    }
    return (Object.keys(METODO_LABEL) as MetodoPago[])
      .filter(m => mapa.has(m))
      .map(m => ({ label: METODO_LABEL[m], total: mapa.get(m)! }));
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
    this.busquedaPlacaOrden = '';
    this.buscandoPlacaOrden = false;
    this.placaNoEncontradaOrden = false;
    this.vehiculoEncontradoOrden = null;
    this.errorFormOrden = '';
    this.mostrarFormOrden = true;
  }

  cerrarFormOrden(): void {
    this.mostrarFormOrden = false;
  }

  onBusquedaPlacaOrdenChange(): void {
    if (this.placaTimerOrden) clearTimeout(this.placaTimerOrden);
    this.vehiculoEncontradoOrden = null;
    this.placaNoEncontradaOrden  = false;
    const placa = this.busquedaPlacaOrden.trim();
    if (placa.length < 3) return;
    this.buscandoPlacaOrden = true;
    this.placaTimerOrden = setTimeout(() => void this.buscarPlacaOrden(placa), 500);
  }

  private async buscarPlacaOrden(placa: string): Promise<void> {
    try {
      const v = await this.vehiculoSvc.buscarPorPlaca(placa);
      if (v && v.cliente) {
        this.vehiculoEncontradoOrden = v;
        this.formOrden.clienteId  = v.clienteId;
        this.formOrden.vehiculoId = v.id;
        this.vehiculosOrden = [v];
        this.clientesMap.set(v.clienteId, v.cliente);
        this.vehiculosMap.set(v.id, v);
        this.placaNoEncontradaOrden = false;
      } else {
        this.vehiculoEncontradoOrden = null;
        this.placaNoEncontradaOrden  = true;
      }
    } catch {
      this.vehiculoEncontradoOrden = null;
      this.placaNoEncontradaOrden  = true;
    } finally {
      this.buscandoPlacaOrden = false;
    }
  }

  limpiarBusquedaPlacaOrden(): void {
    this.busquedaPlacaOrden = '';
    this.vehiculoEncontradoOrden = null;
    this.placaNoEncontradaOrden = false;
    this.buscandoPlacaOrden = false;
    this.formOrden.clienteId = '';
    this.formOrden.vehiculoId = '';
    this.vehiculosOrden = [];
  }

  async onClienteOrdenSelectChange(): Promise<void> {
    if (this.formOrden.clienteId === '__nuevo__') {
      this.formOrden.clienteId = '';
      this.formNuevoClienteOrden  = { nombre: '', apellido: '', telefono: '', email: '', cedula: '' };
      this.formNuevoVehiculoOrden = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };
      this.agregarVehiculoNuevoOrden = false;
      this.errorNuevoClienteOrden = '';
      this.mostrarModalNuevoClienteOrden = true;
      return;
    }
    await this.onClienteOrdenChange();
  }

  async onClienteOrdenChange(): Promise<void> {
    this.formOrden.vehiculoId = '';
    this.vehiculosOrden = [];
    if (!this.formOrden.clienteId) return;
    const vs = await this.vehiculoSvc.listarPorCliente(this.formOrden.clienteId);
    vs.forEach(v => this.vehiculosMap.set(v.id, v));
    this.vehiculosOrden = vs;
  }

  onVehiculoOrdenSelectChange(): void {
    if (this.formOrden.vehiculoId === '__nuevo_vehiculo__') {
      this.formOrden.vehiculoId = '';
      this.formNuevoVehiculoDirectoOrden = { placa: '', tipo: 'auto', marca: '', modelo: '', color: '' };
      this.errorNuevoVehiculoOrden = '';
      this.mostrarModalNuevoVehiculoOrden = true;
    }
  }

  vehiculoDirectoOrdenCompleto(): boolean {
    const v = this.formNuevoVehiculoDirectoOrden;
    return !!(v.placa && v.color);
  }

  async guardarNuevoVehiculoOrden(): Promise<void> {
    if (!this.formOrden.clienteId) return;
    this.errorNuevoVehiculoOrden = '';
    this.guardandoNuevoVehiculoOrden = true;
    try {
      const nuevoVehiculo = await this.vehiculoSvc.crear({
        clienteId: this.formOrden.clienteId,
        placa:  this.formNuevoVehiculoDirectoOrden.placa.toUpperCase(),
        tipo:   this.formNuevoVehiculoDirectoOrden.tipo,
        marca:  this.formNuevoVehiculoDirectoOrden.marca,
        modelo: this.formNuevoVehiculoDirectoOrden.modelo,
        color:  this.formNuevoVehiculoDirectoOrden.color,
      });
      this.vehiculosMap.set(nuevoVehiculo.id, nuevoVehiculo);
      this.vehiculosOrden = [...this.vehiculosOrden, nuevoVehiculo];
      this.formOrden.vehiculoId = nuevoVehiculo.id;
      this.mostrarModalNuevoVehiculoOrden = false;
    } catch (err) {
      this.errorNuevoVehiculoOrden = err instanceof Error ? err.message : 'Error al crear el vehículo';
    } finally {
      this.guardandoNuevoVehiculoOrden = false;
    }
  }

  vehiculoNuevoOrdenCompleto(): boolean {
    const v = this.formNuevoVehiculoOrden;
    return !!(v.placa && v.marca && v.modelo && v.color);
  }

  async guardarNuevoClienteOrden(): Promise<void> {
    this.errorNuevoClienteOrden    = '';
    this.guardandoNuevoClienteOrden = true;
    try {
      const conVehiculo = this.agregarVehiculoNuevoOrden && this.vehiculoNuevoOrdenCompleto();
      const nuevoCliente = await this.clienteSvc.crear({
        nombre:   this.formNuevoClienteOrden.nombre,
        apellido: this.formNuevoClienteOrden.apellido,
        telefono: this.formNuevoClienteOrden.telefono,
        email:    this.formNuevoClienteOrden.email   || undefined,
        cedula:   this.formNuevoClienteOrden.cedula  || undefined,
      });
      if (conVehiculo) {
        await this.vehiculoSvc.crear({
          clienteId: nuevoCliente.id,
          placa:  this.formNuevoVehiculoOrden.placa.toUpperCase(),
          tipo:   this.formNuevoVehiculoOrden.tipo,
          marca:  this.formNuevoVehiculoOrden.marca,
          modelo: this.formNuevoVehiculoOrden.modelo,
          color:  this.formNuevoVehiculoOrden.color,
        });
      }
      // Agregar cliente a la lista sin recargar todo
      this.clientesOrden = [...this.clientesOrden, nuevoCliente];
      this.clientesMap.set(nuevoCliente.id, nuevoCliente);
      this.formOrden.clienteId = nuevoCliente.id;
      // Cargar solo los vehículos del nuevo cliente
      await this.onClienteOrdenChange();
      if (conVehiculo && this.vehiculosOrden.length > 0) {
        this.formOrden.vehiculoId = this.vehiculosOrden[0].id;
      }
      this.mostrarModalNuevoClienteOrden = false;
    } catch (err) {
      this.errorNuevoClienteOrden = err instanceof Error ? err.message : 'Error al crear el cliente';
    } finally {
      this.guardandoNuevoClienteOrden = false;
    }
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
