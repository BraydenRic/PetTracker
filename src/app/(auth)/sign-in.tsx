import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SocialButtons } from '@/components/social-buttons';
import { Button, Divider, Field, FormScroll, Screen, T } from '@/components/ui';
import { friendlyAuthError, useAuth } from '@/lib/auth-context';
import { colors, space } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      // Root navigator redirects once auth state lands.
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
          <Button title="‹ Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
          <T variant="display">Welcome back</T>
          <T variant="body" style={{ color: colors.sub, marginTop: space(1.5) }}>
            Your pets missed you.
          </T>

          <View style={{ gap: space(4), marginTop: space(7) }}>
            <Field
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <Field
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="••••••••"
              error={error}
            />
            <Button title="Sign in" onPress={submit} loading={busy} />
            <Button
              title="Forgot your password?"
              variant="ghost"
              onPress={() => router.push('/(auth)/forgot-password')}
            />
            <Divider label="or" />
            <SocialButtons onError={(err) => setError(friendlyAuthError(err))} />
          </View>
      </FormScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: space(6),
    paddingTop: space(2),
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: space(4),
  },
});
