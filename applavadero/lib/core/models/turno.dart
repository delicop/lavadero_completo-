import 'cliente.dart';
import 'vehiculo.dart';
import 'servicio.dart';
import 'usuario.dart';

class Turno {
  final String id;
  final String clienteId;
  final String vehiculoId;
  final String servicioId;
  final String? trabajadorId;
  final String fechaHora;
  final String estado;
  final String? observaciones;
  final Cliente? cliente;
  final Vehiculo? vehiculo;
  final Servicio? servicio;
  final Usuario? trabajador;
  final bool tieneFactura;

  Turno({
    required this.id,
    required this.clienteId,
    required this.vehiculoId,
    required this.servicioId,
    this.trabajadorId,
    required this.fechaHora,
    required this.estado,
    this.observaciones,
    this.cliente,
    this.vehiculo,
    this.servicio,
    this.trabajador,
    this.tieneFactura = false,
  });

  bool get puedeCobrar => estado == 'completado' && !tieneFactura;
  bool get estaActivo => estado == 'pendiente' || estado == 'en_proceso';

  factory Turno.fromJson(Map<String, dynamic> json) {
    return Turno(
      id: json['id'],
      clienteId: json['clienteId'],
      vehiculoId: json['vehiculoId'],
      servicioId: json['servicioId'],
      trabajadorId: json['trabajadorId'],
      fechaHora: json['fechaHora'],
      estado: json['estado'],
      observaciones: json['observaciones'],
      cliente:
          json['cliente'] != null ? Cliente.fromJson(json['cliente']) : null,
      vehiculo:
          json['vehiculo'] != null ? Vehiculo.fromJson(json['vehiculo']) : null,
      servicio:
          json['servicio'] != null ? Servicio.fromJson(json['servicio']) : null,
      trabajador: json['trabajador'] != null
          ? Usuario.fromJson(json['trabajador'])
          : null,
      tieneFactura: json['factura'] != null,
    );
  }
}
