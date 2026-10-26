export const MOCK_INSTITUTION_METRICS = {
  totalStudents: 1248,
  totalAssignedPct: '100% cupos asignados',
  inicialStudents: 210,
  inicialSubtitle: 'Salas de 3 a 5',
  primarioStudents: 540,
  primarioSubtitle: '1º a 7º Grados',
  secundarioStudents: 498,
  secundarioSubtitle: '1º a 6º Años',
  regularStudentsPct: '98.2%',
  conditionalCount: 22,
};

export const MOCK_STUDENTS = [
  {
    id: 's-001',
    legajo: '#LEG-2027-0481',
    dni: '48.912.430',
    nombre: 'Sofía Valentina Gómez',
    tutorNombre: 'Marcelo Gómez (Padre)',
    tutorDni: '28.394.021',
    tutorTelefono: '11-4920-1928',
    nivel: 'Primario',
    curso: '5to Grado A',
    cursoDisplay: 'Primario - 5to Grado A',
    estado: 'Activo - Regular',
    servicios: ['Comedor Escolar', 'Transporte Escolar'],
    initials: 'SG',
    avatarGradient: 'from-blue-500 to-indigo-500',
    badgeVariant: 'sky',
  },
  {
    id: 's-002',
    legajo: '#LEG-2027-0219',
    dni: '47.204.881',
    nombre: 'Mateo Benítez',
    tutorNombre: 'Andrea Sosa (Madre)',
    tutorDni: '31.109.442',
    tutorTelefono: '11-5821-9944',
    nivel: 'Secundario',
    curso: '4to Año B',
    cursoDisplay: 'Secundario - 4to Año B',
    estado: 'Activo - Regular',
    servicios: ['Transporte Escolar'],
    initials: 'MB',
    avatarGradient: 'from-emerald-400 to-lime-500',
    badgeVariant: 'indigo',
  },
  {
    id: 's-003',
    legajo: '#LEG-2027-0892',
    dni: '51.488.102',
    nombre: 'Lucía Morales',
    tutorNombre: 'Carlos Morales (Padre)',
    tutorDni: '29.841.003',
    tutorTelefono: '11-3019-4822',
    nivel: 'Inicial',
    curso: 'Sala Verde (5 Años)',
    cursoDisplay: 'Inicial - Sala 5 Verde',
    estado: 'Documentación Pendiente',
    servicios: [],
    initials: 'LM',
    avatarGradient: 'from-orange-400 to-amber-500',
    badgeVariant: 'lime',
  },
  {
    id: 's-004',
    legajo: '#LEG-2027-0104',
    dni: '46.883.190',
    nombre: 'Tomás Ezequiel Romero',
    tutorNombre: 'Horacio Romero (Padre)',
    tutorDni: '27.409.811',
    tutorTelefono: '11-6632-1082',
    nivel: 'Secundario',
    curso: '6to Año A',
    cursoDisplay: 'Secundario - 6to Año A',
    estado: 'Activo - Regular',
    servicios: ['Comedor Escolar'],
    initials: 'TR',
    avatarGradient: 'from-sky-400 to-blue-600',
    badgeVariant: 'indigo',
  },
  {
    id: 's-005',
    legajo: '#LEG-2027-0043',
    dni: '49.112.763',
    nombre: 'Camila Fernández',
    tutorNombre: 'Pase expedido a Col. Belgrano Day',
    tutorDni: '',
    tutorTelefono: '',
    nivel: 'Primario',
    curso: '3er Grado B',
    cursoDisplay: 'Primario - 3er Grado B',
    estado: 'Baja Administrativa',
    servicios: [],
    initials: 'CF',
    avatarGradient: 'from-slate-300 to-slate-400',
    isInactive: true,
    badgeVariant: 'slate',
  },
  {
    id: 's-006',
    legajo: '#LEG-2027-0312',
    dni: '47.889.321',
    nombre: 'Joaquín Navarro',
    tutorNombre: 'Valeria Luna (Madre)',
    tutorDni: '33.512.980',
    tutorTelefono: '11-4402-8119',
    nivel: 'Secundario',
    curso: '3er Año A',
    cursoDisplay: 'Secundario - 3er Año A',
    estado: 'Activo - Regular',
    servicios: ['Transporte Escolar'],
    initials: 'JN',
    avatarGradient: 'from-purple-500 to-indigo-600',
    badgeVariant: 'indigo',
  },
  {
    id: 's-007',
    legajo: '#LEG-2027-0551',
    dni: '50.129.400',
    nombre: 'Martina Belén Rivas',
    tutorNombre: 'Esteban Rivas (Padre)',
    tutorDni: '30.912.441',
    tutorTelefono: '11-5519-2004',
    nivel: 'Primario',
    curso: '6to Grado B',
    cursoDisplay: 'Primario - 6to Grado B',
    estado: 'Con Deuda Arancelaria',
    servicios: ['Comedor Escolar'],
    initials: 'MR',
    avatarGradient: 'from-pink-500 to-rose-500',
    badgeVariant: 'sky',
  },
  {
    id: 's-008',
    legajo: '#LEG-2027-0622',
    dni: '52.330.198',
    nombre: 'Benjamín Lautaro Díaz',
    tutorNombre: 'Patricia Ruiz (Madre)',
    tutorDni: '32.190.403',
    tutorTelefono: '11-3829-5510',
    nivel: 'Inicial',
    curso: 'Sala Verde (5 Años)',
    cursoDisplay: 'Inicial - Sala 5 Verde',
    estado: 'Activo - Regular',
    servicios: [],
    initials: 'BD',
    avatarGradient: 'from-teal-400 to-emerald-600',
    badgeVariant: 'lime',
  },
  {
    id: 's-009',
    legajo: '#LEG-2027-0744',
    dni: '48.201.993',
    nombre: 'Valentina Agostina Paz',
    tutorNombre: 'Rodrigo Paz (Padre)',
    tutorDni: '29.301.884',
    tutorTelefono: '11-7112-9988',
    nivel: 'Secundario',
    curso: '4to Año B',
    cursoDisplay: 'Secundario - 4to Año B',
    estado: 'Activo - Regular',
    servicios: ['Comedor Escolar'],
    initials: 'VP',
    avatarGradient: 'from-amber-400 to-orange-500',
    badgeVariant: 'indigo',
  },
  {
    id: 's-010',
    legajo: '#LEG-2027-0810',
    dni: '49.880.412',
    nombre: 'Felipe Nicolás Carrizo',
    tutorNombre: 'Mariana López (Madre)',
    tutorDni: '31.449.102',
    tutorTelefono: '11-6623-1100',
    nivel: 'Primario',
    curso: '5to Grado A',
    cursoDisplay: 'Primario - 5to Grado A',
    estado: 'Documentación Pendiente',
    servicios: ['Transporte Escolar'],
    initials: 'FC',
    avatarGradient: 'from-blue-600 to-cyan-500',
    badgeVariant: 'sky',
  },
  {
    id: 's-011',
    legajo: '#LEG-2027-0925',
    dni: '46.772.301',
    nombre: 'Emilia Santillán',
    tutorNombre: 'Ignacio Santillán (Padre)',
    tutorDni: '28.119.043',
    tutorTelefono: '11-9982-3112',
    nivel: 'Secundario',
    curso: '6to Año A',
    cursoDisplay: 'Secundario - 6to Año A',
    estado: 'Activo - Regular',
    servicios: [],
    initials: 'ES',
    avatarGradient: 'from-violet-500 to-purple-600',
    badgeVariant: 'indigo',
  },
  {
    id: 's-012',
    legajo: '#LEG-2027-1044',
    dni: '53.011.884',
    nombre: 'Facundo Gabriel Silva',
    tutorNombre: 'Lorena Méndez (Madre)',
    tutorDni: '34.882.019',
    tutorTelefono: '11-4771-0023',
    nivel: 'Inicial',
    curso: 'Sala Verde (5 Años)',
    cursoDisplay: 'Inicial - Sala 5 Verde',
    estado: 'Activo - Regular',
    servicios: ['Comedor Escolar', 'Transporte Escolar'],
    initials: 'FS',
    avatarGradient: 'from-lime-500 to-emerald-600',
    badgeVariant: 'lime',
    division: 'sin asignar',
  }
];

