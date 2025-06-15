import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { useAuth } from '@hooks/useAuth';
import ErrorBoundary from '@components/common/ErrorBoundary';
import Navigation from '@components/layout/Navigation';
import Footer from '@components/layout/Footer';
import Loading from '@components/ui/Loading';

// Lazy load pages for better performance
const Home = React.lazy(() => import('@pages/Home'));
const Posts = React.lazy(() => import('@pages/Posts'));
const PostDetail = React.lazy(() => import('@pages/PostDetail'));
const Categories = React.lazy(() => import('@pages/Categories'));
const Tags = React.lazy(() => import('@pages/Tags'));
const Dashboard = React.lazy(() => import('@pages/Dashboard'));
const Login = React.lazy(() => import('@pages/Login'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Layout Component
const Layout = ({ children }) => (
  <div className="main-layout">
    <Navigation />
    <main className="main-content">
      <Suspense fallback={<Loading />}>
        {children}
      </Suspense>
    </main>
    <Footer />
  </div>
);

// App Routes Component
const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/tags" element={<Tags />} />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;