import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@hooks/useApi';
import { useAuth } from '@hooks/useAuth';
import { api } from '@services/api';
import { ROUTES, POST_STATUS } from '@utils/constants';
import Loading from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Fetch post details
  const {
    data: post,
    loading,
    error,
    refetch
  } = useApi(
    () => api.posts.getById(id),
    [id],
    {
      onSuccess: (data) => {
        console.log('✅ Post loaded:', data.title);
        // Update document title
        document.title = `${data.title} - Dark Blog`;
      },
      onError: (err) => {
        console.error('❌ Failed to load post:', err.message);
      }
    }
  );

  // Reset document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Dark Blog';
    };
  }, []);

  // Navigation handlers
  const handleBackToPosts = () => {
    navigate(ROUTES.POSTS);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`${ROUTES.POSTS}?category=${categoryId}`);
  };

  const handleTagClick = (tagName) => {
    navigate(`${ROUTES.POSTS}?search=${encodeURIComponent(tagName)}`);
  };

  const handleEditPost = () => {
    navigate(`${ROUTES.DASHBOARD}?edit=${id}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format content with basic styling
  const formatContent = (content) => {
    if (!content) return '';
    
    // Split by double newlines to create paragraphs
    return content.split('\n\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      return (
        <p 
          key={index} 
          className="mb-6" 
          style={{ 
            lineHeight: '1.8',
            color: 'var(--text-dark)',
            fontSize: '1.1rem'
          }}
        >
          {paragraph.trim()}
        </p>
      );
    }).filter(Boolean);
  };

  // Get status badge color
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case POST_STATUS.PUBLISHED:
        return { backgroundColor: '#16a34a', color: 'white' };
      case POST_STATUS.DRAFT:
        return { backgroundColor: '#ca8a04', color: 'white' };
      default:
        return { backgroundColor: '#6b7280', color: 'white' };
    }
  };

  // Loading state
  if (loading) {
    return <Loading text="Loading post..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <ErrorAlert error={error} onClose={refetch} />
        <div className="text-center py-8">
          <button onClick={handleBackToPosts} className="btn btn-secondary">
            ← Back to Posts
          </button>
        </div>
      </div>
    );
  }

  // Post not found
  if (!post) {
    return (
      <div className="container text-center py-16">
        <div className="text-6xl mb-4" style={{ color: 'var(--text-muted-dark)' }}>
          📄
        </div>
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-8" style={{ color: 'var(--text-muted-dark)' }}>
          The post you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={handleBackToPosts} className="btn btn-primary">
          ← Back to Posts
        </button>
      </div>
    );
  }

  // Check if user can edit this post
  const canEdit = isAuthenticated && (
    user?.role === 'admin' || 
    user?.id === post.author?.id
  );

  return (
    <div className="container fade-in">
      {/* Back Button */}
      <button 
        onClick={handleBackToPosts} 
        className="btn btn-secondary mb-6"
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <span>←</span>
        <span>Back to Posts</span>
      </button>

      {/* Article */}
      <article className="card" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <header 
          className="p-8"
          style={{
            background: 'linear-gradient(to right, #9333ea, #2563eb)',
            color: 'white'
          }}
        >
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Category */}
            <button
              onClick={() => handleCategoryClick(post.category?.id)}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-white hover:bg-opacity-20"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {post.category?.name}
            </button>
            
            {/* Reading Time */}
            <span className="text-sm" style={{ color: '#e9d5ff' }}>
              {post.readingTime || 5} min read
            </span>
            
            {/* Status Badge (if user can see it) */}
            {canEdit && (
              <span 
                className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                style={getStatusBadgeStyle(post.status)}
              >
                {post.status}
              </span>
            )}

            {/* Edit Button */}
            {canEdit && (
              <button
                onClick={handleEditPost}
                className="ml-auto btn btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Edit Post
              </button>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          {/* Author and Date */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4" style={{ color: '#e9d5ff' }}>
              <span className="font-medium">By {post.author?.name || 'Anonymous'}</span>
              <span>•</span>
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
              {post.updatedAt !== post.createdAt && (
                <>
                  <span>•</span>
                  <span className="text-sm">
                    Updated {formatDate(post.updatedAt)}
                  </span>
                </>
              )}
            </div>
            
            {/* Share Buttons (placeholder) */}
            <div className="flex items-center gap-2">
              <button 
                className="p-2 rounded transition-colors hover:bg-white hover:bg-opacity-10"
                title="Share on Twitter"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(post.title);
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                </svg>
              </button>
              <button 
                className="p-2 rounded transition-colors hover:bg-white hover:bg-opacity-10"
                title="Copy link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  // Could show a toast notification here
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Post Excerpt/Summary */}
          {post.excerpt && (
            <div 
              className="p-6 mb-8 rounded-lg border-l-4"
              style={{
                backgroundColor: 'var(--input-bg-dark)',
                borderColor: 'var(--purple-600)',
                fontStyle: 'italic',
                fontSize: '1.125rem',
                lineHeight: '1.7'
              }}
            >
              {post.excerpt}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            {formatContent(post.content)}
          </div>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--border-dark)' }}>
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.name)}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-purple-600 hover:text-white"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                    }}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Article Stats */}
          <div 
            className="mt-8 pt-6 border-t flex flex-wrap items-center gap-6 text-sm"
            style={{ 
              borderColor: 'var(--border-dark)',
              color: 'var(--text-muted-dark)'
            }}
          >
            <span>Published {formatDate(post.createdAt)}</span>
            {post.views && (
              <>
                <span>•</span>
                <span>{post.views} views</span>
              </>
            )}
            <span>•</span>
            <span>{post.content?.length || 0} characters</span>
          </div>
        </div>
      </article>

      {/* Related Posts Section (placeholder) */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
        <div className="text-center py-8" style={{ color: 'var(--text-muted-dark)' }}>
          <p>Related posts feature coming soon...</p>
        </div>
      </section>
    </div>
  );
};

export default PostDetail;