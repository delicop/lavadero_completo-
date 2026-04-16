import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuperadminService } from '../../core/services/superadmin.service';
import { AuthService } from '../../core/services/auth.service';
import type { TenantConStats, MetricasGlobales, UsuarioConTenant } from '../../shared/types';

type Vista = 'empresas' | 'usuarios';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './superadmin.component.html',
})
export class SuperadminComponent implements OnInit {
  private readonly svc = inject(SuperadminService);
  private readonly auth = inject(AuthService);

  vista: Vista = 'empresas';

  // Datos
  tenants: TenantConStats[] = [];
  usuarios: UsuarioConTenant[] = [];
  metricas: MetricasGlobales | null = null;

  // Estado UI
  cargando = true;
  error = '';
  procesando: string | null = null;

  // Filtro usuarios
  filtroTenantId = '';

  // Confirmación eliminar
  tenantAEliminar: TenantConStats | null = null;
  usuarioAEliminar: UsuarioConTenant | null = null;

  // Modal cambiar contraseña
  usuarioCambioPass: UsuarioConTenant | null = null;
  nuevaPassword = '';
  errorPass = '';
  guardandoPass = false;

  async ngOnInit(): Promise<void> {
    await this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    this.error = '';
    try {
      [this.metricas, this.tenants, this.usuarios] = await Promise.all([
        this.svc.obtenerMetricas(),
        this.svc.listarTenants(),
        this.svc.listarUsuarios(),
      ]);
    } catch {
      this.error = 'Error al cargar los datos';
    } finally {
      this.cargando = false;
    }
  }

  // ── Vista ──────────────────────────────────────────────────────────────────

  cambiarVista(v: Vista): void {
    this.vista = v;
    this.filtroTenantId = '';
  }

  get usuariosFiltrados(): UsuarioConTenant[] {
    if (!this.filtroTenantId) return this.usuarios;
    return this.usuarios.filter(u => u.tenantId === this.filtroTenantId);
  }

  // ── Tenants ────────────────────────────────────────────────────────────────

  async toggleActivoTenant(tenant: TenantConStats): Promise<void> {
    this.procesando = tenant.id;
    try {
      await this.svc.toggleActivoTenant(tenant.id);
      tenant.activo = !tenant.activo;
      if (this.metricas) this.metricas.tenantsActivos += tenant.activo ? 1 : -1;
    } catch {
      this.error = 'Error al cambiar estado del lavadero';
    } finally {
      this.procesando = null;
    }
  }

  async confirmarEliminarTenant(): Promise<void> {
    if (!this.tenantAEliminar) return;
    this.procesando = this.tenantAEliminar.id;
    try {
      await this.svc.eliminarTenant(this.tenantAEliminar.id);
      const eliminado = this.tenantAEliminar;
      this.tenants = this.tenants.filter(t => t.id !== eliminado.id);
      this.usuarios = this.usuarios.filter(u => u.tenantId !== eliminado.id);
      if (this.metricas) {
        this.metricas.totalTenants--;
        if (eliminado.activo) this.metricas.tenantsActivos--;
        this.metricas.totalUsuarios -= eliminado.totalUsuarios;
        this.metricas.usuariosActivos -= eliminado.usuariosActivos;
      }
      this.tenantAEliminar = null;
    } catch {
      this.error = 'Error al eliminar el lavadero';
    } finally {
      this.procesando = null;
    }
  }

  // ── Usuarios ───────────────────────────────────────────────────────────────

  async toggleActivoUsuario(usuario: UsuarioConTenant): Promise<void> {
    this.procesando = usuario.id;
    try {
      await this.svc.toggleActivoUsuario(usuario.id);
      usuario.activo = !usuario.activo;
      if (this.metricas) this.metricas.usuariosActivos += usuario.activo ? 1 : -1;
    } catch {
      this.error = 'Error al cambiar estado del usuario';
    } finally {
      this.procesando = null;
    }
  }

  async confirmarEliminarUsuario(): Promise<void> {
    if (!this.usuarioAEliminar) return;
    this.procesando = this.usuarioAEliminar.id;
    try {
      await this.svc.eliminarUsuario(this.usuarioAEliminar.id);
      const eliminado = this.usuarioAEliminar;
      this.usuarios = this.usuarios.filter(u => u.id !== eliminado.id);
      const tenant = this.tenants.find(t => t.id === eliminado.tenantId);
      if (tenant) {
        tenant.totalUsuarios--;
        if (eliminado.activo) tenant.usuariosActivos--;
      }
      if (this.metricas) {
        this.metricas.totalUsuarios--;
        if (eliminado.activo) this.metricas.usuariosActivos--;
      }
      this.usuarioAEliminar = null;
    } catch {
      this.error = 'Error al eliminar el usuario';
    } finally {
      this.procesando = null;
    }
  }

  abrirCambioPassword(usuario: UsuarioConTenant): void {
    this.usuarioCambioPass = usuario;
    this.nuevaPassword = '';
    this.errorPass = '';
  }

  async guardarPassword(): Promise<void> {
    if (!this.usuarioCambioPass) return;
    if (this.nuevaPassword.length < 6) {
      this.errorPass = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    this.guardandoPass = true;
    this.errorPass = '';
    try {
      await this.svc.cambiarPassword(this.usuarioCambioPass.id, this.nuevaPassword);
      this.usuarioCambioPass = null;
      this.nuevaPassword = '';
    } catch {
      this.errorPass = 'Error al cambiar la contraseña';
    } finally {
      this.guardandoPass = false;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  logout(): void {
    this.auth.logout();
  }
}
