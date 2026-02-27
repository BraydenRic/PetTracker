class BreedConfig {
  final String key;
  final String displayName;

  const BreedConfig({required this.key, required this.displayName});

  String get assetPath => 'assets/avatars/breeds/$key.svg';
}

const List<BreedConfig> kBreeds = [
  BreedConfig(key: 'labrador', displayName: 'Labrador Retriever'),
  BreedConfig(key: 'golden_retriever', displayName: 'Golden Retriever'),
  BreedConfig(key: 'bulldog', displayName: 'Bulldog'),
  BreedConfig(key: 'poodle', displayName: 'Poodle'),
  BreedConfig(key: 'german_shepherd', displayName: 'German Shepherd'),
  BreedConfig(key: 'beagle', displayName: 'Beagle'),
  BreedConfig(key: 'husky', displayName: 'Siberian Husky'),
  BreedConfig(key: 'dachshund', displayName: 'Dachshund'),
  BreedConfig(key: 'chihuahua', displayName: 'Chihuahua'),
  BreedConfig(key: 'pug', displayName: 'Pug'),
  BreedConfig(key: 'corgi', displayName: 'Corgi'),
  BreedConfig(key: 'shih_tzu', displayName: 'Shih Tzu'),
  BreedConfig(key: 'boxer', displayName: 'Boxer'),
  BreedConfig(key: 'border_collie', displayName: 'Border Collie'),
  BreedConfig(key: 'rottweiler', displayName: 'Rottweiler'),
  BreedConfig(key: 'dalmatian', displayName: 'Dalmatian'),
];

BreedConfig? breedByKey(String key) {
  try {
    return kBreeds.firstWhere((b) => b.key == key);
  } catch (_) {
    return null;
  }
}
