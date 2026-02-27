// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'activity_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ActivityModelImpl _$$ActivityModelImplFromJson(Map<String, dynamic> json) =>
    _$ActivityModelImpl(
      id: json['id'] as String,
      petId: json['petId'] as String,
      ownerId: json['ownerId'] as String,
      type: $enumDecode(_$ActivityTypeEnumMap, json['type']),
      xpAwarded: (json['xpAwarded'] as num).toInt(),
      loggedAt: DateTime.parse(json['loggedAt'] as String),
      durationMinutes: (json['durationMinutes'] as num?)?.toInt(),
      notes: json['notes'] as String?,
    );

Map<String, dynamic> _$$ActivityModelImplToJson(_$ActivityModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'petId': instance.petId,
      'ownerId': instance.ownerId,
      'type': _$ActivityTypeEnumMap[instance.type]!,
      'xpAwarded': instance.xpAwarded,
      'loggedAt': instance.loggedAt.toIso8601String(),
      'durationMinutes': instance.durationMinutes,
      'notes': instance.notes,
    };

const _$ActivityTypeEnumMap = {
  ActivityType.walk: 'walk',
  ActivityType.bathroom: 'bathroom',
  ActivityType.meal: 'meal',
  ActivityType.vet: 'vet',
  ActivityType.play: 'play',
};
