import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:wh_app/core/models/org.dart';
import 'package:wh_app/core/models/event.dart';
import 'package:wh_app/core/models/announcement.dart';
import 'package:wh_app/features/home/presentation/widgets/org_info_card.dart';
import 'package:wh_app/features/home/presentation/widgets/event_list_item.dart';
import 'package:wh_app/features/home/presentation/widgets/announcement_list_item.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mockOrg = Org(
      id: '1',
      name: '紐約唐人街同鄉總會',
      logo: '',
      description: '成立於1980年，旨在聯絡鄉情，服務鄉親，促進僑社安定繁榮。',
      memberCount: 500,
    );

    final mockEvents = List.generate(3, (index) => Event(
      id: '$index',
      orgId: '1',
      title: '2026 春節聯歡大宴會',
      type: 'party',
      coverImage: '',
      content: '春回大地，萬象更新...',
      eventDate: DateTime.now().add(Duration(days: index * 7)),
      venueName: '華埠大酒樓',
      address: '紐約華埠東百老匯88號',
      status: 'upcoming',
      visibility: 'public',
    ));

    final mockAnnouncements = List.generate(3, (index) => Announcement(
      id: '$index',
      orgId: '1',
      title: '關於2026年度會費繳納通知',
      type: 'notice',
      content: '各位會員：請按時繳納會費...',
      isPinned: index == 0,
      visibility: 'public',
      createdAt: DateTime.now().subtract(Duration(days: index)),
    ));

    return Scaffold(
      appBar: AppBar(
        title: const Text('紐約唐人街同鄉會'),
        centerTitle: true,
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await Future.delayed(const Duration(seconds: 1));
        },
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          children: [
            OrgInfoCard(org: mockOrg),
            const SizedBox(height: 24),
            _buildHeader(context, '最新活動', () => context.go('/events')),
            ...mockEvents.map((e) => EventListItem(
                  event: e,
                  onTap: () => context.push('/events/detail/${e.id}'),
                )),
            const SizedBox(height: 24),
            _buildHeader(context, '最新公告', () => context.go('/announcements')),
            Card(
              child: Column(
                children: mockAnnouncements
                    .map((a) => AnnouncementListItem(
                          announcement: a,
                          onTap: () => context.push('/announcements/detail/${a.id}'),
                        ))
                    .toList(),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String title, VoidCallback onMore) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
          ),
          TextButton(
            onPressed: onMore,
            child: const Text('全部 >', style: TextStyle(fontSize: 20)),
          ),
        ],
      ),
    );
  }
}
