import 'package:flutter/material.dart';
import '../../core/models/caja.dart';
import '../../core/services/caja_service.dart';

/// Qué pantalla mostrar (espeja las vistas del Angular web)
enum VistaCaja { cargando, cerrarAnterior, abrir, abierta, cerrada }

class CajaProvider extends ChangeNotifier {
  final CajaService _cajaService;

  VistaCaja vista = VistaCaja.cargando;
  CajaDia? cajaHoy;
  CajaDia? cajaSinCerrar;
  ResumenCaja? resumen;
  ResumenCaja? resumenAnterior; // resumen de la caja pendiente de cierre
  bool loading = false;
  String? error;

  CajaProvider(this._cajaService);

  Future<void> cargar() async {
    vista = VistaCaja.cargando;
    error = null;
    notifyListeners();
    try {
      final estado = await _cajaService.getEstado();
      cajaHoy = estado.cajaHoy;
      cajaSinCerrar = estado.cajaSinCerrar;

      if (estado.cajaSinCerrar != null) {
        // Hay una caja sin cerrar del día anterior → cargar su resumen
        resumenAnterior =
            await _cajaService.getResumen(estado.cajaSinCerrar!.id);
        vista = VistaCaja.cerrarAnterior;
      } else if (estado.cajaHoy == null) {
        resumen = null;
        vista = VistaCaja.abrir;
      } else if (estado.cajaHoy!.estaAbierta) {
        vista = VistaCaja.abierta;
        // Cargar resumen en background (no bloquea la pantalla)
        _cargarResumenHoy();
      } else {
        vista = VistaCaja.cerrada;
        _cargarResumenHoy();
      }
    } catch (e) {
      error = 'No se pudo cargar el estado de la caja.';
      vista = VistaCaja.abrir;
    }
    notifyListeners();
  }

  Future<void> _cargarResumenHoy() async {
    if (cajaHoy == null) return;
    try {
      resumen = await _cajaService.getResumen(cajaHoy!.id);
    } catch (_) {
      resumen = null;
    }
    notifyListeners();
  }

