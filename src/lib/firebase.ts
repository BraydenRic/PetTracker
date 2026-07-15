import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { initializeFirestore, type Firestore } from 'firebase/firestore';
import { Platform } from 'react-native';

import { firebaseConfig } from '@/config/firebase-config';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// React Native needs explicit AsyncStorage persistence or sessions vanish on
// every app restart; web gets the default browser persistence from getAuth.
export const auth: Auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

// Auto-detect long polling: RN network stacks often can't hold Firestore's
// default streaming connection, which shows up as silent hangs otherwise.
export const db: Firestore = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});
