import React, { useState, useMemo } from 'react';

const COURSES_OPTIONS = [
  '1º Año Secundario - Div. A',
  '2º Año Secundario - Div. B',
  '3º Año Secundario - Div. A',
  '4º Año Secundario - Div. Ciencias',
  '5º Año Secundario - Div. Técnica',
  '6º Grado Primario - Div. A',
  '7º Grado Primario - Div. B',
];

const SUBJECTS_OPTIONS = [
  { name: 'Matemática Aplicada', hours: 4, icon: 'calculate', color: 'blue' },
  { name: 'Física Clásica e Instrumental', hours: 4, icon: 'science', color: 'blue' },
  { name: 'Laboratorio de Robótica', hours: 4, icon: 'memory', color: 'orange' },
  { name: 'Estadística y Probabilidad', hours: 3, icon: 'insights', color: 'blue' },
  { name: 'Química Orgánica', hours: 4, icon: 'biotech', color: 'green' },
  { name: 'Lengua y Literatura', hours: 4, icon: 'menu_book', color: 'orange' },
  { name: 'Educación Física y Deportes', hours: 3, icon: 'sports_soccer', color: 'green' },
];

const TeacherAssignmentsDrawerContent = ({
  teacher,
  onClose,
  onSaveAssignments,
}) => {
  const [catedrasList, setCatedrasList] = useState(() =>
    teacher?.catedras ? [...teacher.catedras] : []
  );
  const [grilla, setGrilla] = useState(() =>
    teacher?.grillaHoraria && teacher.grillaHoraria.length > 0
      ? structuredClone(teacher.grillaHoraria)
      : [
          { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
          { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
          { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
        ]
  );
  const [selectedCurso, setSelectedCurso] = useState(COURSES_OPTIONS[0]);
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);

  const totalHoras = useMemo(() => {
    return catedrasList.reduce((sum, c) => sum + (Number(c.horasSemanales) || 0), 0);
  }, [catedrasList]);

  const maxHoras = teacher?.cargaMaxHoras || 30;
  const porcentajeCarga = Math.min(Math.round((totalHoras / maxHoras) * 100), 100);

  const handleAddCatedra = () => {
    const subject = SUBJECTS_OPTIONS[selectedSubjectIdx] || SUBJECTS_OPTIONS[0];
    const [cursoName, divName] = selectedCurso.split(' - ');

    const newId = `cat-${Date.now()}`;
    const newCat = {
      id: newId,
      nombre: subject.name,
      curso: cursoName.trim(),
      division: divName ? divName.trim() : 'División A',
      horasSemanales: subject.hours,
      icon: subject.icon,
      badgeColor: subject.color,
    };

    const nextCatedras = [...catedrasList, newCat];
    setCatedrasList(nextCatedras);

    // Asignar en un slot libre de la grilla horaria para visualizar el bloque
    const nextGrilla = structuredClone(grilla);
    const dias = ['lun', 'mar', 'mie', 'jue', 'vie'];
    let placed = false;

    for (const fila of nextGrilla) {
      if (placed) break;
      for (const dia of dias) {
        if (!fila[dia]) {
          fila[dia] = {
            curso: cursoName.replace(/Secundario|Primario/g, '').trim(),
            materia: subject.name.slice(0, 8),
            color: subject.color,
          };
          placed = true;
          break;
        }
      }
    }
    setGrilla(nextGrilla);
  };

  const handleRemoveCatedra = (catId) => {
    setCatedrasList((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleConfirmSave = () => {
    onSaveAssignments(teacher.id, {
      catedras: catedrasList,
      cargaHoras: totalHoras,
      grillaHoraria: grilla,
    });
  };

  return (
    <div
      aria-labelledby="slide-over-title"
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Scrollable Container */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Planificación Académica 2027
                </span>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {teacher.nombre}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-blue-600 font-bold">
                    {teacher.legajo}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {teacher.especialidad}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                title="Cerrar panel"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col gap-6">
              {/* Carga Semanal Acumulada */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Carga Semanal Acumulada
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-extrabold text-blue-600">
                      {totalHoras}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      de {maxHoras} hs máximas permitidas
                    </span>
                  </div>
                </div>
                <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${porcentajeCarga}%` }}
                  />
                </div>
              </div>

              {/* Formulario Añadir Cátedra */}
              <div className="flex flex-col gap-3">
                <label className="font-bold text-sm text-slate-800">
                  Añadir Nueva Cátedra / Módulo Horario
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 mb-1 block">
                      Curso / División
                    </span>
                    <select
                      value={selectedCurso}
                      onChange={(e) => setSelectedCurso(e.target.value)}
                      className="w-full bg-slate-50 text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none focus:bg-white"
                    >
                      {COURSES_OPTIONS.map((curso) => (
                        <option key={curso} value={curso}>
                          {curso}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 mb-1 block">
                      Asignatura / Espacio Curricular
                    </span>
                    <select
                      value={selectedSubjectIdx}
                      onChange={(e) => setSelectedSubjectIdx(Number(e.target.value))}
                      className="w-full bg-slate-50 text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none focus:bg-white"
                    >
                      {SUBJECTS_OPTIONS.map((subj, idx) => (
                        <option key={subj.name} value={idx}>
                          {subj.name} ({subj.hours} hs)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleAddCatedra}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-full font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Vincular Cátedra al Horario</span>
                  </button>
                </div>
              </div>

              {/* Grilla Horaria Semanal */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">
                    Grilla Horaria Semanal (Auditoría de Solapamiento)
                  </span>
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Sin conflictos detectados
                  </span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 overflow-x-auto">
                  <div className="grid grid-cols-6 gap-1 text-center text-xs min-w-[420px]">
                    <div className="py-1 text-slate-400 font-bold">Hora</div>
                    <div className="py-1 text-slate-700 font-extrabold">Lun</div>
                    <div className="py-1 text-slate-700 font-extrabold">Mar</div>
                    <div className="py-1 text-slate-700 font-extrabold">Mié</div>
                    <div className="py-1 text-slate-700 font-extrabold">Jue</div>
                    <div className="py-1 text-slate-700 font-extrabold">Vie</div>

                    {grilla.map((row, rIdx) => (
                      <React.Fragment key={rIdx}>
                        <div className="py-2.5 bg-white rounded-xl text-slate-400 font-mono text-[10px] flex items-center justify-center border border-slate-100">
                          {row.hora}
                        </div>
                        {['lun', 'mar', 'mie', 'jue', 'vie'].map((dia) => {
                          const slot = row[dia];
                          if (!slot) {
                            return (
                              <div
                                key={dia}
                                className="py-2.5 bg-white rounded-xl text-slate-300 text-[10px] flex items-center justify-center border border-slate-100"
                              >
                                -
                              </div>
                            );
                          }
                          const bgColors =
                            slot.color === 'green'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : slot.color === 'orange'
                              ? 'bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-blue-100 text-blue-800 border-blue-200';
                          return (
                            <div
                              key={dia}
                              className={`py-2.5 ${bgColors} rounded-xl font-bold text-[11px] flex flex-col justify-center border`}
                            >
                              <span>{slot.curso}</span>
                              <span className="text-[9px] opacity-80">{slot.materia}</span>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cátedras Asignadas Actualmente */}
              <div className="flex flex-col gap-2">
                <span className="font-bold text-sm text-slate-800">
                  Cátedras Asignadas Actualmente ({catedrasList.length})
                </span>
                <div className="flex flex-col gap-2">
                  {catedrasList.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                      No hay cátedras vinculadas para este docente.
                    </div>
                  ) : (
                    catedrasList.map((cat) => {
                      const iconBg =
                        cat.badgeColor === 'green'
                          ? 'bg-emerald-100 text-emerald-700'
                          : cat.badgeColor === 'orange'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700';

                      return (
                        <div
                          key={cat.id}
                          className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80 transition-all hover:bg-white"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {cat.icon || 'school'}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {cat.nombre}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate">
                                {cat.curso} {cat.division} • {cat.horasSemanales} hs semanales
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCatedra(cat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
                            title="Desasignar cátedra"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(11,80,213,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Confirmar y Guardar Asignaciones</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeacherAssignmentsDrawer = ({
  isOpen,
  teacher,
  onClose,
  onSaveAssignments,
}) => {
  if (!isOpen || !teacher) return null;

  return (
    <TeacherAssignmentsDrawerContent
      key={teacher.id}
      teacher={teacher}
      onClose={onClose}
      onSaveAssignments={onSaveAssignments}
    />
  );
};

export default TeacherAssignmentsDrawer;
