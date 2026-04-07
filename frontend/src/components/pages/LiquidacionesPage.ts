import { liquidacionService } from '../../services/liquidacionService';
import { get } from '../../services/api';
import { formatFecha, formatPrecio } from '../../utils/formatters';
import type { Usuario, Liquidacion, Turno } from '../../types';

export function LiquidacionesPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Liquidaciones</h1>
      <button class="btn btn-primario" id="btn-nueva">+ Nueva liquidación</button>
    </div>

    <div id="form-liquidacion" class="card" style="display:none;margin-bottom:20px;max-width:480px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px">Generar liquidación</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div class="form-grupo">
          <label class="form-label">Trabajador</label>
          <select class="form-select" id="trabajadorId" required>
            <option value="">Seleccioná un trabajador...</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Desde</label>
            <input class="form-input" id="fechaDesde" type="date" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Hasta</label>
            <input class="form-input" id="fechaHasta" type="date" required />
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primario" type="submit">Generar</button>
          <button class="btn btn-secundario" type="button" id="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <div id="detalle-liquidacion" class="card" style="display:none;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="font-size:1rem;font-weight:600" id="detalle-titulo">Detalle de liquidación</h2>
        <button class="btn btn-secundario btn-sm" id="btn-cerrar-detalle">Cerrar</button>
      </div>
      <div id="detalle-contenido"></div>
    </div>

    <div class="card">
      <div id="tabla-wrapper">Cargando...</div>
    </div>
  `;

  const formWrapper = document.getElementById('form-liquidacion') as HTMLDivElement;
  const errorForm = document.getElementById('error-form') as HTMLDivElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const detalleWrapper = document.getElementById('detalle-liquidacion') as HTMLDivElement;

  async function cargarTrabajadores(): Promise<void> {
    const usuarios = await get<Usuario[]>('/usuarios');
    const trabajadores = usuarios.filter(u => u.activo);
    const select = document.getElementById('trabajadorId') as HTMLSelectElement;
    select.innerHTML = `
      <option value="">Seleccioná un trabajador...</option>
      ${trabajadores.map(u => `<option value="${u.id}">${u.apellido}, ${u.nombre} (${u.comisionPorcentaje}%)</option>`).join('')}
    `;
  }

  function abrirForm(): void {
    form.reset();
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
  }

  function cerrarForm(): void {
    formWrapper.style.display = 'none';
  }

  async function verDetalle(liq: Liquidacion): Promise<void> {
    const titulo = document.getElementById('detalle-titulo') as HTMLHeadingElement;
    const contenido = document.getElementById('detalle-contenido') as HTMLDivElement;
    titulo.textContent = `Liquidación — ${liq.trabajador ? `${liq.trabajador.apellido}, ${liq.trabajador.nombre}` : ''}`;
    contenido.innerHTML = 'Cargando turnos...';
    detalleWrapper.style.display = 'block';
    detalleWrapper.scrollIntoView({ behavior: 'smooth' });

    const turnos: Turno[] = await liquidacionService.turnosDeLiquidacion(liq.id);

    contenido.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
        <div class="card" style="text-align:center;padding:16px">
          <div style="font-size:1.5rem;font-weight:700">${liq.cantidadTurnos}</div>
          <div style="color:var(--color-texto-suave);font-size:0.8rem">Turnos</div>
        </div>
        <div class="card" style="text-align:center;padding:16px">
          <div style="font-size:1.5rem;font-weight:700">${formatPrecio(liq.totalServicios)}</div>
          <div style="color:var(--color-texto-suave);font-size:0.8rem">Total servicios</div>
        </div>
        <div class="card" style="text-align:center;padding:16px">
          <div style="font-size:1.5rem;font-weight:700">${liq.comisionPorcentaje}%</div>
          <div style="color:var(--color-texto-suave);font-size:0.8rem">Comisión</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;background:#dcfce7">
          <div style="font-size:1.5rem;font-weight:700;color:#166534">${formatPrecio(liq.totalPago)}</div>
          <div style="color:#166534;font-size:0.8rem">A pagar</div>
        </div>
      </div>
      <table class="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Servicio</th>
            <th>Precio</th>
            <th>Comisión</th>
          </tr>
        </thead>
        <tbody>
          ${turnos.map(t => {
            const precio = Number(t.servicio?.precio ?? 0);
            const comision = precio * (liq.comisionPorcentaje / 100);
            return `
              <tr>
                <td>${formatFecha(t.fechaHora)}</td>
                <td>${t.cliente ? `${t.cliente.apellido}, ${t.cliente.nombre}` : '—'}</td>
                <td>${t.vehiculo?.placa ?? '—'}</td>
                <td>${t.servicio?.nombre ?? '—'}</td>
                <td>${formatPrecio(precio)}</td>
                <td><strong>${formatPrecio(comision)}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  async function cargarTabla(): Promise<void> {
    const wrapper = document.getElementById('tabla-wrapper') as HTMLDivElement;
    try {
      const liquidaciones = await liquidacionService.listar();

      if (liquidaciones.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay liquidaciones generadas</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Trabajador</th>
              <th>Período</th>
              <th>Turnos</th>
              <th>Total servicios</th>
              <th>Comisión</th>
              <th>A pagar</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${liquidaciones.map(l => `
              <tr>
                <td><strong>${l.trabajador ? `${l.trabajador.apellido}, ${l.trabajador.nombre}` : '—'}</strong></td>
                <td style="font-size:0.85rem">${l.fechaDesde} → ${l.fechaHasta}</td>
                <td style="text-align:center">${l.cantidadTurnos}</td>
                <td>${formatPrecio(l.totalServicios)}</td>
                <td>${l.comisionPorcentaje}%</td>
                <td><strong>${formatPrecio(l.totalPago)}</strong></td>
                <td>
                  <span class="badge ${l.estado === 'pagada' ? 'badge-completado' : 'badge-pendiente'}">
                    ${l.estado === 'pagada' ? 'Pagada' : 'Pendiente'}
                  </span>
                  ${l.fechaPago ? `<br><small style="color:var(--color-texto-suave)">${formatFecha(l.fechaPago)}</small>` : ''}
                </td>
                <td style="display:flex;gap:6px">
                  <button class="btn btn-secundario btn-sm btn-ver" data-id="${l.id}">Ver</button>
                  ${l.estado === 'pendiente'
                    ? `<button class="btn btn-primario btn-sm btn-pagar" data-id="${l.id}">Marcar pagada</button>`
                    : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-ver').forEach(btn => {
        btn.addEventListener('click', () => {
          const liq = liquidaciones.find(l => l.id === btn.dataset['id']);
          if (liq) verDetalle(liq);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-pagar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Confirmar pago de esta liquidación?')) return;
          btn.disabled = true;
          await liquidacionService.marcarPagada(btn.dataset['id']!);
          await cargarTabla();
        });
      });

    } catch (err) {
      wrapper.innerHTML = `<p class="alerta-error">${err instanceof Error ? err.message : 'Error al cargar'}</p>`;
    }
  }

  document.getElementById('btn-nueva')!.addEventListener('click', abrirForm);
  document.getElementById('btn-cancelar')!.addEventListener('click', cerrarForm);
  document.getElementById('btn-cerrar-detalle')!.addEventListener('click', () => {
    detalleWrapper.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorForm.style.display = 'none';

    const payload = {
      trabajadorId: (document.getElementById('trabajadorId') as HTMLSelectElement).value,
      fechaDesde: (document.getElementById('fechaDesde') as HTMLInputElement).value,
      fechaHasta: (document.getElementById('fechaHasta') as HTMLInputElement).value,
    };

    try {
      await liquidacionService.crear(payload);
      cerrarForm();
      await cargarTabla();
    } catch (err) {
      errorForm.textContent = err instanceof Error ? err.message : 'Error al generar';
      errorForm.style.display = 'block';
    }
  });

  cargarTrabajadores();
  cargarTabla();
}
