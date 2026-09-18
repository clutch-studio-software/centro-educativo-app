import React from 'react';
import Icon from '../atoms/Icon';

/**
 * Componente EventCard (Molécula)
 * Muestra información sobre un evento de calendario escolar.
 * 
 * @param {string} day - Día del mes (ej. '15').
 * @param {string} month - Nombre abreviado del mes (ej. 'Nov').
 * @param {string} title - Nombre del evento.
 * @param {string} info - Horario, ubicación o detalle descriptivo.
 * @param {string} icon - Nombre del icono de Material Symbols (ej. 'schedule', 'location_on', 'palette').
 * @param {string} dateBgClass - Clase de fondo Tailwind para el bloque de fecha (ej. 'bg-secondary-fixed text-on-secondary-fixed').
 * @param {string} glowClass - Clase de fondo Tailwind para el resplandor difuminado (ej. 'bg-secondary-container').
 * @param {Function} onClick - Callback al presionar sobre la tarjeta del evento.
 */
const EventCard = ({
  day,
  month,
  title,
  info,
  icon = 'schedule',
  dateBgClass = 'bg-primary-container text-on-primary-container',
  glowClass = 'bg-primary-container',
  onClick
}) => {
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
      className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:bg-surface-container-lowest hover:shadow-lg transition-all duration-300 border border-surface-container-highest cursor-pointer text-left"
    >
      {/* Resplandor decorativo desenfocado en hover en la esquina superior derecha */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${glowClass} rounded-full blur-3xl opacity-20 group-hover:opacity-40 -mr-10 -mt-10 transition-all duration-500`}></div>
      
      <div className="flex items-center gap-4 relative z-10">
        
        {/* Bloque de Calendario */}
        <div className={`${dateBgClass} w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm select-none flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
          <span className="text-lg leading-none font-extrabold">{day}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">{month}</span>
        </div>
        
        {/* Detalles del Evento */}
        <div className="min-w-0">
          <h3 className="font-extrabold text-base md:text-lg text-on-surface leading-snug group-hover:text-primary transition-colors duration-200 truncate">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-on-surface-variant flex items-center gap-1.5 mt-1 leading-none font-body">
            <Icon name={icon} className="text-sm font-semibold flex items-center justify-center" /> 
            <span className="truncate">{info}</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default EventCard;
