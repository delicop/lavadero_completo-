import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/models/turno.dart';
import '../theme/colores.dart';
import '../utils/formatters.dart';
import 'estado_chip.dart';

class CardTurno extends StatelessWidget {
  final Turno turno;
  final VoidCallback? onTap;
  final VoidCallback? onAvanzar;

  const CardTurno({
    super.key,
    required this.turno,
    this.onTap,
    this.onAvanzar,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = colorEstado(turno.estado);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 5),
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: colorDivisor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          onTap: onTap,
          child: Column(
            children: [
              // Barra superior de estado
              Container(height: 3, color: statusColor),
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                turno.vehiculo?.descripcion ??
                                    'Vehículo #${turno.vehiculoId}',
                                style: GoogleFonts.playfairDisplay(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 17,
                                  color: colorTexto,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                turno.cliente?.nombreCompleto ??
                                    'Cliente #${turno.clienteId}',
                                style: GoogleFonts.dmSans(
                                  color: colorSubtexto,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        EstadoChip(estado: turno.estado),
                      ],
                    ),
                    if (turno.servicio != null) ...[
                      const SizedBox(height: 10),
                      Container(
                        height: 1,
                        color: colorDivisor,
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text(
                            turno.servicio!.nombre,
                            style: GoogleFonts.dmSans(
                              color: colorSubtexto,
                              fontSize: 13,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            formatearPesos(turno.servicio!.precio),
                            style: GoogleFonts.dmSans(
                              color: colorPrimario,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (turno.trabajador != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          const Icon(
                            Icons.person_outline_rounded,
                            size: 13,
                            color: colorSubtexto,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            turno.trabajador!.nombreCompleto,
                            style: GoogleFonts.dmSans(
                              color: colorSubtexto,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                    if (onAvanzar != null && turno.estado != 'cancelado') ...[
                      const SizedBox(height: 12),
                      _BotonAvanzar(
                        estado: turno.estado,
                        onPressed: onAvanzar!,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BotonAvanzar extends StatelessWidget {
  final String estado;
  final VoidCallback onPressed;

  const _BotonAvanzar({required this.estado, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    String label;
    Color color;

    if (estado == 'pendiente') {
      label = 'Iniciar turno';
      color = colorEnProceso;
    } else if (estado == 'en_proceso') {
      label = 'Marcar completado';
      color = colorCompletado;
    } else {
      return const SizedBox.shrink();
    }

    return SizedBox(
      width: double.infinity,
      child: TextButton(
        style: TextButton.styleFrom(
          foregroundColor: color,
          backgroundColor: color.withValues(alpha: 0.08),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(color: color.withValues(alpha: 0.3)),
          ),
          padding: const EdgeInsets.symmetric(vertical: 10),
        ),
        onPressed: onPressed,
        child: Text(
          label,
          style: GoogleFonts.dmSans(
            fontWeight: FontWeight.w600,
            fontSize: 13,
            color: color,
          ),
        ),
      ),
    );
  }
}
