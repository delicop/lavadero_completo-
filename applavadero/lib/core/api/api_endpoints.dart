// IP local de la PC en la red WiFi.
// El teléfono y la PC deben estar conectados al mismo WiFi.
const String kBaseUrl = 'http://192.168.1.10:3000';

class ApiEndpoints {
  static const String login = '/api/auth/login';
  static const String me = '/api/auth/me';
  static const String cambiarPassword = '/api/auth/cambiar-password';

  static const String turnos = '/api/turnos';
  static String turnoDetalle(String id) => '/api/turnos/$id';
  static String turnoEstado(String id) => '/api/turnos/$id/estado';

  static const String clientes = '/api/clientes';
  static String clienteDetalle(String id) => '/api/clientes/$id';

  static const String vehiculos = '/api/vehiculos';
  static String vehiculosCliente(String clienteId) =>
      '/api/vehiculos/cliente/$clienteId';

  static const String servicios = '/api/servicios';

  static const String cajaEstado = '/api/caja/estado';
  static const String cajaAbrir = '/api/caja/abrir';
  static String cajaResumen(String id) => '/api/caja/resumen/$id';
  static const String cajaGasto = '/api/caja/gastos';
  static String cajaGastoEliminar(String id) => '/api/caja/gastos/$id';
  static const String cajaIngresoManual = '/api/caja/ingresos-manuales';
  static String cajaCerrar(String id) => '/api/caja/cerrar/$id';

  static const String usuarios = '/api/usuarios';
  static String usuarioDetalle(String id) => '/api/usuarios/$id';

  static const String facturacion = '/api/facturacion';
  static String facturacionPorTurno(String turnoId) =>
      '/api/facturacion/turno/$turnoId';
}
