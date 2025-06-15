import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@services/api';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token utilities
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const tokenUtils = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  clearAllTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  parseToken: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  },
  
  isTokenExpired: (token) => {
    const payload = tokenUtils.parseToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const token = tokenUtils.getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Check if token is expired
      if (tokenUtils.isTokenExpired(token)) {
        console.log('Token expired, attempting refresh...');
        const refreshed = await refreshToken();
        if (!refreshed) {
          tokenUtils.clearAllTokens();
          setLoading(false);
          return;
        }
      }
      
      // Parse user data from token
      const payload = tokenUtils.parseToken(token);
      if (payload) {
        setUser({
          id: payload.sub,
          email: payload.email || payload.sub,
          name: payload.name,
          role: payload.role,
          exp: payload.exp
        });
      }
      
    } catch (error) {
      console.error('Error initializing auth:', error);
      tokenUtils.clearAllTokens();
      setError('Failed to initialize authentication');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.auth.login(credentials);
      const { token, refreshToken: newRefreshToken, user: userData } = response;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Store tokens
      tokenUtils.setToken(token);
      if (newRefreshToken) {
        tokenUtils.setRefreshToken(newRefreshToken);
      }
      
      // Parse and set user data
      const payload = tokenUtils.parseToken(token);
      if (payload) {
        const newUser = {
          id: payload.sub,
          email: payload.email || payload.sub,
          name: userData?.name || payload.name,
          role: payload.role || 'user',
          exp: payload.exp
        };
        setUser(newUser);
      }
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.auth.register(userData);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint if available
      await api.auth.logout().catch(() => {
        // Ignore errors from logout endpoint
        console.log('Logout endpoint not available or failed');
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state
      tokenUtils.clearAllTokens();
      setUser(null);
      setError(null);
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = tokenUtils.getRefreshToken();
      
      if (!refreshTokenValue) {
        return false;
      }
      
      const response = await api.auth.refreshToken();
      const { token: newToken, refreshToken: newRefreshToken } = response;
      
      if (!newToken) {
        return false;
      }
      
      // Update tokens
      tokenUtils.setToken(newToken);
      if (newRefreshToken) {
        tokenUtils.setRefreshToken(newRefreshToken);
      }
      
      // Update user data
      const payload = tokenUtils.parseToken(newToken);
      if (payload) {
        setUser(prevUser => ({
          ...prevUser,
          exp: payload.exp
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await api.user.updateProfile(profileData);
      
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);
      
      await api.user.changePassword(passwordData);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!user || !user.exp) return;

    const timeUntilExpiry = (user.exp * 1000) - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0); // 5 minutes before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(async () => {
        console.log('Auto-refreshing token...');
        const success = await refreshToken();
        if (!success) {
          console.log('Auto-refresh failed, logging out...');
          logout();
        }
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [user, refreshToken, logout]);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 10000); // Clear error after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Context value
  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    
    // Functions
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    
    // Utilities
    clearError: () => setError(null),
    
    // Token utilities (for advanced use cases)
    tokenUtils: {
      isTokenExpired: tokenUtils.isTokenExpired,
      parseToken: tokenUtils.parseToken,
      getToken: tokenUtils.getToken
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;