import React from 'react';
import { EditDisciplineFormFields } from './EditDisciplineFormFields';
import { useDisciplineConfigForm } from './useDisciplineConfigForm';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';

const EditSportsConfigModalContent = ({
  config,
  onClose,
  onSave,
  teachers = MOCK_TEACHERS,
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
  } = useDisciplineConfigForm(config, teachers, onSave, onClose);

  return (
    <div
      data-testid="edit-sports-config-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">tune</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configuración de Disciplina
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {config?.code || 'Actividad Extracurricular'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de configuración"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <EditDisciplineFormFields
            formData={formData}
            onChange={handleChange}
            onEmojiSelect={handleEmojiSelect}
            onToggleDay={handleToggleDay}
            onScheduleChange={handleScheduleChange}
            onCopyScheduleToAll={handleCopyScheduleToAll}
            teachers={teachers}
            error={error}
          />

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-save-discipline-config"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm cursor-pointer border-none"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditSportsConfigModal = ({ isOpen, config, onClose, onSave, teachers = MOCK_TEACHERS }) => {
  if (!isOpen) return null;

  return (
    <EditSportsConfigModalContent
      key={config?.id || 'sports-config'}
      config={config}
      onClose={onClose}
      onSave={onSave}
      teachers={teachers}
    />
  );
};

export default EditSportsConfigModal;
