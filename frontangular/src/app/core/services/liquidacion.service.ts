import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Liquidacion, CrearLiquidacionPayload, Turno } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class LiquidacionService {
  private readonly http = inject(HttpClient);

  listar(): Promise<Liquidacion[]> {
    return firstValueFrom(this.http.get<Liquidacion[]>('/api/liquidaciones'));
  }

  mias(): Promise<Liquidacion[]> {
    return firstValueFrom(this.http.get<Liquidacion[]>('/api/liquidaciones/mias'));
  }

  buscarPorId(id: string): Promise<Liquidacion> {
    return firstValueFrom(this.http.get<Liquidacion>(`/api/liquidaciones/${id}`));
  }

  turnosDeLiquidacion(id: string): Promise<Turno[]> {
    return firstValueFrom(this.http.get<Turno[]>(`/api/liquidaciones/${id}/turnos`));
  }

  crear(payload: CrearLiquidacionPayload): Promise<Liquidacion> {
    return firstValueFrom(this.http.post<Liquidacion>('/api/liquidaciones', payload));
  }

  marcarPagada(id: string): Promise<Liquidacion> {
    return firstValueFrom(
      this.http.patch<Liquidacion>(`/api/liquidaciones/${id}/pagar`, {}),
    );
  }
}
