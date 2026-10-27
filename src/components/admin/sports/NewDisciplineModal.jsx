import React from 'react';
import { NewDisciplineFormFields } from './NewDisciplineFormFields';
import { useDisciplineConfigForm } from './useDisciplineConfigForm';

const EMPTY_TEACHERS = [];

const NewDisciplineModalContent = ({
  onClose,
  onSave,
  onCreate,
  teachers = EMPTY_TEACHERS,
}) => {
  const {
    formData,
    error,
    handleChange,
    handleEmojiSelect,
    handleToggleDay,
    handleScheduleChange,
    handleCopyScheduleToAll,
    handleSubmit,
  } = useDisciplineConfigForm({
    isCreate: true,
    teachers,
    onSave,
    onCreate,
    onClose,
  });

  return (
    <div
      data-testid="new-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              {formData.emoji}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nueva Disciplina / Actividad</h3>
              <p className="text-xs text-slate-500">
                Configuración de oferta extracurricular, cupos y responsable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de creación"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <NewDisciplineFormFields
            formData={formData}
            onChange={handleChange}
            onEmojiSelect={handleEmojiSelect}
            onToggleDay={handleToggleDay}
            onScheduleChange={handleScheduleChange}
            onCopyScheduleToAll={handleCopyScheduleToAll}
            teachers={teachers}
            error={error}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="submit-new-discipline"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
            >
              Guardar Disciplina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NewDisciplineModal = ({
  isOpen,
  onClose,
  onSave,
  onCreate,
  teachers = EMPTY_TEACHERS,
}) => {
  if (!isOpen) return null;

  return (
    <NewDisciplineModalContent
      onClose={onClose}
      onSave={onSave}
      onCreate={onCreate}
      teachers={teachers}
    />
  );
};

export default NewDisciplineModal;
