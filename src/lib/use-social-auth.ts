import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { GOOGLE_AUTH, isGoogleAuthConfigured } from '@/config/auth-config';
import { getAppleFirebaseCredential } from '@/lib/apple-credential';
import { ensureUserDoc } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

// Completes any pending browser auth session (no-op on native).
WebBrowser.maybeCompleteAuthSession();

/**
 * Google sign-in via expo-auth-session → Firebase credential exchange.
 * Works in Expo Go once client IDs are configured in auth-config.ts.
 */
export function useGoogleSignIn(onError: (err: unknown) => void) {
  const [busy, setBusy] = useState(false);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_AUTH.webClientId || undefined,
    iosClientId: GOOGLE_AUTH.iosClientId || undefined,
    androidClientId: GOOGLE_AUTH.androidClientId || undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params.id_token;
      setBusy(true);
      signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
        .then((cred) => ensureUserDoc(cred.user))
        .catch(onError)
        .finally(() => setBusy(false));
    } else if (response.type === 'error') {
      onError(response.error ?? new Error('Google sign-in failed'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return {
    available: isGoogleAuthConfigured,
    busy,
    ready: !!request,
    signIn: () => promptAsync(),
  };
}

/**
 * Native Apple sign-in (iOS only; supported inside Expo Go).
 * Credential creation lives in apple-credential.ts so account deletion can
 * reuse it for re-verification.
 */
export function useAppleSignIn(onError: (err: unknown) => void) {
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAvailable).catch(() => setAvailable(false));
  }, []);

  const signIn = async () => {
    try {
      setBusy(true);
      const cred = await getAppleFirebaseCredential();
      if (!cred) return; // user dismissed the sheet
      const result = await signInWithCredential(auth, cred);
      await ensureUserDoc(result.user);
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return { available, busy, signIn };
}
