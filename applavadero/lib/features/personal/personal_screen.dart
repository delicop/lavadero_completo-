import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/usuario.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'personal_provider.dart';

class PersonalScreen extends StatefulWidget {
  const PersonalScreen({super.key});

  @override
  State<PersonalScreen> createState() => _PersonalScreenState();
}

class _PersonalScreenState extends State<PersonalScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PersonalProvider>().cargar();
    });
  }

  void _abrirForm({Usuario? usuario}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colorSuperficie,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _FormUsuario(usuario: usuario),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<PersonalProvider>(
      builder: (context, provider, _) {
        return LoadingOverlay(
          loading: provider.loading,
          child: Scaffold(
            appBar: AppBar(
              title: const Text('Personal'),
              actions: [
                IconButton(
                  icon: const Icon(Icons.person_add_outlined),
                  onPressed: () => _abrirForm(),
                  tooltip: 'Nuevo usuario',
                ),
              ],
            ),
            body: _buildBody(provider),
          ),
        );
      },
    );
  }

  Widget _buildBody(PersonalProvider provider) {
    if (provider.loading && provider.usuarios.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (provider.error != null && provider.usuarios.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(provider.error!, style: const TextStyle(color: colorCancelado)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: provider.cargar,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (provider.usuarios.isEmpty) {
      return const Center(child: Text('No hay personal registrado.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: provider.usuarios.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final u = provider.usuarios[i];
        return _TarjetaUsuario(
          usuario: u,
          onEditar: () => _abrirForm(usuario: u),
          onToggleActivo: () => provider.toggleActivo(u),
        );
      },
    );
  }
}

// ─── Tarjeta de usuario ────────────────────────────────────────────────────

class _TarjetaUsuario extends StatelessWidget {
  final Usuario usuario;
  final VoidCallback onEditar;
  final VoidCallback onToggleActivo;

  const _TarjetaUsuario({
    required this.usuario,
    required this.onEditar,
    required this.onToggleActivo,
  });

  @override
  Widget build(BuildContext context) {
    final esAdmin = usuario.rol == 'admin';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: colorDivisor),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: (esAdmin ? colorPrimario : colorCompletado)
                .withValues(alpha: 0.15),
            child: Text(
              usuario.nombre[0].toUpperCase(),
              style: TextStyle(
                color: esAdmin ? colorPrimario : colorCompletado,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  usuario.nombreCompleto,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  usuario.email,
                  style: const TextStyle(fontSize: 12, color: colorSubtexto),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    _Badge(
                      label: usuario.rol,
                      color: esAdmin ? colorPrimario : colorCompletado,
                    ),
                    if (!esAdmin && usuario.comisionPorcentaje != null) ...[
                      const SizedBox(width: 6),
                      _Badge(
                        label: '${usuario.comisionPorcentaje!.toStringAsFixed(0)}% comisión',
                        color: colorSubtexto,
                      ),
                    ],
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
                tooltip: 'Editar',
              ),
              GestureDetector(
                onTap: onToggleActivo,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: (usuario.activo ? colorCompletado : colorSubtexto)
                        .withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    usuario.activo ? 'Activo' : 'Inactivo',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color:
                          usuario.activo ? colorCompletado : colorSubtexto,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 11, color: color, fontWeight: FontWeight.w600)),
    );
  }
}

// ─── Formulario (bottom sheet) ─────────────────────────────────────────────

class _FormUsuario extends StatefulWidget {
  final Usuario? usuario;
  const _FormUsuario({this.usuario});

  @override
  State<_FormUsuario> createState() => _FormUsuarioState();
}

class _FormUsuarioState extends State<_FormUsuario> {
  final _nombreCtrl = TextEditingController();
  final _apellidoCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _comisionCtrl = TextEditingController();

  String _rol = 'trabajador';
  String? _error;
  bool _guardando = false;

  bool get _editando => widget.usuario != null;
  bool get _esAdmin => _rol == 'admin';

  @override
  void initState() {
    super.initState();
    if (_editando) {
      final u = widget.usuario!;
      _nombreCtrl.text = u.nombre;
      _apellidoCtrl.text = u.apellido;
      _emailCtrl.text = u.email;
      _rol = u.rol;
      _comisionCtrl.text =
          u.comisionPorcentaje?.toStringAsFixed(0) ?? '50';
    } else {
      _comisionCtrl.text = '50';
    }
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _apellidoCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _comisionCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    final nombre = _nombreCtrl.text.trim();
    final apellido = _apellidoCtrl.text.trim();
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text;

    if (nombre.isEmpty || apellido.isEmpty) {
      setState(() => _error = 'Nombre y apellido son obligatorios.');
      return;
    }
    if (!_editando && (email.isEmpty || password.isEmpty)) {
      setState(() => _error = 'Email y contraseña son obligatorios.');
      return;
    }

    setState(() {
      _guardando = true;
      _error = null;
    });

    final provider = context.read<PersonalProvider>();
    bool ok;

    if (_editando) {
      final data = <String, dynamic>{
        'nombre': nombre,
        'apellido': apellido,
        'rol': _rol,
      };
      if (!_esAdmin) {
        data['comisionPorcentaje'] =
            double.tryParse(_comisionCtrl.text) ?? 50;
      }
      if (password.isNotEmpty) data['password'] = password;
      ok = await provider.actualizar(widget.usuario!.id, data);
    } else {
      final data = <String, dynamic>{
        'nombre': nombre,
        'apellido': apellido,
        'email': email,
        'password': password,
        'rol': _rol,
      };
      if (!_esAdmin) {
        data['comisionPorcentaje'] =
            double.tryParse(_comisionCtrl.text) ?? 50;
      }
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
                  _editando ? 'Editar usuario' : 'Nuevo usuario',
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _Campo(label: 'Nombre', controller: _nombreCtrl),
            const SizedBox(height: 12),
            _Campo(label: 'Apellido', controller: _apellidoCtrl),
            const SizedBox(height: 12),
            _Campo(
              label: 'Email',
              controller: _emailCtrl,
              readOnly: _editando,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 12),
            _Campo(
              label: _editando
                  ? 'Nueva contraseña (opcional)'
                  : 'Contraseña',
              controller: _passwordCtrl,
              obscureText: true,
            ),
            const SizedBox(height: 12),
            // Selector de rol
            DropdownButtonFormField<String>(
              value: _rol,
              decoration: InputDecoration(
                labelText: 'Rol',
                filled: true,
                fillColor: colorFondo,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: colorDivisor),
                ),
              ),
              items: const [
                DropdownMenuItem(value: 'trabajador', child: Text('Trabajador')),
                DropdownMenuItem(value: 'admin', child: Text('Admin')),
              ],
              onChanged: (v) => setState(() => _rol = v ?? 'trabajador'),
            ),
            if (!_esAdmin) ...[
              const SizedBox(height: 12),
              _Campo(
                label: 'Comisión (%)',
                controller: _comisionCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!,
                  style: const TextStyle(color: colorCancelado, fontSize: 13)),
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
                    : Text(_editando ? 'Guardar cambios' : 'Crear usuario'),
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
  final bool obscureText;
  final bool readOnly;
  final TextInputType? keyboardType;

  const _Campo({
    required this.label,
    required this.controller,
    this.obscureText = false,
    this.readOnly = false,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      readOnly: readOnly,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: readOnly
            ? colorDivisor.withValues(alpha: 0.3)
            : colorFondo,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: colorDivisor),
        ),
      ),
    );
  }
}
