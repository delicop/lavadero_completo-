import { get, post, patch, del } from './api';
import type { Vehiculo, CrearVehiculoPayload } from '../types';

export const vehiculoService = {
  listar: (): Promise<Vehiculo[]> =>
    get<Vehiculo[]>('/vehiculos'),

  listarPorCliente: (clienteId: string): Promise<Vehiculo[]> =>
    get<Vehiculo[]>(`/vehiculos/cliente/${clienteId}`),

  buscarPorId: (id: string): Promise<Vehiculo> =>
    get<Vehiculo>(`/vehiculos/${id}`),

  crear: (payload: CrearVehiculoPayload): Promise<Vehiculo> =>
    post<Vehiculo>('/vehiculos', payload),

  actualizar: (id: string, payload: Partial<CrearVehiculoPayload>): Promise<Vehiculo> =>
    patch<Vehiculo>(`/vehiculos/${id}`, payload),

  eliminar: (id: string): Promise<void> =>
    del<void>(`/vehiculos/${id}`),
};
