import React, { useState, useMemo, useRef, useEffect } from 'react';

const EMPTY_COURSES = [];

const DEFAULT_COURSES_BY_LEVEL = {
  Inicial: [
    'Sala de 3 A',
    'Sala de 3 B',
    'Sala de 4 A',
    'Sala de 4 B',
    'Sala de 5 A',
    'Sala de 5 B',
  ],
  Primario: [
    '1° Grado A',
    '1° Grado B',
    '2° Grado A',
    '2° Grado B',
    '3° Grado A',
    '3° Grado B',
    '4° Grado A',
    '4° Grado B',
    '5° Grado A',
    '5° Grado B',
    '6° Grado A',
    '6° Grado B',
  ],
  Secundario: [
    '1° Año A',
    '1° Año B',
    '2° Año A',
    '2° Año B',
    '3° Año A',
    '3° Año B',
    '4° Año A',
    '4° Año B',
    '5° Año A',
    '5° Año B',
    '6° Año A',
    '6° Año B',
  ],
};

const SUBJECTS_SUGGESTIONS = [
  'Matemática Aplicada',
  'Lengua y Literatura',
  'Ciencias Naturales',
  'Ciencias Sociales',
  'Física Clásica e Instrumental',
  'Química Orgánica',
  'Laboratorio de Robótica',
  'Inglés Técnico',
  'Educación Física y Deportes',
  'Educación Artística y Música',
];

const SCHEDULE_SUGGESTIONS = [
  'Lun y Mié 07:30 - 08:50',
  'Mar y Jue 09:00 - 10:20',
  'Mié y Vie 10:30 - 11:50',
  'Lun y Jue 07:30 - 08:50',
  'Mar y Vie 10:30 - 11:50',
];

