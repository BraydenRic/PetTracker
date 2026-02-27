// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'pets_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$petServiceHash() => r'a33004bed6226c849859825e0ca2bf1430be50b1';

/// See also [petService].
@ProviderFor(petService)
final petServiceProvider = AutoDisposeProvider<PetService>.internal(
  petService,
  name: r'petServiceProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$petServiceHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef PetServiceRef = AutoDisposeProviderRef<PetService>;
String _$petsHash() => r'6dcd43cae2fec48d8da407d138c97fb8248142dd';

/// See also [pets].
@ProviderFor(pets)
final petsProvider = AutoDisposeStreamProvider<List<PetModel>>.internal(
  pets,
  name: r'petsProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$petsHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

@Deprecated('Will be removed in 3.0. Use Ref instead')
// ignore: unused_element
typedef PetsRef = AutoDisposeStreamProviderRef<List<PetModel>>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
