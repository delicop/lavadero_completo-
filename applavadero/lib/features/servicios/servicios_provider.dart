import 'package:flutter/material.dart';
import '../../core/models/servicio.dart';
import '../../core/services/servicio_service.dart';

class ServiciosProvider extends ChangeNotifier {
  final ServicioService _servicioService;

  List<Servicio> servicios = [];
  bool loading = false;
  String? error;

  ServiciosProvider(this._servicioService);

  Future<void> cargar() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      servicios = await _servicioService.getServicios();
    } catch (e) {
      error = 'No se pudo cargar los servicios.';
    }
    loading = false;
    notifyListeners();
  }

  Future<bool> crear(Map<String, dynamic> data) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final nuevo = await _servicioService.crear(data);
      servicios = [...servicios, nuevo];
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
      final actualizado = await _servicioService.actualizar(id, data);
      servicios = servicios.map((s) => s.id == id ? actualizado : s).toList();
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

  Future<void> toggleActivo(Servicio s) async {
    // Optimista
    servicios = servicios
        .map((x) => x.id == s.id ? _copyWith(x, activo: !s.activo) : x)
        .toList();
    notifyListeners();
    try {
      await _servicioService.actualizar(s.id, {'activo': !s.activo});
    } catch (e) {
      servicios = servicios
          .map((x) => x.id == s.id ? _copyWith(x, activo: s.activo) : x)
          .toList();
      error = 'Error al cambiar estado.';
      notifyListeners();
    }
  }

  Future<void> eliminar(String id) async {
    servicios = servicios.where((s) => s.id != id).toList();
    notifyListeners();
    try {
      await _servicioService.eliminar(id);
    } catch (e) {
      error = 'Error al eliminar el servicio.';
      await cargar();
    }
  }

  Servicio _copyWith(Servicio s, {bool? activo}) {
    return Servicio(
      id: s.id,
      nombre: s.nombre,
      descripcion: s.descripcion,
      duracionMinutos: s.duracionMinutos,
      precio: s.precio,
      tipoVehiculo: s.tipoVehiculo,
      activo: activo ?? s.activo,
    );
  }
}
