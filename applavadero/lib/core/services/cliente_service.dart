import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/cliente.dart';

class ClienteService {
  final ApiClient _api;
  ClienteService(this._api);

  Future<List<Cliente>> getClientes() async {
    final res = await _api.get(ApiEndpoints.clientes);
    return (res as List).map((c) => Cliente.fromJson(c)).toList();
  }

  Future<Cliente> getCliente(String id) async {
    final res = await _api.get(ApiEndpoints.clienteDetalle(id));
    return Cliente.fromJson(res as Map<String, dynamic>);
  }

  Future<Cliente> crearCliente(Map<String, dynamic> data) async {
    final res = await _api.post(ApiEndpoints.clientes, data: data);
    return Cliente.fromJson(res as Map<String, dynamic>);
  }
}
