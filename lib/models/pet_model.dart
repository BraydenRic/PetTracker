import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

part 'pet_model.freezed.dart';
part 'pet_model.g.dart';

@freezed
class PetModel with _$PetModel {
  const factory PetModel({
    required String id,
    required String ownerId,
    required String name,
    required String breedKey,
    DateTime? birthdate,
    required DateTime createdAt,
    @Default(0) int xp,
    @Default(1) int level,
    @Default([]) List<String> unlockedPerkIds,
    @Default([]) List<String> equippedPerkIds,
    @Default(0) int totalActivities,
  }) = _PetModel;

  factory PetModel.fromJson(Map<String, dynamic> json) =>
      _$PetModelFromJson(json);

  factory PetModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return PetModel(
      id: doc.id,
      ownerId: data['ownerId'] as String,
      name: data['name'] as String,
      breedKey: data['breedKey'] as String,
      birthdate: data['birthdate'] != null
          ? (data['birthdate'] as Timestamp).toDate()
          : null,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      xp: (data['xp'] as num?)?.toInt() ?? 0,
      level: (data['level'] as num?)?.toInt() ?? 1,
      unlockedPerkIds: List<String>.from(data['unlockedPerkIds'] ?? []),
      equippedPerkIds: List<String>.from(data['equippedPerkIds'] ?? []),
      totalActivities: (data['totalActivities'] as num?)?.toInt() ?? 0,
    );
  }
}

extension PetModelFirestore on PetModel {
  Map<String, dynamic> toFirestore() => {
        'ownerId': ownerId,
        'name': name,
        'breedKey': breedKey,
        if (birthdate != null) 'birthdate': Timestamp.fromDate(birthdate!),
        'createdAt': Timestamp.fromDate(createdAt),
        'xp': xp,
        'level': level,
        'unlockedPerkIds': unlockedPerkIds,
        'equippedPerkIds': equippedPerkIds,
        'totalActivities': totalActivities,
      };
}
