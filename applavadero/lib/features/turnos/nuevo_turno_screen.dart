import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/models/cliente.dart';
import '../../core/models/vehiculo.dart';
import '../../core/models/servicio.dart';
import '../../core/models/usuario.dart';
import '../../core/services/cliente_service.dart';
import '../../core/services/vehiculo_service.dart';
import '../../core/services/servicio_service.dart';
import '../../core/services/auth_service.dart';
import '../../core/services/turno_service.dart';
import '../../core/models/caja.dart';
import '../../core/services/caja_service.dart';
import 'turnos_provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/utils/whatsapp.dart';
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
  DateTime _fechaHora = DateTime.now();
  final _obsCtrl = TextEditingController();

  bool _cargando = false;
  bool _cajaCerrada = false;
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
      final results = await Future.wait([
        context.read<ClienteService>().getClientes(),
        context.read<ServicioService>().getServicios(),
        context.read<AuthService>().getUsuarios(),
        context.read<CajaService>().getEstado(),
      ]);
      if (!mounted) return;

      final estadoCaja = results[3] as EstadoCaja;
      final cajaAbierta = estadoCaja.cajaHoy?.estaAbierta == true;

      setState(() {
        _cajaCerrada = !cajaAbierta;
        _clientes = results[0] as List<Cliente>;
        _servicios = results[1] as List<Servicio>;
        _trabajadores = (results[2] as List<Usuario>)
            .where((u) => u.rol == 'trabajador' && u.activo)
            .toList();
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

  Future<void> _seleccionarFechaHora() async {
    final fecha = await showDatePicker(
      context: context,
      initialDate: _fechaHora,
      firstDate: DateTime.now().subtract(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (fecha == null || !mounted) return;
    final hora = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_fechaHora),
    );
    if (hora == null) return;
    setState(() {
      _fechaHora = DateTime(
          fecha.year, fecha.month, fecha.day, hora.hour, hora.minute);
    });
  }

  Future<void> _crearTurno() async {
    if (_clienteSeleccionado == null ||
        _vehiculoSeleccionado == null ||
        _servicioSeleccionado == null ||
        _trabajadorSeleccionado == null) return;

    setState(() => _cargando = true);
    try {
      final turnoCreado = await context.read<TurnoService>().crearTurno({
        'clienteId': _clienteSeleccionado!.id,
        'vehiculoId': _vehiculoSeleccionado!.id,
        'servicioId': _servicioSeleccionado!.id,
        if (_trabajadorSeleccionado != null)
          'trabajadorId': _trabajadorSeleccionado!.id,
        if (_obsCtrl.text.isNotEmpty) 'observaciones': _obsCtrl.text,
        'fechaHora': _fechaHora.toIso8601String(),
      });
      if (!mounted) return;

      // Recargar la lista de turnos para que aparezca el recién creado
      context.read<TurnosProvider>().cargar();

      // Notificación WhatsApp al cliente (igual que el web)
      final tel = _clienteSeleccionado!.telefono;
      if (tel.isNotEmpty) {
        final v = _vehiculoSeleccionado!;
        final s = _servicioSeleccionado!;
        final fechaFormato = formatearFechaHora(
            DateTime.tryParse(turnoCreado.fechaHora) ?? _fechaHora);
        final mensaje =
            '📅 Orden agendada\n'
            'Vehículo: ${v.placa} — ${v.marca} ${v.modelo}\n'
            'Servicio: ${s.nombre}\n'
            'Fecha: $fechaFormato\n'
            '¡Te esperamos!';
        final url = urlWhatsapp(tel, mensaje: mensaje);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('📅 Orden creada — avisar al cliente'),
            backgroundColor: colorCompletado,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 6),
            action: SnackBarAction(
              label: 'WhatsApp',
              textColor: Colors.white,
              onPressed: () => launchUrl(
                Uri.parse(url),
                mode: LaunchMode.externalApplication,
              ),
            ),
          ),
        );
      }

      context.pop();
    } catch (e) {
      setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _cargando = false);
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
          onPressed:
              _paso == 0 ? () => context.pop() : () => setState(() => _paso--),
        ),
      ),
      body: _cajaCerrada
          ? _buildCajaCerrada()
          : _cargando && _clientes.isEmpty
              ? const Center(
                  child: CircularProgressIndicator(color: colorPrimario))
              : [_buildPaso1(), _buildPaso2(), _buildPaso3()][_paso],
    );
  }

  Widget _buildCajaCerrada() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lock_outline, size: 64, color: colorSubtexto),
            const SizedBox(height: 16),
            const Text(
              'Caja cerrada',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text(
              'Abrí la caja del día antes de crear un nuevo turno.',
              textAlign: TextAlign.center,
              style: TextStyle(color: colorSubtexto),
            ),
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => context.pop(),
              child: const Text('Volver'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaso1() {
    return Column(
      children: [
        if (_error != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: colorCancelado, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(_error!,
                      style: const TextStyle(color: colorCancelado, fontSize: 13)),
                ),
                TextButton(
                  onPressed: () {
                    setState(() => _error = null);
                    _cargarDatos();
                  },
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
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
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: BotonPrimario(
              texto: 'Siguiente',
              onPressed: _clienteSeleccionado != null &&
                      _vehiculoSeleccionado != null
                  ? () => setState(() => _paso = 1)
                  : null,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaso2() {
    return Column(
      children: [
        Expanded(
          child: _servicios.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.car_repair, size: 48, color: colorSubtexto),
                      SizedBox(height: 12),
                      Text('No hay servicios registrados',
                          style: TextStyle(color: colorSubtexto)),
                    ],
                  ),
                )
              : ListView.builder(
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
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: BotonPrimario(
              texto: 'Siguiente',
              onPressed: _servicioSeleccionado != null
                  ? () => setState(() => _paso = 2)
                  : null,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPaso3() {
    return SingleChildScrollView(
      padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + MediaQuery.of(context).padding.bottom),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Fecha y hora
          const Text('Fecha y hora',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
          const SizedBox(height: 8),
          InkWell(
            onTap: _seleccionarFechaHora,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(color: colorDivisor),
                borderRadius: BorderRadius.circular(8),
                color: colorSuperficie,
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time,
                      color: colorPrimario, size: 20),
                  const SizedBox(width: 12),
                  Text(
                    formatearFechaHora(_fechaHora),
                    style: const TextStyle(fontSize: 15),
                  ),
                  const Spacer(),
                  const Icon(Icons.chevron_right, color: colorSubtexto),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Trabajador
          const Text('Asignar a:',
              style: TextStyle(
                  fontWeight: FontWeight.w600, fontSize: 15)),
          if (_trabajadores.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Text('No hay trabajadores disponibles',
                  style: TextStyle(color: colorSubtexto)),
            ),
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
            onPressed: _trabajadorSeleccionado != null ? _crearTurno : null,
          ),
        ],
      ),
    );
  }
}
