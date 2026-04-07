import { clienteService } from '../../services/clienteService';
import { formatFecha } from '../../utils/formatters';
import type { Cliente } from '../../types';

export function ClientesPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Clientes</h1>
      <button class="btn btn-primario" id="btn-nuevo">+ Nuevo cliente</button>
    </div>

    <div id="form-cliente" class="card" style="display:none;margin-bottom:20px;max-width:500px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px" id="form-titulo">Nuevo cliente</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div class="form-grupo">
          <label class="form-label">Nombre</label>
          <input class="form-input" id="nombre" required />
        </div>
        <div class="form-grupo">
          <label class="form-label">Apellido</label>
          <input class="form-input" id="apellido" required />
        </div>
        <div class="form-grupo">
          <label class="form-label">Teléfono</label>
          <input class="form-input" id="telefono" required />
        </div>
        <div class="form-grupo">
          <label class="form-label">Email (opcional)</label>
          <input class="form-input" id="email" type="email" />
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primario" type="submit" id="btn-guardar">Guardar</button>
          <button class="btn btn-secundario" type="button" id="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div id="tabla-wrapper">Cargando...</div>
    </div>
  `;

  let editandoId: string | null = null;

  const formWrapper = document.getElementById('form-cliente') as HTMLDivElement;
  const errorForm = document.getElementById('error-form') as HTMLDivElement;
  const form = document.getElementById('form') as HTMLFormElement;
  const formTitulo = document.getElementById('form-titulo') as HTMLHeadingElement;

  function abrirFormNuevo(): void {
    editandoId = null;
    formTitulo.textContent = 'Nuevo cliente';
    (document.getElementById('nombre') as HTMLInputElement).value = '';
    (document.getElementById('apellido') as HTMLInputElement).value = '';
    (document.getElementById('telefono') as HTMLInputElement).value = '';
    (document.getElementById('email') as HTMLInputElement).value = '';
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
  }

  function abrirFormEditar(cliente: Cliente): void {
    editandoId = cliente.id;
    formTitulo.textContent = 'Editar cliente';
    (document.getElementById('nombre') as HTMLInputElement).value = cliente.nombre;
    (document.getElementById('apellido') as HTMLInputElement).value = cliente.apellido;
    (document.getElementById('telefono') as HTMLInputElement).value = cliente.telefono;
    (document.getElementById('email') as HTMLInputElement).value = cliente.email ?? '';
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
      const clientes = await clienteService.listar();

      if (clientes.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay clientes registrados</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${clientes.map(c => `
              <tr>
                <td><strong>${c.apellido}</strong>, ${c.nombre}</td>
                <td>${c.telefono}</td>
                <td>${c.email ?? '—'}</td>
                <td>${formatFecha(c.fechaRegistro)}</td>
                <td style="display:flex;gap:6px">
                  <button class="btn btn-secundario btn-sm btn-editar" data-id="${c.id}">Editar</button>
                  <button class="btn btn-peligro btn-sm btn-eliminar" data-id="${c.id}">Eliminar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
          const cliente = clientes.find(c => c.id === btn.dataset['id']);
          if (cliente) abrirFormEditar(cliente);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminár este cliente?')) return;
          await clienteService.eliminar(btn.dataset['id']!);
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
      apellido: (document.getElementById('apellido') as HTMLInputElement).value,
      telefono: (document.getElementById('telefono') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value || undefined,
    };

    try {
      if (editandoId) {
        await clienteService.actualizar(editandoId, payload);
      } else {
        await clienteService.crear(payload);
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
