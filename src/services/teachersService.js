import { MOCK_TEACHERS } from '../data/mockTeachers';

const STORAGE_KEY = 'school_teachers_data';

export const getStoredTeachers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer docentes de localStorage:', err.message);
  }
  return MOCK_TEACHERS;
};

export const saveStoredTeachers = (teachers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
  } catch (err) {
    console.warn('Error al persistir docentes en localStorage:', err.message);
  }
};

/**
 * Obtiene el listado de docentes.
 * Inicialmente utiliza la fuente mock/localStorage. Preparado para alternar con Firestore `collection(db, 'teachers')`.
 */
export const fetchTeachersApi = async () => {
  // Simulamos ligera latencia de red para UX fluida
  await new Promise((resolve) => setTimeout(resolve, 150));
  return getStoredTeachers();
};

/**
 * Registra un nuevo docente y genera su legajo institucional.
 */
export const createTeacherApi = async (teacherData) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const currentList = getStoredTeachers();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const legajo = `#DOC-${randomNum}`;
  const id = `doc-${randomNum}`;

  const newTeacher = {
    id,
    legajo,
    nombre: teacherData.nombre,
    dni: teacherData.dni,
    titulacion: teacherData.titulacion,
    especialidad: teacherData.especialidad,
    especialidadKey: teacherData.especialidadKey || 'exactas',
    nivel: teacherData.nivel || 'secundario',
    email: teacherData.email,
    telefono: teacherData.telefono,
    estado: 'activo',
    estadoContratacion: teacherData.estadoContratacion || 'Titular - En Actividad',
    avatar: null,
    cargaHoras: 0,
    cargaMaxHoras: 30,
    catedras: [],
    grillaHoraria: [
      { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
      { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
      { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
    ],
    creadoEn: new Date().toISOString(),
  };

  const updatedList = [newTeacher, ...currentList];
  saveStoredTeachers(updatedList);

  return newTeacher;
};

/**
 * Actualiza las cátedras y carga horaria asignadas a un docente.
 */
export const updateTeacherAssignmentsApi = async (teacherId, { catedras, grillaHoraria }) => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const currentList = getStoredTeachers();
  const totalHoras = catedras.reduce((acc, cat) => acc + (Number(cat.horasSemanales) || 0), 0);

  const updatedList = currentList.map((docente) => {
    if (docente.id === teacherId) {
      return {
        ...docente,
        catedras,
        cargaHoras: totalHoras,
        grillaHoraria: grillaHoraria || docente.grillaHoraria,
      };
    }
    return docente;
  });

  saveStoredTeachers(updatedList);
  return updatedList.find((d) => d.id === teacherId);
};

/**
 * Exporta la nómina docente a un archivo CSV estructurado.
 */
export const exportTeachersPayrollCsv = (teachers = []) => {
  const headers = ['Legajo', 'Nombre Completo', 'DNI', 'Titulación', 'Especialidad', 'Nivel', 'Email', 'Teléfono', 'Estado', 'Contratación', 'Horas Asignadas'];
  const rows = teachers.map((t) => [
    t.legajo,
    `"${(t.nombre || '').replace(/"/g, '""')}"`,
    t.dni,
    `"${(t.titulacion || '').replace(/"/g, '""')}"`,
    `"${(t.especialidad || '').replace(/"/g, '""')}"`,
    t.nivel,
    t.email,
    t.telefono,
    t.estado,
    `"${(t.estadoContratacion || '').replace(/"/g, '""')}"`,
    t.cargaHoras || 0,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Nomina_Docente_Educar_${new Date().getFullYear()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
