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
}
