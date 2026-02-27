// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'pet_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

PetModel _$PetModelFromJson(Map<String, dynamic> json) {
  return _PetModel.fromJson(json);
}

/// @nodoc
mixin _$PetModel {
  String get id => throw _privateConstructorUsedError;
  String get ownerId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get breedKey => throw _privateConstructorUsedError;
  DateTime? get birthdate => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  int get xp => throw _privateConstructorUsedError;
  int get level => throw _privateConstructorUsedError;
  List<String> get unlockedPerkIds => throw _privateConstructorUsedError;
  List<String> get equippedPerkIds => throw _privateConstructorUsedError;
  int get totalActivities => throw _privateConstructorUsedError;

  /// Serializes this PetModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $PetModelCopyWith<PetModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PetModelCopyWith<$Res> {
  factory $PetModelCopyWith(PetModel value, $Res Function(PetModel) then) =
      _$PetModelCopyWithImpl<$Res, PetModel>;
  @useResult
  $Res call(
      {String id,
      String ownerId,
      String name,
      String breedKey,
      DateTime? birthdate,
      DateTime createdAt,
      int xp,
      int level,
      List<String> unlockedPerkIds,
      List<String> equippedPerkIds,
      int totalActivities});
}

/// @nodoc
class _$PetModelCopyWithImpl<$Res, $Val extends PetModel>
    implements $PetModelCopyWith<$Res> {
  _$PetModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? name = null,
    Object? breedKey = null,
    Object? birthdate = freezed,
    Object? createdAt = null,
    Object? xp = null,
    Object? level = null,
    Object? unlockedPerkIds = null,
    Object? equippedPerkIds = null,
    Object? totalActivities = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      ownerId: null == ownerId
          ? _value.ownerId
          : ownerId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      breedKey: null == breedKey
          ? _value.breedKey
          : breedKey // ignore: cast_nullable_to_non_nullable
              as String,
      birthdate: freezed == birthdate
          ? _value.birthdate
          : birthdate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      xp: null == xp
          ? _value.xp
          : xp // ignore: cast_nullable_to_non_nullable
              as int,
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as int,
      unlockedPerkIds: null == unlockedPerkIds
          ? _value.unlockedPerkIds
          : unlockedPerkIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
      equippedPerkIds: null == equippedPerkIds
          ? _value.equippedPerkIds
          : equippedPerkIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
      totalActivities: null == totalActivities
          ? _value.totalActivities
          : totalActivities // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PetModelImplCopyWith<$Res>
    implements $PetModelCopyWith<$Res> {
  factory _$$PetModelImplCopyWith(
          _$PetModelImpl value, $Res Function(_$PetModelImpl) then) =
      __$$PetModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String ownerId,
      String name,
      String breedKey,
      DateTime? birthdate,
      DateTime createdAt,
      int xp,
      int level,
      List<String> unlockedPerkIds,
      List<String> equippedPerkIds,
      int totalActivities});
}

