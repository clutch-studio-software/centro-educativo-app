import React from 'react';
import Icon from '../atoms/Icon';

/**
 * Componente NewsCard (Molécula)
 * Permite mostrar una noticia destacada en formato de banner grande o una noticia secundaria horizontal.
 * 
 * @param {string} variant - Variación de diseño: 'featured' (destacada grande) | 'secondary' (horizontal estándar)
 * @param {string} title - Título del artículo.
 * @param {string} subtitle - Breve descripción o extracto del artículo.
 * @param {string} image - URL de la fotografía de portada.
 * @param {string} category - Etiqueta de la categoría (ej. 'Destacado', 'Institucional', 'Deportes').
 * @param {string} categoryClass - Clases Tailwind para estilizar la etiqueta de la categoría.
 * @param {string} buttonText - Texto a mostrar en el botón o enlace de lectura (ej. 'Leer más', 'Ver detalles').
 * @param {Function} onButtonClick - Callback disparado al pulsar el botón/enlace de la tarjeta.
 */
const NewsCard = ({
  variant = 'secondary',
  title,
  subtitle,
  image,
  category,
  categoryClass = '',
  buttonText = 'Leer más',
  onButtonClick,
  showDelete = false,
  onDeleteClick
}) => {

  const handleCardClick = () => {
    if (onButtonClick) onButtonClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  // 1. RENDER PARA NOTICIA DESTACADA (FEATURED)
  if (variant === 'featured') {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden group cursor-pointer border border-surface-container-highest shadow-md transition-all duration-300"
      >
        {/* Capa decorativa y gradiente de fondo */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/90 via-slate-950/40 to-transparent opacity-95 z-10 transition-opacity duration-300"></div>

        {image && (
          <img
            loading="lazy"
            alt={title}
            src={image}
            className="absolute inset-0 w-full h-full object-cover opacity-50 rounded-xl z-0 transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}

        {/* Delete Button for Admin */}
        {showDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDeleteClick) onDeleteClick();
            }}
            title="Eliminar Noticia"
            className="absolute top-6 right-6 z-30 p-2.5 bg-red-600/90 hover:bg-red-650 text-white rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 border-none cursor-pointer flex items-center justify-center"
          >
            <Icon name="delete" className="text-lg" />
          </button>
        )}

        <div className="relative z-20 h-full flex flex-col justify-end min-h-[400px] text-left">
          {category && (
            <span
              className={`${categoryClass || 'bg-tertiary-fixed text-on-tertiary-fixed'} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest self-start mb-4 shadow-sm select-none`}
            >
              {category}
            </span>
          )}

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight font-headline">
            {title}
          </h2>

          <p className="text-slate-100 text-sm md:text-base mb-6 max-w-2xl leading-relaxed font-body">
            {subtitle}
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="bg-white text-primary px-6 py-3 rounded-full font-bold w-max flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span>{buttonText}</span>
            <Icon name="arrow_forward" className="text-sm font-bold" />
          </button>
        </div>
      </article>
    );
  }

  // 2. RENDER PARA NOTICIA HORIZONTAL SECUNDARIA (SECONDARY)
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="md:col-span-6 bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-surface-container-highest hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left cursor-pointer relative"
    >
      {/* Delete Button for Admin */}
      {showDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteClick) onDeleteClick();
          }}
          title="Eliminar Noticia"
          className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-550 rounded-full transition-all shadow-sm hover:scale-105 active:scale-95 border border-slate-200/50 cursor-pointer flex items-center justify-center"
        >
          <Icon name="delete" className="text-sm" />
        </button>
      )}

      {image && (
        <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
          <img
            loading="lazy"
            alt={title}
            src={image}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="flex flex-col justify-between flex-grow min-w-0">
        <div>
          {category && (
            <span
              className={`text-xs font-bold uppercase tracking-widest ${categoryClass || 'text-primary'} mb-2.5 block select-none`}
            >
              {category}
            </span>
          )}
          <h3 className="text-xl font-bold text-on-surface mb-2 leading-tight font-headline truncate-2-lines">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 font-body">
            {subtitle}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className={`font-bold text-sm mt-4 inline-flex items-center gap-1 hover:underline w-max cursor-pointer ${categoryClass || 'text-secondary'}`}
        >
          <span>{buttonText}</span>
          <Icon name="chevron_right" className="text-[18px] font-bold" />
        </button>
      </div>
    </article>
  );
};

export default NewsCard;
