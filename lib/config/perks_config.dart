enum PerkType { accessory, badge }

class PerkConfig {
  final String id;
  final String displayName;
  final int unlockLevel;
  final PerkType type;
  final String? assetPath;
  final String description;
  final String iconEmoji;

  const PerkConfig({
    required this.id,
    required this.displayName,
    required this.unlockLevel,
    required this.type,
    this.assetPath,
    required this.description,
    required this.iconEmoji,
  });

  bool get isAccessory => type == PerkType.accessory;
}

const List<PerkConfig> kPerks = [
  // Badges (awarded for milestones)
  PerkConfig(
    id: 'badge_first_steps',
    displayName: 'First Steps',
    unlockLevel: 2,
    type: PerkType.badge,
    description: 'Reached level 2 — the adventure begins!',
    iconEmoji: '🐾',
  ),
  PerkConfig(
    id: 'badge_vet_hero',
    displayName: 'Brave at the Vet',
    unlockLevel: 3,
    type: PerkType.badge,
    description: 'Log your first vet visit.',
    iconEmoji: '🏥',
  ),
  PerkConfig(
    id: 'badge_double_digits',
    displayName: 'Double Digits',
    unlockLevel: 10,
    type: PerkType.badge,
    description: 'Reached level 10!',
    iconEmoji: '🔟',
  ),
  PerkConfig(
    id: 'badge_legend',
    displayName: 'Legend',
    unlockLevel: 35,
    type: PerkType.badge,
    description: 'Achieved Legend status.',
    iconEmoji: '⭐',
  ),
  PerkConfig(
    id: 'badge_grandmaster',
    displayName: 'Grandmaster',
    unlockLevel: 50,
    type: PerkType.badge,
    description: 'Reached the maximum level. True dedication!',
    iconEmoji: '🏆',
  ),

  // Accessories (shown on avatar)
  PerkConfig(
    id: 'bandana',
    displayName: 'Bandana',
    unlockLevel: 5,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/bandana.svg',
    description: 'A classic red bandana.',
    iconEmoji: '🔴',
  ),
  PerkConfig(
    id: 'bow',
    displayName: 'Fancy Bow',
    unlockLevel: 8,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/bow.svg',
    description: 'Feeling fancy today!',
    iconEmoji: '🎀',
  ),
  PerkConfig(
    id: 'sunglasses',
    displayName: 'Sunglasses',
    unlockLevel: 10,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/sunglasses.svg',
    description: 'Too cool for school.',
    iconEmoji: '😎',
  ),
  PerkConfig(
    id: 'party_hat',
    displayName: 'Party Hat',
    unlockLevel: 15,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/party_hat.svg',
    description: 'Every day is a celebration!',
    iconEmoji: '🎉',
  ),
  PerkConfig(
    id: 'scarf',
    displayName: 'Cozy Scarf',
    unlockLevel: 20,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/scarf.svg',
    description: 'Staying warm on winter walks.',
    iconEmoji: '🧣',
  ),
  PerkConfig(
    id: 'crown',
    displayName: 'Golden Crown',
    unlockLevel: 25,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/crown.svg',
    description: 'Royalty of the dog park.',
    iconEmoji: '👑',
  ),
  PerkConfig(
    id: 'cape',
    displayName: 'Hero Cape',
    unlockLevel: 35,
    type: PerkType.accessory,
    assetPath: 'assets/avatars/accessories/cape.svg',
    description: 'A true pet hero.',
    iconEmoji: '🦸',
  ),
];

List<PerkConfig> get kAccessories =>
    kPerks.where((p) => p.type == PerkType.accessory).toList();

List<PerkConfig> get kBadges =>
    kPerks.where((p) => p.type == PerkType.badge).toList();

PerkConfig? perkById(String id) {
  try {
    return kPerks.firstWhere((p) => p.id == id);
  } catch (_) {
    return null;
  }
}
