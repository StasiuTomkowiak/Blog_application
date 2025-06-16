const { useState, useEffect } = React;

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
                    Welcome to Blog
                </h1>
                <p className="text-xl" style={{ 
                    color: 'var(--text-muted-dark)', 
                    maxWidth: '42rem', 
                    margin: '0 auto' 
                }}>
                    Discover amazing articles and insights in our blog
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

window.HomeView = HomeView;