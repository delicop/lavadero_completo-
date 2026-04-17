import 'package:flutter/material.dart';
import 'colores.dart';

Color _parseHex(String? hex, Color fallback) {
  if (hex == null || hex.length != 7 || !hex.startsWith('#')) return fallback;
  try {
    return Color(int.parse('FF${hex.substring(1)}', radix: 16));
  } catch (_) {
    return fallback;
  }
}

ThemeData buildTema({String? colorPrimarioHex, String? colorFondoHex, String? colorSuperficieHex}) {
  final primary    = _parseHex(colorPrimarioHex, colorPrimario);
  final fondo      = _parseHex(colorFondoHex, colorFondo);
  final superficie = _parseHex(colorSuperficieHex, colorSuperficie);

  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primary,
      surface: superficie,
      onSurface: colorTexto,
    ),
    scaffoldBackgroundColor: fondo,
    cardTheme: CardThemeData(
      color: superficie,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: colorDivisor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: superficie,
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
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle:
            const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: superficie,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: const TextStyle(
        color: colorTexto,
        fontSize: 20,
        fontWeight: FontWeight.w700,
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
    textTheme: const TextTheme(
      bodyLarge: TextStyle(color: colorTexto),
      bodyMedium: TextStyle(color: colorTexto),
      bodySmall: TextStyle(color: colorSubtexto),
      titleLarge:
          TextStyle(color: colorTexto, fontWeight: FontWeight.w700),
      titleMedium:
          TextStyle(color: colorTexto, fontWeight: FontWeight.w600),
    ),
  );
}
