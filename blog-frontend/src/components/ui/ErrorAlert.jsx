import React, { useEffect, useState } from 'react';
import './Alert.css';

const ErrorAlert = ({ 
  error, 
  onClose, 
  autoClose = false, 
  autoCloseDelay = 5000,
  className = '',
  showIcon = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && error) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, error]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Wait for fade animation
  };

  if (!error || !isVisible) {
    return null;
  }

  return (
    <div 
      className={`alert alert--error ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="alert__content">
        {showIcon && (
          <div className="alert__icon">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        )}
        <div className="alert__message">
          <p>{error}</p>
        </div>
      </div>
      {onClose && (
        <button 
          onClick={handleClose}
          className="alert__close"
          aria-label="Close alert"
          type="button"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;