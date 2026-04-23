import 'package:flutter/material.dart';
import '../theme/colores.dart';

class EmptyState extends StatelessWidget {
  final String mensaje;
  final IconData? icono;

  const EmptyState({super.key, required this.mensaje, this.icono});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: colorSuperficieAlta,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: colorDivisor),
              ),
              child: Icon(
                icono ?? Icons.inbox_outlined,
                size: 36,
                color: colorSubtexto,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              mensaje,
              style: const TextStyle(
                color: colorSubtexto,
                fontSize: 15,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