const FIRST_NAMES_POOL = [
  'Sofía', 'Mateo', 'Valentina', 'Benjamín', 'Martina', 'Felipe', 'Lucía', 'Joaquín',
  'Camila', 'Tomás', 'Catalina', 'Bautista', 'Julieta', 'Santino', 'Delfina', 'Thiago',
  'Isabella', 'Lucas', 'Victoria', 'Juan Martín', 'Emma', 'Nicolás', 'Renata', 'Lautaro',
  'Paula', 'Agustín', 'Florencia', 'Ignacio', 'Milagros', 'Facundo', 'Bianca', 'Santiago',
  'Manuel', 'Alma', 'Clara', 'Ramiro', 'Constanza', 'Franco', 'Pilar', 'Emiliano'
];

const LAST_NAMES_POOL = [
  'Gómez', 'Rodríguez', 'Fernández', 'López', 'Díaz', 'Martínez', 'Pérez', 'Romero',
  'Sánchez', 'Álvarez', 'Torres', 'Ruíz', 'Ramírez', 'Flores', 'Benítez', 'Acosta',
  'Medina', 'Herrera', 'Aguirre', 'Castro', 'Giménez', 'Morales', 'Domínguez', 'Blanco',
  'Vega', 'Peralta', 'Navarro', 'Quiroga', 'Cabrera', 'Ríos', 'Godoy', 'Rossi', 'Molina'
];

