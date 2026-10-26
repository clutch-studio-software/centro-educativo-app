import { useState, useMemo } from 'react';
import { MOCK_STUDENTS } from '../../../data/mockStudents';
import { isStudentLevelAllowed } from './sportsScheduleUtils';

const normalizeDigits = (val) => String(val || '').replace(/\D/g, '');

export const isAlreadyEnrolled = (student, enrolledList = []) => {
  const sDni = normalizeDigits(student.dni);
  const sLegajo = String(student.legajo || '').trim().toLowerCase();
  const sId = String(student.id || '').trim();
  const sName = String(student.nombre || '').trim().toLowerCase();

  return enrolledList.some((e) => {
    const eDni = normalizeDigits(e.dni);
    const eLegajo = String(e.legajo || '').trim().toLowerCase();
    const eId = String(e.id || '').trim();
    const eName = String(e.nombre || '').trim().toLowerCase();

    if (sDni && eDni && sDni === eDni) return true;
    if (sLegajo && eLegajo && sLegajo === eLegajo) return true;
    if (sId && eId && sId === eId) return true;
    if (sName && eName && sName === eName) return true;
    return false;
  });
};

export const createEnrolledStudentFromMock = (student) => {
  const tutorClean = student.tutorNombre
    ? student.tutorNombre.split('(')[0].trim()
    : 'Tutor registrado';

  return {
    id: student.id || `ALU-${Math.floor(1000 + Math.random() * 9000)}`,
    legajo: student.legajo || `#LEG-${Math.floor(1000 + Math.random() * 9000)}`,
    nombre: student.nombre,
    dni: student.dni,
    iniciales:
      student.initials ||
      student.nombre
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    avatarGrad: student.avatarGradient || 'from-blue-600 to-indigo-500',
    nivel: student.nivel,
    curso: student.curso,
    division: student.curso,
    cursoCompleto: student.cursoDisplay || `${student.nivel} - ${student.curso}`,
    tutor: tutorClean,
    tutorTelefono: student.tutorTelefono || '-',
    fechaInscripcion: new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    estadoCuota: 'Al Día',
    aptoMedico: true,
  };
};

export const useStudentEnrollmentSearch = (discipline) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivelFilter, setSelectedNivelFilter] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const configuredLevels = discipline?.niveles || 'Todos los niveles';

  const availableNivelFilters = useMemo(() => {
    const list = ['Todos'];
    const lower = configuredLevels.toLowerCase();
    if (lower.includes('todos') || lower.includes('inicial')) list.push('Inicial');
    if (lower.includes('todos') || lower.includes('primario')) list.push('Primario');
    if (lower.includes('todos') || lower.includes('secundario')) list.push('Secundario');
    return list;
  }, [configuredLevels]);

  const eligibleStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      if (!isStudentLevelAllowed(student.nivel, configuredLevels)) {
        return false;
      }

      if (student.isInactive || student.estado === 'Baja Administrativa') {
        return false;
      }

      if (selectedNivelFilter !== 'Todos' && student.nivel !== selectedNivelFilter) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const cleanQuery = query.replace(/\D/g, '');
        const cleanDni = normalizeDigits(student.dni);
        const matchesName = (student.nombre || '').toLowerCase().includes(query);
        const matchesLegajo = (student.legajo || '').toLowerCase().includes(query);
        const matchesDni = cleanQuery ? cleanDni.includes(cleanQuery) : false;

        if (!matchesName && !matchesLegajo && !matchesDni) {
          return false;
        }
      }

      return true;
    });
  }, [configuredLevels, selectedNivelFilter, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    selectedNivelFilter,
    setSelectedNivelFilter,
    selectedStudent,
    setSelectedStudent,
    configuredLevels,
    availableNivelFilters,
    eligibleStudents,
  };
};
