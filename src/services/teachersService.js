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
 */
export const fetchTeachersApi = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getStoredTeachers();
};

/**
 * Registra un nuevo docente y genera su legajo institucional automático.
 * La contraseña inicial por defecto es su DNI.
 */
export const createTeacherApi = async (teacherData) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const currentList = getStoredTeachers();
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const legajo = `#DOC-${year}-${randomNum}`;
  const id = `doc-${Date.now()}`;

  const cleanNombre = (teacherData.nombre || '').trim();
  const cleanApellido = (teacherData.apellido || '').trim();
  const tratamiento = (teacherData.tratamiento || '').trim();
  const nombreCompleto = tratamiento
    ? `${tratamiento} ${cleanNombre} ${cleanApellido}`.trim()
    : `${cleanNombre} ${cleanApellido}`.trim();

  const newTeacher = {
    id,
    legajo,
    tratamiento,
    nombre: cleanNombre,
    apellido: cleanApellido,
    nombreCompleto,
    dni: (teacherData.dni || '').trim(),
    titulacion: (teacherData.titulacion || '').trim(),
    especialidad: (teacherData.especialidad || '').trim(),
    email: (teacherData.email || '').trim().toLowerCase(),
    telefono: (teacherData.telefono || '').trim(),
    estado: teacherData.estado || 'Titular',
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
 * Modifica los datos de un docente existente.
 */
export const updateTeacherApi = async (teacherId, teacherData) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const currentList = getStoredTeachers();
  const cleanNombre = (teacherData.nombre || '').trim();
  const cleanApellido = (teacherData.apellido || '').trim();
  const tratamiento = (
    teacherData.tratamiento !== undefined ? teacherData.tratamiento : ''
  ).trim();
  const nombreCompleto = tratamiento
    ? `${tratamiento} ${cleanNombre} ${cleanApellido}`.trim()
    : `${cleanNombre} ${cleanApellido}`.trim();

  const updatedList = currentList.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        tratamiento,
        nombre: cleanNombre,
        apellido: cleanApellido,
        nombreCompleto: nombreCompleto || t.nombreCompleto,
        dni: (teacherData.dni || t.dni).trim(),
        titulacion: (teacherData.titulacion || t.titulacion).trim(),
        especialidad: (teacherData.especialidad || t.especialidad).trim(),
        email: (teacherData.email || t.email).trim().toLowerCase(),
        telefono: (teacherData.telefono || t.telefono).trim(),
        estado: teacherData.estado || t.estado,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  saveStoredTeachers(updatedList);
  return updatedList.find((t) => t.id === teacherId);
};

/**
 * Alterna el estado de habilitación del docente (Suspendido <-> Titular).
 */
export const toggleTeacherStatusApi = async (teacherId) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const currentList = getStoredTeachers();
  const teacher = currentList.find((t) => t.id === teacherId);
  if (!teacher) throw new Error('Docente no encontrado');

  const nuevoEstado = teacher.estado === 'Suspendido' ? 'Titular' : 'Suspendido';

  const updatedList = currentList.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        estado: nuevoEstado,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  saveStoredTeachers(updatedList);
  return { teacher: updatedList.find((t) => t.id === teacherId), nuevoEstado };
};

/**
 * Restablece la contraseña institucional del docente a su número de DNI por defecto.
 */
export const resetTeacherPasswordApi = async (teacherId) => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const currentList = getStoredTeachers();
  const teacher = currentList.find((t) => t.id === teacherId);
  if (!teacher) throw new Error('Docente no encontrado');

  return {
    success: true,
    dni: teacher.dni,
    nombre: teacher.nombreCompleto || teacher.nombre,
  };
};

/**
 * Elimina definitivamente un docente de la lista.
 */
export const deleteTeacherApi = async (teacherId) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const currentList = getStoredTeachers();
  const updatedList = currentList.filter((t) => t.id !== teacherId);
  saveStoredTeachers(updatedList);

  return { success: true };
};

/**
 * Actualiza las cátedras y carga horaria asignadas a un docente.
 */
export const updateTeacherAssignmentsApi = async (teacherId, { catedras, grillaHoraria }) => {
  await new Promise((resolve) => setTimeout(resolve, 150));

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
  const headers = ['Legajo', 'DNI', 'Nombre', 'Apellido', 'Nombre Completo', 'Titulación', 'Especialidad', 'Email', 'Teléfono', 'Estado', 'Horas Asignadas'];
  const rows = teachers.map((t) => [
    t.legajo,
    t.dni,
    `"${(t.nombre || '').replace(/"/g, '""')}"`,
    `"${(t.apellido || '').replace(/"/g, '""')}"`,
    `"${(t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`).trim().replace(/"/g, '""')}"`,
    `"${(t.titulacion || '').replace(/"/g, '""')}"`,
    `"${(t.especialidad || '').replace(/"/g, '""')}"`,
    t.email,
    t.telefono,
    t.estado,
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
