import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { sesionResolver } from './core/resolvers/sesion.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    resolve: { sesion: sesionResolver },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'mi-perfil',
        loadComponent: () =>
          import('./pages/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then(m => m.ClientesComponent),
      },
      {
        path: 'vehiculos',
        loadComponent: () =>
          import('./pages/vehiculos/vehiculos.component').then(m => m.VehiculosComponent),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent),
      },
      {
        path: 'turnos',
        loadComponent: () =>
          import('./pages/turnos/turnos.component').then(m => m.TurnosComponent),
      },
      {
        path: 'liquidaciones',
        loadComponent: () =>
          import('./pages/liquidaciones/liquidaciones.component').then(m => m.LiquidacionesComponent),
      },
      {
        path: 'asistencia',
        loadComponent: () =>
          import('./pages/asistencia/asistencia.component').then(m => m.AsistenciaComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
      },
      {
        path: 'caja',
        loadComponent: () =>
          import('./pages/caja/caja.component').then(m => m.CajaComponent),
      },
      {
        path: 'facturacion',
        loadComponent: () =>
          import('./pages/facturacion/facturacion.component').then(m => m.FacturacionComponent),
      },
      {
        path: 'historial-caja',
        loadComponent: () =>
          import('./pages/historial-caja/historial-caja.component').then(m => m.HistorialCajaComponent),
      },
      {
        path: 'gastos',
        loadComponent: () =>
          import('./pages/gastos/gastos.component').then(m => m.GastosComponent),
      },
      {
        path: 'otros-ingresos',
        loadComponent: () =>
          import('./pages/otros-ingresos/otros-ingresos.component').then(m => m.OtrosIngresosComponent),
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./pages/cotizaciones/cotizaciones.component').then(m => m.CotizacionesComponent),
      },
      {
        path: 'configuracion-negocio',
        loadComponent: () =>
          import('./pages/configuracion-negocio/configuracion-negocio.component').then(m => m.ConfiguracionNegocioComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
