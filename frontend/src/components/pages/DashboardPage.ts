import { turnoService } from '../../services/turnoService';
import { sesionService } from '../../services/sesionService';
import { authService } from '../../services/authService';
import { get } from '../../services/api';
import { formatFecha, formatPrecio } from '../../utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCompletado } from '../../utils/whatsapp';
import { renderGananciasTrabajador } from '../common/GananciasPeriodo';
import type { Turno, Usuario } from '../../types';

function esHoy(fechaIso: string): boolean {
  const hoy = new Date();
  const fecha = new Date(fechaIso);
  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
}

function horaStr(fechaIso: string): string {
  return new Date(fechaIso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function DashboardPage(contenedor: HTMLElement): void {
  const esAdmin = sesionService.esAdmin();

  if (esAdmin) {
    renderAdmin(contenedor);
  } else {
    renderTrabajador(contenedor);
  }
}

// ── Vista ADMIN ────────────────────────────────────────────────────────────────

function renderAdmin(contenedor: HTMLElement): void {
  const hoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  contenedor.innerHTML = `
    <div style="margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between">
      <div>
        <h1 class="pagina-titulo" style="margin:0">Panel del día</h1>
        <p style="color:var(--color-texto-suave);font-size:0.9rem;margin-top:4px;text-transform:capitalize">${hoy}</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span id="ultimo-update" style="font-size:0.8rem;color:var(--color-texto-suave)"></span>
        <button id="btn-refresh" class="btn btn-secundario btn-sm">↻ Actualizar</button>
      </div>
    </div>

    <div id="stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px">
      ${['','','',''].map(() => `
        <div class="card" style="padding:20px;display:flex;flex-direction:column;gap:4px">
          <div style="height:14px;background:var(--color-borde);border-radius:4px;width:60%;animation:pulse 1.5s infinite"></div>
          <div style="height:28px;background:var(--color-borde);border-radius:4px;margin-top:6px;animation:pulse 1.5s infinite"></div>
        </div>
      `).join('')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:inline-block"></span>
          En proceso ahora
        </h2>
        <div class="card" id="tabla-en-proceso">Cargando...</div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#d97706;display:inline-block"></span>
          En espera
        </h2>
        <div class="card" id="tabla-pendientes">Cargando...</div>
      </div>
    </div>

    <div style="margin-bottom:20px">
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:#16a34a;display:inline-block"></span>
        Completados hoy — listos para llamar al cliente
      </h2>
      <div class="card" id="tabla-completados">Cargando...</div>
    </div>

    <div>
      <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:#7c3aed;display:inline-block"></span>
        Trabajadores hoy
      </h2>
      <div class="card" id="panel-trabajadores">Cargando...</div>
    </div>

    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    </style>
  `;

  async function cargarTrabajadores(): Promise<void> {
    const todos = await get<Usuario[]>('/usuarios');
    const trabajadores = todos.filter(u => u.rol === 'trabajador' && u.activo);
    const el = document.getElementById('panel-trabajadores')!;

    if (trabajadores.length === 0) {
      el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:16px;font-size:0.9rem">No hay trabajadores registrados</p>';
      return;
    }

    el.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        ${trabajadores.map(u => `
          <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:8px;
                      background:${u.disponible ? '#f0fdf4' : '#f9fafb'};
                      border:1px solid ${u.disponible ? '#86efac' : 'var(--color-borde)'}">
            <span style="width:10px;height:10px;border-radius:50%;flex-shrink:0;
                          background:${u.disponible ? '#16a34a' : '#d1d5db'}"></span>
            <div>
              <div style="font-size:0.85rem;font-weight:600">${u.nombre} ${u.apellido}</div>
              <div style="font-size:0.75rem;color:${u.disponible ? '#15803d' : 'var(--color-texto-suave)'}">
                ${u.disponible ? 'Disponible' : 'No disponible'}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  let intervalo: ReturnType<typeof setInterval> | null = null;

  async function cargar(): Promise<void> {
    const [enProceso, pendientes, completados] = await Promise.all([
      turnoService.listar('en_proceso'),
      turnoService.listar('pendiente'),
      turnoService.listar('completado'),
    ]);

    const completadosHoy = completados.filter(t => esHoy(t.fechaHora));

    const stats = document.getElementById('stats') as HTMLDivElement;
    stats.innerHTML = `
      ${tarjeta('En espera', pendientes.length, '#f59e0b', 'vehículos')}
      ${tarjeta('En proceso', enProceso.length, '#2563eb', 'vehículos')}
      ${tarjeta('Completados hoy', completadosHoy.length, '#16a34a', 'turnos')}
      ${tarjetaPrecio('Ingresos del día', completadosHoy.reduce((sum, t) => sum + Number(t.servicio?.precio ?? 0), 0))}
    `;

    renderTablaEnProceso(enProceso, cargar);
    renderTablaPendientes(pendientes, cargar);
    renderTablaCompletadosAdmin(completadosHoy);
    cargarTrabajadores();

    const ts = document.getElementById('ultimo-update');
    if (ts) ts.textContent = `Actualizado ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  }

  document.getElementById('btn-refresh')!.addEventListener('click', () => cargar());

  // Auto-refresh cada 30 segundos
  intervalo = setInterval(() => {
    if (!document.contains(contenedor)) {
      if (intervalo) clearInterval(intervalo);
      return;
    }
    cargar();
  }, 30_000);

  cargar();
}

function renderTablaCompletadosAdmin(turnos: Turno[]): void {
  const el = document.getElementById('tabla-completados') as HTMLDivElement;
  if (turnos.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Ningún turno completado hoy todavía</p>';
    return;
  }
  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Hora</th>
          <th>Vehículo</th>
          <th>Cliente</th>
          <th>Teléfono</th>
          <th>Servicio</th>
          <th>Trabajador</th>
          <th>Precio</th>
        </tr>
      </thead>
      <tbody>
        ${turnos.map(t => `
          <tr>
            <td style="white-space:nowrap;font-weight:600">${horaStr(t.fechaHora)}</td>
            <td>
              <strong>${t.vehiculo?.placa ?? '—'}</strong>
              <br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo}` : ''}</small>
            </td>
            <td>${t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : '—'}</td>
            <td>
              ${t.cliente?.telefono
                ? `<a href="tel:${t.cliente.telefono}" style="color:var(--color-primario);font-weight:600;text-decoration:none">📞 ${t.cliente.telefono}</a>`
                : '—'}
            </td>
            <td>${t.servicio?.nombre ?? '—'}</td>
            <td>${t.trabajador ? `${t.trabajador.nombre} ${t.trabajador.apellido}` : '—'}</td>
            <td style="font-weight:600;color:#16a34a">${formatPrecio(Number(t.servicio?.precio ?? 0))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── Vista TRABAJADOR ───────────────────────────────────────────────────────────

function renderTrabajador(contenedor: HTMLElement): void {
  let usuario = sesionService.obtener()!;
  const hoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  contenedor.innerHTML = `
    <div style="margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <h1 class="pagina-titulo" style="margin:0">Mi panel</h1>
        <p style="color:var(--color-texto-suave);font-size:0.9rem;margin-top:4px;text-transform:capitalize">${hoy}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div id="badge-disponible" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:20px;font-size:0.8rem;font-weight:700;
              background:${usuario.disponible ? '#dcfce7' : '#fee2e2'};
              color:${usuario.disponible ? '#15803d' : '#dc2626'}">
          <span style="width:8px;height:8px;border-radius:50%;background:${usuario.disponible ? '#16a34a' : '#dc2626'}"></span>
          ${usuario.disponible ? 'Disponible' : 'No disponible'}
        </div>
        <button id="btn-disponibilidad" class="btn btn-sm ${usuario.disponible ? 'btn-secundario' : 'btn-primario'}" style="font-weight:700">
          ${usuario.disponible ? 'Salir' : 'Entrar'}
        </button>
        <button id="btn-refresh" class="btn btn-secundario btn-sm">↻</button>
      </div>
    </div>

    <div id="stats-trabajador" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px">
      <div class="card" style="padding:20px;text-align:center">
        <div style="font-size:0.75rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">En espera</div>
        <div id="stat-pendientes" style="font-size:2rem;font-weight:800;color:#f59e0b">—</div>
      </div>
      <div class="card" style="padding:20px;text-align:center">
        <div style="font-size:0.75rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">Completados hoy</div>
        <div id="stat-completados" style="font-size:2rem;font-weight:800;color:#16a34a">—</div>
      </div>
      <div class="card" style="padding:20px;text-align:center">
        <div style="font-size:0.75rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">Ganado hoy</div>
        <div id="stat-ganado" style="font-size:1.6rem;font-weight:800;color:#16a34a">—</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:20px">
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#2563eb;display:inline-block"></span>
          En proceso ahora
        </h2>
        <div class="card" id="tabla-en-proceso">Cargando...</div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#f59e0b;display:inline-block"></span>
          Turnos en espera
        </h2>
        <div class="card" id="tabla-pendientes">Cargando...</div>
      </div>
      <div>
        <h2 style="font-size:1rem;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:#16a34a;display:inline-block"></span>
          Completados hoy
        </h2>
        <div class="card" id="tabla-completados">Cargando...</div>
      </div>

      <div id="seccion-ganancias-periodo" style="margin-top:8px"></div>
    </div>

    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    </style>
  `;

  async function cargar(): Promise<void> {
    const misTurnos = await turnoService.listarPorTrabajador(usuario.id);

    const pendientes     = misTurnos.filter(t => t.estado === 'pendiente');
    const enProceso      = misTurnos.filter(t => t.estado === 'en_proceso');
    const completadosHoy = misTurnos.filter(t => t.estado === 'completado' && esHoy(t.fechaHora));
    const gananciaHoy    = completadosHoy.reduce(
      (sum, t) => sum + Number(t.servicio?.precio ?? 0) * (usuario.comisionPorcentaje / 100), 0,
    );

    (document.getElementById('stat-pendientes') as HTMLElement).textContent = String(pendientes.length);
    (document.getElementById('stat-completados') as HTMLElement).textContent = String(completadosHoy.length);
    (document.getElementById('stat-ganado') as HTMLElement).textContent = formatPrecio(gananciaHoy);

    renderTablaEnProceso(enProceso, cargar);
    renderTablaPendientesTrabajador(pendientes, cargar);
    renderTablaCompletadosTrabajador(completadosHoy, usuario.comisionPorcentaje);
  }

  document.getElementById('btn-refresh')!.addEventListener('click', () => cargar());

  document.getElementById('btn-disponibilidad')!.addEventListener('click', async () => {
    const btn   = document.getElementById('btn-disponibilidad') as HTMLButtonElement;
    const badge = document.getElementById('badge-disponible') as HTMLDivElement;
    btn.disabled = true;

    const nueva = !usuario.disponible;
    await authService.toggleDisponibilidad(nueva);
    usuario = sesionService.obtener()!; // refresca con el nuevo estado

    badge.style.background = nueva ? '#dcfce7' : '#fee2e2';
    badge.style.color       = nueva ? '#15803d' : '#dc2626';
    badge.innerHTML = `
      <span style="width:8px;height:8px;border-radius:50%;background:${nueva ? '#16a34a' : '#dc2626'}"></span>
      ${nueva ? 'Disponible' : 'No disponible'}
    `;
    btn.textContent  = nueva ? 'Salir' : 'Entrar';
    btn.className    = `btn btn-sm ${nueva ? 'btn-secundario' : 'btn-primario'}`;
    btn.style.fontWeight = '700';
    btn.disabled = false;
  });

  // Ganancias por período (se inicializa una vez, maneja su propio estado interno)
  const seccionGanancias = document.getElementById('seccion-ganancias-periodo') as HTMLDivElement;
  renderGananciasTrabajador(seccionGanancias, usuario.id, usuario.comisionPorcentaje);

  cargar();
}

// ── Componentes de tabla compartidos ─────────────────────────────────────────

function renderTablaEnProceso(turnos: Turno[], recargar: () => Promise<void>): void {
  const el = document.getElementById('tabla-en-proceso') as HTMLDivElement;

  if (turnos.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Ningún vehículo en proceso</p>';
    return;
  }

  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Vehículo</th>
          <th>Servicio</th>
          <th>Trabajador</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${turnos.map(t => `
          <tr>
            <td>
              <strong>${t.vehiculo?.placa ?? '—'}</strong>
              <br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo}` : ''}</small>
              <br><small style="color:var(--color-texto-suave)">${t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : ''}</small>
            </td>
            <td>
              ${t.servicio?.nombre ?? '—'}
              <br><small style="color:var(--color-texto-suave)">${t.servicio ? `${t.servicio.duracionMinutos} min` : ''}</small>
            </td>
            <td>${t.trabajador ? `${t.trabajador.nombre} ${t.trabajador.apellido}` : '—'}</td>
            <td>
              <button class="btn btn-primario btn-sm btn-completar"
                data-id="${t.id}"
                data-telefono="${t.cliente?.telefono ?? ''}"
                data-nombre="${t.cliente?.nombre ?? ''}"
                data-placa="${t.vehiculo?.placa ?? ''}"
                data-marca="${t.vehiculo?.marca ?? ''}"
                data-modelo="${t.vehiculo?.modelo ?? ''}">
                ✓ Completar
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  el.querySelectorAll<HTMLButtonElement>('.btn-completar').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '...';
      await turnoService.cambiarEstado(btn.dataset['id']!, 'completado');
      await recargar();

      const telefono = btn.dataset['telefono'] ?? '';
      if (telefono) {
        mostrarToastWhatsApp(
          telefono,
          mensajeTurnoCompletado({
            nombreCliente: btn.dataset['nombre'] ?? '',
            placa:  btn.dataset['placa']  ?? '',
            marca:  btn.dataset['marca']  ?? '',
            modelo: btn.dataset['modelo'] ?? '',
          }),
          '✅ Turno completado — avisar al cliente',
        );
      }
    });
  });
}

function renderTablaPendientes(turnos: Turno[], recargar: () => Promise<void>): void {
  const el = document.getElementById('tabla-pendientes') as HTMLDivElement;

  if (turnos.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">No hay vehículos en espera</p>';
    return;
  }

  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Hora</th>
          <th>Vehículo</th>
          <th>Servicio</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${turnos.map(t => `
          <tr>
            <td style="font-weight:600;white-space:nowrap">
              ${horaStr(t.fechaHora)}
              ${!esHoy(t.fechaHora) ? `<br><small style="color:var(--color-peligro)">${formatFecha(t.fechaHora).split(',')[0]}</small>` : ''}
            </td>
            <td>
              <strong>${t.vehiculo?.placa ?? '—'}</strong>
              <br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo} · ${t.vehiculo.color}` : ''}</small>
              <br><small style="color:var(--color-texto-suave)">${t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : ''}</small>
            </td>
            <td>${t.servicio?.nombre ?? '—'}</td>
            <td>
              <button class="btn btn-secundario btn-sm btn-iniciar" data-id="${t.id}">
                → Iniciar
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  el.querySelectorAll<HTMLButtonElement>('.btn-iniciar').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '...';
      await turnoService.cambiarEstado(btn.dataset['id']!, 'en_proceso');
      await recargar();
    });
  });
}

function renderTablaPendientesTrabajador(turnos: Turno[], recargar: () => Promise<void>): void {
  const el = document.getElementById('tabla-pendientes') as HTMLDivElement;

  if (turnos.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">No tenés turnos en espera</p>';
    return;
  }

  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr>
          <th>Hora</th>
          <th>Vehículo</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${turnos.map(t => `
          <tr>
            <td style="font-weight:600;white-space:nowrap">
              ${horaStr(t.fechaHora)}
              ${!esHoy(t.fechaHora) ? `<br><small style="color:var(--color-peligro)">${formatFecha(t.fechaHora).split(',')[0]}</small>` : ''}
            </td>
            <td>
              <strong>${t.vehiculo?.placa ?? '—'}</strong>
              <br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo} · ${t.vehiculo.color}` : ''}</small>
            </td>
            <td>${t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : '—'}</td>
            <td>${t.servicio?.nombre ?? '—'}</td>
            <td>
              <button class="btn btn-secundario btn-sm btn-iniciar" data-id="${t.id}">→ Iniciar</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  el.querySelectorAll<HTMLButtonElement>('.btn-iniciar').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = '...';
      await turnoService.cambiarEstado(btn.dataset['id']!, 'en_proceso');
      await recargar();
    });
  });
}

