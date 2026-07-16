import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button, Card, Screen, T } from '@/components/ui';
import { MAX_DISPLAY_NAME_LENGTH, MAX_PETS, speciesInfo } from '@/config/game';
import { deletePet, setActivePet, setReminderPrefs } from '@/lib/actions';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import {
  DEFAULT_REMINDER_PREFS,
  ensureNotificationPermission,
  REMINDER_OFFSETS,
} from '@/lib/reminders';
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
  const { user, signOut, updateDisplayName, deleteAccount } = useAuth();
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

  const reminderPrefs = profile?.reminders ?? DEFAULT_REMINDER_PREFS;

  const toggleReminders = async (on: boolean) => {
    if (on && !(await ensureNotificationPermission())) {
      Alert.alert(
        'Notifications are off',
        'Allow notifications for this app in the iOS Settings app, then flip this switch again.',
      );
      return;
    }
    try {
      await setReminderPrefs({ ...reminderPrefs, enabled: on });
    } catch {
      Alert.alert("Couldn't save", 'Check your connection and try again.');
    }
  };

  const setReminderOffset = async (offsetMinutes: number) => {
    try {
      await setReminderPrefs({ ...reminderPrefs, offsetMinutes });
    } catch {
      Alert.alert("Couldn't save", 'Check your connection and try again.');
    }
  };

  const confirmDelete = (petId: string, name: string) => {
    Alert.alert(
      `Say goodbye to ${name}?`,
      'The pet, its level and its routines are removed. Journal entries stay in your history.',
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

  // Apple hides the real name behind "Hide My Email" and only shares it once,
  // so let people set the name shown on their profile themselves.
  const editName = () => {
    Alert.prompt(
      'Your name',
      'This is the name shown on your profile and home screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name?: string) => {
            // Alert.prompt has no maxLength, so clamp here.
            const trimmed = (name ?? '').trim().slice(0, MAX_DISPLAY_NAME_LENGTH);
            if (!trimmed || trimmed === profile?.displayName) return;
            try {
              await updateDisplayName(trimmed);
            } catch {
              Alert.alert("Couldn't update name", 'Check your connection and try again.');
            }
          },
        },
      ],
      'plain-text',
      profile?.displayName ?? user?.displayName ?? '',
    );
  };

  // App Store guideline 5.1.1: apps with account creation must offer in-app
  // account deletion. Password users re-type their password; Apple users
  // confirm through the native sign-in sheet.
  const hasPassword = providers.includes('password');

  const runDeleteAccount = async (password?: string) => {
    try {
      await deleteAccount(password);
      // On success the auth listener fires and routes back to the welcome screen.
    } catch (err) {
      const code = (err as { code?: string })?.code;
      Alert.alert(
        "Couldn't delete account",
        code === 'auth/requires-recent-login'
          ? 'For security, sign out and back in first, then try again.'
          : hasPassword
            ? 'Check your password and connection, then try again.'
            : `We couldn't confirm it's you. Pick the same ${providerLabel} account you signed up with and try again.`,
      );
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'Your account, pets, XP, coins and journal will be permanently erased. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            hasPassword
              ? Alert.prompt(
                  'Confirm your password',
                  'Enter your password to permanently delete your account.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete forever',
                      style: 'destructive',
                      onPress: (pw?: string) => runDeleteAccount(pw),
                    },
                  ],
                  'secure-text',
                )
              : runDeleteAccount(),
        },
      ],
    );
  };

  const initial = (profile?.displayName ?? user?.displayName ?? user?.email ?? '?')
    .charAt(0)
    .toUpperCase();

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
            <Pressable onPress={editName} style={styles.nameRow}>
              <T variant="heading">{profile?.displayName ?? user?.displayName ?? 'Pet lover'}</T>
              <Ionicons name="pencil" size={14} color={colors.faint} />
            </Pressable>
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

        {/* Reminders */}
        <Card style={styles.remindersCard}>
          <View style={styles.reminderHeader}>
            <View style={{ flex: 1 }}>
              <T variant="body" style={{ fontWeight: '700' }}>
                Routine reminders
              </T>
              <T variant="caption">For routines with a set time</T>
            </View>
            <Switch
              value={reminderPrefs.enabled}
              onValueChange={toggleReminders}
              trackColor={{ true: colors.accent }}
            />
          </View>
          {reminderPrefs.enabled && (
            <>
              <T variant="label" style={{ marginTop: space(3.5), marginBottom: space(2) }}>
                REMIND ME
              </T>
              <View style={styles.offsetRow}>
                {REMINDER_OFFSETS.map((o) => {
                  const on = reminderPrefs.offsetMinutes === o.value;
                  return (
                    <Pressable
                      key={o.value}
                      onPress={() => setReminderOffset(o.value)}
                      style={[styles.offsetPill, on && styles.offsetPillActive]}>
                      <Text style={[styles.offsetText, on && { color: colors.white }]}>
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </Card>

        {/* Pets */}
        <View style={styles.sectionHeader}>
          <T variant="heading">
            Your pack{pets.length > 0 ? `  ${pets.length}/${MAX_PETS}` : ''}
          </T>
          <Button
            title="＋ Add"
            variant="outline"
            onPress={() =>
              pets.length >= MAX_PETS
                ? Alert.alert(
                    'Full house!',
                    `Your pack is at the limit of ${MAX_PETS} pets. Remove one to add another.`,
                  )
                : router.push('/new-pet')
            }
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
          variant="outline"
          onPress={confirmSignOut}
          style={{ marginTop: space(8) }}
        />
        <Button
          title="Delete account"
          variant="danger"
          onPress={confirmDeleteAccount}
          style={{ marginTop: space(3) }}
        />
        <T variant="caption" style={styles.footer}>
          Tend · made with 🐾
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1.5),
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
  remindersCard: {
    marginTop: space(3),
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
  },
  offsetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space(2),
  },
  offsetPill: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: space(3),
    paddingVertical: space(1.5),
  },
  offsetPillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  offsetText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink,
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
