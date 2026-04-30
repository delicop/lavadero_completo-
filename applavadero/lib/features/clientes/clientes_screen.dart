import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'clientes_provider.dart';

class ClientesScreen extends StatefulWidget {
  const ClientesScreen({super.key});

  @override
  State<ClientesScreen> createState() => _ClientesScreenState();
}

class _ClientesScreenState extends State<ClientesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<ClientesProvider>().cargar());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clientes'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => context.push('/clientes/nuevo'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: colorPrimario,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add_rounded, color: Colors.white, size: 16),
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
          ),
        ],
      ),
      body: Consumer<ClientesProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading && provider.clientes.isEmpty,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  decoration: const InputDecoration(
                    hintText: 'Buscar cliente...',
                    prefixIcon:
                        Icon(Icons.search, color: colorSubtexto),
                  ),
                  onChanged: provider.setBusqueda,
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: provider.cargar,
                  child: provider.clientesFiltrados.isEmpty &&
                          !provider.loading
                      ? const EmptyState(
                          mensaje: 'No hay clientes',
                          icono: Icons.people_outline)
                      : ListView.builder(
                          padding:
                              const EdgeInsets.fromLTRB(16, 0, 16, 80),
                          itemCount: provider.clientesFiltrados.length,
                          itemBuilder: (ctx, i) {
                            final c = provider.clientesFiltrados[i];
                            return Card(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: colorPrimario
                                      .withValues(alpha: 0.2),
                                  child: Text(
                                      c.nombre[0].toUpperCase(),
                                      style: const TextStyle(
                                          color: colorPrimario,
                                          fontWeight:
                                              FontWeight.w700)),
                                ),
                                title: Text(c.nombreCompleto),
                                subtitle: Text(c.telefono,
                                    style: const TextStyle(
                                        color: colorSubtexto)),
                                trailing: const Icon(
                                    Icons.chevron_right,
                                    color: colorSubtexto),
                                onTap: () =>
                                    context.push('/clientes/${c.id}'),
                              ),
                            );
                          },
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
