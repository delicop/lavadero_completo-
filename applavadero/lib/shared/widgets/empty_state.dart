import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
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
              width: 68,
              height: 68,
              decoration: BoxDecoration(
                color: colorSuperficie,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: colorDivisor),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                icono ?? Icons.inbox_outlined,
                size: 32,
                color: colorSubtexto,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              mensaje,
              style: GoogleFonts.dmSans(
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
