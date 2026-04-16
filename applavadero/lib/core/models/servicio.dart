class Servicio {
  final String id;
  final String nombre;
  final String? descripcion;
  final int duracionMinutos;
  final double precio;
  final String tipoVehiculo;
  final bool activo;

  Servicio({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.duracionMinutos,
    required this.precio,
    required this.tipoVehiculo,
    this.activo = true,
  });

  factory Servicio.fromJson(Map<String, dynamic> json) {
    return Servicio(
      id: json['id'],
      nombre: json['nombre'],
      descripcion: json['descripcion'],
      duracionMinutos: json['duracionMinutos'],
      precio: double.tryParse(json['precio'].toString()) ?? 0.0,
      tipoVehiculo: json['tipoVehiculo'] ?? '',
      activo: json['activo'] ?? true,
    );
  }
}
