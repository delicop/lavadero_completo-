class TenantConfig {
  final String id;
  final String nombre;
  final String? nombreComercial;
  final String? logo;
  final String zonaHoraria;
  final String moneda;
  final String? telefonoWhatsapp;
  final String? emailContacto;
  final String? direccion;
  final String? colorPrimario;
  final String? colorSidebar;
  final String? colorFondo;
  final String? colorSuperficie;

  const TenantConfig({
    required this.id,
    required this.nombre,
    this.nombreComercial,
    this.logo,
    this.zonaHoraria = 'America/Bogota',
    this.moneda = 'COP',
    this.telefonoWhatsapp,
    this.emailContacto,
    this.direccion,
    this.colorPrimario,
    this.colorSidebar,
    this.colorFondo,
    this.colorSuperficie,
  });

  String get nombreMostrar => nombreComercial ?? nombre;

  factory TenantConfig.fromJson(Map<String, dynamic> json) {
    return TenantConfig(
      id:               json['id'] ?? '',
      nombre:           json['nombre'] ?? '',
      nombreComercial:  json['nombreComercial'],
      logo:             json['logo'],
      zonaHoraria:      json['zonaHoraria'] ?? 'America/Bogota',
      moneda:           json['moneda'] ?? 'COP',
      telefonoWhatsapp: json['telefonoWhatsapp'],
      emailContacto:    json['emailContacto'],
      direccion:        json['direccion'],
      colorPrimario:    json['colorPrimario'],
      colorSidebar:     json['colorSidebar'],
      colorFondo:       json['colorFondo'],
      colorSuperficie:  json['colorSuperficie'],
    );
  }
}
