const { useState, useEffect } = React;

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

window.PostDetailView = PostDetailView;