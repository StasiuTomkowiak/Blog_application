import axios from 'axios';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const REQUEST_TIMEOUT = 10000;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token && !config.url.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for debugging
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request [${config.method.toUpperCase()}] ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response [${response.status}] ${response.config.url}`, response.data);
    }
    
    return response.data;
  },
  (error) => {
    const { response, request, config } = error;
    
    // Network error
    if (!response) {
      console.error('❌ Network Error:', error.message);
      return Promise.reject(new Error('Network error: Unable to connect to the server. Please check your connection.'));
    }
    
    // HTTP error responses
    const status = response.status;
    const data = response.data;
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error [${status}] ${config.url}`, {
        status,
        data,
        headers: response.headers
      });
    }
    
    // Handle specific error cases
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
        
      case 403:
        return Promise.reject(new Error('You do not have permission to perform this action.'));
        
      case 404:
        return Promise.reject(new Error('The requested resource was not found.'));
        
      case 422:
        // Validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message || err).join(', ');
          return Promise.reject(new Error(errorMessages));
        }
        return Promise.reject(new Error(data.message || 'Validation error occurred.'));
        
      case 429:
        return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'));
        
      case 500:
        return Promise.reject(new Error('Internal server error. Please try again later.'));
        
      case 503:
        return Promise.reject(new Error('Service temporarily unavailable. Please try again later.'));
        
      default:
        const errorMessage = data?.message || 
                           data?.error || 
                           `HTTP ${status}: ${response.statusText}`;
        return Promise.reject(new Error(errorMessage));
    }
  }
);

// API helper functions
const handleRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (error) {
    throw error;
  }
};

// API methods
export const api = {
  // Authentication
  auth: {
    login: (credentials) => 
      handleRequest(() => apiClient.post('/auth/login', credentials)),
    
    register: (userData) => 
      handleRequest(() => apiClient.post('/auth/signin', userData)),
    
    logout: () => 
      handleRequest(() => apiClient.post('/auth/logout')),
    
    refreshToken: () => 
      handleRequest(() => apiClient.post('/auth/refresh')),
    
    verifyToken: () => 
      handleRequest(() => apiClient.get('/auth/verify'))
  },

  // Posts
  posts: {
    getAll: (params = {}) => 
      handleRequest(() => apiClient.get('/posts', { params })),
    
    getById: (id) => 
      handleRequest(() => apiClient.get(`/posts/${id}`)),
    
    create: (data) => 
      handleRequest(() => apiClient.post('/posts', data)),
    
    update: (id, data) => 
      handleRequest(() => apiClient.put(`/posts/${id}`, data)),
    
    delete: (id) => 
      handleRequest(() => apiClient.delete(`/posts/${id}`)),
    
    getDrafts: () => 
      handleRequest(() => apiClient.get('/posts/drafts')),
    
    publish: (id) => 
      handleRequest(() => apiClient.patch(`/posts/${id}/publish`)),
    
    unpublish: (id) => 
      handleRequest(() => apiClient.patch(`/posts/${id}/unpublish`)),
    
    search: (query, params = {}) => 
      handleRequest(() => apiClient.get('/posts/search', { 
        params: { q: query, ...params } 
      }))
  },

  // Categories
  categories: {
    getAll: (params = {}) => 
      handleRequest(() => apiClient.get('/categories', { params })),
    
    getById: (id) => 
      handleRequest(() => apiClient.get(`/categories/${id}`)),
    
    create: (data) => 
      handleRequest(() => apiClient.post('/categories', data)),
    
    update: (id, data) => 
      handleRequest(() => apiClient.put(`/categories/${id}`, data)),
    
    delete: (id) => 
      handleRequest(() => apiClient.delete(`/categories/${id}`)),
    
    getPostsByCategory: (id, params = {}) => 
      handleRequest(() => apiClient.get(`/categories/${id}/posts`, { params }))
  },

  // Tags
  tags: {
    getAll: (params = {}) => 
      handleRequest(() => apiClient.get('/tags', { params })),
    
    getById: (id) => 
      handleRequest(() => apiClient.get(`/tags/${id}`)),
    
    create: (data) => 
      handleRequest(() => apiClient.post('/tags', data)),
    
    update: (id, data) => 
      handleRequest(() => apiClient.put(`/tags/${id}`, data)),
    
    delete: (id) => 
      handleRequest(() => apiClient.delete(`/tags/${id}`)),
    
    getPostsByTag: (id, params = {}) => 
      handleRequest(() => apiClient.get(`/tags/${id}/posts`, { params })),
    
    search: (query) => 
      handleRequest(() => apiClient.get('/tags/search', { 
        params: { q: query } 
      }))
  },

  // User/Profile
  user: {
    getProfile: () => 
      handleRequest(() => apiClient.get('/user/profile')),
    
    updateProfile: (data) => 
      handleRequest(() => apiClient.put('/user/profile', data)),
    
    changePassword: (data) => 
      handleRequest(() => apiClient.put('/user/password', data)),
    
    deleteAccount: () => 
      handleRequest(() => apiClient.delete('/user/account'))
  },

  // Analytics (if available)
  analytics: {
    getStats: () => 
      handleRequest(() => apiClient.get('/analytics/stats')),
    
    getPostViews: (postId) => 
      handleRequest(() => apiClient.get(`/analytics/posts/${postId}/views`))
  }
};

// Backwards compatibility - maintain old API interface
export const ApiService = {
  get: (endpoint) => apiClient.get(endpoint),
  post: (endpoint, data) => apiClient.post(endpoint, data),
  put: (endpoint, data) => apiClient.put(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint)
};

// Export individual methods for convenience
export const {
  auth: authApi,
  posts: postsApi,
  categories: categoriesApi,
  tags: tagsApi,
  user: userApi,
  analytics: analyticsApi
} = api;

export default api;