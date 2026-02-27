import '../../config/activity_config.dart';
import '../../config/level_config.dart';
import '../../config/perks_config.dart';

int calculateXpForActivity(ActivityType type, {int? durationMinutes}) {
  final config = kActivityConfig[type]!;
  int xp = config.baseXp;
  if (config.hasDuration && durationMinutes != null && durationMinutes > 0) {
    xp += config.xpPerMinute * durationMinutes;
  }
  return xp;
}

int levelFromXp(int totalXp) {
  for (int i = kLevelThresholds.length - 1; i >= 0; i--) {
    if (totalXp >= kLevelThresholds[i].xpRequired) {
      return kLevelThresholds[i].level;
    }
  }
  return 1;
}

/// Progress toward next level as 0.0–1.0.
double progressToNextLevel(int totalXp) {
  final currentLevel = levelFromXp(totalXp);
  if (currentLevel >= kMaxLevel) return 1.0;

  final currentThreshold = kLevelThresholds
      .firstWhere((t) => t.level == currentLevel)
      .xpRequired;
  final nextThreshold = kLevelThresholds
      .firstWhere((t) => t.level == currentLevel + 1)
      .xpRequired;

  final range = nextThreshold - currentThreshold;
  if (range == 0) return 1.0;
  return ((totalXp - currentThreshold) / range).clamp(0.0, 1.0);
}

int xpToNextLevel(int totalXp) {
  final currentLevel = levelFromXp(totalXp);
  if (currentLevel >= kMaxLevel) return 0;
  final nextThreshold = kLevelThresholds
      .firstWhere((t) => t.level == currentLevel + 1)
      .xpRequired;
  return (nextThreshold - totalXp).clamp(0, nextThreshold);
}

String levelTitle(int level) {
  for (int i = kLevelThresholds.length - 1; i >= 0; i--) {
    if (level >= kLevelThresholds[i].level) {
      return kLevelThresholds[i].title;
    }
  }
  return 'Puppy';
}

/// Returns perk IDs that should be newly unlocked when going from [oldLevel]
/// to [newLevel].
List<String> detectNewlyUnlockedPerks(int oldLevel, int newLevel) {
  return kPerks
      .where((p) => p.unlockLevel > oldLevel && p.unlockLevel <= newLevel)
      .map((p) => p.id)
      .toList();
}
