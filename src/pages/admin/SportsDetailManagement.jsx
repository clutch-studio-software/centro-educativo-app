import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import { SportsDetailHeaderCard } from '../../components/admin/sports/SportsDetailHeaderCard';
import { SportsDetailBentoGrid } from '../../components/admin/sports/SportsDetailBentoGrid';
import { SportsDetailRosterSection } from '../../components/admin/sports/SportsDetailRosterSection';
import { SportsDetailModals } from '../../components/admin/sports/SportsDetailModals';
import {
  INITIAL_SPORT_DETAIL,
  INITIAL_STUDENTS_ROSTER,
  exportSportRosterCsv,
} from '../../data/mockSportsDetailData';
import { INITIAL_DISCIPLINES } from '../../data/mockSportsActivities';
import { MOCK_TEACHERS } from '../../data/mockTeachers';

const PAGE_SIZE = 6;

const SportsDetailManagement = () => {
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
        if (!student.cursoCompleto.includes(selectedCurso) && student.curso !== selectedCurso) {
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
  const handleToggleOffer = () => {
    const updatedStatus = !discipline.activo;
    setDiscipline((prev) => ({ ...prev, activo: updatedStatus }));
    showToast(
      `Oferta extracurricular de "${discipline.titulo}" ha sido ${
        updatedStatus ? 'activada y abierta' : 'cerrada temporalmente'
      }.`,
      updatedStatus ? 'success' : 'info'
    );
  };

  const handleEnrollStudent = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    showToast(
      `¡Alumno ${newStudent.nombre} matriculado con éxito en ${discipline.titulo}!`,
      'success'
    );
  };

  const handleSaveConfig = (updatedConfig) => {
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
  };

  const handleReassignTeacher = (newTeacher) => {
    setDiscipline((prev) => ({
      ...prev,
      profesor: {
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
      },
    }));
    showToast(`Profesor titular reasignado: ${newTeacher.nombre}`, 'success');
  };

  const handleTransferOrWithdraw = ({ actionType, student, targetDiscipline }) => {
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    if (actionType === 'transfer') {
      showToast(
        `Alumno ${student.nombre} transferido exitosamente a ${targetDiscipline}.`,
        'success'
      );
    } else {
      showToast(
        `Baja procesada: ${student.nombre} fue retirado de ${discipline.titulo}. Plaza liberada.`,
        'info'
      );
    }
    setTransferStudent(null);
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

  return (
    <AdminLayout activeItem="actividades-deportivas" breadcrumbs={['Deportes & Talleres', discipline.titulo]}>
      <div className="flex flex-col w-full pb-12">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        <div className="w-full">
          {/* Top Breadcrumb & Actions Bar & Header Hero Card */}
          <SportsDetailHeaderCard
            discipline={discipline}
            onOpenConfig={() => setIsEditConfigModalOpen(true)}
            onOpenEnroll={() => setIsEnrollModalOpen(true)}
            onToggleOffer={handleToggleOffer}
          />

          {/* Operational Overview Bento Grid */}
          <SportsDetailBentoGrid
            discipline={discipline}
            occupancyCount={occupancyCount}
            maxCapacity={maxCapacity}
            occupancyPercentage={occupancyPercentage}
            vacantesDisponibles={vacantesDisponibles}
            isAlmostFull={isAlmostFull}
            isFull={isFull}
            onOpenReassignTeacher={() => setIsReassignTeacherModalOpen(true)}
          />

          {/* Main Section: Alumnos Inscriptos */}
          <SportsDetailRosterSection
            filteredStudents={filteredStudents}
            currentStudents={currentStudents}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedNivel={selectedNivel}
            onSelectNivel={setSelectedNivel}
            selectedCurso={selectedCurso}
            onSelectCurso={setSelectedCurso}
            selectedEstadoCuota={selectedEstadoCuota}
            onSelectEstadoCuota={setSelectedEstadoCuota}
            onResetFilters={handleResetFilters}
            onExportCsv={handleExportCsv}
            onViewLegajo={setViewingStudent}
            onTransferStudent={setTransferStudent}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Modals Container */}
        <SportsDetailModals
          isEnrollModalOpen={isEnrollModalOpen}
          onCloseEnroll={() => setIsEnrollModalOpen(false)}
          onEnrollStudent={handleEnrollStudent}
          studentsCount={students.length}
          maxCapacity={discipline.cupoMax}
          enrolledStudents={students}
          isEditConfigModalOpen={isEditConfigModalOpen}
          discipline={discipline}
          onCloseEditConfig={() => setIsEditConfigModalOpen(false)}
          onSaveConfig={handleSaveConfig}
          teachers={MOCK_TEACHERS}
          isReassignTeacherModalOpen={isReassignTeacherModalOpen}
          onCloseReassignTeacher={() => setIsReassignTeacherModalOpen(false)}
          onReassignTeacher={handleReassignTeacher}
          transferStudent={transferStudent}
          onCloseTransfer={() => setTransferStudent(null)}
          onConfirmTransfer={handleTransferOrWithdraw}
          viewingStudent={viewingStudent}
          onCloseViewingStudent={() => setViewingStudent(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default SportsDetailManagement;
