import { get } from './api';
import type { Usuario } from '../types';

let usuarioActual: Usuario | null = null;

export const sesionService = {
  async cargar(): Promise<Usuario> {
    usuarioActual = await get<Usuario>('/auth/me');
    return usuarioActual;
  },

  obtener(): Usuario | null {
    return usuarioActual;
  },

  esAdmin(): boolean {
    return usuarioActual?.rol === 'admin';
  },

  limpiar(): void {
    usuarioActual = null;
  },
};
