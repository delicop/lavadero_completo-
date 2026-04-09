import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SesionService } from '../services/sesion.service';
import type { Usuario } from '../../shared/types';

export const sesionResolver: ResolveFn<Usuario> = () => {
  const sesion = inject(SesionService);
  const actual = sesion.obtener();
  if (actual) return actual;
  return sesion.cargar();
};
