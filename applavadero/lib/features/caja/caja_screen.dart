import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/boton_primario.dart';
import '../../shared/widgets/input_field.dart';
import '../../shared/widgets/loading_overlay.dart';
import 'caja_provider.dart';

class CajaScreen extends StatefulWidget {
  const CajaScreen({super.key});

  @override
  State<CajaScreen> createState() => _CajaScreenState();
}

class _CajaScreenState extends State<CajaScreen> {
  final _montoInicialCtrl = TextEditingController(text: '50000');

  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CajaProvider>().cargar());
  }

  @override
  void dispose() {
    _montoInicialCtrl.dispose();
    super.dispose();
  }

  Future<void> _abrirCaja() async {
    final monto =
        double.tryParse(_montoInicialCtrl.text.replaceAll('.', ''));
    if (monto == null) return;
    await context.read<CajaProvider>().abrir(monto);
  }

  Future<void> _cerrarCaja() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Cerrar caja'),
        content: const Text(
            '¿Estás seguro de que querés cerrar la caja del día?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Cerrar')),
        ],
      ),
    );
    if (ok == true && mounted) {
      await context.read<CajaProvider>().cerrar();
    }
  }

  Future<void> _mostrarDialogoGasto() async {
    final descCtrl = TextEditingController();
    final montoCtrl = TextEditingController();
    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Registrar gasto'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            InputField(label: 'Descripción', controller: descCtrl),
            const SizedBox(height: 12),
            InputField(
                label: 'Monto',
                controller: montoCtrl,
                keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar')),
          ElevatedButton(
            onPressed: () async {
              final desc = descCtrl.text.trim();
              final monto = double.tryParse(montoCtrl.text);
              if (desc.isEmpty || monto == null) return;
              Navigator.pop(context);
              await context
                  .read<CajaProvider>()
                  .registrarGasto(desc, monto);
            },
            child: const Text('Guardar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Caja')),
      body: Consumer<CajaProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading,
          child: RefreshIndicator(
            onRefresh: provider.cargar,
            child: provider.sinCaja
                ? _SinCaja(
                    montoCtrl: _montoInicialCtrl,
                    onAbrir: _abrirCaja,
                    loading: provider.loading)
                : provider.estaAbierta
                    ? _CajaAbierta(
                        provider: provider,
                        onGasto: _mostrarDialogoGasto,
                        onCerrar: _cerrarCaja)
                    : _CajaCerrada(provider: provider),
          ),
        ),
      ),
    );
  }
}

class _SinCaja extends StatelessWidget {
  final TextEditingController montoCtrl;
  final VoidCallback onAbrir;
  final bool loading;

  const _SinCaja(
      {required this.montoCtrl,
      required this.onAbrir,
      required this.loading});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const SizedBox(height: 40),
            const Icon(Icons.point_of_sale, size: 64, color: colorSubtexto),
            const SizedBox(height: 16),
            const Text('No hay caja abierta para hoy.',
                textAlign: TextAlign.center,
                style: TextStyle(color: colorSubtexto)),
            const SizedBox(height: 32),
            InputField(
                label: 'Monto inicial',
                controller: montoCtrl,
                keyboardType: TextInputType.number),
            const SizedBox(height: 16),
            BotonPrimario(
                texto: 'Abrir caja',
                onPressed: onAbrir,
                loading: loading),
          ],
        ),
      ),
    );
  }
}

class _CajaAbierta extends StatelessWidget {
  final CajaProvider provider;
  final VoidCallback onGasto;
  final VoidCallback onCerrar;

  const _CajaAbierta(
      {required this.provider,
      required this.onGasto,
      required this.onCerrar});

  @override
  Widget build(BuildContext context) {
    final caja = provider.caja!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: colorCompletado.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('● ABIERTA',
                style: TextStyle(
                    color: colorCompletado,
                    fontWeight: FontWeight.w700)),
          ),
        ]),
        const SizedBox(height: 20),
        _FilaResumen('Fecha', caja.fecha),
        _FilaResumen('Monto inicial', formatearPesos(caja.montoInicial)),
        const Divider(height: 32),
        OutlinedButton.icon(
          icon: const Icon(Icons.remove_circle_outline,
              color: colorCancelado),
          label: const Text('+ Gasto',
              style: TextStyle(color: colorCancelado)),
          onPressed: onGasto,
          style: OutlinedButton.styleFrom(
              side: const BorderSide(color: colorCancelado),
              minimumSize: const Size(double.infinity, 48)),
        ),
        const SizedBox(height: 32),
        OutlinedButton.icon(
          icon: const Icon(Icons.lock, color: colorSubtexto),
          label: const Text('Cerrar caja',
              style: TextStyle(color: colorSubtexto)),
          onPressed: onCerrar,
          style: OutlinedButton.styleFrom(
              side: const BorderSide(color: colorSubtexto),
              minimumSize: const Size(double.infinity, 52)),
        ),
      ],
    );
  }
}

class _CajaCerrada extends StatelessWidget {
  final CajaProvider provider;
  const _CajaCerrada({required this.provider});

  @override
  Widget build(BuildContext context) {
    final caja = provider.caja!;
    return SingleChildScrollView(
      physics: const AlwaysScrollableScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(children: [
              Icon(Icons.lock, color: colorSubtexto, size: 16),
              SizedBox(width: 6),
              Text('CAJA CERRADA',
                  style: TextStyle(
                      color: colorSubtexto,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1)),
            ]),
            const SizedBox(height: 20),
            _FilaResumen('Fecha', caja.fecha),
            _FilaResumen('Monto inicial', formatearPesos(caja.montoInicial)),
          ],
        ),
      ),
    );
  }
}

class _FilaResumen extends StatelessWidget {
  final String label;
  final String valor;
  final Color? color;

  const _FilaResumen(this.label, this.valor, {this.color});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: colorSubtexto)),
          Text(valor,
              style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: color ?? colorTexto)),
        ],
      ),
    );
  }
}
