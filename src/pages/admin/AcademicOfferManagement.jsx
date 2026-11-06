import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import DivisionTable from '../../components/admin/academic/DivisionTable';
import SubjectPlanPanel from '../../components/admin/academic/SubjectPlanPanel';
import AcademicModals from '../../components/admin/academic/AcademicModals';
import AcademicOfferHeaderSection from '../../components/admin/academic/AcademicOfferHeaderSection';
import { ACADEMIC_LEVELS } from '../../data/mockAcademicOffer';
import { getEnrolledStudentsForCourse } from '../../utils/academicUtils';
import { useAcademicOfferData } from '../../hooks/useAcademicOfferData';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { useTeacherCourseScope } from '../../hooks/useTeacherCourseScope';

const AcademicOfferManagement = () => {
  const { user } = useAuth();
  const { canManageAcademicOffer, canManageSubjects, isDocente } = usePermissions();

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

  // Alcance filtrado según rol docente
  const {
    currentTeacher,
    visibleCourses,
    displayedCoursesByLevel,
    effectiveActiveTab,
    effectiveSelectedCourseId,
    visibleSubjectsCount,
  } = useTeacherCourseScope({
    courses,
    subjects,
    teachers,
    user,
    isDocente,
    coursesByLevel,
    activeTab,
    selectedCourseId,
  });

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
    return ACADEMIC_LEVELS.find((l) => l.id === effectiveActiveTab) || ACADEMIC_LEVELS[1];
  }, [effectiveActiveTab]);

  const teacherDisplayName =
    currentTeacher?.nombreCompleto || currentTeacher?.nombre || user?.nombre || 'Docente';

  return (
    <AdminLayout activeItem="oferta-academica" breadcrumbs={['Oferta Académica']}>
      <div className="flex flex-col w-full gap-6">
        {/* Floating Toast Notification */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Top Title, CTAs, Notice and Tabs Hub */}
        <AcademicOfferHeaderSection
          canManageSubjects={canManageSubjects}
          canManageAcademicOffer={canManageAcademicOffer}
          onOpenNewSubjectModal={() => setIsNewSubjectModalOpen(true)}
          onOpenNewCourseModal={() => setIsNewCourseModalOpen(true)}
          isDocente={isDocente}
          currentTeacherName={teacherDisplayName}
          levels={ACADEMIC_LEVELS}
          coursesByLevel={displayedCoursesByLevel}
          activeTab={effectiveActiveTab}
          onSelectTab={setActiveTab}
          subjectsCount={visibleSubjectsCount}
        />

        {/* Tab Content: Level Divisions Table */}
        {effectiveActiveTab !== 'planes' && (
          <div className="animate-in fade-in duration-200" id={`viewLevel-${effectiveActiveTab}`}>
            <DivisionTable
              level={activeLevelConfig}
              courses={displayedCoursesByLevel[effectiveActiveTab] || []}
              students={students}
              onToggleStatus={handleToggleCourseStatus}
              onEditCourse={handleManageCourse}
              onViewCourse={handleViewCourse}
              onDeleteCourse={handleDeleteCourseAndSyncView}
              onAddNewDivision={() => setIsNewCourseModalOpen(true)}
              canManageAcademic={canManageAcademicOffer}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Tab: Planes Curriculares y Materias */}
        {!isLoading && effectiveActiveTab === 'planes' && (
          <div className="animate-in fade-in duration-200" id="viewPlanes">
            <SubjectPlanPanel
              courses={visibleCourses}
              subjects={subjects}
              selectedCourseId={effectiveSelectedCourseId}
              onCourseChange={setSelectedCourseId}
              onToggleDictado={handleToggleSubjectDictado}
              onReassignTeacher={setReassigningSubject}
              onAddNewSubject={() => setIsNewSubjectModalOpen(true)}
              canManageSubjects={canManageSubjects}
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
          courses={visibleCourses}
          teachers={teachers}
          selectedCourseId={effectiveSelectedCourseId}
          reassigningSubject={reassigningSubject}
          onCloseReassignTeacher={() => setReassigningSubject(null)}
          onSaveReassignTeacher={handleSaveReassignedTeacher}
          defaultNivelId={effectiveActiveTab !== 'planes' ? effectiveActiveTab : 'inicial'}
          canManageAcademic={canManageAcademicOffer}
        />
      </div>
    </AdminLayout>
  );
};

export default AcademicOfferManagement;
