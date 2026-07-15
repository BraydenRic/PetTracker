import type { ActivityType, SpeciesKey } from '@/config/game';
import type { AccessorySlot } from '@/config/shop';

/** users/{uid} */
export interface Profile {
  email: string | null;
  displayName: string | null;
  coins: number;
  activePetId: string | null;
  createdAt: number;
}

/** users/{uid}/pets/{petId} */
export interface Pet {
  id: string;
  name: string;
  species: SpeciesKey;
  xp: number;
  level: number;
  /** Shop items this pet owns — each pet has its own collection. */
  ownedItemIds: string[];
  /** itemId per slot; missing/null = nothing equipped. */
  equipped: Partial<Record<AccessorySlot, string | null>>;
  backdropId: string | null;
  createdAt: number;
}

/** users/{uid}/activities/{id} */
export interface Activity {
  id: string;
  petId: string;
  petName: string;
  type: ActivityType;
  xp: number;
  coins: number;
  /** Set when the log came from checking off a routine. */
  routineId: string | null;
  note: string | null;
  loggedAt: number;
}

export type RoutineFrequency = 'daily' | 'weekly';

/** users/{uid}/routines/{id} */
export interface Routine {
  id: string;
  petId: string;
  title: string;
  activityType: ActivityType;
  frequency: RoutineFrequency;
  /** Optional scheduled time in 24h "HH:mm" (e.g. "09:00" = feed at 9 AM); null = anytime. */
  timeOfDay: string | null;
  /** Period keys (YYYY-MM-DD or YYYY-Wnn) that have been completed. */
  completions: Record<string, number>;
  lastCompletedKey: string | null;
  streak: number;
  bestStreak: number;
  createdAt: number;
}
