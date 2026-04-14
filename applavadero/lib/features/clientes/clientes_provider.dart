import 'package:flutter/material.dart';
import '../../core/models/cliente.dart';
import '../../core/models/vehiculo.dart';
import '../../core/services/cliente_service.dart';
import '../../core/services/vehiculo_service.dart';

class ClientesProvider extends ChangeNotifier {
  final ClienteService _clienteService;
  final VehiculoService _vehiculoService;

  List<Cliente> clientes = [];
  List<Vehiculo> vehiculosCliente = [];
  bool loading = false;
  String? error;
  String busqueda = '';

  ClientesProvider(this._clienteService, this._vehiculoService);

  List<Cliente> get clientesFiltrados {
    if (busqueda.isEmpty) return clientes;
    final q = busqueda.toLowerCase();
    return clientes
        .where((c) =>
            c.nombreCompleto.toLowerCase().contains(q) ||
            c.telefono.contains(q))
        .toList();
  }

  Future<void> cargar() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      clientes = await _clienteService.getClientes();
    } catch (e) {
      error = e.toString();
    }
    loading = false;
    notifyListeners();
  }

  Future<void> cargarVehiculos(String clienteId) async {
    vehiculosCliente = [];
    notifyListeners();
    try {
      vehiculosCliente = await _vehiculoService.getVehiculos(clienteId);
    } catch (e) {
      error = e.toString();
    }
    notifyListeners();
  }

  void setBusqueda(String q) {
    busqueda = q;
    notifyListeners();
  }

  Future<Cliente?> crearCliente(Map<String, dynamic> data) async {
    try {
      final nuevo = await _clienteService.crearCliente(data);
      clientes = [...clientes, nuevo];
      notifyListeners();
      return nuevo;
    } catch (e) {
      error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
