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
                SliverToBoxAdapter(
                  child: Container(
                    color: colorSuperficie,
                    padding: EdgeInsets.fromLTRB(
                        20, MediaQuery.of(context).padding.top + 20, 20, 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (usuario != null)
                          Text(
                            usuario.nombreCompleto,
                            style: GoogleFonts.dmSans(
                              fontSize: 13,
                              color: colorSubtexto,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        const SizedBox(height: 4),
                        Text(
                          'Mis Turnos',
                          style: GoogleFonts.playfairDisplay(
                            fontSize: 30,
                            fontWeight: FontWeight.w700,
                            color: colorTexto,
                          ),
                        ),
                        if (provider.turnos.isNotEmpty) ...[
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: _StatTrabajador(
                                  label: 'Turnos',
                                  valor: provider.turnos.length.toString(),
                                  icono: Icons.assignment_outlined,
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
                                  icono: Icons.monetization_on_outlined,
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

                if (provider.turnos.isEmpty && !provider.loading)
                  const SliverFillRemaining(
                    child: EmptyState(
                      mensaje: 'No tenés turnos para hoy',
                      icono: Icons.assignment_outlined,
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 120),
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
                    fontSize: 16,
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
