import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const NOTIFICATIONS_COLLECTION = 'notifications';
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const FIRESTORE_BATCH_LIMIT = 450;
const EXPO_PUSH_BATCH_LIMIT = 100;

/**
 * Carga variables de entorno desde el archivo .env del proyecto.
 */
function loadEnvVars() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Archivo .env no encontrado en ${envPath}`);
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

  return envVars;
}

/**
 * Parsea los argumentos de línea de comandos.
 */
function parseCliArgs(argv) {
  const args = {
    title: '',
    body: '',
    category: 'info',
    targetTab: 'academic',
    status: 'info',
    audience: 'all', // 'all' | 'parents' | 'students'
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--title' && argv[i + 1]) {
      args.title = argv[++i];
    } else if (arg === '--body' && argv[i + 1]) {
      args.body = argv[++i];
    } else if (arg === '--category' && argv[i + 1]) {
      args.category = argv[++i];
    } else if (arg === '--target-tab' && argv[i + 1]) {
      args.targetTab = argv[++i];
    } else if (arg === '--status' && argv[i + 1]) {
      args.status = argv[++i];
    } else if (arg === '--audience' && argv[i + 1]) {
      args.audience = argv[++i].toLowerCase();
    }
  }

  return args;
}

function printUsage() {
  console.log(`
Uso:
  node scripts/send_broadcast_notification.mjs --title "Título" --body "Mensaje" [opciones]

Opciones:
  --title <texto>        Título de la notificación (obligatorio)
  --body <texto>         Cuerpo/descripción de la notificación (obligatorio)
  --category <cat>       Categoría: info | preceptoria | enfermeria | inasistencia | justificacion | pago (default: info)
  --target-tab <tab>     Pestaña en App Móvil: academic | billing (default: academic)
  --status <estado>      Estado: info | aprobado | rechazado | observado (default: info)
  --audience <grupo>     Destinatarios: all | parents | students (default: all)
  --dry-run              Simula la ejecución sin escribir en Firestore ni enviar Push
  -h, --help             Muestra esta ayuda
