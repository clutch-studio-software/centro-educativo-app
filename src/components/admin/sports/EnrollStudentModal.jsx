import React from 'react';
import {
  useStudentEnrollmentSearch,
  createEnrolledStudentFromMock,
} from './useStudentEnrollmentSearch';
import { EnrollStudentList } from './EnrollStudentList';

const EnrollDisciplineBanner = ({
  discipline,
  configuredLevels,
  isFull,
  vacantesDisponibles,
  currentCount,
  maxCapacity,
}) => {
  return (
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
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
            isFull
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isFull ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          />
          {isFull
            ? 'Cupo Completo'
            : `${vacantesDisponibles} vacantes (${currentCount}/${maxCapacity})`}
        </span>
      </div>
    </div>
  );
};

const EnrollSearchToolbar = ({
  searchTerm,
  onSearchChange,
  availableNivelFilters,
  selectedNivelFilter,
  onSelectNivelFilter,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar alumno por nombre, DNI o número de legajo..."
          aria-label="Buscar alumno por nombre, DNI o legajo"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {availableNivelFilters.length > 2 && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">
            Filtrar nivel:
          </span>
          {availableNivelFilters.map((nivel) => (
            <button
              key={nivel}
              type="button"
              onClick={() => onSelectNivelFilter(nivel)}
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
  );
};

const EMPTY_ENROLLED = [];

const EnrollStudentModal = ({
  isOpen,
  onClose,
  onEnroll,
  currentCount = 0,
  maxCapacity = 40,
  discipline,
  enrolledStudents = EMPTY_ENROLLED,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedNivelFilter,
    setSelectedNivelFilter,
    selectedStudent,
    setSelectedStudent,
    configuredLevels,
    availableNivelFilters,
    eligibleStudents,
  } = useStudentEnrollmentSearch(discipline);

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
                Buscar en la base escolar de los niveles autorizados y asignar a la actividad.
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
          <EnrollDisciplineBanner
            discipline={discipline}
            configuredLevels={configuredLevels}
            isFull={isFull}
            vacantesDisponibles={vacantesDisponibles}
            currentCount={currentCount}
            maxCapacity={maxCapacity}
          />

          <EnrollSearchToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            availableNivelFilters={availableNivelFilters}
            selectedNivelFilter={selectedNivelFilter}
            onSelectNivelFilter={setSelectedNivelFilter}
          />

          <div>
            <div className="flex items-center justify-between pb-2 text-[11px] text-slate-500 font-semibold">
              <span>Alumnos encontrados ({eligibleStudents.length})</span>
              <span>Haz clic en un alumno para seleccionarlo</span>
            </div>

            <EnrollStudentList
              students={eligibleStudents}
              enrolledStudents={enrolledStudents}
              selectedStudent={selectedStudent}
              isFull={isFull}
              configuredLevels={configuredLevels}
              onSelectStudent={setSelectedStudent}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs">
            {selectedStudent ? (
              <div className="flex items-center gap-1.5 text-blue-900">
                <span className="material-symbols-outlined text-[16px] text-blue-600">
                  how_to_reg
                </span>
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
