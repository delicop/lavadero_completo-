import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/models/cliente.dart';
import '../../core/models/vehiculo.dart';
import '../../core/models/servicio.dart';
import '../../core/models/usuario.dart';
import '../../core/services/cliente_service.dart';
import '../../core/services/vehiculo_service.dart';
import '../../core/services/servicio_service.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/turno_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/boton_primario.dart';
import '../../shared/widgets/input_field.dart';

class NuevoTurnoScreen extends StatefulWidget {
  const NuevoTurnoScreen({super.key});

  @override
  State<NuevoTurnoScreen> createState() => _NuevoTurnoScreenState();
}

class _NuevoTurnoScreenState extends State<NuevoTurnoScreen> {
  int _paso = 0;

  // Paso 1
  List<Cliente> _clientes = [];
  String _busqueda = '';
  Cliente? _clienteSeleccionado;
  List<Vehiculo> _vehiculos = [];
  Vehiculo? _vehiculoSeleccionado;

  // Paso 2
  List<Servicio> _servicios = [];
  Servicio? _servicioSeleccionado;

  // Paso 3
  List<Usuario> _trabajadores = [];
  Usuario? _trabajadorSeleccionado;
  final _obsCtrl = TextEditingController();

  bool _cargando = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  @override
  void dispose() {
    _obsCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargarDatos() async {
    if (!mounted) return;
    setState(() => _cargando = true);
    try {
      // Tres llamadas independientes en paralelo
      final futures = await Future.wait([
        context.read<ClienteService>().getClientes(),
        context.read<ServicioService>().getServicios(),
        context.read<AuthService>().getUsuarios(),
      ]);
      if (!mounted) return;
      setState(() {
        _clientes = futures[0] as List<Cliente>;
        _servicios = futures[1] as List<Servicio>;
        _trabajadores =
            (futures[2] as List<Usuario>).where((u) => u.activo).toList();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _cargando = false);
  }

  Future<void> _cargarVehiculos(String clienteId) async {
    final vehiculos =
        await context.read<VehiculoService>().getVehiculos(clienteId);
    setState(() {
      _vehiculos = vehiculos;
      _vehiculoSeleccionado = null;
    });
  }

  Future<void> _crearTurno() async {
    if (_clienteSeleccionado == null ||
        _vehiculoSeleccionado == null ||
        _servicioSeleccionado == null) return;

    setState(() => _cargando = true);
    try {
      await context.read<TurnoService>().crearTurno({
        'clienteId': _clienteSeleccionado!.id,
        'vehiculoId': _vehiculoSeleccionado!.id,
        'servicioId': _servicioSeleccionado!.id,
        if (_trabajadorSeleccionado != null)
          'trabajadorId': _trabajadorSeleccionado!.id,
        if (_obsCtrl.text.isNotEmpty) 'observaciones': _obsCtrl.text,
        'fechaHora': DateTime.now().toIso8601String(),
      });
      if (mounted) context.pop();
    } catch (e) {
      setState(() => _error = e.toString());
    }
    setState(() => _cargando = false);
  }

  List<Cliente> get _clientesFiltrados {
    if (_busqueda.isEmpty) return _clientes;
    final q = _busqueda.toLowerCase();
    return _clientes
        .where((c) =>
            c.nombreCompleto.toLowerCase().contains(q) ||
            c.telefono.contains(q))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Nuevo Turno — Paso ${_paso + 1} de 3'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _paso == 0 ? () => context.pop() : () => setState(() => _paso--),
        ),
      ),
      body: _cargando && _clientes.isEmpty
          ? const Center(child: CircularProgressIndicator(color: colorPrimario))
          : [_buildPaso1(), _buildPaso2(), _buildPaso3()][_paso],
    );
  }

