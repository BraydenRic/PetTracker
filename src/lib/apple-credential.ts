import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, type AuthCredential } from 'firebase/auth';

/**
 * Runs the native Apple sign-in sheet and converts the result into a Firebase
 * credential. Used both for initial sign-in and for re-verifying identity
 * before account deletion. Resolves null if the user dismissed the sheet.
 * The hashed nonce proves to Firebase the token wasn't replayed.
 */
export async function getAppleFirebaseCredential(): Promise<AuthCredential | null> {
  try {
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
    if (!appleCred.identityToken) return null;
    return new OAuthProvider('apple.com').credential({
      idToken: appleCred.identityToken,
      rawNonce,
    });
  } catch (err) {
    if ((err as { code?: string })?.code === 'ERR_REQUEST_CANCELED') return null;
    throw err;
  }
}
