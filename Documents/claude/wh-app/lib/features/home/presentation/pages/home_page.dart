import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/providers/api_providers.dart';
import 'package:wh_app/core/models/org.dart';
import 'package:wh_app/core/constants/app_constants.dart';
import 'package:wh_app/features/home/presentation/widgets/org_info_card.dart';
import 'package:wh_app/features/home/presentation/widgets/event_list_item.dart';
import 'package:wh_app/features/home/presentation/widgets/announcement_list_item.dart';
import 'package:wh_app/shared/widgets/state_widgets.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orgAsync = ref.watch(orgProvider);
    final eventsAsync = ref.watch(eventsProvider);
    final announcementsAsync = ref.watch(announcementsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('紐約唐人街同鄉會'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          // 刷新所有數據
          ref.invalidate(orgProvider);
          ref.invalidate(eventsProvider);
          ref.invalidate(announcementsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.symmetric(
            horizontal: AppConstants.spacingMedium,
            vertical: AppConstants.spacingSmall,
          ),
          children: [
            _buildOrgSection(context, orgAsync),
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

  Widget _buildOrgSection(BuildContext context, AsyncValue<Org> orgAsync) {
    return orgAsync.when(
      loading: () => const Card(
        child: Padding(
          padding: EdgeInsets.all(AppConstants.spacingLarge),
          child: Center(child: CircularProgressIndicator()),
        ),
      ),
      error: (err, stack) => OrgInfoCard(
        org: Org(
          id: '1',
          name: '紐約唐人街同鄉總會',
          logo: '',
          description: '成立於1980年，旨在聯絡鄉情，服務鄉親，促進僑社安定繁榮。',
          memberCount: 500,
        ),
      ),
      data: (org) => OrgInfoCard(org: org),
    );
  }

  Widget _buildEventsSection(
    BuildContext context,
    AsyncValue<List<dynamic>> eventsAsync,
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
          message: getErrorMessage(err),
          onRetry: () => ref.invalidate(eventsProvider),
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
    AsyncValue<List<dynamic>> announcementsAsync,
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
          message: getErrorMessage(err),
          onRetry: () => ref.invalidate(announcementsProvider),
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
