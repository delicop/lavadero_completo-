import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/caja.dart';

class CajaService {
  final ApiClient _api;
  CajaService(this._api);

  Future<EstadoCaja> getEstado() async {
    final res = await _api.get(ApiEndpoints.cajaEstado);
    return EstadoCaja.fromJson(res as Map<String, dynamic>);
  }

  Future<CajaDia> abrir(double montoInicial) async {
    final res = await _api
        .post(ApiEndpoints.cajaAbrir, data: {'montoInicial': montoInicial});
    return CajaDia.fromJson(res as Map<String, dynamic>);
  }

  Future<void> registrarGasto(String descripcion, double monto) async {
    await _api.post(ApiEndpoints.cajaGasto,
        data: {'concepto': descripcion, 'monto': monto, 'tipoPago': 'efectivo'});
  }

  Future<void> eliminarGasto(String id) async {
    await _api.delete(ApiEndpoints.cajaGastoEliminar(id));
  }

  Future<void> registrarIngreso(
      String descripcion, double monto, String metodo) async {
    await _api.post(ApiEndpoints.cajaIngresoManual, data: {
      'concepto': descripcion,
      'monto': monto,
      'tipoPago': metodo,
    });
  }

  Future<CajaDia> cerrar(String id) async {
    final res = await _api.post(ApiEndpoints.cajaCerrar(id));
    return CajaDia.fromJson(res as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getResumen(String id) async {
    final res = await _api.get(ApiEndpoints.cajaResumen(id));
    return res as Map<String, dynamic>;
  }
}
