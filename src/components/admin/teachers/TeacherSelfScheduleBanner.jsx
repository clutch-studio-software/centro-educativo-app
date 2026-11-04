import React, { useMemo } from 'react';

const LEVEL_STYLES = {
  Inicial: 'bg-amber-50 text-amber-800 border-amber-200',
  Primario: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Secundario: 'bg-indigo-50 text-indigo-800 border-indigo-200',
};

const inferNivelFromCatedra = (cat) => {
  if (cat?.nivel && ['Inicial', 'Primario', 'Secundario'].includes(cat.nivel)) {
    return cat.nivel;
  }
  const cursoLower = String(cat?.curso || '').toLowerCase();
  if (cursoLower.includes('sala') || cursoLower.includes('inicial')) {
    return 'Inicial';
  }
  if (cursoLower.includes('grado') || cursoLower.includes('primari')) {
    return 'Primario';
  }
  return 'Secundario';
};

const EMPTY_TEACHERS = [];

const TeacherSelfScheduleBanner = ({ user, teachers = EMPTY_TEACHERS, onOpenSchedule }) => {
  const matchedTeacher = useMemo(() => {
    if (!Array.isArray(teachers) || teachers.length === 0) return null;
    const userEmail = String(user?.email || '').trim().toLowerCase();
    const userId = String(user?.uid || user?.id || '').trim();

    const byMatch = teachers.find(
      (t) =>
        (userId && t.id === userId) ||
        (userEmail && String(t.email || '').trim().toLowerCase() === userEmail)
    );
    if (byMatch) return byMatch;

    return teachers.find((t) => Array.isArray(t.catedras) && t.catedras.length > 0) || teachers[0];
  }, [user, teachers]);

  const groupedByLevel = useMemo(() => {
    const groups = { Inicial: [], Primario: [], Secundario: [] };
    const catedras = Array.isArray(matchedTeacher?.catedras) ? matchedTeacher.catedras : [];
    for (const cat of catedras) {
      const nivel = inferNivelFromCatedra(cat);
      groups[nivel].push(cat);
    }
    return groups;
  }, [matchedTeacher]);

  if (!matchedTeacher) return null;

  const displayName =
    matchedTeacher.nombreCompleto ||
    `${matchedTeacher.nombre || ''} ${matchedTeacher.apellido || ''}`.trim();
  const catedrasCount = matchedTeacher.catedras?.length || 0;
  const cargaHoras = matchedTeacher.cargaHoras || 0;

  return (
    <section
      data-testid="teacher-self-schedule-banner"
      className="bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-emerald-50/60 rounded-2xl border border-indigo-100 p-5 shadow-2xs flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Mis Cursos a Cargo y Horarios Disponibles
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{displayName}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
              <span className="font-mono font-bold text-blue-700">{matchedTeacher.legajo}</span>
              <span>•</span>
              <span className="font-semibold">{catedrasCount} materia(s) / curso(s)</span>
              <span>•</span>
              <span className="font-bold text-emerald-700">{cargaHoras} hs/sem asignadas</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenSchedule?.(matchedTeacher)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          <span>Ver Mi Grilla Horaria Completa</span>
        </button>
      </div>

      {catedrasCount === 0 ? (
        <p className="text-xs text-slate-500 bg-white/80 rounded-xl px-4 py-3 border border-slate-200/60">
          Aún no tenés cátedras vinculadas en el ciclo lectivo actual.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Inicial', 'Primario', 'Secundario'].map((nivel) => {
            const list = groupedByLevel[nivel] || [];
            if (list.length === 0) return null;
            const badgeClass = LEVEL_STYLES[nivel];
            return (
              <div
                key={nivel}
                className="bg-white/90 rounded-md p-3.5 border border-slate-200/70 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                    Nivel {nivel}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {list.length} cátedra(s)
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {list.map((cat) => (
                    <div
                      key={cat.id || `${cat.nombre}-${cat.curso}`}
                      className="text-xs flex flex-col bg-slate-50/80 rounded-md px-2.5 py-1.5 border border-slate-100"
                    >
                      <span className="font-bold text-slate-800">
                        {cat.nombre} — <span className="text-indigo-700">{cat.curso}</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {cat.horario || 'Horario a confirmar'} ({cat.horasSemanales || 4} hs/sem)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TeacherSelfScheduleBanner;
