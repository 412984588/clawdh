import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/org.dart';

class OrgRepository {
  final ApiClient _apiClient;
  String _accessToken = '';

  OrgRepository(this._apiClient);

  void updateToken(String token) => _accessToken = token;

  Future<ApiResponse<List<Org>>> getOrgs() async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.orgFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {'action': 'list'},
      fromDataJson: (json) => (json as List).map((e) => Org.fromJson(e)).toList(),
    );
  }

  Future<ApiResponse<Org>> getOrgDetail(String orgId) async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.orgFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {
        'action': 'detail',
        'data': {'orgId': orgId}
      },
      fromDataJson: (json) => Org.fromJson(json),
    );
  }
}
