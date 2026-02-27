import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

import '../config/activity_config.dart';

part 'activity_model.freezed.dart';
part 'activity_model.g.dart';

@freezed
class ActivityModel with _$ActivityModel {
  const factory ActivityModel({
    required String id,
    required String petId,
    required String ownerId,
    required ActivityType type,
    required int xpAwarded,
    required DateTime loggedAt,
    int? durationMinutes,
    String? notes,
  }) = _ActivityModel;

  factory ActivityModel.fromJson(Map<String, dynamic> json) =>
      _$ActivityModelFromJson(json);

  factory ActivityModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ActivityModel(
      id: doc.id,
      petId: data['petId'] as String,
      ownerId: data['ownerId'] as String,
      type: ActivityTypeExt.fromString(data['type'] as String),
      xpAwarded: (data['xpAwarded'] as num).toInt(),
      loggedAt: (data['loggedAt'] as Timestamp).toDate(),
      durationMinutes: (data['durationMinutes'] as num?)?.toInt(),
      notes: data['notes'] as String?,
    );
  }
}

extension ActivityModelFirestore on ActivityModel {
  Map<String, dynamic> toFirestore() => {
        'petId': petId,
        'ownerId': ownerId,
        'type': type.firestoreKey,
        'xpAwarded': xpAwarded,
        'loggedAt': Timestamp.fromDate(loggedAt),
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        if (notes != null && notes!.isNotEmpty) 'notes': notes,
      };
}
