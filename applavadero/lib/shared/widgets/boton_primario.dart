import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colores.dart';

class BotonPrimario extends StatelessWidget {
  final String texto;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icono;
  final bool peligro;

  const BotonPrimario({
    super.key,
    required this.texto,
    this.onPressed,
    this.loading = false,
    this.icono,
    this.peligro = false,
  });

  @override
  Widget build(BuildContext context) {
    final habilitado = !loading && onPressed != null;
    final baseColor  = peligro ? colorCancelado : colorPrimario;

    return Material(
      color: habilitado ? baseColor : colorSuperficieAlta,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: habilitado ? onPressed : null,
        borderRadius: BorderRadius.circular(12),
        splashColor: Colors.white.withValues(alpha: 0.15),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: Center(
            child: loading
                ? SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: habilitado ? Colors.white : colorSubtexto,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (icono != null) ...[
                        Icon(
                          icono,
                          size: 18,
                          color: habilitado ? Colors.white : colorSubtexto,
                        ),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        texto,
                        style: GoogleFonts.dmSans(
                          color: habilitado ? Colors.white : colorSubtexto,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
