import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/models/cliente.dart';
import '../../core/models/vehiculo.dart';
import '../../core/services/cliente_service.dart';
import '../../core/services/vehiculo_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/input_field.dart';
import 'clientes_provider.dart';

class ClienteDetalleScreen extends StatefulWidget {
  final String clienteId;
  const ClienteDetalleScreen({super.key, required this.clienteId});

  @override
  State<ClienteDetalleScreen> createState() => _ClienteDetalleScreenState();
}

class _ClienteDetalleScreenState extends State<ClienteDetalleScreen> {
  Cliente? _cliente;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    try {
      final cliente =
          await context.read<ClienteService>().getCliente(widget.clienteId);
      await context
          .read<ClientesProvider>()
          .cargarVehiculos(widget.clienteId);
      if (mounted) setState(() { _cliente = cliente; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _mostrarNuevoVehiculo() async {
    final marcaCtrl = TextEditingController();
    final modeloCtrl = TextEditingController();
    final patenteCtrl = TextEditingController();
    final colorCtrl = TextEditingController();
    String tipo = 'auto';

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setS) => AlertDialog(
          backgroundColor: colorSuperficie,
          title: const Text('Nuevo vehículo'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                InputField(label: 'Marca', controller: marcaCtrl),
                const SizedBox(height: 12),
                InputField(label: 'Modelo', controller: modeloCtrl),
                const SizedBox(height: 12),
                InputField(label: 'Patente', controller: patenteCtrl),
                const SizedBox(height: 12),
                InputField(label: 'Color (opcional)', controller: colorCtrl),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: tipo,
                  decoration: const InputDecoration(labelText: 'Tipo'),
                  items: const [
                    DropdownMenuItem(value: 'auto', child: Text('Auto')),
                    DropdownMenuItem(value: 'moto', child: Text('Moto')),
                    DropdownMenuItem(
                        value: 'camioneta', child: Text('Camioneta')),
                  ],
                  onChanged: (v) => setS(() => tipo = v ?? 'auto'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancelar')),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await context.read<VehiculoService>().crearVehiculo({
                    'clienteId': widget.clienteId,
                    'marca': marcaCtrl.text.trim(),
                    'modelo': modeloCtrl.text.trim(),
                    'patente': patenteCtrl.text.trim().toUpperCase(),
                    if (colorCtrl.text.isNotEmpty)
                      'color': colorCtrl.text.trim(),
                    'tipo': tipo,
                  });
                  if (mounted) {
                    await context
                        .read<ClientesProvider>()
                        .cargarVehiculos(widget.clienteId);
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString())));
                  }
                }
              },
              child: const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_cliente?.nombreCompleto ?? 'Cliente'),
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop()),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: colorPrimario))
          : _error != null
              ? Center(
                  child: Text(_error!,
                      style: const TextStyle(color: colorCancelado)))
              : Consumer<ClientesProvider>(
                  builder: (_, provider, __) => ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_cliente!.nombreCompleto,
                                  style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w700)),
                              const SizedBox(height: 8),
                              Row(children: [
                                const Icon(Icons.phone,
                                    size: 16, color: colorSubtexto),
                                const SizedBox(width: 6),
                                Text(_cliente!.telefono,
                                    style: const TextStyle(
                                        color: colorSubtexto)),
                              ]),
                              if (_cliente!.email != null) ...[
                                const SizedBox(height: 4),
                                Row(children: [
                                  const Icon(Icons.email,
                                      size: 16, color: colorSubtexto),
                                  const SizedBox(width: 6),
                                  Text(_cliente!.email!,
                                      style: const TextStyle(
                                          color: colorSubtexto)),
                                ]),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('VEHÍCULOS',
                              style: TextStyle(
                                  color: colorSubtexto,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1)),
                          TextButton.icon(
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Agregar'),
                            onPressed: _mostrarNuevoVehiculo,
                          ),
                        ],
                      ),
                      if (provider.vehiculosCliente.isEmpty)
                        const EmptyState(
                            mensaje: 'Sin vehículos registrados',
                            icono: Icons.directions_car_outlined)
                      else
                        ...provider.vehiculosCliente
                            .map((v) => _VehiculoCard(vehiculo: v)),
                    ],
                  ),
                ),
    );
  }
}

class _VehiculoCard extends StatelessWidget {
  final Vehiculo vehiculo;
  const _VehiculoCard({required this.vehiculo});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.directions_car, color: colorPrimario),
        title: Text(vehiculo.descripcion),
        subtitle: Text(
          '${vehiculo.patente}${vehiculo.color != null ? ' · ${vehiculo.color}' : ''}',
          style: const TextStyle(color: colorSubtexto),
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: colorPrimario.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(vehiculo.tipo,
              style:
                  const TextStyle(color: colorPrimario, fontSize: 12)),
        ),
      ),
    );
  }
}
