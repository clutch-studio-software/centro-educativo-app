import React from 'react';
import AdminSectionTitle from '../AdminSectionTitle';
import AcademicTabsNav from './AcademicTabsNav';

export const AcademicOfferHeaderSection = ({
  canManageSubjects,
  canManageAcademicOffer,
  onOpenNewSubjectModal,
  onOpenNewCourseModal,
  isDocente,
  currentTeacherName,
  levels,
  coursesByLevel,
  activeTab,
  onSelectTab,
  subjectsCount,
}) => {
  return (
    <section className="mb-2" data-purpose="section-header">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <AdminSectionTitle
          icon="menu_book"
          title="Gestión de Niveles Académicos"
          subtitle="Administración centralizada de divisiones, turnos, matrícula de alumnos y oferta pedagógica."
        />

        {/* Section Primary CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          {canManageSubjects && (
            <button
              type="button"
              data-testid="btn-new-subject"
              onClick={onOpenNewSubjectModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-500">add_circle</span>
              Nueva Materia
            </button>
          )}
          {canManageAcademicOffer && (
            <button
              type="button"
              data-testid="btn-create-course"
              onClick={onOpenNewCourseModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Crear División / Curso
            </button>
          )}
        </div>
      </div>

      {/* Docente Exclusive Scope Notice */}
      {isDocente && (
        <div
          data-testid="docente-filtered-courses-banner"
          className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-800"
        >
          <span className="material-symbols-outlined text-blue-600 text-lg">school</span>
          <div>
            <span className="font-bold">Vista de Docente:</span> Mostrando exclusivamente las divisiones y materias donde dictas cátedra (<strong>{currentTeacherName}</strong>).
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar: 3 Pestañas por Nivel + Planes de Estudio */}
      <AcademicTabsNav
        levels={levels}
        coursesByLevel={coursesByLevel}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        subjectsCount={subjectsCount}
      />
    </section>
  );
};

export default AcademicOfferHeaderSection;
