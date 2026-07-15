import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { GOOGLE_AUTH, isGoogleAuthConfigured } from '@/config/auth-config';
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
 * Uses a hashed nonce so Firebase can verify the identity token wasn't replayed.
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
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const appleCred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!appleCred.identityToken) throw new Error('Apple sign-in returned no token');
      const provider = new OAuthProvider('apple.com');
      const cred = provider.credential({
        idToken: appleCred.identityToken,
        rawNonce,
      });
      const result = await signInWithCredential(auth, cred);
      await ensureUserDoc(result.user);
    } catch (err) {
      // User backing out of the Apple sheet isn't an error worth surfacing.
      if ((err as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') onError(err);
    } finally {
      setBusy(false);
    }
  };

  return { available, busy, signIn };
}
