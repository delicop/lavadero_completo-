import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/models/caja.dart';
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
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CajaProvider>().cargar());
  }

  void _mostrarError(String mensaje) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(mensaje),
      backgroundColor: colorCancelado,
      behavior: SnackBarBehavior.floating,
    ));
  }

  void _mostrarExito(String mensaje) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(mensaje),
      backgroundColor: colorCompletado,
      behavior: SnackBarBehavior.floating,
    ));
  }

  // ── Diálogo confirmar reabrir caja ───────────────────────────────────────

  Future<void> _confirmarReabrir(CajaProvider provider) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Reabrir caja'),
        content: const Text(
            '¿Querés reabrir la caja del día? Podrás seguir registrando gastos e ingresos.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Reabrir')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    await provider.reabrir();
    if (provider.error != null && mounted) _mostrarError(provider.error!);
  }

  // ── Diálogo confirmar cerrar caja anterior ────────────────────────────────

  Future<void> _confirmarCerrarAnterior() async {
    final provider = context.read<CajaProvider>();
    final caja = provider.cajaSinCerrar;
    if (caja == null) return;
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Cerrar caja anterior'),
        content: Text(
            '¿Confirmar cierre de la caja del ${caja.fecha} que quedó abierta?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Confirmar cierre')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    await provider.cerrarAnterior();
    if (provider.error != null && mounted) _mostrarError(provider.error!);
  }

  // ── Diálogo confirmar cerrar caja de hoy ─────────────────────────────────

  Future<void> _confirmarCerrarHoy() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Cerrar caja del día'),
        content: const Text(
            '¿Estás seguro de que querés cerrar la caja? Esta acción no se puede deshacer.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              child: const Text('Cerrar caja')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    final provider = context.read<CajaProvider>();
    await provider.cerrar();
    if (!mounted) return;
    if (provider.error != null) {
      _mostrarError(provider.error!);
    } else {
      _mostrarExito('Caja cerrada correctamente');
    }
  }

  // ── Bottom sheet: nuevo gasto ─────────────────────────────────────────────

  Future<void> _mostrarFormGasto() async {
    final descCtrl = TextEditingController();
    final montoCtrl = TextEditingController();
    String tipoPago = 'efectivo';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colorSuperficie,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setS) => Padding(
          padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Registrar gasto',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: colorTexto)),
              const SizedBox(height: 20),
              InputField(label: 'Concepto', controller: descCtrl),
              const SizedBox(height: 12),
              InputField(
                  label: 'Monto',
                  controller: montoCtrl,
                  keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _SelectorTipoPago(
                value: tipoPago,
                onChanged: (v) => setS(() => tipoPago = v),
              ),
              const SizedBox(height: 20),
              Row(children: [
                Expanded(
                    child: OutlinedButton(
                        onPressed: () => Navigator.pop(sheetCtx),
                        child: const Text('Cancelar'))),
                const SizedBox(width: 12),
                Expanded(
                    child: ElevatedButton(
                  onPressed: () async {
                    final desc = descCtrl.text.trim();
                    final monto = double.tryParse(montoCtrl.text);
                    if (desc.isEmpty || monto == null || monto <= 0) return;
                    final provider = context.read<CajaProvider>();
                    Navigator.pop(sheetCtx);
                    await provider.registrarGasto(desc, monto, tipoPago);
                    if (provider.error != null && mounted) {
                      _mostrarError(provider.error!);
                    }
                  },
                  child: const Text('Guardar'),
                )),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  // ── Bottom sheet: nuevo ingreso manual ───────────────────────────────────

  Future<void> _mostrarFormIngreso() async {
    final descCtrl = TextEditingController();
    final montoCtrl = TextEditingController();
    String tipoPago = 'efectivo';

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: colorSuperficie,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (sheetCtx) => StatefulBuilder(
        builder: (sheetCtx, setS) => Padding(
          padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 24,
              bottom: MediaQuery.of(sheetCtx).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Ingreso manual',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: colorTexto)),
              const SizedBox(height: 20),
              InputField(label: 'Concepto', controller: descCtrl),
              const SizedBox(height: 12),
              InputField(
                  label: 'Monto',
                  controller: montoCtrl,
                  keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _SelectorTipoPago(
                value: tipoPago,
                onChanged: (v) => setS(() => tipoPago = v),
              ),
              const SizedBox(height: 20),
              Row(children: [
                Expanded(
                    child: OutlinedButton(
                        onPressed: () => Navigator.pop(sheetCtx),
                        child: const Text('Cancelar'))),
                const SizedBox(width: 12),
                Expanded(
                    child: ElevatedButton(
                  onPressed: () async {
                    final desc = descCtrl.text.trim();
                    final monto = double.tryParse(montoCtrl.text);
                    if (desc.isEmpty || monto == null || monto <= 0) return;
                    final provider = context.read<CajaProvider>();
                    Navigator.pop(sheetCtx);
                    await provider.registrarIngreso(desc, monto, tipoPago);
                    if (provider.error != null && mounted) {
                      _mostrarError(provider.error!);
                    }
                  },
                  child: const Text('Guardar'),
                )),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Caja')),
      body: Consumer<CajaProvider>(
        builder: (_, provider, __) => LoadingOverlay(
          loading: provider.loading,
          child: RefreshIndicator(
            onRefresh: provider.cargar,
            child: _buildVista(provider),
          ),
        ),
      ),
    );
  }

  Widget _buildVista(CajaProvider provider) {
    // Error global
    if (provider.error != null &&
        provider.vista == VistaCaja.abrir &&
        provider.cajaHoy == null) {
      return _VistaError(
          mensaje: provider.error!, onReintentar: provider.cargar);
    }

    switch (provider.vista) {
      case VistaCaja.cargando:
        return const Center(child: CircularProgressIndicator());

      case VistaCaja.cerrarAnterior:
        return _VistaCerrarAnterior(
          cajaSinCerrar: provider.cajaSinCerrar!,
          resumenAnterior: provider.resumenAnterior,
          onConfirmar: _confirmarCerrarAnterior,
          loading: provider.loading,
        );

      case VistaCaja.abrir:
        return _VistaAbrir(onAbrir: (monto, obs) async {
          await provider.abrir(monto, observaciones: obs);
          if (provider.error != null && mounted) _mostrarError(provider.error!);
        });

      case VistaCaja.abierta:
        return _VistaAbierta(
          caja: provider.cajaHoy!,
          resumen: provider.resumen,
          onGasto: _mostrarFormGasto,
          onIngreso: _mostrarFormIngreso,
          onEliminarGasto: (g) => provider.eliminarGasto(g),
          onEliminarIngreso: (i) => provider.eliminarIngreso(i),
          onCerrar: _confirmarCerrarHoy,
        );

      case VistaCaja.cerrada:
        return _VistaCerrada(
          caja: provider.cajaHoy!,
          resumen: provider.resumen,
          onReabrir: () => _confirmarReabrir(provider),
        );
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTAS
// ══════════════════════════════════════════════════════════════════════════════

class _VistaError extends StatelessWidget {
  final String mensaje;
  final VoidCallback onReintentar;
  const _VistaError({required this.mensaje, required this.onReintentar});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, color: colorCancelado, size: 48),
            const SizedBox(height: 16),
            Text(mensaje,
                textAlign: TextAlign.center,
                style: const TextStyle(color: colorSubtexto)),
            const SizedBox(height: 24),
            ElevatedButton.icon(
                onPressed: onReintentar,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar')),
          ],
        ),
      ),
    );
  }
}

// ── Cerrar caja anterior ──────────────────────────────────────────────────────

class _VistaCerrarAnterior extends StatelessWidget {
  final CajaDia cajaSinCerrar;
  final ResumenCaja? resumenAnterior;
  final VoidCallback onConfirmar;
  final bool loading;

  const _VistaCerrarAnterior({
    required this.cajaSinCerrar,
    required this.resumenAnterior,
    required this.onConfirmar,
    required this.loading,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Banner de alerta
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: colorPendiente.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: colorPendiente.withValues(alpha: 0.5)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                const Icon(Icons.warning_amber_rounded,
                    color: colorPendiente, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Caja del ${cajaSinCerrar.fecha} sin cerrar',
                    style: const TextStyle(
                        color: colorPendiente, fontWeight: FontWeight.w700),
                  ),
                ),
              ]),
              const SizedBox(height: 6),
              const Text(
                'No se puede operar hasta cerrar la caja del día anterior.',
                style: TextStyle(color: colorSubtexto, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Resumen de la caja anterior
        if (resumenAnterior != null) ...[
          _WidgetResumen(resumen: resumenAnterior!),
          const SizedBox(height: 16),
        ] else
          const _TarjetaCargando(),

        // Botón de confirmación
        ElevatedButton.icon(
          icon: const Icon(Icons.lock_outline),
          label: Text(loading
              ? 'Cerrando...'
              : 'Confirmar cierre del ${cajaSinCerrar.fecha}'),
          onPressed: loading ? null : onConfirmar,
        ),
      ],
    );
  }
}

// ── Abrir caja ────────────────────────────────────────────────────────────────

class _VistaAbrir extends StatefulWidget {
  final Future<void> Function(double monto, String? observaciones) onAbrir;
  const _VistaAbrir({required this.onAbrir});

  @override
  State<_VistaAbrir> createState() => _VistaAbrirState();
}

class _VistaAbrirState extends State<_VistaAbrir> {
  final _montoCtrl = TextEditingController();
  final _obsCtrl = TextEditingController();
  bool _guardando = false;

  @override
  void dispose() {
    _montoCtrl.dispose();
    _obsCtrl.dispose();
    super.dispose();
  }

  Future<void> _abrir() async {
    final texto = _montoCtrl.text.trim().replaceAll('.', '');
    if (texto.isEmpty) return;
    final monto = double.tryParse(texto);
    if (monto == null || monto < 0) return;
    setState(() => _guardando = true);
    await widget.onAbrir(monto, _obsCtrl.text.trim());
    if (mounted) setState(() => _guardando = false);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (ctx, constraints) => SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(Icons.point_of_sale,
                    size: 56, color: colorSubtexto),
                const SizedBox(height: 12),
                const Text('Apertura de caja',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: colorTexto)),
                const SizedBox(height: 4),
                const Text('Ingresá el dinero con el que inicia el día',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: colorSubtexto)),
                const SizedBox(height: 32),
                InputField(
                  label: 'Monto inicial en caja (\$)',
                  controller: _montoCtrl,
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Este monto no cuenta en el total del día, es solo de referencia.',
                  style: TextStyle(color: colorSubtexto, fontSize: 12),
                ),
                const SizedBox(height: 12),
                InputField(
                  label: 'Observaciones (opcional)',
                  controller: _obsCtrl,
                ),
                const SizedBox(height: 24),
                BotonPrimario(
                  texto: _guardando ? 'Abriendo...' : 'Abrir caja del día',
                  onPressed: _guardando ? () {} : _abrir,
                  loading: _guardando,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Caja abierta ──────────────────────────────────────────────────────────────

class _VistaAbierta extends StatelessWidget {
  final CajaDia caja;
  final ResumenCaja? resumen;
  final VoidCallback onGasto;
  final VoidCallback onIngreso;
  final void Function(GastoCaja) onEliminarGasto;
  final void Function(IngresoManualCaja) onEliminarIngreso;
  final VoidCallback onCerrar;

  const _VistaAbierta({
    required this.caja,
    required this.resumen,
    required this.onGasto,
    required this.onIngreso,
    required this.onEliminarGasto,
    required this.onEliminarIngreso,
    required this.onCerrar,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Header: chip + fecha + botón cerrar
        Row(
          children: [
            _ChipEstado(label: '● ABIERTA', color: colorCompletado),
            const Spacer(),
            OutlinedButton.icon(
              icon: const Icon(Icons.lock_outline, size: 16),
              label: const Text('Cerrar caja'),
              onPressed: resumen == null ? null : onCerrar,
              style: OutlinedButton.styleFrom(
                  foregroundColor: colorSubtexto,
                  side: const BorderSide(color: colorSubtexto)),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(caja.fecha,
            style: const TextStyle(color: colorSubtexto, fontSize: 13)),
        const SizedBox(height: 16),

        // Resumen de ingresos
        if (resumen == null)
          const _TarjetaCargando()
        else ...[
          _WidgetResumen(resumen: resumen!),
          const SizedBox(height: 16),

          // Gastos del día
          _TarjetaLista(
            titulo: 'Gastos del día',
            color: colorCancelado,
            items: resumen!.gastosLista,
            emptyText: 'Sin gastos registrados',
            onAdd: onGasto,
            itemBuilder: (g) => _ItemLista(
              titulo: (g as GastoCaja).concepto,
              subtitulo: g.tipoPago,
              valor: formatearPesos(g.monto),
              colorValor: colorCancelado,
              onEliminar: () => onEliminarGasto(g),
            ),
          ),
          const SizedBox(height: 12),

          // Ingresos manuales
          _TarjetaLista(
            titulo: 'Ingresos manuales',
            color: colorCompletado,
            items: resumen!.ingresosManualLista,
            emptyText: 'Sin ingresos manuales',
            onAdd: onIngreso,
            itemBuilder: (i) => _ItemLista(
              titulo: (i as IngresoManualCaja).concepto,
              subtitulo: i.tipoPago,
              valor: formatearPesos(i.monto),
              colorValor: colorCompletado,
              onEliminar: () => onEliminarIngreso(i),
            ),
          ),
        ],
        const SizedBox(height: 24),
      ],
    );
  }
}

// ── Caja cerrada ──────────────────────────────────────────────────────────────

class _VistaCerrada extends StatelessWidget {
  final CajaDia caja;
  final ResumenCaja? resumen;
  final VoidCallback onReabrir;

  const _VistaCerrada({
    required this.caja,
    required this.resumen,
    required this.onReabrir,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (ctx, constraints) => SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Banner cerrada
                Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: 20, horizontal: 16),
                  decoration: BoxDecoration(
                    color: colorSuperficie,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colorDivisor),
                  ),
                  child: Column(children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                          color: colorSubtexto.withValues(alpha: 0.12),
                          shape: BoxShape.circle),
                      child: const Icon(Icons.lock,
                          color: colorSubtexto, size: 32),
                    ),
                    const SizedBox(height: 12),
                    const Text('CAJA CERRADA',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: colorTexto,
                            fontWeight: FontWeight.w700,
                            fontSize: 18,
                            letterSpacing: 1.5)),
                    const SizedBox(height: 4),
                    Text(caja.fecha,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                            color: colorSubtexto, fontSize: 14)),
                  ]),
                ),
                const SizedBox(height: 16),

                if (resumen == null)
                  const _TarjetaCargando()
                else
                  _WidgetResumen(resumen: resumen!),

                const SizedBox(height: 24),
                const Text(
                  'La próxima caja se abre mañana con el monto que elijas.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: colorSubtexto, fontSize: 13),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  icon: const Icon(Icons.lock_open_outlined,
                      color: colorPendiente),
                  label: const Text('Reabrir caja',
                      style: TextStyle(color: colorPendiente)),
                  onPressed: onReabrir,
                  style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: colorPendiente),
                      minimumSize: const Size(double.infinity, 48)),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET RESUMEN (usado en cerrar_anterior, abierta y cerrada)
