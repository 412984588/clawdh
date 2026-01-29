import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/providers/mock_data_providers.dart';
import 'package:wh_app/core/constants/app_constants.dart';
import 'package:wh_app/features/home/presentation/widgets/event_list_item.dart';
import 'package:wh_app/shared/widgets/state_widgets.dart';

class EventPage extends ConsumerWidget {
  const EventPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventsAsync = ref.watch(mockEventsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('活動列表'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(mockEventsProvider);
        },
        child: eventsAsync.when(
          loading: () => const LoadingStateWidget(message: '加載活動中...'),
          error: (err, stack) => ErrorStateWidget(
            message: '加載活動失敗: $err',
            onRetry: () => ref.invalidate(mockEventsProvider),
          ),
          data: (events) {
            if (events.isEmpty) {
              return const EmptyStateWidget(
                icon: Icons.event_busy,
                message: '暫無活動',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(AppConstants.spacingMedium),
              itemCount: events.length,
              itemBuilder: (context, index) {
                final event = events[index];
                return EventListItem(
                  event: event,
                  onTap: () => context.push('/events/detail/${event.id}'),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
