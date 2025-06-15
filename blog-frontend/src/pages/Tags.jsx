import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi, useDebouncedApi } from '@hooks/useApi';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { ROUTES, SUCCESS_MESSAGES, SORT_OPTIONS } from '@utils/constants';
import Loading from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';
import SuccessAlert from '@components/ui/SuccessAlert';

const Tags = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State
  const [newTagNames, setNewTagNames] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Parse sort options
  const [sortField, sortOrder] = sortBy.split('-');

  // Fetch all tags
  const {
    data: allTags,
    loading: allTagsLoading,
    error: apiError,
    refetch
  } = useApi(
    () => api.tags.getAll({ 
      sort: sortField, 
      order: sortOrder 
    }),
    [sortField, sortOrder],
    { 
      defaultData: [],
      onSuccess: (data) => {
        console.log('✅ Tags loaded:', data.length);
      },
      onError: (error) => {
        setError(error.message);
      }
    }
  );

  // Debounced search for tags
  const {
    data: searchResults,
    loading: searchLoading,
    debouncedValue: debouncedSearchQuery
  } = useDebouncedApi(
    (query) => query ? api.tags.search(query) : Promise.resolve([]),
    searchQuery,
    500,
    { 
      defaultData: [],
      immediate: false
    }
  );

  // Determine which tags to display
  const displayTags = searchQuery.trim() ? searchResults : allTags;
  const loading = searchQuery.trim() ? searchLoading : allTagsLoading;

  // Create tags
  const handleCreateTags = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newTagNames.trim()) {
      setError('Tag names are required');
      return;
    }

    const names = newTagNames
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates

    if (names.length === 0) {
      setError('Please enter valid tag names');
      return;
    }

    if (names.some(name => name.length < 2 || name.length > 30)) {
      setError('Tag names must be between 2 and 30 characters');
      return;
    }

    try {
      setError('');
      await api.tags.create({ names });
      setNewTagNames('');
      setSuccess(SUCCESS_MESSAGES.TAG.CREATED);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [newTagNames, refetch]);

  // Delete tag
  const handleDeleteTag = useCallback(async (id, tagName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the tag "#${tagName}"? This will remove it from all posts.`
    );
    
    if (!confirmed) return;

    try {
      setError('');
      await api.tags.delete(id);
      setSuccess(SUCCESS_MESSAGES.TAG.DELETED);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  }, [refetch]);

  // Navigate to posts by tag
  const handleTagClick = useCallback((tagId) => {
    navigate(`${ROUTES.POSTS}?tag=${tagId}`);
  }, [navigate]);

  // Handle sort change
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
  }, []);

  // Handle search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // Clear alerts
  const clearError = () => setError('');
  const clearSuccess = () => setSuccess('');

  // Tag popularity color
  const getTagColor = (postCount) => {
    if (postCount >= 10) return '#9333ea'; // Purple for very popular
    if (postCount >= 5) return '#2563eb';  // Blue for popular
    if (postCount >= 2) return '#16a34a';  // Green for moderate
    return '#6b7280'; // Gray for low usage
  };

  // Loading state
  if (allTagsLoading && !searchQuery) {
    return (
      <div className="container">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-48 mb-8"></div>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-600 rounded w-32"></div>
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
          <h1 className="text-4xl font-bold">Tags</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted-dark)' }}>
            {displayTags.length} {displayTags.length === 1 ? 'tag' : 'tags'} 
            {searchQuery && debouncedSearchQuery ? ` found for "${debouncedSearchQuery}"` : ' available'}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <div className="grid grid-2 gap-6">
          {/* Search Tags */}
          <div>
            <label htmlFor="search-tags" className="form-label">Search Tags</label>
            <input
              id="search-tags"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search tags by name..."
              className="form-input"
            />
            {searchLoading && (
              <div className="mt-2">
                <Loading size="small" text="Searching..." />
              </div>
            )}
          </div>

          {/* Sort Options */}
          <div>
            <label htmlFor="sort-tags" className="form-label">Sort by</label>
            <select
              id="sort-tags"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="form-select"
              disabled={searchQuery.trim().length > 0} // Disable sorting during search
            >
              {SORT_OPTIONS.TAGS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchQuery && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-dark)' }}>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="btn btn-secondary text-sm"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Create Tags Form */}
      {isAuthenticated && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Create New Tags</h2>
          <form onSubmit={handleCreateTags}>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-tag-names" className="form-label">Tag Names</label>
                <input
                  id="new-tag-names"
                  type="text"
                  value={newTagNames}
                  onChange={(e) => setNewTagNames(e.target.value)}
                  placeholder="Enter tag names separated by commas (e.g., react, javascript, tutorial)"
                  className="form-input"
                  required
                />
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted-dark)' }}>
                  Separate multiple tags with commas. Each tag should be 2-30 characters long.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!newTagNames.trim()}
                >
                  Create Tags
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tags Display */}
      {displayTags.length > 0 ? (
        <>
          {/* Tag Cloud */}
          <div className="flex flex-wrap gap-3 mb-8">
            {displayTags.map(tag => (
              <div 
                key={tag.id} 
                className="card card-hover p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => handleTagClick(tag.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTagClick(tag.id);
                  }
                }}
                style={{
                  borderColor: getTagColor(tag.postCount || 0),
                  borderWidth: '2px'
                }}
                aria-label={`View posts tagged with ${tag.name}`}
              >
                <div className="flex-1">
                  <h3 
                    className="font-medium text-lg"
                    style={{ color: getTagColor(tag.postCount || 0) }}
                  >
                    #{tag.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                    {tag.postCount || 0} {tag.postCount === 1 ? 'post' : 'posts'}
                  </p>
                  {tag.description && (
                    <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted-dark)' }}>
                      {tag.description}
                    </p>
                  )}
                </div>
                
                {isAuthenticated && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag.id, tag.name);
                    }}
                    className="btn btn-danger text-sm p-2"
                    title={`Delete tag #${tag.name}`}
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Popular Tags Section */}
          {!searchQuery && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Most Popular Tags</h2>
              <div className="grid grid-4">
                {allTags
                  .sort((a, b) => (b.postCount || 0) - (a.postCount || 0))
                  .slice(0, 8)
                  .map(tag => (
                    <div 
                      key={tag.id}
                      className="card card-hover p-4 text-center cursor-pointer"
                      onClick={() => handleTagClick(tag.id)}
                      style={{
                        background: `linear-gradient(135deg, ${getTagColor(tag.postCount || 0)}15, ${getTagColor(tag.postCount || 0)}25)`,
                        borderColor: getTagColor(tag.postCount || 0),
                        borderWidth: '1px'
                      }}
                    >
                      <h3 
                        className="font-semibold text-lg mb-2"
                        style={{ color: getTagColor(tag.postCount || 0) }}
                      >
                        #{tag.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                        {tag.postCount || 0} posts
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="text-6xl mb-6" style={{ color: 'var(--text-muted-dark)' }}>
            🏷️
          </div>
          <h3 className="text-2xl font-semibold mb-4">
            {searchQuery ? 'No Tags Found' : 'No Tags Available'}
          </h3>
          <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem' }}>
            {searchQuery ? (
              <>Try a different search term or browse all available tags.</>
            ) : isAuthenticated ? (
              <>Create your first tags to help organize and categorize your posts.</>
            ) : (
              <>No tags have been created yet.</>
            )}
          </p>
          {searchQuery ? (
            <button 
              onClick={() => setSearchQuery('')}
              className="btn btn-primary"
            >
              Show All Tags
            </button>
          ) : isAuthenticated && (
            <button 
              onClick={() => document.getElementById('new-tag-names')?.focus()}
              className="btn btn-primary"
            >
              Create First Tags
            </button>
          )}
        </div>
      )}

      {/* Tag Statistics */}
      {allTags.length > 0 && !searchQuery && (
        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border-dark)' }}>
          <h2 className="text-xl font-semibold mb-6">Tag Statistics</h2>
          <div className="grid grid-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {allTags.length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Total Tags
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {allTags.reduce((sum, tag) => sum + (tag.postCount || 0), 0)}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Total Usages
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(allTags.reduce((sum, tag) => sum + (tag.postCount || 0), 0) / allTags.length) || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Avg Uses/Tag
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {allTags.filter(tag => (tag.postCount || 0) > 0).length}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-muted-dark)' }}>
                Active Tags
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Legend */}
      {allTags.length > 0 && !searchQuery && (
        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--input-bg-dark)' }}>
          <h3 className="text-sm font-semibold mb-3">Tag Popularity Legend:</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9333ea' }}></div>
              <span>Very Popular (10+ posts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2563eb' }}></div>
              <span>Popular (5-9 posts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16a34a' }}></div>
              <span>Moderate (2-4 posts)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }}></div>
              <span>Low Usage (0-1 posts)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;