import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/factura.dart';

class FacturacionService {
  final ApiClient _api;
  FacturacionService(this._api);

  Future<Factura> facturar(
      String turnoId, String metodoPago, double total) async {
    final res = await _api.post(
      ApiEndpoints.facturacion,
      data: {'turnoId': turnoId, 'metodoPago': metodoPago, 'total': total},
    );
    return Factura.fromJson(res as Map<String, dynamic>);
  }

  /// Devuelve null si el turno aún no tiene factura (404), relanza otros errores.
  Future<Factura?> getFacturaPorTurno(String turnoId) async {
    try {
      final res = await _api.get(ApiEndpoints.facturacionPorTurno(turnoId));
      return Factura.fromJson(res as Map<String, dynamic>);
    } catch (e) {
      if (e is ApiException && e.statusCode == 404) return null;
      rethrow;
    }
  }
}
