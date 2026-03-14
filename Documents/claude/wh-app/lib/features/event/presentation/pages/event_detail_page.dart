import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:wh_app/core/models/event.dart';

class EventDetailPage extends StatelessWidget {
  final String eventId;

  const EventDetailPage({super.key, required this.eventId});

  @override
  Widget build(BuildContext context) {
    // Mock Event Data
    final event = Event(
      id: eventId,
      orgId: '1',
      title: '2026 春節聯歡大宴會',
      type: 'party',
      coverImage: '',
      content: '春回大地，萬象更新。紐約唐人街同鄉會誠邀各位會員參加2026年春節聯歡大宴會。現場將有精彩舞獅表演、抽獎活動及豐盛晚宴。',
      eventDate: DateTime.now().add(const Duration(days: 10)),
      venueName: '華埠大酒樓',
      address: '紐約華埠東百老匯88號',
      status: 'upcoming',
      visibility: 'public',
    );

    return Scaffold(
      appBar: AppBar(title: const Text('活動詳情')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 200,
              color: Colors.grey[300],
              child: const Icon(Icons.image, size: 80, color: Colors.grey),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 20),
                  _buildInfoRow(Icons.calendar_today, '時間', DateFormat('yyyy-MM-dd HH:mm').format(event.eventDate)),
                  _buildInfoRow(Icons.location_on, '地點', event.venueName),
                  _buildInfoRow(Icons.map, '地址', event.address),
                  const Divider(height: 40),
                  const Text('活動介紹', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Text(
                    event.content,
                    style: const TextStyle(fontSize: 20, height: 1.5),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
        ),
        child: ElevatedButton(
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('報名功能開發中', style: TextStyle(fontSize: 18))),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).primaryColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            minimumSize: const Size(double.infinity, 60),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: const Text('立即報名', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 28, color: Colors.red),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 18, color: Colors.black54)),
                Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
