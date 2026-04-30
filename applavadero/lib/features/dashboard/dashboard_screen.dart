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
                SliverToBoxAdapter(
                  child: _Header(
                    nombre:        usuario?.nombre ?? '',
                    negocio:       negocio,
                    totalTurnos:   provider.turnos.length,
                    totalIngresos: provider.totalDia,
                    onNuevoTurno:  () => context.push('/turnos/nuevo'),
                  ),
                ),

                if (provider.error != null)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: colorCancelado.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: colorCancelado.withValues(alpha: 0.25)),
                        ),
                        child: Text(provider.error!,
                            style: const TextStyle(
                                color: colorCancelado, fontSize: 13)),
                      ),
                    ),
                  ),

                if (provider.enProceso.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: _SeccionHeader(
                      label: 'En proceso',
                      color: colorEnProceso,
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

                if (provider.pendientes.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: _SeccionHeader(
                      label: 'Pendientes',
                      color: colorPendiente,
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

                if (provider.turnos.isEmpty && !provider.loading)
                  const SliverFillRemaining(
                    child: EmptyState(
                      mensaje: 'No hay turnos para hoy',
                      icono: Icons.calendar_today_outlined,
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

// ─── Header ───────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  final String nombre;
  final String? negocio;
  final int totalTurnos;
  final double totalIngresos;
  final VoidCallback onNuevoTurno;

  const _Header({
    required this.nombre,
    required this.negocio,
    required this.totalTurnos,
    required this.totalIngresos,
    required this.onNuevoTurno,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: colorSuperficie,
      padding: EdgeInsets.fromLTRB(
          20, MediaQuery.of(context).padding.top + 20, 20, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (negocio != null)
                Expanded(
                  child: Text(
                    negocio!,
                    style: GoogleFonts.dmSans(
                      color: colorSubtexto,
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: colorSuperficieAlta,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: colorDivisor),
                ),
                child: Text(
                  formatearFechaCorta(DateTime.now().toIso8601String()),
                  style: GoogleFonts.dmSans(
                    color: colorSubtexto,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: onNuevoTurno,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: colorPrimario,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.add_rounded,
                          color: Colors.white, size: 16),
                      const SizedBox(width: 5),
                      Text(
                        'Nuevo',
                        style: GoogleFonts.dmSans(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Text(
            'Hola, $nombre',
            style: GoogleFonts.playfairDisplay(
              fontSize: 30,
              fontWeight: FontWeight.w700,
              color: colorTexto,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Resumen del día',
            style: GoogleFonts.dmSans(fontSize: 14, color: colorSubtexto),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _StatBox(
                  valor: totalTurnos.toString(),
                  label: 'Turnos hoy',
                  icono: Icons.assignment_outlined,
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
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: colorFondo,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorDivisor),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icono, color: color, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  valor,
                  style: GoogleFonts.playfairDisplay(
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

// ─── Sección header ───────────────────────────────────────────────────────────

class _SeccionHeader extends StatelessWidget {
  final String label;
  final Color color;

  const _SeccionHeader({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Row(
        children: [
          Container(
            width: 3,
            height: 16,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: GoogleFonts.dmSans(
              color: colorTexto,
              fontSize: 14,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
