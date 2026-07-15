import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Field, FormScroll, Screen, T } from '@/components/ui';
import { friendlyAuthError, useAuth } from '@/lib/auth-context';
import { colors, space } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return setError('Enter the email you signed up with.');
    setBusy(true);
    setError(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Screen style={styles.centered} edges={['top', 'bottom']}>
        <Text style={{ fontSize: 56 }}>📬</Text>
        <T variant="title" style={{ textAlign: 'center' }}>
          Check your inbox
        </T>
        <T variant="body" style={{ color: colors.sub, textAlign: 'center' }}>
          We sent a password reset link to{'\n'}
          <Text style={{ fontWeight: '700', color: colors.ink }}>{email.trim()}</Text>
        </T>
        <T variant="caption" style={{ color: colors.accentDark, textAlign: 'center' }}>
          Check your spam folder if it doesn't show up in a minute.
        </T>
        <Button
          title="Back to sign in"
          onPress={() => router.replace('/(auth)/sign-in')}
          style={{ alignSelf: 'stretch', marginTop: space(4) }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <FormScroll contentStyle={styles.content}>
        <Button title="‹ Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <T variant="display">Reset password</T>
        <T variant="body" style={{ color: colors.sub, marginTop: space(1.5) }}>
          Happens to the best of us. We'll email you a reset link.
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
            error={error}
          />
          <Button title="Send reset link" onPress={submit} loading={busy} />
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(8),
    gap: space(3),
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: space(4),
  },
});
