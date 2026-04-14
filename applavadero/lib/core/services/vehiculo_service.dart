import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/vehiculo.dart';

class VehiculoService {
  final ApiClient _api;
  VehiculoService(this._api);

  Future<List<Vehiculo>> getVehiculos(String clienteId) async {
    final res =
        await _api.get(ApiEndpoints.vehiculosCliente(clienteId));
    return (res as List).map((v) => Vehiculo.fromJson(v)).toList();
  }

  Future<Vehiculo> crearVehiculo(Map<String, dynamic> data) async {
    final res = await _api.post(ApiEndpoints.vehiculos, data: data);
    return Vehiculo.fromJson(res as Map<String, dynamic>);
  }
}
