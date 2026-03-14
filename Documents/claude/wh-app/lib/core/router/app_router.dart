import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:wh_app/features/home/presentation/pages/main_scaffold.dart';
import 'package:wh_app/features/home/presentation/pages/home_page.dart';
import 'package:wh_app/features/event/presentation/pages/event_page.dart';
import 'package:wh_app/features/event/presentation/pages/event_detail_page.dart';
import 'package:wh_app/features/announcement/presentation/pages/announcement_page.dart';
import 'package:wh_app/features/announcement/presentation/pages/announcement_detail_page.dart';
import 'package:wh_app/features/profile/presentation/pages/profile_page.dart';
import 'package:wh_app/features/profile/presentation/pages/admin_page.dart';
import 'package:wh_app/features/auth/presentation/pages/login_page.dart';
import 'package:wh_app/core/repositories/providers.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouterProvider = Provider<GoRouter>((ref) {
  final isAuthenticated = ref.watch(isAuthenticatedProvider);
  final isAdmin = ref.watch(isAdminProvider);

  return GoRouter(
    initialLocation: '/',
    navigatorKey: _rootNavigatorKey,
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      final isAdminRoute = state.uri.path == '/admin';

      // 未登錄用戶重定向到登錄頁
      if (!isAuthenticated && !isLoggingIn) return '/login';
      // 已登錄用戶訪問登錄頁重定向到首頁
      if (isAuthenticated && isLoggingIn) return '/';
      // 非管理員訪問管理後台重定向到首頁
      if (isAdminRoute && !isAdmin) return '/';

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminPage(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) {
          return MainScaffold(child: child);
        },
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/events',
            builder: (context, state) => const EventPage(),
            routes: [
              GoRoute(
                path: 'detail/:id',
                builder: (context, state) => EventDetailPage(
                  eventId: state.pathParameters['id'] ?? '',
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/announcements',
            builder: (context, state) => const AnnouncementPage(),
            routes: [
              GoRoute(
                path: 'detail/:id',
                builder: (context, state) => AnnouncementDetailPage(
                  id: state.pathParameters['id'] ?? '',
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
        ],
      ),
    ],
  );
});
