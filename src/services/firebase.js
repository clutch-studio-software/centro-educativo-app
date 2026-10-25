import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof globalThis !== 'undefined' && globalThis.process?.env
    ? globalThis.process.env
    : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    'centro-educativo-f5cc5.firebaseapp.com',
  projectId:
    env.VITE_FIREBASE_PROJECT_ID || 'centro-educativo-f5cc5',
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    'centro-educativo-f5cc5.appspot.com',
  messagingSenderId:
    env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender-id',
  appId: env.VITE_FIREBASE_APP_ID || 'dummy-app-id',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// COMENTADO PARA CONECTAR A LA NUBE REAL:
// if (import.meta.env.DEV || window.location.hostname === 'localhost') {
//   console.log("Conectando a Emuladores locales de Firebase (Auth port 9099, Firestore port 8080)...");
//   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//   connectFirestoreEmulator(db, '127.0.0.1', 8080);
// }
