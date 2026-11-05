import React from 'react';

/**
 * Banner superior de bienvenida y selector de modo para el portal de familias
 */
const FamilyPortalBanner = ({
  isStudentUser,
  isParentUser,
  portalMode,
  setPortalMode,
}) => {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col gap-4 text-center">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
          {isStudentUser ? 'Portal del Estudiante' : 'Portal de Tutores'}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold font-headline mt-2">
          {isStudentUser
            ? 'Mi Trayectoria Escolar'
            : portalMode === 'facturacion'
              ? 'Facturación y Aranceles Familiares'
              : 'Autogestión de Servicios Escolares'}
        </h1>
        <p className="text-white/80 text-xs md:text-sm mt-1">
          {isStudentUser
            ? 'Consulta tus materias, profesores, horarios de talleres deportivos y servicios institucionales asignados.'
            : portalMode === 'facturacion'
              ? 'Supervisa las liquidaciones arancelarias de tus hijos, descarga recibos oficiales y carga comprobantes de pago.'
              : 'Supervisa el perfil académico de tus hijos e inscribe o gestiona el transporte escolar, deportes y comedor.'}
        </p>
      </div>

      {isParentUser && (
        <div className="w-full flex justify-center mt-6 overflow-x-auto">
          {/* Contenedor base de cristal líquido */}
          <div className="relative inline-flex bg-white/[0.12] p-1 rounded-full backdrop-blur-xl backdrop-saturate-150 border border-white/20 border-t-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.3)] min-w-[360px]">
            {/* Pastilla activa deslizante con relieve de cristal blanco */}
            <span
              aria-hidden="true"
              className={`absolute top-1 bottom-1 w-[calc(33.333%-4px)] rounded-xl bg-white/90 backdrop-blur-md border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
                portalMode === 'inscripciones'
                  ? 'left-1 translate-x-0'
                  : portalMode === 'perfil'
                    ? 'left-1 translate-x-full'
                    : 'left-1 translate-x-[200%]'
              }`}
            />

            {/* Botón Inscripciones */}
            <button
              type="button"
              data-testid="toggle-view-inscripciones"
              onClick={() => setPortalMode('inscripciones')}
              className={`relative z-10 w-32 sm:w-36 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center select-none ${
                portalMode === 'inscripciones'
                  ? 'text-orange-900 font-bold drop-shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Inscripciones
            </button>

            {/* Botón Ficha Académica */}
            <button
              type="button"
              data-testid="toggle-view-perfil"
              onClick={() => setPortalMode('perfil')}
              className={`relative z-10 w-32 sm:w-36 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center select-none ${
                portalMode === 'perfil'
                  ? 'text-orange-900 font-bold drop-shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Ficha Académica
            </button>

            {/* Botón Facturación */}
            <button
              type="button"
              data-testid="toggle-view-facturacion"
              onClick={() => setPortalMode('facturacion')}
              className={`relative z-10 w-32 sm:w-36 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer text-center select-none ${
                portalMode === 'facturacion'
                  ? 'text-orange-900 font-bold drop-shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Facturación
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPortalBanner;
