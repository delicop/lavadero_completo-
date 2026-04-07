import { get } from './api';
import type { Servicio } from '../types';

export const servicioService = {
  listar: (soloActivos = true): Promise<Servicio[]> =>
    get<Servicio[]>(`/servicios${soloActivos ? '?soloActivos=true' : ''}`),

  buscarPorId: (id: string): Promise<Servicio> =>
    get<Servicio>(`/servicios/${id}`),
};
