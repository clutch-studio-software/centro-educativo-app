import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import DisciplineFilters from '../../components/admin/sports/DisciplineFilters';
import DisciplineTable from '../../components/admin/sports/DisciplineTable';
import DisciplinePagination from '../../components/admin/sports/DisciplinePagination';
import DisciplineDetailsModal from '../../components/admin/sports/DisciplineDetailsModal';
import NewDisciplineModal from '../../components/admin/sports/NewDisciplineModal';
import EditDisciplineModal from '../../components/admin/sports/EditDisciplineModal';
import {
  INITIAL_DISCIPLINES,
  exportSportsRosterCsv,
} from '../../data/mockSportsActivities';
import { MOCK_TEACHERS } from '../../data/mockTeachers';

const PAGE_SIZE = 8;

const SportsManagement = () => {
  const navigate = useNavigate();

  // Sports & Disciplines State
  const [disciplines, setDisciplines] = useState(INITIAL_DISCIPLINES);
  const [teachers] = useState(MOCK_TEACHERS);

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

  // Filter Logic
  const filteredDisciplines = useMemo(() => {
    return disciplines.filter((disc) => {
      // Search term (name, teacher, location)
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (disc.nombre || '').toLowerCase().includes(query);
        const matchesTeacher = (disc.profesor?.nombre || '').toLowerCase().includes(query);
        const matchesLocation = (disc.lugar || '').toLowerCase().includes(query);
        if (!matchesName && !matchesTeacher && !matchesLocation) {
          return false;
        }
      }

      // Level filter
      if (selectedLevel) {
        const levelStr = String(disc.niveles || '').toLowerCase();
        const queryLevel = selectedLevel.toLowerCase();
        if (queryLevel === 'todos los niveles') {
          // match all
        } else if (!levelStr.includes(queryLevel) && !levelStr.includes('todos')) {
          return false;
        }
      }

      // Day filter
      if (selectedDay) {
        const hasDay = (disc.dias || []).some(
          (d) => d.toLowerCase() === selectedDay.toLowerCase()
        );
        const matchesHorario = (disc.horario || '').toLowerCase().includes(selectedDay.toLowerCase());
        if (!hasDay && !matchesHorario) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus) {
        if (selectedStatus === 'Activos') {
          if (!disc.activo) return false;
        } else if (selectedStatus === 'Completos') {
          if (disc.cupoOcupado < disc.cupoMax) return false;
        } else if (selectedStatus === 'En Pausa') {
          if (disc.activo) return false;
        }
      }

      return true;
    });
  }, [disciplines, searchTerm, selectedLevel, selectedDay, selectedStatus]);

  // Reset page when filters change
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
  const handleToggleStatus = (discipline) => {
    const nextStatus = !discipline.activo;
    setDisciplines((prev) =>
      prev.map((d) => (d.id === discipline.id ? { ...d, activo: nextStatus } : d))
    );
    showToast(
      `La disciplina "${discipline.nombre}" ha sido ${nextStatus ? 'activada' : 'pausada'}.`,
      nextStatus ? 'success' : 'info'
    );
  };

  const handleCreateDiscipline = (newDiscipline) => {
    setDisciplines((prev) => [newDiscipline, ...prev]);
    showToast(`¡Disciplina "${newDiscipline.nombre}" creada con éxito!`, 'success');
  };

  const handleSaveEditDiscipline = (discId, updatedDiscipline) => {
    setDisciplines((prev) =>
      prev.map((d) => (d.id === discId ? updatedDiscipline : d))
    );
    showToast(`Disciplina "${updatedDiscipline.nombre}" actualizada.`, 'success');
    setEditingDiscipline(null);
  };

  const handleExportPayroll = () => {
    exportSportsRosterCsv(filteredDisciplines);
    showToast('Descargando padrón deportivo en formato CSV...', 'success');
  };

  return (
    <AdminLayout activeItem="servicios" breadcrumbs={['Deportes y Extracurriculares']}>
      <div className="max-w-[1440px] mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Floating Toast Notification */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Header Section */}
        <section
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          data-purpose="page-header"
          data-testid="sports-header"
        >
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200/60 mb-2">
              ÁREA EXTRACURRICULAR Y BIENESTAR
            </span>
            <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              Deportes y Actividades Extracurriculares
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Gestión de disciplinas deportivas, vacantes escolares, profesores a cargo y control de inscripciones.
            </p>
          </div>

          {/* Actions Toolbar */}
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
              <span>+ Nueva Disciplina</span>
            </button>
          </div>
        </section>

        {/* Institutional Rule / Policy Banner */}
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

        {/* Filter and Search Bar */}
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

        {/* Disciplines Grid Catalog Table */}
        <DisciplineTable
          disciplines={currentDisciplines}
          onViewDetails={(disc) => {
            navigate(`/admin/servicios/detalle/${disc.id || 'disc-1'}`);
          }}
          onEditDiscipline={(disc) => setEditingDiscipline(disc)}
          onToggleStatus={handleToggleStatus}
          onResetFilters={handleResetFilters}
        />

        {/* Pagination Footer */}
        <DisciplinePagination
          totalItems={totalItems}
          startIndex={startIndex}
          pageSize={PAGE_SIZE}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Modals */}
        <NewDisciplineModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onSave={handleCreateDiscipline}
          teachers={teachers}
        />

        <EditDisciplineModal
          isOpen={Boolean(editingDiscipline)}
          discipline={editingDiscipline}
          onClose={() => setEditingDiscipline(null)}
          onSave={handleSaveEditDiscipline}
          teachers={teachers}
        />

        <DisciplineDetailsModal
          isOpen={Boolean(viewingDiscipline)}
          discipline={viewingDiscipline}
          onClose={() => setViewingDiscipline(null)}
          onEdit={(disc) => setEditingDiscipline(disc)}
        />
      </div>
    </AdminLayout>
  );
};

export default SportsManagement;
