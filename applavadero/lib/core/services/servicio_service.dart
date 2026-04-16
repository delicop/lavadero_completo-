import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/servicio.dart';

class ServicioService {
  final ApiClient _api;
  ServicioService(this._api);

  Future<List<Servicio>> getServicios({bool soloActivos = false}) async {
    final res = await _api.get(ApiEndpoints.servicios,
        queryParameters: soloActivos ? {'soloActivos': 'true'} : null);
    return (res as List).map((s) => Servicio.fromJson(s)).toList();
  }

  Future<Servicio> crear(Map<String, dynamic> data) async {
    final res = await _api.post(ApiEndpoints.servicios, data: data);
    return Servicio.fromJson(res as Map<String, dynamic>);
  }

  Future<Servicio> actualizar(String id, Map<String, dynamic> data) async {
    final res = await _api.patch(ApiEndpoints.servicioDetalle(id), data: data);
    return Servicio.fromJson(res as Map<String, dynamic>);
  }

  Future<void> eliminar(String id) async {
    await _api.delete(ApiEndpoints.servicioDetalle(id));
  }
}
