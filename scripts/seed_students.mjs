import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
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

// 2. Oferta académica por defecto (si no existe en Firestore)
const DEFAULT_ACADEMIC_OFFER = {
  Inicial: {
    'Sala de 2 Años': ['A'],
    'Sala de 3 Años': ['A'],
    'Sala de 4 Años': ['A'],
    'Sala de 5 Años': ['A'],
  },
  Primario: {
    '1er Grado': ['A'],
    '2do Grado': ['A'],
    '3er Grado': ['A'],
    '4to Grado': ['A'],
    '5to Grado': ['A'],
    '6to Grado': ['A'],
    '7mo Grado': ['A'],
  },
  Secundario: {
    '1er Año': ['A'],
    '2do Año': ['A'],
    '3er Año': ['A'],
    '4to Año': ['A'],
    '5to Año': ['A'],
    '6to Año': ['A'],
  },
};

// 3. Pool de datos realistas de Argentina
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

const SERVICES_POOL = [
  'Comedor Escolar',
  'Transporte Escolar',
  'Club Deportivo',
  'Jornada Extendida',
  'Taller de Robótica',
  'Taller de Arte',
  'Inglés Extracurricular',
];

const CITIES = ['Santa Fe', 'Rosario', 'Santo Tomé', 'Esperanza', 'Rafaela', 'Paraná'];

// 4. Mapeo de edad por curso (año base actual: 2026/2027)
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

// Generadores de datos aleatorios
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

