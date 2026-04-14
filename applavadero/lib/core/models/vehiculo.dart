class Vehiculo {
  final String id;
  final String clienteId;
  final String patente;
  final String marca;
  final String modelo;
  final String? color;
  final String tipo;

  Vehiculo({
    required this.id,
    required this.clienteId,
    required this.patente,
    required this.marca,
    required this.modelo,
    this.color,
    required this.tipo,
  });

  String get descripcion => '$marca $modelo';
  String get descripcionCompleta =>
      '$marca $modelo - $patente${color != null ? ' · $color' : ''}';

  factory Vehiculo.fromJson(Map<String, dynamic> json) {
    return Vehiculo(
      id: json['id'],
      clienteId: json['clienteId'],
      patente: json['patente'],
      marca: json['marca'],
      modelo: json['modelo'],
      color: json['color'],
      tipo: json['tipo'],
    );
  }

  Map<String, dynamic> toJson() => {
        'clienteId': clienteId,
        'patente': patente,
        'marca': marca,
        'modelo': modelo,
        if (color != null) 'color': color,
        'tipo': tipo,
      };
}
