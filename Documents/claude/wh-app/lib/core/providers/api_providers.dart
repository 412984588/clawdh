import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:wh_app/core/models/event.dart';
import 'package:wh_app/core/models/announcement.dart';
import 'package:wh_app/core/models/org.dart';
import 'package:wh_app/core/models/user.dart';
import 'package:wh_app/core/repositories/providers.dart';

/// 組織 ID Provider（單一組織 App，固定為 '1'）
final currentOrgIdProvider = Provider<String>((ref) => '1');

/// 組織信息 Provider
final orgProvider = FutureProvider<Org>((ref) async {
  final repo = ref.watch(orgRepositoryProvider);
  final orgId = ref.watch(currentOrgIdProvider);
  
  final response = await repo.getOrgDetail(orgId);
  if (response.isSuccess && response.data != null) {
    return response.data!;
  }
  
  // 如果 API 失敗，返回默認組織信息
  return Org(
    id: orgId,
    name: '紐約唐人街同鄉總會',
    logo: '',
    description: '成立於1980年，旨在聯絡鄉情，服務鄉親，促進僑社安定繁榮。',
    memberCount: 500,
  );
});

/// 活動列表 Provider
final eventsProvider = FutureProvider<List<Event>>((ref) async {
  final repo = ref.watch(eventRepositoryProvider);
  final orgId = ref.watch(currentOrgIdProvider);
  
  final response = await repo.getEvents(orgId);
  if (response.isSuccess && response.data != null) {
    return response.data!;
  }
  
  throw ApiException(response.message, response.code);
});

/// 活動詳情 Provider
final eventDetailProvider = FutureProvider.family<Event, String>((ref, eventId) async {
  final repo = ref.watch(eventRepositoryProvider);
  
  final response = await repo.getEventDetail(eventId);
  if (response.isSuccess && response.data != null) {
    return response.data!;
  }
  
  throw ApiException(response.message, response.code);
});

/// 公告列表 Provider
final announcementsProvider = FutureProvider<List<Announcement>>((ref) async {
  final repo = ref.watch(announcementRepositoryProvider);
  final orgId = ref.watch(currentOrgIdProvider);
  
  final response = await repo.getAnnouncements(orgId);
  if (response.isSuccess && response.data != null) {
    return response.data!;
  }
  
  throw ApiException(response.message, response.code);
});

/// 公告詳情 Provider
final announcementDetailProvider = FutureProvider.family<Announcement, String>((ref, announcementId) async {
  final repo = ref.watch(announcementRepositoryProvider);
  
  final response = await repo.getAnnouncementDetail(announcementId);
  if (response.isSuccess && response.data != null) {
    return response.data!;
  }
  
  throw ApiException(response.message, response.code);
});

/// 當前用戶 Provider（從 API 獲取）
final userProfileProvider = FutureProvider<User?>((ref) async {
  final repoAsync = ref.watch(userRepositoryProvider);
  
  return repoAsync.when(
    data: (repo) async {
      final response = await repo.getInfo();
      if (response.isSuccess) {
        return response.data;
      }
      return null;
    },
    loading: () => null,
    error: (error, stackTrace) => null,
  );
});

/// 自定義異常類
class ApiException implements Exception {
  final String message;
  final int code;
  
  ApiException(this.message, [this.code = -1]);
  
  @override
  String toString() => 'ApiException: $message (code: $code)';
}

/// 網絡狀態 Provider
enum NetworkStatus { online, offline, slow }
final networkStatusProvider = StateProvider<NetworkStatus>((ref) => NetworkStatus.online);

/// 錯誤處理 Helper
String getErrorMessage(dynamic error) {
  if (error is ApiException) {
    return _getFriendlyErrorMessage(error.message, error.code);
  }
  if (error is Exception) {
    return error.toString().replaceAll('Exception: ', '');
  }
  return '發生未知錯誤，請稍後重試';
}

String _getFriendlyErrorMessage(String message, int code) {
  // 根據錯誤碼返回友好提示
  switch (code) {
    case -1:
      return '網絡連接失敗，請檢查網絡設置';
    case 401:
      return '登錄已過期，請重新登錄';
    case 403:
      return '沒有權限訪問此內容';
    case 404:
      return '請求的內容不存在';
    case 500:
      return '服務器暫時無法響應，請稍後重試';
    default:
      return message.isNotEmpty ? message : '操作失敗，請稍後重試';
  }
}
