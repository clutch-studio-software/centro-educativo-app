import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import TeacherFilters from '../../components/admin/teachers/TeacherFilters';
import TeacherTable from '../../components/admin/teachers/TeacherTable';
import NewTeacherModal from '../../components/admin/teachers/NewTeacherModal';
import EditTeacherModal from '../../components/admin/teachers/EditTeacherModal';
import TeacherAssignmentsDrawer from '../../components/admin/teachers/TeacherAssignmentsDrawer';
import TeacherSelfScheduleBanner from '../../components/admin/teachers/TeacherSelfScheduleBanner';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';
import AdminTablePagination from '../../components/admin/AdminTablePagination';
import { useTeachersManagement, PAGE_SIZE } from './useTeachersManagement';

const TeachersManagementHeader = ({
  onExportNomina,
  onOpenNewTeacherModal,
  canManageTeachers = true,
}) => (
  <section data-testid="teachers-management-header" className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <AdminSectionTitle
        icon="badge"
        title="Gestión del Plantel Docente"
        subtitle="Administración centralizada de legajos docentes, designaciones y estado de personal."
      />

      <div data-testid="buttons-actions-teachers" className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExportNomina}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">
            file_download
          </span>
          <span>Exportar Nómina</span>
        </button>

        {canManageTeachers && (
          <button
            type="button"
            onClick={onOpenNewTeacherModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all rounded-full font-bold text-xs shadow-[0_4px_14px_rgba(11,80,213,0.3)] hover:shadow-lg active:scale-95 h-10 duration-200 text-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-300">
              person_add
            </span>
            <span>Registrar Docente</span>
          </button>
        )}
      </div>
    </div>
  </section>
);

const TeachersModals = ({
  isNewTeacherModalOpen,
  setIsNewTeacherModalOpen,
  handleCreateTeacher,
  editingTeacher,
  setEditingTeacher,
  handleSaveEditTeacher,
}) => (
  <>
    <NewTeacherModal
      isOpen={isNewTeacherModalOpen}
      onClose={() => setIsNewTeacherModalOpen(false)}
      onSubmit={handleCreateTeacher}
    />

    <EditTeacherModal
      isOpen={Boolean(editingTeacher)}
      teacher={editingTeacher}
      onClose={() => setEditingTeacher(null)}
      onSave={handleSaveEditTeacher}
    />
  </>
);

const TeachersManagement = () => {
  const {
    user,
    canManageTeachers,
    isDocenteRole,
    teachers,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    startIndex,
    currentTeachers,
    isNewTeacherModalOpen,
    setIsNewTeacherModalOpen,
    editingTeacher,
    setEditingTeacher,
    assigningTeacher,
    setAssigningTeacher,
    courses,
    notification,
    setNotification,
    handleResetFilters,
    handleCreateTeacher,
    handleSaveEditTeacher,
    handleOpenAssignments,
    handleSaveAssignments,
    handleToggleStatus,
    handleResetPassword,
    handleDeleteTeacher,
    handleExportNomina,
  } = useTeachersManagement();

  return (
    <AdminLayout activeItem="docentes" breadcrumbs={['Cuerpo Docente']}>
      <div className="flex flex-col w-full gap-6">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        <TeachersManagementHeader
          onExportNomina={handleExportNomina}
          onOpenNewTeacherModal={() => setIsNewTeacherModalOpen(true)}
          canManageTeachers={canManageTeachers}
        />

        {isDocenteRole && (
          <TeacherSelfScheduleBanner
            user={user}
            teachers={teachers}
            onOpenSchedule={handleOpenAssignments}
          />
        )}

        <TeacherFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
          onResetFilters={handleResetFilters}
        />

        {isLoading && (
          <div
            data-testid="teachers-sync-indicator"
            className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 w-fit"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Sincronizando nómina docente con base de datos...</span>
          </div>
        )}

        <div className="flex flex-col gap-0">
          <TeacherTable
            teachers={currentTeachers}
            isLoading={isLoading}
            currentUser={user}
            onManageAssignments={handleOpenAssignments}
            onEditTeacher={(teacher) => setEditingTeacher(teacher)}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
            onDeleteTeacher={handleDeleteTeacher}
            onResetFilters={handleResetFilters}
            canManageTeachers={canManageTeachers}
          />

          <AdminTablePagination
            isLoading={isLoading}
            totalItems={totalItems}
            startIndex={startIndex}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemLabel="docentes registrados"
          />
        </div>

        <TeachersModals
          isNewTeacherModalOpen={isNewTeacherModalOpen}
          setIsNewTeacherModalOpen={setIsNewTeacherModalOpen}
          handleCreateTeacher={handleCreateTeacher}
          editingTeacher={editingTeacher}
          setEditingTeacher={setEditingTeacher}
          handleSaveEditTeacher={handleSaveEditTeacher}
        />

        <TeacherAssignmentsDrawer
          key={assigningTeacher?.id || 'closed'}
          isOpen={Boolean(assigningTeacher)}
          onClose={() => setAssigningTeacher(null)}
          teacher={assigningTeacher}
          allTeachers={teachers}
          courses={courses}
          onSaveAssignments={handleSaveAssignments}
          readOnly={!canManageTeachers}
        />
      </div>
    </AdminLayout>
  );
};

export default TeachersManagement;
