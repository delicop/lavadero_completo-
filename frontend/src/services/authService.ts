import { get, patch, post } from './api';
import { sesionService } from './sesionService';
import type { AuthResponse, LoginLog, LoginPayload } from '../types';

export const authService = {
  async login(payload: LoginPayload): Promise<void> {
    const res = await post<AuthResponse>('/auth/login', payload);
    localStorage.setItem('token', res.accessToken);
  },

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    await patch<void>('/auth/cambiar-password', { passwordActual, passwordNueva });
  },

  async toggleDisponibilidad(disponible: boolean): Promise<void> {
    await patch<void>('/auth/disponibilidad', { disponible });
    await sesionService.cargar(); // refresca el usuario en memoria
  },

  historialLogin(limit = 100): Promise<LoginLog[]> {
    return get<LoginLog[]>(`/auth/historial?limit=${limit}`);
  },

  logout(): void {
    localStorage.removeItem('token');
    sesionService.limpiar();
    window.location.href = '/';
  },

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  },
};
