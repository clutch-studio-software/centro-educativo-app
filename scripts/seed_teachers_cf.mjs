import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return responseData;
}

// Especialidades y titulaciones oficiales
const TEACHER_PROFILES = [
  {
    especialidad: 'Matemática',
    titulacion: 'Profesor de Educación Secundaria en Matemática',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Lengua y Literatura',
    titulacion: 'Licenciada/o en Letras y Profesora de Castellano',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Ciencias Naturales y Biología',
    titulacion: 'Licenciada/o en Biodiversidad y Ciencias Biológicas',
    tratamientos: ['Lic.', 'Dr.', 'Dra.'],
  },
  {
    especialidad: 'Historia y Formación Ética',
    titulacion: 'Profesor de Historia y Ciencias Sociales',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Geografía',
    titulacion: 'Profesora de Geografía y Medio Ambiente',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Física y Química',
    titulacion: 'Licenciado en Química y Profesor de Ciencias Físicas',
    tratamientos: ['Lic.', 'Ing.', 'Prof.'],
  },
  {
    especialidad: 'Lengua Extranjera: Inglés',
    titulacion: 'Traductor Público y Profesor en Lengua Inglesa',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Educación Física y Deportes',
    titulacion: 'Profesor de Educación Física y Entrenamiento Deportivo',
    tratamientos: ['Prof.'],
  },
  {
    especialidad: 'Informática y Robótica',
    titulacion: 'Ingeniero en Sistemas de Información',
    tratamientos: ['Ing.', 'Prof.'],
  },
  {
    especialidad: 'Artes Visuales',
    titulacion: 'Licenciada en Artes Visuales y Gestión Cultural',
    tratamientos: ['Lic.', 'Prof.'],
  },
  {
    especialidad: 'Educación Musical',
    titulacion: 'Profesor de Música y Dirección Coral',
    tratamientos: ['Prof.', 'Lic.'],
  },
  {
    especialidad: 'Filosofía y Ciudadanía',
    titulacion: 'Licenciado en Filosofía y Ciencias Humanas',
    tratamientos: ['Lic.', 'Dr.', 'Prof.'],
  },
];

const SURNAMES = [
  'Gómez', 'Rodríguez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero',
  'Sánchez', 'Álvarez', 'Torres', 'Ruíz', 'Ramírez', 'Flores', 'Benítez', 'Acosta',
  'Medina', 'Herrera', 'Aguirre', 'Castro', 'Giménez', 'Morales', 'Domínguez', 'Blanco',
  'Vega', 'Peralta', 'Navarro', 'Quiroga', 'Cabrera', 'Ríos', 'Godoy', 'Rossi', 'Sosa'
];

const FEMALE_NAMES = [
  'Mariana', 'Andrea', 'Silvina', 'Laura', 'Patricia', 'Natalia', 'Carolina', 'Claudia',
  'Verónica', 'Romina', 'Paola', 'Gisela', 'Lorena', 'Valeria', 'Gabriela', 'Cecilia',
  'María Elena', 'Analía', 'Florencia', 'Carla', 'Débora', 'Luciana', 'Daniela', 'Soledad'
];

const MALE_NAMES = [
  'Marcelo', 'Carlos', 'Diego', 'Javier', 'Pablo', 'Esteban', 'Gustavo', 'Roberto',
  'Mariano', 'Hernán', 'Fernando', 'Alejandro', 'Gabriel', 'Federico', 'Claudio', 'Guillermo',
  'Sebastián', 'Mauricio', 'Martín', 'Adrián', 'Leonardo', 'Gonzalo', 'Rodrigo', 'Christian'
];

const CONDITIONS = ['Titular', 'Titular', 'Interino', 'Suplente'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPhone() {
  const prefixes = ['342', '341', '11', '3492'];
  const pref = randomItem(prefixes);
  const part1 = randomInt(400, 599);
  const part2 = randomInt(1000, 9999);
  return `${pref}-${part1}-${part2}`;
}

function generateCleanEmail(name, surname) {
  const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
  const cleanSurname = surname.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const suffix = randomInt(10, 99);
  return `${cleanName}.${cleanSurname}${suffix}@colegio.edu.ar`;
}

async function seedTeachers() {
  console.log('===============================================================');
  console.log('  GENERADOR DE PROFESORES/DOCENTES MEDIANTE CLOUD FUNCTIONS');
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

  console.log(`Generando ${TEACHER_PROFILES.length} docentes cubriendo todas las áreas académicas...\n`);

  const currentYear = new Date().getFullYear();
  const usedDnis = new Set();
  const usedEmails = new Set();
  const createdTeachers = [];

  for (let i = 0; i < TEACHER_PROFILES.length; i++) {
    const profile = TEACHER_PROFILES[i];
    const isFemale = Math.random() > 0.5;
    const firstName = isFemale ? randomItem(FEMALE_NAMES) : randomItem(MALE_NAMES);
    const surname = SURNAMES[i % SURNAMES.length];
    const tratamiento = randomItem(profile.tratamientos);
    const nombreCompleto = `${tratamiento} ${firstName} ${surname}`;

    let dni;
    do {
      dni = String(randomInt(24000000, 38999999));
    } while (usedDnis.has(dni));
    usedDnis.add(dni);

    let email;
    do {
      email = generateCleanEmail(firstName, surname);
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const randomLegajoNum = String(1000 + i * 15 + randomInt(1, 9));
    const legajo = `#DOC-${currentYear}-${randomLegajoNum}`;
    const condicion = randomItem(CONDITIONS);
    const telefono = randomPhone();
    const maxHoras = randomItem([24, 30, 36]);

    const basePayload = {
      email,
      name: nombreCompleto,
      role: 'Staff',
      dni,
      tratamiento,
      nombre: firstName,
      apellido: surname,
      legajo,
      titulacion: profile.titulacion,
      especialidad: profile.especialidad,
      telefono,
      condicion,
      estado: 'Activo',
      disabled: false,
      nombreCompleto,
    };

    console.log(`[${i + 1}/${TEACHER_PROFILES.length}] Registrando docente: ${nombreCompleto} (${profile.especialidad})...`);

    try {
      const res = await callCloudFunction('cf_createAdministrativeUser', basePayload, token);
      const uid = res.uid || res.id;
      console.log(`   ✔ Docente creado en Auth & Firestore (UID: ${uid})`);

      // Complementar campos de gestión institucional en Firestore
      if (uid) {
        await setDoc(
          doc(db, 'users', uid),
          {
            ...basePayload,
            cargaHoras: 0,
            cargaMaxHoras: maxHoras,
            catedras: [],
            grillaHoraria: [
              { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
              { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
              { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
            ],
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      createdTeachers.push({
        uid,
        nombre: nombreCompleto,
        legajo,
        especialidad: profile.especialidad,
        email,
        dni,
      });
    } catch (err) {
      console.error(`   ✖ Error al crear docente ${nombreCompleto}:`, err.message);
    }
  }

  console.log('\n===============================================================');
  console.log('  RESUMEN DE GENERACIÓN DE DOCENTES:');
  console.log(`  - Docentes registrados exitosamente: ${createdTeachers.length}/${TEACHER_PROFILES.length}`);
  console.log('  - Creados en Firebase Auth con Custom Claim rol "Staff".');
  console.log('  - Contraseña inicial asignada: número de DNI de cada docente.');
  console.log('  - Fichas completas guardadas con legajos, especialidades y grilla horaria.');
  console.log('===============================================================\n');

  process.exit(0);
}

seedTeachers().catch((err) => {
  console.error('\nError fatal durante la generación de docentes:', err);
  process.exit(1);
});
