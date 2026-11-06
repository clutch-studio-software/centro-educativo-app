import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import TeacherWeeklyScheduleGrid from '../teachers/TeacherWeeklyScheduleGrid';
import { findCurrentTeacher, ensureCompleteGrilla } from '../teachers/teacherScheduleUtils';

const EMPTY_TEACHERS = [];

const DashboardDocenteView = ({ user, teachers = EMPTY_TEACHERS, isLoading = false }) => {
  const currentTeacher = useMemo(() => {
    return findCurrentTeacher(user, teachers);
  }, [user, teachers]);

  const teacherGrilla = useMemo(() => {
    return ensureCompleteGrilla(currentTeacher?.grillaHoraria);
  }, [currentTeacher]);

  const catedras = Array.isArray(currentTeacher?.catedras) ? currentTeacher.catedras : [];
  const displayName =
    currentTeacher?.nombreCompleto ||
    `${currentTeacher?.nombre || ''} ${currentTeacher?.apellido || ''}`.trim() ||
    user?.displayName ||
    'Docente';

  return (
    <div data-testid="dashboard-docente-view" className="flex flex-col gap-6">
      {/* Banner del Docente */}
      <section
        data-testid="docente-dashboard-banner"
        className="bg-gradient-to-r from-amber-500 via-orange-600 to-indigo-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col text-start gap-1 max-w-xl">
          <span className="text-xs font-bold text-amber-200 uppercase tracking-widest flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-amber-300">school</span>
            Portal Académico · Cuerpo Docente
          </span>
          <p className="text-2xl font-black tracking-tight text-white">
            ¡Hola, {displayName}!
          </p>
          <p className="text-xs text-amber-100 leading-relaxed">
            Legajo <strong>{currentTeacher?.legajo || '#DOC-2027'}</strong> · {currentTeacher?.especialidad || 'Profesor'} · {currentTeacher?.cargaHoras || 0} hs/sem asignadas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            to="/admin/asistencias"
            data-testid="btn-docente-tomar-asistencia"
            className="px-4 py-2.5 bg-amber-300 text-slate-900 hover:bg-amber-200 text-xs font-extrabold rounded-md shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span>
            <span>Tomar Asistencia</span>
          </Link>
          <Link
            to="/admin/alumnos"
            data-testid="btn-docente-ver-alumnos"
            className="px-4 py-2.5 bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Ver Mis Alumnos</span>
          </Link>
        </div>
      </section>

      {/* Tarjetas de Cátedras Asignadas */}
      <section
        data-testid="docente-catedras-summary"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-indigo-600">menu_book</span>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Cátedras y Cursos a Cargo ({catedras.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {currentTeacher?.cargaHoras || 0} hs semanales acumuladas
          </span>
        </div>

        {catedras.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Aún no tenés cátedras asignadas en el ciclo lectivo vigente.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {catedras.map((cat) => (
              <div
                key={cat.id || `${cat.nombre}-${cat.curso}`}
                data-testid={`docente-catedra-card-${cat.id}`}
                className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-md flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {cat.curso}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700">
                    {cat.horasSemanales || 4} hs/sem
                  </span>
                </div>
                <span className="font-bold text-md text-slate-900 truncate pb-5" title={cat.nombre}>
                  {cat.nombre}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Grilla Horaria Semanal del Docente */}
      <section
        data-testid="docente-weekly-schedule-section"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <TeacherWeeklyScheduleGrid
          grilla={teacherGrilla}
          readOnly={true}
          allTeachers={teachers}
          currentTeacherId={currentTeacher?.id}
          catedrasList={catedras}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
};

export default DashboardDocenteView;
