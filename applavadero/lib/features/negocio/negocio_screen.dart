import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/services/tenant_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/widgets/boton_primario.dart';
import '../../shared/widgets/input_field.dart';

// ── Paletas de colores predefinidos ──────────────────────────────────────────

const _coloresPrimarios = [
  ('Azul',       '#1E88E5'),
  ('Azul oscuro','#2563EB'),
  ('Celeste',    '#0EA5E9'),
  ('Verde',      '#16A34A'),
  ('Esmeralda',  '#059669'),
  ('Naranja',    '#EA580C'),
  ('Ámbar',      '#D97706'),
  ('Rojo',       '#DC2626'),
  ('Rosa',       '#DB2777'),
  ('Violeta',    '#7C3AED'),
  ('Índigo',     '#4F46E5'),
  ('Teal',       '#0D9488'),
  ('Gris',       '#475569'),
  ('Negro',      '#1A1A2E'),
];

const _coloresFondo = [
  ('Gris claro', '#F2F4F7'),
  ('Blanco gris','#F8FAFC'),
  ('Pizarra',    '#F1F5F9'),
  ('Verde menta','#F0FDF4'),
  ('Naranja suave','#FFF7ED'),
  ('Lila suave', '#FDF4FF'),
  ('Rojo suave', '#FEF2F2'),
  ('Azul suave', '#F0F9FF'),
  ('Blanco',     '#FFFFFF'),
];

const _coloresSuperficie = [
  ('Blanco',     '#FFFFFF'),
  ('Blanco gris','#F9FAFB'),
  ('Gris muy claro','#F8FAFC'),
  ('Gris pizarra','#F1F5F9'),
  ('Crema',      '#FAFAF9'),
];

// ── Pantalla ─────────────────────────────────────────────────────────────────

class NegocioScreen extends StatefulWidget {
  const NegocioScreen({super.key});

  @override
  State<NegocioScreen> createState() => _NegocioScreenState();
}

class _NegocioScreenState extends State<NegocioScreen> {
  final _nombreCtrl    = TextEditingController();
  final _logoCtrl      = TextEditingController();
  final _telefonoCtrl  = TextEditingController();
  final _emailCtrl     = TextEditingController();
  final _direccionCtrl = TextEditingController();

  String? _colorPrimario;
  String? _colorFondo;
  String? _colorSuperficie;

  bool _guardando = false;
  String? _error;
  String? _exito;

  @override
  void initState() {
    super.initState();
    final config = context.read<AuthProvider>().config;
    if (config != null) {
      _nombreCtrl.text    = config.nombreComercial ?? '';
      _logoCtrl.text      = config.logo ?? '';
      _telefonoCtrl.text  = config.telefonoWhatsapp ?? '';
      _emailCtrl.text     = config.emailContacto ?? '';
      _direccionCtrl.text = config.direccion ?? '';
      _colorPrimario   = config.colorPrimario;
      _colorFondo      = config.colorFondo;
      _colorSuperficie = config.colorSuperficie;
    }
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _logoCtrl.dispose();
    _telefonoCtrl.dispose();
    _emailCtrl.dispose();
    _direccionCtrl.dispose();
    super.dispose();
  }

