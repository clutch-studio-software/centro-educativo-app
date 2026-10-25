import React from 'react';

/**
 * Componente GalleryCard (Molécula)
 * Representa una tarjeta flexible en el Bento Grid de la Galería.
 * Puede funcionar como una tarjeta de imagen estándar con efectos visuales premium (gradientes, zoom)
 * o bien renderizar contenido personalizado (como el bloque de "+50 Espacios").
 * 
 * @param {string} title - Título que se muestra sobre la imagen.
 * @param {string} image - URL de la imagen de fondo.
 * @param {string} altText - Texto alternativo para la imagen (accesibilidad).
 * @param {string} badgeText - Texto opcional para la píldora superior.
 * @param {string} badgeBgClass - Clase CSS para el fondo del badge (Tailwind).
 * @param {string} badgeTextClass - Clase CSS para el texto del badge (Tailwind).
 * @param {string} spanClass - Clases de posicionamiento y tamaño en la cuadrícula (ej. 'col-span-2 row-span-2').
 * @param {React.ReactNode} children - Si se provee, reemplaza el renderizado de la imagen y actúa como contenido a medida.
 */
const GalleryCard = ({
  title,
  image,
  altText = '',
  badgeText = '',
  badgeBgClass = 'bg-secondary-container text-on-secondary-container',
  badgeTextClass = 'font-label text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block',
  spanClass = 'col-span-1',
  onClick,
  children
}) => {
  
  // Si se pasa children, asumimos que es una tarjeta de contenido personalizado (ej. "+50 Espacios")
  if (children) {
    return (
      <div 
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e);
                }
              }
            : undefined
        }
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={`${spanClass} relative rounded-xl overflow-hidden group bg-surface-container-low cursor-pointer`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${spanClass} relative rounded-xl overflow-hidden group bg-surface-container-low cursor-pointer`}
    >
      {/* Imagen con animación de escala al hacer hover */}
      {image && (
        <img
          loading="lazy"
          src={image}
          alt={altText || title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Capa de degradado oscuro inferior para asegurar la legibilidad del texto blanco */}
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent"></div>

      {/* Contenido en la esquina inferior izquierda */}
      <div className="absolute bottom-0 left-0 p-6 md:p-8 text-left z-10">
        {badgeText && (
          <span className={`${badgeBgClass} ${badgeTextClass}`}>
            {badgeText}
          </span>
        )}
        <h2 className="font-headline text-xl md:text-2xl font-bold text-surface-container-lowest">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default GalleryCard;
