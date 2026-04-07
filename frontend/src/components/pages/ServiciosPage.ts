import { get, post, patch, del } from '../../services/api';
import { formatPrecio } from '../../utils/formatters';
import type { Servicio } from '../../types';

export function ServiciosPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Servicios</h1>
      <button class="btn btn-primario" id="btn-nuevo">+ Nuevo servicio</button>
    </div>

    <div id="form-servicio" class="card" style="display:none;margin-bottom:20px;max-width:500px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px" id="form-titulo">Nuevo servicio</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div class="form-grupo">
          <label class="form-label">Nombre</label>
          <input class="form-input" id="nombre" required />
        </div>
        <div class="form-grupo">
          <label class="form-label">Descripción (opcional)</label>
          <input class="form-input" id="descripcion" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Duración (min)</label>
            <input class="form-input" id="duracionMinutos" type="number" min="1" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Precio ($)</label>
            <input class="form-input" id="precio" type="number" min="0.01" step="0.01" required />
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

  const formWrapper = document.getElementById('form-servicio') as HTMLDivElement;
  const errorForm = document.getElementById('error-form') as HTMLDivElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const formTitulo = document.getElementById('form-titulo') as HTMLHeadingElement;

  function abrirFormNuevo(): void {
    editandoId = null;
    formTitulo.textContent = 'Nuevo servicio';
    form.reset();
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
  }

  function abrirFormEditar(s: Servicio): void {
    editandoId = s.id;
    formTitulo.textContent = 'Editar servicio';
    (document.getElementById('nombre') as HTMLInputElement).value = s.nombre;
    (document.getElementById('descripcion') as HTMLInputElement).value = s.descripcion ?? '';
    (document.getElementById('duracionMinutos') as HTMLInputElement).value = String(s.duracionMinutos);
    (document.getElementById('precio') as HTMLInputElement).value = String(s.precio);
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
    formWrapper.scrollIntoView({ behavior: 'smooth' });
  }

  function cerrarForm(): void {
    formWrapper.style.display = 'none';
    editandoId = null;
  }

  async function toggleActivo(s: Servicio): Promise<void> {
    await patch(`/servicios/${s.id}`, { activo: !s.activo });
    await cargarTabla();
  }

  async function cargarTabla(): Promise<void> {
    const wrapper = document.getElementById('tabla-wrapper') as HTMLDivElement;
    try {
      const servicios = await get<Servicio[]>('/servicios');

      if (servicios.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay servicios registrados</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${servicios.map(s => `
              <tr>
                <td><strong>${s.nombre}</strong></td>
                <td>${s.descripcion ?? '—'}</td>
                <td>${s.duracionMinutos} min</td>
                <td>${formatPrecio(s.precio)}</td>
                <td>
                  <button class="btn btn-sm btn-toggle ${s.activo ? 'btn-secundario' : 'btn-primario'}" data-id="${s.id}">
                    ${s.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
                <td style="display:flex;gap:6px">
                  <button class="btn btn-secundario btn-sm btn-editar" data-id="${s.id}">Editar</button>
                  <button class="btn btn-peligro btn-sm btn-eliminar" data-id="${s.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const s = servicios.find(x => x.id === btn.dataset['id']);
          if (s) toggleActivo(s);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
          const s = servicios.find(x => x.id === btn.dataset['id']);
          if (s) abrirFormEditar(s);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este servicio?')) return;
          await del(`/servicios/${btn.dataset['id']!}`);
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
      nombre: (document.getElementById('nombre') as HTMLInputElement).value,
      descripcion: (document.getElementById('descripcion') as HTMLInputElement).value || undefined,
      duracionMinutos: Number((document.getElementById('duracionMinutos') as HTMLInputElement).value),
      precio: Number((document.getElementById('precio') as HTMLInputElement).value),
    };

    try {
      if (editandoId) {
        await patch(`/servicios/${editandoId}`, payload);
      } else {
        await post('/servicios', payload);
      }
      cerrarForm();
      await cargarTabla();
    } catch (err) {
      errorForm.textContent = err instanceof Error ? err.message : 'Error al guardar';
      errorForm.style.display = 'block';
    }
  });

  cargarTabla();
}
