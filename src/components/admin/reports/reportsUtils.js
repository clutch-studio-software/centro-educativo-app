import {
  TRANSPORT_ROUTES,
  getStudentTransportRoute,
  getStudentSubjectsWithTeachers,
  normalizeNivel,
} from '../../../utils/academicUtils';

/**
 * Reportes Oficiales disponibles en la Central Directiva
 */
export const REPORT_TYPES = [
  {
    id: 'reporte-alumno',
    label: 'Reporte por Alumno',
    shortLabel: 'Por Alumno',
    icon: 'person_search',
    description: 'Curso, materias, profesores asignados, deportes, transporte y comedor del estudiante.',
  },
  {
    id: 'reporte-docente',
    label: 'Reporte por Docente',
    shortLabel: 'Por Docente',
    icon: 'badge',
    description: 'Cursos a cargo por nivel y horarios semanales de dictado de cada curso.',
  },
  {
    id: 'alumnos-por-curso',
    label: 'Alumnos por Curso',
    shortLabel: 'Alumnos x Curso',
    icon: 'groups',
    description: 'Nómina oficial de alumnos matriculados filtrada por nivel educativo y división.',
  },
  {
    id: 'docentes-por-materia',
    label: 'Docentes por Materia',
    shortLabel: 'Docentes x Materia',
    icon: 'menu_book',
    description: 'Directorio de materias con lista de profesores asignados y cátedras por nivel.',
  },
  {
    id: 'cursos-por-nivel',
    label: 'Cursos por Nivel',
    shortLabel: 'Cursos x Nivel',
    icon: 'domain',
    description: 'Divisiones por nivel (Inicial, Primario, Secundario), turnos y ocupación de cupos.',
  },
  {
    id: 'alumnos-por-deporte',
    label: 'Alumnos por Deporte',
    shortLabel: 'Alumnos x Deporte',
    icon: 'sports_soccer',
    description: 'Nómina oficial de alumnos inscriptos agrupados y filtrados por disciplina deportiva.',
  },
  {
    id: 'deporte-por-nivel',
    label: 'Deporte por Nivel',
    shortLabel: 'Deportes x Nivel',
    icon: 'fitness_center',
    description: 'Cruce dimensional de participación deportiva por niveles Inicial, Primario y Secundario.',
  },
  {
    id: 'deportes-horarios-profesor',
    label: 'Deportes, Horarios y Profesores',
    shortLabel: 'Detalle Deportes',
    icon: 'schedule',
    description: 'Directorio de disciplinas deportivas, niveles permitidos, horarios y profesores responsables.',
  },
  {
    id: 'transporte-por-recorrido',
    label: 'Transporte Escolar',
    shortLabel: 'Transporte x Recorrido',
    icon: 'directions_bus',
    description: 'Nómina de alumnos asignados a los 4 recorridos oficiales del servicio de transporte escolar.',
  },
];

/**
 * Normaliza y formatea el nombre completo de una persona
 */
export const formatFullName = (person) => {
  if (!person) return 'Sin especificar';
  return (
    person.nombreCompleto ||
    `${person.apellido || ''}, ${person.nombre || ''}`.trim().replace(/^,|,$/g, '').trim() ||
    person.nombre ||
    'Sin especificar'
  );
};

/**
 * Formatea el nombre de un estudiante en orden "Apellido, Nombre"
 */
export const formatLastNameFirst = (person) => {
  if (!person) return 'Sin especificar';
  const ap = (person.apellido || '').trim();
  const nom = (person.nombre || '').trim();

  if (ap && nom) {
    const cleanNom = nom.toLowerCase().endsWith(ap.toLowerCase())
      ? nom.slice(0, nom.length - ap.length).trim()
      : nom;
    return `${ap}, ${cleanNom || nom}`;
  }

  if (person.nombreCompleto) {
    const parts = person.nombreCompleto.trim().split(/\s+/);
    if (parts.length > 1) {
      const lastName = parts[parts.length - 1];
      const firstNames = parts.slice(0, -1).join(' ');
      return `${lastName}, ${firstNames}`;
    }
    return person.nombreCompleto;
  }

  return person.nombre || person.apellido || 'Sin especificar';
};

