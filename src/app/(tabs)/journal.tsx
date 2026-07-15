import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Screen, T } from '@/components/ui';
import { activityInfo } from '@/config/game';
import { useData } from '@/lib/data-context';
import { dayKey, formatDayHeading, formatTime } from '@/lib/dates';
import type { Activity } from '@/lib/models';
import { colors, fonts, radius, space } from '@/theme';

/** Last-7-days XP as a simple bar chart — no chart lib needed. */
function WeekChart({ activities }: { activities: Activity[] }) {
  const days = useMemo(() => {
    const result: { label: string; key: string; xp: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({
        label: d.toLocaleDateString([], { weekday: 'narrow' }),
        key: dayKey(d),
        xp: 0,
      });
    }
    for (const a of activities) {
      const k = dayKey(new Date(a.loggedAt));
      const day = result.find((r) => r.key === k);
      if (day) day.xp += a.xp;
    }
    return result;
  }, [activities]);

  const max = Math.max(...days.map((d) => d.xp), 1);
  const todayKey = dayKey();

  return (
    <Card style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <T variant="heading">This week</T>
        <T variant="caption">{days.reduce((s, d) => s + d.xp, 0)} XP earned</T>
      </View>
      <View style={styles.chartBars}>
        {days.map((d) => (
          <View key={d.key} style={styles.chartCol}>
            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${Math.max((d.xp / max) * 100, d.xp > 0 ? 8 : 3)}%`,
                    backgroundColor: d.key === todayKey ? colors.accent : colors.lineStrong,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.chartLabel,
                d.key === todayKey && { color: colors.accent, fontWeight: '800' },
              ]}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: Activity }) {
  const info = activityInfo(activity.type);
  return (
    <View style={styles.row}>
      <View style={[styles.rowEmoji, { backgroundColor: info.tint }]}>
        <Text style={{ fontSize: 20 }}>{info.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <T variant="body" style={{ fontWeight: '600' }}>
          {activity.note ?? info.label}
          {activity.routineId ? '  ⭐' : ''}
        </T>
        <T variant="caption">
          {activity.petName} · {formatTime(activity.loggedAt)}
        </T>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.rowXp}>+{activity.xp} XP</Text>
        <T variant="caption">+{activity.coins} 🪙</T>
      </View>
    </View>
  );
}

export default function JournalScreen() {
  const { activities } = useData();

  const sections = useMemo(() => {
    const byDay = new Map<string, Activity[]>();
    for (const a of activities) {
      const k = dayKey(new Date(a.loggedAt));
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(a);
    }
    return [...byDay.entries()].map(([key, data]) => ({
      key,
      title: formatDayHeading(key),
      xp: data.reduce((s, a) => s + a.xp, 0),
      data,
    }));
  }, [activities]);

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <T variant="title" style={{ marginBottom: space(4) }}>
              Journal
            </T>
            <WeekChart activities={activities} />
            {activities.length === 0 && (
              <EmptyState
                emoji="📖"
                title="Nothing logged yet"
                message="Every walk, meal and belly rub you log shows up here."
              />
            )}
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <T variant="heading">{section.title}</T>
            <T variant="caption">{section.xp} XP</T>
          </View>
        )}
        renderItem={({ item }) => <ActivityRow activity={item} />}
        stickySectionHeadersEnabled={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(5),
    paddingBottom: space(10),
  },
  chartCard: {
    marginBottom: space(4),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: space(3),
  },
  chartBars: {
    flexDirection: 'row',
    gap: space(2),
    height: 110,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: space(1.5),
  },
  chartTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 11,
    color: colors.faint,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: space(4),
    marginBottom: space(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space(3),
    marginBottom: space(2),
  },
  rowEmoji: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowXp: {
    fontFamily: fonts.displaySemi,
    fontSize: 14.5,
    color: colors.accentDark,
  },
});
