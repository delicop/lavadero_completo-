import 'package:flutter/material.dart';
import '../models/usuario.dart';
import '../auth/token_storage.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final TokenStorage _tokenStorage;
  final AuthService _authService;

  Usuario? _usuario;
  bool _loading = false;
  String? _error;

  AuthProvider(this._tokenStorage, this._authService);

  Usuario? get usuario => _usuario;
  bool get loading => _loading;
  String? get error => _error;
  bool get estaAutenticado => _usuario != null;

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _authService.login(email, password);
      final token = res['accessToken'] as String;

      await _tokenStorage.save(token);
      _usuario = await _authService.getMe();
      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _tokenStorage.delete();
    _usuario = null;
    notifyListeners();
  }

  Future<bool> verificarSesion() async {
    final token = await _tokenStorage.read();
    if (token == null) return false;
    try {
      _usuario = await _authService.getMe();
      notifyListeners();
      return true;
    } catch (_) {
      await _tokenStorage.delete();
      return false;
    }
  }
}
