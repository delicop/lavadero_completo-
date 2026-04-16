import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SesionService } from '../services/sesion.service';
import { TenantService } from '../services/tenant.service';
import { ThemeService } from '../services/theme.service';
import type { Usuario } from '../../shared/types';

export const sesionResolver: ResolveFn<Usuario> = async () => {
  const sesion  = inject(SesionService);
  const tenant  = inject(TenantService);
  const tema    = inject(ThemeService);

  const actual  = sesion.obtener();
  const usuario = actual ?? await sesion.cargar();

  // Aplica el tema del tenant para todos los usuarios (admin y trabajador).
  // Superadmin no tiene tenantId, así que se salta.
  if (usuario.tenantId) {
    try {
      const config = await tenant.obtenerConfig();
      tema.aplicar({
        colorPrimario:   config.colorPrimario,
        colorSidebar:    config.colorSidebar,
        colorFondo:      config.colorFondo,
        colorSuperficie: config.colorSuperficie,
      });
    } catch {
      // Si falla, la app queda con los colores por defecto
    }
  }

  return usuario;
};
