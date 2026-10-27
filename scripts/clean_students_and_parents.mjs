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
  writeBatch,
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

async function cleanStudentsAndParents() {
  console.log('===============================================================');
  console.log('  LIMPIEZA DE ALUMNOS Y PADRES (FIRESTORE & FIREBASE AUTH)');
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

  // 1. Obtener y eliminar todos los estudiantes de la colección 'students'
  console.log('--- 1. Eliminando estudiantes de la colección "students" ---');
  const studentsSnap = await getDocs(collection(db, 'students'));
  const totalStudents = studentsSnap.docs.length;
  console.log(`Se encontraron ${totalStudents} estudiantes en Firestore.`);

  if (totalStudents > 0) {
    const BATCH_SIZE = 300;
    for (let i = 0; i < totalStudents; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = studentsSnap.docs.slice(i, i + BATCH_SIZE);
      chunk.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();
      console.log(`  Eliminados ${Math.min(i + BATCH_SIZE, totalStudents)}/${totalStudents} alumnos...`);
    }
    console.log('✔ Todos los documentos de estudiantes fueron eliminados.\n');
  } else {
    console.log('No había alumnos registrados.\n');
  }

  // 2. Obtener y eliminar usuarios con rol 'Padre'
  console.log('--- 2. Eliminando usuarios tutores (rol "Padre") ---');
  const usersSnap = await getDocs(collection(db, 'users'));
  const parentUsers = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    const isParentRole =
      data.role === 'Padre' ||
      data.role === 'padre' ||
      data.rol === 'Padre' ||
      (Array.isArray(data.studentIds) && data.studentIds.length > 0 && data.role !== 'user_admin');

    // FILTRO DE SEGURIDAD ESTRICTO: no tocar bajo ninguna circunstancia administradores ni directivos
    const isProtectedAdmin =
      data.role === 'user_admin' ||
      data.role === 'Directivo' ||
      data.email === adminEmail ||
      docSnap.id === userCred.user.uid;

    if (isParentRole && !isProtectedAdmin) {
      parentUsers.push({
        id: docSnap.id,
        email: data.email,
        nombre: data.nombre || data.nombreCompleto || 'Sin nombre',
      });
    }
  }

  console.log(`Se encontraron ${parentUsers.length} tutores/padres para eliminar.`);

  let deletedAuthCount = 0;
  let deletedFirestoreOnlyCount = 0;

  for (let i = 0; i < parentUsers.length; i++) {
    const parent = parentUsers[i];
    console.log(`[${i + 1}/${parentUsers.length}] Eliminando tutor: ${parent.nombre} (${parent.email})...`);

    let deletedViaCf = false;
    // Intentar eliminar de Firebase Auth y Firestore a través de la Cloud Function cf_updateUserProfile
    try {
      await callCloudFunction(
        'cf_updateUserProfile',
        {
          targetId: parent.id,
          targetType: 'parent',
          fields: {
            deleteUser: true,
            _action: 'delete',
            email: parent.email,
          },
        },
        token
      );
      deletedViaCf = true;
      deletedAuthCount++;
    } catch (cfErr) {
      console.warn(`   Aviso CF (Auth): ${cfErr.message}. Procediendo con borrado directo en Firestore.`);
    }

    // Si la Cloud Function no eliminó el documento de Firestore, asegurar el borrado directo
    if (!deletedViaCf) {
      try {
        await deleteDoc(doc(db, 'users', parent.id));
        deletedFirestoreOnlyCount++;
      } catch (docErr) {
        console.error(`   Error al eliminar documento ${parent.id}:`, docErr.message);
      }
    }
  }

  // 3. Limpiar inscripciones de alumnos en actividades extracurriculares (sportsActivities)
  console.log('\n--- 3. Limpiando alumnos inscriptos en actividades extracurriculares (sportsActivities) ---');
  const sportsSnap = await getDocs(collection(db, 'sportsActivities'));
  let clearedSportsCount = 0;
  if (!sportsSnap.empty) {
    const sportsBatch = writeBatch(db);
    sportsSnap.docs.forEach((docSnap) => {
      sportsBatch.update(docSnap.ref, {
        inscriptos: [],
        cupoOcupado: 0,
      });
      clearedSportsCount++;
    });
    await sportsBatch.commit();
    console.log(`✔ Vaciadas inscripciones en ${clearedSportsCount} actividades extracurriculares.`);
  } else {
    console.log('No se encontraron actividades extracurriculares.');
  }

  console.log('\n===============================================================');
  console.log('  RESUMEN DE VACIADO:');
  console.log(`  - Alumnos eliminados: ${totalStudents}`);
  console.log(`  - Tutores eliminados de Auth y Firestore: ${deletedAuthCount}`);
  if (deletedFirestoreOnlyCount > 0) {
    console.log(`  - Tutores eliminados solo de Firestore: ${deletedFirestoreOnlyCount}`);
  }
  console.log(`  - Actividades extracurriculares con padrón vaciado: ${clearedSportsCount}`);
  console.log('  ¡Limpieza de alumnos y padres completada con éxito!');
  console.log('===============================================================\n');

  process.exit(0);
}

cleanStudentsAndParents().catch((err) => {
  console.error('\nError fatal durante el proceso de limpieza:', err);
  process.exit(1);
});
