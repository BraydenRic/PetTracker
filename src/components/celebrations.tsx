import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { speciesInfo } from '@/config/game';
import type { LogResult } from '@/lib/actions';
import type { Pet } from '@/lib/models';
import { Button, T } from '@/components/ui';
import { colors, fonts, radius, space } from '@/theme';

/** Small pill that pops up after any log: "+25 XP · +6 coins". */
export function RewardToast({ result }: { result: LogResult | null }) {
  if (!result) return null;
  return (
    <Animated.View
      key={`${result.xpGained}-${Date.now()}`}
      entering={FadeInDown.springify().damping(14)}
      exiting={FadeOutUp.duration(250)}
      style={styles.toast}
      pointerEvents="none">
      <Text style={styles.toastText}>
        +{result.xpGained} XP · +{result.coinsGained} 🪙
      </Text>
    </Animated.View>
  );
}

function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ scale: 0.5 + v.value * 0.8 }],
  }));
  return (
    <Animated.Text style={[{ position: 'absolute', left: x, top: y, fontSize: 22 }, style]}>
      ✨
    </Animated.Text>
  );
}

/** Full-screen moment when a pet levels up — this is the payoff loop, make it feel earned. */
export function LevelUpModal({
  pet,
  result,
  onClose,
}: {
  pet: Pet;
  result: LogResult;
  onClose: () => void;
}) {
  const pop = useSharedValue(0);
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    pop.value = withSpring(1, { damping: 12, stiffness: 120 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    opacity: pop.value,
  }));

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.levelCard, cardStyle]}>
          <Sparkle delay={0} x={26} y={30} />
          <Sparkle delay={350} x={230} y={48} />
          <Sparkle delay={650} x={48} y={150} />
          <Sparkle delay={200} x={240} y={180} />

          <Text style={{ fontSize: 15, letterSpacing: 3, color: colors.accent, fontWeight: '800' }}>
            LEVEL UP
          </Text>
          <Text style={{ fontSize: 72, marginVertical: space(2) }}>
            {speciesInfo(pet.species).emoji}
          </Text>
          <T variant="display" style={{ fontSize: 42 }}>
            Level {result.newLevel}
          </T>
          <T variant="body" style={{ color: colors.sub, textAlign: 'center', marginTop: space(1) }}>
            {pet.name} is growing up! You earned a{' '}
            <Text style={{ fontWeight: '700', color: colors.ink }}>
              +{result.coinsGained} 🪙
            </Text>{' '}
            haul.
          </T>
          <Button title="Keep going" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: space(5) }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: space(4),
    alignSelf: 'center',
    backgroundColor: colors.ink,
    borderRadius: 999,
    paddingHorizontal: space(4.5),
    paddingVertical: space(2.5),
    zIndex: 50,
  },
  toastText: {
    color: colors.goldSoft,
    fontFamily: fonts.displaySemi,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(6),
  },
  levelCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space(7),
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
