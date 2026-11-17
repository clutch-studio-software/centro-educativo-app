import { collection, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import {
  commitInBatches,
  initAdminFirebaseClient,
  sanitizeForLog,
} from './lib/firebaseScriptClient.mjs';

const NOTIFICATIONS_COLLECTION = 'notifications';
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';
const EXPO_PUSH_BATCH_LIMIT = 100;
const EXPO_TOKEN_REGEX = /^Expo(?:nent)?PushToken\[.+\]$/;

function parseCliArgs(argv) {
  const args = {
    title: '',
    body: '',
    category: 'info',
    targetTab: 'academic',
    status: 'info',
    audience: 'all',
    dryRun: false,
    help: false,
  };

  const valueFlags = {
    '--title': 'title',
    '--body': 'body',
    '--category': 'category',
    '--target-tab': 'targetTab',
    '--status': 'status',
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
    else if (arg === '--audience' && argv[i + 1]) args.audience = argv[++i].toLowerCase();
    else if (valueFlags[arg] && argv[i + 1]) args[valueFlags[arg]] = argv[++i];
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

function collectDocTokens(data, tokenSet) {
  if (!data || typeof data !== 'object') return;
  const rawList = [
    data.expoPushToken,
    ...(Array.isArray(data.expoPushTokens)
      ? data.expoPushTokens.map((item) => (typeof item === 'string' ? item : item?.token))
      : []),
  ];
  for (const raw of rawList) {
    const trimmed = typeof raw === 'string' ? raw.trim() : '';
    if (EXPO_TOKEN_REGEX.test(trimmed)) tokenSet.add(trimmed);
  }
}

async function sendExpoChunks(tokens, options) {
  const uniqueTokens = Array.from(tokens);
  const chunks = [];
  for (let i = 0; i < uniqueTokens.length; i += EXPO_PUSH_BATCH_LIMIT) {
    chunks.push(uniqueTokens.slice(i, i + EXPO_PUSH_BATCH_LIMIT));
  }

  const results = await Promise.all(
    chunks.map(async (chunk, idx) => {
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
        const res = await fetch(EXPO_PUSH_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
        if (!res.ok) {
          const safeErr = sanitizeForLog(await res.text().catch(() => ''));
          console.warn(`[Expo Push] Lote ${idx + 1} HTTP ${res.status}: ${safeErr}`);
          return { sent: 0, failed: 1 };
        }
        return { sent: chunk.length, failed: 0 };
      } catch (err) {
        console.warn(`[Expo Push] Error en lote ${idx + 1}: ${sanitizeForLog(err?.message || err)}`);
        return { sent: 0, failed: 1 };
      }
    })
  );

  return {
    sentCount: results.reduce((acc, r) => acc + r.sent, 0),
    failedChunks: results.reduce((acc, r) => acc + r.failed, 0),
  };
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
  console.log(`  Título:     ${sanitizeForLog(options.title)}`);
  console.log(`  Mensaje:    ${sanitizeForLog(options.body)}`);
  console.log(`  Categoría:  ${sanitizeForLog(options.category)} | Tab: ${sanitizeForLog(options.targetTab)} | Estado: ${sanitizeForLog(options.status)}`);
  console.log(`  Audiencia:  ${sanitizeForLog(options.audience)}\n`);

  const { db } = await initAdminFirebaseClient();
  const docsToCreate = [];
  const tokenSet = new Set();
  const createdAtIso = new Date().toISOString();

  const createPayload = (parentId, studentId, studentName) => ({
    parentId,
    userId: parentId,
    studentId,
    studentName,
    category: options.category,
    title: options.title,
    body: options.body,
    targetTab: options.targetTab,
    recordId: null,
    status: options.status,
    read: false,
    leida: false,
    createdAt: createdAtIso,
    timestamp: serverTimestamp(),
  });

  const includeParents = options.audience === 'all' || options.audience === 'parents';
  const includeStudents = options.audience === 'all' || options.audience === 'students';
  let parentCount = 0;
  let studentCount = 0;

  if (includeParents) {
    const usersSnap = await getDocs(collection(db, 'users'));
    for (const uDoc of usersSnap.docs) {
      const uData = uDoc.data();
      const role = String(uData.role || '').trim().toLowerCase();
      if (!['padre', 'tutor', 'parent'].includes(role)) continue;
      parentCount++;
      docsToCreate.push(createPayload(uDoc.id, null, ''));
      collectDocTokens(uData, tokenSet);
    }
  }

  if (includeStudents) {
    const studentsSnap = await getDocs(collection(db, 'students'));
    for (const sDoc of studentsSnap.docs) {
      const sData = sDoc.data();
      const name = (
        sData?.nombreCompleto ||
        `${sData?.nombre || ''} ${sData?.apellido || ''}`.trim() ||
        sData?.name ||
        'Alumno'
      ).trim();
      studentCount++;
      docsToCreate.push(createPayload(null, sDoc.id, name));
      collectDocTokens(sData, tokenSet);
    }
  }

  console.log('Destinatarios encontrados:');
  if (includeParents) console.log(`  - Tutores/Padres: ${parentCount}`);
  if (includeStudents) console.log(`  - Alumnos:        ${studentCount}`);
  console.log(`  - Documentos Firestore a crear: ${docsToCreate.length}`);
  console.log(`  - Push tokens únicos de Expo:   ${tokenSet.size}\n`);

  if (!options.dryRun) {
    const notifCol = collection(db, NOTIFICATIONS_COLLECTION);
    await commitInBatches(db, docsToCreate, (batch, payload) => {
      batch.set(doc(notifCol), payload);
    });
    console.log(`Firestore: ${docsToCreate.length} notificaciones registradas correctamente.`);

    if (tokenSet.size > 0) {
      const { sentCount, failedChunks } = await sendExpoChunks(tokenSet, options);
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
