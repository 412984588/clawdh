import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wh_app/core/repositories/providers.dart';
import 'package:wh_app/core/models/announcement.dart';
import 'package:intl/intl.dart';

class AnnouncementDetailPage extends ConsumerStatefulWidget {
  final String id;

  const AnnouncementDetailPage({super.key, required this.id});

  @override
  ConsumerState<AnnouncementDetailPage> createState() => _AnnouncementDetailPageState();
}

class _AnnouncementDetailPageState extends ConsumerState<AnnouncementDetailPage> {
  bool _isSpeaking = false;

  @override
  void dispose() {
    // 頁面退出時停止 TTS 播放
    final ttsAsync = ref.read(ttsServiceProvider);
    ttsAsync.whenData((tts) => tts.stop());
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(appSettingsProvider);
    final ttsAsync = ref.watch(ttsServiceProvider);

    final announcement = Announcement(
      id: widget.id,
      orgId: '1',
      title: '關於2026年度會費繳納通知',
      type: 'important',
      content: '親愛的會員：\n\n為了確保同鄉會的各項活動順利開展，現開始收取2026年度會費。請各位鄉親於2月底前，攜帶會員證前往辦公室繳納。',
      isPinned: true,
      visibility: 'public',
      createdAt: DateTime.now(),
    );

    return Scaffold(
      appBar: AppBar(title: const Text('公告詳情')),
      body: ttsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('TTS 初始化失敗: $err')),
        data: (tts) => Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: Theme.of(context).primaryColor.withOpacity(0.05),
              child: Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: () async {
                      if (_isSpeaking) {
                        await tts.stop();
                      } else {
                        await tts.speak(announcement.content, settings.ttsLanguage);
                      }
                      setState(() => _isSpeaking = !_isSpeaking);
                    },
                    icon: Icon(_isSpeaking ? Icons.stop : Icons.volume_up, size: 30),
                    label: Text(_isSpeaking ? '停止播放' : '語音朗讀', style: const TextStyle(fontSize: 22)),
                  ),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      announcement.title,
                      style: TextStyle(
                        fontSize: (28 * settings.fontSizeScale).toDouble(),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '發布時間：${DateFormat('yyyy-MM-dd').format(announcement.createdAt)}',
                      style: const TextStyle(fontSize: 18),
                    ),
                    const Divider(height: 40),
                    Text(
                      announcement.content,
                      style: TextStyle(
                        fontSize: (22 * settings.fontSizeScale).toDouble(),
                        height: 1.6,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
