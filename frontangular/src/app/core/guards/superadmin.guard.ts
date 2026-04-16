import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SesionService } from '../services/sesion.service';

export const superadminGuard: CanActivateFn = async () => {
  const sesion = inject(SesionService);
  const router = inject(Router);

  // Si ya hay sesión cargada la usamos, si no la cargamos
  let usuario = sesion.obtener();
  if (!usuario) {
    try {
      usuario = await sesion.cargar();
    } catch {
      void router.navigate(['/login']);
      return false;
    }
  }

  if (usuario.rol === 'superadmin') return true;

  void router.navigate(['/dashboard']);
  return false;
};
