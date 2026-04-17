import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/tenant_config.dart';

class TenantService {
  final ApiClient _api;
  TenantService(this._api);

  Future<TenantConfig> getConfig() async {
    final res = await _api.get(ApiEndpoints.tenantConfig);
    return TenantConfig.fromJson(res as Map<String, dynamic>);
  }

  Future<TenantConfig> actualizarConfig(Map<String, dynamic> data) async {
    final res = await _api.patch(ApiEndpoints.tenantConfig, data: data);
    return TenantConfig.fromJson(res as Map<String, dynamic>);
  }
}
