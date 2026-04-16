import 'package:flutter/material.dart';
import '../../core/models/usuario.dart';
import '../../core/services/auth_service.dart';

class PersonalProvider extends ChangeNotifier {
  final AuthService _authService;

  List<Usuario> usuarios = [];
  bool loading = false;
  String? error;

  PersonalProvider(this._authService);

  Future<void> cargar() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      usuarios = await _authService.getUsuarios();
    } catch (e) {
      error = 'No se pudo cargar el personal.';
    }
    loading = false;
    notifyListeners();
  }

  Future<bool> crear(Map<String, dynamic> data) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final nuevo = await _authService.crearUsuario(data);
      usuarios = [...usuarios, nuevo];
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> actualizar(String id, Map<String, dynamic> data) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final actualizado = await _authService.actualizarUsuario(id, data);
      usuarios = usuarios.map((u) => u.id == id ? actualizado : u).toList();
      loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      error = e.toString();
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> toggleActivo(Usuario u) async {
    // Optimista
    usuarios = usuarios
        .map((x) => x.id == u.id ? _copyWith(x, activo: !u.activo) : x)
        .toList();
    notifyListeners();
    try {
      await _authService.actualizarUsuario(u.id, {'activo': !u.activo});
    } catch (e) {
      // Revertir
      usuarios = usuarios
          .map((x) => x.id == u.id ? _copyWith(x, activo: u.activo) : x)
          .toList();
      error = 'Error al cambiar estado.';
      notifyListeners();
    }
  }

  Usuario _copyWith(Usuario u, {bool? activo}) {
    return Usuario(
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      activo: activo ?? u.activo,
      disponible: u.disponible,
      comisionPorcentaje: u.comisionPorcentaje,
    );
  }
}
