import 'package:flutter/material.dart';
import 'dart:async';
import '../../core/models/turno.dart';
import '../../core/services/turno_service.dart';
import '../../core/services/realtime_service.dart';
import '../../shared/utils/formatters.dart';

class TurnosProvider extends ChangeNotifier {
  final TurnoService _turnoService;
  final RealtimeService _realtimeService;

  List<Turno> turnos = [];
  bool loading = false;
  String? error;
  String fechaFiltro = fechaHoyIso();
  String? estadoFiltro;
  StreamSubscription? _sub;

  TurnosProvider(this._turnoService, this._realtimeService) {
    _sub = _realtimeService.onTurnoActualizado.listen((_) => cargar());
  }

  Future<void> cargar() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      turnos = await _turnoService.getTurnos(
        fechaDesde: fechaFiltro,
        fechaHasta: fechaFiltro,
        estado: estadoFiltro,
      );
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  void setFecha(String fecha) {
    fechaFiltro = fecha;
    cargar();
  }

  void setEstado(String? estado) {
    estadoFiltro = estado;
    cargar();
  }

  Future<void> cambiarEstado(String id, String estado) async {
    try {
      final actualizado = await _turnoService.cambiarEstado(id, estado);
      final idx = turnos.indexWhere((t) => t.id == id);
      if (idx != -1) {
        turnos[idx] = actualizado;
        notifyListeners();
      }
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
