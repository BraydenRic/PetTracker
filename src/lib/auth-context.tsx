import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Creates users/{uid} on first sign-in (any provider) so the rest of the app
 * can assume a profile doc always exists. */
export async function ensureUserDoc(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    email: user.email,
    displayName: user.displayName,
    coins: STARTING_COINS,
    activePetId: null,
    ownedItemIds: [],
    createdAt: Date.now(),
    serverCreatedAt: serverTimestamp(),
  });
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

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
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
        signOut,
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
