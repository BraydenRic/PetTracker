import 'package:cloud_firestore/cloud_firestore.dart';

import '../config/activity_config.dart';
import '../core/constants/firestore_paths.dart';
import '../core/utils/xp_calculator.dart';
import '../models/activity_model.dart';

class ActivityService {
  final _firestore = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _activities =>
      _firestore.collection(FirestorePaths.activities);

  CollectionReference<Map<String, dynamic>> get _pets =>
      _firestore.collection(FirestorePaths.pets);

  /// Logs an activity and atomically increments pet XP/level.
  /// Returns the XP awarded and the new total XP.
  Future<({int xpAwarded, int newXp, int newLevel, int oldLevel})> logActivity({
    required String petId,
    required String ownerId,
    required ActivityType type,
    int? durationMinutes,
    String? notes,
  }) async {
    final xpAwarded = calculateXpForActivity(type, durationMinutes: durationMinutes);
    final activityRef = _activities.doc();
    final petRef = _pets.doc(petId);

    late int newXp;
    late int newLevel;
    late int oldLevel;

    await _firestore.runTransaction((tx) async {
      final petSnap = await tx.get(petRef);
      final currentXp = (petSnap.data()?['xp'] as num?)?.toInt() ?? 0;
      oldLevel = (petSnap.data()?['level'] as num?)?.toInt() ?? 1;
      newXp = currentXp + xpAwarded;
      newLevel = levelFromXp(newXp);

      final newlyUnlocked = detectNewlyUnlockedPerks(oldLevel, newLevel);
      final currentUnlocked =
          List<String>.from(petSnap.data()?['unlockedPerkIds'] ?? []);
      for (final id in newlyUnlocked) {
        if (!currentUnlocked.contains(id)) currentUnlocked.add(id);
      }

      tx.set(activityRef, {
        'petId': petId,
        'ownerId': ownerId,
        'type': type.firestoreKey,
        'xpAwarded': xpAwarded,
        'loggedAt': Timestamp.fromDate(DateTime.now()),
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      });

      tx.update(petRef, {
        'xp': newXp,
        'level': newLevel,
        'totalActivities': FieldValue.increment(1),
        'unlockedPerkIds': currentUnlocked,
      });
    });

    return (
      xpAwarded: xpAwarded,
      newXp: newXp,
      newLevel: newLevel,
      oldLevel: oldLevel,
    );
  }

  Stream<List<ActivityModel>> watchActivitiesForPet(
    String petId,
    String ownerId, {
    int limit = 50,
  }) {
    return _activities
        .where('ownerId', isEqualTo: ownerId)
        .where('petId', isEqualTo: petId)
        .orderBy('loggedAt', descending: true)
        .limit(limit)
        .snapshots()
        .map((snap) => snap.docs.map(ActivityModel.fromFirestore).toList());
  }
}
