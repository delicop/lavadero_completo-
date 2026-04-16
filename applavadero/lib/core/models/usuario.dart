class Usuario {
  final String id;
  final String nombre;
  final String apellido;
  final String email;
  final String rol;
  final bool activo;
  final bool disponible;
  final double? comisionPorcentaje;

  Usuario({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.email,
    required this.rol,
    required this.activo,
    this.disponible = true,
    this.comisionPorcentaje,
  });

  String get nombreCompleto => '$nombre $apellido';
  bool get esAdmin => rol == 'admin';

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: json['id'],
      nombre: json['nombre'],
      apellido: json['apellido'],
      email: json['email'],
      rol: json['rol'],
      activo: json['activo'] ?? true,
      disponible: json['disponible'] ?? true,
      comisionPorcentaje: json['comisionPorcentaje'] != null
          ? double.tryParse(json['comisionPorcentaje'].toString())
          : null,
    );
  }
}
