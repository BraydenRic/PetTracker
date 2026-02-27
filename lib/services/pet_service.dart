import 'package:cloud_firestore/cloud_firestore.dart';

import '../core/constants/firestore_paths.dart';
import '../models/pet_model.dart';

class PetService {
  final _firestore = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _pets =>
      _firestore.collection(FirestorePaths.pets);

  CollectionReference<Map<String, dynamic>> get _users =>
      _firestore.collection(FirestorePaths.users);

  Stream<List<PetModel>> watchPetsForUser(String uid) {
    return _pets
        .where('ownerId', isEqualTo: uid)
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map((snap) => snap.docs.map(PetModel.fromFirestore).toList());
  }

  Future<PetModel> getPet(String petId) async {
    final snap = await _pets.doc(petId).get();
    if (!snap.exists) throw Exception('Pet not found');
    return PetModel.fromFirestore(snap);
  }

  Future<PetModel> createPet({
    required String ownerId,
    required String name,
    required String breedKey,
    DateTime? birthdate,
  }) async {
    final now = DateTime.now();
    final ref = _pets.doc();
    final pet = PetModel(
      id: ref.id,
      ownerId: ownerId,
      name: name,
      breedKey: breedKey,
      birthdate: birthdate,
      createdAt: now,
    );
    await ref.set(pet.toFirestore());

    // Set as active pet if this is the user's first pet.
    final userRef = _users.doc(ownerId);
    final userSnap = await userRef.get();
    if (userSnap.data()?['activePetId'] == null) {
      await userRef.update({'activePetId': ref.id});
    }

    return pet;
  }

  Future<void> updatePet(String petId, {String? name, DateTime? birthdate}) async {
    final updates = <String, dynamic>{};
    if (name != null) updates['name'] = name;
    if (birthdate != null) {
      updates['birthdate'] = Timestamp.fromDate(birthdate);
    }
    if (updates.isEmpty) return;
    await _pets.doc(petId).update(updates);
  }

  Future<void> setActivePet(String uid, String petId) async {
    await _users.doc(uid).update({'activePetId': petId});
  }

  Future<void> toggleEquippedPerk(
    String petId,
    String perkId, {
    required bool equip,
  }) async {
    await _firestore.runTransaction((tx) async {
      final ref = _pets.doc(petId);
      final snap = await tx.get(ref);
      final current = List<String>.from(snap.data()?['equippedPerkIds'] ?? []);
      if (equip) {
        if (!current.contains(perkId) && current.length < 3) {
          current.add(perkId);
        }
      } else {
        current.remove(perkId);
      }
      tx.update(ref, {'equippedPerkIds': current});
    });
  }
}
