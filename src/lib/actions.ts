import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';

import {
  activityInfo,
  levelFromXp,
  levelUpBonus,
  ROUTINE_XP_MULTIPLIER,
  streakBonusCoins,
  type ActivityType,
  type SpeciesKey,
} from '@/config/game';
import { shopItem, type AccessorySlot } from '@/config/shop';
import { auth, db } from '@/lib/firebase';
import { periodKey, previousPeriodKey } from '@/lib/dates';
import type { Pet, Routine, RoutineFrequency } from '@/lib/models';

const uid = (): string => {
  const u = auth.currentUser;
  if (!u) throw new Error('Not signed in');
  return u.uid;
};

export interface LogResult {
  xpGained: number;
  coinsGained: number;
  leveledUp: boolean;
  newLevel: number;
}

// ---------- Pets ----------

export async function addPet(name: string, species: SpeciesKey): Promise<string> {
  const userId = uid();
  const ref = await addDoc(collection(db, 'users', userId, 'pets'), {
    name: name.trim(),
    species,
    xp: 0,
    level: 1,
    equipped: {},
    backdropId: null,
    createdAt: Date.now(),
  });
  // First pet automatically becomes the active one shown on Home.
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const snap = await tx.get(userRef);
    if (!snap.data()?.activePetId) tx.update(userRef, { activePetId: ref.id });
  });
  return ref.id;
}

export async function setActivePet(petId: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid()), { activePetId: petId });
}

export async function renamePet(petId: string, name: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid(), 'pets', petId), { name: name.trim() });
}

export async function deletePet(petId: string): Promise<void> {
  const userId = uid();
  await deleteDoc(doc(db, 'users', userId, 'pets', petId));
  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const snap = await tx.get(userRef);
    if (snap.data()?.activePetId === petId) tx.update(userRef, { activePetId: null });
  });
}

// ---------- Activity logging ----------

/**
 * The critical path of the whole game: one transaction writes the activity,
 * bumps pet XP/level, and credits coins so the three can never drift apart.
 */
export async function logActivity(
  pet: Pet,
  type: ActivityType,
  opts: { routineId?: string; note?: string; xpMultiplier?: number; bonusCoins?: number } = {},
): Promise<LogResult> {
  const userId = uid();
  const info = activityInfo(type);
  const xpGained = Math.round(info.xp * (opts.xpMultiplier ?? 1));

  return runTransaction(db, async (tx) => {
    const petRef = doc(db, 'users', userId, 'pets', pet.id);
    const userRef = doc(db, 'users', userId);
    const [petSnap, userSnap] = [await tx.get(petRef), await tx.get(userRef)];
    if (!petSnap.exists() || !userSnap.exists()) throw new Error('Pet not found');

    const oldXp: number = petSnap.data().xp ?? 0;
    const oldLevel = levelFromXp(oldXp);
    const newXp = oldXp + xpGained;
    const newLevel = levelFromXp(newXp);
    const leveledUp = newLevel > oldLevel;

    let coinsGained = info.coins + (opts.bonusCoins ?? 0);
    // Award the bonus for every level crossed, in case one big log spans two.
    for (let lv = oldLevel + 1; lv <= newLevel; lv++) coinsGained += levelUpBonus(lv);

    const activityRef = doc(collection(db, 'users', userId, 'activities'));
    tx.set(activityRef, {
      petId: pet.id,
      petName: petSnap.data().name,
      type,
      xp: xpGained,
      coins: coinsGained,
      routineId: opts.routineId ?? null,
      note: opts.note ?? null,
      loggedAt: Date.now(),
    });
    tx.update(petRef, { xp: newXp, level: newLevel });
    tx.update(userRef, { coins: (userSnap.data().coins ?? 0) + coinsGained });

    return { xpGained, coinsGained, leveledUp, newLevel };
  });
}

// ---------- Routines ----------

export async function addRoutine(
  petId: string,
  title: string,
  activityType: ActivityType,
  frequency: RoutineFrequency,
): Promise<void> {
  await addDoc(collection(db, 'users', uid(), 'routines'), {
    petId,
    title: title.trim(),
    activityType,
    frequency,
    completions: {},
    lastCompletedKey: null,
    streak: 0,
    bestStreak: 0,
    createdAt: Date.now(),
  });
}

export async function deleteRoutine(routineId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid(), 'routines', routineId));
}

export const isRoutineDone = (routine: Routine, now: Date = new Date()): boolean =>
  !!routine.completions?.[periodKey(routine.frequency, now)];

/**
 * Check off a routine for the current day/week. Streak continues if the
 * previous period was completed, otherwise restarts at 1. Grants boosted XP
 * plus streak coins via the same logActivity transaction path.
 */
export async function completeRoutine(routine: Routine, pet: Pet): Promise<LogResult | null> {
  const userId = uid();
  const key = periodKey(routine.frequency);
  if (routine.completions?.[key]) return null; // already done this period

  const continued = routine.lastCompletedKey === previousPeriodKey(routine.frequency);
  const newStreak = continued ? routine.streak + 1 : 1;

  await updateDoc(doc(db, 'users', userId, 'routines', routine.id), {
    [`completions.${key}`]: Date.now(),
    lastCompletedKey: key,
    streak: newStreak,
    bestStreak: Math.max(newStreak, routine.bestStreak ?? 0),
  });

  return logActivity(pet, routine.activityType, {
    routineId: routine.id,
    xpMultiplier: ROUTINE_XP_MULTIPLIER,
    bonusCoins: streakBonusCoins(newStreak),
    note: routine.title,
  });
}

// ---------- Shop ----------

export async function buyItem(itemId: string): Promise<void> {
  const userId = uid();
  const item = shopItem(itemId);
  if (!item) throw new Error('Unknown item');

  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const snap = await tx.get(userRef);
    const data = snap.data();
    if (!data) throw new Error('Profile missing');
    const owned: string[] = data.ownedItemIds ?? [];
    if (owned.includes(itemId)) throw new Error('Already owned');
    if ((data.coins ?? 0) < item.price) throw new Error('NOT_ENOUGH_COINS');
    tx.update(userRef, {
      coins: data.coins - item.price,
      ownedItemIds: [...owned, itemId],
    });
  });
}

export async function equipAccessory(
  petId: string,
  slot: AccessorySlot,
  itemId: string | null,
): Promise<void> {
  await updateDoc(doc(db, 'users', uid(), 'pets', petId), {
    [`equipped.${slot}`]: itemId,
  });
}

export async function equipBackdrop(petId: string, backdropId: string | null): Promise<void> {
  await updateDoc(doc(db, 'users', uid(), 'pets', petId), { backdropId });
}
