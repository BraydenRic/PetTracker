import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../core/widgets/app_scaffold.dart';
import '../features/auth/providers/auth_provider.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/splash_screen.dart';
import '../features/activity/screens/activity_history_screen.dart';
import '../features/activity/screens/log_activity_screen.dart';
import '../features/home/screens/home_screen.dart';
import '../features/onboarding/screens/onboarding_screen.dart';
import '../features/pets/screens/edit_pet_screen.dart';
import '../features/pets/screens/pet_detail_screen.dart';
import '../features/pets/screens/pets_list_screen.dart';
import '../features/perks/screens/perks_screen.dart';
import '../features/profile/screens/profile_screen.dart';

part 'router.g.dart';

abstract final class AppRoutes {
  static const splash = '/splash';
  static const login = '/login';
  static const home = '/home';
  static const pets = '/pets';
  static const petsNew = '/pets/new';
  static const activity = '/activity';
  static const activityLog = '/activity/log';
  static const profile = '/profile';
  static const perks = '/profile/perks';
}

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

@riverpod
GoRouter router(Ref ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      // Stay on splash while Firebase Auth is still initializing
      if (authState.isLoading) return AppRoutes.splash;

      final isLoggedIn = authState.valueOrNull != null;
      final location = state.matchedLocation;

      // Always redirect away from splash once auth resolves
      if (location == AppRoutes.splash) {
        return isLoggedIn ? AppRoutes.home : AppRoutes.login;
      }

      if (!isLoggedIn && location != AppRoutes.login) return AppRoutes.login;
      if (isLoggedIn && location == AppRoutes.login) return AppRoutes.home;

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => AppScaffold(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.pets,
            builder: (context, state) => const PetsListScreen(),
            routes: [
              GoRoute(
                path: 'new',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => const OnboardingScreen(),
              ),
              GoRoute(
                path: ':petId',
                builder: (context, state) => PetDetailScreen(
                  petId: state.pathParameters['petId']!,
                ),
                routes: [
                  GoRoute(
                    path: 'edit',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) => EditPetScreen(
                      petId: state.pathParameters['petId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.activity,
            builder: (context, state) => const ActivityHistoryScreen(),
            routes: [
              GoRoute(
                path: 'log',
                parentNavigatorKey: _rootNavigatorKey,
                builder: (context, state) => LogActivityScreen(
                  preselectedType: state.uri.queryParameters['type'],
                ),
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: 'perks',
                builder: (context, state) => const PerksScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
