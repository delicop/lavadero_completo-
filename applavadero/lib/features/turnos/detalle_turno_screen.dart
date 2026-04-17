import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/models/turno.dart';
import '../../core/services/turno_service.dart';
import '../../core/services/facturacion_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/utils/whatsapp.dart';
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
  bool _tieneFactura = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    if (!mounted) return;
    setState(() { _loading = true; _error = null; });
    try {
      final turno = await context.read<TurnoService>().getTurno(widget.turnoId);
      // Solo el admin puede consultar facturas — los trabajadores no tienen permiso
      final esAdmin = context.read<AuthProvider>().usuario?.rol == 'admin';
      bool tieneFactura = turno.tieneFactura;
      if (esAdmin && !tieneFactura && turno.estado == 'completado') {
        final factura = await context
            .read<FacturacionService>()
            .getFacturaPorTurno(widget.turnoId);
        tieneFactura = factura != null;
      }
      if (mounted) {
        setState(() {
          _turno = turno;
          _tieneFactura = tieneFactura;
          _loading = false;
        });
      }
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

      // Al completar: ofrecer notificar al cliente por WhatsApp
      if (siguiente == 'completado' && mounted) {
        _mostrarSnackbarWhatsApp();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
    if (mounted) setState(() => _accionando = false);
  }

  void _mostrarSnackbarWhatsApp() {
    final tel = _turno?.cliente?.telefono ?? '';
    if (tel.isEmpty) return;
    final url = _urlWhatsappCompletado();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Orden completada — avisar al cliente'),
        backgroundColor: colorCompletado,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 8),
        action: SnackBarAction(
          label: 'WhatsApp',
          textColor: Colors.white,
          onPressed: () => launchUrl(
            Uri.parse(url),
            mode: LaunchMode.externalApplication,
          ),
        ),
      ),
    );
  }

  String _urlWhatsappSegunEstado() {
    final t = _turno!;
    final v = t.vehiculo;
    final s = t.servicio;
    final nombre = t.cliente?.nombre ?? '';
    final tel = t.cliente?.telefono ?? '';

    String mensaje;
    switch (t.estado) {
      case 'pendiente':
        mensaje = '📅 Tu turno ha sido agendado\n'
            '${v != null ? 'Vehículo: ${v.placa} — ${v.marca} ${v.modelo}\n' : ''}'
            '${s != null ? 'Servicio: ${s.nombre}\n' : ''}'
            'Fecha: ${formatearFechaHora(DateTime.tryParse(t.fechaHora) ?? DateTime.now())}\n'
            '¡Te esperamos!';
      case 'en_proceso':
        mensaje = '🔧 Tu vehículo ya está siendo atendido\n'
            '${v != null ? '${v.placa} — ${v.marca} ${v.modelo}\n' : ''}'
            'Te avisamos cuando esté listo, $nombre.';
      case 'completado':
        mensaje = _mensajeCompletado();
      default:
        mensaje = 'Actualización de tu turno en el lavadero.';
    }
    return urlWhatsapp(tel, mensaje: mensaje);
  }

  String _urlWhatsappCompletado() {
    final tel = _turno?.cliente?.telefono ?? '';
    return urlWhatsapp(tel, mensaje: _mensajeCompletado());
  }

  String _mensajeCompletado() {
    final t = _turno!;
    final v = t.vehiculo;
    final nombre = t.cliente?.nombre ?? '';
    return '✅ ¡Tu vehículo está listo!\n'
        '${v != null ? '${v.placa} — ${v.marca} ${v.modelo}\n' : ''}'
        'Podés pasar a buscarlo.\n'
        '¡Gracias, $nombre!';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_turno != null ? 'Turno #${_turno!.id.substring(0, 8)}' : 'Turno'),
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
                        // Botón permanente de notificación WhatsApp
                        if ((_turno!.cliente?.telefono ?? '').isNotEmpty &&
                            _turno!.estado != 'cancelado') ...[
                          const SizedBox(height: 12),
                          OutlinedButton.icon(
                            icon: const Icon(Icons.message, size: 18),
                            label: const Text('Notificar al cliente'),
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(double.infinity, 44),
                              foregroundColor: colorPrimario,
                              side: const BorderSide(color: colorPrimario),
                            ),
                            onPressed: () => launchUrl(
                              Uri.parse(_urlWhatsappSegunEstado()),
                              mode: LaunchMode.externalApplication,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _buildBotonAccion() {
    final t = _turno!;
    final esAdmin = context.read<AuthProvider>().usuario?.rol == 'admin';
    final puedeCobrar = t.estado == 'completado' && !_tieneFactura && esAdmin;

    if (t.estado == 'cancelado' || (t.estado == 'completado' && _tieneFactura)) {
      return const SizedBox.shrink();
    }
    if (puedeCobrar) {
      return BotonPrimario(
        texto: 'Cobrar',
        icono: Icons.payments,
        loading: _accionando,
        onPressed: () async {
          await context.push('/turnos/${t.id}/cobrar');
          // Recargar para actualizar el estado del botón Cobrar
          if (mounted) await _cargar();
        },
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
