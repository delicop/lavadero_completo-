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

    return Card(
      child: InkWell(
        onTap: onTap,
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Franja lateral de estado
              Container(width: 4, color: statusColor),
              // Contenido
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
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
                                Row(
                                  children: [
                                    Icon(
                                      Icons.directions_car_rounded,
                                      size: 14,
                                      color: colorSubtexto,
                                    ),
                                    const SizedBox(width: 5),
                                    Expanded(
                                      child: Text(
                                        turno.vehiculo?.descripcion ??
                                            'Vehículo #${turno.vehiculoId}',
                                        style: GoogleFonts.barlowCondensed(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 17,
                                          color: colorTexto,
                                          letterSpacing: 0.3,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  turno.cliente?.nombreCompleto ??
                                      'Cliente #${turno.clienteId}',
                                  style: const TextStyle(
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
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Text(
                              turno.servicio!.nombre,
                              style: const TextStyle(
                                color: colorSubtexto,
                                fontSize: 13,
                              ),
                            ),
                            const Text(
                              '  ·  ',
                              style: TextStyle(color: colorSubtexto, fontSize: 13),
                            ),
                            Text(
                              formatearPesos(turno.servicio!.precio),
                              style: const TextStyle(
                                color: colorPrimario,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                      if (turno.trabajador != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.person_rounded,
                              size: 13,
                              color: colorSubtexto,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              turno.trabajador!.nombreCompleto,
                              style: const TextStyle(
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
      label = 'INICIAR TURNO';
      color = colorEnProceso;
    } else if (estado == 'en_proceso') {
      label = 'MARCAR COMPLETADO';
      color = colorCompletado;
    } else {
      return const SizedBox.shrink();
    }

    return SizedBox(
      width: double.infinity,
      child: TextButton(
        style: TextButton.styleFrom(
          foregroundColor: color,
          backgroundColor: color.withValues(alpha: 0.12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          padding: const EdgeInsets.symmetric(vertical: 10),
        ),
        onPressed: onPressed,
        child: Text(
          label,
          style: GoogleFonts.barlowCondensed(
            fontWeight: FontWeight.w700,
            fontSize: 14,
            letterSpacing: 1.0,
            color: color,
          ),
        ),
      ),
    );
  }
}
