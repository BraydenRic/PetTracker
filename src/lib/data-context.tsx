import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import type { Activity, Pet, Profile, Routine } from '@/lib/models';

interface DataState {
  profile: Profile | null;
  pets: Pet[];
  activePet: Pet | null;
  routines: Routine[];
  /** Most recent activities, newest first (capped at 200 for the journal). */
  activities: Activity[];
  loading: boolean;
}

const DataContext = createContext<DataState>({
  profile: null,
  pets: [],
  activePet: null,
  routines: [],
  activities: [],
  loading: true,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [petsLoaded, setPetsLoaded] = useState(false);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setPets([]);
      setRoutines([]);
      setActivities([]);
      setProfileLoaded(false);
      setPetsLoaded(false);
      return;
    }

    const unsubs = [
      onSnapshot(doc(db, 'users', uid), (snap) => {
        setProfile(snap.exists() ? (snap.data() as Profile) : null);
        setProfileLoaded(true);
      }),
      onSnapshot(
        query(collection(db, 'users', uid, 'pets'), orderBy('createdAt', 'asc')),
        (snap) => {
          setPets(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Pet));
          setPetsLoaded(true);
        },
      ),
      onSnapshot(
        query(collection(db, 'users', uid, 'routines'), orderBy('createdAt', 'asc')),
        (snap) => setRoutines(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Routine)),
      ),
      onSnapshot(
        query(
          collection(db, 'users', uid, 'activities'),
          orderBy('loggedAt', 'desc'),
          limit(200),
        ),
        (snap) => setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Activity)),
      ),
    ];
    return () => unsubs.forEach((u) => u());
  }, [uid]);

  const activePet = useMemo(() => {
    if (!pets.length) return null;
    return pets.find((p) => p.id === profile?.activePetId) ?? pets[0];
  }, [pets, profile?.activePetId]);

  const value = useMemo<DataState>(
    () => ({
      profile,
      pets,
      activePet,
      routines,
      activities,
      loading: !!uid && (!profileLoaded || !petsLoaded),
    }),
    [profile, pets, activePet, routines, activities, uid, profileLoaded, petsLoaded],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
