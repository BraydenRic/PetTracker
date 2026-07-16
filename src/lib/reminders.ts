/**
 * Local routine reminders. iOS shows these even when the app is closed; no
 * push server involved, so everything works in Expo Go. The whole schedule is
 * rebuilt from scratch whenever routines or preferences change (declarative
 * beats bookkeeping individual notification ids).
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { formatTimeOfDay } from '@/lib/dates';
import type { ReminderPrefs, Routine } from '@/lib/models';

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = { enabled: false, offsetMinutes: 0 };

/** Timing choices shown in Profile. Negative = before the routine's time. */
export const REMINDER_OFFSETS: { value: number; label: string }[] = [
  { value: -30, label: '30 min early' },
  { value: -15, label: '15 min early' },
  { value: 0, label: 'On time' },
  { value: 15, label: '15 min after' },
  { value: 30, label: '30 min after' },
];

/** iOS silently drops local notifications past 64 pending; leave headroom. */
const MAX_SCHEDULED = 60;

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

const bodyFor = (offsetMinutes: number, timeOfDay: string): string => {
  const time = formatTimeOfDay(timeOfDay);
  if (offsetMinutes < 0) return `Coming up at ${time} — ${-offsetMinutes} minutes to go.`;
  if (offsetMinutes > 0) return `Was set for ${time} — still time to check it off!`;
  return `It's ${time} — time to check this off!`;
};

/**
 * Rebuild the device's reminder schedule. Only daily-frequency routines with a
 * set time can be scheduled (weekly ones have no fixed day to fire on).
 */
export async function syncReminders(routines: Routine[], prefs: ReminderPrefs): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!prefs.enabled) return;
  // Permission may have been revoked in iOS Settings since it was granted.
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  let budget = MAX_SCHEDULED;

  for (const routine of routines) {
    if (routine.frequency !== 'daily' || !routine.timeOfDay) continue;

    const [h, m] = routine.timeOfDay.split(':').map(Number);
    // Apply the offset; crossing midnight shifts which weekday should fire.
    let total = h * 60 + m + prefs.offsetMinutes;
    let dayShift = 0;
    if (total < 0) {
      total += 1440;
      dayShift = -1;
    } else if (total >= 1440) {
      total -= 1440;
      dayShift = 1;
    }
    const hour = Math.floor(total / 60);
    const minute = total % 60;

    const content = {
      title: `🐾 ${routine.title}`,
      body: bodyFor(prefs.offsetMinutes, routine.timeOfDay),
    };

    const days = routine.days?.length ? routine.days : null;
    if (!days) {
      if (budget-- <= 0) return;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
      });
    } else {
      for (const d of days) {
        if (budget-- <= 0) return;
        // Our days are Mon=0..Sun=6; expo weekdays are 1=Sunday..7=Saturday.
        const shifted = (((d + dayShift) % 7) + 7) % 7;
        const weekday = shifted === 6 ? 1 : shifted + 2;
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
        });
      }
    }
  }
}
