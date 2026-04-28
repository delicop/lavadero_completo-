import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../core/services/tenant.service';
import { ThemeService } from '../../core/services/theme.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
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

const COLORES_ACCION = [
  { label: 'Azul',        value: '#2563eb' },
  { label: 'Violeta',     value: '#7c3aed' },
  { label: 'Rosa',        value: '#db2777' },
  { label: 'Rojo',        value: '#dc2626' },
  { label: 'Naranja',     value: '#d97706' },
  { label: 'Verde',       value: '#16a34a' },
  { label: 'Cyan',        value: '#0891b2' },
  { label: 'Gris oscuro', value: '#374151' },
];

const COLORES_SIDEBAR = [
  { label: 'Blanco',       value: '#ffffff' },
  { label: 'Gris claro',   value: '#f8fafc' },
  { label: 'Gris',         value: '#e2e8f0' },
  { label: 'Gris oscuro',  value: '#1e293b' },
  { label: 'Negro',        value: '#0f172a' },
  { label: 'Azul oscuro',  value: '#1e3a8a' },
  { label: 'Verde oscuro', value: '#14532d' },
  { label: 'Violeta',      value: '#3b0764' },
];

const COLORES_FONDO = [
  { label: 'Blanco roto',  value: '#f8fafc' },
  { label: 'Blanco puro',  value: '#ffffff' },
  { label: 'Gris suave',   value: '#f1f5f9' },
  { label: 'Gris medio',   value: '#e2e8f0' },
  { label: 'Cálido',       value: '#fafaf9' },
  { label: 'Azul suave',   value: '#eff6ff' },
  { label: 'Verde suave',  value: '#f0fdf4' },
  { label: 'Violeta suave',value: '#faf5ff' },
];

const COLORES_SUPERFICIE = [
  { label: 'Blanco puro',  value: '#ffffff' },
  { label: 'Blanco roto',  value: '#f8fafc' },
  { label: 'Gris muy claro', value: '#f1f5f9' },
  { label: 'Cálido',       value: '#fafaf9' },
  { label: 'Azul muy suave', value: '#f0f7ff' },
  { label: 'Verde muy suave', value: '#f0fdf4' },
  { label: 'Amarillo suave', value: '#fefce8' },
  { label: 'Violeta suave', value: '#faf5ff' },
];

@Component({
  selector: 'app-configuracion-negocio',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './configuracion-negocio.component.html',
})
export class ConfiguracionNegocioComponent implements OnInit {
  private readonly tenantSvc = inject(TenantService);
  private readonly tema      = inject(ThemeService);

  readonly zonasHorarias    = ZONAS_HORARIAS;
  readonly monedas          = MONEDAS;
  readonly coloresAccion     = COLORES_ACCION;
  readonly coloresSidebar    = COLORES_SIDEBAR;
  readonly coloresFondo      = COLORES_FONDO;
  readonly coloresSuperficie = COLORES_SUPERFICIE;

  config: TenantConfig | null = null;
  cargando  = true;
  guardando = false;
  mensaje   = '';
  mensajeTipo: 'ok' | 'error' = 'ok';

  // Modal de personalización
  modalPersonalizar = false;

  // Campos del formulario general
  nombreComercial  = '';
  logo             = '';
  zonaHoraria      = 'America/Bogota';
  moneda           = 'COP';
  telefonoWhatsapp = '';
  emailContacto    = '';
  direccion        = '';

  // Campos de personalización visual
  colorPrimario   = '#3b82f6';
  colorSidebar    = '#1e293b';
  colorFondo      = '#f1f5f9';
  colorSuperficie = '#ffffff';

  async ngOnInit(): Promise<void> {
    try {
      this.config = await this.tenantSvc.obtenerConfig();
      this.nombreComercial  = this.config.nombreComercial ?? '';
      this.logo             = this.config.logo ?? '';
      this.zonaHoraria      = this.config.zonaHoraria;
      this.moneda           = this.config.moneda;
      this.telefonoWhatsapp = this.config.telefonoWhatsapp ?? '';
      this.emailContacto    = this.config.emailContacto ?? '';
      this.direccion        = this.config.direccion ?? '';
      this.colorPrimario    = this.config.colorPrimario   ?? '#3b82f6';
      this.colorSidebar     = this.config.colorSidebar    ?? '#1e293b';
      this.colorFondo       = this.config.colorFondo      ?? '#f1f5f9';
      this.colorSuperficie  = this.config.colorSuperficie ?? '#ffffff';
    } catch {
      this.mensaje = 'No se pudo cargar la configuración';
      this.mensajeTipo = 'error';
    } finally {
      this.cargando = false;
    }
  }

  // ── Preview en tiempo real ─────────────────────────────────────────

  previewPrimario(color: string): void {
    this.colorPrimario = color;
    this.tema.aplicar({ colorPrimario: color, colorSidebar: this.colorSidebar, colorFondo: this.colorFondo, colorSuperficie: this.colorSuperficie });
  }

  previewSidebar(color: string): void {
    this.colorSidebar = color;
    this.tema.aplicar({ colorPrimario: this.colorPrimario, colorSidebar: color, colorFondo: this.colorFondo, colorSuperficie: this.colorSuperficie });
  }

  previewFondo(color: string): void {
    this.colorFondo = color;
    this.tema.aplicar({ colorPrimario: this.colorPrimario, colorSidebar: this.colorSidebar, colorFondo: color, colorSuperficie: this.colorSuperficie });
  }

  previewSuperficie(color: string): void {
    this.colorSuperficie = color;
    this.tema.aplicar({ colorPrimario: this.colorPrimario, colorSidebar: this.colorSidebar, colorFondo: this.colorFondo, colorSuperficie: color });
  }

  // ── Guardar ────────────────────────────────────────────────────────

  async guardar(): Promise<void> {
    this.mensaje  = '';
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
        colorPrimario:    this.colorPrimario,
        colorSidebar:     this.colorSidebar,
        colorFondo:       this.colorFondo,
        colorSuperficie:  this.colorSuperficie,
      });
      this.tema.aplicar({
        colorPrimario:   this.colorPrimario,
        colorSidebar:    this.colorSidebar,
        colorFondo:      this.colorFondo,
        colorSuperficie: this.colorSuperficie,
      });
      this.mensaje = 'Configuración guardada correctamente';
      this.mensajeTipo = 'ok';
      this.modalPersonalizar = false;
    } catch {
      this.mensaje = 'Error al guardar la configuración';
      this.mensajeTipo = 'error';
    } finally {
      this.guardando = false;
    }
  }
}
