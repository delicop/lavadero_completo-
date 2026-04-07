import './styles/global.css';
import { authService } from './services/authService';
import { sesionService } from './services/sesionService';
import { router } from './utils/router';
import { renderLayout, marcarNavActivo } from './components/common/Layout';
import { LoginPage } from './components/pages/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { MiPerfilPage } from './components/pages/MiPerfilPage';
import { ClientesPage } from './components/pages/ClientesPage';
import { VehiculosPage } from './components/pages/VehiculosPage';
import { ServiciosPage } from './components/pages/ServiciosPage';
import { TurnosPage } from './components/pages/TurnosPage';
import { ConfiguracionPage } from './components/pages/ConfiguracionPage';
import { LiquidacionesPage } from './components/pages/LiquidacionesPage';
import { AsistenciaPage } from './components/pages/AsistenciaPage';

const app = document.getElementById('app') as HTMLElement;
const rutasProtegidas = ['dashboard', 'mi-perfil', 'clientes', 'vehiculos', 'servicios', 'turnos', 'configuracion', 'liquidaciones', 'asistencia'];

// Helper: carga sesión si no está cargada y luego renderiza
async function protegida(render: () => void): Promise<void> {
  if (!authService.estaAutenticado()) { router.navegar('login'); return; }
  if (!sesionService.obtener()) await sesionService.cargar();
  render();
}

router.registrar('login', () => {
  if (authService.estaAutenticado()) { router.navegar('dashboard'); return; }
  app.innerHTML = '';
  LoginPage(app);
});

router.registrar('dashboard', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('dashboard');
    DashboardPage(contenido);
  })
);

router.registrar('mi-perfil', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('mi-perfil');
    MiPerfilPage(contenido);
  })
);

router.registrar('clientes', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('clientes');
    ClientesPage(contenido);
  })
);

router.registrar('vehiculos', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('vehiculos');
    VehiculosPage(contenido);
  })
);

router.registrar('servicios', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('servicios');
    ServiciosPage(contenido);
  })
);

router.registrar('turnos', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('turnos');
    TurnosPage(contenido);
  })
);

router.registrar('configuracion', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('configuracion');
    ConfiguracionPage(contenido);
  })
);

router.registrar('liquidaciones', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('liquidaciones');
    LiquidacionesPage(contenido);
  })
);

router.registrar('asistencia', () =>
  protegida(() => {
    const contenido = renderLayout(app);
    marcarNavActivo('asistencia');
    AsistenciaPage(contenido);
  })
);

if (rutasProtegidas.includes(router.rutaActual()) && !authService.estaAutenticado()) {
  router.navegar('login');
} else {
  router.iniciar();
}
