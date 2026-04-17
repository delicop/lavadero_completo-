import 'package:flutter/material.dart';
import 'dart:async';
import '../../core/models/turno.dart';
import '../../core/services/turno_service.dart';
import '../../core/services/realtime_service.dart';
import '../../shared/utils/formatters.dart';

class DashboardProvider extends ChangeNotifier {
  final TurnoService _turnoService;
  final RealtimeService _realtimeService;

  List<Turno> turnos = [];
  bool loading = false;
  String? error;
  String? _trabajadorId;
  StreamSubscription? _sub;

  DashboardProvider(this._turnoService, this._realtimeService) {
    _sub = _realtimeService.onTurnoActualizado.listen((_) => cargar(trabajadorId: _trabajadorId));
  }

  List<Turno> get enProceso =>
      turnos.where((t) => t.estado == 'en_proceso').toList();
  List<Turno> get pendientes =>
      turnos.where((t) => t.estado == 'pendiente').toList();
  double get totalDia => turnos
      .where((t) => t.estado == 'completado')
      .fold(0, (sum, t) => sum + (t.servicio?.precio ?? 0));

  Future<void> cargar({String? trabajadorId}) async {
    if (trabajadorId != null) _trabajadorId = trabajadorId;
    loading = true;
    error = null;
    notifyListeners();
    try {
      final hoy = fechaHoyIso();
      if (trabajadorId != null) {
        turnos = await _turnoService.getTurnosPorTrabajador(
          trabajadorId,
          fechaDesde: hoy,
          fechaHasta: hoy,
        );
      } else {
        turnos = await _turnoService.getTurnos(
          fechaDesde: hoy,
          fechaHasta: hoy,
        );
      }
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
