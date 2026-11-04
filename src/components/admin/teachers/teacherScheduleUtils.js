/**
 * Utility functions and constants for teacher schedule management (Mañana y Tarde)
 */

export const MORNING_SLOTS = [
  '07:30 - 08:50',
  '09:00 - 10:20',
  '10:30 - 11:50',
];

export const AFTERNOON_SLOTS = [
  '13:30 - 14:50',
  '15:00 - 16:20',
  '16:30 - 17:50',
];

export const ALL_SCHEDULE_SLOTS = [
  ...MORNING_SLOTS,
  ...AFTERNOON_SLOTS,
];

export const DIAS_SEMANA = [
  { key: 'lun', label: 'Lun', full: 'Lunes' },
  { key: 'mar', label: 'Mar', full: 'Martes' },
  { key: 'mie', label: 'Mié', full: 'Miércoles' },
  { key: 'jue', label: 'Jue', full: 'Jueves' },
  { key: 'vie', label: 'Vie', full: 'Viernes' },
];

export const DEFAULT_COURSES_BY_LEVEL = {
  Inicial: [
    { nombre: 'Sala de 3 Años', division: 'Amarilla', display: 'Sala 3 Años (Amarilla - Mañana)', turno: 'Turno Mañana' },
    { nombre: 'Sala de 3 Años', division: 'Roja', display: 'Sala 3 Años (Roja - Tarde)', turno: 'Turno Tarde' },
    { nombre: 'Sala de 4 Años', division: 'Verde', display: 'Sala 4 Años (Verde - Mañana)', turno: 'Turno Mañana' },
    { nombre: 'Sala de 4 Años', division: 'Naranja', display: 'Sala 4 Años (Naranja - Tarde)', turno: 'Turno Tarde' },
    { nombre: 'Sala de 5 Años', division: 'Azul', display: 'Sala 5 Años (Azul - Mañana)', turno: 'Turno Mañana' },
    { nombre: 'Sala de 5 Años', division: 'Blanca', display: 'Sala 5 Años (Blanca - Tarde)', turno: 'Turno Tarde' },
  ],
  Primario: [
    { nombre: '1° Grado', division: 'A', display: '1° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '1° Grado', division: 'B', display: '1° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '2° Grado', division: 'A', display: '2° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '2° Grado', division: 'B', display: '2° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '3° Grado', division: 'A', display: '3° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '3° Grado', division: 'B', display: '3° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '4° Grado', division: 'A', display: '4° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '4° Grado', division: 'B', display: '4° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '5° Grado', division: 'A', display: '5° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '5° Grado', division: 'B', display: '5° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '6° Grado', division: 'A', display: '6° Grado A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '6° Grado', division: 'B', display: '6° Grado B (Turno Tarde)', turno: 'Turno Tarde' },
  ],
  Secundario: [
    { nombre: '1° Año', division: 'A', display: '1° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '1° Año', division: 'B', display: '1° Año B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '2° Año', division: 'A', display: '2° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '2° Año', division: 'B', display: '2° Año B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '3° Año', division: 'A', display: '3° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '3° Año', division: 'B', display: '3° Año B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '4° Año', division: 'A', display: '4° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '4° Año', division: 'B', display: '4° Año B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '5° Año', division: 'A', display: '5° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '5° Año', division: 'B', display: '5° Año B (Turno Tarde)', turno: 'Turno Tarde' },
    { nombre: '6° Año', division: 'A', display: '6° Año A (Turno Mañana)', turno: 'Turno Mañana' },
    { nombre: '6° Año', division: 'B', display: '6° Año B (Turno Tarde)', turno: 'Turno Tarde' },
  ],
};

export const SUBJECTS_SUGGESTIONS = [
  'Matemática Aplicada',
  'Lengua y Literatura',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Física Clásica e Instrumental',
  'Química Orgánica',
  'Laboratorio de Robótica',
  'Inglés Técnico',
  'Educación Física y Deportes',
  'Educación Artística y Música',
];

export const MORNING_SCHEDULE_SUGGESTIONS = [
  'Lun y Mié 07:30 - 08:50',
  'Mar y Jue 09:00 - 10:20',
  'Mié y Vie 10:30 - 11:50',
  'Lun y Jue 07:30 - 08:50',
  'Mar y Vie 10:30 - 11:50',
];

export const AFTERNOON_SCHEDULE_SUGGESTIONS = [
  'Lun y Mié 13:30 - 14:50',
  'Mar y Jue 15:00 - 16:20',
  'Mié y Vie 16:30 - 17:50',
  'Lun y Jue 13:30 - 14:50',
  'Mar y Vie 16:30 - 17:50',
];

export const SLOT_COLOR_CLASSES = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-900 border-amber-200',
  orange: 'bg-amber-100 text-amber-900 border-amber-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export const CATEDRA_COLORS = ['blue', 'emerald', 'amber', 'purple', 'rose', 'indigo'];

export const NIVEL_BADGE_CLASSES = {
  Inicial: 'bg-amber-50 text-amber-700 border-amber-200',
  Primario: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Secundario: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export const ICON_BG_CLASSES = {
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  orange: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  rose: 'bg-rose-100 text-rose-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export const resolveCoursesForNivel = (courses, selectedNivel) => {
  const targetNivelId = String(selectedNivel || 'Secundario').toLowerCase();
  if (Array.isArray(courses) && courses.length > 0) {
    const matching = courses.filter(
      (c) => String(c.nivelId || c.nivel || '').toLowerCase() === targetNivelId
    );
    if (matching.length > 0) {
      return matching.map((c) => {
        const div = c.division ? ` ${c.division}` : '';
        const turno =
          c.turno ||
          (String(c.division || '').toUpperCase().includes('B') ? 'Turno Tarde' : 'Turno Mañana');
        return {
          id: c.id,
          nombre: c.nombre,
          division: c.division || 'A',
          cursoValue: `${c.nombre}${div}`.trim(),
          display: `${c.nombre}${div} (${turno})`,
          turno,
        };
      });
    }
  }
  const fallback = DEFAULT_COURSES_BY_LEVEL[selectedNivel] || DEFAULT_COURSES_BY_LEVEL.Secundario;
  return fallback.map((c) => ({
    ...c,
    cursoValue: `${c.nombre} ${c.division}`.trim(),
  }));
};

export const ensureCompleteGrilla = (existingGrilla = []) => {
  const grillaMap = new Map();
  if (Array.isArray(existingGrilla)) {
    for (const row of existingGrilla) {
      if (row?.hora) grillaMap.set(row.hora, { ...row });
    }
  }

  return ALL_SCHEDULE_SLOTS.map((hora) => {
    if (grillaMap.has(hora)) {
      return grillaMap.get(hora);
    }
    return {
      hora,
      lun: null,
      mar: null,
      mie: null,
      jue: null,
      vie: null,
    };
  });
};

export const matchesSlotToCatedra = (slot, catedra) => {
  if (!slot || !catedra) return false;
  if (slot.catedraId && slot.catedraId === catedra.id) return true;

  const slotCurso = String(slot.curso || '').trim().toLowerCase();
  const catCurso = String(catedra.curso || '').trim().toLowerCase();
  const isSameCurso = slotCurso === catCurso || slotCurso.includes(catCurso) || catCurso.includes(slotCurso);

  const slotMat = String(slot.materia || '').trim().toLowerCase();
  const catNom = String(catedra.nombre || '').trim().toLowerCase();
  const isSameMateria =
    slotMat === catNom ||
    catNom.startsWith(slotMat) ||
    slotMat.startsWith(catNom.slice(0, 4));

  return isSameCurso && isSameMateria;
};

export const deriveScheduleFromGrilla = (grilla = [], catedra) => {
  if (!Array.isArray(grilla) || !catedra) return catedra?.horario || 'Horario a confirmar';

  const slotsByHora = new Map();

  for (const row of grilla) {
    const hora = row.hora;
    for (const dia of DIAS_SEMANA) {
      const slot = row[dia.key];
      if (matchesSlotToCatedra(slot, catedra)) {
        if (!slotsByHora.has(hora)) {
          slotsByHora.set(hora, new Set());
        }
        slotsByHora.get(hora).add(dia.label);
      }
    }
  }

  if (slotsByHora.size === 0) {
    return catedra.horario || 'Sin horario asignado en grilla';
  }

  const result = [];
  slotsByHora.forEach((diasSet, hora) => {
    const dias = Array.from(diasSet);
    const diasStr =
      dias.length === 1
        ? dias[0]
        : `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`;
    result.push(`${diasStr} ${hora}`);
  });

  return result.join(' • ');
};

/**
 * Normaliza el nombre de un curso/división para comparaciones robustas.
 * Ej: "5° Año A", "5° Año - División A", "5to Año A" -> "5ano a"
 */
export const normalizeCourseName = (courseStr = '') => {
  return String(courseStr || '')
    .toLowerCase()
    .replace(/[º°]/g, '')
    .replace(/to|er|do|ro|vo/g, '')
    .replace(/divisi[oó]n/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const areCoursesEqual = (courseA, courseB) => {
  if (!courseA || !courseB) return false;
  const normA = normalizeCourseName(courseA);
  const normB = normalizeCourseName(courseB);
  if (normA === normB) return true;
  return normA.includes(normB) || normB.includes(normA);
};

export const getDiaFullLabel = (diaKey) => {
  const found = DIAS_SEMANA.find((d) => d.key === diaKey);
  return found?.full || found?.label || diaKey;
};

/**
 * Busca si un curso/división ya está ocupado por OTRO docente en el mismo día y franja horaria.
 * Retorna null si está libre, o un objeto con detalles del conflicto: { teacherName, subjectName, hora, dia, curso }
 */
export const findCourseScheduleConflict = (
  allTeachers = [],
  currentTeacherId,
  targetCourse,
  hora,
  diaKey
) => {
  if (!targetCourse || !hora || !diaKey || !Array.isArray(allTeachers)) {
    return null;
  }

  for (const t of allTeachers) {
    if (t.id === currentTeacherId) continue;
    if (!Array.isArray(t.grillaHoraria)) continue;

    const row = t.grillaHoraria.find((r) => r.hora === hora);
    if (!row) continue;

    const slot = row[diaKey];
    if (!slot || !slot.curso) continue;

    if (areCoursesEqual(slot.curso, targetCourse)) {
      const tName =
        t.nombreCompleto ||
        (t.apellido ? `${t.nombre} ${t.apellido}` : t.nombre) ||
        'Otro docente';

      return {
        teacherId: t.id,
        teacherName: tName,
        teacherLegajo: t.legajo || '',
        subjectName: slot.materia || 'Materia curricular',
        hora,
        dia: diaKey,
        diaLabel: getDiaFullLabel(diaKey),
        curso: slot.curso,
      };
    }
  }

  return null;
};

export const findCurrentTeacher = (user, teachers = []) => {
  if (!Array.isArray(teachers) || teachers.length === 0) return null;
  const userEmail = String(user?.email || '').trim().toLowerCase();
  const userId = String(user?.uid || user?.id || '').trim();

  const byMatch = teachers.find(
    (t) =>
      (userId && String(t.id) === userId) ||
      (userEmail && String(t.email || '').trim().toLowerCase() === userEmail)
  );
  if (byMatch) return byMatch;

  return teachers.find((t) => Array.isArray(t.catedras) && t.catedras.length > 0) || teachers[0];
};
