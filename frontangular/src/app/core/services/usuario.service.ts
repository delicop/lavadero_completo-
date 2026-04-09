import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Usuario } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);

  listar(): Promise<Usuario[]> {
    return firstValueFrom(this.http.get<Usuario[]>('/api/usuarios'));
  }

  crear(payload: Record<string, unknown>): Promise<Usuario> {
    return firstValueFrom(this.http.post<Usuario>('/api/usuarios', payload));
  }

  actualizar(id: string, payload: Record<string, unknown>): Promise<Usuario> {
    return firstValueFrom(this.http.patch<Usuario>(`/api/usuarios/${id}`, payload));
  }
}
