import React from 'react';
import Icon from '../atoms/Icon';
import { images } from '../../services/imagesConfig';
/**
 * Componente HomeLevels (Organismo)
 * Cuadrícula Bento para mostrar los Niveles Educativos (Inicial, Primaria, Secundaria).
 *
 * @param {Function} onExploreLevels - Callback para navegar a los detalles de los niveles.
 */
const HomeLevels = ({ onExploreLevels }) => {
  return (
    <section className="max-w-7xl mx-auto px-6 text-left">
      <div className="text-center mb-16 animate-in fade-in duration-500">
        <h2 className="text-4xl md:text-5xl font-extrabold text-primary font-headline mb-4">
          Niveles Educativos
        </h2>
        <p className="text-lg text-on-surface-variant font-body max-w-2xl mx-auto">
          Un camino continuo de descubrimiento desde los primeros pasos hasta la
          preparación universitaria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[400px] animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* 1. Nivel Inicial (col-span-2) */}
        <div
          onClick={onExploreLevels}
          onKeyDown={
            onExploreLevels
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onExploreLevels(e);
                  }
                }
              : undefined
          }
          role="button"
          tabIndex={0}
          className="bg-secondary-container rounded-[2rem] p-6 sm:p-8 min-h-[380px] md:min-h-0 relative overflow-hidden group shadow-[0_20px_40px_rgba(172,248,71,0.15)] hover:shadow-[0_20px_40px_rgba(172,248,71,0.3)] hover:-translate-y-1 transition-all md:col-span-2 cursor-pointer border border-secondary-container/10"
        >
          <div className="absolute inset-0 z-0">
            <img
              loading="lazy"
              alt="Nivel Inicial"
              className="w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-[1.03] opacity-90 transition-transform duration-700"
              src={images.nivelInicial}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-container via-secondary-container/90 to-transparent"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center max-w-md">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md transition-transform duration-300 group-hover:scale-105">
              <Icon name="child_care" className="text-secondary text-3xl" />
            </div>
            <h3 className="text-3xl font-extrabold text-on-secondary-container font-headline mb-3">
              Nivel Inicial
            </h3>
            <p className="text-on-secondary-container/80 font-body mb-6 text-base md:text-lg leading-relaxed">
              Donde la curiosidad natural florece. Ambientes diseñados para la
              exploración segura y el desarrollo psicomotriz.
            </p>
            <span className="text-secondary-dim font-extrabold flex items-center gap-2 hover:gap-4 transition-all w-fit font-headline">
              Explorar Inicial{' '}
              <Icon
                name="arrow_forward"
                className="text-lg font-bold flex items-center"
              />
            </span>
          </div>
        </div>

        {/* 2. Nivel Primario (col-span-1) */}
        <div
          onClick={onExploreLevels}
          onKeyDown={
            onExploreLevels
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onExploreLevels(e);
                  }
                }
              : undefined
          }
          role="button"
          tabIndex={0}
          className="bg-tertiary-container rounded-[2rem] p-6 sm:p-8 min-h-[380px] md:min-h-0 relative overflow-hidden group shadow-[0_20px_40px_rgba(255,149,90,0.15)] hover:shadow-[0_20px_40px_rgba(255,149,90,0.3)] hover:-translate-y-1 transition-all cursor-pointer border border-tertiary-container/10"
        >
          <div className="absolute inset-0 z-0">
            <img
              loading="lazy"
              alt="Nivel Primario"
              className="w-full h-full object-cover opacity-10 mix-blend-overlay group-hover:scale-[1.01] opacity-20 group-hover:opacity-60 transition-opacity"
              src={images.primaria}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container to-tertiary-fixed-dim opacity-10 group-hover:opacity-60 transition-opacity"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 shadow-md transition-transform duration-300 group-hover:scale-105">
                <Icon name="backpack" className="text-tertiary text-2xl" />
              </div>
              <h3 className="text-2xl font-extrabold text-on-tertiary-container font-headline mb-3">
                Nivel Primario
              </h3>
              <p className="text-on-tertiary-container/90 font-body text-sm md:text-base leading-relaxed">
                Construyendo bases sólidas en alfabetización, matemáticas y
                pensamiento crítico con metodologías activas.
              </p>
            </div>
            <span className="text-tertiary-dim font-extrabold flex items-center gap-2 hover:translate-x-2 transition-transform w-fit mt-4 font-headline">
              Saber más{' '}
              <Icon
                name="arrow_forward"
                className="text-lg font-bold flex items-center"
              />
            </span>
          </div>
        </div>

        {/* 3. Nivel Secundario (col-span-3, h-[300px]) */}
        <div
          onClick={onExploreLevels}
          className="bg-primary rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group shadow-[0_20px_40px_rgba(13,88,184,0.2)] hover:shadow-[0_20px_40px_rgba(13,88,184,0.35)] hover:-translate-y-1 transition-all md:col-span-3 min-h-[300px] md:h-[300px] cursor-pointer border border-primary/10"
        >
          <div className="absolute inset-0 z-0">
            <img
              loading="lazy"
              alt="Nivel Secundario"
              className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-[1.01] transition-transform duration-600"
              src={images.secundaria}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/95 to-transparent"></div>
          </div>

          <div className="relative z-10 h-full flex flex-col justify-end">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Icon name="school" className="text-white text-2xl" />
              </div>
              <h3 className="text-3xl font-extrabold text-white font-headline">
                Nivel Secundario
              </h3>
            </div>

            <div className="flex text-white flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
              <p className="text-white primary-fixed font-body max-w-2xl text-base md:text-lg leading-relaxed">
                Preparación pre-universitaria integral, enfoque en tecnología,
                liderazgo y proyectos de impacto social comunitario.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExploreLevels();
                }}
                className="bg-white text-primary font-headline font-bold px-6 py-3 rounded-full hover:bg-slate-50 transition-all shrink-0 shadow-md hover:shadow-lg cursor-pointer"
              >
                Ver Orientaciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLevels;
