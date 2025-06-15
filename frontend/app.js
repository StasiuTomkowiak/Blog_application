// React Hooks and Context
const { useState, useEffect, useContext, createContext } = React;

// Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';
const AuthContext = createContext();

// API Service
class ApiService {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('auth_token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (token && !endpoint.includes('/auth/')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                }
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return null;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to the server.');
            }
            throw error;
        }
    }

    static async get(endpoint) { return this.request(endpoint); }
    static async post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
    static async put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
    static async delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
}

// UI Components
const Loading = () => (
    <div className="loading-container">
        <div className="loading-spinner"></div>
    </div>
);

const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;
    return (
        <div className="alert alert-error">
            <span>{error}</span>
            {onClose && (
                <button onClick={onClose} className="alert-close">×</button>
            )}
        </div>
    );
};

const SuccessAlert = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="alert alert-success">
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="alert-close">×</button>
            )}
        </div>
    );
};

// Navigation Component
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
                            Dark Blog
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

// Home View
const HomeView = () => {
    const [recentPosts, setRecentPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsData, categoriesData] = await Promise.all([
                    ApiService.get('/posts'),
                    ApiService.get('/categories')
                ]);
                setRecentPosts(postsData.slice(0, 6));
                setCategories(categoriesData.slice(0, 4));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePostClick = (postId) => {
        const event = new CustomEvent('navigate', { detail: { view: 'post-detail', postId } });
        window.dispatchEvent(event);
    };

    if (loading) return <Loading />;

    return (
        <div className="container fade-in">
            <ErrorAlert error={error} onClose={() => setError('')} />
            
            <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6" style={{
                    background: 'linear-gradient(to right, #9333ea, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Welcome to Dark Blog
                </h1>
                <p className="text-xl" style={{ 
                    color: 'var(--text-muted-dark)', 
                    maxWidth: '42rem', 
                    margin: '0 auto' 
                }}>
                    Discover amazing articles and insights in our beautifully crafted dark-themed blog
                </p>
            </div>

            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
                <div className="grid grid-3">
                    {recentPosts.map(post => (
                        <div 
                            key={post.id} 
                            className="card card-hover fade-in" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePostClick(post.id)}
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-3">
                                    <span style={{
                                        backgroundColor: '#f3e8ff',
                                        color: '#7c3aed',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px'
                                    }}>
                                        {post.category?.name}
                                    </span>
                                    <span style={{ 
                                        marginLeft: 'auto', 
                                        fontSize: '0.875rem', 
                                        color: 'var(--text-muted-dark)' 
                                    }}>
                                        {post.readingTime} min read
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold mb-3" style={{
                                    transition: 'color 0.3s ease'
                                }}>
                                    {post.title}
                                </h3>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-muted-dark)' }}>
                                    {post.content.substring(0, 120)}...
                                </p>
                                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                                    <span>By {post.author?.name}</span>
                                    <span style={{ color: 'var(--purple-600)' }}>Read more →</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold mb-8">Categories</h2>
                <div className="grid grid-4">
                    {categories.map(category => (
                        <div 
                            key={category.id} 
                            className="card-hover text-center p-6"
                            style={{
                                background: 'linear-gradient(to bottom right, #a855f7, #2563eb)',
                                color: 'white',
                                borderRadius: '0.75rem'
                            }}
                        >
                            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                            <p className="text-sm" style={{ color: '#e9d5ff' }}>{category.postCount} posts</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

// Post Detail View
const PostDetailView = ({ postId, onBack }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await ApiService.get(`/posts/${postId}`);
                setPost(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPost();
    }, [postId]);

    if (loading) return <Loading />;
    if (error) {
        return (
            <div className="container">
                <ErrorAlert error={error} onClose={() => setError('')} />
                <button onClick={onBack} className="btn btn-secondary">← Back</button>
            </div>
        );
    }
    if (!post) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container fade-in">
            <button onClick={onBack} className="btn btn-secondary mb-6" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>←</span><span>Back to Posts</span>
            </button>

            <article className="card" style={{ overflow: 'hidden' }}>
                <div style={{
                    background: 'linear-gradient(to right, #9333ea, #2563eb)',
                    padding: '2rem',
                    color: 'white'
                }}>
                    <div className="flex items-center mb-4">
                        <span style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            fontSize: '0.875rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px'
                        }}>
                            {post.category?.name}
                        </span>
                        <span style={{ marginLeft: 'auto', color: '#e9d5ff' }}>
                            {post.readingTime} min read
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    <div className="flex items-center justify-between" style={{ color: '#e9d5ff' }}>
                        <div className="flex items-center gap-4">
                            <span>By {post.author?.name}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                        </div>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: post.status === 'PUBLISHED' ? '#16a34a' : '#ca8a04',
                            color: 'white'
                        }}>
                            {post.status}
                        </span>
                    </div>
                </div>

                <div className="p-8">
                    <div style={{ maxWidth: 'none' }}>
                        {post.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4" style={{ 
                                lineHeight: '1.75', 
                                color: 'var(--text-muted-dark)' 
                            }}>
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {post.tags && post.tags.length > 0 && (
                        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border-dark)' }}>
                            <h3 className="text-sm font-medium mb-3">Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span 
                                        key={tag.id} 
                                        style={{
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </div>
    );
};

// Posts View
const PostsView = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPosts = async (categoryId = '') => {
        setLoading(true);
        try {
            const endpoint = categoryId ? `/posts?categoryId=${categoryId}` : '/posts';
            const data = await ApiService.get(endpoint);
            setPosts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoriesData = await ApiService.get('/categories');
                setCategories(categoriesData);
                await fetchPosts();
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        fetchPosts(categoryId);
    };

    const handlePostClick = (postId) => {
        const event = new CustomEvent('navigate', { detail: { view: 'post-detail', postId } });
        window.dispatchEvent(event);
    };

    if (loading) return <Loading />;

    return (
        <div className="container fade-in">
            <ErrorAlert error={error} onClose={() => setError('')} />
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">All Posts</h1>
                <select 
                    value={selectedCategory} 
                    onChange={(e) => handleCategoryChange(e.target.value)} 
                    className="form-select"
                    style={{ maxWidth: '300px' }}
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-3">
                {posts.map(post => (
                    <article 
                        key={post.id} 
                        className="card card-hover fade-in" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handlePostClick(post.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <span style={{
                                    backgroundColor: '#dbeafe',
                                    color: '#1e40af',
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px'
                                }}>
                                    {post.category?.name}
                                </span>
                                <span style={{ 
                                    marginLeft: 'auto', 
                                    fontSize: '0.875rem', 
                                    color: 'var(--text-muted-dark)' 
                                }}>
                                    {post.readingTime} min read
                                </span>
                            </div>
                            <h2 className="text-xl font-semibold mb-3">
                                {post.title}
                            </h2>
                            <p className="mb-4" style={{ color: 'var(--text-muted-dark)' }}>
                                {post.content.substring(0, 150)}...
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                                    By {post.author?.name}
                                </span>
                                <div className="flex gap-2">
                                    {post.tags?.slice(0, 2).map(tag => (
                                        <span 
                                            key={tag.id} 
                                            style={{
                                                backgroundColor: '#f3f4f6',
                                                color: '#4b5563',
                                                fontSize: '0.75rem',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '9999px'
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3" style={{ 
                                color: 'var(--purple-600)', 
                                fontSize: '0.875rem' 
                            }}>
                                Read full article →
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {posts.length === 0 && !loading && (
                <div className="text-center" style={{ padding: '4rem 0' }}>
                    <p style={{ color: 'var(--text-muted-dark)', fontSize: '1.125rem' }}>
                        No posts found.
                    </p>
                </div>
            )}
        </div>
    );
};

// Categories View
const CategoriesView = () => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            const data = await ApiService.get('/categories');
            setCategories(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            await ApiService.post('/categories', { name: newCategoryName });
            setNewCategoryName('');
            setSuccess('Category created successfully!');
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateCategory = async (id, name) => {
        try {
            await ApiService.put(`/categories/${id}`, { name });
            setEditingCategory(null);
            setSuccess('Category updated successfully!');
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await ApiService.delete(`/categories/${id}`);
            setSuccess('Category deleted successfully!');
            fetchCategories();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="container fade-in">
            <ErrorAlert error={error} onClose={() => setError('')} />
            <SuccessAlert message={success} onClose={() => setSuccess('')} />
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Categories</h1>
            </div>

            {user && (
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
                    <form onSubmit={handleCreateCategory} className="flex gap-4">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category name"
                            className="form-input"
                            style={{ flex: 1 }}
                            required
                        />
                        <button type="submit" className="btn btn-primary">
                            Add Category
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-3">
                {categories.map(category => (
                    <div key={category.id} className="card card-hover p-6">
                        {editingCategory === category.id ? (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleUpdateCategory(category.id, formData.get('name'));
                            }}>
                                <input
                                    name="name"
                                    defaultValue={category.name}
                                    className="form-input mb-4"
                                    required
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="btn btn-success text-sm">Save</button>
                                    <button type="button" onClick={() => setEditingCategory(null)} className="btn btn-secondary text-sm">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                                <p className="mb-4" style={{ color: 'var(--text-muted-dark)' }}>
                                    {category.postCount} posts
                                </p>
                                {user && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingCategory(category.id)} className="btn btn-warning text-sm">Edit</button>
                                        <button onClick={() => handleDeleteCategory(category.id)} className="btn btn-danger text-sm">Delete</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center" style={{ padding: '4rem 0' }}>
                    <p style={{ color: 'var(--text-muted-dark)', fontSize: '1.125rem' }}>
                        No categories found.
                    </p>
                </div>
            )}
        </div>
    );
};

// Tags View
const TagsView = () => {
    const { user } = useContext(AuthContext);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newTagNames, setNewTagNames] = useState('');

    const fetchTags = async () => {
        try {
            const data = await ApiService.get('/tags');
            setTags(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleCreateTags = async (e) => {
        e.preventDefault();
        if (!newTagNames.trim()) return;

        const names = newTagNames.split(',').map(name => name.trim()).filter(name => name);
        
        try {
            await ApiService.post('/tags', { names });
            setNewTagNames('');
            setSuccess('Tags created successfully!');
            fetchTags();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteTag = async (id) => {
        if (!confirm('Are you sure you want to delete this tag?')) return;

        try {
            await ApiService.delete(`/tags/${id}`);
            setSuccess('Tag deleted successfully!');
            fetchTags();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="container fade-in">
            <ErrorAlert error={error} onClose={() => setError('')} />
            <SuccessAlert message={success} onClose={() => setSuccess('')} />
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Tags</h1>
            </div>

            {user && (
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Tags</h2>
                    <form onSubmit={handleCreateTags} className="flex gap-4">
                        <input
                            type="text"
                            value={newTagNames}
                            onChange={(e) => setNewTagNames(e.target.value)}
                            placeholder="Tag names (comma separated)"
                            className="form-input"
                            style={{ flex: 1 }}
                            required
                        />
                        <button type="submit" className="btn btn-primary">
                            Add Tags
                        </button>
                    </form>
                    <p className="text-sm mt-3" style={{ color: 'var(--text-muted-dark)' }}>
                        Separate multiple tags with commas
                    </p>
                </div>
            )}

            <div className="flex flex-wrap gap-4">
                {tags.map(tag => (
                    <div key={tag.id} className="card card-hover p-4 flex items-center gap-4">
                        <div>
                            <h3 className="font-medium">#{tag.name}</h3>
                            <p className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                                {tag.postCount} posts
                            </p>
                        </div>
                        {user && (
                            <button onClick={() => handleDeleteTag(tag.id)} className="btn btn-danger text-sm">×</button>
                        )}
                    </div>
                ))}
            </div>

            {tags.length === 0 && (
                <div className="text-center" style={{ padding: '4rem 0' }}>
                    <p style={{ color: 'var(--text-muted-dark)', fontSize: '1.125rem' }}>
                        No tags found.
                    </p>
                </div>
            )}
        </div>
    );
};

// Dashboard View
const DashboardView = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [draftPosts, setDraftPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const fetchData = async () => {
        try {
            const [postsData, draftsData, categoriesData, tagsData] = await Promise.all([
                ApiService.get('/posts'),
                ApiService.get('/posts/drafts'),
                ApiService.get('/categories'),
                ApiService.get('/tags')
            ]);
            setPosts(postsData);
            setDraftPosts(draftsData);
            setCategories(categoriesData);
            setTags(tagsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCreatePost = async (formData) => {
        try {
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                categoryId: formData.get('categoryId'),
                status: formData.get('status'),
                tagIds: Array.from(formData.getAll('tagIds'))
            };
            
            await ApiService.post('/posts', postData);
            setSuccess('Post created successfully!');
            setShowCreateForm(false);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdatePost = async (id, formData) => {
        try {
            const postData = {
                id,
                title: formData.get('title'),
                content: formData.get('content'),
                categoryId: formData.get('categoryId'),
                status: formData.get('status'),
                tagIds: Array.from(formData.getAll('tagIds'))
            };
            
            await ApiService.put(`/posts/${id}`, postData);
            setSuccess('Post updated successfully!');
            setEditingPost(null);
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePost = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await ApiService.delete(`/posts/${id}`);
            setSuccess('Post deleted successfully!');
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!user) {
        return (
            <div className="container text-center fade-in" style={{ padding: '4rem 1rem' }}>
                <div className="card p-8">
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p style={{ color: 'var(--text-muted-dark)' }}>
                        Please log in to access the dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return <Loading />;

    const PostForm = ({ post = null, onSubmit, onCancel }) => (
        <div className="card p-6 mb-8 fade-in">
            <h3 className="text-xl font-semibold mb-6">{post ? 'Edit Post' : 'Create New Post'}</h3>
            
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                onSubmit(formData);
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input 
                            name="title" 
                            type="text" 
                            defaultValue={post?.title || ''} 
                            className="form-input" 
                            placeholder="Enter post title..."
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea 
                            name="content" 
                            rows="8" 
                            defaultValue={post?.content || ''} 
                            className="form-textarea" 
                            placeholder="Write your post content here..."
                            required 
                        />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select 
                                name="categoryId" 
                                defaultValue={post?.category?.id || ''} 
                                className="form-select" 
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select 
                                name="status" 
                                defaultValue={post?.status || 'DRAFT'} 
                                className="form-select"
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Tags</label>
                        <div className="tags-container">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '0.5rem'
                            }}>
                                {tags.map(tag => (
                                    <label key={tag.id} className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            name="tagIds" 
                                            value={tag.id} 
                                            defaultChecked={post?.tags?.some(t => t.id === tag.id)}
                                        />
                                        <span className="text-sm">{tag.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4 mt-8">
                    <button type="submit" className="btn btn-primary">
                        {post ? 'Update Post' : 'Create Post'}
                    </button>
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="container fade-in">
            <ErrorAlert error={error} onClose={() => setError('')} />
            <SuccessAlert message={success} onClose={() => setSuccess('')} />
            
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <button 
                    onClick={() => setShowCreateForm(!showCreateForm)} 
                    className="btn btn-primary"
                >
                    {showCreateForm ? 'Cancel' : 'Create New Post'}
                </button>
            </div>

            {showCreateForm && (
                <PostForm onSubmit={handleCreatePost} onCancel={() => setShowCreateForm(false)} />
            )}

            {editingPost && (
                <PostForm 
                    post={editingPost} 
                    onSubmit={(formData) => handleUpdatePost(editingPost.id, formData)} 
                    onCancel={() => setEditingPost(null)} 
                />
            )}

            {draftPosts.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6">Draft Posts</h2>
                    <div className="grid grid-2">
                        {draftPosts.map(post => (
                            <div 
                                key={post.id} 
                                className="card card-hover p-6"
                                style={{
                                    backgroundColor: '#fefce8',
                                    border: '1px solid #fbbf24'
                                }}
                            >
                                <h3 className="font-medium mb-3">{post.title}</h3>
                                <p className="text-sm mb-4" style={{ color: 'var(--text-muted-dark)' }}>
                                    {post.content.substring(0, 120)}...
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setEditingPost(post)} 
                                        className="btn btn-warning text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePost(post.id)} 
                                        className="btn btn-danger text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-2xl font-semibold mb-6">All Posts</h2>
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post.id}>
                                        <td>
                                            <div className="text-sm font-medium">{post.title}</div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                                                {post.readingTime} min read
                                            </div>
                                        </td>
                                        <td>{post.category?.name}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex',
                                                padding: '0.25rem 0.75rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                borderRadius: '9999px',
                                                backgroundColor: post.status === 'PUBLISHED' ? '#dcfce7' : '#fef3c7',
                                                color: post.status === 'PUBLISHED' ? '#166534' : '#92400e'
                                            }}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => setEditingPost(post)} 
                                                className="table-action-btn edit"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePost(post.id)} 
                                                className="table-action-btn delete"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Login View
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

// Auth Provider
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

    if (loading) return <Loading />;

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Main App
const App = () => {
    const [currentView, setCurrentView] = useState('home');
    const [postId, setPostId] = useState(null);

    useEffect(() => {
        const handleNavigation = (e) => {
            if (typeof e.detail === 'object' && e.detail.view === 'post-detail') {
                setCurrentView('post-detail');
                setPostId(e.detail.postId);
            } else {
                setCurrentView(e.detail);
                setPostId(null);
            }
        };

        window.addEventListener('navigate', handleNavigation);
        return () => window.removeEventListener('navigate', handleNavigation);
    }, []);

    const renderCurrentView = () => {
        switch (currentView) {
            case 'home': return <HomeView />;
            case 'posts': return <PostsView />;
            case 'post-detail': return <PostDetailView postId={postId} onBack={() => { const event = new CustomEvent('navigate', { detail: 'posts' }); window.dispatchEvent(event); }} />;
            case 'categories': return <CategoriesView />;
            case 'tags': return <TagsView />;
            case 'dashboard': return <DashboardView />;
            case 'login': return <LoginView />;
            default: return <HomeView />;
        }
    };

    return (
        <AuthProvider>
            <div className="main-layout">
                <Navigation />
                <main className="main-content">
                    {renderCurrentView()}
                </main>
                <footer className="footer">
                    <div className="footer-content">
                        <p>&copy; 2025 Dark Blog. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </AuthProvider>
    );
};

// Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-card">
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">{this.state.error?.message}</p>
                        <button onClick={() => window.location.reload()} className="error-button">
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Render the app with React 18
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);