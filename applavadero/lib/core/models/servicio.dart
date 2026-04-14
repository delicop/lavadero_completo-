class Servicio {
  final String id;
  final String nombre;
  final String? descripcion;
  final int duracionMinutos;
  final double precio;

  Servicio({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.duracionMinutos,
    required this.precio,
  });

  factory Servicio.fromJson(Map<String, dynamic> json) {
    return Servicio(
      id: json['id'],
      nombre: json['nombre'],
      descripcion: json['descripcion'],
      duracionMinutos: json['duracionMinutos'],
      precio: (json['precio'] as num).toDouble(),
    );
  }
}
