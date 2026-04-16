import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SesionService } from './sesion.service';
import type { AuthResponse, LoginLog, LoginPayload, RegistrarPayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sesion = inject(SesionService);

  async login(payload: LoginPayload): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', payload),
    );
    localStorage.setItem('token', res.accessToken);
  }

  async registrar(payload: RegistrarPayload): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/registrar', payload),
    );
    localStorage.setItem('token', res.accessToken);
  }

  async cambiarPassword(passwordActual: string, passwordNueva: string): Promise<void> {
    await firstValueFrom(
      this.http.patch<void>('/api/auth/cambiar-password', { passwordActual, passwordNueva }),
    );
  }

  async toggleDisponibilidad(disponible: boolean): Promise<void> {
    await firstValueFrom(
      this.http.patch<void>('/api/auth/disponibilidad', { disponible }),
    );
    await this.sesion.cargar();
  }

  historialLogin(limit = 100): Promise<LoginLog[]> {
    return firstValueFrom(
      this.http.get<LoginLog[]>(`/api/auth/historial?limit=${limit}`),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.sesion.limpiar();
    window.location.href = '/login';
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token');
  }

  /** Decodifica el payload del JWT para leer el rol sin llamada HTTP */
  getRolDelToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { rol?: string };
      return payload.rol ?? null;
    } catch {
      return null;
    }
  }
}
