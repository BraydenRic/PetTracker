import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LevelUpModal, RewardToast } from '@/components/celebrations';
import { PetAvatar } from '@/components/pet-avatar';
import { Button, Card, CoinPill, Screen, T } from '@/components/ui';
import { ACTIVITIES, levelProgress, MAX_PETS, speciesInfo, type ActivityInfo } from '@/config/game';
import { completeRoutine, isRoutineDone, logActivity, setActivePet, type LogResult } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { formatTimeOfDay, isScheduledOn } from '@/lib/dates';
import type { Routine } from '@/lib/models';
import { colors, fonts, radius, space } from '@/theme';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, pets, activePet, routines, loading } = useData();

  const [toast, setToast] = useState<LogResult | null>(null);
  const [levelUp, setLevelUp] = useState<LogResult | null>(null);
  const [logging, setLogging] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstName = (profile?.displayName ?? user?.displayName ?? 'friend').split(' ')[0];

  const progress = useMemo(
    () => (activePet ? levelProgress(activePet.xp) : null),
    [activePet],
  );

  const dueToday = useMemo(
    () =>
      routines
        .filter(
          (r) => r.petId === activePet?.id && !isRoutineDone(r) && isScheduledOn(r, new Date()),
        )
        .sort((a, b) => (a.timeOfDay ?? '99:99').localeCompare(b.timeOfDay ?? '99:99')),
    [routines, activePet?.id],
  );

  const showReward = (result: LogResult) => {
    if (result.leveledUp) {
      setLevelUp(result);
    } else {
      setToast(result);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }
  };

  const quickLog = async (activity: ActivityInfo) => {
    if (!activePet || logging) return;
    setLogging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      showReward(await logActivity(activePet, activity.type));
    } catch (err) {
      Alert.alert('Could not log', (err as Error).message);
    } finally {
      setLogging(false);
    }
  };

  const checkRoutine = async (routine: Routine) => {
    if (!activePet || logging) return;
    setLogging(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const result = await completeRoutine(routine, activePet);
      if (result) showReward(result);
    } catch (err) {
      Alert.alert('Could not complete', (err as Error).message);
    } finally {
      setLogging(false);
    }
  };

  // While the first Firestore snapshots arrive (right after sign-in), hold a
  // quiet loading state — otherwise the petless layout flashes for a beat.
  if (loading) {
    return (
      <Screen style={styles.adoptScreen}>
        <Text style={{ fontSize: 52 }}>🐾</Text>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    );
  }

  // ----- Empty state: adopt the first pet -----
  if (!loading && pets.length === 0) {
    return (
      <Screen style={styles.adoptScreen}>
        <Text style={{ fontSize: 72 }}>🏡</Text>
        <T variant="display" style={{ textAlign: 'center' }}>
          Your den is empty
        </T>
        <T variant="body" style={{ color: colors.sub, textAlign: 'center' }}>
          Add your first pet to start logging walks, meals and playtime — and
          watch them level up.
        </T>
        <Button
          title="Add your pet  🐾"
          onPress={() => router.push('/new-pet')}
          style={{ alignSelf: 'stretch', marginTop: space(4) }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <RewardToast result={toast} />
      {levelUp && activePet && (
        <LevelUpModal pet={activePet} result={levelUp} onClose={() => setLevelUp(null)} />
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <T variant="caption" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              {greeting()}
            </T>
            <T variant="title">{firstName} 👋</T>
          </View>
          <CoinPill coins={profile?.coins ?? 0} />
        </View>

        {/* Pet switcher (only when there's a pack) */}
        {pets.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: space(3) }}>
            <View style={{ flexDirection: 'row', gap: space(2) }}>
              {pets.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setActivePet(p.id)}
                  style={[styles.petChip, p.id === activePet?.id && styles.petChipActive]}>
                  <Text style={{ fontSize: 16 }}>{speciesInfo(p.species).emoji}</Text>
                  <Text
                    style={[
                      styles.petChipText,
                      p.id === activePet?.id && { color: colors.white },
                    ]}>
                    {p.name}
                  </Text>
                </Pressable>
              ))}
              {pets.length < MAX_PETS && (
                <Pressable onPress={() => router.push('/new-pet')} style={styles.petChip}>
                  <Text style={styles.petChipText}>＋ New</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        )}

        {/* Hero */}
        {activePet && progress && (
          <Card style={styles.hero}>
            <PetAvatar pet={activePet} xpPct={progress.pct} />
            <View style={styles.heroMeta}>
              <T variant="title">{activePet.name}</T>
              <T variant="caption" style={{ marginTop: 2 }}>
                {speciesInfo(activePet.species).label}
              </T>
              <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>LV {progress.level}</Text>
                </View>
                <T variant="caption">
                  {progress.pct >= 1
                    ? 'Max level!'
                    : `${progress.into} / ${progress.span} XP to level ${progress.level + 1}`}
                </T>
              </View>
            </View>
          </Card>
        )}

        {/* Quick log */}
        <T variant="heading" style={styles.sectionTitle}>
          Log something
        </T>
        <View style={styles.grid}>
          {ACTIVITIES.map((a) => (
            <Pressable
              key={a.type}
              onPress={() => quickLog(a)}
              disabled={logging}
              style={({ pressed }) => [
                styles.activityChip,
                { backgroundColor: a.tint },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}>
              <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
              <Text style={styles.activityLabel}>{a.label}</Text>
              <Text style={styles.activityXp}>+{a.xp} XP</Text>
            </Pressable>
          ))}
        </View>

        {/* Today's routines */}
        {dueToday.length > 0 && (
          <>
            <T variant="heading" style={styles.sectionTitle}>
              Still to do {dueToday[0].frequency === 'weekly' ? 'this week' : 'today'}
            </T>
            <View style={{ gap: space(2.5) }}>
              {dueToday.map((r) => (
                <Card key={r.id} style={styles.routineRow}>
                  <View style={{ flex: 1 }}>
                    <T variant="body" style={{ fontWeight: '600' }}>
                      {r.title}
                    </T>
                    <T variant="caption">
                      {r.timeOfDay ? `${formatTimeOfDay(r.timeOfDay)} · ` : ''}
                      {r.frequency === 'daily' ? 'Daily' : 'Weekly'}
                      {r.streak > 0 ? ` · 🔥 ${r.streak}` : ''}
                    </T>
                  </View>
                  <Pressable onPress={() => checkRoutine(r)} style={styles.checkButton}>
                    <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>✓</Text>
                  </Pressable>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(5),
    paddingBottom: space(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space(4),
  },
  adoptScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(8),
    gap: space(3),
  },
  hero: {
    alignItems: 'center',
    paddingVertical: space(6),
  },
  heroMeta: {
    alignItems: 'center',
    marginTop: space(3),
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2.5),
    marginTop: space(2.5),
  },
  levelBadge: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: space(2.5),
    paddingVertical: space(1),
  },
  levelBadgeText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: space(3.5),
    paddingVertical: space(2),
  },
  petChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  petChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  sectionTitle: {
    marginTop: space(6),
    marginBottom: space(3),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2.5),
  },
  activityChip: {
    width: '30.5%',
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(43,33,24,0.07)',
    paddingVertical: space(3),
    gap: 2,
  },
  activityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  activityXp: {
    fontSize: 11,
    fontFamily: fonts.displaySemi,
    color: colors.sub,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    padding: space(3.5),
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
