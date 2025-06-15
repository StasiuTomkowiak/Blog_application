import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  return (
    <div className={`loading-container ${className}`} role="status" aria-label={text}>
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <p className="loading-text" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );
};

// Loading skeleton for better UX
export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`loading-skeleton ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div 
        key={i} 
        className="loading-skeleton__line"
        style={{ 
          width: i === lines - 1 ? '60%' : '100%',
          animationDelay: `${i * 0.1}s`
        }}
      ></div>
    ))}
  </div>
);

// Loading card for post previews
export const LoadingCard = ({ className = '' }) => (
  <div className={`loading-card ${className}`}>
    <div className="loading-card__header">
      <div className="loading-skeleton__line loading-skeleton__line--short"></div>
      <div className="loading-skeleton__line loading-skeleton__line--tiny"></div>
    </div>
    <div className="loading-card__body">
      <div className="loading-skeleton__line"></div>
      <div className="loading-skeleton__line"></div>
      <div className="loading-skeleton__line loading-skeleton__line--short"></div>
    </div>
  </div>
);

export default Loading;