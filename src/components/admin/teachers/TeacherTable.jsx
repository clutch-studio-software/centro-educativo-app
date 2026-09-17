import React, { useState, useRef, useEffect } from 'react';

const getStatusBadge = (estado = '') => {
  const norm = String(estado).toLowerCase();
  switch (norm) {
    case 'titular':
      return {
        label: 'Titular',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'suplente':
      return {
        label: 'Suplente',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'interino':
      return {
        label: 'Interino',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    case 'suspendido':
    case 'inactivo':
      return {
        label: 'Suspendido',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: estado || 'Titular',
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-400',
      };
  }
};

const GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-500',
  'from-purple-600 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-500',
];

const getAvatarGradient = (id = '') => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % GRADIENTS.length;
  }
  return GRADIENTS[hash];
};

const getInitials = (nombre = '', apellido = '') => {
  const cleanNombre = String(nombre).replace(/^(Prof\.|Ing\.|Lic\.|Dra\.|Dr\.)\s*/i, '').trim();
  const cleanApellido = String(apellido).trim();

  if (cleanNombre && cleanApellido) {
    return `${cleanNombre[0]}${cleanApellido[0]}`.toUpperCase();
  }
  const parts = cleanNombre.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || 'DO').slice(0, 2).toUpperCase();
};

const TeacherTable = ({
  teachers = [],
  isLoading = false,
  onEditTeacher,
  onToggleStatus,
  onResetPassword,
  onDeleteTeacher,
  onResetFilters,
}) => {
  const [activeMenuTeacherId, setActiveMenuTeacherId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  // Close floating menu on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuTeacherId(null);
      }
    };
    const handleScroll = () => {
      setActiveMenuTeacherId(null);
    };

    if (activeMenuTeacherId) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenuTeacherId]);

  const activeTeacher = teachers.find((t) => t.id === activeMenuTeacherId);

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider w-32">
                Legajo
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Docente &amp; Titulación
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Contacto Institucional
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right w-20">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody data-testid="teacher-table-body" className="divide-y divide-slate-100">
            {isLoading ? (
              <tr data-testid="teacher-loading-row">
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div data-testid="teacher-loading-state" className="flex flex-col items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin">
                      sync
                    </span>
                    <p className="font-semibold text-slate-600 text-sm">
                      Cargando nómina docente...
                    </p>
                    <p className="text-xs text-slate-400">
                      Sincronizando información institucional y credenciales
                    </p>
                  </div>
                </td>
              </tr>
            ) : teachers.length === 0 ? (
              <tr data-testid="teacher-empty-row">
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div data-testid="teacher-empty-state" className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      person_off
                    </span>
                    <p className="font-semibold text-slate-600 text-sm">
                      No se encontraron docentes con los filtros seleccionados
                    </p>
                    <p className="text-xs text-slate-400">
                      Prueba cambiando el término de búsqueda o el estado seleccionado.
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline transition-colors cursor-pointer"
                      >
                        Restablecer filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => {
              const status = getStatusBadge(teacher.estado);
              const displayName =
                teacher.nombreCompleto ||
                (teacher.apellido
                  ? `${teacher.nombre} ${teacher.apellido}`
                  : teacher.nombre);
              const initials = getInitials(teacher.nombre, teacher.apellido);
              const isSuspended = String(teacher.estado).toLowerCase() === 'suspendido';

              return (
                <tr
                  key={teacher.id}
                  className={`transition-colors group ${
                    isSuspended ? 'bg-rose-50/20 hover:bg-rose-50/30' : 'hover:bg-blue-50/30'
                  }`}
                >
                  {/* Legajo */}
                  <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600 whitespace-nowrap">
                    {teacher.legajo}
                  </td>

                  {/* Docente & Titulación */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {isSuspended ? (
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-bold shadow-xs">
                            {initials}
                          </div>
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(
                              teacher.id
                            )} text-white font-bold text-xs flex items-center justify-center shadow-sm`}
                          >
                            {initials}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-bold text-xs truncate transition-colors ${
                            isSuspended
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {displayName}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate" title={teacher.titulacion}>
                          {teacher.titulacion}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          DNI: {teacher.dni}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Especialidad (texto libre con badge limpio) */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md font-bold text-[11px] border bg-slate-50 text-slate-700 border-slate-200">
                      {teacher.especialidad}
                    </span>
                  </td>

                  {/* Estado (Titular, Suplente, Interino, Suspendido) */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] border ${status.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}></span>
                      <span>{status.label}</span>
                    </span>
                  </td>

                  {/* Contacto Institucional */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {teacher.email}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {teacher.telefono}
                      </span>
                    </div>
                  </td>

                  {/* Botón de 3 Puntos Más Opciones */}
                  <td className="py-4 px-6 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeMenuTeacherId === teacher.id) {
                            setActiveMenuTeacherId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const menuHeight = 180;
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;
                            setMenuPosition({
                              top: openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6,
                              right: window.innerWidth - rect.right,
                            });
                            setActiveMenuTeacherId(teacher.id);
                          }
                        }}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer border-none ${
                          activeMenuTeacherId === teacher.id
                            ? 'bg-slate-200 text-slate-800 shadow-xs'
                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 bg-transparent'
                        }`}
                        title="Más opciones"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* Menú Flotante con Posicionamiento Fijo (Evita clipping por overflow) */}
      {activeTeacher && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 9999,
          }}
          className="w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
        >
          {/* Opción C: Modificar datos */}
          <div className="py-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId(null);
                onEditTeacher(target);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">
                edit
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>Modificar datos</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Editar legajo y contacto
                </span>
              </div>
            </button>

            {/* Opción D: Restablecer contraseña */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId(null);
                onResetPassword(target);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">
                lock_reset
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>Restablecer contraseña</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Volver al DNI por defecto
                </span>
              </div>
            </button>

            {/* Opción A: Deshabilitar / Habilitar usuario */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId(null);
                onToggleStatus(target);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent ${
                String(activeTeacher.estado).toLowerCase() === 'suspendido'
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {String(activeTeacher.estado).toLowerCase() === 'suspendido'
                  ? 'check_circle'
                  : 'person_off'}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>
                  {String(activeTeacher.estado).toLowerCase() === 'suspendido'
                    ? 'Habilitar usuario'
                    : 'Deshabilitar usuario'}
                </span>
                <span className="text-[10px] font-normal text-slate-400">
                  {String(activeTeacher.estado).toLowerCase() === 'suspendido'
                    ? 'Restaurar a estado activo'
                    : 'Pasa a estado Suspendido'}
                </span>
              </div>
            </button>
          </div>

          {/* Opción B: Borrar usuario */}
          <div className="py-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId(null);
                onDeleteTeacher(target);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined text-[18px] text-red-500">
                delete_forever
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>Borrar usuario</span>
                <span className="text-[10px] font-normal text-red-400">
                  Eliminar legajo definitivamente
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeacherTable;
