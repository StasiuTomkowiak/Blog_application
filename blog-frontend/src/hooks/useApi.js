import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for API calls with loading, error, and data state management
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, refetch }
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    onSuccess,
    onError,
    defaultData = null,
    retryCount = 0,
    retryDelay = 1000,
    cacheKey = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  
  const mountedRef = useRef(true);
  const cacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  // Cache utilities
  const getCachedData = useCallback((key) => {
    if (!key) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > cacheDuration;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cacheDuration]);

  const setCachedData = useCallback((key, data) => {
    if (!key) return;
    
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  // Execute API call
  const execute = useCallback(async (...args) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return { success: true, data: cachedData, fromCache: true };
        }
      }

      // Execute API call
      const result = await apiFunction(...args);
      
      // Check if component is still mounted
      if (!mountedRef.current) return { success: false, error: 'Component unmounted' };
      
      setData(result);
      setRetryAttempt(0);

      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, result);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result, fromCache: false };
      
    } catch (err) {
      // Check if request was aborted
      if (err.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }

      // Check if component is still mounted
      if (!mountedRef.current) return { success: false, error: 'Component unmounted' };

      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);

      // Retry logic
      if (retryCount > 0 && retryAttempt < retryCount) {
        console.log(`Retrying API call (${retryAttempt + 1}/${retryCount})...`);
        
        setTimeout(() => {
          if (mountedRef.current) {
            setRetryAttempt(prev => prev + 1);
            execute(...args);
          }
        }, retryDelay * Math.pow(2, retryAttempt)); // Exponential backoff
        
        return { success: false, error: errorMessage, retrying: true };
      }

      // Call error callback
      if (onError) {
        onError(err);
      }

      return { success: false, error: errorMessage };
      
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [apiFunction, onSuccess, onError, retryCount, retryDelay, retryAttempt, cacheKey, getCachedData, setCachedData]);

  // Refetch function (alias for execute)
  const refetch = useCallback((...args) => execute(...args), [execute]);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    retryAttempt,
    isRetrying: retryAttempt > 0 && retryAttempt < retryCount,
  };
};

/**
 * Hook for pagination with API calls
 * @param {Function} apiFunction - API function that accepts page parameter
 * @param {Object} options - Configuration options
 * @returns {Object} - Pagination state and controls
 */
export const usePagination = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    onSuccess,
    onError,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState([]);

  const {
    data,
    loading,
    error,
    execute,
    refetch
  } = useApi(
    () => apiFunction({ page: currentPage, limit: pageSize }),
    [currentPage, pageSize],
    {
      onSuccess: (result) => {
        setItems(result.items || result.data || []);
        setTotalPages(result.totalPages || Math.ceil((result.total || 0) / pageSize));
        setTotalItems(result.total || 0);
        if (onSuccess) onSuccess(result);
      },
      onError
    }
  );

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const firstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const lastPage = useCallback(() => {
    goToPage(totalPages);
  }, [totalPages, goToPage]);

  return {
    // Data
    items,
    loading,
    error,
    
    // Pagination info
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    
    // Controls
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    refetch,
    
    // Raw data
    rawData: data,
  };
};

/**
 * Hook for debounced API calls (useful for search)
 * @param {Function} apiFunction - API function to call
 * @param {any} value - Value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @param {Object} options - Additional options
 * @returns {Object} - API state
 */
export const useDebouncedApi = (apiFunction, value, delay = 500, options = {}) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce the value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  // Use the debounced value in API call
  const result = useApi(
    () => apiFunction(debouncedValue),
    [debouncedValue],
    {
      immediate: !!debouncedValue,
      ...options
    }
  );

  return {
    ...result,
    debouncedValue,
    isDebouncing: value !== debouncedValue,
  };
};

/**
 * Hook for infinite scrolling/loading
 * @param {Function} apiFunction - API function for loading more data
 * @param {Object} options - Configuration options
 * @returns {Object} - Infinite loading state and controls
 */
export const useInfiniteApi = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    onSuccess,
    onError,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const {
    data,
    loading: initialLoading,
    error,
    execute
  } = useApi(
    () => apiFunction({ page, limit: pageSize }),
    [page],
    {
      immediate: page === initialPage,
      onSuccess: (result) => {
        const newItems = result.items || result.data || [];
        
        if (page === initialPage) {
          setItems(newItems);
        } else {
          setItems(prev => [...prev, ...newItems]);
        }
        
        setHasMore(newItems.length === pageSize);
        setIsLoadingMore(false);
        
        if (onSuccess) onSuccess(result);
      },
      onError: (err) => {
        setIsLoadingMore(false);
        if (onError) onError(err);
      }
    }
  );

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMore]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setItems([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [initialPage]);

  return {
    items,
    loading: initialLoading && page === initialPage,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    rawData: data,
  };
};

export default useApi;