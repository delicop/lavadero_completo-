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

class MisTurnosScreen extends StatefulWidget {
  const MisTurnosScreen({super.key});

  @override
  State<MisTurnosScreen> createState() => _MisTurnosScreenState();
}

class _MisTurnosScreenState extends State<MisTurnosScreen> {
  @override
  void initState() {
    super.initState();
    final usuario = context.read<AuthProvider>().usuario!;
    Future.microtask(() =>
        context.read<DashboardProvider>().cargar(trabajadorId: usuario.id));
  }

  @override
  Widget build(BuildContext context) {
    final usuario = context.read<AuthProvider>().usuario!;

    return Scaffold(
      appBar: AppBar(
        title: Text('Mis Turnos — ${usuario.nombre}'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<DashboardProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading && provider.turnos.isEmpty,
          child: RefreshIndicator(
            onRefresh: () => provider.cargar(trabajadorId: usuario.id),
            child: Column(
              children: [
                if (provider.turnos.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        _MiniStat(
                          label: 'Turnos',
                          valor: provider.turnos.length.toString(),
                        ),
                        const SizedBox(width: 12),
                        _MiniStat(
                          label: 'Mi ganancia',
                          valor: formatearPesos(provider.totalDia *
                              (usuario.comisionPorcentaje ?? 0) /
                              100),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: provider.turnos.isEmpty && !provider.loading
                      ? const EmptyState(
                          mensaje: 'No tenés turnos para hoy',
                          icono: Icons.assignment_outlined,
                        )
                      : ListView.builder(
                          padding:
                              const EdgeInsets.fromLTRB(16, 0, 16, 80),
                          itemCount: provider.turnos.length,
                          itemBuilder: (ctx, i) {
                            final t = provider.turnos[i];
                            return CardTurno(
                              turno: t,
                              onTap: () =>
                                  context.push('/turnos/${t.id}'),
                              onAvanzar: () =>
                                  context.push('/turnos/${t.id}'),
                            );
                          },
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

class _MiniStat extends StatelessWidget {
  final String label;
  final String valor;
  const _MiniStat({required this.label, required this.valor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: colorSuperficie,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: colorDivisor),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(valor,
                style: const TextStyle(
                    fontSize: 18, fontWeight: FontWeight.w800)),
            Text(label,
                style: const TextStyle(color: colorSubtexto, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
