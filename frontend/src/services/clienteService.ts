import { get, post, patch, del } from './api';
import type { Cliente, CrearClientePayload } from '../types';

export const clienteService = {
  listar: (): Promise<Cliente[]> =>
    get<Cliente[]>('/clientes'),

  buscarPorId: (id: string): Promise<Cliente> =>
    get<Cliente>(`/clientes/${id}`),

  crear: (payload: CrearClientePayload): Promise<Cliente> =>
    post<Cliente>('/clientes', payload),

  actualizar: (id: string, payload: Partial<CrearClientePayload>): Promise<Cliente> =>
    patch<Cliente>(`/clientes/${id}`, payload),

  eliminar: (id: string): Promise<void> =>
    del<void>(`/clientes/${id}`),
};
