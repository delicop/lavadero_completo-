// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegistrarPayload {
  nombreTenant: string;
  slug: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  rol: string;
  config?: {
    colorPrimario:   string | null;
    colorSidebar:    string | null;
    colorFondo:      string | null;
    colorSuperficie: string | null;
    nombreComercial: string | null;
    moneda:          string;
    zonaHoraria:     string;
  };
}

// ── Usuario ───────────────────────────────────────────────────────────────────

export type RolUsuario = 'superadmin' | 'admin' | 'trabajador';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  comisionPorcentaje: number;
  rol: RolUsuario;
  activo: boolean;
  disponible: boolean;
  tenantId: string | null;
  fechaRegistro: string;
}

export interface LoginLog {
  id: string;
  usuarioId: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  fechaHora: string;
}

// ── Cliente ───────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  cedula: string | null;
  email: string | null;
  fechaRegistro: string;
}

export interface VehiculoEnClientePayload {
  placa: string;
  tipo: TipoVehiculo;
  marca: string;
  modelo: string;
  color: string;
}

export interface CrearClientePayload {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  cedula?: string;
  vehiculo?: VehiculoEnClientePayload;
}

// ── Vehículo ──────────────────────────────────────────────────────────────────

export type TipoVehiculo = 'auto' | 'moto' | 'camioneta';

export interface Vehiculo {
  id: string;
  clienteId: string;
  cliente?: Cliente;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipo: TipoVehiculo;
  fechaRegistro: string;
}

