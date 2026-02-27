class LevelThreshold {
  final int level;
  final int xpRequired;
  final String title;

  const LevelThreshold({
    required this.level,
    required this.xpRequired,
    required this.title,
  });
}

// Formula: xpRequired(n) = floor(50 * (n-1)^1.6)
// Pre-computed for levels 1–50.
const List<LevelThreshold> kLevelThresholds = [
  LevelThreshold(level: 1,  xpRequired: 0,     title: 'Puppy'),
  LevelThreshold(level: 2,  xpRequired: 50,    title: 'Puppy'),
  LevelThreshold(level: 3,  xpRequired: 119,   title: 'Puppy'),
  LevelThreshold(level: 4,  xpRequired: 206,   title: 'Junior'),
  LevelThreshold(level: 5,  xpRequired: 310,   title: 'Junior'),
  LevelThreshold(level: 6,  xpRequired: 430,   title: 'Junior'),
  LevelThreshold(level: 7,  xpRequired: 563,   title: 'Junior'),
  LevelThreshold(level: 8,  xpRequired: 710,   title: 'Explorer'),
  LevelThreshold(level: 9,  xpRequired: 869,   title: 'Explorer'),
  LevelThreshold(level: 10, xpRequired: 1040,  title: 'Explorer'),
  LevelThreshold(level: 11, xpRequired: 1221,  title: 'Explorer'),
  LevelThreshold(level: 12, xpRequired: 1412,  title: 'Explorer'),
  LevelThreshold(level: 13, xpRequired: 1613,  title: 'Adventurer'),
  LevelThreshold(level: 14, xpRequired: 1823,  title: 'Adventurer'),
  LevelThreshold(level: 15, xpRequired: 2042,  title: 'Adventurer'),
  LevelThreshold(level: 16, xpRequired: 2269,  title: 'Adventurer'),
  LevelThreshold(level: 17, xpRequired: 2505,  title: 'Adventurer'),
  LevelThreshold(level: 18, xpRequired: 2748,  title: 'Adventurer'),
  LevelThreshold(level: 19, xpRequired: 2999,  title: 'Adventurer'),
  LevelThreshold(level: 20, xpRequired: 3258,  title: 'Adventurer'),
  LevelThreshold(level: 21, xpRequired: 3523,  title: 'Champion'),
  LevelThreshold(level: 22, xpRequired: 3796,  title: 'Champion'),
  LevelThreshold(level: 23, xpRequired: 4076,  title: 'Champion'),
  LevelThreshold(level: 24, xpRequired: 4362,  title: 'Champion'),
  LevelThreshold(level: 25, xpRequired: 4655,  title: 'Champion'),
  LevelThreshold(level: 26, xpRequired: 4954,  title: 'Champion'),
  LevelThreshold(level: 27, xpRequired: 5260,  title: 'Champion'),
  LevelThreshold(level: 28, xpRequired: 5571,  title: 'Champion'),
  LevelThreshold(level: 29, xpRequired: 5889,  title: 'Champion'),
  LevelThreshold(level: 30, xpRequired: 6212,  title: 'Champion'),
  LevelThreshold(level: 31, xpRequired: 6541,  title: 'Legend'),
  LevelThreshold(level: 32, xpRequired: 6875,  title: 'Legend'),
  LevelThreshold(level: 33, xpRequired: 7215,  title: 'Legend'),
  LevelThreshold(level: 34, xpRequired: 7561,  title: 'Legend'),
  LevelThreshold(level: 35, xpRequired: 7912,  title: 'Legend'),
  LevelThreshold(level: 36, xpRequired: 8268,  title: 'Legend'),
  LevelThreshold(level: 37, xpRequired: 8629,  title: 'Legend'),
  LevelThreshold(level: 38, xpRequired: 8996,  title: 'Legend'),
  LevelThreshold(level: 39, xpRequired: 9367,  title: 'Legend'),
  LevelThreshold(level: 40, xpRequired: 9744,  title: 'Legend'),
  LevelThreshold(level: 41, xpRequired: 10125, title: 'Grandmaster'),
  LevelThreshold(level: 42, xpRequired: 10511, title: 'Grandmaster'),
  LevelThreshold(level: 43, xpRequired: 10902, title: 'Grandmaster'),
  LevelThreshold(level: 44, xpRequired: 11297, title: 'Grandmaster'),
  LevelThreshold(level: 45, xpRequired: 11697, title: 'Grandmaster'),
  LevelThreshold(level: 46, xpRequired: 12102, title: 'Grandmaster'),
  LevelThreshold(level: 47, xpRequired: 12511, title: 'Grandmaster'),
  LevelThreshold(level: 48, xpRequired: 12924, title: 'Grandmaster'),
  LevelThreshold(level: 49, xpRequired: 13342, title: 'Grandmaster'),
  LevelThreshold(level: 50, xpRequired: 13764, title: 'Grandmaster'),
];

const int kMaxLevel = 50;
