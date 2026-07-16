import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { VectorPet } from '@/components/pet-art';
import { speciesInfo, USE_VECTOR_PETS } from '@/config/game';
import { DEFAULT_BACKDROP, shopItem, type BackdropItem } from '@/config/shop';
import type { Pet } from '@/lib/models';
import { colors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_WIDTH = 7;

/** Floating heart spawned when the pet is petted. */
function Heart({ offsetX, onDone }: { offsetX: number; onDone: () => void }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
    const t = setTimeout(onDone, 950);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -70 * progress.value },
      { translateX: offsetX * progress.value },
      { scale: 0.8 + 0.5 * progress.value },
    ],
  }));
  return (
    <Animated.Text style={[styles.heart, style]} pointerEvents="none">
      ❤️
    </Animated.Text>
  );
}

/**
 * The pet itself: backdrop scene + emoji pet + equipped accessories, wrapped in
 * an animated XP progress ring. Tapping gives it a little pet (wiggle + hearts).
 */
export function PetAvatar({
  pet,
  xpPct,
  size = 190,
  interactive = true,
}: {
  pet: Pet;
  /** 0..1 progress toward the next level, drawn as the surrounding ring. */
  xpPct: number;
  size?: number;
  interactive?: boolean;
}) {
  const species = speciesInfo(pet.species);
  const backdrop: BackdropItem =
    (pet.backdropId ? (shopItem(pet.backdropId) as BackdropItem) : null) ?? DEFAULT_BACKDROP;

  const headwear = pet.equipped?.headwear ? shopItem(pet.equipped.headwear) : null;
  const eyewear = pet.equipped?.eyewear ? shopItem(pet.equipped.eyewear) : null;
  const neckwear = pet.equipped?.neckwear ? shopItem(pet.equipped.neckwear) : null;
  const companion = pet.equipped?.companion ? shopItem(pet.equipped.companion) : null;

  const inner = size - RING_WIDTH * 4;
  const r = (size - RING_WIDTH) / 2;
  const circumference = 2 * Math.PI * r;

  // Slow breathing loop so the pet always feels alive.
  const breathe = useSharedValue(1);
  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wiggle = useSharedValue(0);
  const petStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }, { rotate: `${wiggle.value}deg` }],
  }));

  // Ring animates smoothly whenever XP changes.
  const ringPct = useSharedValue(xpPct);
  useEffect(() => {
    ringPct.value = withSpring(xpPct, { damping: 18, stiffness: 90 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xpPct]);
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - ringPct.value),
  }));

  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  const onPet = () => {
    if (!interactive) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    wiggle.value = withSequence(
      withTiming(-6, { duration: 70 }),
      withTiming(6, { duration: 90 }),
      withTiming(-4, { duration: 80 }),
      withTiming(0, { duration: 70 }),
    );
    const id = Date.now();
    setHearts((h) => [...h, { id, x: Math.random() * 60 - 30 }]);
  };

  return (
    <Pressable onPress={onPet} style={{ width: size, height: size }}>
      {/* XP ring */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.line}
          strokeWidth={RING_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={RING_WIDTH}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference}`}
          animatedProps={ringProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Backdrop scene */}
      <View style={[styles.scene, { width: inner, height: inner, borderRadius: inner / 2, margin: RING_WIDTH * 2 }]}>
        <LinearGradient colors={backdrop.colors} style={StyleSheet.absoluteFill} />
        <Text style={[styles.decor, { top: '12%', left: '14%', fontSize: inner * 0.11 }]}>
          {backdrop.decor}
        </Text>
        <Text style={[styles.decor, { top: '22%', right: '12%', fontSize: inner * 0.08 }]}>
          {backdrop.decor}
        </Text>

        {/* The pet + its outfit move together */}
        <Animated.View style={[styles.petWrap, petStyle]}>
          {USE_VECTOR_PETS ? (
            <VectorPet species={pet.species} equipped={pet.equipped} size={inner * 0.84} />
          ) : (
            // Legacy emoji avatar — kept as the instant fallback for the
            // vector-art experiment (USE_VECTOR_PETS in config/game.ts).
            <>
              {neckwear && (
                <Text style={[styles.gear, { bottom: inner * 0.02, fontSize: inner * 0.18, zIndex: 3 }]}>
                  {'emoji' in neckwear ? neckwear.emoji : ''}
                </Text>
              )}
              <Text style={{ fontSize: inner * 0.42, lineHeight: inner * 0.5 }}>{species.emoji}</Text>
              {headwear && (
                <Text style={[styles.gear, { top: -inner * 0.115, fontSize: inner * 0.2, zIndex: 3 }]}>
                  {'emoji' in headwear ? headwear.emoji : ''}
                </Text>
              )}
              {eyewear && (
                <Text style={[styles.gear, { top: inner * 0.13, fontSize: inner * 0.155, zIndex: 4 }]}>
                  {'emoji' in eyewear ? eyewear.emoji : ''}
                </Text>
              )}
            </>
          )}
        </Animated.View>

        {companion && (
          <Text style={[styles.decor, { bottom: '10%', right: '13%', fontSize: inner * 0.16, opacity: 1 }]}>
            {'emoji' in companion ? companion.emoji : ''}
          </Text>
        )}
      </View>

      {hearts.map((h) => (
        <Heart key={h.id} offsetX={h.x} onDone={() => setHearts((cur) => cur.filter((c) => c.id !== h.id))} />
      ))}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scene: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(43,33,24,0.08)',
  },
  petWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gear: {
    position: 'absolute',
    textAlign: 'center',
  },
  decor: {
    position: 'absolute',
    opacity: 0.65,
  },
  heart: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    fontSize: 26,
  },
});
