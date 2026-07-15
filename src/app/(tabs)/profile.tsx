import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen, T } from '@/components/ui';
import { speciesInfo } from '@/config/game';
import { deletePet, setActivePet } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import { colors, fonts, radius, space } from '@/theme';

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <T variant="caption">{label}</T>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, pets, activities, routines, activePet } = useData();

  const stats = useMemo(() => {
    const totalXp = pets.reduce((s, p) => s + p.xp, 0);
    const bestStreak = Math.max(0, ...routines.map((r) => r.bestStreak ?? 0));
    return { totalXp, activityCount: activities.length, bestStreak };
  }, [pets, activities, routines]);

  const providers = user?.providerData.map((p) => p.providerId) ?? [];
  const providerLabel = providers.includes('google.com')
    ? 'Google'
    : providers.includes('apple.com')
      ? 'Apple'
      : 'Email';

  const confirmDelete = (petId: string, name: string) => {
    Alert.alert(
      `Say goodbye to ${name}?`,
      'The pet and its level are removed. Journal entries stay in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove pet', style: 'destructive', onPress: () => deletePet(petId) },
      ],
    );
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your data is saved to your account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const initial = (profile?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <T variant="title" style={{ marginBottom: space(4) }}>
          Profile
        </T>

        {/* Account card */}
        <Card style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="heading">{profile?.displayName ?? 'Pet lover'}</T>
            <T variant="caption">{user?.email}</T>
            <View style={styles.providerPill}>
              <Ionicons
                name={
                  providerLabel === 'Google'
                    ? 'logo-google'
                    : providerLabel === 'Apple'
                      ? 'logo-apple'
                      : 'mail-outline'
                }
                size={11}
                color={colors.sub}
              />
              <Text style={styles.providerText}>{providerLabel} account</Text>
            </View>
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Stat value={stats.totalXp.toLocaleString()} label="Total XP" />
          <View style={styles.statDivider} />
          <Stat value={stats.activityCount} label="Activities" />
          <View style={styles.statDivider} />
          <Stat value={stats.bestStreak > 0 ? `🔥 ${stats.bestStreak}` : '—'} label="Best streak" />
        </Card>

        {/* Pets */}
        <View style={styles.sectionHeader}>
          <T variant="heading">Your pack</T>
          <Button
            title="＋ Add"
            variant="outline"
            onPress={() => router.push('/new-pet')}
            style={styles.addButton}
          />
        </View>
        <View style={{ gap: space(2.5) }}>
          {pets.map((p) => (
            <Pressable key={p.id} onLongPress={() => confirmDelete(p.id, p.name)}>
              <Card style={styles.petRow}>
                <Text style={{ fontSize: 30 }}>{speciesInfo(p.species).emoji}</Text>
                <View style={{ flex: 1 }}>
                  <T variant="body" style={{ fontWeight: '700' }}>
                    {p.name}
                  </T>
                  <T variant="caption">
                    Level {p.level} · {p.xp.toLocaleString()} XP
                  </T>
                </View>
                {p.id === activePet?.id ? (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                ) : (
                  <Button
                    title="Set active"
                    variant="ghost"
                    onPress={() => setActivePet(p.id)}
                    style={styles.setActiveButton}
                  />
                )}
              </Card>
            </Pressable>
          ))}
          {pets.length === 0 && (
            <T variant="caption" style={{ textAlign: 'center', paddingVertical: space(4) }}>
              No pets yet — add one to get started.
            </T>
          )}
        </View>
        {pets.length > 0 && (
          <T variant="caption" style={{ marginTop: space(2), textAlign: 'center' }}>
            Long-press a pet to remove it.
          </T>
        )}

        <Button
          title="Sign out"
          variant="danger"
          onPress={confirmSignOut}
          style={{ marginTop: space(8) }}
        />
        <T variant="caption" style={styles.footer}>
          PetTracker · made with 🐾
        </T>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(5),
    paddingBottom: space(10),
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(4),
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  providerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1),
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: space(2),
    paddingVertical: 3,
    marginTop: space(1.5),
  },
  providerText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.sub,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space(3),
    paddingVertical: space(4),
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.ink,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.line,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space(6),
    marginBottom: space(3),
  },
  addButton: {
    minHeight: 38,
    paddingVertical: space(1.5),
    paddingHorizontal: space(3.5),
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    padding: space(3.5),
  },
  activePill: {
    backgroundColor: colors.sageSoft,
    borderRadius: 999,
    paddingHorizontal: space(2.5),
    paddingVertical: space(1),
  },
  activePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sage,
  },
  setActiveButton: {
    minHeight: 34,
    paddingVertical: space(1),
    paddingHorizontal: space(2),
  },
  footer: {
    textAlign: 'center',
    marginTop: space(4),
  },
});
