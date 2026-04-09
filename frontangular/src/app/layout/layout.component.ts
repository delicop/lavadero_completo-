import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from '../core/services/sesion.service';
import { AuthService } from '../core/services/auth.service';
import { RealtimeService } from '../core/services/realtime.service';
import type { Usuario } from '../shared/types';

interface ItemMenu {
  ruta: string;
  label: string;
  icono: string;
  soloAdmin?: boolean;
}

const MENU_ITEMS: ItemMenu[] = [
  { ruta: '/dashboard',     label: 'Panel',          icono: '⊞' },
  { ruta: '/mi-perfil',     label: 'Mi perfil',       icono: '◯' },
  { ruta: '/turnos',        label: 'Turnos',          icono: '◷', soloAdmin: true },
  { ruta: '/clientes',      label: 'Clientes',        icono: '◻', soloAdmin: true },
  { ruta: '/vehiculos',     label: 'Vehículos',       icono: '◈', soloAdmin: true },
  { ruta: '/servicios',     label: 'Servicios',       icono: '◆', soloAdmin: true },
  { ruta: '/liquidaciones', label: 'Liquidaciones',   icono: '◎', soloAdmin: true },
  { ruta: '/asistencia',    label: 'Asistencia',      icono: '◑', soloAdmin: true },
  { ruta: '/configuracion', label: 'Configuración',   icono: '◐', soloAdmin: true },
];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  private readonly sesion = inject(SesionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly realtime = inject(RealtimeService);

  usuario: Usuario | null = null;
  items: ItemMenu[] = [];

  ngOnInit(): void {
    // La sesión ya fue cargada por el sesionResolver antes de llegar aquí
    this.usuario = this.sesion.obtener();
    const esAdmin = this.sesion.esAdmin();
    this.items = MENU_ITEMS.filter(i => !i.soloAdmin || esAdmin);
    this.realtime.conectar();
  }

  ngOnDestroy(): void {
    this.realtime.desconectar();
  }

  logout(): void {
    this.auth.logout();
  }

  get iniciales(): string {
    if (!this.usuario) return '?';
    return `${this.usuario.nombre.charAt(0)}${this.usuario.apellido.charAt(0)}`.toUpperCase();
  }
}
