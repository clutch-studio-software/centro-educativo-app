import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, writeBatch } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const FIRESTORE_BATCH_LIMIT = 450;

/**
 * Sanitiza texto externo o de CLI antes de imprimirlo en logs para prevenir Log Injection.
 */
export function sanitizeForLog(value, maxLength = 300) {
  return String(value ?? '')
    .replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Lee y parsea las variables del archivo .env en la raíz del proyecto.
 */
export function loadEnvVars() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Archivo .env no encontrado en ${envPath}`);
  }

  const envVars = {};
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
  return envVars;
}

/**
 * Inicializa Firebase Web SDK y autentica con la cuenta de administrador configurada en .env.
 */
export async function initAdminFirebaseClient() {
  const envVars = loadEnvVars();
  const adminEmail = envVars.VITE_ADMIN_EMAIL;
  const adminKey =
    envVars.ADMIN_PASSWORD ||
    envVars.VITE_DEV_ADMIN_KEY ||
    envVars.VITE_ADMIN_PASSWORD;

  if (!adminEmail || !adminKey) {
    throw new Error(
      'Faltan credenciales de administrador (VITE_ADMIN_EMAIL / VITE_DEV_ADMIN_KEY) en .env.'
    );
  }

  const app = initializeApp({
    apiKey: envVars.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Iniciando sesión como administrador (${adminEmail})...`);
  const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
  console.log(`Autenticado exitosamente. UID Admin: ${userCred.user.uid}\n`);

  return { app, auth, db, userCred };
}

/**
 * Ejecuta operaciones en Firestore divididas en lotes de hasta 450 escrituras en paralelo.
 */
export async function commitInBatches(db, items, applyFn) {
  const promises = [];
  for (let i = 0; i < items.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const item of items.slice(i, i + FIRESTORE_BATCH_LIMIT)) {
      applyFn(batch, item);
    }
    promises.push(batch.commit());
  }
  await Promise.all(promises);
}
