import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@hooks/useApi';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { ROUTES, SUCCESS_MESSAGES, POST_STATUS } from '@utils/constants';
import Loading, { LoadingCard } from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';
import SuccessAlert from '@components/ui/SuccessAlert';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all posts for user dashboard
  const {
    data: allPosts,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useApi(
    () => api.posts.getAll(),
    [],
    { 
      defaultData: [],
      immediate: isAuthenticated,
      onSuccess: (data) => {
        console.log('✅ All posts loaded:', data.length);
        setPosts(data.filter(post => post.status === POST_STATUS.PUBLISHED));
      }
    }
  );

  // Fetch draft posts
  const {
    data: drafts,
    loading: draftsLoading,
    error: draftsError,
    refetch: refetchDrafts
  } = useApi(
    () => api.posts.getDrafts(),
    [],
    { 
      defaultData: [],
      immediate: isAuthenticated,
      onSuccess: (data) => {
        console.log('✅ Draft posts loaded:', data.length);
        setDraftPosts(data);
      }
    }
  );

  // Fetch categories for form
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError
  } = useApi(
    () => api.categories.getAll(),
    [],
    { 
      defaultData: [],
      immediate: isAuthenticated,
      onSuccess: (data) => {
        setCategories(data);
      }
    }
  );

  // Fetch tags for form
  const {
    data: tagsData,
    loading: tagsLoading,
    error: tagsLoadingError
  } = useApi(
    () => api.tags.getAll(),
    [],
    { 
      defaultData: [],
      immediate: isAuthenticated,
      onSuccess: (data) => {
        setTags(data);
      }
    }
  );

  // Create post handler
  const handleCreatePost = useCallback(async (formData) => {
    try {
      setError('');
      const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        categoryId: formData.get('categoryId'),
        status: formData.get('status'),
        tagIds: Array.from(formData.getAll('tagIds'))
      };
      
      await api.posts.create(postData);
      setSuccess(SUCCESS_MESSAGES.POST.CREATED);
      setShowCreateForm(false);
      refetchPosts();
      refetchDrafts();
    } catch (err) {
      setError(err.message);
    }
  }, [refetchPosts, refetchDrafts]);

  // Update post handler
  const handleUpdatePost = useCallback(async (id, formData) => {
    try {
      setError('');
      const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        categoryId: formData.get('categoryId'),
        status: formData.get('status'),
        tagIds: Array.from(formData.getAll('tagIds'))
      };
      
      await api.posts.update(id, postData);
      setSuccess(SUCCESS_MESSAGES.POST.UPDATED);
      setEditingPost(null);
      refetchPosts();
      refetchDrafts();
    } catch (err) {
      setError(err.message);
    }
  }, [refetchPosts, refetchDrafts]);

  // Delete post handler
  const handleDeletePost = useCallback(async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setError('');
      await api.posts.delete(id);
      setSuccess(SUCCESS_MESSAGES.POST.DELETED);
      refetchPosts();
      refetchDrafts();
    } catch (err) {
      setError(err.message);
    }
  }, [refetchPosts, refetchDrafts]);

  // Navigate to post detail
  const handleViewPost = useCallback((postId) => {
    navigate(ROUTES.POST_DETAIL(postId));
  }, [navigate]);

  // Clear alerts
  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="container text-center fade-in" style={{ padding: '4rem 1rem' }}>
        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem' }}>
            Please log in to access the dashboard.
          </p>
          <button 
            onClick={() => navigate(ROUTES.LOGIN)} 
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (postsLoading && draftsLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  // Post Form Component
  const PostForm = ({ post = null, onSubmit, onCancel }) => (
    <div className="card p-6 mb-8 fade-in">
      <h3 className="text-xl font-semibold mb-6">
        {post ? 'Edit Post' : 'Create New Post'}
      </h3>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        onSubmit(formData);
      }}>
        <div className="grid grid-2 gap-6 mb-6">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="post-title" className="form-label">Title</label>
            <input 
              id="post-title"
              name="title" 
              type="text" 
              defaultValue={post?.title || ''} 
              className="form-input" 
              placeholder="Enter post title..."
              required 
              minLength={3}
              maxLength={300}
            />
          </div>
          
          {/* Status */}
          <div className="form-group">
            <label htmlFor="post-status" className="form-label">Status</label>
            <select 
              id="post-status"
              name="status" 
              defaultValue={post?.status || POST_STATUS.DRAFT} 
              className="form-select"
            >
              <option value={POST_STATUS.DRAFT}>Draft</option>
              <option value={POST_STATUS.PUBLISHED}>Published</option>
            </select>
          </div>
        </div>
        
        {/* Content */}
        <div className="form-group">
          <label htmlFor="post-content" className="form-label">Content</label>
          <textarea 
            id="post-content"
            name="content" 
            rows="10" 
            defaultValue={post?.content || ''} 
            className="form-textarea" 
            placeholder="Write your post content here..."
            required 
            minLength={10}
            maxLength={60000}
          />
        </div>
        
        <div className="grid grid-2 gap-6 mb-6">
          {/* Category */}
          <div className="form-group">
            <label htmlFor="post-category" className="form-label">Category</label>
            <select 
              id="post-category"
              name="categoryId" 
              defaultValue={post?.category?.id || ''} 
              className="form-select" 
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (Optional)</label>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              border: '1px solid var(--border-dark)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              backgroundColor: 'var(--input-bg-dark)'
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
        
        <div className="flex gap-4">
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
      {/* Alerts */}
      <ErrorAlert 
        error={error || postsError || draftsError || categoriesError || tagsLoadingError} 
        onClose={clearError} 
      />
      <SuccessAlert message={success} onClose={clearSuccess} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted-dark)' }}>
            Welcome back, {user?.email}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : 'Create New Post'}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <PostForm 
          onSubmit={handleCreatePost} 
          onCancel={() => setShowCreateForm(false)} 
        />
      )}

      {/* Edit Form */}
      {editingPost && (
        <PostForm 
          post={editingPost} 
          onSubmit={(formData) => handleUpdatePost(editingPost.id, formData)} 
          onCancel={() => setEditingPost(null)} 
        />
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-4 mb-12">
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {posts.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
            Published Posts
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {draftPosts.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
            Draft Posts
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {categories.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
            Categories
          </div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {tags.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
            Tags
          </div>
        </div>
      </div>

      {/* Draft Posts Section */}
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
                  borderColor: '#fbbf24',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg" style={{ color: '#92400e' }}>
                    {post.title}
                  </h3>
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: '#fbbf24',
                      color: 'white'
                    }}
                  >
                    DRAFT
                  </span>
                </div>
                <p className="text-sm mb-4" style={{ color: '#a16207' }}>
                  {post.content.substring(0, 120)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#a16207' }}>
                    {post.readingTime || 5} min read
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingPost(post)} 
                      className="btn btn-warning text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id, post.title)} 
                      className="btn btn-danger text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Published Posts Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Published Posts</h2>
        
        {posts.length > 0 ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#374151' }}>
                    <th style={{ 
                      padding: '1rem 1.5rem', 
                      textAlign: 'left', 
                      color: 'var(--text-muted-dark)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Title
                    </th>
                    <th style={{ 
                      padding: '1rem 1.5rem', 
                      textAlign: 'left', 
                      color: 'var(--text-muted-dark)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Category
                    </th>
                    <th style={{ 
                      padding: '1rem 1.5rem', 
                      textAlign: 'left', 
                      color: 'var(--text-muted-dark)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Reading Time
                    </th>
                    <th style={{ 
                      padding: '1rem 1.5rem', 
                      textAlign: 'left', 
                      color: 'var(--text-muted-dark)',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div>
                          <div className="font-medium text-sm">{post.title}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted-dark)' }}>
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                        {post.category?.name}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                        {post.readingTime || 5} min
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewPost(post.id)} 
                            className="table-action-btn edit"
                            style={{ 
                              color: 'var(--blue-600)', 
                              textDecoration: 'underline',
                              fontSize: '0.875rem'
                            }}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => setEditingPost(post)} 
                            className="table-action-btn edit"
                            style={{ 
                              color: 'var(--indigo-600)', 
                              textDecoration: 'underline',
                              fontSize: '0.875rem'
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id, post.title)} 
                            className="table-action-btn delete"
                            style={{ 
                              color: 'var(--red-600)', 
                              textDecoration: 'underline',
                              fontSize: '0.875rem'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" style={{ color: 'var(--text-muted-dark)' }}>
              📝
            </div>
            <h3 className="text-xl font-semibold mb-4">No Published Posts</h3>
            <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem' }}>
              Create your first post to get started!
            </p>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="btn btn-primary"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;