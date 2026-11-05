import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import { usePermissions } from '../../hooks/usePermissions';
import { fetchAdminDashboardData } from '../../services/adminService';
import { fetchTeachersApi } from '../../services/teachersService';
import { fetchAcademicCourses, fetchAcademicSubjects } from '../../services/academicService';
import { fetchSportsActivities } from '../../services/sportsService';
import { INITIAL_COURSES, INITIAL_SUBJECTS } from '../../data/mockAcademicOffer';
import ReportToolbar from '../../components/admin/reports/ReportToolbar';
import ReportSkeleton from '../../components/admin/reports/ReportSkeleton';
import ReportePorAlumnoView from '../../components/admin/reports/ReportePorAlumnoView';
import ReportePorDocenteView from '../../components/admin/reports/ReportePorDocenteView';
import ReporteAlumnosPorCursoView from '../../components/admin/reports/ReporteAlumnosPorCursoView';
import ReporteDocentesPorMateriaView from '../../components/admin/reports/ReporteDocentesPorMateriaView';
import ReporteCursosPorNivelView from '../../components/admin/reports/ReporteCursosPorNivelView';

const AdminReports = () => {
  const { isDirectivo, isAdministrativo, canViewReports } = usePermissions();

  const [activeReportId, setActiveReportId] = useState('reporte-alumno');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [allSports, setAllSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashData, teachersData, firestoreCourses, firestoreSubjects, sportsData] =
        await Promise.all([
          fetchAdminDashboardData().catch(() => null),
          fetchTeachersApi().catch(() => []),
          fetchAcademicCourses().catch(() => INITIAL_COURSES),
          fetchAcademicSubjects().catch(() => INITIAL_SUBJECTS),
          fetchSportsActivities().catch(() => []),
        ]);

      setStudents(dashData?.students || []);
      setTeachers(teachersData || []);
      setCourses(firestoreCourses?.length ? firestoreCourses : INITIAL_COURSES);
      setSubjects(firestoreSubjects?.length ? firestoreSubjects : INITIAL_SUBJECTS);
      setAllSports(sportsData || []);
    } catch (err) {
      console.error('Error al cargar datos para reportes:', err);
      setNotification({
        type: 'error',
        message: 'No se pudieron sincronizar todos los datos para la central de reportes.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const hasAccess = canViewReports || isDirectivo || isAdministrativo;

  return (
    <AdminLayout activeItem="reportes" breadcrumbs={['Reportes Directivos']}>
      <div data-testid="admin-reports-page" className="flex flex-col w-full gap-6">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Encabezado Oficial Visible Exclusivamente en Impresión / PDF */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-4 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-black text-slate-900 tracking-tight">
                CENTRO EDUCATIVO INTEGRAL
              </p>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Dirección General y Secretaría Académica
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-500">
              <p>Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</p>
              <p>Documento Oficial Administrativo</p>
            </div>
          </div>
        </div>

        {/* Barra de Herramientas y Navegación entre Reportes */}
        <ReportToolbar
          activeReportId={activeReportId}
          onSelectReport={setActiveReportId}
        />

        {!hasAccess ? (
          <div
            data-testid="reports-unauthorized-banner"
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center text-amber-800"
          >
            <span className="material-symbols-outlined text-4xl text-amber-500">lock</span>
            <p className="font-extrabold text-sm mt-2">Acceso Restringido a Reportes Directivos</p>
            <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
              Su rol actual no posee permisos suficientes para visualizar o exportar reportes directivos. Comuníquese con la Dirección General.
            </p>
          </div>
        ) : isLoading ? (
          <ReportSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {activeReportId === 'reporte-alumno' && (
              <ReportePorAlumnoView
                students={students}
                courses={courses}
                subjects={subjects}
                allSports={allSports}
              />
            )}

            {activeReportId === 'reporte-docente' && (
              <ReportePorDocenteView
                teachers={teachers}
              />
            )}

            {activeReportId === 'alumnos-por-curso' && (
              <ReporteAlumnosPorCursoView
                students={students}
              />
            )}

            {activeReportId === 'docentes-por-materia' && (
              <ReporteDocentesPorMateriaView
                courses={courses}
                subjects={subjects}
                teachers={teachers}
              />
            )}

            {activeReportId === 'cursos-por-nivel' && (
              <ReporteCursosPorNivelView
                courses={courses}
                students={students}
              />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
