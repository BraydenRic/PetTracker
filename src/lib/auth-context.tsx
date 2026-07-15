import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { STARTING_COINS } from '@/config/game';
import { deleteAllUserData } from '@/lib/actions';
import { getAppleFirebaseCredential } from '@/lib/apple-credential';
import { auth, db } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  initializing: boolean;
  /** Email/password accounts must verify before entering the app; OAuth accounts are pre-verified. */
  needsVerification: boolean;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  /** Updates the display name on both the auth profile and the Firestore profile doc. */
  updateDisplayName: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Permanently deletes the account and all its data (App Store 5.1.1).
   * Firebase requires fresh credentials: password users pass their password,
   * Apple users re-confirm through the native sheet. Resolves false if they
   * dismissed that sheet (nothing deleted).
   */
  deleteAccount: (password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Creates users/{uid} on first sign-in (any provider) so the rest of the app
 * can assume a profile doc always exists. */
export async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName,
      coins: STARTING_COINS,
      activePetId: null,
      ownedItemIds: [],
      createdAt: Date.now(),
      serverCreatedAt: serverTimestamp(),
    });
    return;
  }
  // Profile docs left over from the old Flutter app are missing the coin
  // economy fields — backfill defaults so the account works in the new app.
  const data = snap.data();
  const patch: Record<string, unknown> = {};
  if (typeof data.coins !== 'number') patch.coins = STARTING_COINS;
  if (data.activePetId === undefined) patch.activePetId = null;
  // Email sign-up creates this doc before updateProfile attaches the name
  // (onAuthStateChanged races the sign-up flow) — sync it once it exists.
  if (!data.displayName && user.displayName) patch.displayName = user.displayName;
  if (!data.email && user.email) patch.email = user.email;
  if (Object.keys(patch).length) await setDoc(ref, patch, { merge: true });
}

const passwordProvider = (user: User) =>
  user.providerData.some((p) => p.providerId === 'password');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) await ensureUserDoc(u).catch(() => {});
      setUser(u);
      setInitializing(false);
    });
    return unsub;
  }, []);

  const signUpWithEmail = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: name.trim() });
    await ensureUserDoc(cred.user);
    await sendEmailVerification(cred.user);
    // Refresh local state so displayName + verification gate pick up immediately.
    setUser({ ...cred.user } as User);
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const resendVerification = useCallback(async () => {
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
  }, []);

  const reloadUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(auth.currentUser ? ({ ...auth.currentUser } as User) : null);
  }, []);

  const updateDisplayName = useCallback(async (name: string) => {
    const current = auth.currentUser;
    const trimmed = name.trim();
    if (!current || !trimmed) return;
    await updateProfile(current, { displayName: trimmed });
    // The home screen greets from the Firestore profile doc — keep it in sync.
    await setDoc(doc(db, 'users', current.uid), { displayName: trimmed }, { merge: true });
    // updateProfile mutates currentUser without re-emitting onAuthStateChanged,
    // so hand React a fresh object to trigger a re-render.
    setUser({ ...current, displayName: trimmed } as User);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  const deleteAccount = useCallback(async (password?: string): Promise<boolean> => {
    const current = auth.currentUser;
    if (!current) throw new Error('No signed-in account.');
    // Firebase refuses to delete stale sessions; re-verify identity first so
    // the data wipe never runs unless the account deletion can follow.
    const providers = current.providerData.map((p) => p.providerId);
    if (providers.includes('password')) {
      if (!current.email) throw new Error('No email on this account.');
      await reauthenticateWithCredential(
        current,
        EmailAuthProvider.credential(current.email, password ?? ''),
      );
    } else if (providers.includes('apple.com')) {
      const cred = await getAppleFirebaseCredential();
      if (!cred) return false; // dismissed the Apple sheet — abort untouched
      await reauthenticateWithCredential(current, cred);
    }
    // Google sessions fall through without reauth; if Firebase rejects the
    // delete as stale, the caller surfaces a "sign out and back in" message.
    await deleteAllUserData(current.uid);
    await deleteUser(current);
    return true;
  }, []);

  const needsVerification = !!user && passwordProvider(user) && !user.emailVerified;

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        needsVerification,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        resendVerification,
        reloadUser,
        updateDisplayName,
        signOut,
        deleteAccount,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Firebase error codes → copy a human would actually want to read. */
export function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return "That email address doesn't look right.";
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return "Email or password doesn't match. Try again or reset your password.";
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Passwords need at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts — wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'Network trouble. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    default:
      return (err as Error)?.message?.replace(/^Firebase: /, '') ?? 'Something went wrong.';
  }
}
