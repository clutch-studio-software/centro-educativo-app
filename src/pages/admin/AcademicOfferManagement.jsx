import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import DivisionTable from '../../components/admin/academic/DivisionTable';
import SubjectPlanPanel from '../../components/admin/academic/SubjectPlanPanel';
import AcademicTabsNav from '../../components/admin/academic/AcademicTabsNav';
import AcademicModals from '../../components/admin/academic/AcademicModals';
import { ACADEMIC_LEVELS } from '../../data/mockAcademicOffer';
import { getEnrolledStudentsForCourse } from '../../utils/academicUtils';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';
import { useAcademicOfferData } from '../../hooks/useAcademicOfferData';

const AcademicOfferManagement = () => {
  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Hook centralizado con persistencia y sincronización a Firestore
  const {
    courses,
    subjects,
    teachers,
    students,
    isLoading,
    selectedCourseId,
    setSelectedCourseId,
    coursesByLevel,
    handleToggleCourseStatus,
    handleCreateCourse,
    handleSaveEditCourse,
    handleDeleteCourse,
    handleCreateSubject,
    handleToggleSubjectDictado,
    handleSaveReassignedTeacher,
  } = useAcademicOfferData(showToast);

  // Tab State: 'inicial' | 'primario' | 'secundario' | 'planes'
  const [activeTab, setActiveTab] = useState('primario');

  // Modals State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [viewingEnrolledStudents, setViewingEnrolledStudents] = useState([]);
  const [reassigningSubject, setReassigningSubject] = useState(null);

  /**
   * Abre el modal de detalles con la nómina de alumnos inscriptos
   */
  const handleViewCourse = (course, enrolledList) => {
    const list = enrolledList || getEnrolledStudentsForCourse(students, course);
    setViewingCourse(course);
    setViewingEnrolledStudents(list);
  };

  const handleManageCourse = (course) => {
    const currentEnrolled = getEnrolledStudentsForCourse(students, course).length;
    setEditingCourse({
      ...course,
      cupoOcupado: currentEnrolled,
    });
  };

  const handleEditCourseAndSyncView = useCallback(
    async (courseId, updatedCourseData) => {
      await handleSaveEditCourse(courseId, updatedCourseData);
      if (viewingCourse && viewingCourse.id === courseId) {
        const updatedCourse = { ...viewingCourse, ...updatedCourseData };
        setViewingCourse(updatedCourse);
        setViewingEnrolledStudents(getEnrolledStudentsForCourse(students, updatedCourse));
      }
    },
    [handleSaveEditCourse, viewingCourse, students]
  );

  const handleDeleteCourseAndSyncView = useCallback(
    async (course) => {
      if (viewingCourse && viewingCourse.id === course.id) {
        setViewingCourse(null);
        setViewingEnrolledStudents([]);
      }
      await handleDeleteCourse(course);
    },
    [handleDeleteCourse, viewingCourse]
  );

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
              subtitle="Administración centralizada de divisiones, turnos, matrícula de alumnos y oferta pedagógica."
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
                Nueva Materia
              </button>
              <button
                type="button"
                data-testid="btn-create-course"
                onClick={() => setIsNewCourseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Crear División / Curso
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar: 3 Pestañas por Nivel + Planes de Estudio */}
          <AcademicTabsNav
            levels={ACADEMIC_LEVELS}
            coursesByLevel={coursesByLevel}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            subjectsCount={subjects.length}
          />
        </section>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-500 shadow-2xs">
            <span className="material-symbols-outlined text-3xl text-blue-600 animate-spin">
              progress_activity
            </span>
            <span className="text-xs font-bold text-slate-600">
              Sincronizando divisiones y matrícula en tiempo real con Firebase Store...
            </span>
          </div>
        )}

        {/* Tab Content: Level Divisions Table */}
        {!isLoading && activeTab !== 'planes' && (
          <div className="animate-in fade-in duration-200" id={`viewLevel-${activeTab}`}>
            <DivisionTable
              level={activeLevelConfig}
              courses={coursesByLevel[activeTab] || []}
              students={students}
              onToggleStatus={handleToggleCourseStatus}
              onEditCourse={handleManageCourse}
              onViewCourse={handleViewCourse}
              onDeleteCourse={handleDeleteCourseAndSyncView}
              onAddNewDivision={() => setIsNewCourseModalOpen(true)}
            />
          </div>
        )}

        {/* Tab: Planes Curriculares y Materias */}
        {!isLoading && activeTab === 'planes' && (
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

        {/* Modals Container */}
        <AcademicModals
          viewingCourse={viewingCourse}
          viewingEnrolledStudents={viewingEnrolledStudents}
          onCloseViewCourse={() => {
            setViewingCourse(null);
            setViewingEnrolledStudents([]);
          }}
          onEditFromView={(c) => handleManageCourse(c)}
          isNewCourseModalOpen={isNewCourseModalOpen}
          onCloseNewCourse={() => setIsNewCourseModalOpen(false)}
          onSaveNewCourse={handleCreateCourse}
          editingCourse={editingCourse}
          onCloseEditCourse={() => setEditingCourse(null)}
          onSaveEditCourse={handleEditCourseAndSyncView}
          isNewSubjectModalOpen={isNewSubjectModalOpen}
          onCloseNewSubject={() => setIsNewSubjectModalOpen(false)}
          onSaveNewSubject={handleCreateSubject}
          courses={courses}
          teachers={teachers}
          selectedCourseId={selectedCourseId}
          reassigningSubject={reassigningSubject}
          onCloseReassignTeacher={() => setReassigningSubject(null)}
          onSaveReassignTeacher={handleSaveReassignedTeacher}
          defaultNivelId={activeTab !== 'planes' ? activeTab : 'inicial'}
        />
      </div>
    </AdminLayout>
  );
};

export default AcademicOfferManagement;
