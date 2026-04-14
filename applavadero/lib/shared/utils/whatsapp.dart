String normalizarTelefono(String telefono) {
  final limpio = telefono.replaceAll(RegExp(r'\D'), '');
  if (limpio.startsWith('57')) return limpio;
  if (limpio.startsWith('3') && limpio.length == 10) return '57$limpio';
  return limpio;
}

String urlWhatsapp(String telefono, {String? mensaje}) {
  final numero = normalizarTelefono(telefono);
  final msg = mensaje != null ? Uri.encodeComponent(mensaje) : '';
  return 'https://wa.me/$numero${msg.isNotEmpty ? '?text=$msg' : ''}';
}
