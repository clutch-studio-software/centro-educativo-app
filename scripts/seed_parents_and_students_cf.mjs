import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

// Bancos de datos realistas
const SURNAMES = [
  'Gómez', 'Rodríguez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero',
  'Sánchez', 'Álvarez', 'Torres', 'Ruíz', 'Ramírez', 'Flores', 'Benítez', 'Acosta',
  'Medina', 'Herrera', 'Aguirre', 'Castro', 'Giménez', 'Morales', 'Domínguez', 'Blanco',
  'Vega', 'Peralta', 'Navarro', 'Quiroga', 'Cabrera', 'Ríos', 'Godoy', 'Rossi', 'Sosa',
  'Molina', 'Ortiz', 'Silva', 'Núñez', 'Luna', 'Juárez', 'Ceballos', 'Paz', 'Villalba',
  'Castillo', 'Gutiérrez', 'Reyes', 'Valenzuela', 'Maldonado', 'Santillán', 'Vargas'
];

const FEMALE_NAMES = [
  'Sofía', 'Valentina', 'Martina', 'Camila', 'Lucía', 'Catalina', 'Emma', 'Julieta',
  'Delfina', 'Isabella', 'Victoria', 'Mía', 'Renata', 'Paula', 'Florencia', 'Milagros',
  'Bianca', 'Rocío', 'Agostina', 'Abril', 'Candela', 'Zoe', 'Juana', 'Malena', 'Paulina',
  'Clara', 'Constanza', 'Guillermina', 'Alma', 'Elena', 'Josefina', 'Pilar', 'Sol', 'Lola'
];

const MALE_NAMES = [
  'Mateo', 'Felipe', 'Benjamín', 'Bautista', 'Joaquín', 'Tomás', 'Santino', 'Thiago',
  'Bruno', 'Lucas', 'Juan Martín', 'Nicolás', 'Lautaro', 'Agustín', 'Ignacio', 'Facundo',
  'Santiago', 'Julián', 'Franco', 'Manuel', 'Francisco', 'Emiliano', 'Ramiro', 'Lorenzo',
  'Simón', 'Valentín', 'Pedro', 'Dante', 'Ciro', 'Lisandro', 'Tobías', 'Máximo', 'Gael'
];

const PARENT_FEMALE_NAMES = [
  'Mariana', 'Andrea', 'Silvina', 'Laura', 'Patricia', 'Natalia', 'Carolina', 'Claudia',
  'Verónica', 'Romina', 'Paola', 'Gisela', 'Lorena', 'Valeria', 'Gabriela', 'Cecilia',
  'María Elena', 'Analía', 'Florencia', 'Carla', 'Débora', 'Luciana', 'Daniela', 'Soledad'
];

const PARENT_MALE_NAMES = [
  'Marcelo', 'Carlos', 'Diego', 'Javier', 'Pablo', 'Esteban', 'Gustavo', 'Roberto',
  'Mariano', 'Hernán', 'Fernando', 'Alejandro', 'Gabriel', 'Federico', 'Claudio', 'Guillermo',
  'Sebastián', 'Mauricio', 'Martín', 'Adrián', 'Leonardo', 'Gonzalo', 'Rodrigo', 'Christian'
];

const STREETS = [
  'San Martín', 'Belgrano', 'Rivadavia', 'Sarmiento', 'Mitre', 'Urquiza', '25 de Mayo',
  '9 de Julio', 'Güemes', 'Moreno', 'Av. Santa Fe', 'Av. Pellegrini', 'Bv. Gálvez',
  'Av. Freyre', 'Balcarce', 'Laprida', 'Alvear', 'Córdoba', 'Mendoza', 'Salta',
  'Tucumán', 'Entre Ríos', 'Suipacha', 'Junín', 'Castellanos', 'Ituzaingó', 'Chacabuco'
];

const CITIES = ['Santa Fe', 'Rosario', 'Santo Tomé', 'Esperanza', 'Rafaela', 'Paraná'];

