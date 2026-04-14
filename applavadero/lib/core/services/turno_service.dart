import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/turno.dart';

class TurnoService {
  final ApiClient _api;
  TurnoService(this._api);

  Future<List<Turno>> getTurnos(
      {String? fechaDesde, String? fechaHasta, String? estado}) async {
    final params = <String, dynamic>{};
    if (fechaDesde != null) params['fechaDesde'] = fechaDesde;
    if (fechaHasta != null) params['fechaHasta'] = fechaHasta;
    if (estado != null) params['estado'] = estado;

    final res =
        await _api.get(ApiEndpoints.turnos, queryParameters: params);
    return (res as List).map((t) => Turno.fromJson(t)).toList();
  }

  Future<List<Turno>> getTurnosPorTrabajador(
      String trabajadorId, {String? fechaDesde, String? fechaHasta}) async {
    final params = <String, dynamic>{};
    if (fechaDesde != null) params['fechaDesde'] = fechaDesde;
    if (fechaHasta != null) params['fechaHasta'] = fechaHasta;

    final res = await _api.get(
        '/api/turnos/trabajador/$trabajadorId',
        queryParameters: params);
    return (res as List).map((t) => Turno.fromJson(t)).toList();
  }

  Future<Turno> getTurno(String id) async {
    final res = await _api.get(ApiEndpoints.turnoDetalle(id));
    return Turno.fromJson(res as Map<String, dynamic>);
  }

  Future<Turno> crearTurno(Map<String, dynamic> data) async {
    final res = await _api.post(ApiEndpoints.turnos, data: data);
    return Turno.fromJson(res as Map<String, dynamic>);
  }

  Future<Turno> cambiarEstado(String id, String estado) async {
    final res = await _api
        .patch(ApiEndpoints.turnoEstado(id), data: {'estado': estado});
    return Turno.fromJson(res as Map<String, dynamic>);
  }
}
