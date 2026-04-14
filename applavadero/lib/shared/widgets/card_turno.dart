import 'package:flutter/material.dart';
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
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.directions_car,
                      size: 16, color: colorSubtexto),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      turno.vehiculo?.descripcion ??
                          'Vehículo #${turno.vehiculoId}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                  EstadoChip(estado: turno.estado),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                turno.cliente?.nombreCompleto ?? 'Cliente #${turno.clienteId}',
                style: const TextStyle(color: colorSubtexto),
              ),
              if (turno.servicio != null)
                Text(
                  '${turno.servicio!.nombre} · ${formatearPesos(turno.servicio!.precio)}',
                  style:
                      const TextStyle(color: colorSubtexto, fontSize: 13),
                ),
              if (turno.trabajador != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '👷 ${turno.trabajador!.nombreCompleto}',
                    style:
                        const TextStyle(color: colorSubtexto, fontSize: 13),
                  ),
                ),
              if (onAvanzar != null && turno.estado != 'cancelado') ...[
                const SizedBox(height: 12),
                _BotonAvanzar(
                  estado: turno.estado,
                  puedeCobrar: turno.puedeCobrar,
                  onPressed: onAvanzar!,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _BotonAvanzar extends StatelessWidget {
  final String estado;
  final bool puedeCobrar;
  final VoidCallback onPressed;

  const _BotonAvanzar(
      {required this.estado,
      required this.puedeCobrar,
      required this.onPressed});

  @override
  Widget build(BuildContext context) {
    String label;
    Color color;

    if (puedeCobrar) {
      label = 'Cobrar';
      color = colorCompletado;
    } else if (estado == 'pendiente') {
      label = 'Iniciar';
      color = colorEnProceso;
    } else if (estado == 'en_proceso') {
      label = 'Completar';
      color = colorCompletado;
    } else {
      return const SizedBox.shrink();
    }

    return SizedBox(
      width: double.infinity,
      child: TextButton(
        style: TextButton.styleFrom(
          foregroundColor: color,
          backgroundColor: color.withValues(alpha: 0.1),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: onPressed,
        child: Text(label,
            style: const TextStyle(fontWeight: FontWeight.w600)),
      ),
    );
  }
}
