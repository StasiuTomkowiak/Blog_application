// contexts/AuthContext.js - No Modules Format
const { useState, useEffect, createContext } = React;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ email: payload.sub });
            } catch (err) {
                localStorage.removeItem('auth_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('auth_token', token);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ email: payload.sub });
        } catch (err) {
            console.error('Invalid token');
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        setUser(null);
        const event = new CustomEvent('navigate', { detail: 'home' });
        window.dispatchEvent(event);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Make globally available
window.AuthContext = AuthContext;
window.AuthProvider = AuthProvider;