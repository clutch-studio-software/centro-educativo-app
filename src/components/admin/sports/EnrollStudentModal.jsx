import React, { useState, useMemo } from 'react';
import { MOCK_STUDENTS } from '../../../data/mockStudents';
import { isStudentLevelAllowed } from './sportsScheduleUtils';

const normalizeDigits = (val) => String(val || '').replace(/\D/g, '');

const isAlreadyEnrolled = (student, enrolledList = []) => {
  const sDni = normalizeDigits(student.dni);
  const sLegajo = String(student.legajo || '').trim().toLowerCase();
  const sId = String(student.id || '').trim();
  const sName = String(student.nombre || '').trim().toLowerCase();

  return enrolledList.some((e) => {
    const eDni = normalizeDigits(e.dni);
    const eLegajo = String(e.legajo || '').trim().toLowerCase();
    const eId = String(e.id || '').trim();
    const eName = String(e.nombre || '').trim().toLowerCase();

    if (sDni && eDni && sDni === eDni) return true;
    if (sLegajo && eLegajo && sLegajo === eLegajo) return true;
    if (sId && eId && sId === eId) return true;
    if (sName && eName && sName === eName) return true;
    return false;
  });
};

const createEnrolledStudentFromMock = (student) => {
  const tutorClean = student.tutorNombre
    ? student.tutorNombre.split('(')[0].trim()
    : 'Tutor registrado';

  return {
    id: student.id || `ALU-${Math.floor(1000 + Math.random() * 9000)}`,
    legajo: student.legajo || `#LEG-${Math.floor(1000 + Math.random() * 9000)}`,
    nombre: student.nombre,
    dni: student.dni,
    iniciales:
      student.initials ||
      student.nombre
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    avatarGrad: student.avatarGradient || 'from-blue-600 to-indigo-500',
    nivel: student.nivel,
    curso: student.curso,
    division: student.curso,
    cursoCompleto: student.cursoDisplay || `${student.nivel} - ${student.curso}`,
    tutor: tutorClean,
    tutorTelefono: student.tutorTelefono || '-',
    fechaInscripcion: new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    estadoCuota: 'Al Día',
    aptoMedico: true,
  };
};

