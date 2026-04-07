import { get, post, patch } from '../../services/api';
import type { Usuario, RolUsuario } from '../../types';

export function ConfiguracionPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="barra-acciones">
      <h1 class="pagina-titulo" style="margin:0">Configuración — Trabajadores</h1>
      <button class="btn btn-primario" id="btn-nuevo">+ Nuevo trabajador</button>
    </div>

    <div id="form-trabajador" class="card" style="display:none;margin-bottom:20px;max-width:500px">
      <h2 style="font-size:1rem;font-weight:600;margin-bottom:16px" id="form-titulo">Nuevo trabajador</h2>
      <div id="error-form" class="alerta-error" style="display:none"></div>
      <form id="form">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Nombre</label>
            <input class="form-input" id="nombre" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Apellido</label>
            <input class="form-input" id="apellido" required />
          </div>
        </div>
        <div class="form-grupo">
          <label class="form-label">Email</label>
          <input class="form-input" id="email" type="email" required />
        </div>
        <div id="campo-password">
          <div class="form-grupo">
            <label class="form-label">Contraseña</label>
            <input class="form-input" id="password" type="password" minlength="8" />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-grupo">
            <label class="form-label">Rol</label>
            <select class="form-select" id="rol">
              <option value="trabajador">Trabajador</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-grupo" id="campo-comision">
            <label class="form-label">Comisión (%)</label>
            <input class="form-input" id="comision" type="number" min="0" max="100" step="0.5" value="50" />
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

  const formWrapper    = document.getElementById('form-trabajador') as HTMLDivElement;
  const errorForm      = document.getElementById('error-form') as HTMLDivElement;
  const form           = document.getElementById('form') as HTMLFormElement;
  const formTitulo     = document.getElementById('form-titulo') as HTMLHeadingElement;
  const campoPwd       = document.getElementById('campo-password') as HTMLDivElement;
  const inputPwd       = document.getElementById('password') as HTMLInputElement;
  const campoComision  = document.getElementById('campo-comision') as HTMLDivElement;
  const selectRol      = document.getElementById('rol') as HTMLSelectElement;

  function actualizarVisibilidadComision(): void {
    campoComision.style.display = selectRol.value === 'admin' ? 'none' : '';
  }

  selectRol.addEventListener('change', actualizarVisibilidadComision);

  function abrirFormNuevo(): void {
    editandoId = null;
    formTitulo.textContent = 'Nuevo trabajador';
    form.reset();
    (document.getElementById('comision') as HTMLInputElement).value = '50';
    campoPwd.style.display = 'block';
    inputPwd.required = true;
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
    actualizarVisibilidadComision();
  }

  function abrirFormEditar(u: Usuario): void {
    editandoId = u.id;
    formTitulo.textContent = 'Editar ' + (u.rol === 'admin' ? 'administrador' : 'trabajador');
    (document.getElementById('nombre') as HTMLInputElement).value = u.nombre;
    (document.getElementById('apellido') as HTMLInputElement).value = u.apellido;
    (document.getElementById('email') as HTMLInputElement).value = u.email;
    selectRol.value = u.rol;
    (document.getElementById('comision') as HTMLInputElement).value = String(u.comisionPorcentaje);
    campoPwd.style.display = 'none';
    inputPwd.required = false;
    inputPwd.value = '';
    errorForm.style.display = 'none';
    formWrapper.style.display = 'block';
    actualizarVisibilidadComision();
    formWrapper.scrollIntoView({ behavior: 'smooth' });
  }

  function cerrarForm(): void {
    formWrapper.style.display = 'none';
    editandoId = null;
  }

  async function toggleActivo(u: Usuario): Promise<void> {
    await patch(`/usuarios/${u.id}`, { activo: !u.activo });
    await cargarTabla();
  }

  async function cargarTabla(): Promise<void> {
    const wrapper = document.getElementById('tabla-wrapper') as HTMLDivElement;
    try {
      const usuarios = await get<Usuario[]>('/usuarios');

      if (usuarios.length === 0) {
        wrapper.innerHTML = '<p style="color:var(--color-texto-suave);text-align:center;padding:24px">No hay usuarios registrados</p>';
        return;
      }

      wrapper.innerHTML = `
        <table class="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Comisión</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map(u => `
              <tr>
                <td><strong>${u.apellido}</strong>, ${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="badge" style="background:#e0f2fe;color:#0369a1">${u.rol}</span></td>
                <td>${u.rol === 'admin' ? '<span style="color:var(--color-texto-suave)">—</span>' : `<strong>${u.comisionPorcentaje}%</strong>`}</td>
                <td>
                  <button class="btn btn-sm btn-toggle ${u.activo ? 'btn-secundario' : 'btn-primario'}" data-id="${u.id}">
                    ${u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
                <td>
                  <button class="btn btn-secundario btn-sm btn-editar" data-id="${u.id}">Editar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const u = usuarios.find(x => x.id === btn.dataset['id']);
          if (u) toggleActivo(u);
        });
      });

      wrapper.querySelectorAll<HTMLButtonElement>('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => {
          const u = usuarios.find(x => x.id === btn.dataset['id']);
          if (u) abrirFormEditar(u);
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

    const rolSeleccionado = selectRol.value as RolUsuario;
    const esAdmin  = rolSeleccionado === 'admin';
    const comision = Number((document.getElementById('comision') as HTMLInputElement).value);
    const password = inputPwd.value;

    try {
      if (editandoId) {
        const payload: Record<string, unknown> = {
          nombre:   (document.getElementById('nombre') as HTMLInputElement).value,
          apellido: (document.getElementById('apellido') as HTMLInputElement).value,
          rol:      rolSeleccionado,
        };
        if (!esAdmin) payload['comisionPorcentaje'] = comision;
        if (password) payload['password'] = password;
        await patch(`/usuarios/${editandoId}`, payload);
      } else {
        const payload: Record<string, unknown> = {
          nombre:   (document.getElementById('nombre') as HTMLInputElement).value,
          apellido: (document.getElementById('apellido') as HTMLInputElement).value,
          email:    (document.getElementById('email') as HTMLInputElement).value,
          password,
          rol:      rolSeleccionado,
        };
        if (!esAdmin) payload['comisionPorcentaje'] = comision;
        await post('/usuarios', payload);
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
