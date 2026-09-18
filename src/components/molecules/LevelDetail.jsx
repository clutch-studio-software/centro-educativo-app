import React from 'react';
import Icon from '../atoms/Icon';

/**
 * Componente LevelDetail (Molécula/Organismo)
 * Renderiza de forma asimétrica y responsiva la información detallada de un Nivel Educativo.
 * 
 * @param {string} badgeText - Texto superior de la píldora.
 * @param {string} badgeClass - Clases para el color del badge (Tailwind).
 * @param {string} icon - Nombre del icono de la píldora.
 * @param {string} title - Título principal (Pequeños Exploradores, etc.).
 * @param {string} subtitle - Nivel correspondiente (Nivel Inicial, etc.).
 * @param {string} description - Párrafo descriptivo.
 * @param {string} image - URL de la imagen.
 * @param {string} altText - Texto de accesibilidad para la imagen.
 * @param {boolean} imageLeft - Si es true, renderiza la imagen a la izquierda y el texto a la derecha.
 * @param {string} borderClass - Clase de borde asimétrico (asymmetric-border-1 o asymmetric-border-2).
 * @param {string} shadowClass - Clase de sombra de resplandor (ambient-shadow-primary, secondary, tertiary).
 * @param {Array} features - Listado de pilares/características del nivel.
 */
const LevelDetail = ({
  badgeText,
  badgeClass = 'bg-secondary-container/20 text-on-secondary-container',
  icon,
  title,
  description,
  image,
  altText = '',
  imageLeft = false,
  borderClass = 'asymmetric-border-1',
  shadowClass = 'ambient-shadow-secondary',
  features = []
}) => {

  // Bloque de texto
  const textBlock = (
    <div className={`space-y-6 text-left ${imageLeft ? 'lg:col-span-5 order-2' : 'lg:col-span-5 space-y-6 order-2 lg:order-1'}`}>
      <div className={`inline-flex items-center gap-2 ${badgeClass} px-4 py-1.5 rounded-full font-label text-label-md mb-2 select-none`}>
        <Icon name={icon} className="text-sm flex items-center justify-center" />
        <span>{badgeText}</span>
      </div>
      
      <h2 className="text-headline-lg font-bold font-headline text-on-surface">
        {title}
      </h2>
      
      <p className="text-body-lg text-on-surface-variant font-body leading-relaxed">
        {description}
      </p>
      
      {/* Listado de características mapeado de forma DRY */}
      {features.length > 0 && (
        <ul className="space-y-4 pt-4">
          {features.map((feature) => (
            <li key={feature.id || feature.title} className="flex items-start gap-3">
              <span className={`${feature.iconBgClass || 'bg-secondary-container/20'} ${feature.iconClass || 'text-secondary-fixed'} p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center`}>
                <Icon name={feature.icon} filled={true} className="text-base" />
              </span>
              <div>
                <h4 className="font-bold text-on-surface">{feature.title}</h4>
                <p className="text-sm text-on-surface-variant font-body mt-0.5 leading-relaxed">{feature.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Bloque de imagen
  const imageBlock = (
    <div
      className={`lg:col-span-7 ${imageLeft ? 'order-1' : 'order-1 lg:order-2'}`}
    >
      <div
        className={`relative w-full aspect-video lg:aspect-[4/3] rounded-[3rem] bg-surface-container-high overflow-hidden ${borderClass} ${shadowClass} ghost-border group cursor-pointer shadow-md`}
      >
        {image && (
          <img
            loading="lazy"
            alt={altText || title}
            src={image}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      {imageLeft ? imageBlock : textBlock}
      {imageLeft ? textBlock : imageBlock}
    </div>
  );
};

export default LevelDetail;
