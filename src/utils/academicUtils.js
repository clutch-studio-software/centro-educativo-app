import { parseCourseDivision } from '../data/mockAcademicOffer.js';

/**
 * Cursos canónicos estandarizados por nivel educativo
 */
export const COURSES_BY_ACADEMIC_LEVEL = {
  inicial: [
    'Sala de 2 Años',
    'Sala de 3 Años',
    'Sala de 4 Años',
    'Sala de 5 Años',
  ],
  primario: [
    '1er Grado',
    '2do Grado',
    '3er Grado',
    '4to Grado',
    '5to Grado',
    '6to Grado',
    '7mo Grado',
  ],
  secundario: [
    '1er Año',
    '2do Año',
    '3er Año',
    '4to Año',
    '5to Año',
    '6to Año',
  ],
};

/**
 * Normaliza un texto para comparación tolerante a acentos, grados ordinales y espacios.
 * Ej: "1er Grado", "1° Grado", "1º Grado" -> "1 grad"
 */
export const normalizeAcademicText = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
    .replace(/(\d+)(?:er|do|to|mo|ro|°|º)/gi, '$1') // Quitar sufijos ordinales pegados a dígitos: 1er, 1°, 2do, 4to
    .replace(/°|º/g, '') // Quitar símbolo de grado suelto
    .replace(/de\s+/gi, '') // "Sala de 3 Años" -> "Sala 3 Años"
    .replace(/[\s\-_"']+/g, ' '); // Espacios consistentes

/**
 * Normaliza el identificador de nivel a 'inicial', 'primario' o 'secundario'
 */
export const normalizeNivel = (nivel = '') => {
  const norm = String(nivel).toLowerCase();
  if (norm.includes('ini')) return 'inicial';
  if (norm.includes('sec')) return 'secundario';
  return 'primario';
};

/**
 * Determina si un alumno pertenece a una división/curso determinado.
 */
export const matchesStudentToDivision = (student, course) => {
  if (!student || !course) return false;

  // 1. Verificación directa por ID si está asociado
  if (student.cursoId && student.cursoId === course.id) {
    return true;
  }

  // 2. Si el alumno explícitamente no tiene asignado curso o división
  const sCurso = String(student.curso || '').trim().toLowerCase();
  const sDiv = String(student.division || '').trim().toLowerCase();
  if (
    sCurso === 'sin asignar' ||
    sCurso === '' ||
    sDiv === 'sin asignar' ||
    sDiv === ''
  ) {
    return false;
  }

  // 3. Verificación de nivel pedagógico (Inicial, Primario, Secundario)
  if (student.nivel && course.nivelId) {
    if (normalizeNivel(student.nivel) !== normalizeNivel(course.nivelId)) {
      return false;
    }
  }

  // 4. Extraer nombre y división del curso
  const { nombre: cNombre, division: cDivision } = parseCourseDivision(course);
  const normCNombre = normalizeAcademicText(cNombre);
  const normCDivision = normalizeAcademicText(cDivision || 'A');

  const normSCurso = normalizeAcademicText(student.curso);
  const normSDivision = normalizeAcademicText(student.division || '');

  // Caso A: División explícita coincidente
  if (normSDivision && normSDivision !== 'sin asignar') {
    const isDivisionEqual = normSDivision === normCDivision;
    const isCourseEqual =
      normSCurso.includes(normCNombre) || normCNombre.includes(normSCurso);

    if (isDivisionEqual && isCourseEqual) {
      return true;
    }
  }

  // Caso B: El campo curso del estudiante tiene la división embebida (ej: "1er Grado A", "4to Año B", "Sala Verde")
  const combinedStudent = `${normSCurso} ${normSDivision}`;
  const courseMatch =
    combinedStudent.includes(normCNombre) || normCNombre.includes(normSCurso);
  const divisionMatch = combinedStudent.includes(normCDivision);

  return courseMatch && divisionMatch;
};

/**
 * Filtra los alumnos que están asignados a un curso/división específico.
 */
export const getEnrolledStudentsForCourse = (students = [], course) => {
  if (!Array.isArray(students) || !course) return [];
  return students.filter((student) => matchesStudentToDivision(student, course));
};

/**
 * Prioridad numérica del nivel educativo:
 * Inicial (1) -> Primario (2) -> Secundario (3)
 */
export const getNivelOrder = (nivel = '') => {
  const norm = String(nivel).toLowerCase();
  if (norm.includes('ini')) return 1;
  if (norm.includes('prim')) return 2;
  if (norm.includes('sec')) return 3;
  return 99;
};

/**
 * Calcula un peso/rango numérico para un curso según su nivel intrínseco y grado/año/sala.
 */
export const getCourseRank = (courseName = '') => {
  const text = String(courseName).toLowerCase().trim();
  if (!text || text === 'sin asignar') return 99999;

  let base = 500;
  if (text.includes('sala') || text.includes('jardin') || text.includes('maternal')) {
    base = 100;
  } else if (text.includes('grado') || text.includes('primar')) {
    base = 200;
  } else if (text.includes('año') || text.includes('ano') || text.includes('secundar')) {
    base = 300;
  }

  // Extraer número
  const digitMatch = text.match(/\d+/);
  if (digitMatch) {
    return base + parseInt(digitMatch[0], 10);
  }

  // Ordinales en palabras
  if (text.includes('primer')) return base + 1;
  if (text.includes('segund')) return base + 2;
  if (text.includes('tercer')) return base + 3;
  if (text.includes('cuart')) return base + 4;
  if (text.includes('quint')) return base + 5;
  if (text.includes('sext')) return base + 6;
  if (text.includes('septim') || text.includes('séptim')) return base + 7;

  return base;
};

/**
 * Compara dos nombres de cursos para ordenarlos pedagógica y numéricamente.
 */
export const compareCourseNames = (a = '', b = '') => {
  const strA = String(a).trim();
  const strB = String(b).trim();

  const rankA = getCourseRank(strA);
  const rankB = getCourseRank(strB);

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return strA.localeCompare(strB, 'es', { numeric: true, sensitivity: 'base' });
};

/**
 * Compara dos divisiones alfabéticamente (A, B, C, D o nombres de salas/colores).
 */
export const compareDivisions = (a = '', b = '') => {
  const strA = String(a || '').trim();
  const strB = String(b || '').trim();

  if (!strA && !strB) return 0;
  if (!strA) return 1;
  if (!strB) return -1;

  return strA.localeCompare(strB, 'es', { numeric: true, sensitivity: 'base' });
};

/**
 * Compara dos objetos de curso completos (como los de la oferta académica),
 * ordenando primero por Nivel (Inicial -> Primario -> Secundario), luego por Curso (1°, 2°, 3°...)
 * y finalmente por División (A, B, C...).
 */
export const compareCourseObjects = (a, b) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // 1. Comparar Nivel si difieren
  const nivelA = getNivelOrder(a.nivelId || a.nivel);
  const nivelB = getNivelOrder(b.nivelId || b.nivel);
  if (nivelA !== nivelB) {
    return nivelA - nivelB;
  }

  // 2. Extraer nombre y división del curso
  const { nombre: nombreA, division: divA } = parseCourseDivision(a);
  const { nombre: nombreB, division: divB } = parseCourseDivision(b);

  const courseDiff = compareCourseNames(nombreA, nombreB);
  if (courseDiff !== 0) {
    return courseDiff;
  }

  // 3. Comparar División si el curso es el mismo
  return compareDivisions(divA || a.division, divB || b.division);
};

export const sortCourseNames = (courseNames = []) => {
  if (!Array.isArray(courseNames)) return [];
  return [...courseNames].sort(compareCourseNames);
};

export const sortDivisions = (divisions = []) => {
  if (!Array.isArray(divisions)) return [];
  return [...divisions].sort(compareDivisions);
};

export const sortCourseObjects = (courses = []) => {
  if (!Array.isArray(courses)) return [];
  return [...courses].sort(compareCourseObjects);
};

