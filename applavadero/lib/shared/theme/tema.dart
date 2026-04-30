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
    brightness: Brightness.light,
    colorScheme: ColorScheme.light(
      primary: primary,
      surface: superficie,
      onSurface: colorTexto,
      onPrimary: Colors.white,
      surfaceContainerHighest: colorSuperficieAlta,
      outline: colorDivisor,
    ),
    scaffoldBackgroundColor: fondo,
    cardTheme: CardThemeData(
      color: colorSuperficie,
      elevation: 0,
      clipBehavior: Clip.hardEdge,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: colorDivisor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 5),
      shadowColor: Colors.transparent,
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
        borderSide: BorderSide(color: primary, width: 1.5),
      ),
      labelStyle: const TextStyle(color: colorSubtexto),
      hintStyle: const TextStyle(color: colorSubtexto),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: GoogleFonts.dmSans(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.3,
        ),
      ),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: colorSuperficie,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.playfairDisplay(
        color: colorTexto,
        fontSize: 22,
        fontWeight: FontWeight.w700,
      ),
      iconTheme: const IconThemeData(color: colorTexto),
    ),
    dividerColor: colorDivisor,
    textTheme: TextTheme(
      displayLarge:   GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700),
      displayMedium:  GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700),
      displaySmall:   GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700),
      headlineLarge:  GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700),
      headlineMedium: GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700),
      headlineSmall:  GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w600),
      titleLarge:     GoogleFonts.playfairDisplay(color: colorTexto, fontWeight: FontWeight.w700, fontSize: 22),
      titleMedium:    GoogleFonts.dmSans(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 16),
      titleSmall:     GoogleFonts.dmSans(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 14),
      bodyLarge:      GoogleFonts.dmSans(color: colorTexto, fontSize: 16),
      bodyMedium:     GoogleFonts.dmSans(color: colorTexto, fontSize: 14),
      bodySmall:      GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelLarge:     GoogleFonts.dmSans(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 14),
      labelMedium:    GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelSmall:     GoogleFonts.dmSans(color: colorSubtexto, fontSize: 11),
    ),
  );
}
