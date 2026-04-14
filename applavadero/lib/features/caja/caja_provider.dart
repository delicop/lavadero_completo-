import 'package:flutter/material.dart';
import '../../core/models/caja.dart';
import '../../core/services/caja_service.dart';

class CajaProvider extends ChangeNotifier {
  final CajaService _cajaService;

  CajaDia? caja;
  bool loading = false;
  String? error;

  CajaProvider(this._cajaService);

  bool get sinCaja => caja == null;
  bool get estaAbierta => caja?.estaAbierta ?? false;

  Future<void> cargar() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final estado = await _cajaService.getEstado();
      caja = estado.cajaActiva;
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> abrir(double montoInicial) async {
    loading = true;
    notifyListeners();
    try {
      caja = await _cajaService.abrir(montoInicial);
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> cerrar() async {
    if (caja == null) return;
    loading = true;
    notifyListeners();
    try {
      caja = await _cajaService.cerrar(caja!.id);
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> registrarGasto(String descripcion, double monto) async {
    try {
      await _cajaService.registrarGasto(descripcion, monto);
      await cargar();
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }

  Future<void> eliminarGasto(String id) async {
    try {
      await _cajaService.eliminarGasto(id);
      await cargar();
    } catch (e) {
      error = e.toString();
      notifyListeners();
    }
  }
}
