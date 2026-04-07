/**
 * Componente reutilizable: selector de período + tabla de ganancias.
 * Usado en MiPerfilPage (ganancias propias) y DashboardPage admin (por trabajador).
 */
import { turnoService, FiltroPeriodo } from '../../services/turnoService';
import { formatPrecio } from '../../utils/formatters';
import type { Turno } from '../../types';

type Periodo = 'hoy' | '8' | '15' | 'mes';

const OPCIONES: { key: Periodo; label: string; dias: number }[] = [
  { key: 'hoy', label: 'Hoy',    dias: 1  },
  { key: '8',   label: '8 días', dias: 8  },
  { key: '15',  label: '15 días',dias: 15 },
  { key: 'mes', label: 'Mes',    dias: 30 },
];

function calcularPeriodo(dias: number): FiltroPeriodo {
  const hoy   = new Date();
  const desde = new Date();
  desde.setDate(hoy.getDate() - dias + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { fechaDesde: fmt(desde), fechaHasta: fmt(hoy) };
}

function selectorHTML(idSufijo: string, periodoActivo: Periodo): string {
  return `
    <div id="selector-${idSufijo}" style="display:flex;gap:6px;flex-wrap:wrap">
      ${OPCIONES.map(o => `
        <button
          class="btn btn-sm ${o.key === periodoActivo ? 'btn-primario' : 'btn-secundario'} btn-periodo"
          data-periodo="${o.key}">
          ${o.label}
        </button>
      `).join('')}
    </div>
  `;
}

// ── Vista trabajador: sus propias ganancias ────────────────────────────────────

export function renderGananciasTrabajador(
  contenedor: HTMLElement,
  trabajadorId: string,
  comisionPct: number,
): void {
  let periodoActivo: Periodo = 'hoy';

  contenedor.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px">
      <h2 style="font-size:1rem;font-weight:700;margin:0">Mis ganancias</h2>
      ${selectorHTML('trab', periodoActivo)}
    </div>
    <div id="resultado-trab">Cargando...</div>
  `;

  async function cargar(): Promise<void> {
    const op     = OPCIONES.find(o => o.key === periodoActivo)!;
    const periodo = calcularPeriodo(op.dias);
    const turnos  = await turnoService.listarPorTrabajador(trabajadorId, periodo);
    const completados = turnos.filter(t => t.estado === 'completado');
    renderResultadoTrabajador(completados, comisionPct, op.label);
    actualizarBotones('selector-trab', periodoActivo);
  }

  contenedor.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-periodo');
    if (!btn) return;
    periodoActivo = btn.dataset['periodo'] as Periodo;
    cargar();
  });

  cargar();
}

function renderResultadoTrabajador(turnos: Turno[], comisionPct: number, labelPeriodo: string): void {
  const el = document.getElementById('resultado-trab');
  if (!el) return;

  const totalServicios = turnos.reduce((s, t) => s + Number(t.servicio?.precio ?? 0), 0);
  const ganancia       = totalServicios * (comisionPct / 100);

  if (turnos.length === 0) {
    el.innerHTML = `<p style="color:var(--color-texto-suave);font-size:0.9rem;padding:12px 0">Sin turnos completados en ${labelPeriodo.toLowerCase()}.</p>`;
    return;
  }

  el.innerHTML = `
    <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
      <div class="card" style="padding:14px 20px;flex:1;min-width:140px">
        <div style="font-size:0.75rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">Turnos completados</div>
        <div style="font-size:1.8rem;font-weight:800;color:var(--color-primario)">${turnos.length}</div>
      </div>
      <div class="card" style="padding:14px 20px;flex:1;min-width:140px">
        <div style="font-size:0.75rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">Total servicios</div>
        <div style="font-size:1.5rem;font-weight:800;color:var(--color-texto)">${formatPrecio(totalServicios)}</div>
      </div>
      <div class="card" style="padding:14px 20px;flex:1;min-width:140px;border:2px solid #16a34a">
        <div style="font-size:0.75rem;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.05em">Tu ganancia (${comisionPct}%)</div>
        <div style="font-size:1.8rem;font-weight:800;color:#16a34a">${formatPrecio(ganancia)}</div>
      </div>
    </div>
    <div class="card" style="overflow:auto">
      <table class="tabla">
        <thead>
          <tr><th>Fecha</th><th>Vehículo</th><th>Servicio</th><th>Precio</th><th>Tu ganancia</th></tr>
        </thead>
        <tbody>
          ${turnos.map(t => {
            const precio   = Number(t.servicio?.precio ?? 0);
            const ganTurno = precio * (comisionPct / 100);
            return `
              <tr>
                <td style="white-space:nowrap">${new Date(t.fechaHora).toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</td>
                <td><strong>${t.vehiculo?.placa ?? '—'}</strong><br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo}` : ''}</small></td>
                <td>${t.servicio?.nombre ?? '—'}</td>
                <td>${formatPrecio(precio)}</td>
                <td><strong style="color:#16a34a">${formatPrecio(ganTurno)}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Vista admin: ganancias por trabajador ──────────────────────────────────────

export function renderGananciasPorTrabajador(contenedor: HTMLElement): void {
  let periodoActivo: Periodo = 'hoy';

  contenedor.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:12px">
      <h2 style="font-size:1rem;font-weight:700;margin:0;display:flex;align-items:center;gap:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:var(--color-primario);display:inline-block"></span>
        Ganancias por trabajador
      </h2>
      ${selectorHTML('admin', periodoActivo)}
    </div>
    <div class="card" id="resultado-admin">Cargando...</div>
  `;

  async function cargar(): Promise<void> {
    const op      = OPCIONES.find(o => o.key === periodoActivo)!;
    const periodo  = calcularPeriodo(op.dias);
    const turnos   = await turnoService.listar('completado', periodo);
    renderResultadoAdmin(turnos, op.label);
    actualizarBotones('selector-admin', periodoActivo);
  }

  contenedor.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.btn-periodo');
    if (!btn) return;
    periodoActivo = btn.dataset['periodo'] as Periodo;
    cargar();
  });

  cargar();
}

interface ResumenTrabajador {
  id: string;
  nombre: string;
  comisionPct: number;
  turnos: number;
  totalServicios: number;
  ganancia: number;
}

function renderResultadoAdmin(turnos: Turno[], labelPeriodo: string): void {
  const el = document.getElementById('resultado-admin');
  if (!el) return;

  if (turnos.length === 0) {
    el.innerHTML = `<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Sin turnos completados en ${labelPeriodo.toLowerCase()}.</p>`;
    return;
  }

  // Agrupar por trabajador
  const mapa = new Map<string, ResumenTrabajador>();
  for (const t of turnos) {
    if (!t.trabajador) continue;
    const precio     = Number(t.servicio?.precio ?? 0);
    const comisionPct = Number((t.trabajador as unknown as { comisionPorcentaje?: number }).comisionPorcentaje ?? 50);
    const existente  = mapa.get(t.trabajadorId);
    if (existente) {
      existente.turnos++;
      existente.totalServicios += precio;
      existente.ganancia       += precio * (comisionPct / 100);
    } else {
      mapa.set(t.trabajadorId, {
        id:             t.trabajadorId,
        nombre:         `${t.trabajador.nombre} ${t.trabajador.apellido}`,
        comisionPct,
        turnos:         1,
        totalServicios: precio,
        ganancia:       precio * (comisionPct / 100),
      });
    }
  }

  const filas = [...mapa.values()].sort((a, b) => b.ganancia - a.ganancia);
  const totalGeneral = filas.reduce((s, f) => s + f.ganancia, 0);

  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Trabajador</th>
          <th>Turnos</th>
          <th>Total servicios</th>
          <th>Comisión</th>
          <th>Lo que gana</th>
        </tr>
      </thead>
      <tbody>
        ${filas.map(f => `
          <tr>
            <td><strong>${f.nombre}</strong></td>
            <td style="text-align:center">${f.turnos}</td>
            <td>${formatPrecio(f.totalServicios)}</td>
            <td style="text-align:center">${f.comisionPct}%</td>
            <td><strong style="color:#16a34a">${formatPrecio(f.ganancia)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background:var(--color-fondo)">
          <td><strong>Total</strong></td>
          <td style="text-align:center"><strong>${filas.reduce((s,f) => s+f.turnos, 0)}</strong></td>
          <td><strong>${formatPrecio(filas.reduce((s,f) => s+f.totalServicios, 0))}</strong></td>
          <td></td>
          <td><strong style="color:#16a34a">${formatPrecio(totalGeneral)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function actualizarBotones(selectorId: string, periodoActivo: Periodo): void {
  document.getElementById(selectorId)?.querySelectorAll<HTMLButtonElement>('.btn-periodo').forEach(btn => {
    const activo = btn.dataset['periodo'] === periodoActivo;
    btn.className = `btn btn-sm ${activo ? 'btn-primario' : 'btn-secundario'} btn-periodo`;
  });
}
