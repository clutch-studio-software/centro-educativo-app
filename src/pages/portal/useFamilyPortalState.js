import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchFamilyPortalData,
  enrollStudentInTransportApi,
  cancelStudentTransportApi,
  toggleStudentDiningApi,
  enrollStudentInSportService,
  withdrawStudentFromSportService,
} from '../../services/familyPortalService.js';
import {
  getStudentSubjectsWithTeachers,
  getStudentTransportRoute,
} from '../../utils/academicUtils.js';
import { getStudentSportsDetails } from '../../components/admin/reports/reportsUtils.js';

export const useFamilyPortalState = (user) => {
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [allStudents, setAllStudents] = useState([]);
  const [linkedStudents, setLinkedStudents] = useState([]);
  const [allSports, setAllSports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [portalMode, setPortalMode] = useState('inscripciones');

  const roleNorm = String(user?.role || '').toLowerCase();
  const isStudentUser =
    roleNorm.includes('estudiante') || roleNorm.includes('alumno');
  const isParentUser = !isStudentUser;

  const loadPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFamilyPortalData(user);
      setAllStudents(data.students);
      setLinkedStudents(data.linkedStudents);
      setAllSports(data.allSports);
      setRoutes(data.routes);

      if (data.linkedStudents.length > 0) {
        setSelectedStudentId(data.linkedStudents[0].id);
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'No se pudieron cargar los datos del portal escolar.',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPortalData();
  }, [loadPortalData]);

  const currentStudent = useMemo(() => {
    if (!selectedStudentId) return linkedStudents[0] || null;
    return (
      allStudents.find((s) => String(s.id) === String(selectedStudentId)) ||
      linkedStudents.find((s) => String(s.id) === String(selectedStudentId)) ||
      linkedStudents[0] ||
      null
    );
  }, [selectedStudentId, allStudents, linkedStudents]);

  const subjects = useMemo(() => {
    return getStudentSubjectsWithTeachers(currentStudent);
  }, [currentStudent]);

  const sports = useMemo(() => {
    return getStudentSportsDetails(currentStudent, allSports);
  }, [currentStudent, allSports]);

  const transportDetails = useMemo(() => {
    if (!currentStudent) return null;
    const routeObj = getStudentTransportRoute(currentStudent, routes);
    const servicios = Array.isArray(currentStudent.servicios)
      ? currentStudent.servicios
      : [];
    const activo =
      Boolean(routeObj) ||
      servicios.some((s) => String(s).toLowerCase().includes('transporte'));

    return {
      activo,
      recorrido: routeObj?.nombre || currentStudent.recorridoTransporte || 'Transporte asignado',
      zona: routeObj?.zona || 'Zona a coordinar',
      horarioIda: routeObj?.horarioIda || '07:00 hs',
      horarioRegreso: routeObj?.horarioRegreso || '16:30 hs',
    };
  }, [currentStudent, routes]);

  const diningDetails = useMemo(() => {
    if (!currentStudent) return null;
    const servicios = Array.isArray(currentStudent.servicios)
      ? currentStudent.servicios
      : [];
    const activo =
      Boolean(currentStudent.comedor) ||
      servicios.some((s) => String(s).toLowerCase().includes('comedor'));

    return {
      activo,
      observaciones: currentStudent.observacionesComedor,
    };
  }, [currentStudent]);

  const updateLocalStudent = (updatedStudent) => {
    setAllStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setLinkedStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleEnrollTransport = async (routeId) => {
    if (!currentStudent || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await enrollStudentInTransportApi({
        student: currentStudent,
        routeId,
        allStudents,
        routes,
      });
      updateLocalStudent(updated);
      setFeedback({
        type: 'success',
        message: `Inscripción al ${routeId} confirmada exitosamente. Facturación inicial con proporcional del mes.`,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelTransport = async () => {
    if (!currentStudent || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await cancelStudentTransportApi({
        student: currentStudent,
      });
      updateLocalStudent(res.student);
      setFeedback({
        type: 'success',
        message: res.message,
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnrollSport = async (sportId) => {
    if (!currentStudent || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await enrollStudentInSportService({
        student: currentStudent,
        sportId,
      });
      updateLocalStudent(updated);
      setFeedback({
        type: 'success',
        message: 'Inscripción a la actividad deportiva registrada con éxito.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawSport = async (sportId) => {
    if (!currentStudent || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await withdrawStudentFromSportService({
        student: currentStudent,
        sportId,
      });
      updateLocalStudent(updated);
      setFeedback({
        type: 'success',
        message: 'Se dio de baja la actividad deportiva correctamente.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleDining = async (active) => {
    if (!currentStudent || isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await toggleStudentDiningApi({
        student: currentStudent,
        active,
      });
      updateLocalStudent(updated);
      setFeedback({
        type: 'success',
        message: active
          ? 'Servicio de comedor escolar habilitado exitosamente.'
          : 'Se dio de baja el servicio de comedor escolar.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loading,
    isProcessing,
    feedback,
    setFeedback,
    allStudents,
    linkedStudents,
    allSports,
    routes,
    selectedStudentId,
    setSelectedStudentId,
    portalMode,
    setPortalMode,
    isStudentUser,
    isParentUser,
    currentStudent,
    subjects,
    sports,
    transportDetails,
    diningDetails,
    handleEnrollTransport,
    handleCancelTransport,
    handleEnrollSport,
    handleWithdrawSport,
    handleToggleDining,
  };
};
