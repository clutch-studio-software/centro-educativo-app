import React from 'react';
import Icon from '../atoms/Icon';
import VisitDateAndLevelFields from '../molecules/VisitDateAndLevelFields';

export const VisitBookingModal = ({
  isOpen,
  onClose,
  formData,
  errors,
  isSubmitting,
  handleInputChange,
  handleBookingSubmit,
  idPrefix = 'visit-booking',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-slate-900/95 max-w-md w-full rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl relative text-left animate-in zoom-in-95 duration-300">
        {/* Botón cerrar */}
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={onClose}
          className="absolute right-6 top-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer border-none outline-none"
        >
          <Icon name="close" className="text-xl" />
        </button>

        <div className="mb-6 flex flex-col gap-2">
          <h3 className="font-headline text-2xl font-bold text-slate-800 dark:text-slate-100">Agendar Visita</h3>
          <p className="font-body text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Completa tus datos y selecciona la fecha para tu visita guiada al campus de Resistencia.
          </p>
        </div>

        <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-name`} className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant">Nombre Completo</label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full bg-surface-container focus:bg-surface-container-lowest border border-transparent ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/30'} rounded-xl px-4 py-3 font-body text-on-surface text-sm transition-all outline-none`}
              placeholder="Ej. Carlos Mendoza"
            />
            {errors.name && <span className="text-xs text-red-500 font-semibold">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${idPrefix}-email`} className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant">Correo de Contacto</label>
            <input
              id={`${idPrefix}-email`}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full bg-surface-container focus:bg-surface-container-lowest border border-transparent ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/30'} rounded-xl px-4 py-3 font-body text-on-surface text-sm transition-all outline-none`}
              placeholder="carlos@ejemplo.com"
            />
            {errors.email && <span className="text-xs text-red-500 font-semibold">{errors.email}</span>}
          </div>

          <VisitDateAndLevelFields
            date={formData.date}
            level={formData.level}
            onChange={handleInputChange}
            errors={errors}
            idPrefix={idPrefix}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-gradient-to-br from-secondary to-secondary-dim text-white py-4 rounded-full font-bold text-base hover:shadow-xl hover:shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border-none"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Agendando...</span>
              </>
            ) : (
              <>
                <Icon name="event" className="text-lg flex items-center justify-center" />
                <span>Confirmar Visita</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VisitBookingModal;
