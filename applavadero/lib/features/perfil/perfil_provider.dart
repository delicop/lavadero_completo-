import 'package:flutter/material.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/services/auth_service.dart';

class PerfilProvider extends ChangeNotifier {
  final AuthProvider _authProvider;
  final AuthService _authService;

  bool loading = false;
  String? error;
  String? exito;

  PerfilProvider(this._authProvider, this._authService);

  Future<void> cambiarPassword(String actual, String nueva) async {
    loading = true;
    error = null;
    exito = null;
    notifyListeners();
    try {
      await _authService.cambiarPassword(actual, nueva);
      exito = 'Contraseña actualizada correctamente';
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> logout() => _authProvider.logout();
}
