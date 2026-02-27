import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../../core/constants/firestore_paths.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/pets/providers/pets_provider.dart';
import '../../../models/pet_model.dart';

part 'active_pet_provider.g.dart';

@riverpod
Stream<String?> activePetId(Ref ref) {
  final user = ref.watch(authStateProvider).valueOrNull;
  if (user == null) return const Stream.empty();
  return FirebaseFirestore.instance
      .doc(FirestorePaths.user(user.uid))
      .snapshots()
      .map((snap) => snap.data()?['activePetId'] as String?);
}

@riverpod
PetModel? activePet(Ref ref) {
  final pets = ref.watch(petsProvider).valueOrNull ?? [];
  final activeId = ref.watch(activePetIdProvider).valueOrNull;

  if (pets.isEmpty) return null;
  if (activeId == null) return pets.first;
  try {
    return pets.firstWhere((p) => p.id == activeId);
  } catch (_) {
    return pets.first;
  }
}
