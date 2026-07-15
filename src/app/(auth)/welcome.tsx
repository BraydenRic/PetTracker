import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SocialButtons } from '@/components/social-buttons';
import { Button, Divider, Screen, T } from '@/components/ui';
import { isFirebaseConfigured } from '@/config/firebase-config';
import { friendlyAuthError } from '@/lib/auth-context';
import { colors, radius, space } from '@/theme';

/** Gently bobbing pet emoji for the welcome hero. */
function FloatingPet({ emoji, delay, style }: { emoji: string; delay: number; style: object }) {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.Text style={[styles.floatingPet, style, animStyle]}>{emoji}</Animated.Text>;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSocialError = (err: unknown) => {
    const msg = friendlyAuthError(err);
    setError(msg);
    Alert.alert('Sign-in problem', msg);
  };

  return (
    <Screen style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <FloatingPet emoji="🐶" delay={0} style={{ top: 10, left: '10%' }} />
        <FloatingPet emoji="🐱" delay={600} style={{ top: 60, right: '12%' }} />
        <FloatingPet emoji="🦜" delay={1100} style={{ top: 130, left: '22%' }} />
        <FloatingPet emoji="🐰" delay={300} style={{ top: 150, right: '28%' }} />

        <Text style={styles.paw}>🐾</Text>
        <T variant="display" style={styles.wordmark}>
          PetTracker
        </T>
        <T variant="body" style={styles.tagline}>
          Log the walks. Earn the treats.{'\n'}Watch your best friend level up.
        </T>
      </View>

      {!isFirebaseConfigured && (
        <View style={styles.setupBanner}>
          <T variant="label" style={{ color: colors.danger }}>
            Firebase isn't configured yet
          </T>
          <T variant="caption" style={{ color: colors.sub }}>
            Paste real credentials into src/config/firebase-config.ts (instructions inside) —
            sign-in will fail until then.
          </T>
        </View>
      )}

      <View style={{ gap: space(3) }}>
        <SocialButtons onError={onSocialError} />
        <Divider label="or" />
        <Button title="Sign up with email" onPress={() => router.push('/(auth)/sign-up')} />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/sign-in')}
        />
        {error ? (
          <T variant="caption" style={{ color: colors.danger, textAlign: 'center' }}>
            {error}
          </T>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: space(6),
    paddingBottom: space(6),
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingPet: {
    position: 'absolute',
    fontSize: 34,
    opacity: 0.85,
  },
  paw: {
    fontSize: 64,
    marginBottom: space(3),
  },
  wordmark: {
    fontSize: 44,
  },
  tagline: {
    color: colors.sub,
    textAlign: 'center',
    marginTop: space(3),
  },
  setupBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: space(3.5),
    gap: space(1),
    marginBottom: space(4),
  },
});
