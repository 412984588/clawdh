import 'package:flutter/material.dart';

class AdminPage extends StatelessWidget {
  const AdminPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('管理後台')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Icon(Icons.security, size: 100, color: Colors.grey),
          const SizedBox(height: 24),
          const Center(
            child: Text(
              '管理權限驗證成功\n後台模塊正在建設中...',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(height: 48),
          _buildAdminTask('會員管理', Icons.people),
          _buildAdminTask('活動審核', Icons.event_note),
          _buildAdminTask('公告發布', Icons.campaign),
          _buildAdminTask('捐款錄入', Icons.volunteer_activism),
        ],
      ),
    );
  }

  Widget _buildAdminTask(String title, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: Icon(icon, size: 30),
        title: Text(title, style: const TextStyle(fontSize: 20)),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: () {},
      ),
    );
  }
}
