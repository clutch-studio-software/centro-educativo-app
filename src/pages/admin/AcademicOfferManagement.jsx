import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import DivisionTable from '../../components/admin/academic/DivisionTable';
import ViewDivisionModal from '../../components/admin/academic/ViewDivisionModal';
import SubjectPlanPanel from '../../components/admin/academic/SubjectPlanPanel';
import NewCourseModal from '../../components/admin/academic/NewCourseModal';
import EditCourseModal from '../../components/admin/academic/EditCourseModal';
import NewSubjectModal from '../../components/admin/academic/NewSubjectModal';
import ReassignTeacherModal from '../../components/admin/academic/ReassignTeacherModal';
import {
  ACADEMIC_LEVELS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
} from '../../data/mockAcademicOffer';
import { MOCK_TEACHERS } from '../../data/mockTeachers';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';

const AcademicOfferManagement = () => {
  // State for Academic Offer Data
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers] = useState(MOCK_TEACHERS);

  // Tab State: 'inicial' | 'primario' | 'secundario' | 'planes'
  const [activeTab, setActiveTab] = useState('primario');

  // Selected Course for Subjects Plan View
  const [selectedCourseId, setSelectedCourseId] = useState('curso-ns-1');

  // Modals State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [reassigningSubject, setReassigningSubject] = useState(null);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Handlers for Course actions
  const handleToggleCourseStatus = (course) => {
    const updatedStatus = !course.activo;
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, activo: updatedStatus } : c))
    );
    showToast(
      `La división "${course.nombre} (${course.division || 'A'})" ha sido ${
        updatedStatus ? 'activada' : 'pausada'
      }.`,
      updatedStatus ? 'success' : 'info'
    );
  };

  const handleCreateCourse = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    showToast(`¡División "${newCourse.nombre} (${newCourse.division || 'A'})" creada con éxito!`, 'success');
  };

  const handleSaveEditCourse = (courseId, updatedCourse) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updatedCourse : c)));
    showToast(`División "${updatedCourse.nombre} (${updatedCourse.division || 'A'})" actualizada.`, 'success');
    setEditingCourse(null);
  };

  const handleDeleteCourse = (course) => {
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    showToast(
      `División "${course.nombre} (${course.division || 'A'})" eliminada de la oferta académica.`,
      'info'
    );
  };

  const handleViewCourse = (course) => {
    setViewingCourse(course);
  };

  const handleManageCourse = (course) => {
    setEditingCourse(course);
  };

  // Handlers for Subject actions
  const handleCreateSubject = (newSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === newSubject.cursoId
          ? { ...c, materiasCount: (c.materiasCount || 0) + 1 }
          : c
      )
    );
    setSelectedCourseId(newSubject.cursoId);
    showToast(`Materia "${newSubject.nombre}" agregada al plan.`, 'success');
  };

  const handleToggleSubjectDictado = (subject) => {
    const updatedDictado = !subject.dictadoActivo;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subject.id ? { ...s, dictadoActivo: updatedDictado } : s
      )
    );
    showToast(
      `Dictado de "${subject.nombre}" ${updatedDictado ? 'reanudado' : 'pausado'}.`,
      'info'
    );
  };

  const handleSaveReassignedTeacher = (subjectId, newProfesor) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, profesor: newProfesor } : s))
    );
    showToast(
      `Docente ${newProfesor.nombre} reasignado a la materia.`,
      'success'
    );
    setReassigningSubject(null);
  };

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    return {
      inicial: courses.filter((c) => c.nivelId === 'inicial'),
      primario: courses.filter((c) => c.nivelId === 'primario'),
      secundario: courses.filter((c) => c.nivelId === 'secundario'),
    };
  }, [courses]);

  const activeLevelConfig = useMemo(() => {
    return ACADEMIC_LEVELS.find((l) => l.id === activeTab) || ACADEMIC_LEVELS[1];
  }, [activeTab]);

  return (
    <AdminLayout activeItem="oferta-academica" breadcrumbs={['Oferta Académica']}>
      <div className="flex flex-col w-full gap-6">
        {/* Floating Toast Notification */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Top Title & Action Hub */}
        <section className="mb-2" data-purpose="section-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <AdminSectionTitle
              icon="menu_book"
              title="Gestión del Plantel Docente y Académico"
              subtitle="Administración centralizada de divisiones, turnos, cupos y oferta académica por nivel educativo."
            />

            {/* Section Primary CTA Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                data-testid="btn-new-subject"
                onClick={() => setIsNewSubjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-blue-500">add_circle</span>
                + Nueva Materia
              </button>
              <button
                type="button"
                data-testid="btn-create-course"
                onClick={() => setIsNewCourseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                + Crear División / Curso
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar: 3 Pestañas por Nivel + Planes de Estudio */}
          <div className="mt-6 border-b border-slate-200/80 flex items-center justify-between">
            <div
              className="flex space-x-2 sm:space-x-4 text-sm font-semibold overflow-x-auto pb-px"
              data-purpose="tab-navigation"
            >
              {ACADEMIC_LEVELS.map((level) => {
                const count = (coursesByLevel[level.id] || []).length;
                const isActive = activeTab === level.id;
                return (
                  <button
                    key={level.id}
                    type="button"
                    id={`tabBtn-${level.id}`}
                    data-testid={`tab-${level.id}`}
                    onClick={() => setActiveTab(level.id)}
                    className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-blue-600 text-blue-600 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {level.id === 'inicial'
                        ? 'toys'
                        : level.id === 'primario'
                        ? 'school'
                        : 'history_edu'}
                    </span>
                    <span>{level.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {count} {level.id === 'inicial' ? 'Salas' : 'Divisiones'}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                id="tabBtnPlanes"
                data-testid="tab-planes-materias"
                onClick={() => setActiveTab('planes')}
                className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer whitespace-nowrap ${
                  activeTab === 'planes'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                <span>Planes de Materias</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 font-semibold border border-slate-200">
                  {subjects.length} Materias
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Content: Level Divisions Table */}
        {activeTab !== 'planes' && (
          <div className="animate-in fade-in duration-200" id={`viewLevel-${activeTab}`}>
            <DivisionTable
              level={activeLevelConfig}
              courses={coursesByLevel[activeTab] || []}
              onToggleStatus={handleToggleCourseStatus}
              onEditCourse={handleManageCourse}
              onViewCourse={handleViewCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddNewDivision={() => setIsNewCourseModalOpen(true)}
            />
          </div>
        )}

        {/* Tab: Planes Curriculares y Materias */}
        {activeTab === 'planes' && (
          <div className="animate-in fade-in duration-200" id="viewPlanes">
            <SubjectPlanPanel
              courses={courses}
              subjects={subjects}
              selectedCourseId={selectedCourseId}
              onCourseChange={setSelectedCourseId}
              onToggleDictado={handleToggleSubjectDictado}
              onReassignTeacher={setReassigningSubject}
              onAddNewSubject={() => setIsNewSubjectModalOpen(true)}
            />
          </div>
        )}

        {/* Modals */}
        <ViewDivisionModal
          isOpen={Boolean(viewingCourse)}
          course={viewingCourse}
          onClose={() => setViewingCourse(null)}
          onEdit={(c) => setEditingCourse(c)}
        />

        <NewCourseModal
          isOpen={isNewCourseModalOpen}
          onClose={() => setIsNewCourseModalOpen(false)}
          onSave={handleCreateCourse}
          teachers={teachers}
        />

        <EditCourseModal
          isOpen={Boolean(editingCourse)}
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={handleSaveEditCourse}
          teachers={teachers}
        />

        <NewSubjectModal
          isOpen={isNewSubjectModalOpen}
          onClose={() => setIsNewSubjectModalOpen(false)}
          onSave={handleCreateSubject}
          courses={courses}
          teachers={teachers}
          defaultCourseId={selectedCourseId}
        />

        <ReassignTeacherModal
          isOpen={Boolean(reassigningSubject)}
          subject={reassigningSubject}
          onClose={() => setReassigningSubject(null)}
          onSave={handleSaveReassignedTeacher}
          teachers={teachers}
        />
      </div>
    </AdminLayout>
  );
};

export default AcademicOfferManagement;
