import 'package:flutter/material.dart';

const colorPrimario = Color(0xFF1E88E5);
const colorFondo = Color(0xFFF2F4F7);
const colorSuperficie = Color(0xFFFFFFFF);
const colorTexto = Color(0xFF1A1A2E);
const colorSubtexto = Color(0xFF6B7280);
const colorDivisor = Color(0xFFE5E7EB);

const colorPendiente = Color(0xFFF59E0B);
const colorEnProceso = Color(0xFF2196F3);
const colorCompletado = Color(0xFF22C55E);
const colorCancelado = Color(0xFFEF4444);

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
