import { authService } from '../../services/authService';
import { liquidacionService } from '../../services/liquidacionService';
import { sesionService } from '../../services/sesionService';
import { formatPrecio } from '../../utils/formatters';
import type { Liquidacion } from '../../types';

export function MiPerfilPage(contenedor: HTMLElement): void {
  const usuario = sesionService.obtener();
  if (!usuario) return;

  contenedor.innerHTML = `
    <div style="max-width:640px">
      <div style="margin-bottom:32px;display:flex;align-items:center;gap:16px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--color-primario);display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;color:white;flex-shrink:0">
          ${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}
        </div>
        <div>
          <h1 style="font-size:1.4rem;font-weight:700;margin:0">${usuario.nombre} ${usuario.apellido}</h1>
          <p style="color:var(--color-texto-suave);font-size:0.9rem;margin:0;text-transform:capitalize">${usuario.rol} · ${usuario.comisionPorcentaje}% comisión</p>
          <p style="color:var(--color-texto-suave);font-size:0.85rem;margin:0">${usuario.email}</p>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="card" style="padding:24px;margin-bottom:24px">
        <h2 style="font-size:1rem;font-weight:700;margin:0 0 16px">Cambiar contraseña</h2>
        <div id="msg-password" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:6px;font-size:0.9rem"></div>
        <form id="form-password" style="display:flex;flex-direction:column;gap:12px">
          <div>
            <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px">Contraseña actual</label>
            <input type="password" id="pwd-actual" class="input" placeholder="••••••••" required>
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px">Nueva contraseña</label>
            <input type="password" id="pwd-nueva" class="input" placeholder="Mínimo 8 caracteres" required minlength="8">
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:600;display:block;margin-bottom:4px">Confirmar nueva contraseña</label>
            <input type="password" id="pwd-confirmar" class="input" placeholder="Repetir nueva contraseña" required minlength="8">
          </div>
          <div>
            <button type="submit" id="btn-guardar-pwd" class="btn btn-primario">Cambiar contraseña</button>
          </div>
        </form>
      </div>

      <!-- Historial de liquidaciones -->
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px">Mis liquidaciones</h2>
        <div id="lista-liquidaciones">Cargando...</div>
      </div>
    </div>
  `;

  // Lógica cambiar contraseña
  const form = document.getElementById('form-password') as HTMLFormElement;
  const msgEl = document.getElementById('msg-password') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const actual    = (document.getElementById('pwd-actual') as HTMLInputElement).value;
    const nueva     = (document.getElementById('pwd-nueva') as HTMLInputElement).value;
    const confirmar = (document.getElementById('pwd-confirmar') as HTMLInputElement).value;
    const btn       = document.getElementById('btn-guardar-pwd') as HTMLButtonElement;

    if (nueva !== confirmar) {
      mostrarMsg('Las contraseñas nuevas no coinciden', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Guardando...';
    msgEl.style.display = 'none';

    try {
      await authService.cambiarPassword(actual, nueva);
      mostrarMsg('Contraseña cambiada correctamente', 'ok');
      form.reset();
    } catch {
      mostrarMsg('Contraseña actual incorrecta', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Cambiar contraseña';
    }
  });

  function mostrarMsg(texto: string, tipo: 'ok' | 'error'): void {
    msgEl.textContent = texto;
    msgEl.style.display = 'block';
    msgEl.style.background = tipo === 'ok' ? '#dcfce7' : '#fee2e2';
    msgEl.style.color       = tipo === 'ok' ? '#15803d' : '#dc2626';
    msgEl.style.border      = `1px solid ${tipo === 'ok' ? '#86efac' : '#fca5a5'}`;
  }

  // Liquidaciones
  liquidacionService.mias().then(renderLiquidaciones).catch(() => {
    const el = document.getElementById('lista-liquidaciones') as HTMLDivElement;
    el.innerHTML = '<p style="color:var(--color-texto-suave);font-size:0.9rem">No se pudieron cargar las liquidaciones</p>';
  });
}

function renderLiquidaciones(liquidaciones: Liquidacion[]): void {
  const el = document.getElementById('lista-liquidaciones');
  if (!el) return;

  if (liquidaciones.length === 0) {
    el.innerHTML = '<div class="card"><p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Todavía no tenés liquidaciones registradas</p></div>';
    return;
  }

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      ${liquidaciones.map(l => {
        const pagada   = l.estado === 'pagada';
        const desde    = new Date(l.fechaDesde).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        const hasta    = new Date(l.fechaHasta).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
        const fechaPago = l.fechaPago
          ? new Date(l.fechaPago).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
          : null;
        return `
          <div class="card" style="padding:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
            <div>
              <div style="font-weight:600;font-size:0.95rem">${desde} — ${hasta}</div>
              <div style="font-size:0.8rem;color:var(--color-texto-suave);margin-top:2px">
                ${l.cantidadTurnos} turno${l.cantidadTurnos !== 1 ? 's' : ''} · ${l.comisionPorcentaje}% comisión
                ${pagada && fechaPago ? ` · Pagado el ${fechaPago}` : ''}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:16px">
              <div style="text-align:right">
                <div style="font-size:1.2rem;font-weight:800;color:${pagada ? '#16a34a' : '#d97706'}">${formatPrecio(l.totalPago)}</div>
                <div style="font-size:0.75rem;color:var(--color-texto-suave)">de ${formatPrecio(l.totalServicios)} en servicios</div>
              </div>
              <span style="
                padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;
                background:${pagada ? '#dcfce7' : '#fef3c7'};
                color:${pagada ? '#15803d' : '#92400e'};
              ">${pagada ? '✓ Pagada' : 'Pendiente'}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
