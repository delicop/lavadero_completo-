import 'package:flutter/material.dart';
import '../theme/colores.dart';

class LoadingOverlay extends StatelessWidget {
  final bool loading;
  final Widget child;

  const LoadingOverlay(
      {super.key, required this.loading, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (loading)
          Container(
            color: Colors.black38,
            child: const Center(
              child: CircularProgressIndicator(color: colorPrimario),
            ),
          ),
      ],
    );
  }
}