// ══════════════════════════════════════════════════════════════════════════════

class _WidgetResumen extends StatelessWidget {
  final ResumenCaja resumen;
  const _WidgetResumen({required this.resumen});

  @override
  Widget build(BuildContext context) {
    final r = resumen;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Ingresos
        _Tarjeta(
          titulo: 'Ingresos en caja',
          children: [
            _Fila('Total al inicio', formatearPesos(r.montoInicial)),
            _Fila('Venta en efectivo', formatearPesos(r.ventasEfectivo)),
            _Fila('Venta transferencia',
                formatearPesos(r.ventasTransferencia)),
            if (r.ingresosManual > 0)
              _Fila('Ingreso manual', formatearPesos(r.ingresosManual)),
            const Divider(height: 12, color: colorDivisor),
            _Fila('TOTAL', formatearPesos(r.totalIngresos),
                color: colorTexto, bold: true),
          ],
        ),
        const SizedBox(height: 10),

        // Gastos
        _Tarjeta(
          titulo: 'Gastos',
          children: [
            _Fila('Efectivo', formatearPesos(r.gastosEfectivo)),
            _Fila('Transferencia', formatearPesos(r.gastosTransferencia)),
            const Divider(height: 12, color: colorDivisor),
            _Fila('TOTAL GASTOS', formatearPesos(r.gastosTotal),
                color: colorCancelado, bold: true),
          ],
        ),
        const SizedBox(height: 10),

        // Ganancias
        _Tarjeta(
          titulo: 'Ganancias del día',
          children: [
            if (r.trabajadores.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: Text('Sin turnos completados',
                    style:
                        TextStyle(color: colorSubtexto, fontSize: 13)),
              ),
            for (final t in r.trabajadores)
              _Fila(
                  '${t.nombre} ${t.apellido} (${t.comisionPorcentaje.toStringAsFixed(0)}%)',
                  formatearPesos(t.ganancia)),
            if (r.trabajadores.isNotEmpty)
              _Fila('Total empleados', formatearPesos(r.totalEmpleados),
                  color: colorSubtexto),
            _Fila('Ganancia lavadero', formatearPesos(r.lavadero),
                color: colorSubtexto),
            _Fila('Gastos del día', '− ${formatearPesos(r.gastosTotal)}',
                color: colorCancelado),
            _Fila('Inicio del día', formatearPesos(r.montoInicial),
                color: colorSubtexto),
            const Divider(height: 12, color: colorDivisor),
            _Fila('TOTAL DEL DÍA', formatearPesos(r.totalDia),
                color: colorTexto, bold: true),
            const SizedBox(height: 4),
            // Efectivo en caja
            Container(
              padding:
                  const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              decoration: BoxDecoration(
                  color: colorPrimario.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: colorPrimario.withValues(alpha: 0.3))),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Efectivo en caja',
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: colorTexto)),
                    Text(formatearPesos(r.efectivoEnCaja),
                        style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: colorPrimario)),
                  ]),
            ),
            const SizedBox(height: 4),
            // En transferencia
            Container(
              padding:
                  const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
              decoration: BoxDecoration(
                  color: colorCompletado.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                      color: colorCompletado.withValues(alpha: 0.3))),
              child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('En transferencia',
                        style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: colorTexto)),
                    Text(
                        formatearPesos(
                            r.totalDia - r.efectivoEnCaja),
                        style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: colorCompletado)),
                  ]),
            ),
          ],
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGETS AUXILIARES
// ══════════════════════════════════════════════════════════════════════════════

