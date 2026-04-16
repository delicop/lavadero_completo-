class Vehiculo {
  final String id;
  final String clienteId;
  final String placa;
  final String marca;
  final String modelo;
  final String? color;
  final String tipo;

  Vehiculo({
    required this.id,
    required this.clienteId,
    required this.placa,
    required this.marca,
    required this.modelo,
    this.color,
    required this.tipo,
  });

  String get descripcion => '$marca $modelo';
  String get descripcionCompleta =>
      '$marca $modelo - $placa${color != null ? ' · $color' : ''}';

  factory Vehiculo.fromJson(Map<String, dynamic> json) {
    return Vehiculo(
      id: json['id'],
      clienteId: json['clienteId'],
      placa: json['placa'],
      marca: json['marca'],
      modelo: json['modelo'],
      color: json['color'],
      tipo: json['tipo'],
    );
  }

  Map<String, dynamic> toJson() => {
        'clienteId': clienteId,
        'placa': placa,
        'marca': marca,
        'modelo': modelo,
        if (color != null) 'color': color,
        'tipo': tipo,
      };
}
