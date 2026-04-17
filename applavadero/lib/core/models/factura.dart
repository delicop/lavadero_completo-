class Factura {
  final String id;
  final String turnoId;
  final double total;
  final String fechaEmision;
  final String metodoPago;

  Factura({
    required this.id,
    required this.turnoId,
    required this.total,
    required this.fechaEmision,
    required this.metodoPago,
  });

  factory Factura.fromJson(Map<String, dynamic> json) {
    return Factura(
      id: json['id'],
      turnoId: json['turnoId'],
      total: double.tryParse(json['total'].toString()) ?? 0.0,
      fechaEmision: json['fechaEmision'],
      metodoPago: json['metodoPago'],
    );
  }
}
