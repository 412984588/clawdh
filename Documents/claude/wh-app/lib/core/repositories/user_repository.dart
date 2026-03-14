import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/user.dart';

class UserRepository {
  final ApiClient _apiClient;
  final _storage = const FlutterSecureStorage();
  String _accessToken = '';

  UserRepository(this._apiClient);

  // 初始化加载 Token
  Future<void> init() async {
    _accessToken = await _storage.read(key: 'access_token') ?? '';
  }

  Future<void> updateToken(String token) async {
    _accessToken = token;
    await _storage.write(key: 'access_token', value: token);
  }

  // 真实登录流程：WeChat Code -> Cloud Function
  Future<ApiResponse<User>> loginWithWeChat(String code) async {
    // 1. 這裡通常先調用微信 SDK 拿 code
    // 2. 調用雲函數換取用户信息和 Token
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.userFunction, _accessToken);
    final response = await _apiClient.post(
      url,
      data: {
        'action': 'login',
        'data': {'code': code}
      },
      fromDataJson: (json) => User.fromJson(json),
    );

    if (response.isSuccess && response.data != null) {
      // TODO: 如果後端返回了 token，在這裡更新
      // await updateToken(response.data!.token);
    }
    return response;
  }

  Future<ApiResponse<User>> getInfo() async {
    final url = ApiEndpoints.getInvokeUrl(ApiEndpoints.userFunction, _accessToken);
    return await _apiClient.post(
      url,
      data: {'action': 'getInfo'},
      fromDataJson: (json) => User.fromJson(json['user']),
    );
  }

  Future<void> logout() async {
    _accessToken = '';
    await _storage.delete(key: 'access_token');
  }
}
