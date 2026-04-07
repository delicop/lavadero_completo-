import { get, post, patch } from './api';
import type { Liquidacion, CrearLiquidacionPayload, Turno } from '../types';

export const liquidacionService = {
  listar: (): Promise<Liquidacion[]> =>
    get<Liquidacion[]>('/liquidaciones'),

  mias: (): Promise<Liquidacion[]> =>
    get<Liquidacion[]>('/liquidaciones/mias'),

  buscarPorId: (id: string): Promise<Liquidacion> =>
    get<Liquidacion>(`/liquidaciones/${id}`),

  turnosDeLiquidacion: (id: string): Promise<Turno[]> =>
    get<Turno[]>(`/liquidaciones/${id}/turnos`),

  crear: (payload: CrearLiquidacionPayload): Promise<Liquidacion> =>
    post<Liquidacion>('/liquidaciones', payload),

  marcarPagada: (id: string): Promise<Liquidacion> =>
    patch<Liquidacion>(`/liquidaciones/${id}/pagar`, {}),
};
