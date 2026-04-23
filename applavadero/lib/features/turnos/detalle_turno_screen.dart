import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
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
  bool _loading    = true;
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
      final turno   = await context.read<TurnoService>().getTurno(widget.turnoId);
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
          _turno        = turno;
          _tieneFactura = tieneFactura;
          _loading      = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _avanzarEstado() async {
    if (_turno == null) return;
    final siguiente = _turno!.estado == 'pendiente' ? 'en_proceso' : 'completado';
    setState(() => _accionando = true);
    try {
      await context.read<TurnosProvider>().cambiarEstado(widget.turnoId, siguiente);
      await _cargar();
      if (siguiente == 'completado' && mounted) _mostrarSnackbarWhatsApp();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: colorCancelado,
          ),
        );
      }
    }
    if (mounted) setState(() => _accionando = false);
  }

  void _mostrarSnackbarWhatsApp() {
    final tel = _turno?.cliente?.telefono ?? '';
    if (tel.isEmpty) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Orden completada — avisar al cliente',
          style: GoogleFonts.dmSans(color: colorFondo),
        ),
        backgroundColor: colorCompletado,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 8),
        action: SnackBarAction(
          label: 'WhatsApp',
          textColor: colorFondo,
          onPressed: () => launchUrl(
            Uri.parse(_urlWhatsappCompletado()),
            mode: LaunchMode.externalApplication,
          ),
        ),
      ),
    );
  }

  String _urlWhatsappSegunEstado() {
    final t      = _turno!;
    final v      = t.vehiculo;
    final s      = t.servicio;
    final nombre = t.cliente?.nombre ?? '';
    final tel    = t.cliente?.telefono ?? '';
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

  String _urlWhatsappCompletado() =>
      urlWhatsapp(_turno?.cliente?.telefono ?? '', mensaje: _mensajeCompletado());

  String _mensajeCompletado() {
    final t      = _turno!;
    final v      = t.vehiculo;
    final nombre = t.cliente?.nombre ?? '';
    return '✅ ¡Tu vehículo está listo!\n'
        '${v != null ? '${v.placa} — ${v.marca} ${v.modelo}\n' : ''}'
        'Podés pasar a buscarlo.\n'
        '¡Gracias, $nombre!';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: colorFondo,
      body: LoadingOverlay(
        loading: _loading,
        child: _error != null
            ? _ErrorView(mensaje: _error!)
            : _turno == null
                ? const SizedBox.shrink()
                : _DetalleBody(
                    turno: _turno!,
                    tieneFactura: _tieneFactura,
                    accionando: _accionando,
                    onAvanzar: _avanzarEstado,
                    onCobrar: () async {
                      await context.push('/turnos/${_turno!.id}/cobrar');
                      if (mounted) await _cargar();
                    },
                    onWhatsApp: () => launchUrl(
                      Uri.parse(_urlWhatsappSegunEstado()),
                      mode: LaunchMode.externalApplication,
                    ),
                    onBack: () => context.pop(),
                  ),
      ),
    );
  }
}

// ─── Body del detalle ─────────────────────────────────────────────────────────

class _DetalleBody extends StatelessWidget {
  final Turno turno;
  final bool tieneFactura;
  final bool accionando;
  final VoidCallback onAvanzar;
  final VoidCallback onCobrar;
  final VoidCallback onWhatsApp;
  final VoidCallback onBack;

