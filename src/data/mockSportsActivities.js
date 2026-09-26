export const LEVEL_OPTIONS = [
  'Todos los niveles',
  'Nivel Inicial',
  'Nivel Primario',
  'Nivel Secundario',
  'Inicial y Primario',
  'Primario y Secundario',
];

export const DAY_OPTIONS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábados',
];

export const STATUS_OPTIONS = [
  'Todos',
  'Activos',
  'Completos',
  'En Pausa',
];

export const EMOJI_OPTIONS = [
  { emoji: '🏃', label: 'Atletismo / Running', bg: 'bg-orange-50', text: 'text-orange-600' },
  { emoji: '🏊', label: 'Natación', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { emoji: '⚽', label: 'Fútbol', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { emoji: '🥋', label: 'Artes Marciales / Taekwondo', bg: 'bg-purple-50', text: 'text-purple-600' },
  { emoji: '🏐', label: 'Vóley', bg: 'bg-amber-50', text: 'text-amber-600' },
  { emoji: '🩰', label: 'Danza & Expresión', bg: 'bg-pink-50', text: 'text-pink-600' },
  { emoji: '🏀', label: 'Básquet', bg: 'bg-amber-50', text: 'text-orange-600' },
  { emoji: '♟️', label: 'Ajedrez & Estrategia', bg: 'bg-slate-100', text: 'text-slate-700' },
  { emoji: '🎾', label: 'Tenis / Paddle', bg: 'bg-lime-50', text: 'text-lime-700' },
  { emoji: '🤸', label: 'Gimnasia Artística', bg: 'bg-rose-50', text: 'text-rose-600' },
  { emoji: '🏓', label: 'Tenis de Mesa', bg: 'bg-sky-50', text: 'text-sky-600' },
  { emoji: '🤾', label: 'Handball', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { emoji: '🎨', label: 'Taller de Arte & Plástica', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
  { emoji: '🤖', label: 'Robótica & Programación', bg: 'bg-blue-50', text: 'text-blue-600' },
  { emoji: '🎭', label: 'Teatro y Expresión Corporal', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  { emoji: '🎵', label: 'Ensamble Musical & Coro', bg: 'bg-teal-50', text: 'text-teal-600' },
];

export const INITIAL_DISCIPLINES = [
  {
    id: 'disc-1',
    nombre: 'Atletismo',
    emoji: '🏃',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    profesor: {
      nombre: 'Prof. Diego Arzamendia',
      iniciales: 'DA',
      email: 'diego.arzamendia@colegio.edu.ar',
      telefono: '+54 11 4455-8910',
    },
    niveles: 'Primario y Secundario',
    nivelId: 'Primario y Secundario',
    dias: ['Martes', 'Jueves'],
    horario: 'Martes y Jueves 16:30 - 18:00',
    lugar: 'Pista de Atletismo / Campo de Deportes',
    cupoMax: 25,
    cupoOcupado: 18,
    activo: true,
    descripcion: 'Entrenamiento integral en velocidad, salto, resistencia y lanzamiento con enfoque en técnica formativa y hábitos saludables.',
    inscriptos: [
      { id: 'ins-101', alumno: 'Mateo González', curso: '5° Grado "A"', nivel: 'Primario', tutor: 'Carla Ferreyra', telefono: '+54 11 5521-4433', aptoMedico: true, fechaInscripcion: '12/03/2026' },
      { id: 'ins-102', alumno: 'Valentina Rossi', curso: '2° Año "B"', nivel: 'Secundario', tutor: 'Javier Rossi', telefono: '+54 11 6721-9988', aptoMedico: true, fechaInscripcion: '14/03/2026' },
      { id: 'ins-103', alumno: 'Lucas Martínez', curso: '6° Grado "B"', nivel: 'Primario', tutor: 'Silvina Acosta', telefono: '+54 11 4432-1199', aptoMedico: false, fechaInscripcion: '15/03/2026' },
      { id: 'ins-104', alumno: 'Sofía Benítez', curso: '1° Año "A"', nivel: 'Secundario', tutor: 'Gonzalo Benítez', telefono: '+54 11 8844-3322', aptoMedico: true, fechaInscripcion: '16/03/2026' },
    ],
  },
  {
    id: 'disc-2',
    nombre: 'Natación',
    emoji: '🏊',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    profesor: {
      nombre: 'Prof. Camila Rivas',
      iniciales: 'CR',
      email: 'camila.rivas@colegio.edu.ar',
      telefono: '+54 11 4455-8911',
    },
    niveles: 'Todos los niveles',
    nivelId: 'Todos los niveles',
    dias: ['Lunes', 'Miércoles', 'Viernes'],
    horario: 'Lunes, Miércoles y Viernes 15:00 - 17:00',
    lugar: 'Natatorio Climatizado Central',
    cupoMax: 30,
    cupoOcupado: 30,
    activo: true,
    descripcion: 'Desarrollo de estilos crol, espalda, pecho y mariposa. Trabajo de resistencia acuática y seguridad.',
    inscriptos: [
      { id: 'ins-201', alumno: 'Joaquín Pereyra', curso: '3° Grado "A"', nivel: 'Primario', tutor: 'Ramiro Pereyra', telefono: '+54 11 3322-1100', aptoMedico: true, fechaInscripcion: '10/03/2026' },
      { id: 'ins-202', alumno: 'Mia Domínguez', curso: 'Sala 5 Años', nivel: 'Inicial', tutor: 'Luciana Gómez', telefono: '+54 11 5566-7788', aptoMedico: true, fechaInscripcion: '11/03/2026' },
      { id: 'ins-203', alumno: 'Facundo Álvarez', curso: '4° Año "A"', nivel: 'Secundario', tutor: 'Marcelo Álvarez', telefono: '+54 11 9988-7766', aptoMedico: true, fechaInscripcion: '11/03/2026' },
    ],
  },
  {
    id: 'disc-3',
    nombre: 'Fútbol',
    emoji: '⚽',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    profesor: {
      nombre: 'Prof. Esteban Morales',
      iniciales: 'EM',
      email: 'esteban.morales@colegio.edu.ar',
      telefono: '+54 11 4455-8912',
    },
    niveles: 'Primario y Secundario',
    nivelId: 'Primario y Secundario',
    dias: ['Lunes', 'Miércoles'],
    horario: 'Lunes y Miércoles 17:00 - 18:30',
    lugar: 'Cancha Principal de Césped Sintético',
    cupoMax: 35,
    cupoOcupado: 28,
    activo: true,
    descripcion: 'Escuela formativa de fútbol, técnica individual, táctica colectiva, compañerismo y fair play en torneos intercolegiales.',
    inscriptos: [
      { id: 'ins-301', alumno: 'Thiago Gómez', curso: '4° Grado "B"', nivel: 'Primario', tutor: 'Martín Gómez', telefono: '+54 11 4411-2233', aptoMedico: true, fechaInscripcion: '12/03/2026' },
      { id: 'ins-302', alumno: 'Santino Díaz', curso: '3° Año "A"', nivel: 'Secundario', tutor: 'Estela Díaz', telefono: '+54 11 7766-5544', aptoMedico: true, fechaInscripcion: '13/03/2026' },
    ],
  },
  {
    id: 'disc-4',
    nombre: 'Artes Marciales / Taekwondo',
    emoji: '🥋',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    profesor: {
      nombre: 'Sensei Kenji Sato',
      iniciales: 'KS',
      email: 'kenji.sato@colegio.edu.ar',
      telefono: '+54 11 4455-8913',
    },
    niveles: 'Primario y Secundario',
    nivelId: 'Primario y Secundario',
    dias: ['Martes', 'Jueves'],
    horario: 'Martes y Jueves 17:00 - 18:30',
    lugar: 'Salón de Usos Múltiples (Dojo Polideportivo)',
    cupoMax: 20,
    cupoOcupado: 15,
    activo: true,
    descripcion: 'Disciplina marcial, autocontrol, defensa personal formativa y progresión de cinturones federados WTF.',
    inscriptos: [
      { id: 'ins-401', alumno: 'Ignacio Ruiz', curso: '2° Grado "A"', nivel: 'Primario', tutor: 'Patricia Méndez', telefono: '+54 11 2233-4455', aptoMedico: true, fechaInscripcion: '14/03/2026' },
    ],
  },
  {
    id: 'disc-5',
    nombre: 'Vóley',
    emoji: '🏐',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    profesor: {
      nombre: 'Prof. Mariana Valenzuela',
      iniciales: 'MV',
      email: 'mariana.valenzuela@colegio.edu.ar',
      telefono: '+54 11 4455-8914',
    },
    niveles: 'Secundario',
    nivelId: 'Nivel Secundario',
    dias: ['Miércoles', 'Viernes'],
    horario: 'Miércoles y Viernes 16:00 - 17:30',
    lugar: 'Gimnasio Techado - Cancha 1',
    cupoMax: 24,
    cupoOcupado: 20,
    activo: true,
    descripcion: 'Técnica de saque, recepción, armado y remate. Participación en ligas intercolegiales y formación de equipos competitivos.',
    inscriptos: [
      { id: 'ins-501', alumno: 'Camila Sosa', curso: '5° Año "A"', nivel: 'Secundario', tutor: 'Jorge Sosa', telefono: '+54 11 3344-5566', aptoMedico: true, fechaInscripcion: '12/03/2026' },
    ],
  },
  {
    id: 'disc-6',
    nombre: 'Danza & Expresión',
    emoji: '🩰',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    profesor: {
      nombre: 'Prof. Florencia Peña',
      iniciales: 'FP',
      email: 'florencia.pena@colegio.edu.ar',
      telefono: '+54 11 4455-8915',
    },
    niveles: 'Inicial y Primario',
    nivelId: 'Inicial y Primario',
    dias: ['Lunes', 'Miércoles'],
    horario: 'Lunes y Miércoles 16:00 - 17:15',
    lugar: 'Sala de Danza y Espejos - Pabellón de Artes',
    cupoMax: 20,
    cupoOcupado: 19,
    activo: true,
    descripcion: 'Iniciación a la danza clásica, danza contemporánea, ritmo y expresión corporal creativa para niñas y niños.',
    inscriptos: [
      { id: 'ins-601', alumno: 'Clara Navarro', curso: 'Sala 4 Años', nivel: 'Inicial', tutor: 'Romina Ramos', telefono: '+54 11 8899-0011', aptoMedico: true, fechaInscripcion: '10/03/2026' },
    ],
  },
  {
    id: 'disc-7',
    nombre: 'Básquet',
    emoji: '🏀',
    bgColor: 'bg-amber-50',
    textColor: 'text-orange-600',
    profesor: {
      nombre: 'Prof. Javier Rossi',
      iniciales: 'JR',
      email: 'javier.rossi@colegio.edu.ar',
      telefono: '+54 11 4455-8916',
    },
    niveles: 'Primario y Secundario',
    nivelId: 'Primario y Secundario',
    dias: ['Martes', 'Jueves'],
    horario: 'Martes y Jueves 16:00 - 17:30',
    lugar: 'Polideportivo Techado - Cancha Central',
    cupoMax: 25,
    cupoOcupado: 22,
    activo: true,
    descripcion: 'Fundamentos de drible, pase, tiro en suspensión y dinámica de equipo con partidos amistosos y formativos.',
    inscriptos: [
      { id: 'ins-701', alumno: 'Bruno Toledo', curso: '6° Grado "A"', nivel: 'Primario', tutor: 'Claudio Toledo', telefono: '+54 11 1122-3344', aptoMedico: true, fechaInscripcion: '15/03/2026' },
    ],
  },
  {
    id: 'disc-8',
    nombre: 'Ajedrez & Estrategia',
    emoji: '♟️',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    profesor: {
      nombre: 'Prof. Marcelo Benítez',
      iniciales: 'MB',
      email: 'marcelo.benitez@colegio.edu.ar',
      telefono: '+54 11 4455-8917',
    },
    niveles: 'Todos los niveles',
    nivelId: 'Todos los niveles',
    dias: ['Sábados'],
    horario: 'Sábados 10:00 - 12:00',
    lugar: 'Biblioteca Central / Sala de Juegos Mentales',
    cupoMax: 15,
    cupoOcupado: 12,
    activo: true,
    descripcion: 'Aperturas, táctica, cálculo y pensamiento estratégico. Preparación para torneos escolares locales y provinciales.',
    inscriptos: [
      { id: 'ins-801', alumno: 'Emiliano Castro', curso: '1° Año "B"', nivel: 'Secundario', tutor: 'Daniela Castro', telefono: '+54 11 4455-6677', aptoMedico: true, fechaInscripcion: '16/03/2026' },
    ],
  },
];

/**
 * Export sports roster data as a CSV download
 */
export const exportSportsRosterCsv = (disciplines) => {
  const headers = [
    'Disciplina',
    'Profesor a Cargo',
    'Email Docente',
    'Niveles',
    'Días',
    'Horario',
    'Lugar',
    'Cupo Máximo',
    'Inscriptos',
    'Vacantes Disponibles',
    'Estado',
  ];

  const rows = disciplines.map((d) => [
    `"${d.nombre}"`,
    `"${d.profesor?.nombre || 'Sin asignar'}"`,
    `"${d.profesor?.email || ''}"`,
    `"${d.niveles}"`,
    `"${d.dias?.join(', ') || ''}"`,
    `"${d.horario}"`,
    `"${d.lugar || 'Campus Deportivo'}"`,
    d.cupoMax,
    d.cupoOcupado,
    Math.max(0, d.cupoMax - d.cupoOcupado),
    d.activo ? (d.cupoOcupado >= d.cupoMax ? 'Completo' : 'Activo') : 'En Pausa',
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `padron_deportivo_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
