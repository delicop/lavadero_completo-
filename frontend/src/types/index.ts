// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

// ── Usuario ───────────────────────────────────────────────────────────────────

export type RolUsuario = 'admin' | 'trabajador';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  comisionPorcentaje: number;
  rol: RolUsuario;
  activo: boolean;
  disponible: boolean;
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
  email: string | null;
  fechaRegistro: string;
}

export interface CrearClientePayload {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
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

// ── Respuesta de error de la API ───────────────────────────────────────────────

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}