`);
}

function isValidExpoPushToken(token) {
  if (typeof token !== 'string') return false;
  const trimmed = token.trim();
  return (
    trimmed.startsWith('ExponentPushToken[') ||
    trimmed.startsWith('ExpoPushToken[')
  );
}

function extractTokensFromDocData(data) {
  if (!data || typeof data !== 'object') return [];
  const candidates = [];

  if (typeof data.expoPushToken === 'string') {
    candidates.push(data.expoPushToken.trim());
  }

  if (Array.isArray(data.expoPushTokens)) {
    for (const item of data.expoPushTokens) {
      if (typeof item === 'string') {
        candidates.push(item.trim());
      } else if (item && typeof item.token === 'string') {
        candidates.push(item.token.trim());
      }
    }
  }

  return candidates.filter(isValidExpoPushToken);
}

function resolveStudentName(data) {
  return (
    data?.nombreCompleto ||
    `${data?.nombre || ''} ${data?.apellido || ''}`.trim() ||
    data?.name ||
    'Alumno'
  ).trim();
}

function isParentRole(role) {
  const normalized = String(role || '').trim().toLowerCase();
  return normalized === 'padre' || normalized === 'tutor' || normalized === 'parent';
}

function buildNotificationDoc({ parentId, studentId, studentName, options }) {
  return {
    parentId: parentId || null,
    userId: parentId || null,
    studentId: studentId || null,
    studentName: studentName || '',
    category: options.category,
    title: options.title,
    body: options.body,
    targetTab: options.targetTab,
    recordId: null,
    status: options.status,
    read: false,
    leida: false,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };
}

/**
 * Envía notificaciones Push a Expo en lotes de hasta 100 mensajes.
 */
async function sendExpoPushChunks(tokens, options) {
  const uniqueTokens = Array.from(tokens);
  let sentCount = 0;
  let failedChunks = 0;

  for (let i = 0; i < uniqueTokens.length; i += EXPO_PUSH_BATCH_LIMIT) {
    const chunk = uniqueTokens.slice(i, i + EXPO_PUSH_BATCH_LIMIT);
    const messages = chunk.map((token) => ({
      to: token,
      sound: 'default',
      title: options.title,
      body: options.body,
      data: {
        category: options.category,
        studentId: null,
        targetTab: options.targetTab,
        recordId: null,
      },
    }));

    try {
      const response = await fetch(EXPO_PUSH_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(
          `[Expo Push] Lote ${Math.floor(i / EXPO_PUSH_BATCH_LIMIT) + 1} respondió HTTP ${response.status}: ${errText}`
        );
        failedChunks++;
      } else {
        sentCount += chunk.length;
      }
    } catch (err) {
      console.warn(
        `[Expo Push] Error de red en lote ${Math.floor(i / EXPO_PUSH_BATCH_LIMIT) + 1}:`,
        err?.message || err
      );
      failedChunks++;
    }
  }

  return { sentCount, failedChunks };
}

async function runBroadcast() {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  if (!options.title.trim() || !options.body.trim()) {
    console.error('Error: --title y --body son obligatorios.');
    printUsage();
    process.exit(1);
  }

  if (!['all', 'parents', 'students'].includes(options.audience)) {
    console.error('Error: --audience debe ser "all", "parents" o "students".');
    process.exit(1);
  }

  console.log('===============================================================');
  console.log('  ENVÍO MASIVO DE NOTIFICACIONES INSTITUCIONALES');
  if (options.dryRun) {
    console.log('  [MODO SIMULACIÓN / DRY-RUN: No se escribirá ni enviará nada]');
  }
  console.log('===============================================================');
  console.log(`  Título:     ${options.title}`);
  console.log(`  Mensaje:    ${options.body}`);
  console.log(`  Categoría:  ${options.category} | Tab: ${options.targetTab} | Estado: ${options.status}`);
  console.log(`  Audiencia:  ${options.audience}\n`);

  const envVars = loadEnvVars();
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

  console.log(`Iniciando sesión como administrador (${adminEmail})...`);
  const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
  console.log(`Autenticado exitosamente. UID Admin: ${userCred.user.uid}\n`);

  const docsToCreate = [];
  const tokenSet = new Set();

  const includeParents = options.audience === 'all' || options.audience === 'parents';
  const includeStudents = options.audience === 'all' || options.audience === 'students';

  let parentCount = 0;
  let studentCount = 0;

  if (includeParents) {
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const uDoc of usersSnap.docs) {
      const uData = uDoc.data();
      if (!isParentRole(uData.role)) continue;

      parentCount++;
      docsToCreate.push(
        buildNotificationDoc({
          parentId: uDoc.id,
          studentId: null,
          studentName: '',
          options,
        })
      );
      extractTokensFromDocData(uData).forEach((t) => tokenSet.add(t));
    }
  }

  if (includeStudents) {
    const studentsSnap = await getDocs(collection(db, 'students'));
    for (const sDoc of studentsSnap.docs) {
      const sData = sDoc.data();
      studentCount++;
      docsToCreate.push(
        buildNotificationDoc({
          parentId: null,
          studentId: sDoc.id,
          studentName: resolveStudentName(sData),
          options,
        })
      );
      extractTokensFromDocData(sData).forEach((t) => tokenSet.add(t));
    }
  }

  console.log(`Destinatarios encontrados:`);
  if (includeParents) console.log(`  - Tutores/Padres: ${parentCount}`);
  if (includeStudents) console.log(`  - Alumnos:        ${studentCount}`);
  console.log(`  - Documentos Firestore a crear: ${docsToCreate.length}`);
  console.log(`  - Push tokens únicos de Expo:   ${tokenSet.size}\n`);

  if (!options.dryRun) {
    const notifCol = collection(db, NOTIFICATIONS_COLLECTION);
    let batch = writeBatch(db);
    let batchCount = 0;

    for (const payload of docsToCreate) {
      const newRef = doc(notifCol);
      batch.set(newRef, payload);
      batchCount++;

      if (batchCount >= FIRESTORE_BATCH_LIMIT) {
        await batch.commit();
        batch = writeBatch(db);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }
    console.log(`Firestore: ${docsToCreate.length} notificaciones registradas correctamente.`);

    if (tokenSet.size > 0) {
      const { sentCount, failedChunks } = await sendExpoPushChunks(tokenSet, options);
      console.log(
        `Expo Push: ${sentCount}/${tokenSet.size} tokens enviados` +
          (failedChunks > 0 ? ` (${failedChunks} lotes con error).` : ' sin errores.')
      );
    } else {
      console.log('Expo Push: No se encontraron tokens válidos para enviar.');
    }
  }

  console.log('\nProceso finalizado.');
  process.exit(0);
}

runBroadcast().catch((err) => {
  console.error('\nError fatal durante el envío masivo:', err);
  process.exit(1);
});
