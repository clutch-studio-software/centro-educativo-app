import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import LevelSection from '../../components/admin/academic/LevelSection';
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

const AcademicOfferManagement = () => {
  // State for Academic Offer Data
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers] = useState(MOCK_TEACHERS);

  // Tab State ('niveles' | 'planes' | 'all')
  const [activeTab, setActiveTab] = useState('niveles');

  // Selected Course for Subjects Plan View
  const [selectedCourseId, setSelectedCourseId] = useState('curso-ns-1');

  // Modals State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
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
      `El curso "${course.nombre}" ha sido ${updatedStatus ? 'activado' : 'pausado'}.`,
      updatedStatus ? 'success' : 'info'
    );
  };

  const handleCreateCourse = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
    showToast(`¡Curso "${newCourse.nombre}" creado exitosamente!`, 'success');
  };

  const handleSaveEditCourse = (courseId, updatedCourse) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updatedCourse : c)));
    showToast(`Curso "${updatedCourse.nombre}" actualizado correctamente.`, 'success');
    setEditingCourse(null);
  };

  // Handlers for Subject actions
  const handleCreateSubject = (newSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    // Update course subjects count
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

  // Navigating to subjects from course card
  const handleViewSubjects = (course) => {
    setSelectedCourseId(course.id);
    setActiveTab('planes');
    showToast(`Visualizando materias de: ${course.nombre}`, 'info');
  };

  const handleManageCourse = (course) => {
    setEditingCourse(course);
  };

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    return {
      inicial: courses.filter((c) => c.nivelId === 'inicial'),
      primario: courses.filter((c) => c.nivelId === 'primario'),
      secundario: courses.filter((c) => c.nivelId === 'secundario'),
    };
  }, [courses]);

  return (
    <AdminLayout activeItem="oferta-academica" breadcrumbs={['Oferta Académica']}>
      <div className="flex flex-col w-full gap-6">
        {/* Floating Toast Notification */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Top Title & Action Hub */}
        <section className="mb-2" data-purpose="section-header">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-600 border border-amber-200/50 mb-2">
                Área Académica
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Gestión de la Oferta Académica
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Administración de niveles pedagógicos, divisiones de cursos y asignación de materias curriculares.
              </p>
            </div>

            {/* Section Primary CTA Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                data-testid="btn-new-subject"
                onClick={() => setIsNewSubjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                + Nueva Materia
              </button>
              <button
                type="button"
                data-testid="btn-create-course"
                onClick={() => setIsNewCourseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                + Crear Curso
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="mt-6 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex space-x-6 text-sm font-semibold" data-purpose="tab-navigation">
              <button
                type="button"
                id="tabBtnNiveles"
                data-testid="tab-niveles-cursos"
                onClick={() => setActiveTab('niveles')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer ${
                  activeTab === 'niveles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                Niveles y Cursos
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-bold border border-blue-100">
                  3 Niveles Activos
                </span>
              </button>

              <button
                type="button"
                id="tabBtnPlanes"
                data-testid="tab-planes-materias"
                onClick={() => setActiveTab('planes')}
                className={`pb-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer ${
                  activeTab === 'planes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                Planes de Materias y Asignaciones
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 font-semibold">
                  Configuración Curricular
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab 1: Niveles y Cursos */}
        {activeTab === 'niveles' && (
          <div className="space-y-8 animate-in fade-in duration-200" id="viewNiveles">
            {ACADEMIC_LEVELS.map((level) => (
              <LevelSection
                key={level.id}
                level={level}
                courses={coursesByLevel[level.id] || []}
                onToggleStatus={handleToggleCourseStatus}
                onEditCourse={handleManageCourse}
                onManageCourse={handleManageCourse}
                onViewSubjects={handleViewSubjects}
              />
            ))}
          </div>
        )}

        {/* Tab 2: Planes de Materias y Asignaciones */}
        {activeTab === 'planes' && (
          <div className="animate-in fade-in duration-200">
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
