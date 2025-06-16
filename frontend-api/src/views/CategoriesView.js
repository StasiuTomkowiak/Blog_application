const { useState, useEffect, useContext } = React;

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
            if (err.message.includes('403')) {
                setError('Cannot delete category: This category is currently being used by one or more posts. Please remove it from all posts first.');
            } else if (err.message.includes('404')) {
                setError('Category not found - it may have already been deleted.');
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

window.CategoriesView = CategoriesView;