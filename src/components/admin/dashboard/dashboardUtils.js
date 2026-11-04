import { getStudentTransportRoute } from '../../../utils/academicUtils';

/**
 * Normaliza y clasifica el nivel educativo de un estudiante.
 */
export const inferStudentNivel = (student) => {
  const nivelStr = String(student?.nivel || '').toLowerCase();
  const cursoStr = String(student?.curso || '').toLowerCase();

  if (nivelStr.includes('inic') || cursoStr.includes('sala')) {
    return 'Inicial';
  }
  if (nivelStr.includes('prim') || cursoStr.includes('grado')) {
    return 'Primario';
  }
  return 'Secundario';
};

/**
 * Calcula estadísticas y métricas de matrícula y servicios escolares a partir de la nómina de alumnos.
 */
export const computeEnrollmentStats = (students = []) => {
  const safeStudents = Array.isArray(students) ? students : [];
  const total = safeStudents.length;

  const porNivel = {
    Inicial: 0,
    Primario: 0,
    Secundario: 0,
  };

  const servicios = {
    comedor: 0,
    transporte: 0,
    deportes: 0,
  };

  const transportePorRecorrido = {
    'Recorrido 1': 0,
    'Recorrido 2': 0,
    'Recorrido 3': 0,
    'Recorrido 4': 0,
  };

  const cursoMap = new Map();

  for (const s of safeStudents) {
    const nivel = inferStudentNivel(s);
    if (porNivel[nivel] !== undefined) {
      porNivel[nivel] += 1;
    }

    // Comedor
    const sServicios = Array.isArray(s.servicios) ? s.servicios : [];
    const hasComedor =
      s.comedor === true ||
      sServicios.some((x) => String(x).toLowerCase().includes('comedor'));
    if (hasComedor) {
      servicios.comedor += 1;
    }

    // Transporte y Recorrido
    const route = getStudentTransportRoute(s);
    const hasTransport =
      Boolean(route) ||
      sServicios.some((x) => String(x).toLowerCase().includes('transporte'));

    if (hasTransport) {
      servicios.transporte += 1;
      const routeId = route?.id || s.recorridoTransporte;
      if (routeId && transportePorRecorrido[routeId] !== undefined) {
        transportePorRecorrido[routeId] += 1;
      }
    }

    // Deportes
    const hasSports =
      (Array.isArray(s.deportes) && s.deportes.length > 0) ||
      (Array.isArray(s.disciplinas) && s.disciplinas.length > 0);
    if (hasSports) {
      servicios.deportes += 1;
    }

    // Ocupación por curso
    const cursoKey = String(s.curso || 'Sin Asignar').trim();
    if (!cursoMap.has(cursoKey)) {
      cursoMap.set(cursoKey, { curso: cursoKey, nivel, count: 0 });
    }
    cursoMap.get(cursoKey).count += 1;
  }

  const cursosDistribucion = Array.from(cursoMap.values()).sort((a, b) =>
    a.curso.localeCompare(b.curso, undefined, { numeric: true })
  );

  return {
    total,
    porNivel,
    servicios,
    transportePorRecorrido,
    cursosDistribucion,
  };
};

/**
 * Obtiene y unifica las últimas atenciones de enfermería de todos los estudiantes, ordenadas cronológicamente.
 */
export const getRecentEnfermeriaEntries = (students = [], limit = 8) => {
  if (!Array.isArray(students)) return [];

  const allEntries = [];

  for (const s of students) {
    const entries = Array.isArray(s.entradasEnfermeria)
      ? s.entradasEnfermeria
      : Array.isArray(s.historialEnfermeria)
      ? s.historialEnfermeria
      : [];

    for (const entry of entries) {
      allEntries.push({
        ...entry,
        studentId: s.id,
        studentName: s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`.trim() || 'Estudiante',
        studentDni: s.dni || '',
        studentLegajo: s.studentID_login || '',
        studentCurso: s.curso || 'Sin curso',
        studentNivel: inferStudentNivel(s),
      });
    }
  }

  return allEntries
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, limit);
};

/**
 * Obtiene y unifica las últimas actas y observaciones de preceptoría de todos los estudiantes, ordenadas cronológicamente.
 */
export const getRecentPreceptoriaEntries = (students = [], limit = 8) => {
  if (!Array.isArray(students)) return [];

  const allEntries = [];

  for (const s of students) {
    const entries = Array.isArray(s.entradasPreceptoria)
      ? s.entradasPreceptoria
      : Array.isArray(s.observacionesPreceptoria)
      ? s.observacionesPreceptoria
      : [];

    for (const entry of entries) {
      allEntries.push({
        ...entry,
        studentId: s.id,
        studentName: s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`.trim() || 'Estudiante',
        studentDni: s.dni || '',
        studentLegajo: s.studentID_login || '',
        studentCurso: s.curso || 'Sin curso',
        studentNivel: inferStudentNivel(s),
      });
    }
  }

  return allEntries
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, limit);
};

/**
 * Formatea una fecha ISO para visualización clara en tablas y tarjetas de dashboard.
 */
export const formatDashboardDate = (isoString) => {
  if (!isoString) return 'Fecha no especificada';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${mins} hs`;
  } catch {
    return String(isoString);
  }
};
