double _n(dynamic v) => v == null ? 0 : double.tryParse(v.toString()) ?? 0;

class GastoCaja {
  final String id;
  final String concepto;
  final double monto;
  final String tipoPago;

  GastoCaja({
    required this.id,
    required this.concepto,
    required this.monto,
    required this.tipoPago,
  });

  factory GastoCaja.fromJson(Map<String, dynamic> json) => GastoCaja(
        id: json['id'],
        concepto: json['concepto'] ?? json['descripcion'] ?? '',
        monto: _n(json['monto']),
        tipoPago: json['tipoPago'] ?? 'efectivo',
      );
}

class IngresoManualCaja {
  final String id;
  final String concepto;
  final double monto;
  final String tipoPago;

  IngresoManualCaja({
    required this.id,
    required this.concepto,
    required this.monto,
    required this.tipoPago,
  });

  factory IngresoManualCaja.fromJson(Map<String, dynamic> json) =>
      IngresoManualCaja(
        id: json['id'],
        concepto: json['concepto'] ?? '',
        monto: _n(json['monto']),
        tipoPago: json['tipoPago'] ?? 'efectivo',
      );
}

class GananciaTrabajador {
  final String trabajadorId;
  final String nombre;
  final String apellido;
  final double comisionPorcentaje;
  final double ganancia;

  GananciaTrabajador({
    required this.trabajadorId,
    required this.nombre,
    required this.apellido,
    required this.comisionPorcentaje,
    required this.ganancia,
  });

  factory GananciaTrabajador.fromJson(Map<String, dynamic> json) =>
      GananciaTrabajador(
        trabajadorId: json['trabajadorId'] ?? '',
        nombre: json['nombre'] ?? '',
        apellido: json['apellido'] ?? '',
        comisionPorcentaje: _n(json['comisionPorcentaje']),
        ganancia: _n(json['ganancia']),
      );
}

class ResumenCaja {
  final CajaDia cajaDia;
  // Ingresos
  final double montoInicial;
  final double ventasEfectivo;
  final double ventasTransferencia;
  final double ingresosManual;
  final double totalIngresos;
  // Gastos
  final List<GastoCaja> gastosLista;
  final double gastosEfectivo;
  final double gastosTransferencia;
  final double gastosTotal;
  // Ganancias
  final List<GananciaTrabajador> trabajadores;
  final double totalEmpleados;
  final double lavadero;
  final double totalDia;
  // Ingresos manuales lista
  final List<IngresoManualCaja> ingresosManualLista;

  ResumenCaja({
    required this.cajaDia,
    required this.montoInicial,
    required this.ventasEfectivo,
    required this.ventasTransferencia,
    required this.ingresosManual,
    required this.totalIngresos,
    required this.gastosLista,
    required this.gastosEfectivo,
    required this.gastosTransferencia,
    required this.gastosTotal,
    required this.trabajadores,
    required this.totalEmpleados,
    required this.lavadero,
    required this.totalDia,
    required this.ingresosManualLista,
  });

  /// Dinero físico en caja: inicio + ventas efectivo + ingresos manuales efectivo − gastos efectivo
  double get efectivoEnCaja {
    final ingManualEfectivo = ingresosManualLista
        .where((i) => i.tipoPago == 'efectivo')
        .fold(0.0, (s, i) => s + i.monto);
    return montoInicial + ventasEfectivo + ingManualEfectivo - gastosEfectivo;
  }

  factory ResumenCaja.fromJson(Map<String, dynamic> json) {
    final ingresos = (json['ingresos'] as Map<String, dynamic>?) ?? {};
    final gastos = (json['gastos'] as Map<String, dynamic>?) ?? {};
    final ganancias = (json['ganancias'] as Map<String, dynamic>?) ?? {};
    return ResumenCaja(
      cajaDia: CajaDia.fromJson(json['cajaDia'] as Map<String, dynamic>),
      montoInicial: _n(ingresos['montoInicial']),
      ventasEfectivo: _n(ingresos['ventasEfectivo']),
      ventasTransferencia: _n(ingresos['ventasTransferencia']),
      ingresosManual: _n(ingresos['ingresosManual']),
      totalIngresos: _n(ingresos['total']),
      gastosLista: (gastos['lista'] as List? ?? [])
          .map((g) => GastoCaja.fromJson(g as Map<String, dynamic>))
          .toList(),
      gastosEfectivo: _n(gastos['efectivo']),
      gastosTransferencia: _n(gastos['transferencia']),
      gastosTotal: _n(gastos['total']),
      trabajadores: (ganancias['trabajadores'] as List? ?? [])
          .map((t) => GananciaTrabajador.fromJson(t as Map<String, dynamic>))
          .toList(),
      totalEmpleados: _n(ganancias['totalEmpleados']),
      lavadero: _n(ganancias['lavadero']),
      totalDia: _n(ganancias['totalDia']),
      ingresosManualLista: (json['ingresosManualLista'] as List? ?? [])
          .map((i) => IngresoManualCaja.fromJson(i as Map<String, dynamic>))
          .toList(),
    );
  }
}

class CajaDia {
  final String id;
  final String fecha;
  final String estado;
  final double montoInicial;
  final String? observaciones;

  CajaDia({
    required this.id,
    required this.fecha,
    required this.estado,
    required this.montoInicial,
    this.observaciones,
  });

  bool get estaAbierta => estado == 'abierta';

  factory CajaDia.fromJson(Map<String, dynamic> json) => CajaDia(
        id: json['id'],
        fecha: json['fecha'],
        estado: json['estado'],
        montoInicial: _n(json['montoInicial']),
        observaciones: json['observaciones'] as String?,
      );
}

class EstadoCaja {
  final CajaDia? cajaHoy;
  final CajaDia? cajaSinCerrar;

  EstadoCaja({this.cajaHoy, this.cajaSinCerrar});

  factory EstadoCaja.fromJson(Map<String, dynamic> json) => EstadoCaja(
        cajaHoy: json['cajaHoy'] != null
            ? CajaDia.fromJson(json['cajaHoy'] as Map<String, dynamic>)
            : null,
        cajaSinCerrar: json['cajaSinCerrar'] != null
            ? CajaDia.fromJson(json['cajaSinCerrar'] as Map<String, dynamic>)
            : null,
      );

  CajaDia? get cajaActiva => cajaHoy;
}
