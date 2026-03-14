import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/providers/mock_data_providers.dart';
import 'package:wh_app/core/constants/app_constants.dart';
import 'package:wh_app/features/home/presentation/widgets/org_info_card.dart';
import 'package:wh_app/features/home/presentation/widgets/event_list_item.dart';
import 'package:wh_app/features/home/presentation/widgets/announcement_list_item.dart';
import 'package:wh_app/shared/widgets/state_widgets.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final org = ref.watch(mockOrgProvider);
    final eventsAsync = ref.watch(mockEventsProvider);
    final announcementsAsync = ref.watch(mockAnnouncementsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('紐約唐人街同鄉會'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // 刷新数据
          ref.invalidate(mockEventsProvider);
          ref.invalidate(mockAnnouncementsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppConstants.spacingMedium,
            vertical: AppConstants.spacingSmall,
          ),
          children: [
            OrgInfoCard(org: org),
            const SizedBox(height: AppConstants.spacingLarge),
            _buildHeader(context, '最新活動', () => context.go('/events')),
            _buildEventsSection(context, eventsAsync, ref),
            const SizedBox(height: AppConstants.spacingLarge),
            _buildHeader(context, '最新公告', () => context.go('/announcements')),
            _buildAnnouncementsSection(context, announcementsAsync, ref),
            const SizedBox(height: AppConstants.spacingXLarge),
          ],
        ),
      ),
    );
  }

  Widget _buildEventsSection(
    BuildContext context,
    AsyncValue eventsAsync,
    WidgetRef ref,
  ) {
    return eventsAsync.when(
      loading: () => const SizedBox(
        height: 200,
        child: LoadingStateWidget(message: '加載活動中...'),
      ),
      error: (err, stack) => SizedBox(
        height: 200,
        child: ErrorStateWidget(
          message: '加載活動失敗',
          onRetry: () => ref.invalidate(mockEventsProvider),
        ),
      ),
      data: (events) {
        if (events.isEmpty) {
          return const SizedBox(
            height: 150,
            child: EmptyStateWidget(
              icon: Icons.event_busy,
              message: '暫無活動',
            ),
          );
        }
        return Column(
          children: events
              .map((e) => EventListItem(
                    event: e,
                    onTap: () => context.push('/events/detail/${e.id}'),
                  ))
              .toList(),
        );
      },
    );
  }

  Widget _buildAnnouncementsSection(
    BuildContext context,
    AsyncValue announcementsAsync,
    WidgetRef ref,
  ) {
    return announcementsAsync.when(
      loading: () => const SizedBox(
        height: 150,
        child: LoadingStateWidget(message: '加載公告中...'),
      ),
      error: (err, stack) => SizedBox(
        height: 150,
        child: ErrorStateWidget(
          message: '加載公告失敗',
          onRetry: () => ref.invalidate(mockAnnouncementsProvider),
        ),
      ),
      data: (announcements) {
        if (announcements.isEmpty) {
          return const SizedBox(
            height: 150,
            child: EmptyStateWidget(
              icon: Icons.campaign_outlined,
              message: '暫無公告',
            ),
          );
        }
        return Card(
          child: Column(
            children: announcements
                .map((a) => AnnouncementListItem(
                      announcement: a,
                      onTap: () => context.push('/announcements/detail/${a.id}'),
                    ))
                .toList(),
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context, String title, VoidCallback onMore) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppConstants.spacingSmall),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: AppConstants.fontSizeLarge,
              fontWeight: FontWeight.bold,
            ),
          ),
          TextButton(
            onPressed: onMore,
            child: const Text(
              '全部 >',
              style: TextStyle(fontSize: AppConstants.fontSizeNormal),
            ),
          ),
        ],
      ),
    );
  }
}