const DEFAULT_GRILLA = [
  { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
  { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
  { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
];

const SLOT_COLOR_CLASSES = {
  green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  orange: 'bg-amber-100 text-amber-900 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
};

const NIVEL_BADGE_CLASSES = {
  Inicial: 'bg-amber-50 text-amber-700 border-amber-200',
  Primario: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Secundario: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const ICON_BG_CLASSES = {
  green: 'bg-emerald-100 text-emerald-700',
  orange: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
};

const resolveCoursesForNivel = (courses, selectedNivel) => {
  const targetNivelId = String(selectedNivel || 'Secundario').toLowerCase();
  if (Array.isArray(courses) && courses.length > 0) {
    const matching = courses
      .filter((c) => String(c.nivelId || c.nivel || '').toLowerCase() === targetNivelId)
      .map((c) => `${c.nombre} ${c.division || 'A'}`.trim());
    if (matching.length > 0) {
      return Array.from(new Set(matching));
    }
  }
  return DEFAULT_COURSES_BY_LEVEL[selectedNivel] || DEFAULT_COURSES_BY_LEVEL.Secundario;
};

const TeacherAddCatedraForm = ({
  formState,
  onFormChange,
  availableCourses,
  onAddCatedra,
}) => (
  <fieldset className="flex flex-col gap-3 border border-slate-200/80 bg-slate-50/60 rounded-2xl p-4 m-0">
    <legend className="font-bold text-sm text-slate-800 px-1">
      Añadir Nueva Cátedra / Módulo Horario
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="drawer-nivel-select" className="text-xs font-semibold text-slate-500 mb-1 block">
          Nivel Educativo
        </label>
        <select
          id="drawer-nivel-select"
          value={formState.nivel}
          onChange={(e) => onFormChange('nivel', e.target.value)}
          className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
        >
          <option value="Inicial">Nivel Inicial</option>
          <option value="Primario">Nivel Primario</option>
          <option value="Secundario">Nivel Secundario</option>
        </select>
      </div>

      <div>
        <label htmlFor="drawer-curso-select" className="text-xs font-semibold text-slate-500 mb-1 block">
          Curso y División
        </label>
        <select
          id="drawer-curso-select"
          value={formState.curso}
          onChange={(e) => onFormChange('curso', e.target.value)}
          className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
        >
          {availableCourses.map((curso) => (
            <option key={curso} value={curso}>
              {curso}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="drawer-subject-input" className="text-xs font-semibold text-slate-500 mb-1 block">
          Asignatura / Materia
        </label>
        <input
          id="drawer-subject-input"
          type="text"
          list="drawer-subjects-datalist"
          value={formState.subjectName}
          onChange={(e) => onFormChange('subjectName', e.target.value)}
          placeholder="Ej. Matemática Aplicada"
          className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
        />
        <datalist id="drawer-subjects-datalist">
          {SUBJECTS_SUGGESTIONS.map((subj) => (
            <option key={subj} value={subj} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <label htmlFor="drawer-hours-input" className="text-xs font-semibold text-slate-500 mb-1 block">
            Hs/Sem
          </label>
          <input
            id="drawer-hours-input"
            type="number"
            min="1"
            max="20"
            value={formState.hours}
            onChange={(e) => onFormChange('hours', e.target.value)}
            className="w-full bg-white text-slate-800 text-xs font-medium px-2.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none text-center"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="drawer-schedule-input" className="text-xs font-semibold text-slate-500 mb-1 block">
            Horario Disponible
          </label>
          <input
            id="drawer-schedule-input"
            type="text"
            list="drawer-schedule-datalist"
            value={formState.scheduleText}
            onChange={(e) => onFormChange('scheduleText', e.target.value)}
            placeholder="Lun y Mié 07:30 - 08:50"
            className="w-full bg-white text-slate-800 text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
          />
          <datalist id="drawer-schedule-datalist">
            {SCHEDULE_SUGGESTIONS.map((sched) => (
              <option key={sched} value={sched} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
    <div className="flex justify-end mt-1">
      <button
        type="button"
        onClick={onAddCatedra}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-full font-bold text-xs hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        <span>Vincular Cátedra al Horario</span>
      </button>
    </div>
  </fieldset>
);

const TeacherWeeklyScheduleGrid = ({ grilla, readOnly, onToggleSlot }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="font-bold text-sm text-slate-800">
        Grilla Horaria Semanal (Auditoría de Solapamiento)
      </span>
      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        {readOnly ? 'Vista de consulta' : 'Clic en celda para alternar'}
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

        {grilla.map((row) => (
          <React.Fragment key={row.hora}>
            <div className="py-2.5 bg-white rounded-xl text-slate-400 font-mono text-[10px] flex items-center justify-center border border-slate-100">
              {row.hora}
            </div>
            {['lun', 'mar', 'mie', 'jue', 'vie'].map((dia) => {
              const slot = row[dia];
              if (!slot) {
                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onToggleSlot?.(row.hora, dia)}
                    aria-label={`Alternar horario ${dia} ${row.hora}`}
                    className={`py-2.5 bg-white rounded-xl text-slate-300 text-[10px] flex items-center justify-center border border-slate-100 ${
                      readOnly ? 'cursor-default' : 'hover:border-blue-300 hover:text-blue-500 cursor-pointer'
                    }`}
                  >
                    -
                  </button>
                );
              }
              const bgColors = SLOT_COLOR_CLASSES[slot.color] || SLOT_COLOR_CLASSES.blue;
              return (
                <button
                  key={dia}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onToggleSlot?.(row.hora, dia)}
                  className={`py-2 px-1 ${bgColors} rounded-xl font-bold text-[10px] flex flex-col items-center justify-center border ${
                    readOnly ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'
                  }`}
                >
                  <span className="truncate max-w-full">{slot.curso}</span>
                  <span className="text-[9px] opacity-80 truncate max-w-full">{slot.materia}</span>
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

const TeacherAssignedCatedrasList = ({ catedrasList, onRemoveCatedra, readOnly }) => (
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
          const iconBg = ICON_BG_CLASSES[cat.badgeColor] || ICON_BG_CLASSES.blue;
          const nivelBadge = NIVEL_BADGE_CLASSES[cat.nivel] || NIVEL_BADGE_CLASSES.Secundario;

          return (
            <div
              key={cat.id || `${cat.nombre}-${cat.curso}`}
              className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80 transition-all hover:bg-white"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {cat.icon || 'menu_book'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {cat.nombre}
                    </span>
                    {cat.nivel && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${nivelBadge}`}
                      >
                        {cat.nivel}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 truncate">
                    {cat.curso} {cat.division || ''} • {cat.horasSemanales} hs/sem
                    {cat.horario ? ` • ${cat.horario}` : ''}
                  </span>
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onRemoveCatedra(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Desasignar cátedra"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
);

const TeacherAssignmentsDrawerContent = ({
  teacher,
  courses = EMPTY_COURSES,
  readOnly = false,
  onClose,
  onSaveAssignments,
}) => {
  const [catedrasList, setCatedrasList] = useState(() =>
    Array.isArray(teacher?.catedras) ? [...teacher.catedras] : []
  );
  const [grilla, setGrilla] = useState(() =>
    Array.isArray(teacher?.grillaHoraria) && teacher.grillaHoraria.length > 0
      ? structuredClone(teacher.grillaHoraria)
      : structuredClone(DEFAULT_GRILLA)
  );
  const [formState, setFormState] = useState(() => {
    const initialCourses = resolveCoursesForNivel(courses, 'Secundario');
    return {
      nivel: 'Secundario',
      curso: initialCourses[0] || '4° Año A',
      subjectName: teacher?.especialidad || SUBJECTS_SUGGESTIONS[0],
      hours: 4,
      scheduleText: SCHEDULE_SUGGESTIONS[0],
    };
  });

  const availableCourses = useMemo(
    () => resolveCoursesForNivel(courses, formState.nivel),
    [courses, formState.nivel]
  );

  const handleFormChange = (field, value) => {
    setFormState((prev) => {
      if (field === 'nivel') {
        const nextCourses = resolveCoursesForNivel(courses, value);
        return {
          ...prev,
          nivel: value,
          curso: nextCourses[0] || '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const totalHoras = useMemo(
    () => catedrasList.reduce((sum, c) => sum + (Number(c.horasSemanales) || 0), 0),
    [catedrasList]
  );

  const maxHoras = teacher?.cargaMaxHoras || 30;
  const porcentajeCarga = Math.min(Math.round((totalHoras / maxHoras) * 100), 100);

  const handleAddCatedra = () => {
    const cleanSubject = (formState.subjectName || '').trim() || 'Materia General';
    const selectedNivel = formState.nivel || 'Secundario';
    const newCourseName = formState.curso || availableCourses[0] || '1° Año A';

    const newCat = {
      id: `cat-${Date.now()}`,
      nombre: cleanSubject,
      nivel: selectedNivel,
      curso: newCourseName,
      horasSemanales: Number(formState.hours) || 4,
      horario: (formState.scheduleText || '').trim() || 'Horario a confirmar',
      icon: 'menu_book',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    setCatedrasList((prev) => [...prev, newCat]);

    const nextGrilla = structuredClone(grilla);
    const dias = ['lun', 'mar', 'mie', 'jue', 'vie'];
    let placed = false;

    for (const fila of nextGrilla) {
      if (placed) break;
      for (const dia of dias) {
        if (!fila[dia]) {
          fila[dia] = {
            curso: newCourseName,
            materia: cleanSubject.slice(0, 12),
            color: 'blue',
          };
          placed = true;
          break;
        }
      }
    }
    setGrilla(nextGrilla);
  };

  const handleToggleSlot = (hora, dia) => {
    if (readOnly) return;
    setGrilla((prev) =>
      prev.map((row) => {
        if (row.hora !== hora) return row;
        const currentSlot = row[dia];
        if (currentSlot) {
          return { ...row, [dia]: null };
        }
        const activeCat = catedrasList[catedrasList.length - 1];
        return {
          ...row,
          [dia]: {
            curso: activeCat?.curso || formState.curso || 'Curso',
            materia: (activeCat?.nombre || formState.subjectName || 'Cátedra').slice(0, 12),
            color: 'blue',
          },
        };
      })
    );
  };

  const handleRemoveCatedra = (catId) => {
    if (readOnly) return;
    setCatedrasList((prev) => prev.filter((c) => c.id !== catId));
  };

  const handleConfirmSave = () => {
    onSaveAssignments?.(teacher.id, {
      catedras: catedrasList,
      cargaHoras: totalHoras,
      grillaHoraria: grilla,
    });
    onClose?.();
  };

  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  const displayName =
    teacher.nombreCompleto ||
    (teacher.apellido ? `${teacher.nombre} ${teacher.apellido}` : teacher.nombre);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="slide-over-title"
      className="fixed inset-0 z-50 overflow-hidden bg-transparent p-0 max-w-none w-full h-full"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between rounded-l-3xl overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  {readOnly ? 'Consulta de Asignación Académica' : 'Planificación Académica 2026'}
                </span>
                <h2 id="slide-over-title" className="text-xl font-extrabold text-slate-900">
                  {displayName}
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

            <div className="p-6 flex flex-col gap-6">
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

              {!readOnly && (
                <TeacherAddCatedraForm
                  formState={formState}
                  onFormChange={handleFormChange}
                  availableCourses={availableCourses}
                  onAddCatedra={handleAddCatedra}
                />
              )}

              <TeacherWeeklyScheduleGrid
                grilla={grilla}
                readOnly={readOnly}
                onToggleSlot={handleToggleSlot}
              />

              <TeacherAssignedCatedrasList
                catedrasList={catedrasList}
                onRemoveCatedra={handleRemoveCatedra}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              {readOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(11,80,213,0.3)] transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Confirmar y Guardar Asignaciones</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
};

const TeacherAssignmentsDrawer = ({
  isOpen,
  teacher,
  courses = EMPTY_COURSES,
  readOnly = false,
  onClose,
  onSaveAssignments,
}) => {
  if (!isOpen || !teacher) return null;

  return (
    <TeacherAssignmentsDrawerContent
      key={teacher.id}
      teacher={teacher}
      courses={courses}
      readOnly={readOnly}
      onClose={onClose}
      onSaveAssignments={onSaveAssignments}
    />
  );
};

export default TeacherAssignmentsDrawer;
