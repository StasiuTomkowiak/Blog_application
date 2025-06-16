const { useState, useContext } = React;

const LoginView = () => {
    const { login } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.target);
        
        try {
            if (isLogin) {
                const loginData = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };
                
                const data = await ApiService.post('/auth/login', loginData);
                login(data.token);
                
                const event = new CustomEvent('navigate', { detail: 'dashboard' });
                window.dispatchEvent(event);
            } else {
                const signupData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password')
                };
                
                await ApiService.post('/auth/signin', signupData);
                setSuccess('Account created successfully! Please log in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #581c87, #1e3a8a, #3730a3)',
            padding: '3rem 1rem'
        }}>
            <div style={{ maxWidth: '28rem', width: '100%' }}>
                <div className="glass-effect" style={{
                    borderRadius: '1rem',
                    padding: '2rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold" style={{ color: 'white', marginBottom: '0.5rem' }}>
                            {isLogin ? 'Welcome Back' : 'Join Us'}
                        </h2>
                        <p style={{ color: '#e9d5ff' }}>
                            {isLogin ? 'Sign in to your account' : 'Create your account'}
                        </p>
                    </div>
                    
                    <ErrorAlert error={error} onClose={() => setError('')} />
                    <SuccessAlert message={success} onClose={() => setSuccess('')} />
                    
                    <form className="mt-8" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label" style={{ color: '#e5e7eb' }}>Full Name</label>
                                    <input 
                                        name="name" 
                                        type="text" 
                                        required={!isLogin} 
                                        minLength="3" 
                                        maxLength="50" 
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '0.5rem',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                        placeholder="Enter your full name" 
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#e5e7eb' }}>Email Address</label>
                                <input 
                                    name="email" 
                                    type="email" 
                                    required 
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    placeholder="Enter your email" 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: '#e5e7eb' }}>Password</label>
                                <input 
                                    name="password" 
                                    type="password" 
                                    required 
                                    minLength="6" 
                                    maxLength="100" 
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '0.5rem',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                    placeholder="Enter your password" 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                opacity: loading ? 0.5 : 1
                            }}
                        >
                            {loading ? (
                                <div className="loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }}></div>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>

                        <div className="text-center">
                            <button 
                                type="button" 
                                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#c4b5fd',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </button>
                        </div>
                    </form>

                    {isLogin && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(96, 165, 250, 0.3)'
                        }}>
                            <p style={{ fontSize: '0.875rem', color: '#bfdbfe' }}>
                                <strong>Demo credentials:</strong><br />
                                Email: user@gmail.com<br />
                                Password: 123456
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

window.LoginView = LoginView;