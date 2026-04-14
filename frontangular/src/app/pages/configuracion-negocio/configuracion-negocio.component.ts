import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/services/tenant.service';
import type { TenantConfig } from '../../shared/types';

const ZONAS_HORARIAS = [
  { label: 'Colombia (UTC-5)', value: 'America/Bogota' },
  { label: 'México Centro (UTC-6)', value: 'America/Mexico_City' },
  { label: 'Argentina (UTC-3)', value: 'America/Argentina/Buenos_Aires' },
  { label: 'Chile (UTC-3/-4)', value: 'America/Santiago' },
  { label: 'Perú (UTC-5)', value: 'America/Lima' },
  { label: 'Ecuador (UTC-5)', value: 'America/Guayaquil' },
  { label: 'Venezuela (UTC-4)', value: 'America/Caracas' },
  { label: 'Uruguay (UTC-3)', value: 'America/Montevideo' },
  { label: 'Paraguay (UTC-4)', value: 'America/Asuncion' },
  { label: 'Bolivia (UTC-4)', value: 'America/La_Paz' },
  { label: 'España (UTC+1/+2)', value: 'Europe/Madrid' },
];

const MONEDAS = [
  { label: 'COP — Peso colombiano', value: 'COP' },
  { label: 'MXN — Peso mexicano', value: 'MXN' },
  { label: 'ARS — Peso argentino', value: 'ARS' },
  { label: 'CLP — Peso chileno', value: 'CLP' },
  { label: 'PEN — Sol peruano', value: 'PEN' },
  { label: 'USD — Dólar', value: 'USD' },
  { label: 'EUR — Euro', value: 'EUR' },
];

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-negocio.component.html',
})
export class ConfiguracionNegocioComponent implements OnInit {
  private readonly tenantSvc = inject(TenantService);

  readonly zonasHorarias = ZONAS_HORARIAS;
  readonly monedas = MONEDAS;

  config: TenantConfig | null = null;
  cargando = true;
  guardando = false;
  mensaje = '';
  mensajeTipo: 'ok' | 'error' = 'ok';

  // Campos del formulario
  nombreComercial = '';
  logo = '';
  zonaHoraria = 'America/Bogota';
  moneda = 'COP';
  telefonoWhatsapp = '';
  emailContacto = '';
  direccion = '';

  async ngOnInit(): Promise<void> {
    try {
      this.config = await this.tenantSvc.obtenerConfig();
      this.nombreComercial = this.config.nombreComercial ?? '';
      this.logo            = this.config.logo ?? '';
      this.zonaHoraria     = this.config.zonaHoraria;
      this.moneda          = this.config.moneda;
      this.telefonoWhatsapp = this.config.telefonoWhatsapp ?? '';
      this.emailContacto   = this.config.emailContacto ?? '';
      this.direccion       = this.config.direccion ?? '';
    } catch {
      this.mensaje = 'No se pudo cargar la configuración';
      this.mensajeTipo = 'error';
    } finally {
      this.cargando = false;
    }
  }

  async guardar(): Promise<void> {
    this.mensaje = '';
    this.guardando = true;
    try {
      this.config = await this.tenantSvc.actualizarConfig({
        nombreComercial:  this.nombreComercial || undefined,
        logo:             this.logo || undefined,
        zonaHoraria:      this.zonaHoraria,
        moneda:           this.moneda,
        telefonoWhatsapp: this.telefonoWhatsapp || undefined,
        emailContacto:    this.emailContacto || undefined,
        direccion:        this.direccion || undefined,
      });
      this.mensaje = 'Configuración guardada correctamente';
      this.mensajeTipo = 'ok';
    } catch {
      this.mensaje = 'Error al guardar la configuración';
      this.mensajeTipo = 'error';
    } finally {
      this.guardando = false;
    }
  }
}
