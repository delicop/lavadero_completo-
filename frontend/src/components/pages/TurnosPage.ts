import { turnoService } from '../../services/turnoService';
import { clienteService } from '../../services/clienteService';
import { vehiculoService } from '../../services/vehiculoService';
import { servicioService } from '../../services/servicioService';
import { get } from '../../services/api';
import { formatFecha, formatPrecio } from '../../utils/formatters';
import { mostrarToastWhatsApp, mensajeTurnoCreado, mensajeTurnoCompletado } from '../../utils/whatsapp';
import type { Usuario, Cliente, Vehiculo, EstadoTurno } from '../../types';

const ESTADOS: EstadoTurno[] = ['pendiente', 'en_proceso', 'completado', 'cancelado'];

const TRANSICIONES: Record<EstadoTurno, EstadoTurno[]> = {
  pendiente:   ['en_proceso', 'cancelado'],
  en_proceso:  ['completado', 'cancelado'],
  completado:  [],
  cancelado:   [],
};

const ESTADO_LABEL: Record<EstadoTurno, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado:  'Cancelado',
};

export function TurnosPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Turnos</h1>
      <div style="display:flex;gap:8px;align-items:center">
        <select class="form-select" id="filtro-estado" style="width:160px">
          <option value="">Todos los estados</option>
          ${ESTADOS.map(e => `<option value="${e}">${ESTADO_LABEL[e]}</option>`).join('')}
        </select>
        <button class="btn btn-primario" id="btn-nuevo">+ Nuevo turno</button>
      </div>
    </div>

    <div id="form-turno" class="card" style="display:none;margin-bottom:20px;max-width:560px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px">Nuevo turno</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div class="form-grupo">
          <label class="form-label">Cliente</label>
          <select class="form-select" id="clienteId" required>
            <option value="">Seleccioná un cliente...</option>
          </select>
        </div>
        <div class="form-grupo">
          <label class="form-label">Vehículo</label>
          <select class="form-select" id="vehiculoId" required>
            <option value="">Seleccioná primero un cliente</option>
          </select>
        </div>
        <div class="form-grupo">
          <label class="form-label">Servicio</label>
          <select class="form-select" id="servicioId" required>
            <option value="">Seleccioná un servicio...</option>
          </select>
        </div>
        <div class="form-grupo">
          <label class="form-label">Trabajador</label>
          <select class="form-select" id="trabajadorId" required>
            <option value="">Seleccioná un trabajador...</option>
          </select>
        </div>
        <div class="form-grupo">
          <label class="form-label">Fecha y hora</label>
          <input class="form-input" id="fechaHora" type="datetime-local" required />
        </div>
        <div class="form-grupo">
          <label class="form-label">Observaciones (opcional)</label>
          <input class="form-input" id="observaciones" />
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primario" type="submit">Guardar</button>
          <button class="btn btn-secundario" type="button" id="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div id="tabla-wrapper">Cargando...</div>
    </div>
  `;

  const formWrapper = document.getElementById('form-turno') as HTMLDivElement;
  const errorForm = document.getElementById('error-form') as HTMLDivElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const selectCliente = document.getElementById('clienteId') as HTMLSelectElement;
  const selectVehiculo = document.getElementById('vehiculoId') as HTMLSelectElement;
  const filtroEstado = document.getElementById('filtro-estado') as HTMLSelectElement;

  // Guardamos los datos en memoria para usarlos al armar el mensaje de WhatsApp
  const clientesMap = new Map<string, Cliente>();
  const vehiculosMap = new Map<string, Vehiculo>();

  async function cargarSelects(): Promise<void> {
    const [clientes, servicios, usuarios] = await Promise.all([
      clienteService.listar(),
      servicioService.listar(true),
      get<Usuario[]>('/usuarios'),
    ]);

    clientes.forEach(c => clientesMap.set(c.id, c));

    selectCliente.innerHTML = `
      <option value="">Seleccioná un cliente...</option>
      ${clientes.map(c => `<option value="${c.id}">${c.apellido}, ${c.nombre}</option>`).join('')}
    `;

    (document.getElementById('servicioId') as HTMLSelectElement).innerHTML = `
      <option value="">Seleccioná un servicio...</option>
      ${servicios.map(s => `<option value="${s.id}">${s.nombre} — ${formatPrecio(s.precio)} (${s.duracionMinutos} min)</option>`).join('')}
    `;

    const disponibles = usuarios.filter(u => u.rol === 'trabajador' && u.activo && u.disponible);
    (document.getElementById('trabajadorId') as HTMLSelectElement).innerHTML = `
      <option value="">Seleccioná un trabajador...</option>
      ${disponibles.length
        ? disponibles.map(u => `<option value="${u.id}">${u.apellido}, ${u.nombre}</option>`).join('')
        : '<option disabled>— No hay trabajadores disponibles —</option>'}
    `;
  }

  // Al cambiar el cliente, carga sus vehículos y los guarda en memoria
  selectCliente.addEventListener('change', async () => {
    const clienteId = selectCliente.value;
    selectVehiculo.innerHTML = '<option value="">Cargando...</option>';
    vehiculosMap.clear();

    if (!clienteId) {
      selectVehiculo.innerHTML = '<option value="">Seleccioná primero un cliente</option>';
      return;
    }

    const vehiculos = await vehiculoService.listarPorCliente(clienteId);
    vehiculos.forEach(v => vehiculosMap.set(v.id, v));
    selectVehiculo.innerHTML = vehiculos.length
      ? vehiculos.map(v => `<option value="${v.id}">${v.placa} — ${v.marca} ${v.modelo}</option>`).join('')
      : '<option value="">Este cliente no tiene vehículos</option>';
  });

  function abrirForm(): void {
    form.reset();
    errorForm.style.display = 'none';
    selectVehiculo.innerHTML = '<option value="">Seleccioná primero un cliente</option>';
    formWrapper.style.display = 'block';
  }

  function cerrarForm(): void {
    formWrapper.style.display = 'none';
  }

  async function cargarTabla(): Promise<void> {
    const wrapper = document.getElementById('tabla-wrapper') as HTMLDivElement;
    const estado = filtroEstado.value as EstadoTurno | '';

    try {
      const turnos = await turnoService.listar(estado || undefined);

      if (turnos.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay turnos registrados</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente / Vehículo</th>
              <th>Servicio</th>
              <th>Trabajador</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${turnos.map(t => `
              <tr>
                <td>${formatFecha(t.fechaHora)}</td>
                <td>
                  ${t.cliente ? `<strong>${t.cliente.apellido}, ${t.cliente.nombre}</strong>` : '—'}<br>
                  <small style="color:var(--color-texto-suave)">${t.vehiculo ? `${t.vehiculo.placa} · ${t.vehiculo.marca}` : '—'}</small>
                </td>
                <td>${t.servicio?.nombre ?? '—'}</td>
                <td>${t.trabajador ? `${t.trabajador.nombre} ${t.trabajador.apellido}` : '—'}</td>
                <td><span class="badge badge-${t.estado}">${ESTADO_LABEL[t.estado]}</span></td>
                <td>
                  <div style="display:flex;gap:6px;flex-wrap:wrap">
                    ${TRANSICIONES[t.estado].map(sig => `
                      <button class="btn btn-secundario btn-sm btn-estado"
                        data-id="${t.id}"
                        data-estado="${sig}"
                        data-telefono="${t.cliente?.telefono ?? ''}"
                        data-nombre="${t.cliente?.nombre ?? ''}"
                        data-placa="${t.vehiculo?.placa ?? ''}"
                        data-marca="${t.vehiculo?.marca ?? ''}"
                        data-modelo="${t.vehiculo?.modelo ?? ''}">
                        → ${ESTADO_LABEL[sig]}
                      </button>
                    `).join('')}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-estado').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id          = btn.dataset['id']!;
          const nuevoEstado = btn.dataset['estado'] as EstadoTurno;
          btn.disabled = true;
          try {
            await turnoService.cambiarEstado(id, nuevoEstado);
            await cargarTabla();

            if (nuevoEstado === 'completado') {
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
            }
          } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al cambiar estado');
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      wrapper.innerHTML = `<p class="alerta-error">${err instanceof Error ? err.message : 'Error al cargar'}</p>`;
    }
  }

  document.getElementById('btn-nuevo')!.addEventListener('click', abrirForm);
  document.getElementById('btn-cancelar')!.addEventListener('click', cerrarForm);
  filtroEstado.addEventListener('change', cargarTabla);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorForm.style.display = 'none';

    const fechaLocal = (document.getElementById('fechaHora') as HTMLInputElement).value;

    const payload = {
      clienteId: selectCliente.value,
      vehiculoId: selectVehiculo.value,
      servicioId: (document.getElementById('servicioId') as HTMLSelectElement).value,
      trabajadorId: (document.getElementById('trabajadorId') as HTMLSelectElement).value,
      fechaHora: new Date(fechaLocal).toISOString(),
      observaciones: (document.getElementById('observaciones') as HTMLInputElement).value || undefined,
    };

    try {
      const turnoCreado = await turnoService.crear(payload);
      cerrarForm();
      await cargarTabla();

      // WhatsApp al cliente
      const cliente  = clientesMap.get(turnoCreado.clienteId);
      const vehiculo = vehiculosMap.get(turnoCreado.vehiculoId);
      if (cliente?.telefono && vehiculo) {
        mostrarToastWhatsApp(
          cliente.telefono,
          mensajeTurnoCreado({
            nombreCliente: cliente.nombre,
            placa:  vehiculo.placa,
            marca:  vehiculo.marca,
            modelo: vehiculo.modelo,
            fechaHora: turnoCreado.fechaHora,
          }),
          '📅 Turno agendado — avisar al cliente',
        );
      }
    } catch (err) {
      errorForm.textContent = err instanceof Error ? err.message : 'Error al guardar';
      errorForm.style.display = 'block';
    }
  });

  cargarSelects();
  cargarTabla();
}