/// @nodoc
class __$$PetModelImplCopyWithImpl<$Res>
    extends _$PetModelCopyWithImpl<$Res, _$PetModelImpl>
    implements _$$PetModelImplCopyWith<$Res> {
  __$$PetModelImplCopyWithImpl(
      _$PetModelImpl _value, $Res Function(_$PetModelImpl) _then)
      : super(_value, _then);

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? ownerId = null,
    Object? name = null,
    Object? breedKey = null,
    Object? birthdate = freezed,
    Object? createdAt = null,
    Object? xp = null,
    Object? level = null,
    Object? unlockedPerkIds = null,
    Object? equippedPerkIds = null,
    Object? totalActivities = null,
  }) {
    return _then(_$PetModelImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      ownerId: null == ownerId
          ? _value.ownerId
          : ownerId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      breedKey: null == breedKey
          ? _value.breedKey
          : breedKey // ignore: cast_nullable_to_non_nullable
              as String,
      birthdate: freezed == birthdate
          ? _value.birthdate
          : birthdate // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime,
      xp: null == xp
          ? _value.xp
          : xp // ignore: cast_nullable_to_non_nullable
              as int,
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as int,
      unlockedPerkIds: null == unlockedPerkIds
          ? _value._unlockedPerkIds
          : unlockedPerkIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
      equippedPerkIds: null == equippedPerkIds
          ? _value._equippedPerkIds
          : equippedPerkIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
      totalActivities: null == totalActivities
          ? _value.totalActivities
          : totalActivities // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PetModelImpl implements _PetModel {
  const _$PetModelImpl(
      {required this.id,
      required this.ownerId,
      required this.name,
      required this.breedKey,
      this.birthdate,
      required this.createdAt,
      this.xp = 0,
      this.level = 1,
      final List<String> unlockedPerkIds = const [],
      final List<String> equippedPerkIds = const [],
      this.totalActivities = 0})
      : _unlockedPerkIds = unlockedPerkIds,
        _equippedPerkIds = equippedPerkIds;

  factory _$PetModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$PetModelImplFromJson(json);

  @override
  final String id;
  @override
  final String ownerId;
  @override
  final String name;
  @override
  final String breedKey;
  @override
  final DateTime? birthdate;
  @override
  final DateTime createdAt;
  @override
  @JsonKey()
  final int xp;
  @override
  @JsonKey()
  final int level;
  final List<String> _unlockedPerkIds;
  @override
  @JsonKey()
  List<String> get unlockedPerkIds {
    if (_unlockedPerkIds is EqualUnmodifiableListView) return _unlockedPerkIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_unlockedPerkIds);
  }

  final List<String> _equippedPerkIds;
  @override
  @JsonKey()
  List<String> get equippedPerkIds {
    if (_equippedPerkIds is EqualUnmodifiableListView) return _equippedPerkIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_equippedPerkIds);
  }

  @override
  @JsonKey()
  final int totalActivities;

  @override
  String toString() {
    return 'PetModel(id: $id, ownerId: $ownerId, name: $name, breedKey: $breedKey, birthdate: $birthdate, createdAt: $createdAt, xp: $xp, level: $level, unlockedPerkIds: $unlockedPerkIds, equippedPerkIds: $equippedPerkIds, totalActivities: $totalActivities)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PetModelImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.breedKey, breedKey) ||
                other.breedKey == breedKey) &&
            (identical(other.birthdate, birthdate) ||
                other.birthdate == birthdate) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.xp, xp) || other.xp == xp) &&
            (identical(other.level, level) || other.level == level) &&
            const DeepCollectionEquality()
                .equals(other._unlockedPerkIds, _unlockedPerkIds) &&
            const DeepCollectionEquality()
                .equals(other._equippedPerkIds, _equippedPerkIds) &&
            (identical(other.totalActivities, totalActivities) ||
                other.totalActivities == totalActivities));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      ownerId,
      name,
      breedKey,
      birthdate,
      createdAt,
      xp,
      level,
      const DeepCollectionEquality().hash(_unlockedPerkIds),
      const DeepCollectionEquality().hash(_equippedPerkIds),
      totalActivities);

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$PetModelImplCopyWith<_$PetModelImpl> get copyWith =>
      __$$PetModelImplCopyWithImpl<_$PetModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PetModelImplToJson(
      this,
    );
  }
}

abstract class _PetModel implements PetModel {
  const factory _PetModel(
      {required final String id,
      required final String ownerId,
      required final String name,
      required final String breedKey,
      final DateTime? birthdate,
      required final DateTime createdAt,
      final int xp,
      final int level,
      final List<String> unlockedPerkIds,
      final List<String> equippedPerkIds,
      final int totalActivities}) = _$PetModelImpl;

  factory _PetModel.fromJson(Map<String, dynamic> json) =
      _$PetModelImpl.fromJson;

  @override
  String get id;
  @override
  String get ownerId;
  @override
  String get name;
  @override
  String get breedKey;
  @override
  DateTime? get birthdate;
  @override
  DateTime get createdAt;
  @override
  int get xp;
  @override
  int get level;
  @override
  List<String> get unlockedPerkIds;
  @override
  List<String> get equippedPerkIds;
  @override
  int get totalActivities;

  /// Create a copy of PetModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$PetModelImplCopyWith<_$PetModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
