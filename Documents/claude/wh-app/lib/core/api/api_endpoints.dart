import '../config/app_config.dart';

class ApiEndpoints {
  static const String baseUrl = 'https://api.weixin.qq.com/tcb/invokecloudfunction';
  static const String envId = AppConfig.wxEnvId;

  // 雲函數名稱
  static const String userFunction = 'user';
  static const String eventFunction = 'event';
  static const String announcementFunction = 'announcement';
  static const String orgFunction = 'org';
  static const String membershipFunction = 'membership';

  // 微信登錄相關（由 App 轉發或直接調用）
  static const String wxLoginUrl = 'https://api.weixin.qq.com/sns/jscode2session';

  // 構造請求 URL
  static String getInvokeUrl(String functionName, String accessToken) {
    assert(
      AppConfig.hasValidEnvId,
      'WX_ENV_ID 未配置，请使用 --dart-define=WX_ENV_ID=xxxx 设置',
    );
    return '$baseUrl?access_token=$accessToken&env=$envId&name=$functionName';
  }
}
