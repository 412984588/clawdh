import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/event.dart';

class EventRepository {
  final ApiClient _apiClient;
  String _accessToken = '';

  EventRepository(this._apiClient);

  void updateToken(String token) => _accessToken = token;

  Future<ApiResponse<List<Event>>> getEvents(String orgId, {int page = 1}) async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.eventFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {
        'action': 'list',
        'org_id': orgId,
        'page': page,
      },
      fromDataJson: (json) => (json['list'] as List).map((e) => Event.fromJson(e)).toList(),
    );
  }

  Future<ApiResponse<Event>> getEventDetail(String eventId) async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.eventFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {
        'action': 'detail',
        'event_id': eventId,
      },
      fromDataJson: (json) => Event.fromJson(json),
    );
  }
}
