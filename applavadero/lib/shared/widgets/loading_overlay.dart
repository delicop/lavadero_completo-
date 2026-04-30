import 'package:flutter/material.dart';
import '../theme/colores.dart';

class LoadingOverlay extends StatelessWidget {
  final bool loading;
  final Widget child;

  const LoadingOverlay({super.key, required this.loading, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (loading)
          Positioned.fill(
            child: AbsorbPointer(
              child: Container(
                color: colorFondo.withValues(alpha: 0.7),
                child: Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: colorSuperficie,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: colorDivisor),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 26,
                        height: 26,
                        child: CircularProgressIndicator(
                          color: colorPrimario,
                          strokeWidth: 2,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
