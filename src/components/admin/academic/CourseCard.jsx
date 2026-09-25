import React from 'react';

const CourseCard = ({
  course,
  onToggleStatus,
  onEditCourse,
  onManageCourse,
  onViewSubjects,
}) => {
  const {
    id,
    nivelId,
    nombre,
    turno,
    dotColor,
    barColor = 'bg-blue-600',
    cupoOcupado = 0,
    cupoMax = 30,
    cupoTexto,
    isLleno,
    docenteTitular,
    preceptor,
    materiasCount = 0,
    aula,
    activo = true,
  } = course;

  const percentage = Math.min(100, Math.round((cupoOcupado / (cupoMax || 1)) * 100));

  // 1. NIVEL INICIAL CARD
  if (nivelId === 'inicial') {
    return (
      <article
        data-testid={`course-card-${id}`}
        className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 transition-all shadow-xs"
      >
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor || 'bg-amber-400'}`}></span>
                <h3 className="text-sm font-bold text-slate-800">{nombre}</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{turno}</p>
            </div>
            {/* Switch Status */}
            <label className="relative inline-flex items-center cursor-pointer" title={activo ? 'Pausar curso' : 'Activar curso'}>
              <input
                type="checkbox"
                checked={activo}
                onChange={() => onToggleStatus(course)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Cupo Status */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Cupo: {cupoOcupado}/{cupoMax} cubiertos</span>
              <span className={isLleno ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                {cupoTexto || `${cupoMax - cupoOcupado} Vacantes`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-4">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            <span className="truncate">
              Docente Titular: <strong className="text-slate-700 font-semibold">{docenteTitular || 'A designar'}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onEditCourse(course)}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(course)}
            className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors cursor-pointer"
          >
            {activo ? 'Pausar' : 'Activar'}
          </button>
        </div>
      </article>
    );
  }

  // 2. NIVEL PRIMARIO CARD
  if (nivelId === 'primario') {
    return (
      <article
        data-testid={`course-card-${id}`}
        className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 transition-all shadow-xs"
      >
        <div>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{nombre}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{turno}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" title={activo ? 'Pausar curso' : 'Activar curso'}>
              <input
                type="checkbox"
                checked={activo}
                onChange={() => onToggleStatus(course)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">{cupoOcupado}/{cupoMax} ocupados</span>
              <span className={isLleno ? 'text-rose-500 font-bold' : 'text-emerald-600'}>
                {cupoTexto || `${cupoMax - cupoOcupado} vacantes`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-medium text-slate-400">{aula || 'Aula 10 - P.B.'}</span>
          <button
            type="button"
            onClick={() => onManageCourse(course)}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Gestionar
          </button>
        </div>
      </article>
    );
  }

  // 3. NIVEL SECUNDARIO CARD
  return (
    <article
      data-testid={`course-card-${id}`}
      className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-slate-200 transition-all shadow-xs"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{nombre}</h3>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              activo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {activo ? 'Activo' : 'Pausado'}
          </span>
        </div>

        <div className="my-3 space-y-1">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Cupo: {cupoOcupado}/{cupoMax} ocupados</span>
            <span className={isLleno ? 'text-rose-500 font-bold' : 'text-slate-700 font-bold'}>
              {cupoTexto || `${cupoMax - cupoOcupado} vacantes`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 space-y-0.5">
          <p>
            Preceptor Asignado:{' '}
            <strong className="text-slate-600 font-medium">{preceptor || 'Sin designar'}</strong>
          </p>
          <p>
            Malla:{' '}
            <strong className="text-slate-600 font-medium">{materiasCount} Materias asignadas</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewSubjects(course)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          Ver Asignaturas
        </button>
        <button
          type="button"
          onClick={() => onManageCourse(course)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-white transition-colors cursor-pointer"
          title="Opciones del curso"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
        </button>
      </div>
    </article>
  );
};

export default CourseCard;
