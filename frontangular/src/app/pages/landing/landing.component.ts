import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly modulos = [
    'Dashboard operativo', 'Gestión de turnos', 'Clientes y vehículos',
    'Catálogo de servicios', 'Facturación', 'Caja diaria',
    'Personal y comisiones', 'Liquidaciones', 'Asistencia',
    'Historial de caja', 'Tiempo real (WebSockets)', 'Alertas WhatsApp',
  ];

  readonly pasos = [
    { num: 1, titulo: 'Creá tu cuenta',       desc: 'Registrá el nombre de tu lavadero y elegí un link único. Listo en menos de 2 minutos.' },
    { num: 2, titulo: 'Configurá tu negocio', desc: 'Cargá tus servicios, precios y empleados. Definí las comisiones de cada uno.' },
    { num: 3, titulo: 'Comenzá a operar',     desc: 'Abrí la caja, cargá órdenes y cobrá. Desde hoy tenés todo bajo control.' },
  ];
}
