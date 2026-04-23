import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/auth/auth_provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/card_turno.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'dashboard_provider.dart';

class MisTurnosScreen extends StatefulWidget {
  const MisTurnosScreen({super.key});

  @override
  State<MisTurnosScreen> createState() => _MisTurnosScreenState();
}

class _MisTurnosScreenState extends State<MisTurnosScreen> {
  @override
  void initState() {
    super.initState();
    final usuario = context.read<AuthProvider>().usuario;
    if (usuario != null) {
      Future.microtask(() =>
          context.read<DashboardProvider>().cargar(trabajadorId: usuario.id));
    }
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.read<AuthProvider>().usuario;

    return Scaffold(
      body: Consumer<DashboardProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading && provider.turnos.isEmpty,
          child: RefreshIndicator(
            color: colorPrimario,
            backgroundColor: colorSuperficie,
            onRefresh: () => provider.cargar(trabajadorId: usuario?.id),
            child: CustomScrollView(
              slivers: [
                // ── Header personal ──────────────────────────────────
                SliverToBoxAdapter(
                  child: Container(
                    padding: EdgeInsets.fromLTRB(
                        16, MediaQuery.of(context).padding.top + 16, 16, 20),
                    decoration: const BoxDecoration(
                      color: colorSuperficie,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'MIS TURNOS',
                          style: GoogleFonts.barlowCondensed(
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            color: colorTexto,
                            letterSpacing: 1.5,
                          ),
                        ),
                        if (usuario != null)
                          Text(
                            usuario.nombreCompleto,
                            style: GoogleFonts.dmSans(
                              fontSize: 14,
                              color: colorSubtexto,
                            ),
                          ),
                        if (provider.turnos.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _StatTrabajador(
                                  label: 'Turnos',
                                  valor: provider.turnos.length.toString(),
                                  icono: Icons.assignment_rounded,
                                  color: colorEnProceso,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _StatTrabajador(
                                  label: 'Mi ganancia',
                                  valor: formatearPesos(
                                    provider.totalDia *
                                        (usuario?.comisionPorcentaje ?? 0) /
                                        100,
                                  ),
                                  icono: Icons.monetization_on_rounded,
                                  color: colorCompletado,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),

                // ── Lista de turnos ───────────────────────────────────
                if (provider.turnos.isEmpty && !provider.loading)
                  const SliverFillRemaining(
                    child: EmptyState(
                      mensaje: 'No tenés turnos para hoy',
                      icono: Icons.assignment_outlined,
                    ),
                  )
                else
                  SliverPadding(
                    padding:
                        const EdgeInsets.fromLTRB(16, 12, 16, 120),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final t = provider.turnos[i];
                          return CardTurno(
                            turno: t,
                            onTap: () => context.push('/turnos/${t.id}'),
                            onAvanzar: () =>
                                context.push('/turnos/${t.id}'),
                          );
                        },
                        childCount: provider.turnos.length,
                      ),
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

class _StatTrabajador extends StatelessWidget {
  final String label;
  final String valor;
  final IconData icono;
  final Color color;

  const _StatTrabajador({
    required this.label,
    required this.valor,
    required this.icono,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(icono, color: color, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  valor,
                  style: GoogleFonts.barlowCondensed(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: colorTexto,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: GoogleFonts.dmSans(
                    fontSize: 11,
                    color: colorSubtexto,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
