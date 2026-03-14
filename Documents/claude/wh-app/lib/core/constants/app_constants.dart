/// 应用常量定义
/// 统一管理字体大小、间距、超时等配置
class AppConstants {
  const AppConstants._();

  // 字体大小（适老化设计）
  static const double fontSizeXLarge = 32.0;
  static const double fontSizeLarge = 26.0;
  static const double fontSizeMedium = 22.0;
  static const double fontSizeNormal = 20.0;
  static const double fontSizeSmall = 18.0;

  // 间距
  static const double spacingXLarge = 32.0;
  static const double spacingLarge = 24.0;
  static const double spacingMedium = 16.0;
  static const double spacingSmall = 8.0;
  static const double spacingXSmall = 4.0;

  // 图标大小
  static const double iconSizeXLarge = 80.0;
  static const double iconSizeLarge = 50.0;
  static const double iconSizeMedium = 40.0;
  static const double iconSizeSmall = 30.0;

  // 按钮尺寸（适老化：最小点击区域 44x44）
  static const double buttonHeightLarge = 60.0;
  static const double buttonHeightMedium = 56.0;
  static const double minTapTarget = 44.0;

  // 圆角
  static const double borderRadiusLarge = 16.0;
  static const double borderRadiusMedium = 12.0;
  static const double borderRadiusSmall = 8.0;

  // 网络超时
  static const Duration networkConnectTimeout = Duration(seconds: 10);
  static const Duration networkReceiveTimeout = Duration(seconds: 10);

  // 验证相关
  static const Duration phoneVerificationTimeout = Duration(seconds: 60);
  static const int phoneNumberMinLength = 10;
  static const int phoneNumberMaxLength = 11;
  static const int smsCodeLength = 6;
  static const int passwordMinLength = 6;
  static const int usernameMinLength = 3;

  // 刷新延迟（Mock）
  static const Duration mockRefreshDelay = Duration(seconds: 1);
  static const Duration mockLoginDelay = Duration(seconds: 2);

  // 图片缓存
  static const int imageCacheWidth = 160;
  static const int imageCacheHeight = 160;
}
