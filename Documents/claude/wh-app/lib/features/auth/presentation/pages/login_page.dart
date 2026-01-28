import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/repositories/providers.dart';
import 'package:wh_app/core/models/user.dart';
import 'package:wh_app/core/models/membership.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _phoneController = TextEditingController();
  final _codeController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordLogin = false;
  String? _errorMessage;

  @override
  void dispose() {
    _phoneController.dispose();
    _codeController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // 驗證輸入
  bool _validateInputs() {
    if (_isPasswordLogin) {
      final username = _usernameController.text.trim();
      final password = _passwordController.text;
      if (username.isEmpty || username.length < 3) {
        setState(() => _errorMessage = '用戶名至少3個字符');
        return false;
      }
      if (password.isEmpty || password.length < 6) {
        setState(() => _errorMessage = '密碼至少6個字符');
        return false;
      }
    } else {
      final phone = _phoneController.text.trim();
      final code = _codeController.text.trim();
      if (!RegExp(r'^\d{10,11}$').hasMatch(phone)) {
        setState(() => _errorMessage = '請輸入有效的手機號碼（10-11位數字）');
        return false;
      }
      if (!RegExp(r'^\d{6}$').hasMatch(code)) {
        setState(() => _errorMessage = '驗證碼為6位數字');
        return false;
      }
    }
    setState(() => _errorMessage = null);
    return true;
  }

  Future<void> _handleLogin() async {
    if (!_validateInputs()) return;

    ref.read(authLoadingProvider.notifier).state = true;

    // TODO: 替換為真實 API 調用
    await Future.delayed(const Duration(seconds: 2));

    // Mock 用戶數據（後續替換為真實 API 返回）
    final mockUser = User(
      id: '1',
      openid: 'mock_openid',
      name: '陳大文',
      avatarUrl: '',
      phone: _phoneController.text,
      hometown: '台山',
      preferences: UserPreferences(
        fontSize: 'large',
        ttsLanguage: 'zh-HK',
        ttsSpeed: 1.0,
      ),
    );

    final mockMembership = Membership(
      id: '1',
      openid: 'mock_openid',
      orgId: '1',
      status: 'active',
      role: 'member', // 普通會員，改為 'admin' 可測試管理員功能
    );

    ref.read(currentUserProvider.notifier).state = mockUser;
    ref.read(currentMembershipProvider.notifier).state = mockMembership;
    ref.read(authLoadingProvider.notifier).state = false;

    if (mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(authLoadingProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('會員登錄')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            Icon(Icons.account_balance, size: 80, color: Theme.of(context).primaryColor),
            const SizedBox(height: 24),
            Text(
              '歡迎使用\n紐約唐人街同鄉會',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor),
            ),
            const SizedBox(height: 48),
            if (_errorMessage != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red, fontSize: 18),
                  textAlign: TextAlign.center,
                ),
              ),
            if (!_isPasswordLogin) ...[
              _buildLargeTextField(controller: _phoneController, label: '手機號碼', icon: Icons.phone_android),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildLargeTextField(controller: _codeController, label: '驗證碼', icon: Icons.security)),
                  const SizedBox(width: 16),
                  ElevatedButton(onPressed: isLoading ? null : () {}, child: const Text('獲取')),
                ],
              ),
            ] else ...[
              _buildLargeTextField(controller: _usernameController, label: '用戶名', icon: Icons.person),
              const SizedBox(height: 16),
              _buildLargeTextField(controller: _passwordController, label: '密碼', icon: Icons.lock, obscureText: true),
            ],
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: isLoading ? null : _handleLogin,
              child: isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('立即登錄', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: () => setState(() => _isPasswordLogin = !_isPasswordLogin),
              child: Text(_isPasswordLogin ? '切換為手機號碼登錄' : '切換為用戶名密碼登錄', style: const TextStyle(fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLargeTextField({required TextEditingController controller, required String label, required IconData icon, bool obscureText = false}) {
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
