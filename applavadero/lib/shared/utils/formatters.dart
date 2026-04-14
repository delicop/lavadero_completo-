import 'package:intl/intl.dart';

String formatearPesos(num monto) {
  final formatter = NumberFormat.currency(
    locale: 'es_CO',
    symbol: '\$',
    decimalDigits: 0,
  );
  return formatter.format(monto);
}

String formatearFecha(String isoDate) {
  final fecha = DateTime.parse(isoDate).toLocal();
  return DateFormat("EEEE d 'de' MMMM", 'es').format(fecha);
}

String formatearFechaCorta(String isoDate) {
  final fecha = DateTime.parse(isoDate).toLocal();
  return DateFormat('dd/MM/yyyy', 'es').format(fecha);
}

String formatearHora(String isoDate) {
  return DateFormat('HH:mm').format(DateTime.parse(isoDate).toLocal());
}

String fechaHoyIso() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
}
