import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Quita el apellido del campo nombre si está contenido en él.
 * Ejemplo: nombre = "Erick Emanuel Vicentin", apellido = "Vicentin"
 * -> nuevoNombre = "Erick Emanuel", nombreCompleto = "Erick Emanuel Vicentin"
 */
function processStudentNames(rawNombre, rawApellido, existingNombreCompleto) {
  const nombre = String(rawNombre || '').trim();
  const apellido = String(rawApellido || '').trim();

  if (!nombre) {
    return null;
  }

  // Si no tiene apellido cargado, solo aseguramos nombreCompleto = nombre
  if (!apellido) {
    return {
      nombre,
      nombreCompleto: existingNombreCompleto || nombre,
      changed: existingNombreCompleto !== nombre,
    };
  }

  const escapedApellido = escapeRegExp(apellido);
  // Primero intentamos quitar el apellido al final del nombre (caso estándar: "Nombre Apellido")
  const endRegex = new RegExp(`\\s+${escapedApellido}$`, 'i');
  // Si no está al final, buscamos como palabra completa en cualquier posición
  const wordRegex = new RegExp(`\\b${escapedApellido}\\b`, 'i');

  let nuevoNombre = nombre;
  let nombreCompleto = nombre;

  if (endRegex.test(nombre)) {
    nombreCompleto = nombre;
    nuevoNombre = nombre.replace(endRegex, '').replace(/\s+/g, ' ').trim();
  } else if (wordRegex.test(nombre) && nombre.toLowerCase() !== apellido.toLowerCase()) {
    nombreCompleto = nombre;
    nuevoNombre = nombre.replace(wordRegex, '').replace(/\s+/g, ' ').trim();
  } else {
    // El apellido ya no está dentro de 'nombre' (ej. ya fue corregido previamente)
    nombreCompleto = existingNombreCompleto || `${nombre} ${apellido}`.replace(/\s+/g, ' ').trim();
  }

  const changed =
    nuevoNombre !== rawNombre || nombreCompleto !== existingNombreCompleto;

  return {
    nombre: nuevoNombre,
    nombreCompleto,
    changed,
  };
}

async function fixStudentNames() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('===============================================================');
  console.log('  NORMALIZACIÓN DE NOMBRES DE ALUMNOS EN FIRESTORE (students)');
  if (isDryRun) {
    console.log('  [MODO SIMULACIÓN / DRY-RUN: No se escribirán cambios]');
  }
  console.log('===============================================================\n');

  const adminEmail = envVars.VITE_ADMIN_EMAIL;
  const adminKey =
    envVars.ADMIN_PASSWORD ||
    envVars.VITE_DEV_ADMIN_KEY ||
    envVars.VITE_ADMIN_PASSWORD;

  if (!adminEmail || !adminKey) {
    throw new Error(
      'Faltan credenciales de administrador (VITE_ADMIN_EMAIL / VITE_DEV_ADMIN_KEY) en el archivo .env.'
    );
  }

  console.log(`Iniciando sesión como administrador (${adminEmail})...`);
  const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
  console.log(`Autenticado exitosamente. UID Admin: ${userCred.user.uid}\n`);

  const studentsSnap = await getDocs(collection(db, 'students'));
  const totalStudents = studentsSnap.docs.length;
  console.log(`Se encontraron ${totalStudents} documentos en la colección "students".\n`);

  if (totalStudents === 0) {
    console.log('No hay alumnos para procesar.');
    process.exit(0);
  }

  const BATCH_LIMIT = 450;
  let batch = writeBatch(db);
  let batchCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const docSnap of studentsSnap.docs) {
    const data = docSnap.data();
    const rawNombre = data.nombre;
    const rawApellido = data.apellido;
    const existingNombreCompleto = data.nombreCompleto;

    const result = processStudentNames(
      rawNombre,
      rawApellido,
      existingNombreCompleto
    );

    if (!result || !result.changed) {
      skippedCount++;
      console.log(
        `[OMITIDO] ID: ${docSnap.id} | nombre: "${rawNombre ?? ''}" | apellido: "${rawApellido ?? ''}" | nombreCompleto: "${existingNombreCompleto ?? ''}"`
      );
      continue;
    }

    console.log(
      `[ACTUALIZAR] ID: ${docSnap.id}\n` +
        `   Antes -> nombre: "${rawNombre}" | apellido: "${rawApellido}" | nombreCompleto: "${existingNombreCompleto ?? '(no existía)'}"\n` +
        `   Ahora -> nombre: "${result.nombre}" | apellido: "${rawApellido}" | nombreCompleto: "${result.nombreCompleto}"`
    );

    if (!isDryRun) {
      batch.update(docSnap.ref, {
        nombre: result.nombre,
        nombreCompleto: result.nombreCompleto,
      });
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    updatedCount++;
  }

  if (!isDryRun && batchCount > 0) {
    await batch.commit();
  }

  console.log('\n===============================================================');
  console.log('  RESUMEN DEL PROCESO:');
  console.log(`  - Total de alumnos analizados: ${totalStudents}`);
  console.log(
    `  - Alumnos ${isDryRun ? 'a modificar (dry-run)' : 'modificados exitosamente'}: ${updatedCount}`
  );
  console.log(`  - Alumnos sin cambios necesarios: ${skippedCount}`);
  console.log('===============================================================\n');

  process.exit(0);
}

fixStudentNames().catch((err) => {
  console.error('\nError fatal durante la actualización de alumnos:', err);
  process.exit(1);
});
