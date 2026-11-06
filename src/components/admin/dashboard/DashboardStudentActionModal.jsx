import React, { useState } from 'react';

const DEFAULT_OPTIONS = [];

const DashboardStudentActionModal = ({
  modalTestId = 'student-action-modal',
  closeButtonTestId = 'btn-close-action-modal',
  submitButtonTestId = 'btn-submit-action',
  headerBgClass = 'bg-rose-50 border-rose-100',
  iconBgClass = 'bg-rose-600',
  iconName = 'medical_services',
  title = 'Registrar Novedad',
  student,
  options = DEFAULT_OPTIONS,
  selectId = 'select-action-type',
  selectTestId = 'select-action-type',
  selectLabel = 'Tipo de Registro',
  textareaId = 'textarea-action-motivo',
  textareaTestId = 'textarea-action-motivo',
  textareaLabel = 'Observaciones / Motivo',
  textareaPlaceholder = 'Describa el motivo...',
  submitLabel = 'Guardar Registro',
  submitLoadingLabel = 'Guardando...',
  submitButtonClass = 'bg-rose-600 hover:bg-rose-700',
  focusRingClass = 'focus:ring-rose-500/20',
  showNotificationCheckbox = false,
  onClose,
  onSubmit,
}) => {
  const [tipo, setTipo] = useState(options[0] || '');
  const [motivo, setMotivo] = useState('');
  const [notificadoFamilias, setNotificadoFamilias] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({
        tipo,
        motivo: motivo.trim(),
        notificadoFamilias,
      });
      onClose?.();
    } catch (err) {
      console.error('Error al guardar registro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid={modalTestId}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className={`px-5 py-4 ${headerBgClass} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-8 h-8 rounded-lg ${iconBgClass} text-white flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[18px]">{iconName}</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                {title}
              </p>
              <p className="text-[11px] text-slate-600">
                {student.nombreCompleto || `${student.nombre || ''} ${student.apellido || ''}`} (<strong>{student.studentID_login}</strong> · {student.curso})
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid={closeButtonTestId}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={selectId} className="font-bold text-slate-700">
              {selectLabel}
            </label>
            <select
              id={selectId}
              data-testid={selectTestId}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={`px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-[14px] font-medium focus:ring-2 ${focusRingClass} focus:outline-hidden`}
            >
              {options.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={textareaId} className="font-bold text-slate-700">
              {textareaLabel}
            </label>
            <textarea
              id={textareaId}
              data-testid={textareaTestId}
              rows={3}
              required
              placeholder={textareaPlaceholder}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className={`px-3 py-2 text-[14px] bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:ring-2 ${focusRingClass} focus:outline-hidden`}
            />
          </div>

          {showNotificationCheckbox && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-slate-200/80">
              <input
                type="checkbox"
                id="notificar-familias"
                data-testid="checkbox-notificar-familias"
                checked={notificadoFamilias}
                onChange={(e) => setNotificadoFamilias(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label
                htmlFor="notificar-familias"
                aria-label="Notificado a Tutores / Familiares"
                className="text-xs text-slate-700 select-none font-medium"
              >
                Notificado a Tutores / Familiares (vía telefónica o presencial)
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid={submitButtonTestId}
              disabled={isSubmitting || !motivo.trim()}
              className={`px-5 py-2 ${submitButtonClass} disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5`}
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{isSubmitting ? submitLoadingLabel : submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardStudentActionModal;
