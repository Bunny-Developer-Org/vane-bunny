import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (__DEV__ && !firebaseConfig.apiKey) {
  console.warn(
    'Missing Firebase config. Copy .env.example to .env and fill in your Firebase project values.'
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createAuth(): Auth {
  // Web uses the default browser persistence; native needs AsyncStorage wired in explicitly.
  if (Platform.OS === 'web') {
    return getAuth(firebaseApp);
  }
  return initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export const auth = createAuth();
export const db = getFirestore(firebaseApp);

// Local development against `firebase emulators:start`, opt-in via env var.
// Android emulators can't reach the host machine over `localhost`.
if (process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}
