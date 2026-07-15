import type { RoutineFrequency } from '@/lib/models';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time day key, e.g. "2026-07-15". */
export const dayKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** ISO-8601 week key, e.g. "2026-W29" — weeks start Monday. */
export const weekKey = (d: Date = new Date()): string => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // Shift to the Thursday of this week; its year is the ISO week-year.
  const dow = (date.getDay() + 6) % 7; // Mon=0 .. Sun=6
  date.setDate(date.getDate() - dow + 3);
  const isoYear = date.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const week = 1 + Math.round(((date.getTime() - jan4.getTime()) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
  return `${isoYear}-W${pad(week)}`;
};

export const periodKey = (freq: RoutineFrequency, d: Date = new Date()): string =>
  freq === 'daily' ? dayKey(d) : weekKey(d);

/** Key of the period immediately before the current one (for streak continuity). */
export const previousPeriodKey = (freq: RoutineFrequency, d: Date = new Date()): string => {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - (freq === 'daily' ? 1 : 7));
  return periodKey(freq, prev);
};

export const isToday = (ts: number): boolean => dayKey(new Date(ts)) === dayKey();

/** Midnight local time (weeks start Monday, matching weekKey's ISO weeks). */
export const startOfWeek = (d: Date): Date => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (date.getDay() + 6) % 7; // Mon=0 .. Sun=6
  date.setDate(date.getDate() - dow);
  return date;
};

export const addDays = (d: Date, n: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

export const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** ISO weekday index: Mon=0 .. Sun=6 (matches Routine.days and startOfWeek). */
export const isoDow = (d: Date): number => (d.getDay() + 6) % 7;

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Is this routine scheduled to happen on the given date? */
export const isScheduledOn = (
  routine: { frequency: RoutineFrequency; days?: number[] | null },
  d: Date,
): boolean =>
  routine.frequency === 'weekly' ||
  !routine.days?.length ||
  routine.days.includes(isoDow(d));

/**
 * The period key a streak must have hit to continue: previous week for weekly
 * routines, otherwise the most recent *scheduled* day before `from` — so a
 * Mon/Wed/Fri routine completed Wednesday continues a streak from Monday.
 */
export const previousScheduledKey = (
  routine: { frequency: RoutineFrequency; days?: number[] | null },
  from: Date = new Date(),
): string => {
  if (routine.frequency === 'weekly') return previousPeriodKey('weekly', from);
  const days = routine.days?.length ? routine.days : [0, 1, 2, 3, 4, 5, 6];
  for (let i = 1; i <= 7; i++) {
    const d = addDays(from, -i);
    if (days.includes(isoDow(d))) return dayKey(d);
  }
  return dayKey(addDays(from, -1));
};

export const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

/** "09:00" → "9:00 AM" (localized). */
export const formatTimeOfDay = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const formatDayHeading = (key: string): string => {
  if (key === dayKey()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === dayKey(yesterday)) return 'Yesterday';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};
