import React from 'react';

const EMPTY_STUDENTS = [];

export const DivisionRowMenu = ({
  course,
  enrolledStudents = EMPTY_STUDENTS,
  menuRef,
  menuPosition,
  onClose,
  onView,
  onEdit,
  onDelete,
}) => {
  if (!course) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
        zIndex: 9999,
      }}
      className="w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
    >
      <div className="py-1">
        {/* Opción 1: Visualizar división */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onView(course, enrolledStudents);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">visibility</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Visualizar división</span>
            <span className="text-[10px] font-normal text-slate-400">
              Ver nómina ({enrolledStudents.length} alumnos)
            </span>
          </div>
        </button>

        {/* Opción 2: Editar división */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onEdit(course);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-indigo-600">edit</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Editar división</span>
            <span className="text-[10px] font-normal text-slate-400">Modificar cupos y turno</span>
          </div>
        </button>
      </div>

      {/* Opción 3: Borrar división */}
      <div className="py-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onDelete(course);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-rose-500">delete</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Borrar división</span>
            <span className="text-[10px] font-normal text-rose-400">
              {enrolledStudents.length > 0 ? `${enrolledStudents.length} pasarán a sin asignar` : 'Eliminar de la oferta'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DivisionRowMenu;
