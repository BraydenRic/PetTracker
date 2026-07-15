import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SocialButtons } from '@/components/social-buttons';
import { Button, Divider, Field, FormScroll, Screen, T } from '@/components/ui';
import { friendlyAuthError, useAuth } from '@/lib/auth-context';
import { colors, space } from '@/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError('Tell us your name so we can say hi.');
    if (!email.trim()) return setError('An email address is required.');
    if (password.length < 6) return setError('Passwords need at least 6 characters.');
    if (password !== confirm) return setError("Those passwords don't match.");

    setBusy(true);
    setError(null);
    try {
      await signUpWithEmail(name, email, password);
      // Root navigator sends new accounts to the verify-email gate.
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
          <T variant="display">Join the pack</T>
          <T variant="body" style={{ color: colors.sub, marginTop: space(1.5) }}>
            One account, every pet, all their adventures.
          </T>

          <View style={{ gap: space(4), marginTop: space(6) }}>
            <Field
              label="YOUR NAME"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              placeholder="Brayden"
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
            <Field
              label="CONFIRM PASSWORD"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoComplete="new-password"
              placeholder="Same one again"
              error={error}
            />
            <Button title="Create account" onPress={submit} loading={busy} />
            <T variant="caption" style={{ textAlign: 'center', color: colors.faint }}>
              We'll send a verification email before you can start logging.
            </T>
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
