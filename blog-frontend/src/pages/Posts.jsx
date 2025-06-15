import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApi, useDebouncedApi } from '@hooks/useApi';
import { api } from '@services/api';
import { ROUTES, SORT_OPTIONS, PAGINATION } from '@utils/constants';
import Loading, { LoadingCard } from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';

const Posts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for filters and sorting
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('limit')) || PAGINATION.DEFAULT_PAGE_SIZE);

  // Get API parameters
  const getApiParams = useMemo(() => ({
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined,
    sort: sortBy,
    order: sortOrder,
    page: currentPage,
    limit: pageSize,
    status: 'PUBLISHED'
  }), [selectedCategory, searchQuery, sortBy, sortOrder, currentPage, pageSize]);

  // Fetch posts with current parameters
  const {
    data: postsResponse,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useApi(
    () => api.posts.getAll(getApiParams),
    [selectedCategory, searchQuery, sortBy, sortOrder, currentPage, pageSize],
    { 
      defaultData: { items: [], total: 0, totalPages: 0, currentPage: 1 },
      onSuccess: (data) => {
        console.log('✅ Posts loaded:', data.total || data.items?.length);
      }
    }
  );

  // Fetch categories for filter dropdown
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useApi(
    () => api.categories.getAll({ sort: 'name', order: 'asc' }),
    [],
    { 
      defaultData: [],
      onSuccess: (data) => {
        console.log('✅ Categories loaded for filter:', data.length);
      }
    }
  );

  // Destructure posts response
  const { items: posts = [], total = 0, totalPages = 0 } = postsResponse;

  // Update URL parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.set('category', selectedCategory);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'createdAt') params.set('sort', sortBy);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    if (pageSize !== PAGINATION.DEFAULT_PAGE_SIZE) params.set('limit', pageSize.toString());
    
    setSearchParams(params);
  }, [selectedCategory, searchQuery, sortBy, sortOrder, currentPage, pageSize, setSearchParams]);

  // Handlers
  const handlePostClick = (postId) => {
    navigate(ROUTES.POST_DETAIL(postId));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  const handleSortChange = (newSortBy, newSortOrder = sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
    setPageSize(PAGINATION.DEFAULT_PAGE_SIZE);
  };

  const hasActiveFilters = selectedCategory || searchQuery || sortBy !== 'createdAt' || sortOrder !== 'desc';

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate pagination range
  const generatePaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }
    
    return range;
  };

  const paginationRange = generatePaginationRange();

  if (postsLoading && currentPage === 1) {
    return (
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-48 h-8 bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      {/* Error Alert */}
      {(postsError || categoriesError) && (
        <ErrorAlert 
          error={postsError || categoriesError} 
          onClose={() => {
            refetchPosts();
          }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">All Posts</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted-dark)' }}>
            {total} {total === 1 ? 'post' : 'posts'} found
            {hasActiveFilters && ' with current filters'}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-6 mb-8">
        <div className="grid grid-2 gap-6 mb-6">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
              Search Posts
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by title or content..."
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-dark)' }}>
              Filter by Category
            </label>
            <select 
              id="category"
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)} 
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
              disabled={categoriesLoading}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.postCount || 0})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort and Display Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
                Sort by:
              </label>
              <select
                id="sort"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  handleSortChange(newSortBy, newSortOrder);
                }}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-purple-500"
              >
                {SORT_OPTIONS.POSTS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
                Per page:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-purple-500"
              >
                {PAGINATION.PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="btn btn-secondary text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      {postsLoading && currentPage > 1 && (
        <div className="text-center mb-4">
          <Loading size="small" text="Loading more posts..." />
        </div>
      )}

      <div className="grid grid-3 mb-8">
        {posts.map(post => (
          <article 
            key={post.id} 
            className="card card-hover fade-in" 
            style={{ cursor: 'pointer' }}
            onClick={() => handlePostClick(post.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePostClick(post.id);
              }
            }}
            aria-label={`Read article: ${post.title}`}
          >
            <div className="p-6">
              {/* Post Meta */}
              <div className="flex items-center mb-3">
                <span 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                  }}
                >
                  {post.category?.name}
                </span>
                <span 
                  className="ml-auto text-sm"
                  style={{ color: 'var(--text-muted-dark)' }}
                >
                  {post.readingTime || 5} min read
                </span>
              </div>
              
              {/* Post Title */}
              <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                {post.title}
              </h2>
              
              {/* Post Excerpt */}
              <p className="mb-4 line-clamp-3" style={{ color: 'var(--text-muted-dark)' }}>
                {post.excerpt || post.content?.substring(0, 150) + '...'}
              </p>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {post.tags.slice(0, 3).map(tag => (
                    <span 
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 rounded text-xs"
                      style={{
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted-dark)' }}>
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {/* Post Footer */}
              <div 
                className="flex items-center justify-between pt-4 border-t"
                style={{ 
                  color: 'var(--text-muted-dark)',
                  borderColor: 'var(--border-dark)'
                }}
              >
                <div className="flex items-center text-sm">
                  <span>By {post.author?.name || 'Anonymous'}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: 'var(--purple-600)' }}
                >
                  Read article →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {paginationRange.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minWidth: '40px' }}
            >
              {page}
            </button>
          ))}
          
          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !postsLoading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4" style={{ color: 'var(--text-muted-dark)' }}>
            📝
          </div>
          <h3 className="text-2xl font-semibold mb-4">No posts found</h3>
          <p style={{ color: 'var(--text-muted-dark)', marginBottom: '2rem' }}>
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters.'
              : 'No posts have been published yet.'
            }
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-primary">
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Posts;