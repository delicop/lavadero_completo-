import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/usuario.dart';

class AuthService {
  final ApiClient _api;
  AuthService(this._api);

  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await _api.post(ApiEndpoints.login, data: {
      'email': email,
      'password': password,
    });
    return res as Map<String, dynamic>;
  }

  Future<Usuario> getMe() async {
    final res = await _api.get(ApiEndpoints.me);
    return Usuario.fromJson(res as Map<String, dynamic>);
  }

  Future<void> cambiarPassword(String actual, String nueva) async {
    await _api.patch(ApiEndpoints.cambiarPassword, data: {
      'passwordActual': actual,
      'passwordNueva': nueva,
    });
  }

  Future<List<Usuario>> getUsuarios() async {
    final res = await _api.get(ApiEndpoints.usuarios);
    return (res as List).map((u) => Usuario.fromJson(u)).toList();
  }

  Future<Usuario> crearUsuario(Map<String, dynamic> data) async {
    final res = await _api.post(ApiEndpoints.usuarios, data: data);
    return Usuario.fromJson(res as Map<String, dynamic>);
  }

  Future<Usuario> actualizarUsuario(String id, Map<String, dynamic> data) async {
    final res = await _api.patch(ApiEndpoints.usuarioDetalle(id), data: data);
    return Usuario.fromJson(res as Map<String, dynamic>);
  }
}