/**
 * Infiere el nivel educativo a partir de la denominación del curso
 */
export const inferNivelFromCourseName = (courseName = '') => {
  const lower = String(courseName || '').toLowerCase();
  if (lower.includes('sala') || lower.includes('jardin') || lower.includes('inicial')) return 'Inicial';
  if (lower.includes('grado') || lower.includes('primari')) return 'Primario';
  if (lower.includes('año') || lower.includes('secundari')) return 'Secundario';
  return '';
};

/**
 * Ponderación numérica de niveles educativos para ordenamiento:
 * Inicial (1) < Primario (2) < Secundario (3)
 */
export const getNivelWeight = (nivel = '') => {
  const norm = normalizeNivel(nivel);
  if (norm === 'inicial') return 1;
  if (norm === 'primario') return 2;
  return 3;
};

/**
 * Extrae el número de año o grado de una cadena de curso (ej. "7mo Grado" -> 7, "1er Año" -> 1)
 */
export const getCourseGradeNumber = (courseStr = '') => {
  const match = String(courseStr || '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

/**
 * Comparador canónico de cursos:
 * 1. Nivel (Inicial -> Primario -> Secundario)
 * 2. Grado / Año numérico (1° Grado ... 7° Grado / 1° Año ... 6° Año)
 * 3. División (A, B, C...)
 */
export const compareCoursesHierarchy = (courseA, courseB) => {
  const rawNivelA = courseA?.nivel || courseA?.nivelId || courseA?.nivelNormalizado || inferNivelFromCourseName(courseA?.nombre || courseA?.curso);
  const rawNivelB = courseB?.nivel || courseB?.nivelId || courseB?.nivelNormalizado || inferNivelFromCourseName(courseB?.nombre || courseB?.curso);
  const nivelA = getNivelWeight(rawNivelA);
  const nivelB = getNivelWeight(rawNivelB);
  if (nivelA !== nivelB) return nivelA - nivelB;

  const gradeA = getCourseGradeNumber(courseA?.nombre || courseA?.curso);
  const gradeB = getCourseGradeNumber(courseB?.nombre || courseB?.curso);
  if (gradeA !== gradeB) return gradeA - gradeB;

  const divA = String(courseA?.division || '').toUpperCase();
  const divB = String(courseB?.division || '').toUpperCase();
  if (divA !== divB) return divA.localeCompare(divB);

  const nameA = String(courseA?.nombre || courseA?.curso || '');
  const nameB = String(courseB?.nombre || courseB?.curso || '');
  return nameA.localeCompare(nameB);
};

/**
 * Mapeo para orden canónico de días de la semana
 */
export const DAY_ORDER_MAP = {
  lun: 1,
  lunes: 1,
  mar: 2,
  martes: 2,
  mie: 3,
  mié: 3,
  miercoles: 3,
  miércoles: 3,
  jue: 4,
  jueves: 4,
  vie: 5,
  viernes: 5,
  sab: 6,
  sáb: 6,
  dom: 7,
};

export const getDayOrderWeight = (token = '') => {
  const clean = String(token || '').toLowerCase().trim();
  for (const [key, weight] of Object.entries(DAY_ORDER_MAP)) {
    if (clean.startsWith(key)) return weight;
  }
  return 99;
};

/**
 * Ordena los días y bloques horarios dentro de una cadena semanal (ej. Lun -> Mié -> Jue -> Vie)
 */
export const sortScheduleSlotsAndDays = (rawDia, rawHora) => {
  if (!rawHora || typeof rawHora !== 'string') {
    return { dia: rawDia || 'Lunes a Viernes', hora: rawHora || '' };
  }

  // Si tiene múltiples bloques separados por viñeta o barra
  if (rawHora.includes('•') || rawHora.includes('|')) {
    const delimiter = rawHora.includes('•') ? '•' : '|';
    const slots = rawHora
      .split(delimiter)
      .map((s) => s.trim())
      .filter(Boolean);

    slots.sort((a, b) => {
      const wA = getDayOrderWeight(a);
      const wB = getDayOrderWeight(b);
      if (wA !== wB) return wA - wB;
      return a.localeCompare(b);
    });

    const detectedDays = [];
    const dayLabels = [
      { prefix: 'lun', full: 'Lunes' },
      { prefix: 'mar', full: 'Martes' },
      { prefix: 'mie', full: 'Miércoles' },
      { prefix: 'mié', full: 'Miércoles' },
      { prefix: 'jue', full: 'Jueves' },
      { prefix: 'vie', full: 'Viernes' },
      { prefix: 'sab', full: 'Sábado' },
      { prefix: 'sáb', full: 'Sábado' },
    ];

    const lowerHora = slots.join(' ').toLowerCase();
    dayLabels.forEach(({ prefix, full }) => {
      if (lowerHora.includes(prefix) && !detectedDays.includes(full)) {
        detectedDays.push(full);
      }
    });

    let formattedDia = rawDia;
    if (detectedDays.length >= 5 && detectedDays.includes('Lunes') && detectedDays.includes('Viernes')) {
      formattedDia = 'Lunes a Viernes';
    } else if (detectedDays.length === 2) {
      formattedDia = `${detectedDays[0]} y ${detectedDays[1]}`;
    } else if (detectedDays.length > 2) {
      const last = detectedDays[detectedDays.length - 1];
      formattedDia = `${detectedDays.slice(0, -1).join(', ')} y ${last}`;
    } else if (detectedDays.length === 1) {
      formattedDia = detectedDays[0];
    }

    return {
      dia: formattedDia || rawDia || 'Lunes a Viernes',
      hora: slots.join(' • '),
    };
  }

  const lower = rawHora.toLowerCase();
  if (lower.includes('mar y vie')) return { dia: 'Martes y Viernes', hora: rawHora };
  if (lower.includes('lun y mie') || lower.includes('lun y mié')) return { dia: 'Lunes y Miércoles', hora: rawHora };
  if (lower.includes('lun y jue')) return { dia: 'Lunes y Jueves', hora: rawHora };
  if (lower.includes('mar y jue')) return { dia: 'Martes y Jueves', hora: rawHora };
  if (lower.includes('mie y vie') || lower.includes('mié y vie')) return { dia: 'Miércoles y Viernes', hora: rawHora };

  return {
    dia: rawDia || 'Lunes a Viernes',
    hora: rawHora,
  };
};

/**
 * Comparador de alumnos para el Reporte de Alumnos por Curso:
 * 1. Nivel Educativo (Inicial -> Primario -> Secundario)
 * 2. Grado / Año del curso
 * 3. División
 * 4. Alfabético por Apellido, Nombre
 */
export const compareStudentsForCourseReport = (stA, stB) => {
  const nivelA = getNivelWeight(stA.nivel);
  const nivelB = getNivelWeight(stB.nivel);
  if (nivelA !== nivelB) return nivelA - nivelB;

  const gradeA = getCourseGradeNumber(stA.curso);
  const gradeB = getCourseGradeNumber(stB.curso);
  if (gradeA !== gradeB) return gradeA - gradeB;

  const divA = String(stA.division || '').toUpperCase();
  const divB = String(stB.division || '').toUpperCase();
  if (divA !== divB) return divA.localeCompare(divB);

  const nameA = formatLastNameFirst(stA);
  const nameB = formatLastNameFirst(stB);
  return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
};

/**
 * Comparador de materias:
 * 1. Nivel Educativo (Inicial -> Primario -> Secundario)
 * 2. Nombre de la materia (A-Z)
 */
export const compareSubjectsByNivelAndName = (subA, subB) => {
  const nivelA = getNivelWeight(subA.nivel);
  const nivelB = getNivelWeight(subB.nivel);
  if (nivelA !== nivelB) return nivelA - nivelB;

  return String(subA.nombre || '').localeCompare(String(subB.nombre || ''), 'es', { sensitivity: 'base' });
};

/**
 * Obtiene la lista de deportes y sus horarios en los que participa un estudiante.
 */
export const getStudentSportsDetails = (student, allSports = []) => {
  if (!student) return [];
  const studentSports = [];
  const disciplines = Array.isArray(student.disciplinas)
    ? student.disciplinas
    : Array.isArray(student.deportes)
    ? student.deportes
    : [];

  const studentId = student.id || student.studentId;
  const studentDni = student.dni ? String(student.dni).replace(/\D/g, '') : '';

  for (const sport of allSports) {
    const inscriptos = Array.isArray(sport.inscriptos) ? sport.inscriptos : [];
    const isEnrolledInSport = inscriptos.some((s) => {
      const sId = s.id || s.studentId || s.alumnoId;
      const sDni = s.dni ? String(s.dni).replace(/\D/g, '') : '';
      return (studentId && sId === studentId) || (studentDni && sDni === studentDni);
    });

    const isNamedInStudent = disciplines.some((d) => {
      const dName = typeof d === 'string' ? d : d.nombre || d.name;
      return dName && sport.nombre && dName.toLowerCase().includes(sport.nombre.toLowerCase());
    });

    if (isEnrolledInSport || isNamedInStudent) {
      studentSports.push({
        id: sport.id,
        nombre: sport.nombre,
        categoria: sport.categoria || 'Deportes',
        horarios: sport.horarios || sport.diasHorarios || 'Días y horarios a confirmar',
        profesor: sport.profesor?.nombre || 'Docente asignado',
      });
    }
  }

  // Fallback si solo tiene nombres en string
  if (studentSports.length === 0 && disciplines.length > 0) {
    disciplines.forEach((d, idx) => {
      const name = typeof d === 'string' ? d : d.nombre || `Deporte ${idx + 1}`;
      studentSports.push({
        id: `sport-fallback-${idx}`,
        nombre: name,
        categoria: 'Extracurricular',
        horarios: 'Turno tarde (días a convenir)',
        profesor: 'Coordinación deportiva',
      });
    });
  }

  return studentSports;
};

/**
 * Genera el reporte consolidado de un estudiante
 */
export const buildStudentFullReport = (student, { courses = [], subjects = [], allSports = [] }) => {
  if (!student) return null;

  const routeObj = getStudentTransportRoute(student);
  const subjectsWithTeachers = getStudentSubjectsWithTeachers(student, courses, subjects);
  const sportsDetails = getStudentSportsDetails(student, allSports);

  const servicios = Array.isArray(student.servicios) ? student.servicios : [];
  const usesComedor = servicios.some((s) => String(s).toLowerCase().includes('comedor')) || Boolean(student.comedor);
  const usesTransport = Boolean(routeObj) || servicios.some((s) => String(s).toLowerCase().includes('transporte'));

  return {
    student,
    fullName: formatFullName(student),
    legajo: student.studentID_login || student.legajo || 'Sin legajo',
    dni: student.dni || 'Sin DNI',
    curso: student.curso || 'Sin asignar',
    nivel: normalizeNivel(student.nivel),
    division: student.division || 'A',
    turno: student.turno || 'Mañana',
    subjects: subjectsWithTeachers,
    sports: sportsDetails,
    transporte: {
      activo: usesTransport,
      recorrido: routeObj ? routeObj.nombre : usesTransport ? 'Transporte Escolar (Zona asignada)' : 'No utiliza transporte escolar',
      zona: routeObj?.zona || 'Recorrido oficial del TPI',
      horarioIda: routeObj?.horarioIda || '07:00 hs',
      horarioRegreso: routeObj?.horarioRegreso || '16:30 hs',
    },
    comedor: {
      activo: usesComedor,
      observaciones: student.observacionesComedor || (usesComedor ? 'Menú escolar institucional habilitado' : 'No inscripto a servicio de comedor'),
    },
  };
};

/**
 * Organiza los horarios de un docente a partir de su grilla horaria o cátedras
 */
export const extractTeacherSchedulesByCourse = (teacher) => {
  if (!teacher) return [];
  const schedules = [];
  const grilla = teacher.grillaHoraria || {};
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  dias.forEach((dia) => {
    const slots = grilla[dia] || {};
    Object.entries(slots).forEach(([hora, data]) => {
      if (data && typeof data === 'object' && (data.curso || data.materia)) {
        schedules.push({
          dia,
          hora,
          curso: data.curso || 'Curso a cargo',
          materia: data.materia || teacher.especialidad || 'Cátedra',
          nivel: data.nivel || teacher.nivel || 'Nivel Secundario',
        });
      }
    });
  });

  // Si no hay grilla detallada, sintetizamos desde sus cátedras
  if (schedules.length === 0 && Array.isArray(teacher.catedras) && teacher.catedras.length > 0) {
    teacher.catedras.forEach((cat) => {
      const { dia, hora } = sortScheduleSlotsAndDays(cat.dia, cat.horario);
      const nivelInferred = cat.nivel || inferNivelFromCourseName(cat.curso) || teacher.nivel || 'Primario';
      schedules.push({
        dia,
        hora,
        curso: cat.curso || 'División a cargo',
        materia: cat.materia || teacher.especialidad || 'Asignatura',
        nivel: nivelInferred,
      });
    });
  }

  // Ordenar bloques horarios por jerarquía de curso y luego por día de la semana
  return schedules.sort(
    (a, b) => compareCoursesHierarchy(a, b) || getDayOrderWeight(a.dia) - getDayOrderWeight(b.dia)
  );
};

/**
 * Genera el reporte consolidado de un docente
 */
export const buildTeacherFullReport = (teacher) => {
  if (!teacher) return null;

  const schedules = extractTeacherSchedulesByCourse(teacher);
  const catedras = Array.isArray(teacher.catedras) ? teacher.catedras : [];

  // Deduplicar cursos a cargo
  const cursosSet = new Set();
  const cursosList = [];

  [...catedras, ...schedules].forEach((item) => {
    const courseName = item.curso;
    if (courseName && !cursosSet.has(courseName)) {
      cursosSet.add(courseName);
      const nivelInferred = item.nivel || inferNivelFromCourseName(courseName) || teacher.nivel || 'Secundario';
      cursosList.push({
        curso: courseName,
        nivel: nivelInferred,
        materia: item.materia || teacher.especialidad || 'Cátedra',
      });
    }
  });

  // Ordenar cursos asignados del nivel más básico al más alto (ej. Primario 7mo antes que Secundario 1er año)
  cursosList.sort(compareCoursesHierarchy);

  return {
    teacher,
    fullName: formatFullName(teacher),
    legajo: teacher.legajo || 'Sin legajo',
    dni: teacher.dni || 'Sin DNI',
    email: teacher.email || 'Sin correo',
    especialidad: teacher.especialidad || 'Profesor / Maestro de Grado',
    cargaHoras: teacher.cargaHoras || teacher.horasSemanales || schedules.length * 2 || 20,
    cursosACargo: cursosList,
    horarios: schedules,
  };
};

/**
 * Recopila y consolida todas las inscripciones deportivas del alumnado
 */
export const getAllSportEnrollments = (students = [], allSports = []) => {
  const enrollments = [];
  const seen = new Set();

  // 1. Recorrer las disciplinas deportivas registradas
  (allSports || []).forEach((sport) => {
    const inscriptos = Array.isArray(sport.inscriptos) ? sport.inscriptos : [];
    inscriptos.forEach((ins) => {
      const stId = ins.id || ins.studentId || ins.alumnoId;
      const key = `${sport.id}-${stId}`;
      if (!seen.has(key)) {
        seen.add(key);
        const fullStudent =
          (students || []).find(
            (s) =>
              s.id === stId ||
              (s.dni && ins.dni && String(s.dni).replace(/\D/g, '') === String(ins.dni).replace(/\D/g, ''))
          ) || ins;

        enrollments.push({
          sportId: sport.id,
          sportName: sport.nombre || 'Deporte',
          sportEmoji: sport.emoji || '🏅',
          sportNivel: sport.niveles || 'Todos los niveles',
          profesorName: sport.profesor?.nombre || 'Docente asignado',
          horario: sport.horario || 'Días y horarios a confirmar',
          lugar: sport.lugar || 'Campo de deportes',
          cupoMax: sport.cupoMax || 30,
          cupoOcupado: sport.cupoOcupado || inscriptos.length,
          student: fullStudent,
          studentId: fullStudent.id || stId,
          legajo: fullStudent.studentID_login || fullStudent.legajo || 'Sin legajo',
          nombreCompleto: formatLastNameFirst(fullStudent),
          dni: fullStudent.dni || 'Sin DNI',
          curso: fullStudent.curso || 'Sin curso',
          division: fullStudent.division || 'A',
          nivel: normalizeNivel(fullStudent.nivel),
        });
      }
    });
  });

  // 2. Alumnos con deportes indicados en su ficha individual
  (students || []).forEach((st) => {
    const studentSports = Array.isArray(st.disciplinas)
      ? st.disciplinas
      : Array.isArray(st.deportes)
      ? st.deportes
      : [];

    studentSports.forEach((spItem) => {
      const spName = typeof spItem === 'string' ? spItem : spItem.nombre || spItem.name;
      if (!spName) return;

      const matchedSport = (allSports || []).find(
        (s) => s.nombre && s.nombre.toLowerCase() === spName.toLowerCase()
      );

      const sportId = matchedSport?.id || `ext-${spName.toLowerCase().replace(/\s+/g, '-')}`;
      const key = `${sportId}-${st.id}`;

      if (!seen.has(key)) {
        seen.add(key);
        enrollments.push({
          sportId,
          sportName: matchedSport?.nombre || spName,
          sportEmoji: matchedSport?.emoji || '🏅',
          sportNivel: matchedSport?.niveles || 'Todos los niveles',
          profesorName: matchedSport?.profesor?.nombre || 'Docente asignado',
          horario: matchedSport?.horario || 'Turno tarde (a coordinar)',
          lugar: matchedSport?.lugar || 'Instalaciones deportivas',
          cupoMax: matchedSport?.cupoMax || 30,
          cupoOcupado: matchedSport?.cupoOcupado || 1,
          student: st,
          studentId: st.id,
          legajo: st.studentID_login || st.legajo || 'Sin legajo',
          nombreCompleto: formatLastNameFirst(st),
          dni: st.dni || 'Sin DNI',
          curso: st.curso || 'Sin curso',
          division: st.division || 'A',
          nivel: normalizeNivel(st.nivel),
        });
      }
    });
  });

  // Ordenar por disciplina (A-Z), luego jerarquía de curso y apellido de alumno
  return enrollments.sort((a, b) => {
    const spCmp = a.sportName.localeCompare(b.sportName, 'es', { sensitivity: 'base' });
    if (spCmp !== 0) return spCmp;
    return compareStudentsForCourseReport(a, b);
  });
};

/**
 * Obtiene el listado único y ordenado de disciplinas deportivas
 */
export const getUniqueSportsList = (allEnrollments = []) => {
  const set = new Set();
  (allEnrollments || []).forEach((e) => {
    if (e.sportName) set.add(e.sportName);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
};

/**
 * Filtra un registro de inscripción por término de búsqueda (nombre, legajo, DNI, curso, domicilio)
 */
export const filterEnrollmentsBySearch = (item, query = '') => {
  if (!query) return true;
  const q = String(query).toLowerCase().trim();
  const name = item.nombreCompleto ? item.nombreCompleto.toLowerCase() : '';
  const leg = item.legajo ? item.legajo.toLowerCase() : '';
  const dni = item.dni ? String(item.dni) : '';
  const cur = item.curso ? item.curso.toLowerCase() : '';
  const dom = item.domicilio ? item.domicilio.toLowerCase() : '';

  return name.includes(q) || leg.includes(q) || dni.includes(q) || cur.includes(q) || dom.includes(q);
};

/**
 * Cabeceras estándar para datos de alumnos en exportaciones CSV
 */
export const STUDENT_COMMON_CSV_HEADERS = [
  { label: 'Alumno', key: 'alumno' },
  { label: 'Legajo', key: 'legajo' },
  { label: 'DNI', key: 'dni' },
  { label: 'Curso', key: 'curso' },
  { label: 'División', key: 'division' },
  { label: 'Nivel Educativo', key: 'nivel' },
];

/**
 * Recopila y consolida la nómina oficial de alumnos inscriptos al Servicio de Transporte Escolar
 */
export const getAllTransportEnrollments = (students = []) => {
  const list = [];
  (students || []).forEach((st) => {
    const routeObj = getStudentTransportRoute(st);
    const servicios = Array.isArray(st.servicios) ? st.servicios : [];
    const hasTransport =
      Boolean(routeObj) ||
      servicios.some((s) => String(s).toLowerCase().includes('transporte'));

    if (hasTransport) {
      list.push({
        studentId: st.id,
        student: st,
        legajo: st.studentID_login || st.legajo || 'Sin legajo',
        nombreCompleto: formatLastNameFirst(st),
        dni: st.dni || 'Sin DNI',
        curso: st.curso || 'Sin curso',
        division: st.division || 'A',
        nivel: normalizeNivel(st.nivel),
        domicilio:
          st.domicilio || st.direccion || 'Domicilio registrado escolar',
        recorridoId: routeObj?.id || 'Recorrido 1',
        recorridoNombre: routeObj?.nombre || 'Recorrido 1 - Zona Norte',
        zona: routeObj?.zona || 'Zona Norte / Av. Sarmiento',
        horarioIda: routeObj?.horarioIda || '07:00 hs',
        horarioRegreso: routeObj?.horarioRegreso || '16:30 hs',
      });
    }
  });

  return list.sort((a, b) => {
    const rCmp = a.recorridoId.localeCompare(b.recorridoId, 'es', { numeric: true });
    if (rCmp !== 0) return rCmp;
    return compareStudentsForCourseReport(a, b);
  });
};

/**
 * Exporta datos tabulares a un archivo CSV descargable compatible con Excel (UTF-8 con BOM)
 */
export const exportReportToCsv = (filename, headers, rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert('No hay datos disponibles para exportar en este reporte.');
    return;
  }

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map((h) => escapeCsv(h.label)).join(';');
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsv(row[h.key] ?? '')).join(';')
  );

  const csvPayload = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  const fileBlob = new Blob([csvPayload], { type: 'text/csv;charset=utf-8;' });
  const fileUrl = URL.createObjectURL(fileBlob);
  const downloadAnchor = document.createElement('a');

  downloadAnchor.href = fileUrl;
  downloadAnchor.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(fileUrl);
};

/**
 * Dispara la vista de impresión del navegador para el reporte actual
 */
export const triggerPrintReport = () => {
  window.print();
};
