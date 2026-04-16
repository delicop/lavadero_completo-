import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/servicio.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'servicios_provider.dart';

class ServiciosScreen extends StatefulWidget {
  const ServiciosScreen({super.key});

  @override
  State<ServiciosScreen> createState() => _ServiciosScreenState();
}

class _ServiciosScreenState extends State<ServiciosScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServiciosProvider>().cargar();
    });
  }

  void _abrirForm({Servicio? servicio}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colorSuperficie,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _FormServicio(servicio: servicio),
    );
  }

  Future<void> _confirmarEliminar(Servicio s) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Eliminar servicio'),
        content: Text('¿Eliminar "${s.nombre}"? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: colorCancelado),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );
    if (ok == true && mounted) {
      context.read<ServiciosProvider>().eliminar(s.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ServiciosProvider>(
      builder: (context, provider, _) {
        return LoadingOverlay(
          loading: provider.loading,
          child: Scaffold(
            appBar: AppBar(
              title: const Text('Servicios'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () => _abrirForm(),
                  tooltip: 'Nuevo servicio',
                ),
              ],
            ),
            body: _buildBody(provider),
          ),
        );
      },
    );
  }

  Widget _buildBody(ServiciosProvider provider) {
    if (provider.loading && provider.servicios.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null && provider.servicios.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(provider.error!, style: const TextStyle(color: colorCancelado)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: provider.cargar, child: const Text('Reintentar')),
          ],
        ),
      );
    }

    if (provider.servicios.isEmpty) {
      return const Center(child: Text('No hay servicios registrados.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: provider.servicios.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final s = provider.servicios[i];
        return _TarjetaServicio(
          servicio: s,
          onEditar: () => _abrirForm(servicio: s),
          onToggleActivo: () => provider.toggleActivo(s),
          onEliminar: () => _confirmarEliminar(s),
        );
      },
    );
  }
}

// ─── Tarjeta ───────────────────────────────────────────────────────────────

class _TarjetaServicio extends StatelessWidget {
  final Servicio servicio;
  final VoidCallback onEditar;
  final VoidCallback onToggleActivo;
  final VoidCallback onEliminar;

  const _TarjetaServicio({
    required this.servicio,
    required this.onEditar,
    required this.onToggleActivo,
    required this.onEliminar,
  });

  IconData get _iconoTipo {
    switch (servicio.tipoVehiculo) {
      case 'moto': return Icons.two_wheeler;
      case 'camioneta': return Icons.airport_shuttle;
      default: return Icons.directions_car;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorDivisor),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: colorPrimario.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(_iconoTipo, color: colorPrimario, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(servicio.nombre,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                if (servicio.descripcion != null &&
                    servicio.descripcion!.isNotEmpty)
                  Text(servicio.descripcion!,
                      style: const TextStyle(
                          fontSize: 12, color: colorSubtexto),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      '\$${servicio.precio.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: colorPrimario,
                          fontSize: 13),
                    ),
                    const SizedBox(width: 8),
                    Text('${servicio.duracionMinutos} min',
                        style: const TextStyle(
                            fontSize: 12, color: colorSubtexto)),
                  ],
                ),
              ],
            ),
          ),
          Column(
            children: [
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 20),
                onPressed: onEditar,
                color: colorSubtexto,
              ),
              GestureDetector(
                onTap: onToggleActivo,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: (servicio.activo
                            ? colorCompletado
                            : colorSubtexto)
                        .withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    servicio.activo ? 'Activo' : 'Inactivo',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: servicio.activo
                          ? colorCompletado
                          : colorSubtexto,
                    ),
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, size: 20),
                onPressed: onEliminar,
                color: colorCancelado,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Formulario ────────────────────────────────────────────────────────────

class _FormServicio extends StatefulWidget {
  final Servicio? servicio;
  const _FormServicio({this.servicio});

  @override
  State<_FormServicio> createState() => _FormServicioState();
}

class _FormServicioState extends State<_FormServicio> {
  final _nombreCtrl = TextEditingController();
  final _descripcionCtrl = TextEditingController();
  final _duracionCtrl = TextEditingController();
  final _precioCtrl = TextEditingController();

  String _tipoVehiculo = 'auto';
  String? _error;
  bool _guardando = false;

  bool get _editando => widget.servicio != null;

  @override
  void initState() {
    super.initState();
    if (_editando) {
      final s = widget.servicio!;
      _nombreCtrl.text = s.nombre;
      _descripcionCtrl.text = s.descripcion ?? '';
      _duracionCtrl.text = s.duracionMinutos.toString();
      _precioCtrl.text = s.precio.toStringAsFixed(0);
      _tipoVehiculo = s.tipoVehiculo.isNotEmpty ? s.tipoVehiculo : 'auto';
    } else {
      _duracionCtrl.text = '30';
    }
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _descripcionCtrl.dispose();
    _duracionCtrl.dispose();
    _precioCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    final nombre = _nombreCtrl.text.trim();
    final precio = double.tryParse(_precioCtrl.text);
    final duracion = int.tryParse(_duracionCtrl.text);

    if (nombre.isEmpty) {
      setState(() => _error = 'El nombre es obligatorio.');
      return;
    }
    if (precio == null || precio <= 0) {
      setState(() => _error = 'Ingresá un precio válido.');
      return;
    }
    if (duracion == null || duracion <= 0) {
      setState(() => _error = 'Ingresá una duración válida.');
      return;
    }

    setState(() { _guardando = true; _error = null; });

    final data = <String, dynamic>{
      'nombre': nombre,
      'descripcion': _descripcionCtrl.text.trim().isNotEmpty
          ? _descripcionCtrl.text.trim()
          : null,
      'duracionMinutos': duracion,
      'precio': precio,
      'tipoVehiculo': _tipoVehiculo,
    };

    final provider = context.read<ServiciosProvider>();
    bool ok;
    if (_editando) {
      ok = await provider.actualizar(widget.servicio!.id, data);
    } else {
      ok = await provider.crear(data);
    }

    if (!mounted) return;
    if (ok) {
      Navigator.pop(context);
    } else {
      setState(() {
        _error = provider.error ?? 'Error al guardar.';
        _guardando = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottom),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  _editando ? 'Editar servicio' : 'Nuevo servicio',
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 16),
            _Campo(label: 'Nombre', controller: _nombreCtrl),
            const SizedBox(height: 12),
            _Campo(label: 'Descripción (opcional)', controller: _descripcionCtrl),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _Campo(
                    label: 'Precio (\$)',
                    controller: _precioCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _Campo(
                    label: 'Duración (min)',
                    controller: _duracionCtrl,
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _tipoVehiculo,
              decoration: InputDecoration(
                labelText: 'Tipo de vehículo',
                filled: true,
                fillColor: colorFondo,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: colorDivisor),
                ),
              ),
              items: const [
                DropdownMenuItem(value: 'auto', child: Text('Auto')),
                DropdownMenuItem(value: 'moto', child: Text('Moto')),
                DropdownMenuItem(value: 'camioneta', child: Text('Camioneta')),
              ],
              onChanged: (v) => setState(() => _tipoVehiculo = v ?? 'auto'),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!,
                  style: const TextStyle(
                      color: colorCancelado, fontSize: 13)),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _guardando ? null : _guardar,
                child: _guardando
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(_editando ? 'Guardar cambios' : 'Crear servicio'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Campo extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;

  const _Campo({required this.label, required this.controller, this.keyboardType});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: colorFondo,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: colorDivisor),
        ),
      ),
    );
  }
}
