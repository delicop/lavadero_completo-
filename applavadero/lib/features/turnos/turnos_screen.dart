import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/card_turno.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/loading_overlay.dart';
import '../caja/caja_provider.dart';
import 'turnos_provider.dart';

class TurnosScreen extends StatefulWidget {
  const TurnosScreen({super.key});

  @override
  State<TurnosScreen> createState() => _TurnosScreenState();
}

class _TurnosScreenState extends State<TurnosScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<TurnosProvider>().cargar());
  }

  Future<void> _seleccionarFecha() async {
    final provider = context.read<TurnosProvider>();
    final fecha    = DateTime.parse(provider.fechaFiltro);
    final picked   = await showDatePicker(
      context: context,
      initialDate: fecha,
      firstDate: DateTime(2024),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: colorPrimario,
            surface: colorSuperficie,
            onSurface: colorTexto,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null && mounted) {
      final iso =
          '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
      provider.setFecha(iso);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer2<TurnosProvider, CajaProvider>(
        builder: (_, provider, caja, __) => Column(
          children: [
            // ── Header ───────────────────────────────────────────────
            Container(
              color: colorSuperficie,
              padding: EdgeInsets.fromLTRB(
                  16, MediaQuery.of(context).padding.top + 12, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'TURNOS',
                        style: GoogleFonts.barlowCondensed(
                          fontSize: 26,
                          fontWeight: FontWeight.w700,
                          color: colorTexto,
                          letterSpacing: 1.5,
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: () => context.push('/turnos/nuevo'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF00D4BE), colorPrimario],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: colorPrimario.withValues(alpha: 0.38),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.add_rounded,
                                  color: colorFondo, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                'NUEVO',
                                style: GoogleFonts.barlowCondensed(
                                  color: colorFondo,
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
                  ),
                  const SizedBox(height: 12),

                  // Selector de fecha
                  GestureDetector(
                    onTap: _seleccionarFecha,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 11),
                      decoration: BoxDecoration(
                        color: colorSuperficieAlta,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: colorDivisor),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded,
                              size: 16, color: colorPrimario),
                          const SizedBox(width: 10),
                          Text(
                            formatearFechaCorta(
                                '${provider.fechaFiltro}T00:00:00'),
                            style: GoogleFonts.dmSans(
                              color: colorTexto,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.expand_more_rounded,
                              size: 18, color: colorSubtexto),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Filtros de estado
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FiltroBtn(
                          label: 'Todos',
                          seleccionado: provider.estadoFiltro == null,
                          color: colorSubtexto,
                          onTap: () => provider.setEstado(null),
                        ),
                        _FiltroBtn(
                          label: 'Pendiente',
                          seleccionado:
                              provider.estadoFiltro == 'pendiente',
                          color: colorPendiente,
                          onTap: () => provider.setEstado('pendiente'),
                        ),
                        _FiltroBtn(
                          label: 'En proceso',
                          seleccionado:
                              provider.estadoFiltro == 'en_proceso',
                          color: colorEnProceso,
                          onTap: () => provider.setEstado('en_proceso'),
                        ),
                        _FiltroBtn(
                          label: 'Completado',
                          seleccionado:
                              provider.estadoFiltro == 'completado',
                          color: colorCompletado,
                          onTap: () => provider.setEstado('completado'),
                        ),
                        _FiltroBtn(
                          label: 'Cancelado',
                          seleccionado:
                              provider.estadoFiltro == 'cancelado',
                          color: colorCancelado,
                          onTap: () => provider.setEstado('cancelado'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // ── Aviso caja cerrada ────────────────────────────────────
            if (caja.vista != VistaCaja.abierta)
              Container(
                width: double.infinity,
                color: colorPendiente.withValues(alpha: 0.10),
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded,
                        color: colorPendiente, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Abrí la caja antes de crear un turno',
                        style: GoogleFonts.dmSans(
                          color: colorPendiente,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // ── Lista ─────────────────────────────────────────────────
            Expanded(
              child: LoadingOverlay(
                loading:
                    provider.loading && provider.turnos.isEmpty,
                child: RefreshIndicator(
                  color: colorPrimario,
                  backgroundColor: colorSuperficie,
                  onRefresh: provider.cargar,
                  child: provider.turnos.isEmpty && !provider.loading
                      ? const EmptyState(
                          mensaje: 'No hay turnos',
                          icono: Icons.assignment_outlined,
                        )
                      : ListView.builder(
                          padding:
                              const EdgeInsets.fromLTRB(16, 12, 16, 120),
                          itemCount: provider.turnos.length,
                          itemBuilder: (ctx, i) {
                            final t = provider.turnos[i];
                            return CardTurno(
                              turno: t,
                              onTap: () =>
                                  context.push('/turnos/${t.id}'),
                              onAvanzar: () => context.push(
                                t.puedeCobrar
                                    ? '/turnos/${t.id}/cobrar'
                                    : '/turnos/${t.id}',
                              ),
                            );
                          },
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Botón de filtro ─────────────────────────────────────────────────────────

class _FiltroBtn extends StatelessWidget {
  final String label;
  final bool seleccionado;
  final Color color;
  final VoidCallback onTap;

  const _FiltroBtn({
    required this.label,
    required this.seleccionado,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: seleccionado
              ? color.withValues(alpha: 0.15)
              : colorSuperficieAlta,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: seleccionado
                ? color.withValues(alpha: 0.5)
                : colorDivisor,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.dmSans(
            fontSize: 12,
            fontWeight: seleccionado ? FontWeight.w700 : FontWeight.w500,
            color: seleccionado ? color : colorSubtexto,
          ),
        ),
      ),
    );
  }
}
