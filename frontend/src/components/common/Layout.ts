import { authService } from '../../services/authService';
import { sesionService } from '../../services/sesionService';
import { router } from '../../utils/router';

type Seccion = 'dashboard' | 'clientes' | 'vehiculos' | 'servicios' | 'turnos' | 'configuracion' | 'liquidaciones' | 'mi-perfil' | 'asistencia';

interface ItemMenu { id: Seccion; label: string; separador?: boolean; soloAdmin?: boolean }

const SECCIONES: ItemMenu[] = [
  { id: 'dashboard',     label: 'Panel' },
  { id: 'mi-perfil',     label: 'Mi perfil' },
  { id: 'clientes',      label: 'Clientes',      separador: true, soloAdmin: true },
  { id: 'vehiculos',     label: 'Vehículos',     soloAdmin: true },
  { id: 'servicios',     label: 'Servicios',     soloAdmin: true },
  { id: 'turnos',        label: 'Turnos',        soloAdmin: true },
  { id: 'liquidaciones', label: 'Liquidaciones', separador: true, soloAdmin: true },
  { id: 'asistencia',    label: 'Asistencia',    soloAdmin: true },
  { id: 'configuracion', label: 'Configuración', soloAdmin: true },
];

export function renderLayout(app: HTMLElement): HTMLElement {
  const usuario = sesionService.obtener();
  const esAdmin = sesionService.esAdmin();

  const seccionesFiltradas = SECCIONES.filter(s => !s.soloAdmin || esAdmin);

  app.innerHTML = `
    <div class="layout">
      <nav class="sidebar">
        <div class="sidebar-titulo">Lavadero</div>
        ${seccionesFiltradas.map(s => `
          ${s.separador ? '<hr style="border:none;border-top:1px solid var(--color-borde);margin:8px 0">' : ''}
          <button class="sidebar-link" id="nav-${s.id}">${s.label}</button>
        `).join('')}
        <div style="margin-top:auto;padding-top:16px;border-top:1px solid var(--color-borde)">
          ${usuario ? `<div style="font-size:0.8rem;color:var(--color-texto-suave);padding:0 8px 8px">
            <strong>${usuario.nombre} ${usuario.apellido}</strong><br>
            <span style="text-transform:capitalize">${usuario.rol}</span>
          </div>` : ''}
          <button class="sidebar-link sidebar-logout" id="btn-logout">Cerrar sesión</button>
        </div>
      </nav>
      <main class="contenido" id="contenido"></main>
    </div>
  `;

  document.getElementById('btn-logout')!.addEventListener('click', () => {
    authService.logout();
  });

  seccionesFiltradas.forEach(s => {
    document.getElementById(`nav-${s.id}`)!.addEventListener('click', () => {
      router.navegar(s.id);
    });
  });

  return document.getElementById('contenido') as HTMLElement;
}

export function marcarNavActivo(ruta: string): void {
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('activo'));
  document.getElementById(`nav-${ruta}`)?.classList.add('activo');
}
