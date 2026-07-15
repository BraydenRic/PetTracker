import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui';
import { useAppleSignIn, useGoogleSignIn } from '@/lib/use-social-auth';
import { colors, space } from '@/theme';

/** Apple + Google buttons, each hidden automatically when unavailable
 * (Apple on Android/web, Google until client IDs are configured). */
export function SocialButtons({ onError }: { onError: (err: unknown) => void }) {
  const apple = useAppleSignIn(onError);
  const google = useGoogleSignIn(onError);

  if (!apple.available && !google.available) return null;

  return (
    <View style={{ gap: space(3) }}>
      {apple.available && (
        <Button
          title="Continue with Apple"
          variant="ink"
          loading={apple.busy}
          icon={<Ionicons name="logo-apple" size={20} color={colors.surface} />}
          onPress={apple.signIn}
        />
      )}
      {google.available && (
        <Button
          title="Continue with Google"
          variant="outline"
          loading={google.busy}
          disabled={!google.ready}
          icon={<Ionicons name="logo-google" size={18} color={colors.ink} />}
          onPress={google.signIn}
        />
      )}
    </View>
  );
}
