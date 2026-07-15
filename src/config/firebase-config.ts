/**
 * Firebase web-app credentials for project `pettracker-682e8`.
 *
 * These are NOT secrets — Firebase web config is safe to commit; security comes
 * from Firestore rules + Auth. To fill in real values run:
 *
 *   npx firebase-tools login --reauth
 *   npx firebase-tools apps:sdkconfig WEB --project pettracker-682e8
 *
 * (If no web app exists yet: `npx firebase-tools apps:create WEB PetTracker --project pettracker-682e8`)
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyCXUiKLL1C-aRaPrR0lyA99Kr3_7-GgfTw',
  authDomain: 'pettracker-682e8.firebaseapp.com',
  projectId: 'pettracker-682e8',
  storageBucket: 'pettracker-682e8.firebasestorage.app',
  messagingSenderId: '308784679328',
  appId: '1:308784679328:web:e64ce3a5bcc2279a327cc5',
};

/** True once real credentials are pasted in — the auth screens check this and
 * show setup instructions instead of confusing network errors when it's false. */
export const isFirebaseConfigured = !Object.values(firebaseConfig).includes('REPLACE_ME');
