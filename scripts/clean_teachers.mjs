import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Cargar variables de entorno desde .env
const envPath = path.join(projectRoot, '.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: Archivo .env no encontrado en', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx !== -1) {
    envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
}

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getFunctionsBaseUrl = () => {
  const envUrl = envVars.VITE_FUNCTIONS_BASE_URL;
  if (envUrl) {
    return envUrl.trim().replace(/[\u200B-\u200D\u2060\u202F\uFEFF]/g, '').replace(/\/?$/, '/');
  }
  return 'https://us-central1-centro-educativo-f5cc5.cloudfunctions.net/';
};

async function callCloudFunction(endpoint, payload, token) {
  const baseUrl = getFunctionsBaseUrl();
  const cleanEndpoint = String(endpoint).replace(/^\//, '');

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json().catch(() => ({}));
}

async function cleanTeachers() {
  console.log('===============================================================');
  console.log('  LIMPIEZA DE DOCENTES/PROFESORES (FIRESTORE & FIREBASE AUTH)');
  console.log('===============================================================\n');

  // Iniciar sesión como administrador
  const adminEmail = envVars.VITE_ADMIN_EMAIL;
  const adminKey = envVars.ADMIN_PASSWORD || envVars.VITE_DEV_ADMIN_KEY || envVars.VITE_ADMIN_PASSWORD;

  if (!adminEmail || !adminKey) {
    throw new Error('Faltan credenciales de administrador en el archivo .env.');
  }

  console.log(`Iniciando sesión como administrador (${adminEmail})...`);
  const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
  const token = await userCred.user.getIdToken(true);
  console.log(`Autenticado exitosamente. UID Admin: ${userCred.user.uid}\n`);

  // Obtener todos los usuarios de la colección 'users'
  console.log('Consultando usuarios docentes en Firestore...');
  const usersSnap = await getDocs(collection(db, 'users'));
  const teachersToDelete = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();

    // FILTRO DE SEGURIDAD ESTRICTO: NUNCA tocar directivos ni administradores
    const isProtected =
      data.role === 'user_admin' ||
      data.role === 'Directivo' ||
      data.email === adminEmail ||
      docSnap.id === userCred.user.uid;

    if (isProtected) {
      continue;
    }

    // Identificar docentes por rol o campos distintivos
    const isTeacher =
      data.role === 'Staff' ||
      data.role === 'teacher' ||
      data.role === 'Docente' ||
      data.rol === 'Docente' ||
      (data.legajo && String(data.legajo).includes('DOC'));

    if (isTeacher) {
      teachersToDelete.push({
        id: docSnap.id,
        email: data.email,
        nombre: data.nombreCompleto || data.nombre || 'Docente sin nombre',
        legajo: data.legajo || 'Sin legajo',
        especialidad: data.especialidad || 'General',
      });
    }
  }

  console.log(`Se encontraron ${teachersToDelete.length} docentes para eliminar.\n`);

  if (teachersToDelete.length === 0) {
    console.log('No se encontraron docentes para eliminar.');
    process.exit(0);
  }

  let deletedAuthCount = 0;
  let deletedFirestoreOnlyCount = 0;

  for (let i = 0; i < teachersToDelete.length; i++) {
    const teacher = teachersToDelete[i];
    console.log(`[${i + 1}/${teachersToDelete.length}] Eliminando docente: ${teacher.nombre} (${teacher.legajo}) - ${teacher.email}...`);

    let deletedViaCf = false;
    try {
      await callCloudFunction(
        'cf_updateUserProfile',
        {
          targetId: teacher.id,
          targetType: 'administrative',
          fields: {
            deleteUser: true,
            _action: 'delete',
            email: teacher.email,
          },
        },
        token
      );
      deletedViaCf = true;
      deletedAuthCount++;
    } catch (cfErr) {
      console.warn(`   Aviso CF (Auth): ${cfErr.message}. Procediendo con borrado directo en Firestore.`);
    }

    if (!deletedViaCf) {
      try {
        await deleteDoc(doc(db, 'users', teacher.id));
        deletedFirestoreOnlyCount++;
      } catch (docErr) {
        console.error(`   Error al eliminar documento ${teacher.id}:`, docErr.message);
      }
    }
  }

  console.log('\n===============================================================');
  console.log('  RESUMEN DE VACIADO DE DOCENTES:');
  console.log(`  - Docentes eliminados de Auth y Firestore: ${deletedAuthCount}`);
  if (deletedFirestoreOnlyCount > 0) {
    console.log(`  - Docentes eliminados solo de Firestore: ${deletedFirestoreOnlyCount}`);
  }
  console.log('  ¡Limpieza de docentes completada con éxito!');
  console.log('===============================================================\n');

  process.exit(0);
}

cleanTeachers().catch((err) => {
  console.error('\nError fatal durante el vaciado de docentes:', err);
  process.exit(1);
});