function randomServices() {
  const count = randomInt(1, 3);
  const shuffled = [...SERVICES_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateCleanEmail(name, surname) {
  const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
  const cleanSurname = surname.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.ar', 'outlook.com'];
  const domain = randomItem(domains);
  const suffix = randomInt(10, 99);
  return `${cleanName}.${cleanSurname}${suffix}@${domain}`;
}

async function seed() {
  console.log('==================================================');
  console.log('Iniciando Seeder de Alumnos y Tutores para Firestore');
  console.log('==================================================');

  // Autenticar como administrador
  const adminKey = envVars.VITE_DEV_ADMIN_KEY || envVars.VITE_ADMIN_PASSWORD;
  const userCred = await signInWithEmailAndPassword(auth, envVars.VITE_ADMIN_EMAIL, adminKey);
  console.log(`Sesión iniciada con UID: ${userCred.user.uid}`);

  // 1. Obtener o inicializar la Oferta Académica
  console.log('\nConsultando oferta académica...');
  let academicOffer = { ...DEFAULT_ACADEMIC_OFFER };
  try {
    const offerDoc = await getDoc(doc(db, 'academicOffer', 'current'));
    if (offerDoc.exists()) {
      academicOffer = offerDoc.data();
      console.log('Oferta académica obtenida desde Firestore.');
    } else {
      console.log('Documento academicOffer/current no existía. Guardándolo con los cursos oficiales...');
      await setDoc(doc(db, 'academicOffer', 'current'), DEFAULT_ACADEMIC_OFFER);
      console.log('academicOffer/current inicializado exitosamente.');
    }
  } catch (err) {
    console.warn('Advertencia al consultar academicOffer:', err.message);
  }

  // 2. Analizar estudiantes existentes por curso y división
  console.log('\nVerificando estudiantes existentes en Firestore...');
  const studentsSnap = await getDocs(collection(db, 'students'));
  const existingStudents = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Total de estudiantes actuales en la base de datos: ${existingStudents.length}`);

  // Agrupar existentes por key: "Nivel_Curso_Division"
  const existingMap = new Map();
  for (const s of existingStudents) {
    const rawNivel = String(s.nivel || '').toLowerCase();
    const nivelKey = rawNivel.includes('ini') ? 'Inicial' : rawNivel.includes('sec') ? 'Secundario' : 'Primario';
    const curso = s.curso || 'sin asignar';
    const division = s.division || 'A';
    const key = `${nivelKey}__${curso}__${division}`;
    existingMap.set(key, (existingMap.get(key) || 0) + 1);
  }

  // 3. Determinar cuántos alumnos faltan por cada curso y división (al menos 10)
  const TARGET_PER_GROUP = 10;
  const groupsToPopulate = [];

  for (const [nivel, cursos] of Object.entries(academicOffer)) {
    for (const [curso, divisiones] of Object.entries(cursos)) {
      const divs = Array.isArray(divisiones) && divisiones.length > 0 ? divisiones : ['A'];
      for (const div of divs) {
        const key = `${nivel}__${curso}__${div}`;
        const currentCount = existingMap.get(key) || 0;
        const needed = Math.max(0, TARGET_PER_GROUP - currentCount);
        groupsToPopulate.push({
          nivel,
          curso,
          division: div,
          currentCount,
          needed,
          key,
        });
      }
    }
  }

  console.log('\nResumen de cursos y divisiones:');
  let totalStudentsToCreate = 0;
  for (const g of groupsToPopulate) {
    console.log(`- [${g.nivel}] ${g.curso} Div "${g.division}": actuales ${g.currentCount}, a crear: ${g.needed}`);
    totalStudentsToCreate += g.needed;
  }

  if (totalStudentsToCreate === 0) {
    console.log('\n¡Todos los cursos y divisiones ya cuentan con al menos 10 alumnos!');
    console.log('No se requiere crear nuevos estudiantes.');
    process.exit(0);
  }

  console.log(`\nTotal de nuevos estudiantes a generar: ${totalStudentsToCreate}`);

  // 4. Crear familias (tutores)
  // Calculamos aproximadamente 1 tutor cada 1 a 2 alumnos para que parezcan familias reales
  const tutorsCount = Math.max(15, Math.ceil(totalStudentsToCreate / 1.8));
  console.log(`Generando ${tutorsCount} tutores (familias) realistas...`);

  const families = [];
  const usedDnis = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < tutorsCount; i++) {
    const isFemale = Math.random() > 0.5;
    const parentFirst = isFemale ? randomItem(PARENT_FEMALE_NAMES) : randomItem(PARENT_MALE_NAMES);
    const surname = randomItem(SURNAMES);
    const fullName = `${parentFirst} ${surname}`;

    let dni;
    do {
      dni = String(randomInt(28000000, 37999999));
    } while (usedDnis.has(dni));
    usedDnis.add(dni);

    let email;
    do {
      email = generateCleanEmail(parentFirst, surname);
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const street = randomItem(STREETS);
    const streetNum = randomInt(100, 3999);
    const city = randomItem(CITIES);
    const address = `${street} ${streetNum}, ${city}`;
    const phone = randomPhone();

    const tutorDocRef = doc(collection(db, 'users'));

    families.push({
      ref: tutorDocRef,
      id: tutorDocRef.id,
      nombre: fullName,
      surname,
      dni,
      email,
      telefono: phone,
      domicilio: address,
      studentIds: [],
    });
  }

  // 5. Generar estudiantes asignándolos a los grupos necesarios y vinculándolos a las familias
  const studentsToCreate = [];
  let familyIndex = 0;

  for (const g of groupsToPopulate) {
    if (g.needed <= 0) continue;

    for (let i = 0; i < g.needed; i++) {
      const family = families[familyIndex % families.length];
      familyIndex++;

      const isFemale = Math.random() > 0.5;
      const studentFirst = isFemale ? randomItem(FEMALE_NAMES) : randomItem(MALE_NAMES);
      // El alumno lleva el apellido de la familia
      const studentFullName = `${studentFirst} ${family.surname}`;

      let studentDni;
      do {
        studentDni = String(randomInt(48000000, 59999999));
      } while (usedDnis.has(studentDni));
      usedDnis.add(studentDni);

      const birthYear = COURSE_BIRTH_YEARS[g.curso] || 2018;
      const birthDate = randomBirthDate(birthYear);

      const randomFive = String(randomInt(10000, 99999));
      const studentID_login = `EST-2027-${randomFive}`;

      const studentDocRef = doc(collection(db, 'students'));
      family.studentIds.push(studentDocRef.id);

      studentsToCreate.push({
        ref: studentDocRef,
        id: studentDocRef.id,
        data: {
          studentID_login,
          parentId: family.id,
          emailPadre: family.email,
          status: 'active',
          mustChangePassword: true,
          nombre: studentFullName,
          dni: studentDni,
          genero: isFemale ? 'Femenino' : 'Masculino',
          fechaNacimiento: birthDate,
          nivel: g.nivel.toLowerCase(),
          curso: g.curso,
          division: g.division,
          domicilio: family.domicilio,
          servicios: randomServices(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      });
    }
  }

  console.log(`\nSe prepararon ${studentsToCreate.length} estudiantes y ${families.length} tutores para persistir.`);

  // 6. Preparar operaciones por lotes (writeBatch en chunks de hasta 250 operaciones)
  const operations = [];

  // Operaciones para los tutores (en colección 'users')
  for (const fam of families) {
    // Solo guardar familias que tengan alumnos asignados
    if (fam.studentIds.length === 0) continue;
    operations.push({
      ref: fam.ref,
      data: {
        role: 'Padre',
        nombre: fam.nombre,
        dni: fam.dni,
        email: fam.email,
        telefono: fam.telefono,
        domicilio: fam.domicilio,
        emailInvalid: false,
        mustChangePassword: true,
        studentIds: fam.studentIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    });
  }

  // Operaciones para los estudiantes (en colección 'students')
  for (const s of studentsToCreate) {
    operations.push({
      ref: s.ref,
      data: s.data,
    });
  }

  console.log(`Total de operaciones de escritura a realizar en Firestore: ${operations.length}`);

  // Ejecutar por lotes de 200 para evitar límites de Firestore (límite máximo 500)
  const BATCH_SIZE = 200;
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = operations.slice(i, i + BATCH_SIZE);
    for (const op of chunk) {
      batch.set(op.ref, op.data);
    }
    console.log(`Guardando lote ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} documentos)...`);
    await batch.commit();
  }

  console.log('\n==================================================');
  console.log('¡Seeder completado con éxito!');
  console.log(`- Alumnos nuevos creados: ${studentsToCreate.length}`);
  console.log(`- Tutores nuevos registrados y vinculados: ${families.filter(f => f.studentIds.length > 0).length}`);
  console.log(`- Cada uno de los cursos y divisiones ahora tiene al menos ${TARGET_PER_GROUP} alumnos.`);
  console.log('==================================================\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('\nError fatal durante la ejecución del seeder:', err);
  process.exit(1);
});
