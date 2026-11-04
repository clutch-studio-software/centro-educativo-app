import {
  TRANSPORT_ROUTES,
  getStudentTransportRoute,
  getStudentSubjectsWithTeachers,
  normalizeNivel,
} from '../../../utils/academicUtils';

/**
 * Reportes Oficiales disponibles en la Central Directiva (TPI Metodología II)
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
      schedules.push({
        dia: cat.dia || 'Lunes a Viernes',
        hora: cat.horario || 'Turno Mañana (08:00 - 12:00 hs)',
        curso: cat.curso || 'División a cargo',
        materia: cat.materia || teacher.especialidad || 'Asignatura',
        nivel: cat.nivel || teacher.nivel || 'Nivel Primario',
      });
    });
  }

  return schedules;
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
      cursosList.push({
        curso: courseName,
        nivel: item.nivel || teacher.nivel || 'Secundario',
        materia: item.materia || teacher.especialidad || 'Cátedra',
      });
    }
  });

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
