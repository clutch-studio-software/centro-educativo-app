import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import DivisionTable from '../../components/admin/academic/DivisionTable';
import SubjectPlanPanel from '../../components/admin/academic/SubjectPlanPanel';
import AcademicTabsNav from '../../components/admin/academic/AcademicTabsNav';
import AcademicModals from '../../components/admin/academic/AcademicModals';
import {
  ACADEMIC_LEVELS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
} from '../../data/mockAcademicOffer';
import { MOCK_TEACHERS } from '../../data/mockTeachers';
import { MOCK_STUDENTS } from '../../data/mockStudents';
import {
  getEnrolledStudentsForCourse,
  matchesStudentToDivision,
} from '../../utils/academicUtils';
import { fetchAdminDashboardData } from '../../services/adminService';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';

const AcademicOfferManagement = () => {
  // State for Academic Offer Data
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers] = useState(MOCK_TEACHERS);
  const [students, setStudents] = useState(MOCK_STUDENTS);

  // Tab State: 'inicial' | 'primario' | 'secundario' | 'planes'
  const [activeTab, setActiveTab] = useState('primario');

  // Selected Course for Subjects Plan View
  const [selectedCourseId, setSelectedCourseId] = useState('curso-ns-1');

  // Modals State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [viewingEnrolledStudents, setViewingEnrolledStudents] = useState([]);
  const [reassigningSubject, setReassigningSubject] = useState(null);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  }, []);

  // Sync with Firestore students if available
  useEffect(() => {
    let isMounted = true;
    fetchAdminDashboardData()
      .then((data) => {
        if (isMounted && data?.students && data.students.length > 0) {
          setStudents(data.students);
        }
      })
      .catch(() => {
        // Keeps fallback MOCK_STUDENTS
      });
    return () => {
      isMounted = false;
    };
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
    showToast(
      `¡División "${newCourse.nombre} (${newCourse.division || 'A'})" creada con éxito!`,
      'success'
    );
  };

  const handleSaveEditCourse = (courseId, updatedCourse) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? updatedCourse : c)));
    showToast(
      `División "${updatedCourse.nombre} (${updatedCourse.division || 'A'})" actualizada.`,
      'success'
    );
    setEditingCourse(null);
  };

  /**
   * Elimina una división y reasigna a sus alumnos al estado "sin asignar"
   */
  const handleDeleteCourse = (course) => {
    const affectedStudents = getEnrolledStudentsForCourse(students, course);

    // Reasignar alumnos que pertenecían a esta división a "sin asignar"
    setStudents((prev) =>
      prev.map((s) => {
        if (matchesStudentToDivision(s, course)) {
          return {
            ...s,
            curso: 'sin asignar',
            division: 'sin asignar',
            cursoDisplay: 'Sin asignar',
            cursoId: null,
          };
        }
        return s;
      })
    );

    // Quitar la división de la oferta
    setCourses((prev) => prev.filter((c) => c.id !== course.id));

    if (viewingCourse && viewingCourse.id === course.id) {
      setViewingCourse(null);
      setViewingEnrolledStudents([]);
    }

    showToast(
      affectedStudents.length > 0
        ? `División "${course.nombre} (${course.division || 'A'})" eliminada. ${affectedStudents.length} alumno(s) quedaron con curso sin asignar.`
        : `División "${course.nombre} (${course.division || 'A'})" eliminada de la oferta académica.`,
      'info'
    );
  };

  /**
   * Abre el modal de detalles con la nómina de alumnos inscriptos
   */
  const handleViewCourse = (course, enrolledList) => {
    const list = enrolledList || getEnrolledStudentsForCourse(students, course);
    setViewingCourse(course);
    setViewingEnrolledStudents(list);
  };

  const handleManageCourse = (course) => {
    // Calculamos el cupo ocupado dinámicamente según alumnos reales
    const currentEnrolled = getEnrolledStudentsForCourse(students, course).length;
    setEditingCourse({
      ...course,
      cupoOcupado: currentEnrolled,
    });
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

        {/* Tab Content: Level Divisions Table */}
        {activeTab !== 'planes' && (
          <div className="animate-in fade-in duration-200" id={`viewLevel-${activeTab}`}>
            <DivisionTable
              level={activeLevelConfig}
              courses={coursesByLevel[activeTab] || []}
              students={students}
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
          onSaveEditCourse={handleSaveEditCourse}
          isNewSubjectModalOpen={isNewSubjectModalOpen}
          onCloseNewSubject={() => setIsNewSubjectModalOpen(false)}
          onSaveNewSubject={handleCreateSubject}
          courses={courses}
          teachers={teachers}
          selectedCourseId={selectedCourseId}
          reassigningSubject={reassigningSubject}
          onCloseReassignTeacher={() => setReassigningSubject(null)}
          onSaveReassignTeacher={handleSaveReassignedTeacher}
        />
      </div>
    </AdminLayout>
  );
};

export default AcademicOfferManagement;