class _TarjetaCargando extends StatelessWidget {
  const _TarjetaCargando();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 32),
      child: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
        CircularProgressIndicator(color: colorPrimario),
        SizedBox(height: 12),
        Text('Calculando resumen...',
            style: TextStyle(color: colorSubtexto)),
      ])),
    );
  }
}

class _ChipEstado extends StatelessWidget {
  final String label;
  final Color color;
  const _ChipEstado({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child:
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700)),
    );
  }
}

class _Tarjeta extends StatelessWidget {
  final String titulo;
  final List<Widget> children;
  const _Tarjeta({required this.titulo, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: colorDivisor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(titulo,
              style: const TextStyle(
                  color: colorSubtexto,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8)),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    );
  }
}

class _Fila extends StatelessWidget {
  final String label;
  final String valor;
  final Color? color;
  final bool bold;
  const _Fila(this.label, this.valor, {this.color, this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
              child: Text(label,
                  style: const TextStyle(color: colorSubtexto, fontSize: 13))),
          const SizedBox(width: 12),
          Text(valor,
              style: TextStyle(
                  fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
                  fontSize: bold ? 15 : 13,
                  color: color ?? colorTexto)),
        ],
      ),
    );
  }
}

class _TarjetaLista extends StatelessWidget {
  final String titulo;
  final Color color;
  final List<dynamic> items;
  final String emptyText;
  final VoidCallback onAdd;
  final Widget Function(dynamic) itemBuilder;

