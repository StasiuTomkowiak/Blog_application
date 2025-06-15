import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@hooks/useApi';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { ROUTES, SUCCESS_MESSAGES, SORT_OPTIONS } from '@utils/constants';
import Loading from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';
import SuccessAlert from '@components/ui/SuccessAlert';

const Categories = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name-asc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Parse sort options
  const [sortField, sortOrder] = sortBy.split('-');

  // Fetch categories
  const {
    data: categories,
    loading,
    error: apiError,
    refetch
  } = useApi(
    () => api.categories.getAll({ 
      sort: sortField, 
      order: sortOrder 
    }),
    [sortField, sortOrder],
    { 
      defaultData: [],
      onSuccess: (data) => {
        console.log('✅ Categories loaded:', data.length);
      },
      onError: (error) => {
        setError(error.message);
      }
    }
  );

  // Create category
  const handleCreateCategory = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setError('');
      await api.categories.create({ 
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined
      });
      
      setNewCategoryName('');
      setNewCategoryDescription('');
      setSuccess(SUCCESS_MESSAGES.CATEGORY.CREATED);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [newCategoryName, newCategoryDescription, refetch]);

  // Update category
  const handleUpdateCategory = useCallback(async (id, data) => {
    try {
      setError('');
      await api.categories.update(id, data);
      setEditingCategory(null);
      setSuccess(SUCCESS_MESSAGES.CATEGORY.UPDATED);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [refetch]);

  // Delete category
  const handleDeleteCategory = useCallback(async (id, categoryName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setError('');
      await api.categories.delete(id);
      setSuccess(SUCCESS_MESSAGES.CATEGORY.DELETED);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [refetch]);

  // Navigate to posts by category
  const handleCategoryClick = useCallback((categoryId) => {
    navigate(`${ROUTES.POSTS}?category=${categoryId}`);
  }, [navigate]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  // Clear alerts
  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  // Category Card Component
  const CategoryCard = ({ category, onEdit, onDelete, onClick }) => {
    const isEditing = editingCategory === category.id;

    if (isEditing) {
      return (
        <div className="card p-6">
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onEdit(category.id, {
              name: formData.get('name'),
              description: formData.get('description') || undefined
            });
          }}>
            <div className="space-y-4">
              <div>
                <label htmlFor={`name-${category.id}`} className="form-label">Name</label>
                <input
                  id={`name-${category.id}`}
                  name="name"
                  type="text"
                  defaultValue={category.name}
                  className="form-input"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor={`description-${category.id}`} className="form-label">Description (Optional)</label>
                <textarea
                  id={`description-${category.id}`}
                  name="description"
                  defaultValue={category.description || ''}
                  className="form-textarea"
                  rows={3}
                  maxLength={200}
                  placeholder="Brief description of this category..."
                />
              </div>
              
              <div className="flex gap-2">
                <button type="submit" className="btn btn-success text-sm">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)} 
                  className="btn btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="card card-hover p-6">
        <div 
          className="cursor-pointer"
          onClick={() => onClick(category.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick(category.id);
            }
          }}
        >
          <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
          {category.description && (
            <p className="mb-3 text-sm line-clamp-2" style={{ color: 'var(--text-muted-dark)' }}>
              {category.description}
            </p>
          )}
          <p className="mb-4" style={{ color: 'var(--text-muted-dark)' }}>
            {category.postCount || 0} {category.postCount === 1 ? 'post' : 'posts'}
          </p>
        </div>
        
        {isAuthenticated && (
          <div className="flex gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-dark)' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditingCategory(category.id);
              }}
              className="btn btn-warning text-sm"
            >
              Edit
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id, category.name);
              }}
              className="btn btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-48 mb-8"></div>
          <div className="grid grid-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="card p-6">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      {/* Alerts */}
      <ErrorAlert error={error || apiError} onClose={clearError} />
      <SuccessAlert message={success} onClose={clearSuccess} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Categories</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted-dark)' }}>
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <label htmlFor="sort-categories" className="text-sm font-medium">Sort by:</label>
          <select
            id="sort-categories"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            {SORT_OPTIONS.CATEGORIES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Create Category Form */}
      {isAuthenticated && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Category</h2>
          <form onSubmit={handleCreateCategory}>
            <div className="grid grid-2 gap-6">
              <div>
                <label htmlFor="new-category-name" className="form-label">Category Name</label>
                <input
                  id="new-category-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
                  className="form-input"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label htmlFor="new-category-description" className="form-label">Description (Optional)</label>
                <input
                  id="new-category-description"
                  type="text"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Brief description..."
                  className="form-input"
                  maxLength={200}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!newCategoryName.trim()}
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-3">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleUpdateCategory}
              onDelete={handleDeleteCategory}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-6" style={{ color: 'var(--text-muted-dark)' }}>
            📁
          </div>
          <h3 className="text-2xl font-semibold mb-4">No Categories Found</h3>
          <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem' }}>
            {isAuthenticated 
              ? 'Create your first category to start organizing your posts.'
              : 'No categories have been created yet.'
            }
          </p>
          {isAuthenticated && (
            <button 
              onClick={() => document.getElementById('new-category-name')?.focus()}
              className="btn btn-primary"
            >
              Create First Category
            </button>
          )}
        </div>
      )}

      {/* Stats Section */}
      {categories.length > 0 && (
        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border-dark)' }}>
          <h2 className="text-xl font-semibold mb-6">Category Statistics</h2>
          <div className="grid grid-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {categories.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Total Categories
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Total Posts
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(categories.reduce((sum, cat) => sum + (cat.postCount || 0), 0) / categories.length) || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Avg Posts/Category
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {categories.filter(cat => (cat.postCount || 0) > 0).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Active Categories
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;