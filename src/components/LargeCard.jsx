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
    <div
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
          <span className="large-card-button">
            {buttonText}{' '}
            <span className="material-symbols-outlined icon">→</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default LargeCard;