const GRADIENTS_POOL = [
  'from-blue-500 to-indigo-500',
  'from-emerald-400 to-lime-500',
  'from-orange-400 to-amber-500',
  'from-sky-400 to-blue-600',
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-teal-400 to-emerald-600',
  'from-violet-500 to-purple-600'
];

const DIVISION_STUDENT_DISTRIBUTION = [
  // Inicial
  { nivel: 'Inicial', curso: 'Sala 3 Años', division: 'Amarilla', count: 25 },
  { nivel: 'Inicial', curso: 'Sala 3 Años', division: 'Roja', count: 20 },
  { nivel: 'Inicial', curso: 'Sala 4 Años', division: 'Verde', count: 22 },
  { nivel: 'Inicial', curso: 'Sala 4 Años', division: 'Naranja', count: 21 },
  { nivel: 'Inicial', curso: 'Sala 5 Años', division: 'Azul', count: 24 },
  { nivel: 'Inicial', curso: 'Sala 5 Años', division: 'Celeste', count: 23 },

  // Primario
  { nivel: 'Primario', curso: '1° Grado', division: 'A', count: 28 },
  { nivel: 'Primario', curso: '1° Grado', division: 'B', count: 29 },
  { nivel: 'Primario', curso: '2° Grado', division: 'A', count: 27 },
  { nivel: 'Primario', curso: '2° Grado', division: 'B', count: 26 },
  { nivel: 'Primario', curso: '3° Grado', division: 'A', count: 30 },
  { nivel: 'Primario', curso: '3° Grado', division: 'B', count: 28 },
  { nivel: 'Primario', curso: '4° Grado', division: 'A', count: 30 },
  { nivel: 'Primario', curso: '4° Grado', division: 'B', count: 25 },
  { nivel: 'Primario', curso: '5° Grado', division: 'A', count: 27 },
  { nivel: 'Primario', curso: '6° Grado', division: 'A', count: 29 },
  { nivel: 'Primario', curso: '7° Grado', division: 'A', count: 26 },
  { nivel: 'Primario', curso: '7° Grado', division: 'B', count: 24 },

  // Secundario
  { nivel: 'Secundario', curso: '1° Año', division: 'A', count: 33 },
  { nivel: 'Secundario', curso: '1° Año', division: 'B', count: 31 },
  { nivel: 'Secundario', curso: '2° Año', division: 'A', count: 35 },
  { nivel: 'Secundario', curso: '3° Año', division: 'A', count: 32 },
  { nivel: 'Secundario', curso: '4° Año', division: 'A', count: 32 },
  { nivel: 'Secundario', curso: '4° Año', division: 'B', count: 30 },
  { nivel: 'Secundario', curso: '5° Año', division: 'A', count: 29 },
  { nivel: 'Secundario', curso: '5° Año', division: 'B', count: 35 },
  { nivel: 'Secundario', curso: '6° Año', division: 'Única', count: 31 },
];

