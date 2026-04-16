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

  Future<CajaDia> abrir(double montoInicial, {String? observaciones}) async {
    final data = <String, dynamic>{'montoInicial': montoInicial};
    if (observaciones != null && observaciones.isNotEmpty) {
      data['observaciones'] = observaciones;
    }
    final res = await _api.post(ApiEndpoints.cajaAbrir, data: data);
    return CajaDia.fromJson(res as Map<String, dynamic>);
  }

  Future<GastoCaja> registrarGasto(
      String concepto, double monto, String tipoPago) async {
    final res = await _api.post(ApiEndpoints.cajaGasto,
        data: {'concepto': concepto, 'monto': monto, 'tipoPago': tipoPago});
    return GastoCaja.fromJson(res as Map<String, dynamic>);
  }

  Future<void> eliminarGasto(String id) async {
    await _api.delete(ApiEndpoints.cajaGastoEliminar(id));
  }

  Future<IngresoManualCaja> registrarIngreso(
      String concepto, double monto, String tipoPago) async {
    final res = await _api.post(ApiEndpoints.cajaIngresoManual, data: {
      'concepto': concepto,
      'monto': monto,
      'tipoPago': tipoPago,
    });
    return IngresoManualCaja.fromJson(res as Map<String, dynamic>);
  }

  Future<void> eliminarIngreso(String id) async {
    await _api.delete(ApiEndpoints.cajaIngresoEliminar(id));
  }

  Future<CajaDia> cerrar(String id) async {
    final res = await _api.post(ApiEndpoints.cajaCerrar(id));
    return CajaDia.fromJson(res as Map<String, dynamic>);
  }

  Future<CajaDia> reabrir(String id) async {
    final res = await _api.post(ApiEndpoints.cajaReabrir(id));
    return CajaDia.fromJson(res as Map<String, dynamic>);
  }

  Future<ResumenCaja> getResumen(String id) async {
    final res = await _api.get(ApiEndpoints.cajaResumen(id));
    return ResumenCaja.fromJson(res as Map<String, dynamic>);
  }
}
