import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly http = inject(HttpClient);

  registrarError(mensaje: string, detalle?: string, ruta?: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>('/api/logs/frontend', { mensaje, detalle, ruta }),
    ).catch(() => { /* never throw from error handler */ });
  }
}
