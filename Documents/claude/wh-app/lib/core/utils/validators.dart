import 'package:wh_app/core/constants/app_constants.dart';

/// 输入验证工具类
class Validators {
  const Validators._();

  /// 验证手机号码
  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return '請輸入手機號碼';
    }
    final phone = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    if (phone.length < AppConstants.phoneNumberMinLength ||
        phone.length > AppConstants.phoneNumberMaxLength) {
      return '手機號碼長度不正確';
    }
    if (!RegExp(r'^\d+$').hasMatch(phone)) {
      return '手機號碼只能包含數字';
    }
    return null;
  }

  /// 验证短信验证码
  static String? validateSmsCode(String? value) {
    if (value == null || value.isEmpty) {
      return '請輸入驗證碼';
    }
    if (value.length != AppConstants.smsCodeLength) {
      return '驗證碼為${AppConstants.smsCodeLength}位數字';
    }
    if (!RegExp(r'^\d+$').hasMatch(value)) {
      return '驗證碼只能包含數字';
    }
    return null;
  }

  /// 验证邮箱
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return '請輸入郵箱';
    }
    final emailRegex = RegExp(r'^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return '郵箱格式不正確';
    }
    return null;
  }

  /// 验证密码
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return '請輸入密碼';
    }
    if (value.length < AppConstants.passwordMinLength) {
      return '密碼至少需要${AppConstants.passwordMinLength}位';
    }
    return null;
  }

  /// 验证用户名
  static String? validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      return '請輸入用戶名';
    }
    if (value.length < AppConstants.usernameMinLength) {
      return '用戶名至少需要${AppConstants.usernameMinLength}個字符';
    }
    return null;
  }

  /// 验证非空
  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return '請輸入$fieldName';
    }
    return null;
  }
}
