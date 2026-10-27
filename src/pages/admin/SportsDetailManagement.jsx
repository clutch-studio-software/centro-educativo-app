import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import { SportsDetailHeaderCard } from '../../components/admin/sports/SportsDetailHeaderCard';
import { SportsDetailBentoGrid } from '../../components/admin/sports/SportsDetailBentoGrid';
import { SportsDetailRosterSection } from '../../components/admin/sports/SportsDetailRosterSection';
import { SportsDetailModals } from '../../components/admin/sports/SportsDetailModals';
import { useSportsDetailManagement } from '../../components/admin/sports/useSportsDetailManagement';

const SportsDetailManagement = () => {
  const {
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
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    handleDeleteDiscipline,
    handleToggleOffer,
    handleEnrollStudent,
    handleSaveConfig,
    handleReassignTeacher,
    handleTransferOrWithdraw,
    handleResetFilters,
    handleExportCsv,
  } = useSportsDetailManagement();

  return (
    <AdminLayout
      activeItem="servicios"
      breadcrumbs={['Deportes y Extracurriculares', discipline.nombre || 'Detalle']}
    >
      <div className="max-w-[1440px] mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link
            to="/admin/servicios"
            className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Volver a Deportes y Servicios
          </Link>
        </div>

        <SportsDetailHeaderCard
          discipline={discipline}
          onOpenEnroll={() => setIsEnrollModalOpen(true)}
          onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
          onOpenConfig={() => setIsEditConfigModalOpen(true)}
          onOpenEditConfigModal={() => setIsEditConfigModalOpen(true)}
          onToggleOffer={handleToggleOffer}
          onDeleteDiscipline={() => setIsDeleteModalOpen(true)}
          isFull={isFull}
        />

        <SportsDetailBentoGrid
          discipline={discipline}
          occupancyCount={occupancyCount}
          maxCapacity={maxCapacity}
          occupancyPercentage={occupancyPercentage}
          vacantesDisponibles={vacantesDisponibles}
          isAlmostFull={isAlmostFull}
          isFull={isFull}
          onOpenReassignModal={() => setIsReassignTeacherModalOpen(true)}
        />

        <div className="pt-2">
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

        <SportsDetailModals
          isEnrollModalOpen={isEnrollModalOpen}
          onCloseEnroll={() => setIsEnrollModalOpen(false)}
          onEnrollStudent={handleEnrollStudent}
          studentsCount={students.length}
          maxCapacity={discipline.cupoMax}
          enrolledStudents={students}
          allDisciplines={allDisciplines}
          isEditConfigModalOpen={isEditConfigModalOpen}
          discipline={discipline}
          onCloseEditConfig={() => setIsEditConfigModalOpen(false)}
          onSaveConfig={handleSaveConfig}
          teachers={teachers}
          isReassignTeacherModalOpen={isReassignTeacherModalOpen}
          onCloseReassignTeacher={() => setIsReassignTeacherModalOpen(false)}
          onReassignTeacher={handleReassignTeacher}
          transferStudent={transferStudent}
          onCloseTransfer={() => setTransferStudent(null)}
          onConfirmTransfer={handleTransferOrWithdraw}
          viewingStudent={viewingStudent}
          onCloseViewingStudent={() => setViewingStudent(null)}
          isDeleteModalOpen={isDeleteModalOpen}
          isDeleting={isDeleting}
          onCloseDeleteModal={() => setIsDeleteModalOpen(false)}
          onConfirmDeleteDiscipline={handleDeleteDiscipline}
        />
      </div>
    </AdminLayout>
  );
};

export default SportsDetailManagement;
