import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import type { Usuario } from '../../shared/types';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly http = inject(HttpClient);
  private readonly usuario$ = new BehaviorSubject<Usuario | null>(null);

  async cargar(): Promise<Usuario> {
    const usuario = await firstValueFrom(
      this.http.get<Usuario>('/api/auth/me'),
    );
    this.usuario$.next(usuario);
    return usuario;
  }

  obtener(): Usuario | null {
    return this.usuario$.value;
  }

  obtenerStream() {
    return this.usuario$.asObservable();
  }

  esAdmin(): boolean {
    return this.usuario$.value?.rol === 'admin';
  }

  limpiar(): void {
    this.usuario$.next(null);
  }
}
