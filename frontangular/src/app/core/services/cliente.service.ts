import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Cliente, CrearClientePayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);

  listar(): Promise<Cliente[]> {
    return firstValueFrom(this.http.get<Cliente[]>('/api/clientes'));
  }

  buscarPorId(id: string): Promise<Cliente> {
    return firstValueFrom(this.http.get<Cliente>(`/api/clientes/${id}`));
  }

  crear(payload: CrearClientePayload): Promise<Cliente> {
    return firstValueFrom(this.http.post<Cliente>('/api/clientes', payload));
  }

  actualizar(id: string, payload: Partial<CrearClientePayload>): Promise<Cliente> {
    return firstValueFrom(this.http.patch<Cliente>(`/api/clientes/${id}`, payload));
  }

  eliminar(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/clientes/${id}`));
  }
}
