import 'package:flutter/material.dart';

enum ActivityType { walk, bathroom, meal, vet, play }

extension ActivityTypeExt on ActivityType {
  String get label => switch (this) {
        ActivityType.walk => 'Walk',
        ActivityType.bathroom => 'Bathroom',
        ActivityType.meal => 'Meal',
        ActivityType.vet => 'Vet Visit',
        ActivityType.play => 'Play',
      };

  IconData get icon => switch (this) {
        ActivityType.walk => Icons.directions_walk,
        ActivityType.bathroom => Icons.water_drop,
        ActivityType.meal => Icons.restaurant,
        ActivityType.vet => Icons.local_hospital,
        ActivityType.play => Icons.sports_soccer,
      };

  String get firestoreKey => name; // 'walk', 'bathroom', etc.

  static ActivityType fromString(String value) =>
      ActivityType.values.firstWhere((e) => e.name == value);
}

class ActivityConfig {
  final ActivityType type;
  final int baseXp;
  final int xpPerMinute;
  final bool hasDuration;

  const ActivityConfig({
    required this.type,
    required this.baseXp,
    required this.xpPerMinute,
    required this.hasDuration,
  });
}

const Map<ActivityType, ActivityConfig> kActivityConfig = {
  ActivityType.walk: ActivityConfig(
    type: ActivityType.walk,
    baseXp: 30,
    xpPerMinute: 2,
    hasDuration: true,
  ),
  ActivityType.bathroom: ActivityConfig(
    type: ActivityType.bathroom,
    baseXp: 10,
    xpPerMinute: 0,
    hasDuration: false,
  ),
  ActivityType.meal: ActivityConfig(
    type: ActivityType.meal,
    baseXp: 20,
    xpPerMinute: 0,
    hasDuration: false,
  ),
  ActivityType.vet: ActivityConfig(
    type: ActivityType.vet,
    baseXp: 100,
    xpPerMinute: 0,
    hasDuration: false,
  ),
  ActivityType.play: ActivityConfig(
    type: ActivityType.play,
    baseXp: 25,
    xpPerMinute: 3,
    hasDuration: true,
  ),
};
