type Ruta = 'login' | 'dashboard' | 'mi-perfil' | 'clientes' | 'vehiculos' | 'servicios' | 'turnos' | 'configuracion' | 'liquidaciones' | 'asistencia';

type Handler = () => void;

const handlers: Partial<Record<Ruta, Handler>> = {};

export const router = {
  registrar(ruta: Ruta, handler: Handler): void {
    handlers[ruta] = handler;
  },

  navegar(ruta: Ruta): void {
    window.location.hash = ruta;
    handlers[ruta]?.();
  },

  rutaActual(): Ruta {
    const hash = window.location.hash.replace('#', '') as Ruta;
    return hash || 'login';
  },

  iniciar(): void {
    window.addEventListener('hashchange', () => {
      const ruta = router.rutaActual();
      handlers[ruta]?.();
    });
    handlers[router.rutaActual()]?.();
  },
};
