import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/models/turno.dart';
import '../../core/services/turno_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/boton_primario.dart';
import '../../shared/widgets/estado_chip.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'turnos_provider.dart';

class DetalleTurnoScreen extends StatefulWidget {
  final String turnoId;
  const DetalleTurnoScreen({super.key, required this.turnoId});

  @override
  State<DetalleTurnoScreen> createState() => _DetalleTurnoScreenState();
}

class _DetalleTurnoScreenState extends State<DetalleTurnoScreen> {
  Turno? _turno;
  bool _loading = true;
  bool _accionando = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    try {
      final turno =
          await context.read<TurnoService>().getTurno(widget.turnoId);
      if (mounted) setState(() { _turno = turno; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _avanzarEstado() async {
    if (_turno == null) return;
    final siguiente =
        _turno!.estado == 'pendiente' ? 'en_proceso' : 'completado';

    setState(() => _accionando = true);
    try {
      await context
          .read<TurnosProvider>()
          .cambiarEstado(widget.turnoId, siguiente);
      await _cargar();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
    if (mounted) setState(() => _accionando = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_turno != null ? 'Turno #${_turno!.id}' : 'Turno'),
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop()),
      ),
      body: LoadingOverlay(
        loading: _loading,
        child: _error != null
            ? Center(
                child: Text(_error!,
                    style: const TextStyle(color: colorCancelado)))
            : _turno == null
                ? const SizedBox.shrink()
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            EstadoChip(estado: _turno!.estado),
                            const Spacer(),
                            Text(formatearHora(_turno!.fechaHora),
                                style: const TextStyle(
                                    color: colorSubtexto)),
                          ],
                        ),
                        const SizedBox(height: 24),
                        _InfoRow(
                            icono: Icons.person,
                            label: _turno!.cliente?.nombreCompleto ?? '—'),
                        if (_turno!.cliente?.telefono != null)
                          _InfoRow(
                              icono: Icons.phone,
                              label: _turno!.cliente!.telefono,
                              secundario: true),
                        const SizedBox(height: 16),
                        _InfoRow(
                            icono: Icons.directions_car,
                            label: _turno!.vehiculo?.descripcion ?? '—'),
                        if (_turno!.vehiculo != null) ...[
                          _InfoRow(
                              icono: Icons.badge,
                              label: _turno!.vehiculo!.placa,
                              secundario: true),
                          if (_turno!.vehiculo!.color != null)
                            _InfoRow(
                                icono: Icons.palette,
                                label: _turno!.vehiculo!.color!,
                                secundario: true),
                        ],
                        const SizedBox(height: 16),
                        if (_turno!.servicio != null) ...[
                          _InfoRow(
                              icono: Icons.build,
                              label: _turno!.servicio!.nombre),
                          _InfoRow(
                            icono: Icons.attach_money,
                            label:
                                '${formatearPesos(_turno!.servicio!.precio)} · ${_turno!.servicio!.duracionMinutos} min',
                            secundario: true,
                          ),
                        ],
                        const SizedBox(height: 16),
                        if (_turno!.trabajador != null)
                          _InfoRow(
                              icono: Icons.engineering,
                              label:
                                  _turno!.trabajador!.nombreCompleto),
                        if (_turno!.observaciones != null &&
                            _turno!.observaciones!.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          _InfoRow(
                              icono: Icons.notes,
                              label: _turno!.observaciones!),
                        ],
                        const SizedBox(height: 32),
                        _buildBotonAccion(),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildBotonAccion() {
    final t = _turno!;
    if (t.estado == 'cancelado' || t.estado == 'completado' && !t.puedeCobrar) {
      return const SizedBox.shrink();
    }
    if (t.puedeCobrar) {
      return BotonPrimario(
        texto: 'Cobrar',
        icono: Icons.payments,
        loading: _accionando,
        onPressed: () => context.push('/turnos/${t.id}/cobrar'),
      );
    }
    final label = t.estado == 'pendiente'
        ? 'Marcar En Proceso'
        : 'Marcar Completado';
    return BotonPrimario(
      texto: label,
      loading: _accionando,
      onPressed: _avanzarEstado,
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icono;
  final String label;
  final bool secundario;

  const _InfoRow(
      {required this.icono, required this.label, this.secundario = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icono,
              size: 18,
              color: secundario ? colorSubtexto : colorPrimario),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: secundario ? colorSubtexto : colorTexto,
                fontSize: secundario ? 14 : 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
