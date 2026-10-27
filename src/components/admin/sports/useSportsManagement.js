import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  INITIAL_DISCIPLINES,
  exportSportsRosterCsv,
} from '../../../data/mockSportsActivities';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';
import { fetchTeachersApi } from '../../../services/teachersService';
import {
  subscribeToSportsActivities,
  createSportActivityApi,
  updateSportActivityApi,
  toggleSportActivityStatusApi,
} from '../../../services/sportsService';

const PAGE_SIZE = 8;

export const useSportsManagement = () => {
  // Sports & Disciplines State
  const [disciplines, setDisciplines] = useState(INITIAL_DISCIPLINES);
  const [teachers, setTeachers] = useState([]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [viewingDiscipline, setViewingDiscipline] = useState(null);

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
    const unsubscribe = subscribeToSportsActivities((list) => {
      if (isMounted) {
        setDisciplines(list);
      }
    });

    fetchTeachersApi()
      .then((realTeachers) => {
        if (isMounted && Array.isArray(realTeachers)) {
          setTeachers(realTeachers);
        }
      })
      .catch((err) => {
        console.warn('Docentes no disponibles:', err.message);
        if (isMounted) setTeachers([]);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Filter Logic
  const filteredDisciplines = useMemo(() => {
    return disciplines.filter((disc) => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (disc.nombre || '').toLowerCase().includes(query);
        const matchesTeacher = (disc.profesor?.nombre || '').toLowerCase().includes(query);
        const matchesLocation = (disc.lugar || '').toLowerCase().includes(query);
        if (!matchesName && !matchesTeacher && !matchesLocation) {
          return false;
        }
      }

      if (selectedLevel) {
        const levelStr = String(disc.niveles || '').toLowerCase();
        const queryLevel = selectedLevel.toLowerCase();
        if (queryLevel !== 'todos los niveles' && !levelStr.includes(queryLevel) && !levelStr.includes('todos')) {
          return false;
        }
      }

      if (selectedDay) {
        const hasDay = (disc.dias || []).some(
          (d) => d.toLowerCase() === selectedDay.toLowerCase()
        );
        const matchesHorario = (disc.horario || '').toLowerCase().includes(selectedDay.toLowerCase());
        if (!hasDay && !matchesHorario) {
          return false;
        }
      }

      if (selectedStatus) {
        if (selectedStatus === 'Activos' && !disc.activo) return false;
        if (selectedStatus === 'Completos' && disc.cupoOcupado < disc.cupoMax) return false;
        if (selectedStatus === 'En Pausa' && disc.activo) return false;
      }

      return true;
    });
  }, [disciplines, searchTerm, selectedLevel, selectedDay, selectedStatus]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setSelectedDay('');
    setSelectedStatus('');
    setCurrentPage(1);
    showToast('Filtros restablecidos.', 'info');
  };

  // Pagination calculation
  const totalItems = filteredDisciplines.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentDisciplines = filteredDisciplines.slice(startIndex, startIndex + PAGE_SIZE);

  // Handlers
  const handleToggleStatus = async (discipline) => {
    const nextStatus = !discipline.activo;
    setDisciplines((prev) =>
      prev.map((d) => (d.id === discipline.id ? { ...d, activo: nextStatus } : d))
    );
    try {
      await toggleSportActivityStatusApi(discipline.id, discipline.activo);
      showToast(
        `La disciplina "${discipline.nombre}" ha sido ${nextStatus ? 'activada' : 'pausada'}.`,
        nextStatus ? 'success' : 'info'
      );
    } catch (err) {
      setDisciplines((prev) =>
        prev.map((d) => (d.id === discipline.id ? { ...d, activo: discipline.activo } : d))
      );
      showToast(`Error al modificar estado en Firebase: ${err.message}`, 'error');
    }
  };

  const handleCreateDiscipline = async (newDiscipline) => {
    try {
      const created = await createSportActivityApi(newDiscipline);
      setDisciplines((prev) => [created, ...prev.filter((d) => d.id !== created.id)]);
      showToast(`¡Disciplina "${newDiscipline.nombre}" creada y persistida en Firebase!`, 'success');
      setIsNewModalOpen(false);
    } catch (err) {
      showToast(`Error al guardar disciplina en Firebase: ${err.message}`, 'error');
    }
  };

  const handleSaveEditDiscipline = async (discId, updatedDiscipline) => {
    try {
      await updateSportActivityApi(discId, updatedDiscipline);
      setDisciplines((prev) =>
        prev.map((d) => (d.id === discId ? { ...d, ...updatedDiscipline } : d))
      );
      showToast(`Disciplina "${updatedDiscipline.nombre}" actualizada.`, 'success');
      setEditingDiscipline(null);
    } catch (err) {
      showToast(`Error al actualizar en Firebase: ${err.message}`, 'error');
    }
  };

  const handleExportPayroll = () => {
    exportSportsRosterCsv(filteredDisciplines);
    showToast('Descargando padrón deportivo en formato CSV...', 'success');
  };

  return {
    disciplines,
    teachers,
    notification,
    setNotification,
    searchTerm,
    setSearchTerm,
    selectedLevel,
    setSelectedLevel,
    selectedDay,
    setSelectedDay,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    isNewModalOpen,
    setIsNewModalOpen,
    editingDiscipline,
    setEditingDiscipline,
    viewingDiscipline,
    setViewingDiscipline,
    totalItems,
    totalPages,
    currentDisciplines,
    handleResetFilters,
    handleToggleStatus,
    handleCreateDiscipline,
    handleSaveEditDiscipline,
    handleExportPayroll,
  };
};
