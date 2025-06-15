import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appName = import.meta.env.VITE_APP_NAME || 'Dark Blog';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-main">
          <p className="footer-copyright">
            &copy; {currentYear} {appName}. All rights reserved.
          </p>
          <div className="footer-meta">
            <span className="footer-version">v{appVersion}</span>
            <span className="footer-separator">•</span>
            <span className="footer-tech">Built with React & Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;