function renderTablaCompletadosTrabajador(turnos: Turno[], comision: number): void {
  const el = document.getElementById('tabla-completados') as HTMLDivElement;
  if (turnos.length === 0) {
    el.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:20px;font-size:0.9rem">Todavía no completaste ningún turno hoy</p>';
    return;
  }
  el.innerHTML = `
    <table class="tabla">
      <thead>
        <tr><th>Hora</th><th>Vehículo</th><th>Cliente</th><th>Servicio</th><th>Tu ganancia</th></tr>
      </thead>
      <tbody>
        ${turnos.map(t => {
          const ganancia = Number(t.servicio?.precio ?? 0) * (comision / 100);
          return `
            <tr>
              <td style="white-space:nowrap">${horaStr(t.fechaHora)}</td>
              <td>
                <strong>${t.vehiculo?.placa ?? '—'}</strong>
                <br><small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.marca} ${t.vehiculo.modelo}` : ''}</small>
              </td>
              <td>${t.cliente ? `${t.cliente.nombre} ${t.cliente.apellido}` : '—'}</td>
              <td>${t.servicio?.nombre ?? '—'}</td>
              <td><strong style="color:var(--color-exito)">${formatPrecio(ganancia)}</strong></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function tarjeta(titulo: string, valor: number, color: string, unidad: string): string {
  return `
    <div class="card" style="padding:20px">
      <div style="font-size:0.8rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">${titulo}</div>
      <div style="font-size:2rem;font-weight:800;color:${color};margin-top:4px">${valor}</div>
      <div style="font-size:0.8rem;color:var(--color-texto-suave)">${unidad}</div>
    </div>
  `;
}

function tarjetaPrecio(titulo: string, valor: number): string {
  return `
    <div class="card" style="padding:20px">
      <div style="font-size:0.8rem;font-weight:600;color:var(--color-texto-suave);text-transform:uppercase;letter-spacing:.05em">${titulo}</div>
      <div style="font-size:1.6rem;font-weight:800;color:#16a34a;margin-top:4px">${formatPrecio(valor)}</div>
      <div style="font-size:0.8rem;color:var(--color-texto-suave)">solo servicios completados</div>
    </div>
  `;
}