  const _DetalleBody({
    required this.turno,
    required this.tieneFactura,
    required this.accionando,
    required this.onAvanzar,
    required this.onCobrar,
    required this.onWhatsApp,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        // ── AppBar con estado ────────────────────────────────────────
        SliverToBoxAdapter(
          child: Container(
            padding: EdgeInsets.fromLTRB(
                16, MediaQuery.of(context).padding.top + 12, 16, 20),
            decoration: const BoxDecoration(color: colorSuperficie),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GestureDetector(
                      onTap: onBack,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: colorSuperficieAlta,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: colorDivisor),
                        ),
                        child: const Icon(Icons.arrow_back_rounded,
                            size: 18, color: colorTexto),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Turno #${turno.id.substring(0, 8).toUpperCase()}',
                        style: GoogleFonts.barlowCondensed(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: colorTexto,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                    EstadoChip(estado: turno.estado),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  formatearFechaHora(
                      DateTime.tryParse(turno.fechaHora) ?? DateTime.now()),
                  style: GoogleFonts.dmSans(
                    color: colorSubtexto,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),

        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // ── Cliente ──────────────────────────────────────────────
              if (turno.cliente != null)
                _SeccionCard(
                  titulo: 'Cliente',
                  icono: Icons.person_rounded,
                  color: colorEnProceso,
                  children: [
                    _InfoFila(
                        label: 'Nombre',
                        valor: turno.cliente!.nombreCompleto),
                    if (turno.cliente!.telefono.isNotEmpty)
                      _InfoFila(
                          label: 'Teléfono', valor: turno.cliente!.telefono),
                  ],
                ),

              const SizedBox(height: 12),

              // ── Vehículo ─────────────────────────────────────────────
              if (turno.vehiculo != null)
                _SeccionCard(
                  titulo: 'Vehículo',
                  icono: Icons.directions_car_rounded,
                  color: colorPrimario,
                  children: [
                    _InfoFila(
                        label: 'Descripción',
                        valor: turno.vehiculo!.descripcion),
                    _InfoFila(label: 'Placa', valor: turno.vehiculo!.placa),
                    if (turno.vehiculo!.color != null)
                      _InfoFila(
                          label: 'Color', valor: turno.vehiculo!.color!),
                  ],
                ),

              const SizedBox(height: 12),

              // ── Servicio ─────────────────────────────────────────────
              if (turno.servicio != null)
                _SeccionCard(
                  titulo: 'Servicio',
                  icono: Icons.build_rounded,
                  color: colorPendiente,
                  children: [
                    _InfoFila(
                        label: 'Nombre', valor: turno.servicio!.nombre),
                    _InfoFila(
                        label: 'Precio',
                        valor: formatearPesos(turno.servicio!.precio)),
                    _InfoFila(
                        label: 'Duración',
                        valor: '${turno.servicio!.duracionMinutos} min'),
                  ],
                ),

              const SizedBox(height: 12),

              // ── Trabajador ───────────────────────────────────────────
              if (turno.trabajador != null)
                _SeccionCard(
                  titulo: 'Trabajador',
                  icono: Icons.engineering_rounded,
                  color: colorSubtexto,
                  children: [
                    _InfoFila(
                        label: 'Nombre',
                        valor: turno.trabajador!.nombreCompleto),
                  ],
                ),

              // ── Observaciones ────────────────────────────────────────
              if ((turno.observaciones ?? '').isNotEmpty) ...[
                const SizedBox(height: 12),
                _SeccionCard(
                  titulo: 'Observaciones',
                  icono: Icons.notes_rounded,
                  color: colorSubtexto,
                  children: [
                    Text(
                      turno.observaciones!,
                      style: GoogleFonts.dmSans(
                          color: colorTexto, fontSize: 14, height: 1.5),
                    ),
                  ],
                ),
              ],

              const SizedBox(height: 24),

              // ── Acciones ─────────────────────────────────────────────
              _buildAcciones(context),
            ]),
          ),
        ),
      ],
    );
  }

  Widget _buildAcciones(BuildContext context) {
    final esAdmin   = context.read<AuthProvider>().usuario?.rol == 'admin';
    final puedeCobrar =
        turno.estado == 'completado' && !tieneFactura && esAdmin;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (turno.estado != 'cancelado' &&
            !(turno.estado == 'completado' && tieneFactura))
          BotonPrimario(
            texto: puedeCobrar
                ? 'Cobrar'
                : turno.estado == 'pendiente'
                    ? 'Marcar En Proceso'
                    : 'Marcar Completado',
            icono: puedeCobrar
                ? Icons.payments_rounded
                : turno.estado == 'pendiente'
                    ? Icons.play_arrow_rounded
                    : Icons.check_circle_rounded,
            loading: accionando,
            onPressed: puedeCobrar ? onCobrar : onAvanzar,
          ),

        if ((turno.cliente?.telefono ?? '').isNotEmpty &&
            turno.estado != 'cancelado') ...[
          const SizedBox(height: 12),
          GestureDetector(
            onTap: onWhatsApp,
            child: Container(
              height: 52,
              decoration: BoxDecoration(
                color: colorPrimario.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: colorPrimario.withValues(alpha: 0.35)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.message_rounded,
                      size: 18, color: colorPrimario),
                  const SizedBox(width: 8),
                  Text(
                    'NOTIFICAR AL CLIENTE',
                    style: GoogleFonts.barlowCondensed(
                      color: colorPrimario,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

// ─── Sección card ─────────────────────────────────────────────────────────────

class _SeccionCard extends StatelessWidget {
  final String titulo;
  final IconData icono;
  final Color color;
  final List<Widget> children;

  const _SeccionCard({
    required this.titulo,
    required this.icono,
    required this.color,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: colorDivisor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header de la sección
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.07),
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16)),
              border: Border(
                  bottom: BorderSide(color: color.withValues(alpha: 0.2))),
            ),
            child: Row(
              children: [
                Icon(icono, size: 15, color: color),
                const SizedBox(width: 8),
                Text(
                  titulo.toUpperCase(),
                  style: GoogleFonts.barlowCondensed(
                    color: color,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
          // Contenido
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: children,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Fila de info ─────────────────────────────────────────────────────────────

class _InfoFila extends StatelessWidget {
  final String label;
  final String valor;

  const _InfoFila({required this.label, required this.valor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: GoogleFonts.dmSans(
                  color: colorSubtexto, fontSize: 12),
            ),
          ),
          Expanded(
            child: Text(
              valor,
              style: GoogleFonts.dmSans(
                  color: colorTexto,
                  fontSize: 14,
                  fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Error view ───────────────────────────────────────────────────────────────

class _ErrorView extends StatelessWidget {
  final String mensaje;
  const _ErrorView({required this.mensaje});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: colorCancelado.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: colorCancelado.withValues(alpha: 0.35)),
              ),
              child: const Icon(Icons.error_outline_rounded,
                  size: 32, color: colorCancelado),
            ),
            const SizedBox(height: 16),
            Text(
              mensaje,
              textAlign: TextAlign.center,
              style: GoogleFonts.dmSans(color: colorSubtexto, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}
