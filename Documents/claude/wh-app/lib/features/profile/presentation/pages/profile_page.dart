import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/repositories/providers.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(appSettingsProvider);
    final firebaseUser = ref.watch(firebaseUserProvider).value;
    final isAdmin = ref.watch(isAdminProvider);

    final displayName = firebaseUser?.displayName ??
        firebaseUser?.email ??
        firebaseUser?.phoneNumber ??
        '會員';

    return Scaffold(
      appBar: AppBar(
        title: const Text('個人中心'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Theme.of(context).primaryColor,
                    child: const Icon(Icons.person, size: 50, color: Colors.white),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(displayName,
                            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
                        Text(isAdmin ? '管理員' : '普通會員',
                            style: const TextStyle(fontSize: 18)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (isAdmin)
            _buildMenuTile(
              Icons.admin_panel_settings,
              '管理後台入口',
              () => context.push('/admin'),
              isHighlight: true,
            ),
          const SizedBox(height: 24),
          const Text('系統設置', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('字體大小', style: TextStyle(fontSize: 20)),
                  const SizedBox(height: 12),
                  SegmentedButton<double>(
                    segments: const [
                      ButtonSegment(value: 0.8, label: Text('小')),
                      ButtonSegment(value: 1.0, label: Text('中')),
                      ButtonSegment(value: 1.2, label: Text('大')),
                      ButtonSegment(value: 1.4, label: Text('特大')),
                    ],
                    selected: {settings.fontSizeScale},
                    onSelectionChanged: (value) {
                      ref.read(appSettingsProvider.notifier).state =
                          settings.copyWith(fontSizeScale: value.first);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: () async {
              await ref.read(authServiceProvider).signOut();
              ref.read(currentUserProvider.notifier).state = null;
              if (context.mounted) context.go('/login');
            },
            child: const Text('退出登錄', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuTile(IconData icon, String title, VoidCallback onTap,
      {bool isHighlight = false}) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 30, color: isHighlight ? Colors.red : null),
        title: Text(title,
            style: TextStyle(fontSize: 22, fontWeight: isHighlight ? FontWeight.bold : null)),
        trailing: const Icon(Icons.chevron_right, size: 30),
        onTap: onTap,
      ),
    );
  }
}
