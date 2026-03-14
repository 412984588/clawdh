class AppConfig {
  const AppConfig._();

  // WeChat Cloud env id, set via: --dart-define=WX_ENV_ID=xxxx
  static const String wxEnvId =
      String.fromEnvironment('WX_ENV_ID', defaultValue: '');

  static bool get hasValidEnvId =>
      wxEnvId.isNotEmpty && wxEnvId != 'YOUR_ENV_ID';
}
