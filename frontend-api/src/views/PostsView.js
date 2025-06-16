// views/PostsView.js - No Modules Format
const { useState, useEffect } = React;

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

window.PostsView = PostsView;