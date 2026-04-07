import { get, post, patch, del } from './api';
import type { Turno, CrearTurnoPayload, EstadoTurno } from '../types';

export interface FiltroPeriodo {
  fechaDesde: string; // YYYY-MM-DD
  fechaHasta: string; // YYYY-MM-DD
}

export const turnoService = {
  listar: (estado?: EstadoTurno, periodo?: FiltroPeriodo): Promise<Turno[]> => {
    const params = new URLSearchParams();
    if (estado) params.set('estado', estado);
    if (periodo) {
      params.set('fechaDesde', periodo.fechaDesde);
      params.set('fechaHasta', periodo.fechaHasta);
    }
    const qs = params.toString();
    return get<Turno[]>(`/turnos${qs ? `?${qs}` : ''}`);
  },

  buscarPorId: (id: string): Promise<Turno> =>
    get<Turno>(`/turnos/${id}`),

  listarPorTrabajador: (trabajadorId: string, periodo?: FiltroPeriodo): Promise<Turno[]> => {
    const params = new URLSearchParams();
    if (periodo) {
      params.set('fechaDesde', periodo.fechaDesde);
      params.set('fechaHasta', periodo.fechaHasta);
    }
    const qs = params.toString();
    return get<Turno[]>(`/turnos/trabajador/${trabajadorId}${qs ? `?${qs}` : ''}`);
  },

  crear: (payload: CrearTurnoPayload): Promise<Turno> =>
    post<Turno>('/turnos', payload),

  cambiarEstado: (id: string, estado: EstadoTurno): Promise<Turno> =>
    patch<Turno>(`/turnos/${id}/estado`, { estado }),

  eliminar: (id: string): Promise<void> =>
    del<void>(`/turnos/${id}`),
};
