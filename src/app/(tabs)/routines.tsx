import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
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
import { addRoutine, completeRoutine, deleteRoutine } from '@/lib/actions';
import { useData } from '@/lib/data-context';
import {
  addDays,
  dayKey,
  formatTime,
  formatTimeOfDay,
  sameDay,
  startOfWeek,
  weekKey,
} from '@/lib/dates';
import type { Routine, RoutineFrequency } from '@/lib/models';
import { colors, fonts, radius, space } from '@/theme';

/** How a routine relates to the day/week the user is looking at. */
type SlotState = 'done' | 'missed' | 'due' | 'upcoming';

const sortByTime = (a: Routine, b: Routine) =>
  (a.timeOfDay ?? '99:99').localeCompare(b.timeOfDay ?? '99:99');

function StateBadge({ state, onCheck }: { state: SlotState; onCheck?: () => void }) {
  if (state === 'due') {
    return (
      <Pressable onPress={onCheck} style={[styles.check, styles.checkTodo]}>
        <Text style={{ color: colors.sage, fontWeight: '800' }}>✓</Text>
      </Pressable>
    );
  }
  if (state === 'done') {
    return (
      <View style={[styles.check, styles.checkDone]}>
        <Text style={{ color: colors.white, fontWeight: '800' }}>✓</Text>
      </View>
    );
  }
  if (state === 'missed') {
    return (
      <View style={[styles.check, styles.checkMissed]}>
        <Text style={{ color: colors.danger, fontWeight: '800' }}>✕</Text>
      </View>
    );
  }
  return (
    <View style={[styles.check, styles.checkUpcoming]}>
      <Ionicons name="time-outline" size={17} color={colors.faint} />
    </View>
  );
}

