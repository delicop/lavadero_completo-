import { vehiculoService } from '../../services/vehiculoService';
import { clienteService } from '../../services/clienteService';
import { formatFecha } from '../../utils/formatters';
import type { Cliente, Vehiculo, TipoVehiculo } from '../../types';

export function VehiculosPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Vehículos</h1>
      <button class="btn btn-primario" id="btn-nuevo">+ Nuevo vehículo</button>
    </div>

    <div id="form-vehiculo" class="card" style="display:none;margin-bottom:20px;max-width:500px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px" id="form-titulo">Nuevo vehículo</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div class="form-grupo">
          <label class="form-label">Cliente</label>
          <select class="form-select" id="clienteId" required>
            <option value="">Seleccioná un cliente...</option>
          </select>
        </div>
        <div class="form-grupo">
          <label class="form-label">Patente</label>
          <input class="form-input" id="placa" placeholder="ABC-1234" required />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Marca</label>
            <input class="form-input" id="marca" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Modelo</label>
            <input class="form-input" id="modelo" required />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Color</label>
            <input class="form-input" id="color" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="tipo" required>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option>
              <option value="camioneta">Camioneta</option>
            </select>
          </div>
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

  let editandoId: string | null = null;
  let clientes: Cliente[] = [];

  const formWrapper = document.getElementById('form-vehiculo') as HTMLDivElement;
  const errorForm = document.getElementById('error-form') as HTMLDivElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const formTitulo = document.getElementById('form-titulo') as HTMLHeadingElement;
  const selectCliente = document.getElementById('clienteId') as HTMLSelectElement;

  async function cargarClientes(): Promise<void> {
    clientes = await clienteService.listar();
    selectCliente.innerHTML = `
      <option value="">Seleccioná un cliente...</option>
      ${clientes.map(c => `<option value="${c.id}">${c.apellido}, ${c.nombre}</option>`).join('')}
    `;
  }

  function abrirFormNuevo(): void {
    editandoId = null;
    formTitulo.textContent = 'Nuevo vehículo';
    form.reset();
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
  }

  function abrirFormEditar(v: Vehiculo): void {
    editandoId = v.id;
    formTitulo.textContent = 'Editar vehículo';
    (document.getElementById('clienteId') as HTMLSelectElement).value = v.clienteId;
    (document.getElementById('placa') as HTMLInputElement).value = v.placa;
    (document.getElementById('marca') as HTMLInputElement).value = v.marca;
    (document.getElementById('modelo') as HTMLInputElement).value = v.modelo;
    (document.getElementById('color') as HTMLInputElement).value = v.color;
    (document.getElementById('tipo') as HTMLSelectElement).value = v.tipo;
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
    formWrapper.scrollIntoView({ behavior: 'smooth' });
  }

  function cerrarForm(): void {
    formWrapper.style.display = 'none';
    editandoId = null;
  }

  async function cargarTabla(): Promise<void> {
    const wrapper = document.getElementById('tabla-wrapper') as HTMLDivElement;
    try {
      const vehiculos = await vehiculoService.listar();

      if (vehiculos.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay vehículos registrados</p>';
        return;
      }

      const tipoLabel: Record<TipoVehiculo, string> = { auto: 'Auto', moto: 'Moto', camioneta: 'Camioneta' };

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Vehículo</th>
              <th>Color / Tipo</th>
              <th>Cliente</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${vehiculos.map(v => `
              <tr>
                <td><strong>${v.placa}</strong></td>
                <td>${v.marca} ${v.modelo}</td>
                <td>${v.color} · ${tipoLabel[v.tipo]}</td>
                <td>${v.cliente ? `${v.cliente.apellido}, ${v.cliente.nombre}` : '—'}</td>
                <td>${formatFecha(v.fechaRegistro)}</td>
                <td style="display:flex;gap:6px">
                  <button class="btn btn-secundario btn-sm btn-editar" data-id="${v.id}">Editar</button>
                  <button class="btn btn-peligro btn-sm btn-eliminar" data-id="${v.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
          const v = vehiculos.find(x => x.id === btn.dataset['id']);
          if (v) abrirFormEditar(v);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este vehículo?')) return;
          await vehiculoService.eliminar(btn.dataset['id']!);
          await cargarTabla();
        });
      });

    } catch (err) {
      wrapper.innerHTML = `<p class="alerta-error">${err instanceof Error ? err.message : 'Error al cargar'}</p>`;
    }
  }

  document.getElementById('btn-nuevo')!.addEventListener('click', abrirFormNuevo);
  document.getElementById('btn-cancelar')!.addEventListener('click', cerrarForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorForm.style.display = 'none';

    const payload = {
      clienteId: (document.getElementById('clienteId') as HTMLSelectElement).value,
      placa: (document.getElementById('placa') as HTMLInputElement).value.toUpperCase(),
      marca: (document.getElementById('marca') as HTMLInputElement).value,
      modelo: (document.getElementById('modelo') as HTMLInputElement).value,
      color: (document.getElementById('color') as HTMLInputElement).value,
      tipo: (document.getElementById('tipo') as HTMLSelectElement).value as TipoVehiculo,
    };

    try {
      if (editandoId) {
        await vehiculoService.actualizar(editandoId, payload);
      } else {
        await vehiculoService.crear(payload);
      }
      cerrarForm();
      await cargarTabla();
    } catch (err) {
      errorForm.textContent = err instanceof Error ? err.message : 'Error al guardar';
      errorForm.style.display = 'block';
    }
  });

  cargarClientes();
  cargarTabla();
}
