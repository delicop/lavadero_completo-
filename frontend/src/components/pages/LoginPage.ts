import { authService } from '../../services/authService';
import { router } from '../../utils/router';

export function LoginPage(contenedor: HTMLElement): void {
  contenedor.innerHTML = `
    <div class="login-wrapper">
      <div class="card login-card">
        <h1 class="login-titulo">Lavadero</h1>
        <div id="error-login" class="alerta-error" style="display:none"></div>
        <form id="form-login">
          <div class="form-grupo">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" id="email" placeholder="admin@lavadero.com" required />
          </div>
          <div class="form-grupo">
            <label class="form-label">Contraseña</label>
            <input class="form-input" type="password" id="password" placeholder="••••••••" required />
          </div>
          <button class="btn btn-primario" style="width:100%;justify-content:center" type="submit" id="btn-login">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('form-login') as HTMLFormElement;
  const errorEl = document.getElementById('error-login') as HTMLDivElement;
  const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.textContent = 'Ingresando...';

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      await authService.login({ email, password });
      router.navegar('clientes');
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : 'Error al iniciar sesión';
      errorEl.style.display = 'block';
    } finally {
      btnLogin.disabled = false;
      btnLogin.textContent = 'Ingresar';
    }
  });
}
