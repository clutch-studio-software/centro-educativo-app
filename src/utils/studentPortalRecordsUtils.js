/**
 * Utilidades para resolver registros reales de Asistencias, Enfermería y Preceptoría
 * desde Firebase Firestore para el Portal del Estudiante y la Familia.
 */

/**
 * Resuelve el balance de asistencias e inasistencias de un alumno a partir de sus datos reales en Firestore
 */
export const getStudentAttendanceData = (student) => {
  if (!student || !student.asistencias || typeof student.asistencias !== 'object') {
    return {
      porcentaje: 100,
      presentes: 0,
      faltasInjustificadas: 0,
      faltasJustificadas: 0,
      tardanzas: 0,
      totalFaltas: 0,
      historial: [],
    };
  }

  const raw = student.asistencias;
  const historial = Array.isArray(raw.historial)
    ? raw.historial
    : Array.isArray(raw.detalle)
      ? raw.detalle
      : [];

  const faltasInjustificadas =
    typeof raw.faltasInjustificadas === 'number'
      ? raw.faltasInjustificadas
      : historial.filter(
          (h) =>
            h.estado === 'injustificada' ||
            String(h.tipo || '').toLowerCase().includes('injustificada')
        ).length;

  const faltasJustificadas =
    typeof raw.faltasJustificadas === 'number'
      ? raw.faltasJustificadas
      : historial.filter(
          (h) =>
            h.estado === 'justificada' ||
            h.estado === 'justificacion_pendiente' ||
            (String(h.tipo || '').toLowerCase().includes('justificada') &&
              !String(h.tipo || '').toLowerCase().includes('injustificada'))
        ).length;

  const tardanzas =
    typeof raw.tardanzas === 'number'
      ? raw.tardanzas
      : historial.filter(
          (h) =>
            h.estado === 'tardanza' || String(h.tipo || '').toLowerCase().includes('tardanza')
        ).length;

  const presentes =
    typeof raw.presentes === 'number'
      ? raw.presentes
      : historial.filter(
          (h) =>
            h.estado === 'presente' || String(h.tipo || '').toLowerCase().includes('presente')
        ).length;

  const totalFaltas = faltasInjustificadas + faltasJustificadas;
  const totalClases =
    typeof raw.totalClases === 'number' && raw.totalClases > 0
      ? raw.totalClases
      : presentes + totalFaltas + tardanzas;

  let porcentaje = 100;
  if (typeof raw.porcentajeAsistencia === 'number') {
    porcentaje = raw.porcentajeAsistencia;
  } else if (typeof raw.porcentaje === 'number') {
    porcentaje = raw.porcentaje;
  } else if (totalClases > 0) {
    const faltaEquivalente = totalFaltas + tardanzas * 0.5;
    porcentaje = Math.max(0, Math.min(100, Math.round(((totalClases - faltaEquivalente) / totalClases) * 100)));
  } else if (totalFaltas > 0 || tardanzas > 0) {
    const baseDiasLectivos = 180;
    const faltaEquivalente = totalFaltas + tardanzas * 0.5;
    porcentaje = Math.max(0, Math.min(100, Math.round(((baseDiasLectivos - faltaEquivalente) / baseDiasLectivos) * 100)));
  }

  // En el historial del portal mostramos inasistencias y tardanzas (o todos los eventos relevantes ordenados por fecha desc)
  const visibleHistory = historial.filter((h) => h.estado !== 'presente');

  return {
    porcentaje,
    presentes,
    faltasInjustificadas,
    faltasJustificadas,
    tardanzas,
    totalFaltas,
    historial: visibleHistory,
    fullHistorial: historial,
  };
};

/**
 * Resuelve las entradas reales de enfermería del alumno desde Firestore
 */
export const getStudentHealthRecords = (student) => {
  if (!student) return [];
  if (Array.isArray(student.entradasEnfermeria)) {
    return student.entradasEnfermeria;
  }
  if (Array.isArray(student.historialEnfermeria)) {
    return student.historialEnfermeria;
  }
  return [];
};

/**
 * Resuelve las entradas reales de preceptoría del alumno desde Firestore
 */
export const getStudentPreceptoriaRecords = (student) => {
  if (!student) return [];
  if (Array.isArray(student.entradasPreceptoria)) {
    return student.entradasPreceptoria;
  }
  if (Array.isArray(student.observacionesPreceptoria)) {
    return student.observacionesPreceptoria;
  }
  return [];
};
