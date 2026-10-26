import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  INITIAL_SPORT_DETAIL,
  INITIAL_STUDENTS_ROSTER,
  exportSportRosterCsv,
} from '../../../data/mockSportsDetailData';
import { INITIAL_DISCIPLINES } from '../../../data/mockSportsActivities';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';
import { fetchTeachersApi } from '../../../services/teachersService';
import {
  subscribeToSportActivityById,
  subscribeToSportsActivities,
  updateSportActivityApi,
  toggleSportActivityStatusApi,
  enrollStudentInDisciplineApi,
  withdrawStudentFromDisciplineApi,
  addPreceptoriaNoteToStudent,
} from '../../../services/sportsService';

const PAGE_SIZE = 6;

export const useSportsDetailManagement = () => {
  const { id } = useParams();

  const initialDiscipline = useMemo(() => {
    if (!id) return INITIAL_SPORT_DETAIL;
    const found = INITIAL_DISCIPLINES.find((d) => d.id === id);
    if (!found) return INITIAL_SPORT_DETAIL;
    return {
      ...INITIAL_SPORT_DETAIL,
      ...found,
      code: `DEP-${found.nombre.slice(0, 3).toUpperCase()}-2026`,
      titulo: `${found.nombre} - Padrón y Detalle Operativo`,
      horas: found.horario,
      dias: found.dias,
      cupoMax: found.cupoMax || 40,
    };
  }, [id]);

  // Discipline Operational State
  const [discipline, setDiscipline] = useState(initialDiscipline);
  const [students, setStudents] = useState(INITIAL_STUDENTS_ROSTER);
  const [teachers, setTeachers] = useState(MOCK_TEACHERS);
  const [allDisciplines, setAllDisciplines] = useState([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [selectedCurso, setSelectedCurso] = useState('Todos los Cursos');
  const [selectedEstadoCuota, setSelectedEstadoCuota] = useState('Estado de Cuota: Todos');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
  const [isReassignTeacherModalOpen, setIsReassignTeacherModalOpen] = useState(false);
  const [transferStudent, setTransferStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Real-time synchronization with Firebase Firestore
  useEffect(() => {
    let isMounted = true;

    const unsubscribeAll = subscribeToSportsActivities((list) => {
      if (isMounted && Array.isArray(list)) {
        setAllDisciplines(list);
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAll();
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const unsubscribe = subscribeToSportActivityById(id, (updatedDisc) => {
      if (isMounted && updatedDisc) {
        setDiscipline(updatedDisc);
        if (Array.isArray(updatedDisc.inscriptos)) {
          setStudents(updatedDisc.inscriptos);
        }
      }
    });

    fetchTeachersApi()
      .then((realTeachers) => {
        if (isMounted && Array.isArray(realTeachers) && realTeachers.length > 0) {
          setTeachers(realTeachers);
        }
      })
      .catch((err) => {
        console.warn('Docentes de respaldo cargados:', err.message);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id]);

  // Filter Logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (student.nombre || '').toLowerCase().includes(query);
        const matchesDni = (student.dni || '').replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        const matchesLegajo = (student.legajo || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDni && !matchesLegajo) {
          return false;
        }
      }

      if (selectedNivel !== 'Todos') {
        if ((student.nivel || '').toLowerCase() !== selectedNivel.toLowerCase()) {
          return false;
        }
      }

      if (selectedCurso !== 'Todos los Cursos') {
        if (!student.cursoCompleto?.includes(selectedCurso) && student.curso !== selectedCurso) {
          return false;
        }
      }

      if (selectedEstadoCuota !== 'Estado de Cuota: Todos') {
        if (student.estadoCuota !== selectedEstadoCuota) {
          return false;
        }
      }

      return true;
    });
  }, [students, searchTerm, selectedNivel, selectedCurso, selectedEstadoCuota]);

  // Pagination Calculations
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);

  // Capacity calculations
  const occupancyCount = students.length;
  const maxCapacity = discipline.cupoMax || 40;
  const occupancyPercentage = Math.min(100, Math.round((occupancyCount / maxCapacity) * 100));
  const vacantesDisponibles = Math.max(0, maxCapacity - occupancyCount);
  const isAlmostFull = vacantesDisponibles <= 5 && vacantesDisponibles > 0;
  const isFull = vacantesDisponibles === 0;

  // Handlers
  const handleToggleOffer = async () => {
    const updatedStatus = !discipline.activo;
    setDiscipline((prev) => ({ ...prev, activo: updatedStatus }));
    try {
      await toggleSportActivityStatusApi(discipline.id, discipline.activo);
      showToast(
        `Oferta extracurricular de "${discipline.titulo}" ha sido ${
          updatedStatus ? 'activada y abierta' : 'cerrada temporalmente'
        }.`,
        updatedStatus ? 'success' : 'info'
      );
    } catch (err) {
      setDiscipline((prev) => ({ ...prev, activo: discipline.activo }));
      showToast(`Error al modificar estado: ${err.message}`, 'error');
    }
  };

  const handleEnrollStudent = async (newStudent) => {
    try {
      await enrollStudentInDisciplineApi(discipline.id, newStudent);
      setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
      showToast(
        `¡Alumno ${newStudent.nombre} matriculado con éxito en ${discipline.titulo}!`,
        'success'
      );
    } catch (err) {
      showToast(`Error al matricular alumno: ${err.message}`, 'error');
    }
  };

  const handleSaveConfig = async (updatedConfig) => {
    try {
      await updateSportActivityApi(discipline.id, {
        ...updatedConfig,
        instalacion: updatedConfig.lugar,
        cupoMax: Number(updatedConfig.cupoMax) || discipline.cupoMax,
      });
      setDiscipline((prev) => ({
        ...prev,
        ...updatedConfig,
        nombre: updatedConfig.nombre,
        titulo: `${updatedConfig.nombre} - Padrón y Detalle Operativo`,
        horas: updatedConfig.horario,
        horario: updatedConfig.horario,
        instalacion: updatedConfig.lugar,
        cupoMax: Number(updatedConfig.cupoMax) || prev.cupoMax,
      }));
      showToast('Configuración de la disciplina actualizada.', 'success');
    } catch (err) {
      showToast(`Error al actualizar configuración: ${err.message}`, 'error');
    }
  };

  const handleReassignTeacher = async (newTeacher) => {
    const teacherPayload = {
      nombre: newTeacher.nombre,
      legajo: newTeacher.legajo,
      email: newTeacher.email,
      iniciales:
        newTeacher.iniciales ||
        newTeacher.nombre
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
    };
    try {
      await updateSportActivityApi(discipline.id, { profesor: teacherPayload });
      setDiscipline((prev) => ({
        ...prev,
        profesor: teacherPayload,
      }));
      showToast(`Profesor titular reasignado: ${newTeacher.nombre}`, 'success');
    } catch (err) {
      showToast(`Error al reasignar profesor: ${err.message}`, 'error');
    }
  };

  const handleTransferOrWithdraw = async (payload) => {
    const { actionType, targetDiscipline, targetDisciplineId, motivo } = payload || {};
    const targetStudent = payload?.student || transferStudent;
    const studentId = payload?.studentId || targetStudent?.id;
    const studentName = payload?.studentName || targetStudent?.nombre || 'Alumno';

    try {
      await withdrawStudentFromDisciplineApi(discipline.id, studentId || targetStudent);
      setStudents((prev) =>
        prev.filter((s) => s.id !== studentId && s.nombre !== studentName)
      );

      if (actionType === 'transfer' && targetDisciplineId && targetStudent) {
        await enrollStudentInDisciplineApi(targetDisciplineId, targetStudent);
      }

      const discName = discipline?.nombre || discipline?.titulo || 'Actividad';
      const justificativoText =
        motivo?.trim() ||
        (actionType === 'transfer'
          ? `Transferencia de disciplina solicitada desde ${discName} hacia ${targetDiscipline || 'otra actividad'}.`
          : `Baja administrativa y desvinculación de la actividad ${discName}.`);

      const noteEntry = {
        tipo:
          actionType === 'transfer'
            ? 'Transferencia de Actividad'
            : 'Baja de Actividad Extracurricular',
        titulo:
          actionType === 'transfer'
            ? `Pase de ${discName} a ${targetDiscipline || 'otra disciplina'}`
            : `Baja de actividad: ${discName}`,
        motivo: justificativoText,
        autor: 'Preceptoría y Administración',
        categoria: 'Extracurricular',
      };

      await addPreceptoriaNoteToStudent({
        studentId,
        studentDni: targetStudent?.dni,
        studentLegajo: targetStudent?.legajo,
        studentName,
        note: noteEntry,
      });

      if (actionType === 'transfer') {
        showToast(
          `Alumno ${studentName} transferido a ${targetDiscipline}. Justificativo asentado en Preceptoría.`,
          'success'
        );
      } else {
        showToast(
          `Baja procesada: ${studentName} retirado de ${discipline.titulo}. Justificativo asentado en Preceptoría.`,
          'info'
        );
      }
    } catch (err) {
      showToast(`Error al procesar baja en Firebase: ${err.message}`, 'error');
    } finally {
      setTransferStudent(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedNivel('Todos');
    setSelectedCurso('Todos los Cursos');
    setSelectedEstadoCuota('Estado de Cuota: Todos');
    setCurrentPage(1);
  };

  const handleExportCsv = () => {
    try {
      exportSportRosterCsv(filteredStudents, discipline.titulo);
      showToast('Descarga del padrón iniciada en formato CSV.', 'success');
    } catch {
      showToast('Error al exportar los datos.', 'error');
    }
  };

  return {
    discipline,
    students,
    teachers,
    allDisciplines,
    notification,
    setNotification,
    searchTerm,
    setSearchTerm,
    selectedNivel,
    setSelectedNivel,
    selectedCurso,
    setSelectedCurso,
    selectedEstadoCuota,
    setSelectedEstadoCuota,
    currentPage,
    setCurrentPage,
    isEnrollModalOpen,
    setIsEnrollModalOpen,
    isEditConfigModalOpen,
    setIsEditConfigModalOpen,
    isReassignTeacherModalOpen,
    setIsReassignTeacherModalOpen,
    transferStudent,
    setTransferStudent,
    viewingStudent,
    setViewingStudent,
    filteredStudents,
    currentStudents,
    occupancyCount,
    maxCapacity,
    occupancyPercentage,
    vacantesDisponibles,
    isAlmostFull,
    isFull,
    handleToggleOffer,
    handleEnrollStudent,
    handleSaveConfig,
    handleReassignTeacher,
    handleTransferOrWithdraw,
    handleResetFilters,
    handleExportCsv,
  };
};
