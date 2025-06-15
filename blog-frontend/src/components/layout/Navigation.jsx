import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import './Navigation.css';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/', label: 'Home', exact: true },
    { to: '/posts', label: 'All Posts' },
    { to: '/categories', label: 'Categories' },
    { to: '/tags', label: 'Tags' },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : [])
  ];

  const isActiveLink = (to, exact = false) => {
    if (exact) {
      return location.pathname === to;
    }
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <nav className="navigation" role="navigation" aria-label="Main navigation">
        <div className="nav-container">
          <div className="nav-content">
            {/* Logo and Brand */}
            <div className="nav-left">
              <Link to="/" className="nav-logo" aria-label="Dark Blog - Go to homepage">
                <span className="nav-logo__text">Dark Blog</span>
              </Link>
              
              {/* Desktop Menu */}
              <div className="nav-menu" role="menubar">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-button ${isActiveLink(item.to, item.exact) ? 'nav-button--active' : ''}`}
                    role="menuitem"
                    aria-current={isActiveLink(item.to, item.exact) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="nav-right">
              {/* Desktop Auth Section */}
              <div className="auth-section">
                {isAuthenticated ? (
                  <div className="auth-user">
                    <span className="auth-user__greeting">
                      Welcome, <span className="auth-user__email">{user?.email}</span>
                    </span>
                    <button 
                      onClick={handleLogout} 
                      className="logout-button"
                      aria-label="Sign out"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="login-button">
                    Login
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="mobile-menu-button"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <div className="hamburger">
                  <span className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line--open' : ''}`}></span>
                  <span className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line--open' : ''}`}></span>
                  <span className={`hamburger-line ${isMobileMenuOpen ? 'hamburger-line--open' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu--open' : 'mobile-menu--closed'}`}
          role="menu"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="mobile-menu-content">
            {/* Mobile Navigation Items */}
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`mobile-menu-item ${isActiveLink(item.to, item.exact) ? 'mobile-menu-item--active' : ''}`}
                role="menuitem"
                aria-current={isActiveLink(item.to, item.exact) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="mobile-menu-divider">
              {isAuthenticated ? (
                <div className="mobile-auth">
                  <div className="mobile-auth__info">
                    <span className="mobile-auth__label">Signed in as:</span>
                    <span className="mobile-auth__email">{user?.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="mobile-menu-item mobile-menu-item--logout"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="mobile-menu-item mobile-menu-item--login"
                  role="menuitem"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navigation;