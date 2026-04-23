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

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<DashboardProvider>().cargar());
  }

  @override
  Widget build(BuildContext context) {
    final auth    = context.watch<AuthProvider>();
    final usuario = auth.usuario;
    final negocio = auth.config?.nombreMostrar;

    return Scaffold(
      body: Consumer<DashboardProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading && provider.turnos.isEmpty,
          child: RefreshIndicator(
            color: colorPrimario,
            backgroundColor: colorSuperficie,
            onRefresh: provider.cargar,
            child: CustomScrollView(
              slivers: [
                // ── Hero header ─────────────────────────────────────
                SliverToBoxAdapter(
                  child: _HeroHeader(
                    nombre:  usuario?.nombre ?? '',
                    negocio: negocio,
                    totalTurnos: provider.turnos.length,
                    totalIngresos: provider.totalDia,
                    onNuevoTurno: () => context.push('/turnos/nuevo'),
                  ),
                ),

                // ── Error ────────────────────────────────────────────
                if (provider.error != null)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: colorCancelado.withValues(alpha: 0.10),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: colorCancelado.withValues(alpha: 0.35)),
                        ),
                        child: Text(provider.error!,
                            style: const TextStyle(color: colorCancelado)),
                      ),
                    ),
                  ),

                // ── En proceso ───────────────────────────────────────
                if (provider.enProceso.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: _SeccionHeader(
                      label: 'En proceso',
                      color: colorEnProceso,
                      icono: Icons.autorenew_rounded,
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final t = provider.enProceso[i];
                          return CardTurno(
                            turno: t,
                            onTap: () => context.push('/turnos/${t.id}'),
                            onAvanzar: () => context.push(
                              t.puedeCobrar
                                  ? '/turnos/${t.id}/cobrar'
                                  : '/turnos/${t.id}',
                            ),
                          );
                        },
                        childCount: provider.enProceso.length,
                      ),
                    ),
                  ),
                ],

                // ── Pendientes ───────────────────────────────────────
                if (provider.pendientes.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: _SeccionHeader(
                      label: 'Pendientes',
                      color: colorPendiente,
                      icono: Icons.schedule_rounded,
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final t = provider.pendientes[i];
                          return CardTurno(
                            turno: t,
                            onTap: () => context.push('/turnos/${t.id}'),
                            onAvanzar: () =>
                                context.push('/turnos/${t.id}'),
                          );
                        },
                        childCount: provider.pendientes.length,
                      ),
                    ),
                  ),
                ],

                // ── Empty ────────────────────────────────────────────
                if (provider.turnos.isEmpty && !provider.loading)
                  const SliverFillRemaining(
                    child: EmptyState(
                      mensaje: 'No hay turnos para hoy',
                      icono: Icons.calendar_today_rounded,
                    ),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 120)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Hero header ──────────────────────────────────────────────────────────────

class _HeroHeader extends StatelessWidget {
  final String nombre;
  final String? negocio;
  final int totalTurnos;
  final double totalIngresos;
  final VoidCallback onNuevoTurno;

  const _HeroHeader({
    required this.nombre,
    required this.negocio,
    required this.totalTurnos,
    required this.totalIngresos,
    required this.onNuevoTurno,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 56, 16, 8),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            colorSuperficieAlta,
            const Color(0xFF0A2828),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: colorPrimario.withValues(alpha: 0.22)),
        boxShadow: [
          BoxShadow(
            color: colorPrimario.withValues(alpha: 0.10),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (negocio != null)
                Expanded(
                  child: Text(
                    negocio!.toUpperCase(),
                    style: GoogleFonts.barlowCondensed(
                      color: colorPrimario,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              GestureDetector(
                onTap: onNuevoTurno,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00D4BE), colorPrimario],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: colorPrimario.withValues(alpha: 0.38),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.add_rounded,
                          color: colorFondo, size: 16),
                      const SizedBox(width: 5),
                      Text(
                        'NUEVO',
                        style: GoogleFonts.barlowCondensed(
                          color: colorFondo,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: colorPrimario.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: colorPrimario.withValues(alpha: 0.3)),
                ),
                child: Text(
                  formatearFechaCorta(DateTime.now().toIso8601String()),
                  style: GoogleFonts.dmSans(
                    color: colorPrimario,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Hola, $nombre',
            style: GoogleFonts.barlowCondensed(
              fontSize: 32,
              fontWeight: FontWeight.w700,
              color: colorTexto,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _StatBox(
                  valor: totalTurnos.toString(),
                  label: 'Turnos hoy',
                  icono: Icons.assignment_rounded,
                  color: colorEnProceso,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatBox(
                  valor: formatearPesos(totalIngresos),
                  label: 'Ingresos',
                  icono: Icons.attach_money_rounded,
                  color: colorCompletado,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatBox extends StatelessWidget {
  final String valor;
  final String label;
  final IconData icono;
  final Color color;

  const _StatBox({
    required this.valor,
    required this.label,
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
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                valor,
                style: GoogleFonts.barlowCondensed(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: colorTexto,
                ),
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
        ],
      ),
    );
  }
}

// ─── Sección header ───────────────────────────────────────────────────────────

class _SeccionHeader extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icono;

  const _SeccionHeader({
    required this.label,
    required this.color,
    required this.icono,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 18,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Icon(icono, size: 15, color: color),
          const SizedBox(width: 6),
          Text(
            label.toUpperCase(),
            style: GoogleFonts.barlowCondensed(
              color: color,
              fontSize: 13,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}

