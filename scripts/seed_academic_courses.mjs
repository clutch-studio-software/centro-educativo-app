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
  setDoc,
  writeBatch,
  serverTimestamp,
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

export const DEFAULT_COURSES = [
  // 1. NIVEL INICIAL
  {
    id: 'curso-ni-2-a',
    nivelId: 'inicial',
    nombre: 'Sala de 2 Años',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Sala Maternal - P.B.',
    cupoMax: 20,
    activo: true,
    docenteTitular: 'Prof. Natalia Domínguez',
  },
  {
    id: 'curso-ni-3-a',
    nivelId: 'inicial',
    nombre: 'Sala de 3 Años',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Sala 1 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. Laura Gómez',
  },
  {
    id: 'curso-ni-3-b',
    nivelId: 'inicial',
    nombre: 'Sala de 3 Años',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Sala 1 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. Natalia Domínguez',
  },
  {
    id: 'curso-ni-4-a',
    nivelId: 'inicial',
    nombre: 'Sala de 4 Años',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Sala 2 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. Sofía Navarro',
  },
  {
    id: 'curso-ni-4-b',
    nivelId: 'inicial',
    nombre: 'Sala de 4 Años',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Sala 2 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. María Elena Walsh',
  },
  {
    id: 'curso-ni-5-a',
    nivelId: 'inicial',
    nombre: 'Sala de 5 Años',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Sala 3 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. Carina Benítez',
  },
  {
    id: 'curso-ni-5-b',
    nivelId: 'inicial',
    nombre: 'Sala de 5 Años',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Sala 3 - P.B.',
    cupoMax: 25,
    activo: true,
    docenteTitular: 'Prof. Carina Benítez',
  },

  // 2. NIVEL PRIMARIO
  {
    id: 'curso-np-1-a',
    nivelId: 'primario',
    nombre: '1er Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 11 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Laura Gómez',
  },
  {
    id: 'curso-np-1-b',
    nivelId: 'primario',
    nombre: '1er Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 11 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Sofía Navarro',
  },
  {
    id: 'curso-np-2-a',
    nivelId: 'primario',
    nombre: '2do Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 12 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Gabriela Rossi',
  },
  {
    id: 'curso-np-2-b',
    nivelId: 'primario',
    nombre: '2do Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 12 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Martina Albarracín',
  },
  {
    id: 'curso-np-3-a',
    nivelId: 'primario',
    nombre: '3er Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 13 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Martín Palermo',
  },
  {
    id: 'curso-np-3-b',
    nivelId: 'primario',
    nombre: '3er Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 13 - P.B.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Natalia Domínguez',
  },
  {
    id: 'curso-np-4-a',
    nivelId: 'primario',
    nombre: '4to Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 14 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Andrea Sosa',
  },
  {
    id: 'curso-np-4-b',
    nivelId: 'primario',
    nombre: '4to Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 14 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Laura Gómez',
  },
  {
    id: 'curso-np-5-a',
    nivelId: 'primario',
    nombre: '5to Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 15 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Gabriela Rossi',
  },
  {
    id: 'curso-np-5-b',
    nivelId: 'primario',
    nombre: '5to Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 15 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Sofía Navarro',
  },
  {
    id: 'curso-np-6-a',
    nivelId: 'primario',
    nombre: '6to Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 16 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Carina Benítez',
  },
  {
    id: 'curso-np-6-b',
    nivelId: 'primario',
    nombre: '6to Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 16 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Martín Palermo',
  },
  {
    id: 'curso-np-7-a',
    nivelId: 'primario',
    nombre: '7mo Grado',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 17 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Andrea Sosa',
  },
  {
    id: 'curso-np-7-b',
    nivelId: 'primario',
    nombre: '7mo Grado',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 17 - 1° Piso',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Laura Gómez',
  },

  // 3. NIVEL SECUNDARIO
  {
    id: 'curso-ns-1-a',
    nivelId: 'secundario',
    nombre: '1er Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 201 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Marcelo Tinelli',
  },
  {
    id: 'curso-ns-1-b',
    nivelId: 'secundario',
    nombre: '1er Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 201 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Andrea Sosa',
  },
  {
    id: 'curso-ns-2-a',
    nivelId: 'secundario',
    nombre: '2do Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 202 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Gabriela Rossi',
  },
  {
    id: 'curso-ns-2-b',
    nivelId: 'secundario',
    nombre: '2do Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 202 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Martín Palermo',
  },
  {
    id: 'curso-ns-3-a',
    nivelId: 'secundario',
    nombre: '3er Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 203 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Sofía Navarro',
  },
  {
    id: 'curso-ns-3-b',
    nivelId: 'secundario',
    nombre: '3er Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 203 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    docenteTitular: 'Prof. Martina Albarracín',
  },
  {
    id: 'curso-ns-4-a',
    nivelId: 'secundario',
    nombre: '4to Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 204 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Economía y Gestión',
    docenteTitular: 'Prof. Carlos Bilardo',
  },
  {
    id: 'curso-ns-4-b',
    nivelId: 'secundario',
    nombre: '4to Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 204 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Ciencias Sociales',
    docenteTitular: 'Prof. Andrea Sosa',
  },
  {
    id: 'curso-ns-5-a',
    nivelId: 'secundario',
    nombre: '5to Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 205 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Economía y Gestión',
    docenteTitular: 'Prof. Laura Gómez',
  },
  {
    id: 'curso-ns-5-b',
    nivelId: 'secundario',
    nombre: '5to Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 205 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Ciencias Sociales',
    docenteTitular: 'Prof. Gabriela Rossi',
  },
  {
    id: 'curso-ns-6-a',
    nivelId: 'secundario',
    nombre: '6to Año',
    division: 'A',
    turno: 'Turno Mañana',
    aula: 'Aula 206 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Economía y Gestión',
    docenteTitular: 'Prof. Martín Palermo',
  },
  {
    id: 'curso-ns-6-b',
    nivelId: 'secundario',
    nombre: '6to Año',
    division: 'B',
    turno: 'Turno Tarde',
    aula: 'Aula 206 - Edif. Sec.',
    cupoMax: 30,
    activo: true,
    orientacion: 'Ciencias Naturales',
    docenteTitular: 'Prof. Carina Benítez',
  },
];

