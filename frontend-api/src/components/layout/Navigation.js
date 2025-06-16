// components/layout/Navigation.js - No Modules Format
const { useState, useEffect, useContext } = React;

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigation = (view) => {
        const event = new CustomEvent('navigate', { detail: view });
        window.dispatchEvent(event);
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="navigation">
            <div className="nav-container">
                <div className="nav-content">
                    <div className="nav-left">
                        <h1 className="nav-logo" onClick={() => handleNavigation('home')}>
                            Blog
                        </h1>
                        
                        <div className="nav-menu">
                            <button onClick={() => handleNavigation('home')} className="nav-button">
                                Home
                            </button>
                            <button onClick={() => handleNavigation('posts')} className="nav-button">
                                All Posts
                            </button>
                            <button onClick={() => handleNavigation('categories')} className="nav-button">
                                Categories
                            </button>
                            <button onClick={() => handleNavigation('tags')} className="nav-button">
                                Tags
                            </button>
                            {user && (
                                <button onClick={() => handleNavigation('dashboard')} className="nav-button">
                                    Dashboard
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="auth-section">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm">Welcome, {user.email}</span>
                                    <button onClick={logout} className="logout-button">
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => handleNavigation('login')} className="login-button">
                                    Login
                                </button>
                            )}
                        </div>

                        <button onClick={toggleMobileMenu} className="mobile-menu-button">
                            <div className="hamburger">
                                <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                                <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                                <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'closed'}`}>
                <div className="mobile-menu-content">
                    <button onClick={() => handleNavigation('home')} className="mobile-menu-item">
                        Home
                    </button>
                    <button onClick={() => handleNavigation('posts')} className="mobile-menu-item">
                        All Posts
                    </button>
                    <button onClick={() => handleNavigation('categories')} className="mobile-menu-item">
                        Categories
                    </button>
                    <button onClick={() => handleNavigation('tags')} className="mobile-menu-item">
                        Tags
                    </button>
                    
                    {user && (
                        <button onClick={() => handleNavigation('dashboard')} className="mobile-menu-item">
                            Dashboard
                        </button>
                    )}

                    <div className="mobile-menu-divider">
                        {user ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#e9d5ff' }}>
                                    Welcome, {user.email}
                                </div>
                                <button 
                                    onClick={() => {
                                        logout();
                                        setIsMobileMenuOpen(false);
                                    }} 
                                    className="mobile-menu-item"
                                    style={{ backgroundColor: '#ef4444' }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => handleNavigation('login')} 
                                className="mobile-menu-item"
                                style={{ backgroundColor: '#3b82f6' }}
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div 
                    className="mobile-overlay show"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </nav>
    );
};

// Make globally available
window.Navigation = Navigation;