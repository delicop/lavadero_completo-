import 'package:flutter/material.dart';
import '../theme/colores.dart';

class EmptyState extends StatelessWidget {
  final String mensaje;
  final IconData? icono;

  const EmptyState({super.key, required this.mensaje, this.icono});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icono ?? Icons.inbox_outlined, size: 64, color: colorSubtexto),
          const SizedBox(height: 16),
          Text(
            mensaje,
            style: const TextStyle(color: colorSubtexto, fontSize: 16),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
