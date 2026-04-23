import 'package:flutter/material.dart';

// Backgrounds
const colorFondo        = Color(0xFF0E1116);
const colorSuperficie   = Color(0xFF161B24);
const colorSuperficieAlta = Color(0xFF1E2635);

// Brand
const colorPrimario = Color(0xFF00CEB8);

// Text
const colorTexto    = Color(0xFFE8ECF4);
const colorSubtexto = Color(0xFF6B7A9A);

// Structure
const colorDivisor = Color(0xFF252D3E);

// Status
const colorPendiente  = Color(0xFFFFBD3C);
const colorEnProceso  = Color(0xFF3B9EFF);
const colorCompletado = Color(0xFF2EDD9A);
const colorCancelado  = Color(0xFFFF4560);

Color colorEstado(String estado) {
  switch (estado) {
    case 'pendiente':
      return colorPendiente;
    case 'en_proceso':
      return colorEnProceso;
    case 'completado':
      return colorCompletado;
    case 'cancelado':
      return colorCancelado;
    default:
      return colorSubtexto;
  }
}
