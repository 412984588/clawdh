import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wh_app/core/constants/app_constants.dart';
import 'package:wh_app/core/utils/validators.dart';
import 'package:wh_app/shared/widgets/state_widgets.dart';

void main() {
  group('Validators', () {
    test('validatePhone - 有效手机号', () {
      expect(Validators.validatePhone('1234567890'), isNull);
      expect(Validators.validatePhone('12345678901'), isNull);
    });

    test('validatePhone - 无效手机号', () {
      expect(Validators.validatePhone(''), isNotNull);
      expect(Validators.validatePhone('123'), isNotNull);
      expect(Validators.validatePhone('abcdefghij'), isNotNull);
    });

    test('validateSmsCode - 有效验证码', () {
      expect(Validators.validateSmsCode('123456'), isNull);
    });

    test('validateSmsCode - 无效验证码', () {
      expect(Validators.validateSmsCode(''), isNotNull);
      expect(Validators.validateSmsCode('12345'), isNotNull);
      expect(Validators.validateSmsCode('1234567'), isNotNull);
      expect(Validators.validateSmsCode('abcdef'), isNotNull);
    });

    test('validateEmail - 有效邮箱', () {
      expect(Validators.validateEmail('test@example.com'), isNull);
      expect(Validators.validateEmail('user.name@domain.org'), isNull);
    });

    test('validateEmail - 无效邮箱', () {
      expect(Validators.validateEmail(''), isNotNull);
      expect(Validators.validateEmail('invalid'), isNotNull);
      expect(Validators.validateEmail('test@'), isNotNull);
    });

    test('validatePassword - 有效密码', () {
      expect(Validators.validatePassword('123456'), isNull);
      expect(Validators.validatePassword('password123'), isNull);
    });

    test('validatePassword - 无效密码', () {
      expect(Validators.validatePassword(''), isNotNull);
      expect(Validators.validatePassword('12345'), isNotNull);
    });

    test('validateUsername - 有效用户名', () {
      expect(Validators.validateUsername('abc'), isNull);
      expect(Validators.validateUsername('username'), isNull);
    });

    test('validateUsername - 无效用户名', () {
      expect(Validators.validateUsername(''), isNotNull);
      expect(Validators.validateUsername('ab'), isNotNull);
    });
  });

  group('AppConstants', () {
    test('字体大小常量正确', () {
      expect(AppConstants.fontSizeXLarge, 32.0);
      expect(AppConstants.fontSizeLarge, 26.0);
      expect(AppConstants.fontSizeMedium, 22.0);
      expect(AppConstants.fontSizeNormal, 20.0);
      expect(AppConstants.fontSizeSmall, 18.0);
    });

    test('验证参数常量正确', () {
      expect(AppConstants.phoneNumberMinLength, 10);
      expect(AppConstants.phoneNumberMaxLength, 11);
      expect(AppConstants.smsCodeLength, 6);
      expect(AppConstants.passwordMinLength, 6);
      expect(AppConstants.usernameMinLength, 3);
    });
  });

  group('StateWidgets', () {
    testWidgets('EmptyStateWidget 显示正确', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              icon: Icons.event_busy,
              message: '暫無活動',
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.event_busy), findsOneWidget);
      expect(find.text('暫無活動'), findsOneWidget);
    });

    testWidgets('ErrorStateWidget 显示正确', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ErrorStateWidget(
              message: '加載失敗',
              onRetry: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.error_outline), findsOneWidget);
      expect(find.text('加載失敗'), findsOneWidget);
      expect(find.text('重試'), findsOneWidget);
    });

    testWidgets('LoadingStateWidget 显示正确', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingStateWidget(message: '加載中...'),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('加載中...'), findsOneWidget);
    });
  });
}
