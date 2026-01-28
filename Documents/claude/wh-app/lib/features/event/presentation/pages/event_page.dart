import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wh_app/core/repositories/providers.dart';

class EventPage extends ConsumerWidget {
  const EventPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 將 ref.watch 移到 build 方法頂部，避免在 itemBuilder 中調用
    // ignore: unused_local_variable
    final repo = ref.watch(eventRepositoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('活動列表'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: 10,
          itemBuilder: (context, index) {
            // 這裡只是演示 UI，實際應該是從 Provider 讀取狀態
            return const Center(child: Text('活動列表加載中...'));
          },
        ),
      ),
    );
  }
}
