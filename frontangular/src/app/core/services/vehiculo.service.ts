import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Vehiculo, CrearVehiculoPayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class VehiculoService {
  private readonly http = inject(HttpClient);

  listar(): Promise<Vehiculo[]> {
    return firstValueFrom(this.http.get<Vehiculo[]>('/api/vehiculos'));
  }

  listarPorCliente(clienteId: string): Promise<Vehiculo[]> {
    return firstValueFrom(this.http.get<Vehiculo[]>(`/api/vehiculos/cliente/${clienteId}`));
  }

  buscarPorId(id: string): Promise<Vehiculo> {
    return firstValueFrom(this.http.get<Vehiculo>(`/api/vehiculos/${id}`));
  }

  crear(payload: CrearVehiculoPayload): Promise<Vehiculo> {
    return firstValueFrom(this.http.post<Vehiculo>('/api/vehiculos', payload));
  }

  actualizar(id: string, payload: Partial<CrearVehiculoPayload>): Promise<Vehiculo> {
    return firstValueFrom(this.http.patch<Vehiculo>(`/api/vehiculos/${id}`, payload));
  }

  eliminar(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/vehiculos/${id}`));
  }
}
