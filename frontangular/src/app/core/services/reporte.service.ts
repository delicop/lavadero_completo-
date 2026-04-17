import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { ReporteData } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);

  obtener(desde: string, hasta: string): Promise<ReporteData> {
    const params = new HttpParams().set('desde', desde).set('hasta', hasta);
    return firstValueFrom(this.http.get<ReporteData>('/api/reportes', { params }));
  }
}
