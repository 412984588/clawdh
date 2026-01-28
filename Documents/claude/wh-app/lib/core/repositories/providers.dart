import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/legacy.dart';
import 'package:wh_app/core/api/api_client.dart';
import 'package:wh_app/core/api/tts_service.dart';
import 'package:wh_app/core/repositories/user_repository.dart';
import 'package:wh_app/core/repositories/org_repository.dart';
import 'package:wh_app/core/repositories/event_repository.dart';
import 'package:wh_app/core/repositories/announcement_repository.dart';
import 'package:wh_app/core/models/user.dart';
import 'package:wh_app/core/models/membership.dart';
import 'package:wh_app/core/services/auth_service.dart';

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

// Repositories
final userRepositoryProvider = FutureProvider<UserRepository>((ref) async {
  final apiClient = ref.watch(apiClientProvider);
  final repo = UserRepository(apiClient);
  await repo.init();
  return repo;
});

final orgRepositoryProvider = Provider<OrgRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return OrgRepository(apiClient);
});

final eventRepositoryProvider = Provider<EventRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return EventRepository(apiClient);
});

final announcementRepositoryProvider = Provider<AnnouncementRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AnnouncementRepository(apiClient);
});

// Auth Service Provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final firebaseUserProvider = StreamProvider<fb.User?>((ref) {
  return ref.watch(authServiceProvider).authStateChanges;
});

// TTS Service Provider
final ttsServiceProvider = FutureProvider<TtsService>((ref) async {
  final service = TtsService();
  await service.init();
  return service;
});

// UI Settings Provider
class AppSettings {
  final double fontSizeScale;
  final String ttsLanguage;

  AppSettings({required this.fontSizeScale, required this.ttsLanguage});

  AppSettings copyWith({double? fontSizeScale, String? ttsLanguage}) {
    return AppSettings(
      fontSizeScale: fontSizeScale ?? this.fontSizeScale,
      ttsLanguage: ttsLanguage ?? this.ttsLanguage,
    );
  }
}

final appSettingsProvider = StateProvider<AppSettings>((ref) => AppSettings(
  fontSizeScale: 1.0,
  ttsLanguage: 'zh-HK',
));

// Auth State
final currentUserProvider = StateProvider<User?>((ref) => null);
final currentMembershipProvider = StateProvider<Membership?>((ref) => null);
final authLoadingProvider = StateProvider<bool>((ref) => false);
final isAuthenticatedProvider = Provider<bool>((ref) {
  final firebaseUser = ref.watch(firebaseUserProvider).value;
  return firebaseUser != null || ref.watch(currentUserProvider) != null;
});
final isAdminProvider = Provider<bool>((ref) {
  final membership = ref.watch(currentMembershipProvider);
  return membership?.role == 'admin';
});
