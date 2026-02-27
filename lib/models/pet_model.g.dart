// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pet_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PetModelImpl _$$PetModelImplFromJson(Map<String, dynamic> json) =>
    _$PetModelImpl(
      id: json['id'] as String,
      ownerId: json['ownerId'] as String,
      name: json['name'] as String,
      breedKey: json['breedKey'] as String,
      birthdate: json['birthdate'] == null
          ? null
          : DateTime.parse(json['birthdate'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      level: (json['level'] as num?)?.toInt() ?? 1,
      unlockedPerkIds: (json['unlockedPerkIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      equippedPerkIds: (json['equippedPerkIds'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      totalActivities: (json['totalActivities'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$PetModelImplToJson(_$PetModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'ownerId': instance.ownerId,
      'name': instance.name,
      'breedKey': instance.breedKey,
      'birthdate': instance.birthdate?.toIso8601String(),
      'createdAt': instance.createdAt.toIso8601String(),
      'xp': instance.xp,
      'level': instance.level,
      'unlockedPerkIds': instance.unlockedPerkIds,
      'equippedPerkIds': instance.equippedPerkIds,
      'totalActivities': instance.totalActivities,
    };
