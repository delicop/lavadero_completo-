import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';
import '../api/api_endpoints.dart';

class RealtimeService {
  IO.Socket? _socket;

  final _turnoController = StreamController<dynamic>.broadcast();
  final _usuarioController = StreamController<dynamic>.broadcast();

  Stream<dynamic> get onTurnoActualizado => _turnoController.stream;
  Stream<dynamic> get onUsuarioActualizado => _usuarioController.stream;

  void conectar() {
    // Limpiar conexión anterior si existe
    if (_socket != null) {
      _socket!.off('turno_actualizado');
      _socket!.off('usuario_actualizado');
      _socket!.disconnect();
      _socket = null;
    }

    _socket = IO.io(
      kBaseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .build(),
    );

    _socket!.on(
        'turno:actualizado', (data) => _turnoController.add(data));
    _socket!.on(
        'usuario:actualizado', (data) => _usuarioController.add(data));
    _socket!.connect();
  }

  void desconectar() {
    _socket?.off('turno_actualizado');
    _socket?.off('usuario_actualizado');
    _socket?.disconnect();
    _socket = null;
  }

  void dispose() {
    _turnoController.close();
    _usuarioController.close();
    desconectar();
  }
}
