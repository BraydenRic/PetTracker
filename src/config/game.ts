/**
 * Static game data: species, activities, XP economy.
 * All balance numbers live here so tuning never touches app logic.
 */

export type SpeciesKey =
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rabbit'
  | 'hamster'
  | 'fish'
  | 'turtle'
  | 'lizard'
  | 'horse'
  | 'snake';

export interface SpeciesInfo {
  key: SpeciesKey;
  label: string;
  emoji: string;
}

export const SPECIES: SpeciesInfo[] = [
  { key: 'dog', label: 'Dog', emoji: '🐶' },
  { key: 'cat', label: 'Cat', emoji: '🐱' },
  { key: 'bird', label: 'Bird', emoji: '🦜' },
  { key: 'rabbit', label: 'Rabbit', emoji: '🐰' },
  { key: 'hamster', label: 'Hamster', emoji: '🐹' },
  { key: 'fish', label: 'Fish', emoji: '🐠' },
  { key: 'turtle', label: 'Turtle', emoji: '🐢' },
  { key: 'lizard', label: 'Lizard', emoji: '🦎' },
  { key: 'horse', label: 'Horse', emoji: '🐴' },
  { key: 'snake', label: 'Snake', emoji: '🐍' },
];

export const speciesInfo = (key: string): SpeciesInfo =>
  SPECIES.find((s) => s.key === key) ?? SPECIES[0];

export type ActivityType =
  | 'walk'
  | 'feed'
  | 'water'
  | 'play'
  | 'groom'
  | 'train'
  | 'treat'
  | 'vet'
  | 'clean'
  | 'meds';

export interface ActivityInfo {
  type: ActivityType;
  label: string;
  emoji: string;
  xp: number;
  coins: number;
  /** Chip tint used in quick-log + journal so each activity is scannable at a glance. */
  tint: string;
}

export const ACTIVITIES: ActivityInfo[] = [
  { type: 'walk', label: 'Walk', emoji: '🚶', xp: 25, coins: 6, tint: '#E4EDE0' },
  { type: 'feed', label: 'Feed', emoji: '🍽️', xp: 10, coins: 2, tint: '#F7EBD0' },
  { type: 'water', label: 'Water', emoji: '💧', xp: 6, coins: 1, tint: '#E1EBF2' },
  { type: 'play', label: 'Play', emoji: '🎾', xp: 20, coins: 5, tint: '#FBE4DA' },
  { type: 'groom', label: 'Groom', emoji: '🛁', xp: 30, coins: 8, tint: '#E1EBF2' },
  { type: 'train', label: 'Train', emoji: '🎯', xp: 35, coins: 9, tint: '#FBE4DA' },
  { type: 'treat', label: 'Treat', emoji: '🦴', xp: 8, coins: 2, tint: '#F7EBD0' },
  { type: 'vet', label: 'Vet visit', emoji: '🩺', xp: 50, coins: 15, tint: '#F7E0DC' },
  { type: 'clean', label: 'Clean up', emoji: '🧹', xp: 15, coins: 4, tint: '#E4EDE0' },
  { type: 'meds', label: 'Medicine', emoji: '💊', xp: 12, coins: 3, tint: '#F7E0DC' },
];

export const activityInfo = (type: string): ActivityInfo =>
  ACTIVITIES.find((a) => a.type === type) ?? ACTIVITIES[0];

// ----- XP curve -----

export const MAX_LEVEL = 50;

/** Total XP required to *reach* a level. Level 1 = 0, level 2 = 60, level 3 = 176 ... */
export const xpForLevel = (level: number): number =>
  level <= 1 ? 0 : Math.floor(60 * Math.pow(level - 1, 1.55));

export const levelFromXp = (xp: number): number => {
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) level++;
  return level;
};

export interface LevelProgress {
  level: number;
  /** XP earned inside the current level. */
  into: number;
  /** XP needed to go from this level to the next. */
  span: number;
  /** 0..1 progress toward next level (1 when max level). */
  pct: number;
}

export const levelProgress = (xp: number): LevelProgress => {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return { level, into: 0, span: 0, pct: 1 };
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = ceil - floor;
  const into = xp - floor;
  return { level, into, span, pct: Math.min(1, into / span) };
};

/** Coins awarded the moment a pet reaches `newLevel`. */
export const levelUpBonus = (newLevel: number): number => newLevel * 25;

/** Completing a routine is worth more than an ad-hoc log — consistency is the game. */
export const ROUTINE_XP_MULTIPLIER = 1.5;

/** Extra coins per completion based on current streak, capped so it can't be farmed forever. */
export const streakBonusCoins = (streak: number): number => Math.min(streak, 10);

/** Every new account starts with a little pocket money so the shop isn't a dead end. */
export const STARTING_COINS = 150;