  Future<void> _guardar() async {
    setState(() { _guardando = true; _error = null; _exito = null; });
    try {
      final data = <String, dynamic>{};
      if (_nombreCtrl.text.isNotEmpty)    data['nombreComercial']  = _nombreCtrl.text.trim();
      if (_logoCtrl.text.isNotEmpty)      data['logo']             = _logoCtrl.text.trim();
      if (_telefonoCtrl.text.isNotEmpty)  data['telefonoWhatsapp'] = _telefonoCtrl.text.trim();
      if (_emailCtrl.text.isNotEmpty)     data['emailContacto']    = _emailCtrl.text.trim();
      if (_direccionCtrl.text.isNotEmpty) data['direccion']        = _direccionCtrl.text.trim();
      if (_colorPrimario != null)   data['colorPrimario']   = _colorPrimario;
      if (_colorFondo != null)      data['colorFondo']      = _colorFondo;
      if (_colorSuperficie != null) data['colorSuperficie'] = _colorSuperficie;

      final config = await context.read<TenantService>().actualizarConfig(data);
      if (mounted) {
        context.read<AuthProvider>().actualizarConfig(config);
        setState(() { _exito = 'Configuración guardada'; _guardando = false; });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _guardando = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi Negocio')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Seccion(titulo: 'INFORMACIÓN GENERAL', children: [
              InputField(
                label: 'Nombre comercial',
                controller: _nombreCtrl,
                hint: 'Ej: Lavadero El Brillante',
              ),
              const SizedBox(height: 12),
              InputField(
                label: 'URL del logo',
                controller: _logoCtrl,
                hint: 'https://.com/logo.png',
              ),
            ]),
            const SizedBox(height: 24),
            _Seccion(titulo: 'CONTACTO', children: [
              InputField(
                label: 'Teléfono WhatsApp',
                controller: _telefonoCtrl,
                hint: '573001234567',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              InputField(
                label: 'Email de contacto',
                controller: _emailCtrl,
                hint: 'contacto@milavadero.com',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              InputField(
                label: 'Dirección',
                controller: _direccionCtrl,
                hint: 'Cra 15 #45-20, Bogotá',
              ),
            ]),
            const SizedBox(height: 24),
            _Seccion(titulo: 'APARIENCIA', children: [
              _SelectorColor(
                label: 'Color principal',
                descripcion: 'Botones, íconos y acentos de la app',
                colores: _coloresPrimarios,
                seleccionado: _colorPrimario,
                onSeleccionar: (hex) => setState(() => _colorPrimario = hex),
              ),
              const SizedBox(height: 20),
              _SelectorColor(
                label: 'Color de fondo',
                descripcion: 'Fondo general de las pantallas',
                colores: _coloresFondo,
                seleccionado: _colorFondo,
                onSeleccionar: (hex) => setState(() => _colorFondo = hex),
              ),
              const SizedBox(height: 20),
              _SelectorColor(
                label: 'Color de tarjetas',
                descripcion: 'Fondo de cards e inputs',
                colores: _coloresSuperficie,
                seleccionado: _colorSuperficie,
                onSeleccionar: (hex) => setState(() => _colorSuperficie = hex),
              ),
            ]),
            const SizedBox(height: 32),
            if (_error != null) ...[
              Text(_error!, style: const TextStyle(color: colorCancelado)),
              const SizedBox(height: 12),
            ],
            if (_exito != null) ...[
              Text(_exito!,
                  style: const TextStyle(
                      color: colorCompletado, fontWeight: FontWeight.w600)),
              const SizedBox(height: 12),
            ],
            BotonPrimario(
              texto: 'Guardar configuración',
              loading: _guardando,
              onPressed: _guardar,
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ── Selector de color con paleta ─────────────────────────────────────────────

class _SelectorColor extends StatelessWidget {
  final String label;
  final String descripcion;
  final List<(String, String)> colores;
  final String? seleccionado;
  final ValueChanged<String> onSeleccionar;

  const _SelectorColor({
    required this.label,
    required this.descripcion,
    required this.colores,
    required this.seleccionado,
    required this.onSeleccionar,
  });

  Color _fromHex(String hex) {
    return Color(int.parse('FF${hex.substring(1)}', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(descripcion,
                      style: const TextStyle(
                          color: colorSubtexto, fontSize: 12)),
                ],
              ),
            ),
            if (seleccionado != null)
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: _fromHex(seleccionado!),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: colorDivisor, width: 2),
                ),
              ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: colores.map((entry) {
            final (nombre, hex) = entry;
            final color = _fromHex(hex);
            final esSeleccionado = seleccionado == hex;
            return GestureDetector(
              onTap: () => onSeleccionar(hex),
              child: Tooltip(
                message: nombre,
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: esSeleccionado
                          ? colorTexto
                          : color.computeLuminance() > 0.9
                              ? colorDivisor
                              : Colors.transparent,
                      width: esSeleccionado ? 3 : 1.5,
                    ),
                    boxShadow: esSeleccionado
                        ? [
                            BoxShadow(
                              color: color.withValues(alpha: 0.5),
                              blurRadius: 8,
                              spreadRadius: 1,
                            )
                          ]
                        : null,
                  ),
                  child: esSeleccionado
                      ? Icon(
                          Icons.check,
                          color: color.computeLuminance() > 0.5
                              ? Colors.black87
                              : Colors.white,
                          size: 20,
                        )
                      : null,
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
}

// ── Sección ───────────────────────────────────────────────────────────────────

class _Seccion extends StatelessWidget {
  final String titulo;
  final List<Widget> children;
  const _Seccion({required this.titulo, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(titulo,
            style: const TextStyle(
                color: colorSubtexto,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 1)),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }
}
