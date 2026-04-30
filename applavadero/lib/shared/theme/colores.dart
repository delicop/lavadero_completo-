import 'package:flutter/material.dart';

// Backgrounds
const colorFondo          = Color(0xFFF7F7F5);
const colorSuperficie     = Color(0xFFFFFFFF);
const colorSuperficieAlta = Color(0xFFF0F0EE);

// Brand — índigo profundo
const colorPrimario = Color(0xFF2B3A8C);

// Text
const colorTexto    = Color(0xFF1A1A2E);
const colorSubtexto = Color(0xFF6B7280);

// Structure
const colorDivisor = Color(0xFFE5E5E3);

// Status — desaturados, elegantes
const colorPendiente  = Color(0xFFD97706);
const colorEnProceso  = Color(0xFF2563EB);
const colorCompletado = Color(0xFF059669);
const colorCancelado  = Color(0xFFDC2626);

Color colorEstado(String estado) {
  switch (estado) {
    case 'pendiente':  return colorPendiente;
    case 'en_proceso': return colorEnProceso;
    case 'completado': return colorCompletado;
    case 'cancelado':  return colorCancelado;
    default:           return colorSubtexto;
  }
}