export interface CrearVehiculoPayload {
  clienteId: string;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  tipo: TipoVehiculo;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export interface Servicio {
  id: string;
  tipoVehiculo: string;
  nombre: string;
  descripcion: string | null;
  duracionMinutos: number;
  precio: number;
  activo: boolean;
}

// ── Turno ─────────────────────────────────────────────────────────────────────

export type EstadoTurno = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';

export interface Turno {
  id: string;
  clienteId: string;
  cliente?: Cliente;
  vehiculoId: string;
  vehiculo?: Vehiculo;
  servicioId: string;
  servicio?: Servicio;
  trabajadorId: string;
  trabajador?: Usuario;
  fechaHora: string;
  estado: EstadoTurno;
  observaciones: string | null;
  fechaRegistro: string;
}

export interface CrearTurnoPayload {
  clienteId: string;
  vehiculoId: string;
  servicioId: string;
  trabajadorId: string;
  fechaHora: string;
  observaciones?: string;
}

// ── Factura ───────────────────────────────────────────────────────────────────

export type MetodoPago = 'efectivo' | 'transferencia' | 'debito' | 'credito';

export interface Factura {
  id: string;
  turnoId: string;
  turno?: Turno;
  total: number;
  metodoPago: MetodoPago;
  observaciones: string | null;
  fechaEmision: string;
}

// ── Liquidación ───────────────────────────────────────────────────────────────

export type EstadoLiquidacion = 'pendiente' | 'pagada';

export interface Liquidacion {
  id: string;
  trabajadorId: string;
  trabajador?: Usuario;
  fechaDesde: string;
  fechaHasta: string;
  cantidadTurnos: number;
  totalServicios: number;
  comisionPorcentaje: number;
  totalPago: number;
  estado: EstadoLiquidacion;
  fechaPago: string | null;
  fechaCreacion: string;
}

export interface CrearLiquidacionPayload {
  trabajadorId: string;
  fechaDesde: string;
  fechaHasta: string;
}

// ── Caja ──────────────────────────────────────────────────────────────────────

export type EstadoCajaDia = 'abierta' | 'cerrada';
export type TipoPagoCaja = 'efectivo' | 'transferencia';

export interface CajaDia {
  id: string;
  fecha: string;
  montoInicial: number;
  estado: EstadoCajaDia;
  usuarioAperturaId: string;
  usuarioCierreId: string | null;
  fechaApertura: string;
  fechaCierre: string | null;
  observaciones: string | null;
}

export interface GastoCaja {
  id: string;
  cajaDiaId: string;
  concepto: string;
  monto: number;
  tipoPago: TipoPagoCaja;
  fechaRegistro: string;
}

export interface IngresoManualCaja {
  id: string;
  cajaDiaId: string;
  concepto: string;
  monto: number;
  tipoPago: TipoPagoCaja;
  fechaRegistro: string;
}

export interface GananciaTrabajador {
  trabajadorId: string;
  nombre: string;
  apellido: string;
  comisionPorcentaje: number;
  totalServicios: number;
  ganancia: number;
}

export interface ResumenCaja {
  cajaDia: CajaDia;
  ingresos: {
    montoInicial: number;
    ventasEfectivo: number;
    ventasTransferencia: number;
    ingresosManual: number;
    total: number;
  };
  gastos: {
    efectivo: number;
    transferencia: number;
    total: number;
    lista: GastoCaja[];
  };
  ganancias: {
    trabajadores: GananciaTrabajador[];
    totalEmpleados: number;
    lavadero: number;
    totalDia: number;
  };
  ingresosManualLista: IngresoManualCaja[];
  facturasList?: Factura[];
}

export interface EstadoCaja {
  cajaHoy: CajaDia | null;
  cajaSinCerrar: CajaDia | null;
}

// ── Tenant / Configuración del negocio ───────────────────────────────────────

export interface TenantConfig {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  fechaCreacion: string;
  nombreComercial: string | null;
  logo: string | null;
  zonaHoraria: string;
  moneda: string;
  telefonoWhatsapp: string | null;
  emailContacto: string | null;
  direccion: string | null;
  colorPrimario: string | null;
  colorSidebar: string | null;
  colorFondo: string | null;
  colorSuperficie: string | null;
}

export interface ActualizarTenantConfigPayload {
  nombreComercial?: string;
  logo?: string;
  zonaHoraria?: string;
  moneda?: string;
  telefonoWhatsapp?: string;
  emailContacto?: string;
  direccion?: string;
  colorPrimario?: string;
  colorSidebar?: string;
  colorFondo?: string;
  colorSuperficie?: string;
}

// ── Superadmin ────────────────────────────────────────────────────────────────

export interface TenantConStats {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  fechaCreacion: string;
  nombreComercial: string | null;
  totalUsuarios: number;
  usuariosActivos: number;
}

export interface MetricasGlobales {
  totalTenants: number;
  tenantsActivos: number;
  totalUsuarios: number;
  usuariosActivos: number;
}

export interface UsuarioConTenant {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  disponible: boolean;
  fechaRegistro: string;
  tenantId: string;
  tenantNombre: string;
  tenantSlug: string;
}

// ── Reportes ──────────────────────────────────────────────────────────────────

export interface ReporteMetricas {
  ingresosPeriodo: number;
  turnosTotales: number;
  gananciaNeta: number;
  clientesNuevos: number;
}

export interface IngresoDiario {
  fecha: string;
  total: number;
}

export interface ServicioReporte {
  nombre: string;
  cantidad: number;
  total: number;
  porcentaje: number;
}

export interface ReporteData {
  metricas: ReporteMetricas;
  ingresosDiarios: IngresoDiario[];
  distribucionServicios: ServicioReporte[];
  rankingServicios: ServicioReporte[];
  tendencia: {
    periodoActual: number;
    periodoAnterior: number;
    variacion: number;
  };
  pl: {
    ingresos: number;
    ingresosPorVentas: number;
    ingresosManuales: number;
    gastosOperativos: number;
    comisionesDevengadas: number;
    liquidacionesPagadas: number;
    gananciaBruta: number;
    gananciaNeta: number;
  };
}

// ── Logs del sistema ──────────────────────────────────────────────────────────

export type TipoLog    = 'error' | 'advertencia' | 'info';
export type OrigenLog  = 'frontend' | 'backend';

export interface LogSistema {
  id: string;
  tenantId: string | null;
  usuarioId: string | null;
  tipo: TipoLog;
  origen: OrigenLog;
  mensaje: string;
  detalle: string | null;
  ruta: string | null;
  resuelto: boolean;
  fechaCreacion: string;
}

// ── Errores de la API ─────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}