let globalCounter = 100;
for (const dist of DIVISION_STUDENT_DISTRIBUTION) {
  for (let i = 0; i < dist.count; i++) {
    globalCounter++;
    const fn = FIRST_NAMES_POOL[(globalCounter * 3 + i) % FIRST_NAMES_POOL.length];
    const ln = LAST_NAMES_POOL[(globalCounter * 5 + i * 2) % LAST_NAMES_POOL.length];
    const grad = GRADIENTS_POOL[globalCounter % GRADIENTS_POOL.length];
    const badge = dist.nivel === 'Inicial' ? 'lime' : dist.nivel === 'Primario' ? 'sky' : 'indigo';
    const dniNum = 46000000 + (globalCounter * 137 % 8000000);
    const dniFormatted = `${String(dniNum).slice(0, 2)}.${String(dniNum).slice(2, 5)}.${String(dniNum).slice(5)}`;

    MOCK_STUDENTS.push({
      id: `s-${globalCounter}`,
      legajo: `#LEG-2027-${String(1000 + (globalCounter % 8999))}`,
      dni: dniFormatted,
      nombre: `${fn} ${ln}`,
      tutorNombre: `${ln} (Tutor)`,
      tutorDni: `28.${String(globalCounter * 41 % 899 + 100)}.${String(globalCounter * 67 % 899 + 100)}`,
      tutorTelefono: `11-${String(globalCounter * 73 % 8999 + 1000)}-${String(globalCounter * 91 % 8999 + 1000)}`,
      nivel: dist.nivel,
      curso: dist.curso,
      division: dist.division,
      cursoDisplay: `${dist.nivel} - ${dist.curso} "${dist.division}"`,
      estado: i % 14 === 0 ? 'Documentación Pendiente' : i % 20 === 0 ? 'Con Deuda Arancelaria' : 'Activo - Regular',
      servicios: ['Comedor Escolar'],
      initials: `${fn[0]}${ln[0]}`,
      avatarGradient: grad,
      badgeVariant: badge,
    });
  }
}

// Agregar alumnos adicionales con curso sin asignar
for (let u = 1; u <= 5; u++) {
  globalCounter++;
  const fn = FIRST_NAMES_POOL[(globalCounter + u) % FIRST_NAMES_POOL.length];
  const ln = LAST_NAMES_POOL[(globalCounter * 2 + u) % LAST_NAMES_POOL.length];
  MOCK_STUDENTS.push({
    id: `s-unassigned-${u}`,
    legajo: `#LEG-2027-009${u}`,
    dni: `50.812.30${u}`,
    nombre: `${fn} ${ln}`,
    tutorNombre: `${ln} (Tutor)`,
    tutorDni: '32.110.400',
    tutorTelefono: '11-4029-1122',
    nivel: 'Primario',
    curso: 'sin asignar',
    division: 'sin asignar',
    cursoDisplay: 'Sin asignar',
    estado: 'Pendiente de Designación',
    servicios: [],
    initials: `${fn[0]}${ln[0]}`,
    avatarGradient: 'from-slate-400 to-slate-500',
    badgeVariant: 'slate',
  });
}


export const CURSOS_POR_NIVEL = {
  Inicial: [
    'Sala de 2 Años',
    'Sala de 3 Años',
    'Sala de 4 Años',
    'Sala de 5 Años',
  ],
  Primario: [
    '1er Grado',
    '2do Grado',
    '3er Grado',
    '4to Grado',
    '5to Grado',
    '6to Grado',
    '7mo Grado',
  ],
  Secundario: [
    '1er Año',
    '2do Año',
    '3er Año',
    '4to Año',
    '5to Año',
    '6to Año',
  ],
};

export const DIVISIONES_LIST = ['A', 'B', 'C', 'D', 'Única'];

