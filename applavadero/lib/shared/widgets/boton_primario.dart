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
    final baseColor = peligro ? colorCancelado : colorPrimario;
    final endColor  = peligro ? const Color(0xFFCC2244) : const Color(0xFF009E8E);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: habilitado ? onPressed : null,
        borderRadius: BorderRadius.circular(14),
        splashColor: baseColor.withValues(alpha: 0.2),
        child: Ink(
          decoration: BoxDecoration(
            gradient: habilitado
                ? LinearGradient(
                    colors: [baseColor, endColor],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : const LinearGradient(
                    colors: [Color(0xFF2A3045), Color(0xFF2A3045)],
                  ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: habilitado
                ? [
                    BoxShadow(
                      color: baseColor.withValues(alpha: 0.38),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          child: SizedBox(
            width: double.infinity,
            height: 54,
            child: Center(
              child: loading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (icono != null) ...[
                          Icon(icono, size: 20, color: colorFondo),
                          const SizedBox(width: 8),
                        ],
                        Text(
                          texto.toUpperCase(),
                          style: GoogleFonts.barlowCondensed(
                            color: habilitado ? colorFondo : colorSubtexto,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.6,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
