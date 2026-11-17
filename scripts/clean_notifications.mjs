import { collection, getDocs } from 'firebase/firestore';
import { commitInBatches, initAdminFirebaseClient } from './lib/firebaseScriptClient.mjs';

const NOTIFICATIONS_COLLECTION = 'notifications';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDaysValue(raw) {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error('El valor de --days debe ser un número mayor o igual a 0.');
  }
  return parsed;
}

function parseCliArgs(argv) {
  const args = { days: null, dryRun: false, help: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--days' && argv[i + 1] !== undefined) {
      args.days = parseDaysValue(argv[++i]);
    } else if (arg.startsWith('--days=')) {
      args.days = parseDaysValue(arg.slice('--days='.length));
    }
  }

  return args;
}

function printUsage() {
  console.log(`
Uso:
  node scripts/clean_notifications.mjs [opciones]

Opciones:
  --days <n>    Elimina solo las notificaciones con más de <n> días de antigüedad.
                Si se omite, elimina TODAS las notificaciones de la colección.
  --dry-run     Simula la limpieza mostrando cuántas se eliminarían sin borrar nada.
  -h, --help    Muestra esta ayuda
`);
}

function getNotificationTimestampMs(data) {
  if (!data || typeof data !== 'object') return null;
  if (typeof data.timestamp?.toMillis === 'function') return data.timestamp.toMillis();
  if (typeof data.timestamp?.seconds === 'number') return data.timestamp.seconds * 1000;
  if (typeof data.createdAt === 'string' && data.createdAt.trim()) {
    const parsed = Date.parse(data.createdAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

async function cleanNotifications() {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    process.exit(0);
  }

  console.log('===============================================================');
  console.log('  LIMPIEZA DE NOTIFICACIONES EN FIRESTORE (notifications)');
  if (options.dryRun) {
    console.log('  [MODO SIMULACIÓN / DRY-RUN: No se eliminará ningún documento]');
  }
  console.log('===============================================================');
  console.log(
    options.days !== null
      ? `  Filtro de antigüedad: > ${options.days} día(s)\n`
      : '  Filtro de antigüedad: Ninguno (se eliminarán TODAS)\n'
  );

  const { db } = await initAdminFirebaseClient();
  const snap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
  const totalDocs = snap.docs.length;
  console.log(`Total de notificaciones encontradas: ${totalDocs}`);

  if (totalDocs === 0) {
    console.log('No hay notificaciones para eliminar.');
    process.exit(0);
  }

  const cutoffMs = options.days !== null ? Date.now() - options.days * MS_PER_DAY : null;
  const docsToDelete = [];
  let skippedNoDate = 0;

  for (const docSnap of snap.docs) {
    if (cutoffMs === null) {
      docsToDelete.push(docSnap.ref);
      continue;
    }
    const docMs = getNotificationTimestampMs(docSnap.data());
    if (docMs === null) {
      skippedNoDate++;
    } else if (docMs < cutoffMs) {
      docsToDelete.push(docSnap.ref);
    }
  }

  console.log(`  - A eliminar: ${docsToDelete.length}`);
  console.log(`  - Se conservan: ${totalDocs - docsToDelete.length}`);
  if (skippedNoDate > 0) {
    console.log(`  - Omitidas sin fecha válida (solo con --days): ${skippedNoDate}`);
  }
  console.log('');

  if (!options.dryRun && docsToDelete.length > 0) {
    await commitInBatches(db, docsToDelete, (batch, ref) => batch.delete(ref));
    console.log(`Firestore: ${docsToDelete.length} notificaciones eliminadas correctamente.`);
  }

  console.log('\nProceso finalizado.');
  process.exit(0);
}

cleanNotifications().catch((err) => {
  console.error('\nError fatal durante la limpieza de notificaciones:', err);
  process.exit(1);
});
