import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wh_app/core/models/org.dart';
import 'package:wh_app/core/models/event.dart';
import 'package:wh_app/core/models/announcement.dart';

/// Mock 数据 Provider
/// TODO: 后续替换为真实 API 调用

/// 组织信息 Provider
final mockOrgProvider = Provider<Org>((ref) {
  return Org(
    id: '1',
    name: '紐約唐人街同鄉總會',
    logo: '',
    description: '成立於1980年，旨在聯絡鄉情，服務鄉親，促進僑社安定繁榮。',
    memberCount: 500,
  );
});

/// 活动列表 Provider（模拟异步加载）
final mockEventsProvider = FutureProvider<List<Event>>((ref) async {
  // 模拟网络延迟
  await Future.delayed(const Duration(milliseconds: 500));

  return List.generate(
    3,
    (index) => Event(
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
    ),
  );
});

/// 公告列表 Provider（模拟异步加载）
final mockAnnouncementsProvider =
    FutureProvider<List<Announcement>>((ref) async {
  // 模拟网络延迟
  await Future.delayed(const Duration(milliseconds: 500));

  return List.generate(
    3,
    (index) => Announcement(
      id: '$index',
      orgId: '1',
      title: '關於2026年度會費繳納通知',
      type: 'notice',
      content: '各位會員：請按時繳納會費...',
      isPinned: index == 0,
      visibility: 'public',
      createdAt: DateTime.now().subtract(Duration(days: index)),
    ),
  );
});
