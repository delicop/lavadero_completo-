import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'dart:async';
import '../api/api_endpoints.dart';
import '../auth/token_storage.dart';

class RealtimeService {
  final TokenStorage _tokenStorage;
  IO.Socket? _socket;

  final _turnoController = StreamController<dynamic>.broadcast();
  final _usuarioController = StreamController<dynamic>.broadcast();

  RealtimeService(this._tokenStorage);

  Stream<dynamic> get onTurnoActualizado => _turnoController.stream;
  Stream<dynamic> get onUsuarioActualizado => _usuarioController.stream;

  Future<void> conectar() async {
    if (_socket?.connected == true) return;

    final token = await _tokenStorage.read();

    _socket = IO.io(
      '$kBaseUrl/eventos',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .enableReconnection()
          .setReconnectionDelay(3000)
          .setAuth(token != null ? {'token': token} : {})
          .build(),
    );

    _socket!.on('turno:actualizado', (data) => _turnoController.add(data));
    _socket!.on('usuario:actualizado', (data) => _usuarioController.add(data));
    _socket!.on('usuario:cambiado', (data) => _usuarioController.add(data));
    _socket!.connect();
  }

  void desconectar() {
    _socket?.disconnect();
    _socket = null;
  }

  void dispose() {
    _turnoController.close();
    _usuarioController.close();
    desconectar();
  }
}
