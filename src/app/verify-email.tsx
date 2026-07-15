import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Button, Screen, T } from '@/components/ui';
import { friendlyAuthError, useAuth } from '@/lib/auth-context';
import { colors, space } from '@/theme';

const RESEND_COOLDOWN_MS = 30_000;

/** Hard gate for email/password accounts: no app access until the address is verified. */
export default function VerifyEmailScreen() {
  const { user, reloadUser, resendVerification, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [lastResend, setLastResend] = useState(0);

  const checkVerified = async () => {
    setChecking(true);
    setStatus(null);
    try {
      await reloadUser();
      // If verification landed, the root navigator redirects into the app.
      // If we're still here after the reload, it hasn't.
      setStatus("Not verified yet — tap the link in the email first, then try again.");
    } catch (err) {
      setStatus(friendlyAuthError(err));
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    if (Date.now() - lastResend < RESEND_COOLDOWN_MS) {
      setStatus('Just sent one — give it 30 seconds before resending.');
      return;
    }
    try {
      await resendVerification();
      setLastResend(Date.now());
      setStatus('Verification email sent again. Check spam too!');
    } catch (err) {
      setStatus(friendlyAuthError(err));
    }
  };

  return (
    <Screen style={styles.container} edges={['top', 'bottom']}>
      <Text style={{ fontSize: 60 }}>✉️</Text>
      <T variant="display" style={{ textAlign: 'center' }}>
        Verify your email
      </T>
      <T variant="body" style={{ color: colors.sub, textAlign: 'center' }}>
        We sent a verification link to{'\n'}
        <Text style={{ fontWeight: '700', color: colors.ink }}>{user?.email}</Text>
        {'\n'}Tap it, then come back here.
      </T>

      {status && (
        <T variant="caption" style={{ color: colors.accentDark, textAlign: 'center' }}>
          {status}
        </T>
      )}

      <Button
        title="I've verified — let me in"
        onPress={checkVerified}
        loading={checking}
        style={styles.wide}
      />
      <Button title="Resend email" variant="outline" onPress={resend} style={styles.wide} />
      <Button title="Sign out" variant="ghost" onPress={signOut} style={styles.wide} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space(8),
    gap: space(4),
  },
  wide: {
    alignSelf: 'stretch',
  },
});
