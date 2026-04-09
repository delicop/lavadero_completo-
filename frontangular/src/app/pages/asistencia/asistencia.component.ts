import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import type { Usuario, LoginLog } from '../../shared/types';

function formatFechaAsistencia(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatFechaCorta(iso: string): string {
  const d = new Date(iso);
  const esHoy = d.toDateString() === new Date().toDateString();
  if (esHoy) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asistencia.component.html',
})
export class AsistenciaComponent implements OnInit {
  private readonly authSvc = inject(AuthService);
  private readonly usuarioSvc = inject(UsuarioService);

  readonly formatFechaAsistencia = formatFechaAsistencia;
  readonly formatFechaCorta = formatFechaCorta;

  trabajadores: Usuario[] = [];
  logs: LoginLog[] = [];
  logsRecientes: LoginLog[] = [];
  cargando = true;

  get disponibles(): Usuario[] { return this.trabajadores.filter(u => u.disponible); }
  get noDisponibles(): Usuario[] { return this.trabajadores.filter(u => !u.disponible); }

  async ngOnInit(): Promise<void> {
    await this.cargar();
  }

  async cargar(): Promise<void> {
    const [usuarios, logs] = await Promise.all([
      this.usuarioSvc.listar(),
      this.authSvc.historialLogin(200),
    ]);
    this.trabajadores = usuarios.filter(u => u.rol === 'trabajador' && u.activo);
    this.logs = logs;
    this.logsRecientes = logs.slice(0, 10);
    this.cargando = false;
  }
}
