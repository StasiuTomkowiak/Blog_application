const { useState, useEffect, useContext } = React;

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
                <PostForm 
                    onSubmit={handleCreatePost} 
                    onCancel={() => setShowCreateForm(false)}
                    categories={categories}
                    tags={tags}
                />
            )}

            {editingPost && (
                <PostForm 
                    post={editingPost} 
                    onSubmit={(formData) => handleUpdatePost(editingPost.id, formData)} 
                    onCancel={() => setEditingPost(null)}
                    categories={categories}
                    tags={tags}
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
                                    backgroundColor: 'var(--card-dark)',
                                    border: '1px solid var(--border-dark)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    backgroundColor: 'var(--yellow-600)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.25rem'
                                }}>
                                    DRAFT
                                </div>
                                <h3 className="font-medium mb-3 pr-16" style={{ color: 'var(--text-dark)' }}>
                                    {post.title}
                                </h3>
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

window.DashboardView = DashboardView;