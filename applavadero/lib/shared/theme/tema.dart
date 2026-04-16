import 'package:flutter/material.dart';
import 'colores.dart';

ThemeData buildTema() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: const ColorScheme.light(
      primary: colorPrimario,
      surface: colorSuperficie,
      onSurface: colorTexto,
    ),
    scaffoldBackgroundColor: colorFondo,
    cardTheme: CardThemeData(
      color: colorSuperficie,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: colorDivisor),
      ),
      margin: const EdgeInsets.symmetric(vertical: 6),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: colorSuperficie,
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
        borderSide: const BorderSide(color: colorPrimario, width: 2),
      ),
      labelStyle: const TextStyle(color: colorSubtexto),
      hintStyle: const TextStyle(color: colorSubtexto),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: colorPrimario,
        foregroundColor: Colors.white,
        minimumSize: const Size(double.infinity, 52),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle:
            const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: colorSuperficie,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: colorTexto,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
      iconTheme: IconThemeData(color: colorTexto),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: colorSuperficie,
      selectedItemColor: colorPrimario,
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
