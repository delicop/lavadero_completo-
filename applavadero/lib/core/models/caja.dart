class GastoCaja {
  final String id;
  final String descripcion;
  final double monto;

  GastoCaja({
    required this.id,
    required this.descripcion,
    required this.monto,
  });

  factory GastoCaja.fromJson(Map<String, dynamic> json) {
    return GastoCaja(
      id: json['id'],
      descripcion: json['descripcion'] ?? json['concepto'] ?? '',
      monto: (json['monto'] as num).toDouble(),
    );
  }
}

class CajaDia {
  final String id;
  final String fecha;
  final String estado;
  final double montoInicial;

  CajaDia({
    required this.id,
    required this.fecha,
    required this.estado,
    required this.montoInicial,
  });

  bool get estaAbierta => estado == 'abierta';

  factory CajaDia.fromJson(Map<String, dynamic> json) {
    return CajaDia(
      id: json['id'],
      fecha: json['fecha'],
      estado: json['estado'],
      montoInicial: (json['montoInicial'] as num?)?.toDouble() ?? 0,
    );
  }
}

class EstadoCaja {
  final CajaDia? cajaHoy;
  final CajaDia? cajaSinCerrar;

  EstadoCaja({this.cajaHoy, this.cajaSinCerrar});

  factory EstadoCaja.fromJson(Map<String, dynamic> json) {
    return EstadoCaja(
      cajaHoy: json['cajaHoy'] != null
          ? CajaDia.fromJson(json['cajaHoy'])
          : null,
      cajaSinCerrar: json['cajaSinCerrar'] != null
          ? CajaDia.fromJson(json['cajaSinCerrar'])
          : null,
    );
  }

  CajaDia? get cajaActiva => cajaHoy ?? cajaSinCerrar;
}