  const _TarjetaLista({
    required this.titulo,
    required this.color,
    required this.items,
    required this.emptyText,
    required this.onAdd,
    required this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorSuperficie,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: colorDivisor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(titulo,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: colorTexto)),
              TextButton.icon(
                onPressed: onAdd,
                icon: Icon(Icons.add, size: 16, color: color),
                label:
                    Text('Agregar', style: TextStyle(color: color, fontSize: 13)),
                style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    minimumSize: Size.zero),
              ),
            ],
          ),
          if (items.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(emptyText,
                  style: const TextStyle(
                      color: colorSubtexto, fontSize: 13)),
            )
          else
            ...items.map(itemBuilder),
        ],
      ),
    );
  }
}

class _ItemLista extends StatelessWidget {
  final String titulo;
  final String subtitulo;
  final String valor;
  final Color colorValor;
  final VoidCallback onEliminar;

  const _ItemLista({
    required this.titulo,
    required this.subtitulo,
    required this.valor,
    required this.colorValor,
    required this.onEliminar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titulo,
                    style: const TextStyle(
                        color: colorTexto,
                        fontWeight: FontWeight.w500,
                        fontSize: 13)),
                Text(subtitulo,
                    style: const TextStyle(
                        color: colorSubtexto, fontSize: 11)),
              ],
            ),
          ),
          Text(valor,
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: colorValor,
                  fontSize: 13)),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onEliminar,
            child: const Icon(Icons.close, size: 16, color: colorSubtexto),
          ),
        ],
      ),
    );
  }
}

class _SelectorTipoPago extends StatelessWidget {
  final String value;
  final void Function(String) onChanged;
  const _SelectorTipoPago({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      decoration: const InputDecoration(labelText: 'Tipo de pago'),
      items: const [
        DropdownMenuItem(value: 'efectivo', child: Text('Efectivo')),
        DropdownMenuItem(
            value: 'transferencia', child: Text('Transferencia')),
      ],
      onChanged: (v) => onChanged(v ?? 'efectivo'),
    );
  }
}
