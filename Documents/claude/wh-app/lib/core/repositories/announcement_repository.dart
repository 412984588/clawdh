import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/announcement.dart';

class AnnouncementRepository {
  final ApiClient _apiClient;
  String _accessToken = '';

  AnnouncementRepository(this._apiClient);

  void updateToken(String token) => _accessToken = token;

  Future<ApiResponse<List<Announcement>>> getAnnouncements(String orgId, {int page = 1}) async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.announcementFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {
        'action': 'list',
        'org_id': orgId,
        'page': page,
      },
      fromDataJson: (json) => (json['list'] as List).map((e) => Announcement.fromJson(e)).toList(),
    );
  }
}
