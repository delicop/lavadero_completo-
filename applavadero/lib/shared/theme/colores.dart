import 'package:flutter/material.dart';

const colorPrimario = Color(0xFF1E88E5);
const colorFondo = Color(0xFF121212);
const colorSuperficie = Color(0xFF1E1E1E);
const colorTexto = Color(0xFFFFFFFF);
const colorSubtexto = Color(0xFFB0B0B0);
const colorDivisor = Color(0xFF2E2E2E);

const colorPendiente = Color(0xFFFF9800);
const colorEnProceso = Color(0xFF2196F3);
const colorCompletado = Color(0xFF4CAF50);
const colorCancelado = Color(0xFFEF5350);

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
