import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Turno, CrearTurnoPayload, EstadoTurno } from '../../shared/types';

export interface FiltroPeriodo {
  fechaDesde: string;
  fechaHasta: string;
}

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);

  listar(estado?: EstadoTurno, periodo?: FiltroPeriodo): Promise<Turno[]> {
    let params = new HttpParams();
    if (estado) params = params.set('estado', estado);
    if (periodo) {
      params = params.set('fechaDesde', periodo.fechaDesde);
      params = params.set('fechaHasta', periodo.fechaHasta);
    }
    return firstValueFrom(this.http.get<Turno[]>('/api/turnos', { params }));
  }

  buscarPorId(id: string): Promise<Turno> {
    return firstValueFrom(this.http.get<Turno>(`/api/turnos/${id}`));
  }

  listarPorTrabajador(trabajadorId: string, periodo?: FiltroPeriodo): Promise<Turno[]> {
    let params = new HttpParams();
    if (periodo) {
      params = params.set('fechaDesde', periodo.fechaDesde);
      params = params.set('fechaHasta', periodo.fechaHasta);
    }
    return firstValueFrom(
      this.http.get<Turno[]>(`/api/turnos/trabajador/${trabajadorId}`, { params }),
    );
  }

  crear(payload: CrearTurnoPayload): Promise<Turno> {
    return firstValueFrom(this.http.post<Turno>('/api/turnos', payload));
  }

  cambiarEstado(id: string, estado: EstadoTurno): Promise<Turno> {
    return firstValueFrom(
      this.http.patch<Turno>(`/api/turnos/${id}/estado`, { estado }),
    );
  }

  eliminar(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/turnos/${id}`));
  }
}
