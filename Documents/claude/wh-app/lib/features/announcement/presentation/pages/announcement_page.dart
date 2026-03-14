import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/providers/mock_data_providers.dart';
import 'package:wh_app/core/constants/app_constants.dart';
import 'package:wh_app/features/home/presentation/widgets/announcement_list_item.dart';
import 'package:wh_app/shared/widgets/state_widgets.dart';

class AnnouncementPage extends ConsumerWidget {
  const AnnouncementPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final announcementsAsync = ref.watch(mockAnnouncementsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('公告通知'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(mockAnnouncementsProvider);
        },
        child: announcementsAsync.when(
          loading: () => const LoadingStateWidget(message: '加載公告中...'),
          error: (err, stack) => ErrorStateWidget(
            message: '加載公告失敗: $err',
            onRetry: () => ref.invalidate(mockAnnouncementsProvider),
          ),
          data: (announcements) {
            if (announcements.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.campaign_outlined,
                message: '暫無公告',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(AppConstants.spacingMedium),
              itemCount: announcements.length,
              itemBuilder: (context, index) {
                final announcement = announcements[index];
                return Card(
                  margin: const EdgeInsets.only(
                    bottom: AppConstants.spacingSmall,
                  ),
                  child: AnnouncementListItem(
                    announcement: announcement,
                    onTap: () => context.push(
                      '/announcements/detail/${announcement.id}',
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