  Widget _buildPaso1() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            decoration: const InputDecoration(
              hintText: 'Buscar cliente...',
              prefixIcon: Icon(Icons.search, color: colorSubtexto),
            ),
            onChanged: (v) => setState(() => _busqueda = v),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _clientesFiltrados.length,
            itemBuilder: (ctx, i) {
              final c = _clientesFiltrados[i];
              final seleccionado = _clienteSeleccionado?.id == c.id;
              return ListTile(
                selected: seleccionado,
                selectedTileColor: colorPrimario.withValues(alpha: 0.1),
                leading: CircleAvatar(
                  backgroundColor: seleccionado
                      ? colorPrimario
                      : colorPrimario.withValues(alpha: 0.2),
                  child: Text(c.nombre[0].toUpperCase(),
                      style: const TextStyle(color: Colors.white)),
                ),
                title: Text(c.nombreCompleto),
                subtitle: Text(c.telefono,
                    style: const TextStyle(color: colorSubtexto)),
                onTap: () async {
                  setState(() => _clienteSeleccionado = c);
                  await _cargarVehiculos(c.id);
                },
              );
            },
          ),
        ),
        if (_clienteSeleccionado != null) ...[
          const Divider(),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
            child: Text('Vehículo de ${_clienteSeleccionado!.nombre}',
                style: const TextStyle(
                    fontWeight: FontWeight.w600, fontSize: 15)),
          ),
          ..._vehiculos.map((v) => RadioListTile<Vehiculo>(
                value: v,
                groupValue: _vehiculoSeleccionado,
                activeColor: colorPrimario,
                title: Text(v.descripcion),
                subtitle: Text(v.descripcionCompleta,
                    style: const TextStyle(color: colorSubtexto)),
                onChanged: (val) =>
                    setState(() => _vehiculoSeleccionado = val),
              )),
          if (_vehiculos.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Sin vehículos registrados',
                  style: TextStyle(color: colorSubtexto)),
            ),
        ],
        Padding(
          padding: const EdgeInsets.all(16),
          child: BotonPrimario(
            texto: 'Siguiente',
            onPressed: _clienteSeleccionado != null &&
                    _vehiculoSeleccionado != null
                ? () => setState(() => _paso = 1)
                : null,
          ),
        ),
      ],
    );
  }

  Widget _buildPaso2() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _servicios.length,
            itemBuilder: (ctx, i) {
              final s = _servicios[i];
              final seleccionado = _servicioSeleccionado?.id == s.id;
              return Card(
                color: seleccionado
                    ? colorPrimario.withValues(alpha: 0.15)
                    : colorSuperficie,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                      color: seleccionado ? colorPrimario : colorDivisor),
                ),
                child: ListTile(
                  title: Text(s.nombre,
                      style:
                          const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text(
                      '${formatearPesos(s.precio)} · ${s.duracionMinutos} min',
                      style: const TextStyle(color: colorSubtexto)),
                  trailing: seleccionado
                      ? const Icon(Icons.check_circle,
                          color: colorPrimario)
                      : null,
                  onTap: () =>
                      setState(() => _servicioSeleccionado = s),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: BotonPrimario(
            texto: 'Siguiente',
            onPressed: _servicioSeleccionado != null
                ? () => setState(() => _paso = 2)
                : null,
          ),
        ),
      ],
    );
  }

  Widget _buildPaso3() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Asignar a:',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 15)),
          ..._trabajadores.map((u) => RadioListTile<Usuario>(
                value: u,
                groupValue: _trabajadorSeleccionado,
                activeColor: colorPrimario,
                title: Text(u.nombreCompleto),
                subtitle: Text(u.rol,
                    style: const TextStyle(color: colorSubtexto)),
                onChanged: (val) =>
                    setState(() => _trabajadorSeleccionado = val),
              )),
          const SizedBox(height: 16),
          InputField(
            label: 'Observaciones (opcional)',
            controller: _obsCtrl,
            maxLines: 3,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!,
                style: const TextStyle(color: colorCancelado)),
          ],
          const SizedBox(height: 24),
          BotonPrimario(
            texto: 'Crear turno ✓',
            loading: _cargando,
            onPressed: _crearTurno,
          ),
        ],
      ),
    );
  }
}
