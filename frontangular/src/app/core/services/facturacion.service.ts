import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Factura, MetodoPago } from '../../shared/types';

export interface CrearFacturaPayload {
  turnoId: string;
  total: number;
  metodoPago: MetodoPago;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private readonly http = inject(HttpClient);

  listar(fechaDesde?: string, fechaHasta?: string): Promise<Factura[]> {
    let params = new HttpParams();
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);
    return firstValueFrom(this.http.get<Factura[]>('/api/facturacion', { params }));
  }

  buscarPorId(id: string): Promise<Factura> {
    return firstValueFrom(this.http.get<Factura>(`/api/facturacion/${id}`));
  }

  buscarPorTurno(turnoId: string): Promise<Factura> {
    return firstValueFrom(this.http.get<Factura>(`/api/facturacion/turno/${turnoId}`));
  }

  crear(payload: CrearFacturaPayload): Promise<Factura> {
    return firstValueFrom(this.http.post<Factura>('/api/facturacion', payload));
  }
}
