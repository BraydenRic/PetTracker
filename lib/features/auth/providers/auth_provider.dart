import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../services/auth_service.dart';

part 'auth_provider.g.dart';

@riverpod
AuthService authService(Ref ref) => AuthService();

@riverpod
Stream<User?> authState(Ref ref) =>
    ref.watch(authServiceProvider).authStateChanges;
