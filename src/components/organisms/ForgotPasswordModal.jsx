import React from 'react';

/**
 * Modal informativo para la recuperación y restablecimiento de contraseña.
 * Detalla las opciones de contacto institucional: telefónico, correo electrónico
 * y atención presencial en secretaría.
 */
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      data-testid="forgot-password-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        data-testid="forgot-password-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div
        data-testid="forgot-password-modal-content"
        className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 flex flex-col gap-5 text-left animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                lock_reset
              </span>
            </div>
            <div>
              <h2 id="forgot-password-title" className="font-headline font-bold text-xl text-slate-800 tracking-tight m-0">
                Restablecer Contraseña
              </h2>
              <p className="font-body text-xs text-slate-500 m-0 mt-0.5">
                Gestión de credenciales y seguridad institucional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Texto informativo */}
        <p className="text-xs sm:text-sm text-slate-600 font-body leading-relaxed m-0 bg-slate-50 p-3.5 rounded-md border border-slate-200/70">
          Por normativas de seguridad escolar y confidencialidad de legajos, el blanqueo de contraseñas se gestiona con verificación previa. Puedes solicitarlo por cualquiera de los siguientes canales:
        </p>

        {/* Tarjetas de contacto */}
        <div className="space-y-2.5">
          {/* Opción 1: Telefónica */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-orange-50/40 transition-colors flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">call</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Vía Telefónica
              </span>
              <a
                href="tel:+541148217934"
                className="text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors font-mono block mt-0.5"
              >
                +54 (011) 4821-7934
              </a>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Interno 102 (Secretaría General) · Lunes a Viernes de 08:00 a 17:30 hs.
              </p>
            </div>
          </div>

          {/* Opción 2: Correo Electrónico */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-orange-50/40 transition-colors flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                Correo Electrónico
              </span>
              <a
                href="mailto:administracion@educ.ar?subject=Solicitud de Restablecimiento de Contraseña"
                className="text-sm font-bold text-blue-600 hover:underline transition-colors font-mono block mt-0.5 break-all"
              >
                administracion@educ.ar
              </a>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Indicar en el mensaje nombre completo, DNI y rol o legajo institucional.
              </p>
            </div>
          </div>

          {/* Opción 3: Presencial en Secretaría */}
          <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-orange-50/40 transition-colors flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-xl">meeting_room</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                Presencial en Secretaría
              </span>
              <p className="text-sm font-semibold text-slate-800 m-0 mt-0.5">
                Edificio Central · Planta Baja
              </p>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Acercarse con documento de identidad para el blanqueo presencial en el momento.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-full transition-all duration-150 border-none cursor-pointer shadow-xs active:scale-95"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