async function seed() {
  console.log('Iniciando persistencia de cursos en Firestore...');
  await signInWithEmailAndPassword(auth, envVars.VITE_ADMIN_EMAIL, envVars.VITE_DEV_ADMIN_KEY);
  console.log('Autenticado como admin.');

  // Guardar cada curso en la colección academicOffer con type: 'course'
  const batch = writeBatch(db);
  for (const c of DEFAULT_COURSES) {
    const docRef = doc(db, 'academicOffer', c.id);
    batch.set(docRef, {
      ...c,
      type: 'course',
      isCourse: true,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  // Sincronizar catálogo academicOffer/current con todas las divisiones
  const catalog = {
    Inicial: {},
    Primario: {},
    Secundario: {},
  };

  for (const c of DEFAULT_COURSES) {
    const nivelKey =
      c.nivelId === 'inicial'
        ? 'Inicial'
        : c.nivelId === 'secundario'
        ? 'Secundario'
        : 'Primario';
    if (!catalog[nivelKey][c.nombre]) {
      catalog[nivelKey][c.nombre] = [];
    }
    if (!catalog[nivelKey][c.nombre].includes(c.division)) {
      catalog[nivelKey][c.nombre].push(c.division);
    }
  }

  batch.set(doc(db, 'academicOffer', 'current'), catalog, { merge: true });

  await batch.commit();
  console.log(`¡Persistidos ${DEFAULT_COURSES.length} cursos y divisiones en Firestore academicOffer!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error durante la persistencia de cursos:', err);
  process.exit(1);
});
