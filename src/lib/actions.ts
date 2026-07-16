import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  activityInfo,
  levelFromXp,
  levelUpBonus,
  MAX_PET_NAME_LENGTH,
  MAX_PETS,
  MAX_ROUTINE_TITLE_LENGTH,
  MAX_ROUTINES_PER_PET,
  ROUTINE_XP_MULTIPLIER,
  streakBonusCoins,
  type ActivityType,
  type SpeciesKey,
} from '@/config/game';
import { shopItem, type AccessorySlot } from '@/config/shop';
import { auth, db } from '@/lib/firebase';
import { periodKey, previousScheduledKey } from '@/lib/dates';
import type { Activity, Pet, Routine, RoutineFrequency } from '@/lib/models';

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

export async function addPet(
  name: string,
  species: SpeciesKey,
  coat: string | null = null,
): Promise<string> {
  const userId = uid();
  const trimmed = name.trim().slice(0, MAX_PET_NAME_LENGTH);
  if (!trimmed) throw new Error('Your pet needs a name.');
  // Re-check the cap here, not just in the UI, in case a stale screen submits.
  const existing = await getDocs(collection(db, 'users', userId, 'pets'));
  if (existing.size >= MAX_PETS) {
    throw new Error(`Your pack is full — ${MAX_PETS} pets max. Remove one in Profile first.`);
  }
  const ref = await addDoc(collection(db, 'users', userId, 'pets'), {
    name: trimmed,
    species,
    coat,
    xp: 0,
    level: 1,
    ownedItemIds: [],
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
  const trimmed = name.trim().slice(0, MAX_PET_NAME_LENGTH);
  if (!trimmed) throw new Error('Your pet needs a name.');
  await updateDoc(doc(db, 'users', uid(), 'pets', petId), { name: trimmed });
}

export async function deletePet(petId: string): Promise<void> {
  const userId = uid();
  await deleteDoc(doc(db, 'users', userId, 'pets', petId));
  // The pet's routines would otherwise linger as un-completable "No pet" rows.
  // Journal entries stay — they're history and carry their own petName.
  const orphaned = await getDocs(
    query(collection(db, 'users', userId, 'routines'), where('petId', '==', petId)),
  );
  await Promise.all(orphaned.docs.map((d) => deleteDoc(d.ref)));
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

/**
 * Undo for accidental logs: one transaction deletes the entry, takes back the
 * XP (recomputing level) and coins, and — if it came from a routine check-off —
 * un-marks that period's completion and steps the streak back.
 */
export async function deleteActivity(activity: Activity): Promise<void> {
  const userId = uid();
  await runTransaction(db, async (tx) => {
    const actRef = doc(db, 'users', userId, 'activities', activity.id);
    const petRef = doc(db, 'users', userId, 'pets', activity.petId);
    const userRef = doc(db, 'users', userId);
    const routineRef = activity.routineId
      ? doc(db, 'users', userId, 'routines', activity.routineId)
      : null;

    // Firestore transactions require all reads before any write.
    const actSnap = await tx.get(actRef);
    if (!actSnap.exists()) return; // already removed elsewhere
    const petSnap = await tx.get(petRef);
    const userSnap = await tx.get(userRef);
    const routineSnap = routineRef ? await tx.get(routineRef) : null;

    tx.delete(actRef);

    if (petSnap.exists()) {
      const newXp = Math.max(0, (petSnap.data().xp ?? 0) - activity.xp);
      tx.update(petRef, { xp: newXp, level: levelFromXp(newXp) });
    }
    if (userSnap.exists()) {
      tx.update(userRef, { coins: Math.max(0, (userSnap.data().coins ?? 0) - activity.coins) });
    }
    if (routineRef && routineSnap?.exists()) {
      const r = routineSnap.data() as Routine;
      const when = new Date(activity.loggedAt);
      const key = periodKey(r.frequency, when);
      if (r.completions?.[key]) {
        const completions = { ...r.completions };
        delete completions[key];
        const patch: Record<string, unknown> = { completions };
        if (r.lastCompletedKey === key) {
          const prev = previousScheduledKey(r, when);
          patch.lastCompletedKey = completions[prev] ? prev : null;
          patch.streak = Math.max(0, (r.streak ?? 1) - 1);
        }
        tx.update(routineRef, patch);
      }
    }
  });
}

// ---------- Routines ----------

/** How many routines a pet already has (used to enforce the per-pet cap). */
async function routineCountForPet(userId: string, petId: string, excludeId?: string): Promise<number> {
  const snap = await getDocs(
    query(collection(db, 'users', userId, 'routines'), where('petId', '==', petId)),
  );
  return snap.docs.filter((d) => d.id !== excludeId).length;
}

export async function addRoutine(
  petId: string,
  title: string,
  activityType: ActivityType,
  frequency: RoutineFrequency,
  timeOfDay: string | null = null,
  days: number[] | null = null,
): Promise<void> {
  const userId = uid();
  if ((await routineCountForPet(userId, petId)) >= MAX_ROUTINES_PER_PET) {
    throw new Error(`That pet already has ${MAX_ROUTINES_PER_PET} routines — the max. Remove one first.`);
  }
  await addDoc(collection(db, 'users', userId, 'routines'), {
    petId,
    title: title.trim().slice(0, MAX_ROUTINE_TITLE_LENGTH),
    activityType,
    frequency,
    timeOfDay,
    days,
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

/** Edits the routine's definition; completions, streaks and history stay intact. */
export async function updateRoutine(
  routineId: string,
  data: {
    petId: string;
    title: string;
    activityType: ActivityType;
    frequency: RoutineFrequency;
    timeOfDay: string | null;
    days: number[] | null;
  },
): Promise<void> {
  const userId = uid();
  // Moving a routine to another pet must respect that pet's cap too.
  if ((await routineCountForPet(userId, data.petId, routineId)) >= MAX_ROUTINES_PER_PET) {
    throw new Error(`That pet already has ${MAX_ROUTINES_PER_PET} routines — the max. Remove one first.`);
  }
  await updateDoc(doc(db, 'users', userId, 'routines', routineId), {
    ...data,
    title: data.title.trim().slice(0, MAX_ROUTINE_TITLE_LENGTH),
  });
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

  // Read-and-mark in one transaction: a double-tap (or a second device) sees
  // the completion already recorded and bails instead of double-awarding XP.
  const newStreak = await runTransaction(db, async (tx) => {
    const ref = doc(db, 'users', userId, 'routines', routine.id);
    const snap = await tx.get(ref);
    if (!snap.exists()) return null; // routine deleted meanwhile
    const fresh = snap.data() as Routine;
    if (fresh.completions?.[key]) return null; // already done this period

    const continued = fresh.lastCompletedKey === previousScheduledKey(fresh);
    const streak = continued ? (fresh.streak ?? 0) + 1 : 1;
    tx.update(ref, {
      [`completions.${key}`]: Date.now(),
      lastCompletedKey: key,
      streak,
      bestStreak: Math.max(streak, fresh.bestStreak ?? 0),
    });
    return streak;
  });
  if (newStreak === null) return null;

  return logActivity(pet, routine.activityType, {
    routineId: routine.id,
    xpMultiplier: ROUTINE_XP_MULTIPLIER,
    bonusCoins: streakBonusCoins(newStreak),
    note: routine.title,
  });
}

// ---------- Account deletion ----------

/**
 * Wipes everything the user owns, for in-app account deletion (App Store
 * guideline 5.1.1 requires it). Runs while still authenticated so the security
 * rules permit the deletes; the auth user itself is deleted right after.
 */
export async function deleteAllUserData(userId: string): Promise<void> {
  for (const sub of ['pets', 'activities', 'routines'] as const) {
    const snap = await getDocs(collection(db, 'users', userId, sub));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, 'users', userId));
}

// ---------- Shop ----------

/** Buys an item for one specific pet — coins come from the shared wallet, but
 * the item goes into that pet's own collection. */
export async function buyItem(pet: Pet, itemId: string): Promise<void> {
  const userId = uid();
  const item = shopItem(itemId);
  if (!item) throw new Error('Unknown item');

  await runTransaction(db, async (tx) => {
    const userRef = doc(db, 'users', userId);
    const petRef = doc(db, 'users', userId, 'pets', pet.id);
    const [userSnap, petSnap] = [await tx.get(userRef), await tx.get(petRef)];
    const userData = userSnap.data();
    const petData = petSnap.data();
    if (!userData || !petData) throw new Error('Profile missing');
    const owned: string[] = petData.ownedItemIds ?? [];
    if (owned.includes(itemId)) throw new Error('Already owned');
    if ((userData.coins ?? 0) < item.price) throw new Error('NOT_ENOUGH_COINS');
    tx.update(userRef, { coins: userData.coins - item.price });
    tx.update(petRef, { ownedItemIds: [...owned, itemId] });
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
