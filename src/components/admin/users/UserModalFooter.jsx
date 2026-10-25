import React from 'react';

const UserModalFooter = ({
  onClose,
  isSubmitting = false,
  submitText = 'Guardar Cambios',
  submittingText = 'Guardando...',
  submitIcon = 'save',
  cancelText = 'Cancelar',
}) => {
  return (
    <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors cursor-pointer"
      >
        {cancelText}
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>{submittingText}</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">{submitIcon}</span>
            <span>{submitText}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default UserModalFooter;
