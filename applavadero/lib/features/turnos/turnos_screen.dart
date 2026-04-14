import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/card_turno.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/loading_overlay.dart';
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
    final fecha = DateTime.parse(provider.fechaFiltro);
    final picked = await showDatePicker(
      context: context,
      initialDate: fecha,
      firstDate: DateTime(2024),
      lastDate: DateTime.now().add(const Duration(days: 30)),
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
      appBar: AppBar(title: const Text('Turnos')),
      body: Consumer<TurnosProvider>(
        builder: (_, provider, __) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: OutlinedButton.icon(
                icon: const Icon(Icons.calendar_today, size: 16),
                label: Text(formatearFechaCorta(
                    '${provider.fechaFiltro}T00:00:00')),
                onPressed: _seleccionarFecha,
                style: OutlinedButton.styleFrom(
                  foregroundColor: colorTexto,
                  minimumSize: const Size(double.infinity, 44),
                ),
              ),
            ),
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FiltroChip(
                        label: 'Todos',
                        seleccionado: provider.estadoFiltro == null,
                        onTap: () => provider.setEstado(null)),
                    _FiltroChip(
                        label: 'Pendiente',
                        seleccionado:
                            provider.estadoFiltro == 'pendiente',
                        onTap: () => provider.setEstado('pendiente')),
                    _FiltroChip(
                        label: 'En proceso',
                        seleccionado:
                            provider.estadoFiltro == 'en_proceso',
                        onTap: () => provider.setEstado('en_proceso')),
                    _FiltroChip(
                        label: 'Completado',
                        seleccionado:
                            provider.estadoFiltro == 'completado',
                        onTap: () => provider.setEstado('completado')),
                    _FiltroChip(
                        label: 'Cancelado',
                        seleccionado:
                            provider.estadoFiltro == 'cancelado',
                        onTap: () => provider.setEstado('cancelado')),
                  ],
                ),
              ),
            ),
            Expanded(
              child: LoadingOverlay(
                loading:
                    provider.loading && provider.turnos.isEmpty,
                child: RefreshIndicator(
                  onRefresh: provider.cargar,
                  child: provider.turnos.isEmpty && !provider.loading
                      ? const EmptyState(
                          mensaje: 'No hay turnos',
                          icono: Icons.assignment_outlined)
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
                              onAvanzar: () => context.push(
                                  t.puedeCobrar
                                      ? '/turnos/${t.id}/cobrar'
                                      : '/turnos/${t.id}'),
                            );
                          },
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/turnos/nuevo'),
        backgroundColor: colorPrimario,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _FiltroChip extends StatelessWidget {
  final String label;
  final bool seleccionado;
  final VoidCallback onTap;

  const _FiltroChip(
      {required this.label,
      required this.seleccionado,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: seleccionado,
        onSelected: (_) => onTap(),
        backgroundColor: colorSuperficie,
        selectedColor: colorPrimario.withValues(alpha: 0.2),
        checkmarkColor: colorPrimario,
        labelStyle: TextStyle(
            color: seleccionado ? colorPrimario : colorSubtexto),
        side: BorderSide(
            color: seleccionado ? colorPrimario : colorDivisor),
      ),
    );
  }
}