  Future<void> abrir(double montoInicial, {String? observaciones}) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      cajaHoy = await _cajaService.abrir(montoInicial,
          observaciones: observaciones);
      cajaSinCerrar = null;
      resumen = null;
      vista = VistaCaja.abierta;
      _cargarResumenHoy();
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> cerrarAnterior() async {
    if (cajaSinCerrar == null) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      await _cajaService.cerrar(cajaSinCerrar!.id);
      cajaSinCerrar = null;
      resumenAnterior = null;
    } catch (e) {
      error = 'Error al cerrar la caja anterior.';
    }
    loading = false;
    notifyListeners();
    await cargar();
  }

  Future<void> reabrir() async {
    if (cajaHoy == null) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      cajaHoy = await _cajaService.reabrir(cajaHoy!.id);
      resumen = null;
      vista = VistaCaja.abierta;
      _cargarResumenHoy();
    } catch (e) {
      error = 'Error al reabrir la caja.';
    }
    loading = false;
    notifyListeners();
  }

  Future<void> cerrar() async {
    if (cajaHoy == null) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      cajaHoy = await _cajaService.cerrar(cajaHoy!.id);
      vista = VistaCaja.cerrada;
      await _cargarResumenHoy();
    } catch (e) {
      error = 'Error al cerrar la caja.';
    }
    loading = false;
    notifyListeners();
  }

  // ── Gastos ────────────────────────────────────────────────────────────────

  Future<void> registrarGasto(
      String concepto, double monto, String tipoPago) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final gasto = await _cajaService.registrarGasto(concepto, monto, tipoPago);
      // Actualizar estado local sin re-fetch
      if (resumen != null) {
        final m = gasto.monto;
        resumen = ResumenCaja(
          cajaDia: resumen!.cajaDia,
          montoInicial: resumen!.montoInicial,
          ventasEfectivo: resumen!.ventasEfectivo,
          ventasTransferencia: resumen!.ventasTransferencia,
          ingresosManual: resumen!.ingresosManual,
          totalIngresos: resumen!.totalIngresos,
          gastosLista: [...resumen!.gastosLista, gasto],
          gastosEfectivo: resumen!.gastosEfectivo +
              (tipoPago == 'efectivo' ? m : 0),
          gastosTransferencia: resumen!.gastosTransferencia +
              (tipoPago == 'transferencia' ? m : 0),
          gastosTotal: resumen!.gastosTotal + m,
          trabajadores: resumen!.trabajadores,
          totalEmpleados: resumen!.totalEmpleados,
          lavadero: resumen!.lavadero - m,
          totalDia: resumen!.totalDia,
          ingresosManualLista: resumen!.ingresosManualLista,
        );
      }
    } catch (e) {
      error = 'Error al registrar el gasto.';
    }
    loading = false;
    notifyListeners();
  }

  Future<void> eliminarGasto(GastoCaja gasto) async {
    // Actualización local optimista
    if (resumen != null) {
      final m = gasto.monto;
      final esEfectivo = gasto.tipoPago == 'efectivo';
      resumen = ResumenCaja(
        cajaDia: resumen!.cajaDia,
        montoInicial: resumen!.montoInicial,
        ventasEfectivo: resumen!.ventasEfectivo,
        ventasTransferencia: resumen!.ventasTransferencia,
        ingresosManual: resumen!.ingresosManual,
        totalIngresos: resumen!.totalIngresos,
        gastosLista: resumen!.gastosLista.where((g) => g.id != gasto.id).toList(),
        gastosEfectivo: resumen!.gastosEfectivo - (esEfectivo ? m : 0),
        gastosTransferencia:
            resumen!.gastosTransferencia - (esEfectivo ? 0 : m),
        gastosTotal: resumen!.gastosTotal - m,
        trabajadores: resumen!.trabajadores,
        totalEmpleados: resumen!.totalEmpleados,
        lavadero: resumen!.lavadero + m,
        totalDia: resumen!.totalDia,
        ingresosManualLista: resumen!.ingresosManualLista,
      );
      notifyListeners();
    }
    try {
      await _cajaService.eliminarGasto(gasto.id);
    } catch (e) {
      error = 'Error al eliminar el gasto.';
      _cargarResumenHoy(); // revertir
    }
  }

  // ── Ingresos manuales ─────────────────────────────────────────────────────

  Future<void> registrarIngreso(
      String concepto, double monto, String tipoPago) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final ing =
          await _cajaService.registrarIngreso(concepto, monto, tipoPago);
      // Actualizar estado local sin re-fetch
      if (resumen != null) {
        final m = ing.monto;
        resumen = ResumenCaja(
          cajaDia: resumen!.cajaDia,
          montoInicial: resumen!.montoInicial,
          ventasEfectivo: resumen!.ventasEfectivo,
          ventasTransferencia: resumen!.ventasTransferencia,
          ingresosManual: resumen!.ingresosManual + m,
          totalIngresos: resumen!.totalIngresos + m,
          gastosLista: resumen!.gastosLista,
          gastosEfectivo: resumen!.gastosEfectivo,
          gastosTransferencia: resumen!.gastosTransferencia,
          gastosTotal: resumen!.gastosTotal,
          trabajadores: resumen!.trabajadores,
          totalEmpleados: resumen!.totalEmpleados,
          lavadero: resumen!.lavadero + m,
          totalDia: resumen!.totalDia + m,
          ingresosManualLista: [...resumen!.ingresosManualLista, ing],
        );
      }
    } catch (e) {
      error = 'Error al registrar el ingreso.';
    }
    loading = false;
    notifyListeners();
  }

  Future<void> eliminarIngreso(IngresoManualCaja ing) async {
    // Actualización local optimista
    if (resumen != null) {
      final m = ing.monto;
      resumen = ResumenCaja(
        cajaDia: resumen!.cajaDia,
        montoInicial: resumen!.montoInicial,
        ventasEfectivo: resumen!.ventasEfectivo,
        ventasTransferencia: resumen!.ventasTransferencia,
        ingresosManual: resumen!.ingresosManual - m,
        totalIngresos: resumen!.totalIngresos - m,
        gastosLista: resumen!.gastosLista,
        gastosEfectivo: resumen!.gastosEfectivo,
        gastosTransferencia: resumen!.gastosTransferencia,
        gastosTotal: resumen!.gastosTotal,
        trabajadores: resumen!.trabajadores,
        totalEmpleados: resumen!.totalEmpleados,
        lavadero: resumen!.lavadero - m,
        totalDia: resumen!.totalDia - m,
        ingresosManualLista:
            resumen!.ingresosManualLista.where((i) => i.id != ing.id).toList(),
      );
      notifyListeners();
    }
    try {
      await _cajaService.eliminarIngreso(ing.id);
    } catch (e) {
      error = 'Error al eliminar el ingreso.';
      _cargarResumenHoy(); // revertir
    }
  }
}
