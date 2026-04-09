import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Servicio } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);

  listar(soloActivos = true): Promise<Servicio[]> {
    const url = `/api/servicios${soloActivos ? '?soloActivos=true' : ''}`;
    return firstValueFrom(this.http.get<Servicio[]>(url));
  }

  listarTodos(): Promise<Servicio[]> {
    return firstValueFrom(this.http.get<Servicio[]>('/api/servicios'));
  }

  buscarPorId(id: string): Promise<Servicio> {
    return firstValueFrom(this.http.get<Servicio>(`/api/servicios/${id}`));
  }

  crear(payload: Partial<Servicio>): Promise<Servicio> {
    return firstValueFrom(this.http.post<Servicio>('/api/servicios', payload));
  }

  actualizar(id: string, payload: Partial<Servicio>): Promise<Servicio> {
    return firstValueFrom(this.http.patch<Servicio>(`/api/servicios/${id}`, payload));
  }

  eliminar(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/servicios/${id}`));
  }
}
