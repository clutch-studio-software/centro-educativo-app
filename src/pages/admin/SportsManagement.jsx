import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';
import DisciplineFilters from '../../components/admin/sports/DisciplineFilters';
import DisciplineTable from '../../components/admin/sports/DisciplineTable';
import DisciplinePagination from '../../components/admin/sports/DisciplinePagination';
import DisciplineDetailsModal from '../../components/admin/sports/DisciplineDetailsModal';
import NewDisciplineModal from '../../components/admin/sports/NewDisciplineModal';
import EditDisciplineModal from '../../components/admin/sports/EditDisciplineModal';
import DeleteDisciplineModal from '../../components/admin/sports/DeleteDisciplineModal';
import { useSportsManagement } from '../../components/admin/sports/useSportsManagement';

const SportsManagement = () => {
  const navigate = useNavigate();
  const {
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
    deletingDiscipline,
    setDeletingDiscipline,
    isDeleting,
    handleDeleteDiscipline,
    totalItems,
    totalPages,
    currentDisciplines,
    handleResetFilters,
    handleToggleStatus,
    handleCreateDiscipline,
    handleSaveEditDiscipline,
    handleExportPayroll,
  } = useSportsManagement();

  return (
    <AdminLayout activeItem="servicios" breadcrumbs={['Deportes y Extracurriculares']}>
      <div className="max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        <section
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          data-purpose="page-header"
          data-testid="sports-header"
        >
          <AdminSectionTitle
            icon="sports_soccer"
            title="Deportes y Actividades Extracurriculares"
            subtitle="Gestión de disciplinas deportivas, vacantes escolares, profesores a cargo y control de inscripciones."
          />

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportPayroll}
              data-testid="btn-export-sports"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Descargar Padrón Deportivo</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              data-testid="btn-new-discipline"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#1d68f0] rounded-xl hover:bg-blue-600 transition-all shadow-sm shadow-blue-500/20 cursor-pointer border-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Nueva Disciplina</span>
            </button>
          </div>
        </section>

        <section
          className="bg-blue-50/70 border border-blue-100/90 rounded-2xl p-4 flex items-center gap-3.5 text-blue-900"
          data-purpose="rule-banner"
          data-testid="rule-banner"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 text-blue-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-xs">
            <span className="font-bold text-blue-900">Control transaccional activo:</span>
            <span className="text-blue-800/90 ml-1">
              Máximo 2 deportes por alumno sin superposición horaria escolar. Verificación automática en inscripciones simultáneas.
            </span>
          </div>
        </section>

        <DisciplineFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedDay={selectedDay}
          onDayChange={setSelectedDay}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onResetFilters={handleResetFilters}
        />

        <DisciplineTable
          disciplines={currentDisciplines}
          onViewDetails={(disc) => {
            navigate(`/admin/servicios/detalle/${disc.id || 'disc-1'}`);
          }}
          onEditDiscipline={(disc) => setEditingDiscipline(disc)}
          onDeleteDiscipline={(disc) => setDeletingDiscipline(disc)}
          onToggleStatus={handleToggleStatus}
          onResetFilters={handleResetFilters}
        />

        <DisciplinePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />

        <NewDisciplineModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSave={handleCreateDiscipline}
          onCreate={handleCreateDiscipline}
          teachers={teachers}
          existingDisciplines={disciplines}
        />

        <EditDisciplineModal
          isOpen={Boolean(editingDiscipline)}
          discipline={editingDiscipline}
          onClose={() => setEditingDiscipline(null)}
          onSave={handleSaveEditDiscipline}
          teachers={teachers}
        />

        <DeleteDisciplineModal
          isOpen={Boolean(deletingDiscipline)}
          discipline={deletingDiscipline}
          isDeleting={isDeleting}
          onClose={() => setDeletingDiscipline(null)}
          onConfirm={() => handleDeleteDiscipline(deletingDiscipline)}
        />

        <DisciplineDetailsModal
          discipline={viewingDiscipline}
          onClose={() => setViewingDiscipline(null)}
          onEdit={(disc) => {
            setViewingDiscipline(null);
            setEditingDiscipline(disc);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default SportsManagement;
