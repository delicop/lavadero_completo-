import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
    final usuario = context.read<AuthProvider>().usuario!;

    return Scaffold(
      body: Consumer<DashboardProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading && provider.turnos.isEmpty,
          child: RefreshIndicator(
            onRefresh: provider.cargar,
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  floating: true,
                  backgroundColor: colorFondo,
                  automaticallyImplyLeading: false,
                  title: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Hola, ${usuario.nombre} 👋',
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w700)),
                      Text(
                          formatearFecha(DateTime.now().toIso8601String()),
                          style: const TextStyle(
                              fontSize: 13, color: colorSubtexto)),
                    ],
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        _StatCard(
                          label: 'Turnos hoy',
                          valor: provider.turnos.length.toString(),
                          icono: Icons.assignment,
                        ),
                        const SizedBox(width: 12),
                        _StatCard(
                          label: 'Ingresos',
                          valor: formatearPesos(provider.totalDia),
                          icono: Icons.attach_money,
                        ),
                      ],
                    ),
                  ),
                ),
                if (provider.error != null)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(provider.error!,
                          style: const TextStyle(color: colorCancelado)),
                    ),
                  ),
                if (provider.enProceso.isNotEmpty) ...[
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
                      child: Text('EN PROCESO',
                          style: TextStyle(
                              color: colorSubtexto,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1)),
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
                                    : '/turnos/${t.id}'),
                          );
                        },
                        childCount: provider.enProceso.length,
                      ),
                    ),
                  ),
                ],
                if (provider.pendientes.isNotEmpty) ...[
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(16, 16, 16, 4),
                      child: Text('PENDIENTES',
                          style: TextStyle(
                              color: colorSubtexto,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1)),
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
                        icono: Icons.calendar_today),
                  ),
                const SliverToBoxAdapter(child: SizedBox(height: 80)),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/turnos/nuevo'),
        backgroundColor: colorPrimario,
        icon: const Icon(Icons.add),
        label: const Text('Nuevo turno'),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String valor;
  final IconData icono;

  const _StatCard(
      {required this.label, required this.valor, required this.icono});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: colorSuperficie,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: colorDivisor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icono, color: colorPrimario, size: 20),
            const SizedBox(height: 8),
            Text(valor,
                style: const TextStyle(
                    fontSize: 22, fontWeight: FontWeight.w800)),
            Text(label,
                style: const TextStyle(
                    color: colorSubtexto, fontSize: 13)),
          ],
        ),
      ),
    );
  }
}
