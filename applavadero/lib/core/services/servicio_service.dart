import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/servicio.dart';

class ServicioService {
  final ApiClient _api;
  ServicioService(this._api);

  Future<List<Servicio>> getServicios() async {
    final res = await _api.get(ApiEndpoints.servicios);
    return (res as List).map((s) => Servicio.fromJson(s)).toList();
  }
}
