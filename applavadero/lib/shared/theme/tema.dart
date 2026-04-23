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
      displayLarge:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      displayMedium: GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      displaySmall:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineLarge:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineMedium: GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700),
      headlineSmall:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600),
      titleLarge:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w700, fontSize: 22),
      titleMedium: GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 18),
      titleSmall:  GoogleFonts.barlowCondensed(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 15),
      bodyLarge:  GoogleFonts.dmSans(color: colorTexto, fontSize: 16),
      bodyMedium: GoogleFonts.dmSans(color: colorTexto, fontSize: 14),
      bodySmall:  GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelLarge:  GoogleFonts.dmSans(color: colorTexto, fontWeight: FontWeight.w600, fontSize: 14),
      labelMedium: GoogleFonts.dmSans(color: colorSubtexto, fontSize: 12),
      labelSmall:  GoogleFonts.dmSans(color: colorSubtexto, fontSize: 11),
    ),
  );
}
