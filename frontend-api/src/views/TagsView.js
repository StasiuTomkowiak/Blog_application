const { useState, useEffect, useContext } = React;

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
            if (err.message.includes('403')) {
                setError('Cannot delete tag: This tag is currently being used by one or more posts. Please remove it from all posts first.');
            } else if (err.message.includes('404')) {
                setError('Tag not found - it may have already been deleted.');
            } else {
                setError(err.message);
            }
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

window.TagsView = TagsView;