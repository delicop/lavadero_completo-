import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/models/turno.dart';
import '../../core/services/turno_service.dart';
import '../../core/services/facturacion_service.dart';
import '../../shared/theme/colores.dart';
import '../../shared/utils/formatters.dart';
import '../../shared/widgets/boton_primario.dart';

class CobrarScreen extends StatefulWidget {
  final String turnoId;
  const CobrarScreen({super.key, required this.turnoId});

  @override
  State<CobrarScreen> createState() => _CobrarScreenState();
}

class _CobrarScreenState extends State<CobrarScreen> {
  Turno? _turno;
  bool _loading = true;
  bool _procesando = false;
  String? _metodoPago;
  String? _error;

  static const _metodos = [
    ('efectivo', 'Efectivo', Icons.payments),
    ('transferencia', 'Transferencia', Icons.account_balance),
    ('debito', 'Débito', Icons.credit_card),
    ('credito', 'Crédito', Icons.credit_card_outlined),
  ];

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    try {
      final turno =
          await context.read<TurnoService>().getTurno(widget.turnoId);
      if (mounted) setState(() { _turno = turno; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _confirmar() async {
    if (_metodoPago == null || _turno == null) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: colorSuperficie,
        title: const Text('Confirmar cobro'),
        content: Text(
            '¿Confirmar cobro de ${formatearPesos(_turno!.servicio?.precio ?? 0)} por $_metodoPago?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar')),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Confirmar')),
        ],
      ),
    );

    if (ok != true || !mounted) return;

    setState(() => _procesando = true);
    try {
      await context
          .read<FacturacionService>()
          .facturar(widget.turnoId, _metodoPago!, _turno!.servicio?.precio ?? 0);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cobro registrado correctamente')));
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    }
    if (mounted) setState(() => _procesando = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cobrar'),
        leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop()),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: colorPrimario))
          : _error != null && _turno == null
              ? Center(
                  child: Text(_error!,
                      style: const TextStyle(color: colorCancelado)))
              : Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (_turno?.vehiculo != null)
                        Text(_turno!.vehiculo!.descripcionCompleta,
                            style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700)),
                      if (_turno?.servicio != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Text(_turno!.servicio!.nombre,
                              style: const TextStyle(
                                  color: colorSubtexto)),
                        ),
                      const SizedBox(height: 24),
                      if (_turno?.servicio != null)
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: colorSuperficie,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: colorDivisor),
                          ),
                          child: Column(
                            children: [
                              const Text('Total a cobrar',
                                  style:
                                      TextStyle(color: colorSubtexto)),
                              const SizedBox(height: 8),
                              Text(
                                formatearPesos(
                                    _turno!.servicio!.precio),
                                style: const TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.w800,
                                    color: colorCompletado),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 24),
                      const Text('Método de pago',
                          style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 15)),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: _metodos.map((m) {
                          final seleccionado = _metodoPago == m.$1;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _metodoPago = m.$1),
                            child: Container(
                              width:
                                  (MediaQuery.of(context).size.width -
                                          58) /
                                      2,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: seleccionado
                                    ? colorPrimario
                                        .withValues(alpha: 0.15)
                                    : colorSuperficie,
                                borderRadius:
                                    BorderRadius.circular(12),
                                border: Border.all(
                                    color: seleccionado
                                        ? colorPrimario
                                        : colorDivisor),
                              ),
                              child: Row(
                                children: [
                                  Icon(m.$3,
                                      color: seleccionado
                                          ? colorPrimario
                                          : colorSubtexto,
                                      size: 20),
                                  const SizedBox(width: 10),
                                  Text(m.$2,
                                      style: TextStyle(
                                          color: seleccionado
                                              ? colorPrimario
                                              : colorTexto,
                                          fontWeight:
                                              FontWeight.w500)),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 12),
                        Text(_error!,
                            style:
                                const TextStyle(color: colorCancelado)),
                      ],
                      const Spacer(),
                      SafeArea(
                        top: false,
                        child: BotonPrimario(
                          texto: 'Confirmar cobro',
                          icono: Icons.check,
                          loading: _procesando,
                          onPressed: _metodoPago != null ? _confirmar : null,
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
