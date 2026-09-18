import React from 'react';
import '../styles/LargeCard.css';

const LargeCard = ({ image, title, subtitle, label, buttonText, onClick }) => {
  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <article
      className="large-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {image && (
        <img
          loading="lazy"
          alt={title}
          className="large-card-image"
          src={image}
        />
      )}
      <div className="large-card-overlay"></div>

      <div className="large-card-content">
        {label && <span className="large-card-label">{label}</span>}
        {title && <h2 className="large-card-title">{title}</h2>}
        {subtitle && <p className="large-card-subtitle">{subtitle}</p>}

        {buttonText && (
          <button
            className="large-card-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            {buttonText}{' '}
            <span className="material-symbols-outlined icon">→</span>
          </button>
        )}
      </div>
    </article>
  );
};

export default LargeCard;