function RoutineRow({ routine, state }: { routine: Routine; state: SlotState }) {
  const { pets } = useData();
  const pet = pets.find((p) => p.id === routine.petId);
  const info = activityInfo(routine.activityType);

  const onCheck = async () => {
    if (!pet) return;
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
      <Card style={[styles.routineCard, (state === 'missed' || state === 'upcoming') && { opacity: 0.75 }]}>
        <View style={[styles.routineEmoji, { backgroundColor: info.tint }]}>
          <Text style={{ fontSize: 22 }}>{info.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T variant="body" style={{ fontWeight: '700' }}>
            {routine.title}
          </T>
          <T variant="caption">
            {routine.timeOfDay ? `${formatTimeOfDay(routine.timeOfDay)} · ` : ''}
            {pet ? `${speciesInfo(pet.species).emoji} ${pet.name}` : 'No pet'}
            {routine.streak > 0 ? ` · 🔥 ${routine.streak}` : ''}
          </T>
        </View>
        <StateBadge state={state} onCheck={onCheck} />
      </Card>
    </Pressable>
  );
}

// ---------- Add routine sheet ----------

function AddRoutineModal({ onClose }: { onClose: () => void }) {
  const { pets, activePet } = useData();
  const [petId, setPetId] = useState(activePet?.id ?? pets[0]?.id ?? null);
  const [type, setType] = useState<ActivityType>('walk');
  const [frequency, setFrequency] = useState<RoutineFrequency>('daily');
  const [time, setTime] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  const info = activityInfo(type);
  const pet = pets.find((p) => p.id === petId);
  const suggestedTitle = pet ? `${info.label} ${pet.name}` : info.label;

  const defaultTime = () => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const save = async () => {
    if (!petId) return;
    setBusy(true);
    try {
      const timeOfDay = time
        ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
        : null;
      await addRoutine(petId, title.trim() || suggestedTitle, type, frequency, timeOfDay);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } catch (err) {
      Alert.alert('Could not save', (err as Error).message);
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
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

            <T variant="label" style={styles.modalLabel}>
              AT WHAT TIME?
            </T>
            <View style={{ flexDirection: 'row', gap: space(2) }}>
              <Pressable
                onPress={() => setTime(null)}
                style={[styles.pill, !time && styles.pillActive, { flex: 1, alignItems: 'center' }]}>
                <Text style={[styles.pillText, !time && { color: colors.white }]}>Anytime</Text>
              </Pressable>
              <Pressable
                onPress={() => setTime((t) => t ?? defaultTime())}
                style={[styles.pill, !!time && styles.pillActive, { flex: 1, alignItems: 'center' }]}>
                <Text style={[styles.pillText, !!time && { color: colors.white }]}>
                  {time ? formatTimeOfDay(`${time.getHours()}:${time.getMinutes()}`) : 'Set a time'}
                </Text>
              </Pressable>
            </View>
            {time && (
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                minuteInterval={5}
                // The spinner defaults to a light gray that vanishes on our cream
                // background — force ink text.
                textColor={colors.ink}
                themeVariant="light"
                onChange={(_, picked) => picked && setTime(picked)}
                style={{ alignSelf: 'center' }}
              />
            )}

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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- Screen ----------

export default function RoutinesScreen() {
  const { routines, pets, activities } = useData();
  const [adding, setAdding] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(() => new Date());

  const today = new Date();
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.getTime()],
  );

  const daily = useMemo(() => routines.filter((r) => r.frequency === 'daily').sort(sortByTime), [routines]);
  const weekly = useMemo(() => routines.filter((r) => r.frequency === 'weekly').sort(sortByTime), [routines]);

  // A routine only "exists" from the day it was created — earlier days must not
  // show it (or count it as missed). Keys are zero-padded so string compare works.
  const existsOnDay = (r: Routine, key: string) => key >= dayKey(new Date(r.createdAt));
  const existsInWeek = (r: Routine, wk: string) => wk >= weekKey(new Date(r.createdAt));

  const selKey = dayKey(selectedDay);
  const selWeekKey = weekKey(selectedDay);
  const todayKey = dayKey(today);
  const isPastDay = selKey < todayKey;
  const isFutureDay = selKey > todayKey;
  const isCurrentWeek = selWeekKey === weekKey(today);
  const isPastWeek = weekOffset < 0;

  const dayState = (r: Routine): SlotState => {
    if (r.completions?.[selKey]) return 'done';
    if (isPastDay) return 'missed';
    if (isFutureDay) return 'upcoming';
    return 'due';
  };
  const weekState = (r: Routine): SlotState => {
    if (r.completions?.[selWeekKey]) return 'done';
    if (isPastWeek) return 'missed';
    if (!isCurrentWeek) return 'upcoming';
    return 'due';
  };

  const dayActivities = useMemo(
    () => activities.filter((a) => dayKey(new Date(a.loggedAt)) === selKey),
    [activities, selKey],
  );

  const shiftWeek = (delta: number) => {
    const next = weekOffset + delta;
    setWeekOffset(next);
    // Keep the same weekday selected while paging between weeks.
    const dow = (selectedDay.getDay() + 6) % 7;
    setSelectedDay(addDays(addDays(startOfWeek(today), next * 7), dow));
  };

  const resetToToday = () => {
    setWeekOffset(0);
    setSelectedDay(new Date());
  };

  const weekLabel =
    weekOffset === 0
      ? 'This week'
      : `${weekStart.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${addDays(weekStart, 6).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;

  const dayLabel = sameDay(selectedDay, today)
    ? 'Today'
    : selectedDay.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

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

        {/* Week navigator */}
        <View style={styles.weekNav}>
          <Pressable onPress={() => shiftWeek(-1)} style={styles.weekArrow} hitSlop={8}>
            <Ionicons name="chevron-back" size={19} color={colors.sub} />
          </Pressable>
          <Pressable onPress={resetToToday} style={{ alignItems: 'center' }}>
            <T variant="heading">{weekLabel}</T>
            {weekOffset !== 0 && (
              <T variant="caption" style={{ color: colors.accent }}>
                Tap to jump to today
              </T>
            )}
          </Pressable>
          <Pressable onPress={() => shiftWeek(1)} style={styles.weekArrow} hitSlop={8}>
            <Ionicons name="chevron-forward" size={19} color={colors.sub} />
          </Pressable>
        </View>

        {/* Day pills */}
        <View style={styles.dayRow}>
          {weekDays.map((day) => {
            const k = dayKey(day);
            const isSel = sameDay(day, selectedDay);
            const isTod = sameDay(day, today);
            const dueThatDay = daily.filter((r) => existsOnDay(r, k));
            const doneCount = dueThatDay.filter((r) => r.completions?.[k]).length;
            const allDone = dueThatDay.length > 0 && doneCount === dueThatDay.length;
            return (
              <Pressable
                key={k}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayCell,
                  allDone && !isSel && styles.dayCellDone,
                  isSel && styles.dayCellSelected,
                ]}>
                <Text style={[styles.dayName, isSel && styles.dayTextSelected]}>
                  {day.toLocaleDateString([], { weekday: 'narrow' })}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    isTod && !isSel && { color: colors.accent },
                    isSel && styles.dayTextSelected,
                  ]}>
                  {day.getDate()}
                </Text>
                <View style={styles.dotRow}>
                  {dueThatDay.slice(0, 3).map((r) => (
                    <View
                      key={r.id}
                      style={[
                        styles.dot,
                        r.completions?.[k]
                          ? styles.dotDone
                          : k <= todayKey
                            ? styles.dotPending
                            : styles.dotFuture,
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {routines.length === 0 && (
          <EmptyState
            emoji="📆"
            title="No routines yet"
            message={
              pets.length
                ? 'Set up a daily 9 AM feeding or a weekly bath and build a streak.'
                : 'Add a pet first, then build their care schedule here.'
            }
          />
        )}

        {/* Selected day — only routines that existed by then */}
        {daily.filter((r) => existsOnDay(r, selKey)).length > 0 && (
          <>
            <T variant="heading" style={styles.section}>
              {dayLabel}
            </T>
            <View style={{ gap: space(2.5) }}>
              {daily
                .filter((r) => existsOnDay(r, selKey))
                .map((r) => (
                  <RoutineRow key={r.id} routine={r} state={dayState(r)} />
                ))}
            </View>
          </>
        )}

        {/* The viewed week */}
        {weekly.filter((r) => existsInWeek(r, selWeekKey)).length > 0 && (
          <>
            <T variant="heading" style={styles.section}>
              {weekOffset === 0 ? 'Anytime this week' : 'That week'}
            </T>
            <View style={{ gap: space(2.5) }}>
              {weekly
                .filter((r) => existsInWeek(r, selWeekKey))
                .map((r) => (
                  <RoutineRow key={r.id} routine={r} state={weekState(r)} />
                ))}
            </View>
          </>
        )}

        {/* Everything actually logged that day, routines or not */}
        {dayActivities.length > 0 && (
          <>
            <T variant="heading" style={styles.section}>
              Logged {sameDay(selectedDay, today) ? 'today' : 'that day'}
            </T>
            <Card style={{ padding: space(2), gap: 0 }}>
              {dayActivities.map((a, i) => {
                const info = activityInfo(a.type);
                return (
                  <View
                    key={a.id}
                    style={[styles.loggedRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                    <Text style={{ fontSize: 18 }}>{info.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <T variant="body" style={{ fontWeight: '600', fontSize: 14.5 }}>
                        {a.note ?? info.label}
                        {a.routineId ? '  ⭐' : ''}
                      </T>
                      <T variant="caption">
                        {a.petName} · {formatTime(a.loggedAt)}
                      </T>
                    </View>
                    <Text style={styles.loggedXp}>+{a.xp} XP</Text>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {routines.length > 0 && (
          <T variant="caption" style={{ textAlign: 'center', marginTop: space(5) }}>
            Routine check-offs earn 1.5× XP plus streak coins. Long-press one to delete.
          </T>
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
    marginBottom: space(3),
  },
  newButton: {
    minHeight: 40,
    paddingVertical: space(2),
    paddingHorizontal: space(4),
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space(3),
  },
  weekArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    gap: space(1.5),
    marginBottom: space(2),
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space(2.5),
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 3,
  },
  dayCellSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  dayCellDone: {
    backgroundColor: colors.sageSoft,
    borderColor: '#C9DCC5',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.faint,
  },
  dayNum: {
    fontFamily: fonts.displaySemi,
    fontSize: 16,
    color: colors.ink,
  },
  dayTextSelected: {
    color: colors.surface,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  dotDone: {
    backgroundColor: colors.sage,
  },
  dotPending: {
    backgroundColor: colors.lineStrong,
  },
  dotFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.lineStrong,
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
  checkMissed: {
    backgroundColor: colors.dangerSoft,
  },
  checkUpcoming: {
    backgroundColor: colors.surfaceAlt,
  },
  loggedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(2.5),
    paddingVertical: space(2.5),
    paddingHorizontal: space(2),
  },
  loggedXp: {
    fontFamily: fonts.displaySemi,
    fontSize: 13.5,
    color: colors.accentDark,
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
    maxHeight: '88%',
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
