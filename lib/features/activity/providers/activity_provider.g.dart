// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'activity_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$activityServiceHash() => r'908ac291c34aae12b7d6ad099dd5348397aa80cc';

/// See also [activityService].
@ProviderFor(activityService)
final activityServiceProvider = AutoDisposeProvider<ActivityService>.internal(
  activityService,
  name: r'activityServiceProvider',
  debugGetCreateSourceHash: const bool.fromEnvironment('dart.vm.product')
      ? null
      : _$activityServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef ActivityServiceRef = AutoDisposeProviderRef<ActivityService>;
String _$activitiesHash() => r'af0c081701b72894c656e0261186df6810aae5b6';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

/// See also [activities].
@ProviderFor(activities)
const activitiesProvider = ActivitiesFamily();

/// See also [activities].
class ActivitiesFamily extends Family<AsyncValue<List<ActivityModel>>> {
  /// See also [activities].
  const ActivitiesFamily();

  /// See also [activities].
  ActivitiesProvider call(
    String petId,
    String ownerId,
  ) {
    return ActivitiesProvider(
      petId,
      ownerId,
    );
  }

  @override
  ActivitiesProvider getProviderOverride(
    covariant ActivitiesProvider provider,
  ) {
    return call(
      provider.petId,
      provider.ownerId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'activitiesProvider';
}

/// See also [activities].
class ActivitiesProvider
    extends AutoDisposeStreamProvider<List<ActivityModel>> {
  /// See also [activities].
  ActivitiesProvider(
    String petId,
    String ownerId,
  ) : this._internal(
          (ref) => activities(
            ref as ActivitiesRef,
            petId,
            ownerId,
          ),
          from: activitiesProvider,
          name: r'activitiesProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$activitiesHash,
          dependencies: ActivitiesFamily._dependencies,
          allTransitiveDependencies:
              ActivitiesFamily._allTransitiveDependencies,
          petId: petId,
          ownerId: ownerId,
        );

  ActivitiesProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.petId,
    required this.ownerId,
  }) : super.internal();

  final String petId;
  final String ownerId;

  @override
  Override overrideWith(
    Stream<List<ActivityModel>> Function(ActivitiesRef provider) create,
  ) {
    return ProviderOverride(
      origin: this,
      override: ActivitiesProvider._internal(
        (ref) => create(ref as ActivitiesRef),
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        petId: petId,
        ownerId: ownerId,
      ),
    );
  }

  @override
  AutoDisposeStreamProviderElement<List<ActivityModel>> createElement() {
    return _ActivitiesProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ActivitiesProvider &&
        other.petId == petId &&
        other.ownerId == ownerId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, petId.hashCode);
    hash = _SystemHash.combine(hash, ownerId.hashCode);

    return _SystemHash.finish(hash);
  }
}

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
mixin ActivitiesRef on AutoDisposeStreamProviderRef<List<ActivityModel>> {
  /// The parameter `petId` of this provider.
  String get petId;

  /// The parameter `ownerId` of this provider.
  String get ownerId;
}

class _ActivitiesProviderElement
    extends AutoDisposeStreamProviderElement<List<ActivityModel>>
    with ActivitiesRef {
  _ActivitiesProviderElement(super.provider);

  @override
  String get petId => (origin as ActivitiesProvider).petId;
  @override
  String get ownerId => (origin as ActivitiesProvider).ownerId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
