import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { TenantConfig, ActualizarTenantConfigPayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);

  obtenerConfig(): Promise<TenantConfig> {
    return firstValueFrom(this.http.get<TenantConfig>('/api/tenants/config'));
  }

  actualizarConfig(payload: ActualizarTenantConfigPayload): Promise<TenantConfig> {
    return firstValueFrom(this.http.patch<TenantConfig>('/api/tenants/config', payload));
  }
}
