# Estilo Dark Teal — Backup de diseño (abril 2026)

Guardado antes de migrar a estilo minimalista clásico.
Para restaurar: copiar los valores de cada sección a sus archivos correspondientes.

---

## `lib/shared/theme/colores.dart`

```dart
import 'package:flutter/material.dart';

// Backgrounds
const colorFondo          = Color(0xFF0E1116);
const colorSuperficie     = Color(0xFF161B24);
const colorSuperficieAlta = Color(0xFF1E2635);

// Brand
const colorPrimario = Color(0xFF00CEB8);

// Text
const colorTexto    = Color(0xFFE8ECF4);
const colorSubtexto = Color(0xFF6B7A9A);

// Structure
const colorDivisor = Color(0xFF252D3E);

// Status
const colorPendiente  = Color(0xFFFFBD3C);
const colorEnProceso  = Color(0xFF3B9EFF);
const colorCompletado = Color(0xFF2EDD9A);
const colorCancelado  = Color(0xFFFF4560);

Color colorEstado(String estado) {
  switch (estado) {
    case 'pendiente':  return colorPendiente;
    case 'en_proceso': return colorEnProceso;
    case 'completado': return colorCompletado;
    case 'cancelado':  return colorCancelado;
    default:           return colorSubtexto;
  }
}
```

---

## `lib/shared/theme/tema.dart`

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colores.dart';

Color _parseHex(String? hex, Color fallback) {
  if (hex == null || hex.length != 7 || !hex.startsWith('#')) return fallback;
  try {
    return Color(int.parse('FF${hex.substring(1)}', radix: 16));
  } catch (_) {
    return fallback;
  }
}

ThemeData buildTema({
  String? colorPrimarioHex,
  String? colorFondoHex,
  String? colorSuperficieHex,
}) {
  final primary    = _parseHex(colorPrimarioHex, colorPrimario);
  final fondo      = _parseHex(colorFondoHex, colorFondo);
  final superficie = _parseHex(colorSuperficieHex, colorSuperficie);

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.dark(
      primary: primary,
      surface: superficie,
      onSurface: colorTexto,
      onPrimary: colorFondo,
      surfaceContainerHighest: colorSuperficieAlta,
      outline: colorDivisor,
    ),
    scaffoldBackgroundColor: fondo,
    cardTheme: CardThemeData(
      color: superficie,
      elevation: 0,
      clipBehavior: Clip.hardEdge,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: colorDivisor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 5),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: colorSuperficieAlta,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: colorDivisor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: colorDivisor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: primary, width: 2),
      ),
      labelStyle: const TextStyle(color: colorSubtexto),
      hintStyle: const TextStyle(color: colorSubtexto),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: colorFondo,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.barlowCondensed(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: superficie,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.barlowCondensed(
        color: colorTexto,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.4,
      ),
      iconTheme: const IconThemeData(color: colorTexto),
    ),
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: superficie,
      selectedItemColor: primary,
      unselectedItemColor: colorSubtexto,
      type: BottomNavigationBarType.fixed,
    ),
    dividerColor: colorDivisor,
    textTheme: TextTheme(
      displayLarge:   GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      displayMedium:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      displaySmall:   GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineLarge:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineMedium: GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineSmall:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600),
      titleLarge:     GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700, fontSize: 22),
      titleMedium:    GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 18),
      titleSmall:     GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 15),
      bodyLarge:      GoogleFonts.dmSans(color: colorTexto, fontSize: 16),
      bodyMedium:     GoogleFonts.dmSans(color: colorTexto, fontSize: 14),
      bodySmall:      GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelLarge:     GoogleFonts.dmSans(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 14),
      labelMedium:    GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelSmall:     GoogleFonts.dmSans(color: colorSubtexto, fontSize: 11),
    ),
  );
}
```

---

## `lib/shared/widgets/boton_primario.dart`

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/colores.dart';

class BotonPrimario extends StatelessWidget {
  final String texto;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icono;
  final bool peligro;

  const BotonPrimario({
    super.key,
    required this.texto,
    this.onPressed,
    this.loading = false,
    this.icono,
    this.peligro = false,
  });

  @override
  Widget build(BuildContext context) {
    final habilitado = !loading && onPressed != null;
    final baseColor = peligro ? colorCancelado : colorPrimario;
    final endColor  = peligro ? const Color(0xFFCC2244) : const Color(0xFF009E8E);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: habilitado ? onPressed : null,
        borderRadius: BorderRadius.circular(14),
        splashColor: baseColor.withValues(alpha: 0.2),
        child: Ink(
          decoration: BoxDecoration(
            gradient: habilitado
                ? LinearGradient(
                    colors: [baseColor, endColor],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : const LinearGradient(
                    colors: [Color(0xFF2A3045), Color(0xFF2A3045)],
                  ),
            borderRadius: BorderRadius.circular(14),
            boxShadow: habilitado
                ? [
                    BoxShadow(
                      color: baseColor.withValues(alpha: 0.38),
                      blurRadius: 18,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : null,
          ),
          child: SizedBox(
            width: double.infinity,
            height: 54,
            child: Center(
              child: loading
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (icono != null) ...[
                          Icon(icono, size: 20, color: colorFondo),
                          const SizedBox(width: 8),
                        ],
                        Text(
                          texto.toUpperCase(),
                          style: GoogleFonts.barlowCondensed(
                            color: habilitado ? colorFondo : colorSubtexto,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.6,
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## Características visuales clave

| Elemento | Valor |
|---|---|
| Nav flotante | Pill animada 220ms, bg `colorPrimario α0.15` + borde teal |
| HeroHeader | Gradiente `colorSuperficieAlta → #0A2828`, sombra teal |
| CardTurno | Franja lateral 4px con color de estado |
| Botón NUEVO | Gradiente `#00D4BE → colorPrimario`, inline en header |
| Status chips | Colores neón vibrantes con `α0.15` de bg |
| Inputs | Fill `colorSuperficieAlta`, borde teal en focus |
