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

const TeacherFloatingMenu = ({
  activeTeacher,
  menuRef,
  menuPosition,
  setActiveMenuTeacherId,
  onManageAssignments,
  onEditTeacher,
  onResetPassword,
  onToggleStatus,
  onDeleteTeacher,
  canManageTeachers = true,
  isOwnTeacher = false,
}) => {
  if (!activeTeacher) return null;

  const isSuspended = String(activeTeacher.estado).toLowerCase() === 'suspendido';
  const canViewSchedule = canManageTeachers || isOwnTeacher;

  return (
    <div
      ref={menuRef}
      data-testid="teacher-floating-menu"
      style={{
        position: 'fixed',
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
        zIndex: 9999,
      }}
      className="w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
    >
      <div className="py-1">
        {canViewSchedule && (
          <button
            type="button"
            data-testid={`menu-assignments-${activeTeacher.id}`}
            onClick={(e) => {
              e.stopPropagation();
              const target = activeTeacher;
              setActiveMenuTeacherId?.(null);
              onManageAssignments?.(target);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50/60 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              calendar_month
            </span>
            <div className="flex flex-col items-start leading-tight">
              <span>{canManageTeachers ? 'Cátedras y Horarios' : 'Ver Mi Grilla Horaria'}</span>
              <span className="text-[10px] font-normal text-slate-400">
                {canManageTeachers ? 'Asignar materias y grilla' : 'Consultar cursos y horarios'}
              </span>
            </div>
          </button>
        )}

        {canManageTeachers && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId?.(null);
                onEditTeacher?.(target);
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId?.(null);
                onResetPassword?.(target);
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const target = activeTeacher;
                setActiveMenuTeacherId?.(null);
                onToggleStatus?.(target);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent ${
                isSuspended
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSuspended ? 'check_circle' : 'person_off'}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>
                  {isSuspended ? 'Habilitar usuario' : 'Deshabilitar usuario'}
                </span>
                <span className="text-[10px] font-normal text-slate-400">
                  {isSuspended ? 'Restaurar a estado activo' : 'Pasa a estado Suspendido'}
                </span>
              </div>
            </button>
          </>
        )}
      </div>

      {canManageTeachers && (
        <div className="py-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const target = activeTeacher;
              setActiveMenuTeacherId?.(null);
              onDeleteTeacher?.(target);
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
      )}
    </div>
  );
};

const TeacherAvatar = ({ isSuspended, initials, teacherId }) => {
  if (isSuspended) {
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-bold shadow-xs">
        {initials}
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarGradient(
        teacherId
      )} text-white font-bold text-xs flex items-center justify-center shadow-sm`}
    >
      {initials}
    </div>
  );
};

const TeacherRowActions = ({
  teacher,
  canViewSchedule,
  canManageTeachers,
  canShowActions,
  activeMenuTeacherId,
  setActiveMenuTeacherId,
  setMenuPosition,
  onManageAssignments,
}) => {
  if (!canShowActions && !canViewSchedule) {
    return <span className="text-slate-300 text-xs px-2">—</span>;
  }

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (activeMenuTeacherId === teacher.id) {
      setActiveMenuTeacherId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 190;
    const spaceBelow = globalThis.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;
    setMenuPosition({
      top: openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6,
      right: globalThis.innerWidth - rect.right,
    });
    setActiveMenuTeacherId(teacher.id);
  };

  return (
    <div className="relative inline-flex items-center justify-end gap-1 text-left">
      {canViewSchedule && (
        <button
          type="button"
          data-testid={`btn-open-schedule-${teacher.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onManageAssignments?.(teacher);
          }}
          className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer border-none bg-transparent"
          title={canManageTeachers ? 'Cátedras, Cursos y Horarios' : 'Ver Mi Grilla Horaria'}
        >
          <span className="material-symbols-outlined text-[20px]">
            calendar_month
          </span>
        </button>
      )}

      {canShowActions ? (
        <button
          type="button"
          data-testid={`btn-menu-teacher-${teacher.id}`}
          onClick={handleToggleMenu}
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
      ) : (
        <span className="text-slate-300 text-xs px-2">—</span>
      )}
    </div>
  );
};

const checkIsOwnTeacher = (teacher, currentUser) => {
  if (!currentUser) return false;
  const currentUserId = String(currentUser.uid || currentUser.id || '');
  if (currentUserId && String(teacher.id) === currentUserId) return true;
  if (!teacher.email || !currentUser.email) return false;
  return teacher.email.toLowerCase() === currentUser.email.toLowerCase();
};

const getTeacherDisplayName = (teacher) => {
  if (teacher.nombreCompleto) return teacher.nombreCompleto;
  if (teacher.apellido) return `${teacher.nombre} ${teacher.apellido}`;
  return teacher.nombre || '';
};

const TeacherInfoCell = ({ teacher, isSuspended, initials, displayName }) => (
  <td className="py-4 px-6">
    <div className="flex items-center gap-3">
      <div className="relative shrink-0">
        <TeacherAvatar
          isSuspended={isSuspended}
          initials={initials}
          teacherId={teacher.id}
        />
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
);

