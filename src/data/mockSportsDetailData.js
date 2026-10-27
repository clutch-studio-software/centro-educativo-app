/**
 * Mock data for Sports & Services Detail view (e.g. Atletismo - DEP-ATL-2026)
 * Contains full operational information and complete roster of 38 enrolled students.
 */

export const INITIAL_SPORT_DETAIL = {
  id: 'disc-1',
  code: 'DEP-ATL-2026',
  nombre: 'Atletismo',
  titulo: 'Atletismo - Padrón y Detalle Operativo',
  ciclo: 'Ciclo Lectivo Vigente',
  activo: true,
  ofertaAbierta: true,
  niveles: 'Primario y Secundario',
  nivelesDetalle: 'Primario (4° a 7°) y Secundario (1° a 6°)',
  icon: 'sprint',
  profesor: {
    nombre: 'Prof. Diego Arzamendia',
    legajo: '#DOC-1077',
    email: 'd.arzamendia@educar.edu.ar',
    iniciales: 'DA',
    telefono: '+54 11 4455-8910',
    avatarGrad: 'from-blue-600 to-indigo-500',
  },
  horario: 'Martes y Jueves 16:30 - 18:00 hs',
  dias: 'Martes y Jueves',
  horas: '16:30 - 18:00 hs',
  lugar: 'Pista de Atletismo',
  instalacion: 'Gimnasio Central Polideportivo',
  cupoMax: 40,
  listaEsperaCount: 4,
  politica: 'Control transaccional: Máximo 2 deportes por alumno en el ciclo.',
  supervision: 'Supervisado por Dpto. Educación Física',
};

export const INITIAL_STUDENTS_ROSTER = [];

/**
 * Export sports roster data as a CSV download
 */
export const exportSportRosterCsv = (roster, disciplineTitle = 'Atletismo') => {
  const headers = [
    'Legajo',
    'Alumno',
    'DNI',
    'Nivel',
    'Curso y División',
    'Tutor Responsable',
    'Teléfono Tutor',
    'Fecha de Inscripción',
    'Estado de Cuota',
    'Apto Médico',
  ];

  const rows = roster.map((s) => [
    `"${s.legajo}"`,
    `"${s.nombre}"`,
    `"${s.dni}"`,
    `"${s.nivel}"`,
    `"${s.cursoCompleto}"`,
    `"${s.tutor}"`,
    `"${s.tutorTelefono}"`,
    `"${s.fechaInscripcion}"`,
    `"${s.estadoCuota || 'Al Día'}"`,
    s.aptoMedico ? 'Aprobado' : 'Pendiente',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `padron_${disciplineTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