const EnrollStudentModal = ({
  isOpen,
  onClose,
  onEnroll,
  currentCount = 0,
  maxCapacity = 40,
  discipline,
  enrolledStudents = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivelFilter, setSelectedNivelFilter] = useState('Todos');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const configuredLevels = discipline?.niveles || 'Todos los niveles';

  // Determine which level options to show in the sub-filter
  const availableNivelFilters = useMemo(() => {
    const list = ['Todos'];
    const lower = configuredLevels.toLowerCase();
    if (lower.includes('todos') || lower.includes('inicial')) list.push('Inicial');
    if (lower.includes('todos') || lower.includes('primario')) list.push('Primario');
    if (lower.includes('todos') || lower.includes('secundario')) list.push('Secundario');
    return list;
  }, [configuredLevels]);

  // Filter students from mock database by activity's allowed levels & active status
  const eligibleStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      // Must belong to the discipline's configured levels
      if (!isStudentLevelAllowed(student.nivel, configuredLevels)) {
        return false;
      }

      // Filter out inactive/baja students
      if (student.isInactive || student.estado === 'Baja Administrativa') {
        return false;
      }

      // Sub-filter by level chip
      if (selectedNivelFilter !== 'Todos' && student.nivel !== selectedNivelFilter) {
        return false;
      }

      // Filter by search query (Name, DNI, Legajo)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const cleanQuery = query.replace(/\D/g, '');
        const cleanDni = normalizeDigits(student.dni);
        const matchesName = (student.nombre || '').toLowerCase().includes(query);
        const matchesLegajo = (student.legajo || '').toLowerCase().includes(query);
        const matchesDni = cleanQuery ? cleanDni.includes(cleanQuery) : false;

        if (!matchesName && !matchesLegajo && !matchesDni) {
          return false;
        }
      }

      return true;
    });
  }, [configuredLevels, selectedNivelFilter, searchTerm]);

  if (!isOpen) return null;

  const isFull = currentCount >= maxCapacity;
  const vacantesDisponibles = Math.max(0, maxCapacity - currentCount);

  const handleConfirmEnroll = (e) => {
    e.preventDefault();
    if (!selectedStudent || isFull) return;

    const newRecord = createEnrolledStudentFromMock(selectedStudent);
    onEnroll(newRecord);
    setSelectedStudent(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <div
      data-testid="enroll-student-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">person_search</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inscribir Alumno a la Disciplina
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Buscar en la base de datos escolar de los niveles configurados y asignar a la actividad.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de inscripción"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Discipline Requirement Summary Banner */}
          <div className="bg-blue-50/80 border border-blue-200/70 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-blue-900">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none">{discipline?.emoji || '🏃'}</span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  {discipline?.nombre || discipline?.titulo || 'Actividad Deportiva'}
                </h4>
                <p className="text-[11px] text-blue-700 font-medium">
                  Niveles autorizados:{' '}
                  <span className="font-bold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-100">
                    {configuredLevels}
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                isFull
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                {isFull ? 'Cupo Completo' : `${vacantesDisponibles} vacantes (${currentCount}/${maxCapacity})`}
              </span>
            </div>
          </div>

          {/* Search Bar & Level Filter */}
          <div className="space-y-2.5">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar alumno por nombre, DNI o número de legajo..."
                aria-label="Buscar alumno por nombre, DNI o legajo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {/* Quick Level Filter chips */}
            {availableNivelFilters.length > 2 && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Filtrar nivel:</span>
                {availableNivelFilters.map((nivel) => (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => setSelectedNivelFilter(nivel)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none ${
                      selectedNivelFilter === nivel
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {nivel === 'Todos' ? 'Todos los permitidos' : nivel}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student List */}
          <div>
            <div className="flex items-center justify-between pb-2 text-[11px] text-slate-500 font-semibold">
              <span>Alumnos encontrados ({eligibleStudents.length})</span>
              <span>Haz clic para seleccionar</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {eligibleStudents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 space-y-2">
                  <span className="material-symbols-outlined text-3xl text-slate-400">person_off</span>
                  <p className="font-bold text-slate-700">No se encontraron alumnos disponibles</p>
                  <p className="text-[11px] max-w-sm mx-auto">
                    No hay estudiantes que coincidan con la búsqueda dentro de los niveles autorizados ({configuredLevels}).
                  </p>
                </div>
              ) : (
                eligibleStudents.map((student) => {
                  const alreadyEnrolled = isAlreadyEnrolled(student, enrolledStudents);
                  const isSelected = selectedStudent?.id === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        if (!alreadyEnrolled && !isFull) {
                          setSelectedStudent(student);
                        }
                      }}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        alreadyEnrolled
                          ? 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer shadow-xs'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Radio selector icon */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : alreadyEnrolled
                              ? 'border-slate-300 bg-slate-200'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
                            student.avatarGradient || 'from-blue-600 to-indigo-500'
                          } text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}
                        >
                          {student.initials || 'AL'}
                        </div>

                        {/* Student Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs truncate">
                              {student.nombre}
                            </span>
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                              {student.legajo}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              DNI {student.dni}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {student.cursoDisplay || `${student.nivel} - ${student.curso}`}
                            </span>
                            {student.tutorNombre && (
                              <span className="truncate">
                                Tutor: {student.tutorNombre.split('(')[0].trim()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right badge / status */}
                      <div className="shrink-0 text-right">
                        {alreadyEnrolled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            Ya inscripto
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                            {student.estado || 'Regular'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs">
            {selectedStudent ? (
              <div className="flex items-center gap-1.5 text-blue-900">
                <span className="material-symbols-outlined text-[16px] text-blue-600">how_to_reg</span>
                <span>
                  Alumno seleccionado:{' '}
                  <strong className="text-slate-900">{selectedStudent.nombre}</strong> (
                  {selectedStudent.cursoDisplay || selectedStudent.curso})
                </span>
              </div>
            ) : (
              <span className="text-slate-500 text-[11px]">
                Selecciona un alumno de la lista para inscribirlo en la actividad.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedStudent || isFull}
              onClick={handleConfirmEnroll}
              data-testid="btn-confirm-enroll-student"
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border-none flex items-center gap-1.5 ${
                !selectedStudent || isFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Inscribir Alumno</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollStudentModal;
