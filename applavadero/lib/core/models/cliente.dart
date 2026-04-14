class Cliente {
  final String id;
  final String nombre;
  final String apellido;
  final String telefono;
  final String? email;

  Cliente({
    required this.id,
    required this.nombre,
    required this.apellido,
    required this.telefono,
    this.email,
  });

  String get nombreCompleto => '$nombre $apellido';

  factory Cliente.fromJson(Map<String, dynamic> json) {
    return Cliente(
      id: json['id'],
      nombre: json['nombre'],
      apellido: json['apellido'],
      telefono: json['telefono'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() => {
        'nombre': nombre,
        'apellido': apellido,
        'telefono': telefono,
        if (email != null) 'email': email,
      };
}
