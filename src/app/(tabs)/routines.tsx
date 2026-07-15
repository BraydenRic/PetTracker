import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button, Card, EmptyState, Field, Screen, T } from '@/components/ui';
import { ACTIVITIES, activityInfo, speciesInfo, type ActivityType } from '@/config/game';
import {
  addRoutine,
  completeRoutine,
  deleteRoutine,
  isRoutineDone,
} from '@/lib/actions';
import { useData } from '@/lib/data-context';
import type { Routine, RoutineFrequency } from '@/lib/models';
import { colors, radius, space } from '@/theme';

function RoutineCard({ routine }: { routine: Routine }) {
  const { pets } = useData();
  const pet = pets.find((p) => p.id === routine.petId);
  const info = activityInfo(routine.activityType);
  const done = isRoutineDone(routine);

  const onCheck = async () => {
    if (done || !pet) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await completeRoutine(routine, pet);
    } catch (err) {
      Alert.alert('Could not complete', (err as Error).message);
    }
  };

  const onLongPress = () => {
    Alert.alert('Delete routine?', `"${routine.title}" and its streak will be gone for good.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(routine.id) },
    ]);
  };

  return (
    <Pressable onLongPress={onLongPress}>
      <Card style={[styles.routineCard, done && { opacity: 0.65 }]}>
        <View style={[styles.routineEmoji, { backgroundColor: info.tint }]}>
          <Text style={{ fontSize: 22 }}>{info.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="body" style={{ fontWeight: '700' }}>
            {routine.title}
          </T>
          <T variant="caption">
            {pet ? `${speciesInfo(pet.species).emoji} ${pet.name}` : 'No pet'} ·{' '}
            {routine.frequency === 'daily' ? 'Every day' : 'Every week'}
          </T>
        </View>
        <View style={{ alignItems: 'flex-end', gap: space(1.5) }}>
          {routine.streak > 0 && (
            <View style={styles.streakPill}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accentDark }}>
                🔥 {routine.streak}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onCheck}
            style={[styles.check, done ? styles.checkDone : styles.checkTodo]}>
            <Text style={{ color: done ? colors.white : colors.sage, fontWeight: '800' }}>✓</Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

function AddRoutineModal({ onClose }: { onClose: () => void }) {
  const { pets, activePet } = useData();
  const [petId, setPetId] = useState(activePet?.id ?? pets[0]?.id ?? null);
  const [type, setType] = useState<ActivityType>('walk');
  const [frequency, setFrequency] = useState<RoutineFrequency>('daily');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const info = activityInfo(type);
  const pet = pets.find((p) => p.id === petId);
  const suggestedTitle = pet ? `${info.label} ${pet.name}` : info.label;

  const save = async () => {
    if (!petId) return;
    setBusy(true);
    try {
      await addRoutine(petId, title.trim() || suggestedTitle, type, frequency);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (err) {
      Alert.alert('Could not save', (err as Error).message);
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      {/* Bottom sheets sit exactly where the keyboard appears — pad the sheet up. */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <T variant="title">New routine</T>

          <T variant="label" style={styles.modalLabel}>
            FOR
          </T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: space(2) }}>
              {pets.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setPetId(p.id)}
                  style={[styles.pill, petId === p.id && styles.pillActive]}>
                  <Text style={[styles.pillText, petId === p.id && { color: colors.white }]}>
                    {speciesInfo(p.species).emoji} {p.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <T variant="label" style={styles.modalLabel}>
            ACTIVITY
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            {ACTIVITIES.map((a) => (
              <Pressable
                key={a.type}
                onPress={() => setType(a.type)}
                style={[styles.pill, type === a.type && styles.pillActive]}>
                <Text style={[styles.pillText, type === a.type && { color: colors.white }]}>
                  {a.emoji} {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <T variant="label" style={styles.modalLabel}>
            REPEATS
          </T>
          <View style={{ flexDirection: 'row', gap: space(2) }}>
            {(['daily', 'weekly'] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrequency(f)}
                style={[styles.pill, frequency === f && styles.pillActive, { flex: 1, alignItems: 'center' }]}>
                <Text style={[styles.pillText, frequency === f && { color: colors.white }]}>
                  {f === 'daily' ? 'Every day' : 'Every week'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="NAME (OPTIONAL)"
            value={title}
            onChangeText={setTitle}
            placeholder={suggestedTitle}
            style={{ marginTop: space(4) }}
          />

          <View style={{ flexDirection: 'row', gap: space(3), marginTop: space(5) }}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Create" onPress={save} loading={busy} style={{ flex: 1.4 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function RoutinesScreen() {
  const { routines, pets } = useData();
  const [adding, setAdding] = useState(false);

  const daily = routines.filter((r) => r.frequency === 'daily');
  const weekly = routines.filter((r) => r.frequency === 'weekly');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <T variant="title">Routines</T>
          <Button
            title="＋ New"
            variant="ink"
            onPress={() => setAdding(true)}
            disabled={pets.length === 0}
            style={styles.newButton}
          />
        </View>
        <T variant="caption" style={{ marginBottom: space(4) }}>
          Consistency pays: routine check-offs earn 1.5× XP plus streak coins. Long-press to delete.
        </T>

        {routines.length === 0 && (
          <EmptyState
            emoji="📆"
            title="No routines yet"
            message={
              pets.length
                ? 'Set up a daily walk or weekly bath and build a streak.'
                : 'Add a pet first, then build their care schedule here.'
            }
          />
        )}

        {daily.length > 0 && (
          <>
            <T variant="heading" style={styles.section}>
              Daily
            </T>
            <View style={{ gap: space(2.5) }}>
              {daily.map((r) => (
                <RoutineCard key={r.id} routine={r} />
              ))}
            </View>
          </>
        )}
        {weekly.length > 0 && (
          <>
            <T variant="heading" style={styles.section}>
              Weekly
            </T>
            <View style={{ gap: space(2.5) }}>
              {weekly.map((r) => (
                <RoutineCard key={r.id} routine={r} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      {adding && <AddRoutineModal onClose={() => setAdding(false)} />}
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
    marginBottom: space(1),
  },
  newButton: {
    minHeight: 40,
    paddingVertical: space(2),
    paddingHorizontal: space(4),
  },
  section: {
    marginTop: space(4),
    marginBottom: space(2.5),
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    padding: space(3.5),
  },
  routineEmoji: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakPill: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: space(2),
    paddingVertical: 2,
  },
  check: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTodo: {
    borderWidth: 2,
    borderColor: colors.sage,
    backgroundColor: colors.sageSoft,
  },
  checkDone: {
    backgroundColor: colors.sage,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space(6),
    paddingBottom: space(10),
  },
  modalLabel: {
    marginTop: space(4.5),
    marginBottom: space(2),
  },
  pill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    paddingHorizontal: space(3.5),
    paddingVertical: space(2),
  },
  pillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pillText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.ink,
  },
});
