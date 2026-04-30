import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colores.dart';

String _labelEstado(String estado) {
  switch (estado) {
    case 'pendiente':  return 'Pendiente';
    case 'en_proceso': return 'En proceso';
    case 'completado': return 'Completado';
    case 'cancelado':  return 'Cancelado';
    default:           return estado;
  }
}

class EstadoChip extends StatelessWidget {
  final String estado;
  const EstadoChip({super.key, required this.estado});

  @override
  Widget build(BuildContext context) {
    final color = colorEstado(estado);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 5,
            height: 5,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            _labelEstado(estado),
            style: GoogleFonts.dmSans(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