const COURSE_BIRTH_YEARS = {
  'Sala de 2 Años': 2024,
  'Sala de 3 Años': 2023,
  'Sala de 4 Años': 2022,
  'Sala de 5 Años': 2021,
  '1er Grado': 2020,
  '2do Grado': 2019,
  '3er Grado': 2018,
  '4to Grado': 2017,
  '5to Grado': 2016,
  '6to Grado': 2015,
  '7mo Grado': 2014,
  '1er Año': 2013,
  '2do Año': 2012,
  '3er Año': 2011,
  '4to Año': 2010,
  '5to Año': 2009,
  '6to Año': 2008,
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBirthDate(year) {
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.ar', 'outlook.com'];
  const domain = randomItem(domains);
  const suffix = randomInt(100, 999);
  return `${cleanName}.${cleanSurname}${suffix}@${domain}`;
}

async function seedParentsAndStudents() {
  console.log('===============================================================');
  console.log('  GENERADOR DE ALUMNOS Y PADRES MEDIANTE CLOUD FUNCTIONS');
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

  // Obtener oferta académica para asignación realista de niveles y cursos
  let academicOffer = null;
  try {
    const offerSnap = await getDoc(doc(db, 'academicOffer', 'current'));
    if (offerSnap.exists()) {
      academicOffer = offerSnap.data();
    }
  } catch (err) {
    console.warn('Advertencia al consultar oferta académica:', err.message);
  }

  const allCourses = [];
  if (academicOffer) {
    for (const [nivel, cursos] of Object.entries(academicOffer)) {
      for (const [curso, divs] of Object.entries(cursos)) {
        const divisiones = Array.isArray(divs) && divs.length > 0 ? divs : ['A'];
        for (const div of divisiones) {
          allCourses.push({ nivel: nivel.toLowerCase(), curso, division: div });
        }
      }
    }
  }

  // Fallback si la oferta académica está vacía
  if (allCourses.length === 0) {
    allCourses.push(
      { nivel: 'inicial', curso: 'Sala de 4 Años', division: 'A' },
      { nivel: 'inicial', curso: 'Sala de 5 Años', division: 'A' },
      { nivel: 'primario', curso: '1er Grado', division: 'A' },
      { nivel: 'primario', curso: '3er Grado', division: 'A' },
      { nivel: 'primario', curso: '5to Grado', division: 'A' },
      { nivel: 'primario', curso: '7mo Grado', division: 'A' },
      { nivel: 'secundario', curso: '1er Año', division: 'A' },
      { nivel: 'secundario', curso: '3er Año', division: 'A' },
      { nivel: 'secundario', curso: '5to Año', division: 'A' }
    );
  }

  // Configuración de familias a crear:
  // Por defecto se pueden generar 12 familias (distribución: 4 con 1 hijo, 5 con 2 hijos, 3 con 3 hijos) = 23 alumnos
  const FAMILIES_CONFIG = [
    { numChildren: 1 },
    { numChildren: 2 },
    { numChildren: 2 },
    { numChildren: 3 },
    { numChildren: 1 },
    { numChildren: 2 },
    { numChildren: 3 },
    { numChildren: 2 },
    { numChildren: 1 },
    { numChildren: 2 },
    { numChildren: 3 },
    { numChildren: 1 },
  ];

  console.log(`Se generarán ${FAMILIES_CONFIG.length} familias con un total previsto de ` +
    `${FAMILIES_CONFIG.reduce((acc, f) => acc + f.numChildren, 0)} estudiantes asociados.\n`);

  const usedDnis = new Set();
  const usedEmails = new Set();
  let courseIndex = 0;

  let totalFamiliesCreated = 0;
  let totalStudentsCreated = 0;

  for (let fIdx = 0; fIdx < FAMILIES_CONFIG.length; fIdx++) {
    const famConfig = FAMILIES_CONFIG[fIdx];
    const isFemale = Math.random() > 0.5;
    const parentFirst = isFemale ? randomItem(PARENT_FEMALE_NAMES) : randomItem(PARENT_MALE_NAMES);
    const surname = randomItem(SURNAMES);
    const parentName = `${parentFirst} ${surname}`;

    let parentDni;
    do {
      parentDni = String(randomInt(28000000, 39999999));
    } while (usedDnis.has(parentDni));
    usedDnis.add(parentDni);

    let parentEmail;
    do {
      parentEmail = generateCleanEmail(parentFirst, surname);
    } while (usedEmails.has(parentEmail));
    usedEmails.add(parentEmail);

    const street = randomItem(STREETS);
    const streetNum = randomInt(100, 3999);
    const city = randomItem(CITIES);
    const parentDomicilio = `${street} ${streetNum}, ${city}`;
    const parentTelefono = randomPhone();

    // Generar hijos para esta familia
    const studentsPayload = [];
    for (let cIdx = 0; cIdx < famConfig.numChildren; cIdx++) {
      const childIsFemale = Math.random() > 0.5;
      const childFirst = childIsFemale ? randomItem(FEMALE_NAMES) : randomItem(MALE_NAMES);
      const childFullName = `${childFirst} ${surname}`;

      let childDni;
      do {
        childDni = String(randomInt(48000000, 59999999));
      } while (usedDnis.has(childDni));
      usedDnis.add(childDni);

      const targetCourse = allCourses[courseIndex % allCourses.length];
      courseIndex++;

      const birthYear = COURSE_BIRTH_YEARS[targetCourse.curso] || 2017;
      const birthDate = randomBirthDate(birthYear);

      studentsPayload.push({
        nombre: childFullName,
        apellido: surname,
        dni: childDni,
        genero: childIsFemale ? 'Femenino' : 'Masculino',
        fechaNacimiento: birthDate,
        nivel: targetCourse.nivel,
        curso: targetCourse.curso,
        division: targetCourse.division,
        domicilio: parentDomicilio,
      });
    }

    const payload = {
      parentEmail,
      parentName,
      parentDni,
      parentTelefono,
      parentDomicilio,
      students: studentsPayload,
    };

    console.log(`[${fIdx + 1}/${FAMILIES_CONFIG.length}] Creando Familia ${surname}: Padre ${parentName} con ${studentsPayload.length} hijo(s)...`);

    try {
      const res = await callCloudFunction('cf_createParentAndStudents', payload, token);
      console.log(`   ✔ Creado exitosamente en Firebase Auth & Firestore. (Tutor UID: ${res.parentId || 'OK'})`);
      totalFamiliesCreated++;
      totalStudentsCreated += studentsPayload.length;
    } catch (err) {
      console.error(`   ✖ Error al crear familia ${surname}:`, err.message);
    }
  }

  console.log('\n===============================================================');
  console.log('  RESUMEN DE GENERACIÓN:');
  console.log(`  - Familias/Tutores creados: ${totalFamiliesCreated}/${FAMILIES_CONFIG.length}`);
  console.log(`  - Alumnos creados e interconectados: ${totalStudentsCreated}`);
  console.log('  - Se generaron credenciales automáticas en Auth (DNI como contraseña inicial).');
  console.log('===============================================================\n');

  process.exit(0);
}

seedParentsAndStudents().catch((err) => {
  console.error('\nError fatal durante la generación:', err);
  process.exit(1);
});
