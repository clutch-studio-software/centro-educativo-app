/**
 * Utilidades para resolver registros de Asistencias, Enfermería y Preceptoría
 * para el Portal del Estudiante y la Familia.
 */

const DEFAULT_ATTENDANCE_HISTORY = [
  {
    id: 'att-01',
    fecha: '2026-10-28',
    tipo: 'Falta Injustificada',
    motivo: 'Ausencia sin justificativo médico ni notificación previa del tutor.',
    estado: 'injustificada',
  },
  {
    id: 'att-02',
    fecha: '2026-10-14',
    tipo: 'Falta Injustificada',
    motivo: 'Inasistencia sin retiro autorizado ni aviso a preceptoría.',
    estado: 'injustificada',
  },
  {
    id: 'att-03',
    fecha: '2026-09-22',
    tipo: 'Falta Justificada',
    motivo: 'Certificado de reposo médico pediátrico presentado en término.',
    estado: 'justificada',
  },
  {
    id: 'att-04',
    fecha: '2026-09-08',
    tipo: 'Tardanza',
    motivo: 'Ingreso al establecimiento 08:20 hs (inicio de jornada: 07:45 hs).',
    estado: 'tardanza',
  },
];

const DEFAULT_ENFERMERIA_RECORDS = [
  {
    id: 'enf-01',
    fecha: '2026-10-24T10:15:00Z',
    tipo: 'Atención / Primeros Auxilios',
    motivo: 'Raspón superficial en rodilla durante actividad física. Se realizó desinfección y colocación de apósito.',
    autor: 'Lic. Laura Benítez',
    autorEmail: 'enfermeria@colegio.edu.ar',
    notificadoFamilias: true,
  },
  {
    id: 'enf-02',
    fecha: '2026-09-19T14:30:00Z',
    tipo: 'Suministro de Medicación Autorizada',
    motivo: 'Suministro de comprimido antialérgico bajo prescripción médica archivada en el legajo de salud.',
    autor: 'Lic. Laura Benítez',
    autorEmail: 'enfermeria@colegio.edu.ar',
    notificadoFamilias: true,
  },
];

const DEFAULT_PRECEPTORIA_RECORDS = [
  {
    id: 'prec-01',
    fecha: '2026-10-18T09:00:00Z',
    tipo: 'Observación de Convivencia',
    motivo: 'Destacada colaboración solidaria y respeto de las pautas áulicas durante la jornada institucional.',
    autor: 'Preceptor Carlos Rossi',
    autorEmail: 'preceptoria@colegio.edu.ar',
  },
  {
    id: 'prec-02',
    fecha: '2026-09-12T11:45:00Z',
    tipo: 'Notificación Institucional',
    motivo: 'Registro de retiro anticipado formalizado por el tutor en el cuaderno institucional.',
    autor: 'Preceptor Carlos Rossi',
    autorEmail: 'preceptoria@colegio.edu.ar',
  },
];

/**
 * Resuelve el balance de asistencias e inasistencias de un alumno
 */
export const getStudentAttendanceData = (student) => {
  if (!student) {
    return {
      porcentaje: 100,
      faltasInjustificadas: 0,
      faltasJustificadas: 0,
      tardanzas: 0,
      totalFaltas: 0,
      historial: [],
    };
  }

  if (student.asistencias && typeof student.asistencias === 'object') {
    const raw = student.asistencias;
    const historial = Array.isArray(raw.historial)
      ? raw.historial
      : Array.isArray(raw.detalle)
        ? raw.detalle
        : [];
    const faltasInjustificadas =
      typeof raw.faltasInjustificadas === 'number'
        ? raw.faltasInjustificadas
        : historial.filter((h) => h.tipo?.toLowerCase().includes('injustificada')).length;
    const faltasJustificadas =
      typeof raw.faltasJustificadas === 'number'
        ? raw.faltasJustificadas
        : historial.filter((h) => h.tipo?.toLowerCase().includes('justificada')).length;
    const tardanzas =
      typeof raw.tardanzas === 'number'
        ? raw.tardanzas
        : historial.filter((h) => h.tipo?.toLowerCase().includes('tardanza')).length;

    return {
      porcentaje: raw.porcentajeAsistencia || raw.porcentaje || 94,
      faltasInjustificadas,
      faltasJustificadas,
      tardanzas,
      totalFaltas: faltasInjustificadas + faltasJustificadas,
      historial,
    };
  }

  // Si no tiene registro explícito, proporcionar el padrón institucional de demostración
  return {
    porcentaje: 94,
    faltasInjustificadas: 2,
    faltasJustificadas: 1,
    tardanzas: 1,
    totalFaltas: 3,
    historial: DEFAULT_ATTENDANCE_HISTORY,
  };
};

/**
 * Resuelve las entradas de enfermería del alumno
 */
export const getStudentHealthRecords = (student) => {
  if (!student) return [];
  if (Array.isArray(student.entradasEnfermeria) && student.entradasEnfermeria.length > 0) {
    return student.entradasEnfermeria;
  }
  if (Array.isArray(student.historialEnfermeria) && student.historialEnfermeria.length > 0) {
    return student.historialEnfermeria;
  }
  return DEFAULT_ENFERMERIA_RECORDS;
};

/**
 * Resuelve las entradas de preceptoría del alumno
 */
export const getStudentPreceptoriaRecords = (student) => {
  if (!student) return [];
  if (Array.isArray(student.entradasPreceptoria) && student.entradasPreceptoria.length > 0) {
    return student.entradasPreceptoria;
  }
  if (Array.isArray(student.observacionesPreceptoria) && student.observacionesPreceptoria.length > 0) {
    return student.observacionesPreceptoria;
  }
  return DEFAULT_PRECEPTORIA_RECORDS;
};
