import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type {
  CajaDia,
  EstadoCaja,
  GastoCaja,
  IngresoManualCaja,
  ResumenCaja,
  TipoPagoCaja,
} from '../../shared/types';

const BASE = 'http://localhost:3000/api/caja';

@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);

  obtenerEstado(): Promise<EstadoCaja> {
    return firstValueFrom(this.http.get<EstadoCaja>(`${BASE}/estado`));
  }

  abrir(montoInicial: number, observaciones?: string): Promise<CajaDia> {
    return firstValueFrom(
      this.http.post<CajaDia>(`${BASE}/abrir`, { montoInicial, observaciones }),
    );
  }

  obtenerResumen(cajaDiaId: string): Promise<ResumenCaja> {
    return firstValueFrom(this.http.get<ResumenCaja>(`${BASE}/resumen/${cajaDiaId}`));
  }

  cerrar(cajaDiaId: string): Promise<CajaDia> {
    return firstValueFrom(this.http.post<CajaDia>(`${BASE}/cerrar/${cajaDiaId}`, {}));
  }

  registrarGasto(concepto: string, monto: number, tipoPago: TipoPagoCaja): Promise<GastoCaja> {
    return firstValueFrom(
      this.http.post<GastoCaja>(`${BASE}/gastos`, { concepto, monto, tipoPago }),
    );
  }

  eliminarGasto(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${BASE}/gastos/${id}`));
  }

  registrarIngresoManual(
    concepto: string,
    monto: number,
    tipoPago: TipoPagoCaja,
  ): Promise<IngresoManualCaja> {
    return firstValueFrom(
      this.http.post<IngresoManualCaja>(`${BASE}/ingresos-manuales`, {
        concepto,
        monto,
        tipoPago,
      }),
    );
  }

  eliminarIngresoManual(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${BASE}/ingresos-manuales/${id}`));
  }

  historial(): Promise<CajaDia[]> {
    return firstValueFrom(this.http.get<CajaDia[]>(`${BASE}/historial`));
  }
}
