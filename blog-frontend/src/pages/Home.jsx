import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@hooks/useApi';
import { api } from '@services/api';
import { ROUTES, PAGINATION } from '@utils/constants';
import Loading from '@components/ui/Loading';
import ErrorAlert from '@components/ui/ErrorAlert';

const Home = () => {
  const navigate = useNavigate();

  // Fetch recent posts (limit to 6)
  const {
    data: recentPosts,
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts
  } = useApi(
    () => api.posts.getAll({ 
      limit: 6, 
      sort: 'createdAt', 
      order: 'desc',
      status: 'PUBLISHED'
    }),
    [],
    { 
      defaultData: [],
      onSuccess: (data) => {
        console.log('✅ Recent posts loaded:', data.length);
      }
    }
  );

  // Fetch popular categories (limit to 4)
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useApi(
    () => api.categories.getAll({ 
      limit: 4, 
      sort: 'postCount', 
      order: 'desc' 
    }),
    [],
    { 
      defaultData: [],
      onSuccess: (data) => {
        console.log('✅ Popular categories loaded:', data.length);
      }
    }
  );

  // Navigation handlers
  const handlePostClick = (postId) => {
    navigate(ROUTES.POST_DETAIL(postId));
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`${ROUTES.POSTS}?category=${categoryId}`);
  };

  const handleViewAllPosts = () => {
    navigate(ROUTES.POSTS);
  };

  const handleViewAllCategories = () => {
    navigate(ROUTES.CATEGORIES);
  };

  // Error handler
  const handleErrorDismiss = () => {
    refetchPosts();
    refetchCategories();
  };

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (postsLoading || categoriesLoading) {
    return <Loading text="Loading homepage..." />;
  }

  return (
    <div className="container fade-in">
      {/* Error Alert */}
      {(postsError || categoriesError) && (
        <ErrorAlert 
          error={postsError || categoriesError} 
          onClose={handleErrorDismiss}
          autoClose={false}
        />
      )}
      
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 
          className="text-5xl font-bold mb-6" 
          style={{
            background: 'linear-gradient(to right, #9333ea, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Welcome to Dark Blog
        </h1>
        <p 
          className="text-xl mb-8" 
          style={{ 
            color: 'var(--text-muted-dark)', 
            maxWidth: '42rem', 
            margin: '0 auto 2rem auto',
            lineHeight: '1.6'
          }}
        >
          Discover amazing articles and insights in our beautifully crafted dark-themed blog. 
          Explore tech tutorials, programming guides, and industry insights.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button 
            onClick={handleViewAllPosts}
            className="btn btn-primary"
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            Explore All Posts
          </button>
          <button 
            onClick={handleViewAllCategories}
            className="btn btn-secondary"
            style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
          >
            Browse Categories
          </button>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Recent Posts</h2>
          <button 
            onClick={handleViewAllPosts}
            className="btn btn-secondary"
          >
            View All Posts
          </button>
        </div>
        
        {recentPosts.length > 0 ? (
          <div className="grid grid-3">
            {recentPosts.map(post => (
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
                        backgroundColor: '#f3e8ff',
                        color: '#7c3aed',
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
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  {/* Post Excerpt */}
                  <p 
                    className="text-sm mb-4 line-clamp-3" 
                    style={{ color: 'var(--text-muted-dark)' }}
                  >
                    {post.excerpt || post.content?.substring(0, 120) + '...'}
                  </p>
                  
                  {/* Post Footer */}
                  <div 
                    className="flex items-center justify-between text-sm pt-4 border-t"
                    style={{ 
                      color: 'var(--text-muted-dark)',
                      borderColor: 'var(--border-dark)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>By {post.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    <span 
                      className="font-medium"
                      style={{ color: 'var(--purple-600)' }}
                    >
                      Read more →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" style={{ color: 'var(--text-muted-dark)' }}>
              📚
            </div>
            <p style={{ color: 'var(--text-muted-dark)', fontSize: '1.125rem' }}>
              No posts available yet. Check back later!
            </p>
          </div>
        )}
      </section>

      {/* Popular Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Popular Categories</h2>
          <button 
            onClick={handleViewAllCategories}
            className="btn btn-secondary"
          >
            View All Categories
          </button>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-4">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="card-hover text-center p-6 rounded-lg cursor-pointer"
                style={{
                  background: 'linear-gradient(to bottom right, #a855f7, #2563eb)',
                  color: 'white',
                }}
                onClick={() => handleCategoryClick(category.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(category.id);
                  }
                }}
                aria-label={`Browse ${category.name} category`}
              >
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm" style={{ color: '#e9d5ff' }}>
                  {category.postCount || 0} {category.postCount === 1 ? 'post' : 'posts'}
                </p>
                {category.description && (
                  <p className="text-xs mt-2 opacity-90">
                    {category.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" style={{ color: 'var(--text-muted-dark)' }}>
              📁
            </div>
            <p style={{ color: 'var(--text-muted-dark)', fontSize: '1.125rem' }}>
              No categories available yet.
            </p>
          </div>
        )}
      </section>

      {/* Stats Section (if we have data) */}
      {(recentPosts.length > 0 || categories.length > 0) && (
        <section className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border-dark)' }}>
          <div className="grid grid-3 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{recentPosts.length}+</div>
              <div className="text-sm text-muted">Recent Articles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{categories.length}+</div>
              <div className="text-sm text-muted">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {categories.reduce((total, cat) => total + (cat.postCount || 0), 0)}+
              </div>
              <div className="text-sm text-muted">Total Posts</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;