// components/forms/PostForm.js - No Modules Format
const PostForm = ({ post = null, onSubmit, onCancel, categories = [], tags = [] }) => (
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

window.PostForm = PostForm;