import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/repositories/providers.dart';

enum LoginMode { phone, email, wechat }
enum EmailMode { login, register }

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();
  final _smsController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  LoginMode _mode = LoginMode.phone;
  EmailMode _emailMode = EmailMode.login;
  bool _isLoading = false;
  bool _codeSent = false;
  String? _verificationId;

  @override
  void dispose() {
    _phoneController.dispose();
    _smsController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _setLoading(bool value) {
    if (mounted) {
      setState(() => _isLoading = value);
    }
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  Future<void> _sendPhoneCode() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      _showMessage('請輸入手機號碼');
      return;
    }

    _setLoading(true);
    final authService = ref.read(authServiceProvider);

    await authService.sendPhoneCode(
      phoneNumber: phone,
      onCodeSent: (verificationId, _) {
        _verificationId = verificationId;
        setState(() {
          _codeSent = true;
        });
        _showMessage('驗證碼已發送');
      },
      onError: (message) {
        _showMessage(message);
      },
      onAutoVerified: (_) async {
        if (mounted) context.go('/');
      },
    );
    _setLoading(false);
  }

  Future<void> _verifyPhoneCode() async {
    final smsCode = _smsController.text.trim();
    if ((_verificationId ?? '').isEmpty || smsCode.isEmpty) {
      _showMessage('請輸入驗證碼');
      return;
    }

    _setLoading(true);
    try {
      final authService = ref.read(authServiceProvider);
      await authService.verifySmsCode(
        verificationId: _verificationId!,
        smsCode: smsCode,
      );
      if (mounted) context.go('/');
    } on FirebaseAuthException catch (e) {
      _showMessage(e.message ?? '驗證失敗，請重試');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _handleEmailAuth() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isEmpty || password.isEmpty) {
      _showMessage('請輸入郵箱和密碼');
      return;
    }

    _setLoading(true);
    final authService = ref.read(authServiceProvider);
    try {
      if (_emailMode == EmailMode.login) {
        await authService.signInWithEmail(email: email, password: password);
      } else {
        await authService.signUpWithEmail(email: email, password: password);
      }
      if (mounted) context.go('/');
    } on FirebaseAuthException catch (e) {
      _showMessage(e.message ?? '登錄失敗，請重試');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> _handleWeChatLogin() async {
    _showMessage('WeChat 登錄需服務端兌換 Firebase 自定義 Token');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('會員登錄')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            Icon(Icons.account_balance, size: 80, color: Theme.of(context).primaryColor),
            const SizedBox(height: 16),
            Text(
              '歡迎使用\n紐約唐人街同鄉會',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor),
            ),
            const SizedBox(height: 32),
            SegmentedButton<LoginMode>(
              segments: const [
                ButtonSegment(value: LoginMode.phone, label: Text('手機')),
                ButtonSegment(value: LoginMode.email, label: Text('郵箱')),
                ButtonSegment(value: LoginMode.wechat, label: Text('微信')),
              ],
              selected: {_mode},
              onSelectionChanged: (value) {
                setState(() {
                  _mode = value.first;
                });
              },
            ),
            const SizedBox(height: 24),
            if (_mode == LoginMode.phone) ...[
              _buildLargeTextField(controller: _phoneController, label: '手機號碼', icon: Icons.phone_android),
              const SizedBox(height: 16),
              if (_codeSent)
                _buildLargeTextField(controller: _smsController, label: '驗證碼', icon: Icons.security),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading ? null : (_codeSent ? _verifyPhoneCode : _sendPhoneCode),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(_codeSent ? '驗證並登錄' : '獲取驗證碼', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              ),
            ],
            if (_mode == LoginMode.email) ...[
              _buildLargeTextField(controller: _emailController, label: '郵箱', icon: Icons.email),
              const SizedBox(height: 16),
              _buildLargeTextField(controller: _passwordController, label: '密碼', icon: Icons.lock, obscureText: true),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _isLoading ? null : _handleEmailAuth,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(_emailMode == EmailMode.login ? '登錄' : '註冊', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  setState(() {
                    _emailMode = _emailMode == EmailMode.login ? EmailMode.register : EmailMode.login;
                  });
                },
                child: Text(_emailMode == EmailMode.login ? '沒有帳號？註冊' : '已有帳號？登錄', style: const TextStyle(fontSize: 18)),
              ),
            ],
            if (_mode == LoginMode.wechat) ...[
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _handleWeChatLogin,
                icon: const Icon(Icons.chat, size: 28),
                label: const Text('微信登錄', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 12),
              const Text(
                '需要服務端兌換 Firebase 自定義 Token 後才能啟用。',
                style: TextStyle(fontSize: 16, color: Colors.grey),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildLargeTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool obscureText = false,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      style: const TextStyle(fontSize: 22),
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 30),
        border: const OutlineInputBorder(),
      ),
    );
  }
}
