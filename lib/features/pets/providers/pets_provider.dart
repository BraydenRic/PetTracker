import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../features/auth/providers/auth_provider.dart';
import '../../../models/pet_model.dart';
import '../../../services/pet_service.dart';

part 'pets_provider.g.dart';

@riverpod
PetService petService(Ref ref) => PetService();

@riverpod
Stream<List<PetModel>> pets(Ref ref) {
  final user = ref.watch(authStateProvider).valueOrNull;
  if (user == null) return const Stream.empty();
  return ref.watch(petServiceProvider).watchPetsForUser(user.uid);
}
