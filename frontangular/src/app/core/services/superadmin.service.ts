import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { TenantConStats, MetricasGlobales, TenantConfig, UsuarioConTenant } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class SuperadminService {
  private readonly http = inject(HttpClient);

  // ── Métricas ──────────────────────────────────────────────────────────────────

  obtenerMetricas(): Promise<MetricasGlobales> {
    return firstValueFrom(this.http.get<MetricasGlobales>('/api/superadmin/metricas'));
  }

  // ── Tenants ───────────────────────────────────────────────────────────────────

  listarTenants(): Promise<TenantConStats[]> {
    return firstValueFrom(this.http.get<TenantConStats[]>('/api/superadmin/tenants'));
  }

  toggleActivoTenant(id: string): Promise<TenantConfig> {
    return firstValueFrom(this.http.patch<TenantConfig>(`/api/superadmin/tenants/${id}/toggle-activo`, {}));
  }

  eliminarTenant(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/superadmin/tenants/${id}`));
  }

  // ── Usuarios ──────────────────────────────────────────────────────────────────

  listarUsuarios(tenantId?: string): Promise<UsuarioConTenant[]> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return firstValueFrom(this.http.get<UsuarioConTenant[]>(`/api/superadmin/usuarios${params}`));
  }

  toggleActivoUsuario(id: string): Promise<UsuarioConTenant> {
    return firstValueFrom(this.http.patch<UsuarioConTenant>(`/api/superadmin/usuarios/${id}/toggle-activo`, {}));
  }

  cambiarPassword(id: string, password: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`/api/superadmin/usuarios/${id}/password`, { password }));
  }

  eliminarUsuario(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/superadmin/usuarios/${id}`));
  }
}
