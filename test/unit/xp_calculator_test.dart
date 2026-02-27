import 'package:flutter_test/flutter_test.dart';
import 'package:pet_tracker/config/activity_config.dart';
import 'package:pet_tracker/core/utils/xp_calculator.dart';

void main() {
  group('calculateXpForActivity', () {
    test('bathroom returns base XP only', () {
      expect(calculateXpForActivity(ActivityType.bathroom), 10);
    });

    test('meal returns base XP only', () {
      expect(calculateXpForActivity(ActivityType.meal), 20);
    });

    test('vet returns base XP only', () {
      expect(calculateXpForActivity(ActivityType.vet), 100);
    });

    test('walk with 20 min returns 30 + 40 = 70', () {
      expect(
        calculateXpForActivity(ActivityType.walk, durationMinutes: 20),
        70,
      );
    });

    test('walk with no duration returns base only', () {
      expect(calculateXpForActivity(ActivityType.walk), 30);
    });

    test('play with 30 min returns 25 + 90 = 115', () {
      expect(
        calculateXpForActivity(ActivityType.play, durationMinutes: 30),
        115,
      );
    });
  });

  group('levelFromXp', () {
    test('0 XP is level 1', () => expect(levelFromXp(0), 1));
    test('49 XP is level 1', () => expect(levelFromXp(49), 1));
    test('50 XP is level 2', () => expect(levelFromXp(50), 2));
    test('119 XP is level 3', () => expect(levelFromXp(119), 3));
    test('1040 XP is level 10', () => expect(levelFromXp(1040), 10));
    test('13764 XP is level 50', () => expect(levelFromXp(13764), 50));
    test('99999 XP is capped at level 50', () => expect(levelFromXp(99999), 50));
  });

  group('progressToNextLevel', () {
    test('0 XP is 0% progress', () {
      expect(progressToNextLevel(0), 0.0);
    });

    test('25 XP (halfway to level 2) is ~0.5', () {
      expect(progressToNextLevel(25), closeTo(0.5, 0.01));
    });

    test('max level returns 1.0', () {
      expect(progressToNextLevel(99999), 1.0);
    });
  });

  group('detectNewlyUnlockedPerks', () {
    test('no level change returns empty', () {
      expect(detectNewlyUnlockedPerks(5, 5), isEmpty);
    });

    test('level 1 to 5 includes bandana', () {
      final unlocked = detectNewlyUnlockedPerks(1, 5);
      expect(unlocked, contains('bandana'));
    });

    test('level 9 to 10 includes sunglasses and badge_double_digits', () {
      final unlocked = detectNewlyUnlockedPerks(9, 10);
      expect(unlocked, contains('sunglasses'));
      expect(unlocked, contains('badge_double_digits'));
    });
  });
}
