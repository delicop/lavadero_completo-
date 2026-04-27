import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SesionService } from './sesion.service';
import { ThemeService } from './theme.service';
import type { AuthResponse, LoginLog, LoginPayload, RegistrarPayload } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly sesion = inject(SesionService);
  private readonly tema   = inject(ThemeService);

  async login(payload: LoginPayload): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/login', payload),
    );
    localStorage.setItem('isLoggedIn', '1');
    localStorage.setItem('rol', res.rol);
    if (res.config) {
      this.tema.aplicar({
        colorPrimario:   res.config.colorPrimario   ?? '#2563eb',
        colorSidebar:    res.config.colorSidebar    ?? '#ffffff',
        colorFondo:      res.config.colorFondo      ?? '#f8fafc',
        colorSuperficie: res.config.colorSuperficie ?? '#ffffff',
      });
    }
  }

  async registrar(payload: RegistrarPayload): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>('/api/auth/registrar', payload),
    );
    localStorage.setItem('isLoggedIn', '1');
    localStorage.setItem('rol', res.rol);
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

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/logout', {}));
    } catch {
      // best effort — si falla igual limpiamos el estado local
    } finally {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('rol');
      this.sesion.limpiar();
      window.location.href = '/login';
    }
  }

  estaAutenticado(): boolean {
    return localStorage.getItem('isLoggedIn') === '1';
  }

  getRolDelToken(): string | null {
    return localStorage.getItem('rol');
  }
}
