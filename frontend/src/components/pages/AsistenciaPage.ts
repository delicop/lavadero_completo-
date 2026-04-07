import { authService } from '../../services/authService';
import { get } from '../../services/api';
import type { Usuario, LoginLog } from '../../types';

export function AsistenciaPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
      <h1 class="pagina-titulo" style="margin:0">Asistencia</h1>
      <button id="btn-refresh" class="btn btn-secundario btn-sm">↻ Actualizar</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#16a34a;display:inline-block"></span>
          Estado de trabajadores
        </h2>
        <div class="card" id="panel-estado">Cargando...</div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">Últimos inicios de sesión</h2>
        <div class="card" id="panel-historial" style="max-height:320px;overflow:auto">Cargando...</div>
      </div>
    </div>

    <div>
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">Historial completo de sesiones</h2>
      <div class="card" id="panel-historial-completo">Cargando...</div>
    </div>
  `;

  async function cargar(): Promise<void> {
    const [usuarios, logs] = await Promise.all([
      get<Usuario[]>('/usuarios'),
      authService.historialLogin(200),
    ]);

    renderEstado(usuarios);
    renderHistorialReciente(logs.slice(0, 10));
    renderHistorialCompleto(logs);
  }

  document.getElementById('btn-refresh')!.addEventListener('click', cargar);
  cargar();
}

function renderEstado(usuarios: Usuario[]): void {
  const el = document.getElementById('panel-estado')!;
  const trabajadores = usuarios.filter(u => u.rol === 'trabajador' && u.activo);

  if (trabajadores.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">No hay trabajadores registrados</p>';
    return;
  }

  const disponibles   = trabajadores.filter(u => u.disponible);
  const noDisponibles = trabajadores.filter(u => !u.disponible);

  el.innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:16px">
      <div style="flex:1;background:#dcfce7;border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#16a34a">${disponibles.length}</div>
        <div style="font-size:0.75rem;font-weight:600;color:#15803d">Disponibles</div>
      </div>
      <div style="flex:1;background:#fee2e2;border-radius:8px;padding:12px;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#dc2626">${noDisponibles.length}</div>
        <div style="font-size:0.75rem;font-weight:600;color:#b91c1c">No disponibles</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${trabajadores.map(u => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
                    border-radius:8px;background:${u.disponible ? '#f0fdf4' : '#fafafa'};
                    border:1px solid ${u.disponible ? '#86efac' : 'var(--color-borde)'}">
          <span style="width:10px;height:10px;border-radius:50%;flex-shrink:0;
                        background:${u.disponible ? '#16a34a' : '#d1d5db'}"></span>
          <div style="flex:1">
            <strong style="font-size:0.9rem">${u.nombre} ${u.apellido}</strong>
            <span style="font-size:0.75rem;color:var(--color-texto-suave);margin-left:8px">${u.comisionPorcentaje}%</span>
          </div>
          <span style="font-size:0.75rem;font-weight:600;
                        color:${u.disponible ? '#15803d' : '#9ca3af'}">
            ${u.disponible ? '● Disponible' : '○ Ausente'}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHistorialReciente(logs: LoginLog[]): void {
  const el = document.getElementById('panel-historial')!;
  if (logs.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:16px;font-size:0.9rem">Sin registros</p>';
    return;
  }
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px">
      ${logs.map(l => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:var(--color-fondo)">
          <span style="width:8px;height:8px;border-radius:50%;flex-shrink:0;
                        background:${l.rol === 'admin' ? '#7c3aed' : '#2563eb'}"></span>
          <div style="flex:1;min-width:0">
            <div style="font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${l.nombre}</div>
            <div style="font-size:0.75rem;color:var(--color-texto-suave)">${l.rol}</div>
          </div>
          <div style="font-size:0.75rem;color:var(--color-texto-suave);white-space:nowrap">
            ${formatearFechaCorta(l.fechaHora)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderHistorialCompleto(logs: LoginLog[]): void {
  const el = document.getElementById('panel-historial-completo')!;
  if (logs.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Sin registros de sesiones</p>';
    return;
  }
  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Fecha y hora</th></tr>
      </thead>
      <tbody>
        ${logs.map(l => `
          <tr>
            <td><strong>${l.nombre}</strong></td>
            <td style="color:var(--color-texto-suave)">${l.email}</td>
            <td>
              <span style="
                padding:2px 8px;border-radius:20px;font-size:0.75rem;font-weight:700;
                background:${l.rol === 'admin' ? '#ede9fe' : '#dbeafe'};
                color:${l.rol === 'admin' ? '#7c3aed' : '#1d4ed8'}">
                ${l.rol}
              </span>
            </td>
            <td style="white-space:nowrap">${formatearFecha(l.fechaHora)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatearFechaCorta(iso: string): string {
  const d = new Date(iso);
  const hoy = new Date();
  const esHoy = d.toDateString() === hoy.toDateString();
  if (esHoy) return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}
