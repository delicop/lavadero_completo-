import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { TenantConfig, ActualizarTenantConfigPayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  configActual: TenantConfig | null = null;

  async obtenerConfig(): Promise<TenantConfig> {
    const config = await firstValueFrom(this.http.get<TenantConfig>('/api/tenants/config'));
    this.configActual = config;
    return config;
  }

  async actualizarConfig(payload: ActualizarTenantConfigPayload): Promise<TenantConfig> {
    const config = await firstValueFrom(this.http.patch<TenantConfig>('/api/tenants/config', payload));
    this.configActual = config;
    return config;
  }
}
