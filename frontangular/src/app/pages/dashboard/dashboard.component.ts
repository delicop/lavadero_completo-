import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SesionService } from '../../core/services/sesion.service';
import { TurnoService } from '../../core/services/turno.service';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { CajaService } from '../../core/services/caja.service';
import { RealtimeService, UsuarioActualizadoEvent } from '../../core/services/realtime.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { formatPrecio } from '../../shared/utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCompletado } from '../../shared/utils/whatsapp';
import type { CajaDia, Turno, Usuario } from '../../shared/types';

function esHoy(fechaIso: string): boolean {
  const hoy = new Date();
  const f = new Date(fechaIso);
  return f.getFullYear() === hoy.getFullYear()
    && f.getMonth() === hoy.getMonth()
    && f.getDate() === hoy.getDate();
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
  private readonly sesion = inject(SesionService);
  private readonly turnoSvc = inject(TurnoService);
  private readonly authSvc = inject(AuthService);
  private readonly usuarioSvc = inject(UsuarioService);

  readonly formatPrecio = formatPrecio;
  readonly esHoy = esHoy;
  readonly horaStr = horaStr;

  esAdmin = false;
  usuario: Usuario | null = null;
  cargando = true;

  // Admin state
  enProceso: Turno[] = [];
  pendientes: Turno[] = [];
  completadosHoy: Turno[] = [];
  trabajadores: Usuario[] = [];
  ingresos = 0;
  ultimoUpdate = '';

  // Trabajador state
  misPendientes: Turno[] = [];
  misEnProceso: Turno[] = [];
  misCompletadosHoy: Turno[] = [];
  gananciaHoy = 0;

  private readonly cajaService = inject(CajaService);
  private readonly realtime = inject(RealtimeService);
  // Caja
  cajaHoy: CajaDia | null = null;
  cajaSinCerrar: CajaDia | null = null;
  modalAbrirCaja = false;
  montoInicialCaja = 0;
  guardandoCaja = false;

  private intervalo: ReturnType<typeof setInterval> | null = null;
  private sub: Subscription | null = null;
  private subUsuario: Subscription | null = null;

  get hoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  async ngOnInit(): Promise<void> {
    this.usuario = this.sesion.obtener();
    this.esAdmin = this.sesion.esAdmin();
    await Promise.all([this.cargar(), this.esAdmin ? this.cargarEstadoCaja() : Promise.resolve()]);

    // Auto-refresh cada 60s como respaldo
    this.intervalo = setInterval(() => this.cargar(), 60_000);

    // Tiempo real: actualiza inmediatamente cuando cambia un turno
    this.sub = this.realtime.onTurnoActualizado$.subscribe(() => this.cargar());

    // Tiempo real: actualiza cuando cambia disponibilidad de un trabajador
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
    if (this.esAdmin) {
      await this.cargarAdmin();
    } else {
      await this.cargarTrabajador();
    }
  }

  private async cargarAdmin(): Promise<void> {
    const cajaCerrada = this.cajaHoy?.estado === 'cerrada';

    const [ep, pe, co, usuarios] = await Promise.all([
      this.turnoSvc.listar('en_proceso'),
      this.turnoSvc.listar('pendiente'),
      cajaCerrada ? Promise.resolve([]) : this.turnoSvc.listar('completado'), // no consultar si el día cerró
      this.usuarioSvc.listar(),
    ]);
    this.enProceso = ep;
    this.pendientes = pe;
    this.completadosHoy = cajaCerrada ? [] : co.filter(t => esHoy(t.fechaHora));
    this.ingresos = cajaCerrada ? 0 : this.completadosHoy.reduce((s, t) => s + Number(t.servicio?.precio ?? 0), 0);
    this.trabajadores = usuarios.filter(u => u.rol === 'trabajador' && u.activo);
    this.ultimoUpdate = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  private async cargarTrabajador(): Promise<void> {
    if (!this.usuario) return;
    const todos = await this.turnoSvc.listarPorTrabajador(this.usuario.id);
    this.misPendientes = todos.filter(t => t.estado === 'pendiente');
    this.misEnProceso = todos.filter(t => t.estado === 'en_proceso');
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

  async completarTurno(turno: Turno): Promise<void> {
    await this.turnoSvc.cambiarEstado(turno.id, 'completado');
    await this.cargar();
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

  async toggleDisponibilidad(): Promise<void> {
    if (!this.usuario) return;
    await this.authSvc.toggleDisponibilidad(!this.usuario.disponible);
    this.usuario = this.sesion.obtener();
  }

  // ── Caja ────────────────────────────────────────────────────────────────────

  async cargarEstadoCaja(): Promise<void> {
    try {
      const estado = await this.cajaService.obtenerEstado();
      this.cajaHoy = estado.cajaHoy;
      this.cajaSinCerrar = estado.cajaSinCerrar;
    } catch { /* silencioso */ }
  }

  async abrirCaja(): Promise<void> {
    this.guardandoCaja = true;
    try {
      this.cajaHoy = await this.cajaService.abrir(this.montoInicialCaja);
      this.cajaSinCerrar = null;
      this.modalAbrirCaja = false;
      this.montoInicialCaja = 0;
    } finally {
      this.guardandoCaja = false;
    }
  }

  async cerrarCaja(): Promise<void> {
    if (!this.cajaHoy) return;
    if (!confirm('¿Confirmar cierre de caja del día?')) return;
    this.guardandoCaja = true;
    try {
      this.cajaHoy = await this.cajaService.cerrar(this.cajaHoy.id);
    } finally {
      this.guardandoCaja = false;
    }
  }

  async cerrarCajaAnterior(): Promise<void> {
    if (!this.cajaSinCerrar) return;
    if (!confirm(`¿Cerrar la caja del ${this.cajaSinCerrar.fecha}?`)) return;
    this.guardandoCaja = true;
    try {
      await this.cajaService.cerrar(this.cajaSinCerrar.id);
      this.cajaSinCerrar = null;
    } finally {
      this.guardandoCaja = false;
    }
  }
}
