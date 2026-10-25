import React from 'react';

// Importar recursos gráficos locales de alta resolución
import { images } from '../../services/imagesConfig';
const { pool, stadium, lab } = images;
import Icon from '../atoms/Icon';

/**
 * Componente HomeCampus (Organismo)
 * Sección que presenta el campus escolar con sus instalaciones, usando imágenes locales.
 *
 * @param {Function} onGalleryClick - Callback para navegar a la Galería Completa.
 */
const HomeCampus = ({ onGalleryClick }) => {
  return (
    <section
      className="bg-surface-container-low relative text-left"
      id="gallery"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Cabecera de la Sección */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-in fade-in duration-500">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface font-headline mb-4">
              Nuestro Campus
            </h2>
            <p className="text-lg text-on-surface-variant font-body">
              Espacios diseñados para el bienestar físico, mental y académico.
            </p>
          </div>
          <button
            onClick={() =>
              alert(
                '¡El Tour Virtual 360° del campus estará disponible próximamente!'
              )
            }
            className="flex bg-secondary-container text-on-secondary-container font-bold px-6 py-3.5 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all items-center gap-2 cursor-pointer"
          >
            <span>Ver Tour Virtual</span>
            <Icon name="visibility" className="text-lg flex items-center" />
          </button>
        </div>

        {/* Grilla Bento del Campus */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[250px] animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* 1. Complejo Acuático (Piscina) - col-span-2, row-span-2 */}
          <div className="col-span-2 row-span-2 rounded-[2rem] overflow-hidden relative group shadow-sm cursor-pointer">
            <img
              loading="lazy"
              alt="Piscina olímpica techada del colegio"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={pool}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 sm:p-8">
              <h3 className="text-white font-headline text-xl sm:text-2xl font-bold">
                Complejo Acuático
              </h3>
            </div>
          </div>

          {/* 2. Campos Deportivos (Cancha) - col-span-2, row-span-1 */}
          <div className="col-span-2 md:col-span-2 rounded-[1.5rem] overflow-hidden relative group shadow-sm cursor-pointer">
            <img
              loading="lazy"
              alt="Campos deportivos del colegio"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={stadium}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5 sm:p-6">
              <h3 className="text-white font-headline text-lg sm:text-xl font-bold">
                Campos Deportivos
              </h3>
            </div>
          </div>

          {/* 3. Laboratorios STEAM (Laboratorio) - col-span-1, row-span-1 */}
          <div className="col-span-1 rounded-[1.5rem] overflow-hidden relative group shadow-sm cursor-pointer">
            <img
              loading="lazy"
              alt="Laboratorio de ciencias STEAM"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={lab}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 sm:p-6">
              <h3 className="text-white font-headline text-base sm:text-lg font-bold">
                Laboratorios STEAM
              </h3>
            </div>
          </div>

          {/* 4. Botón Tarjeta "Galería Completa" - col-span-1, row-span-1 */}
          <div
            onClick={onGalleryClick}
            onKeyDown={
              onGalleryClick
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onGalleryClick(e);
                    }
                  }
                : undefined
            }
            role="button"
            tabIndex={0}
            className="col-span-1 rounded-[1.5rem] overflow-hidden relative group bg-tertiary-container flex flex-col items-center justify-center text-center p-4 sm:p-6 text-on-tertiary-container hover:bg-tertiary-fixed transition-all duration-300 cursor-pointer shadow-sm border border-tertiary-container/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon
              name="photo_library"
              className="text-3xl sm:text-4xl mb-2 text-tertiary"
            />
            <h3 className="font-headline font-bold text-sm sm:text-lg">
              Galería Completa
            </h3>
            <p className="text-tertiary-dim text-xs sm:text-sm mt-1">Ver más</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCampus;