const TeacherTableRow = ({
  teacher,
  activeMenuTeacherId,
  setActiveMenuTeacherId,
  setMenuPosition,
  onManageAssignments,
  canManageTeachers = true,
  currentUser = null,
}) => {
  const isSuspended =
    String(teacher.estado).toLowerCase() === 'suspendido' || Boolean(teacher.disabled);
  const status = getStatusBadge(
    isSuspended ? 'Suspendido' : (teacher.condicion || teacher.estado || 'Titular')
  );
  const displayName = getTeacherDisplayName(teacher);
  const initials = getInitials(teacher.nombre, teacher.apellido);
  const isOwnTeacher = checkIsOwnTeacher(teacher, currentUser);
  const canViewSchedule = canManageTeachers || isOwnTeacher;
  const canShowActions = canManageTeachers || isOwnTeacher;
  const rowBgClass = isSuspended
    ? 'bg-rose-50/20 hover:bg-rose-50/30'
    : 'hover:bg-blue-50/30';

  return (
    <tr
      data-testid={`teacher-row-${teacher.id}`}
      className={`transition-colors group ${rowBgClass}`}
    >
      <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600 whitespace-nowrap">
        {teacher.legajo}
      </td>

      <TeacherInfoCell
        teacher={teacher}
        isSuspended={isSuspended}
        initials={initials}
        displayName={displayName}
      />

      <td className="py-4 px-6">
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md font-bold text-[11px] border bg-slate-50 text-slate-700 border-slate-200">
            {teacher.especialidad}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600">
            <span className="material-symbols-outlined text-[13px]">menu_book</span>
            <span>
              {teacher.catedras?.length || 0} cátedra(s) · {teacher.cargaHoras || 0} hs/sem
            </span>
          </span>
        </div>
      </td>

      <td className="py-4 px-6 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] border ${status.badgeClass}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`}></span>
          <span>{status.label}</span>
        </span>
      </td>

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

      <td className="py-4 px-6 text-right">
        <TeacherRowActions
          teacher={teacher}
          canViewSchedule={canViewSchedule}
          canManageTeachers={canManageTeachers}
          canShowActions={canShowActions}
          activeMenuTeacherId={activeMenuTeacherId}
          setActiveMenuTeacherId={setActiveMenuTeacherId}
          setMenuPosition={setMenuPosition}
          onManageAssignments={onManageAssignments}
        />
      </td>
    </tr>
  );
};

const renderTableBodyContent = ({
  isLoading,
  teachers,
  onResetFilters,
  activeMenuTeacherId,
  setActiveMenuTeacherId,
  setMenuPosition,
  onManageAssignments,
  canManageTeachers = true,
  currentUser = null,
}) => {
  if (isLoading) {
    return (
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
    );
  }

  if (teachers.length === 0) {
    return (
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
    );
  }

  return teachers.map((teacher) => (
    <TeacherTableRow
      key={teacher.id}
      teacher={teacher}
      activeMenuTeacherId={activeMenuTeacherId}
      setActiveMenuTeacherId={setActiveMenuTeacherId}
      setMenuPosition={setMenuPosition}
      onManageAssignments={onManageAssignments}
      canManageTeachers={canManageTeachers}
      currentUser={currentUser}
    />
  ));
};

const TeacherTable = ({
  teachers = [],
  isLoading = false,
  onManageAssignments,
  onEditTeacher,
  onToggleStatus,
  onResetPassword,
  onDeleteTeacher,
  onResetFilters,
  canManageTeachers = true,
  currentUser = null,
}) => {
  const [activeMenuTeacherId, setActiveMenuTeacherId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

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
      globalThis.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      globalThis.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenuTeacherId]);

  const activeTeacher = teachers.find((t) => t.id === activeMenuTeacherId);
  const isOwnActiveTeacher =
    Boolean(currentUser) &&
    Boolean(activeTeacher) &&
    (String(activeTeacher.id) === String(currentUser.uid || currentUser.id) ||
      (activeTeacher.email &&
        String(activeTeacher.email).toLowerCase() ===
          String(currentUser.email || '').toLowerCase()));

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
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right w-24">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody data-testid="teacher-table-body" className="divide-y divide-slate-100">
            {renderTableBodyContent({
              isLoading,
              teachers,
              onResetFilters,
              activeMenuTeacherId,
              setActiveMenuTeacherId,
              setMenuPosition,
              onManageAssignments,
              canManageTeachers,
              currentUser,
            })}
          </tbody>
        </table>
      </div>

      <TeacherFloatingMenu
        activeTeacher={activeTeacher}
        menuRef={menuRef}
        menuPosition={menuPosition}
        setActiveMenuTeacherId={setActiveMenuTeacherId}
        onManageAssignments={onManageAssignments}
        onEditTeacher={onEditTeacher}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        onDeleteTeacher={onDeleteTeacher}
        canManageTeachers={canManageTeachers}
        isOwnTeacher={isOwnActiveTeacher}
      />
    </section>
  );
};

export default TeacherTable;
