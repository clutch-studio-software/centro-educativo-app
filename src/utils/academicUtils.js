import { parseCourseDivision } from '../data/mockAcademicOffer.js';

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
