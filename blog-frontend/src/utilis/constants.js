// Application Constants

// Environment
export const ENV = {
    NODE_ENV: import.meta.env.MODE,
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Dark Blog',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  };
  
  // API Endpoints
  export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signin',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
    },
    POSTS: {
      BASE: '/posts',
      DRAFTS: '/posts/drafts',
      SEARCH: '/posts/search',
      BY_ID: (id) => `/posts/${id}`,
      PUBLISH: (id) => `/posts/${id}/publish`,
      UNPUBLISH: (id) => `/posts/${id}/unpublish`,
    },
    CATEGORIES: {
      BASE: '/categories',
      BY_ID: (id) => `/categories/${id}`,
      POSTS: (id) => `/categories/${id}/posts`,
    },
    TAGS: {
      BASE: '/tags',
      BY_ID: (id) => `/tags/${id}`,
      POSTS: (id) => `/tags/${id}/posts`,
      SEARCH: '/tags/search',
    },
    USER: {
      PROFILE: '/user/profile',
      PASSWORD: '/user/password',
      ACCOUNT: '/user/account',
    },
    ANALYTICS: {
      STATS: '/analytics/stats',
      POST_VIEWS: (id) => `/analytics/posts/${id}/views`,
    },
  };
  
  // Local Storage Keys
  export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    DRAFT_POSTS: 'draft_posts',
    THEME: 'theme',
  };
  
  // Post Status
  export const POST_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
  };
  
  export const POST_STATUS_LABELS = {
    [POST_STATUS.DRAFT]: 'Draft',
    [POST_STATUS.PUBLISHED]: 'Published',
    [POST_STATUS.ARCHIVED]: 'Archived',
  };
  
  export const POST_STATUS_COLORS = {
    [POST_STATUS.DRAFT]: '#ca8a04',
    [POST_STATUS.PUBLISHED]: '#16a34a',
    [POST_STATUS.ARCHIVED]: '#6b7280',
  };
  
  // User Roles
  export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
  };
  
  export const USER_ROLE_LABELS = {
    [USER_ROLES.USER]: 'User',
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.MODERATOR]: 'Moderator',
  };
  
  // Pagination
  export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 12,
    PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
    MAX_PAGE_SIZE: 100,
  };
  
  // Validation Rules
  export const VALIDATION = {
    POST: {
      TITLE_MIN_LENGTH: 3,
      TITLE_MAX_LENGTH: 200,
      CONTENT_MIN_LENGTH: 10,
      CONTENT_MAX_LENGTH: 50000,
      EXCERPT_MAX_LENGTH: 500,
    },
    CATEGORY: {
      NAME_MIN_LENGTH: 2,
      NAME_MAX_LENGTH: 50,
    },
    TAG: {
      NAME_MIN_LENGTH: 2,
      NAME_MAX_LENGTH: 30,
      MAX_TAGS_PER_POST: 10,
    },
    USER: {
      NAME_MIN_LENGTH: 2,
      NAME_MAX_LENGTH: 50,
      PASSWORD_MIN_LENGTH: 6,
      PASSWORD_MAX_LENGTH: 100,
    },
  };
  
  // Sort Options
  export const SORT_OPTIONS = {
    POSTS: [
      { value: 'createdAt-desc', label: 'Newest First' },
      { value: 'createdAt-asc', label: 'Oldest First' },
      { value: 'title-asc', label: 'Title A-Z' },
      { value: 'title-desc', label: 'Title Z-A' },
      { value: 'readingTime-asc', label: 'Shortest Read' },
      { value: 'readingTime-desc', label: 'Longest Read' },
      { value: 'views-desc', label: 'Most Viewed' },
      { value: 'views-asc', label: 'Least Viewed' },
    ],
    CATEGORIES: [
      { value: 'name-asc', label: 'Name A-Z' },
      { value: 'name-desc', label: 'Name Z-A' },
      { value: 'postCount-desc', label: 'Most Posts' },
      { value: 'postCount-asc', label: 'Fewest Posts' },
      { value: 'createdAt-desc', label: 'Newest First' },
      { value: 'createdAt-asc', label: 'Oldest First' },
    ],
    TAGS: [
      { value: 'name-asc', label: 'Name A-Z' },
      { value: 'name-desc', label: 'Name Z-A' },
      { value: 'postCount-desc', label: 'Most Used' },
      { value: 'postCount-asc', label: 'Least Used' },
      { value: 'createdAt-desc', label: 'Newest First' },
      { value: 'createdAt-asc', label: 'Oldest First' },
    ],
  };
  
  // HTTP Status Codes
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error: Unable to connect to the server. Please check your connection.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    TOO_MANY_REQUESTS: 'Too many requests. Please wait a moment and try again.',
    SERVER_ERROR: 'Internal server error. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    POST: {
      CREATED: 'Post created successfully!',
      UPDATED: 'Post updated successfully!',
      DELETED: 'Post deleted successfully!',
      PUBLISHED: 'Post published successfully!',
      UNPUBLISHED: 'Post unpublished successfully!',
    },
    CATEGORY: {
      CREATED: 'Category created successfully!',
      UPDATED: 'Category updated successfully!',
      DELETED: 'Category deleted successfully!',
    },
    TAG: {
      CREATED: 'Tags created successfully!',
      UPDATED: 'Tag updated successfully!',
      DELETED: 'Tag deleted successfully!',
    },
    AUTH: {
      LOGIN: 'Welcome back!',
      REGISTER: 'Account created successfully! Please log in.',
      LOGOUT: 'You have been logged out successfully.',
      PROFILE_UPDATED: 'Profile updated successfully!',
      PASSWORD_CHANGED: 'Password changed successfully!',
    },
  };
  
  // Routes
  export const ROUTES = {
    HOME: '/',
    POSTS: '/posts',
    POST_DETAIL: (id) => `/posts/${id}`,
    CATEGORIES: '/categories',
    TAGS: '/tags',
    DASHBOARD: '/dashboard',
    LOGIN: '/login',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  };
  
  // Form Field Names
  export const FORM_FIELDS = {
    POST: {
      TITLE: 'title',
      CONTENT: 'content',
      EXCERPT: 'excerpt',
      CATEGORY_ID: 'categoryId',
      TAG_IDS: 'tagIds',
      STATUS: 'status',
      FEATURED_IMAGE: 'featuredImage',
    },
    CATEGORY: {
      NAME: 'name',
      DESCRIPTION: 'description',
    },
    TAG: {
      NAMES: 'names',
    },
    AUTH: {
      EMAIL: 'email',
      PASSWORD: 'password',
      NAME: 'name',
      CURRENT_PASSWORD: 'currentPassword',
      NEW_PASSWORD: 'newPassword',
      CONFIRM_PASSWORD: 'confirmPassword',
    },
  };
  
  // Date Formats
  export const DATE_FORMATS = {
    FULL: 'MMMM d, yyyy \'at\' h:mm a',
    SHORT: 'MMM d, yyyy',
    TIME: 'h:mm a',
    ISO: 'yyyy-MM-dd',
    RELATIVE: 'relative', // for libraries like date-fns formatDistanceToNow
  };
  
  // Feature Flags
  export const FEATURES = {
    ANALYTICS: true,
    COMMENTS: false,
    SOCIAL_SHARING: true,
    EMAIL_NOTIFICATIONS: false,
    SEARCH: true,
    TAGS: true,
    CATEGORIES: true,
    DRAFTS: true,
    USER_PROFILES: false,
  };
  
  // CSS Custom Properties (for JS access)
  export const CSS_VARIABLES = {
    COLORS: {
      PRIMARY: '--purple-600',
      SECONDARY: '--blue-600',
      SUCCESS: '--green-600',
      WARNING: '--yellow-600',
      ERROR: '--red-600',
      TEXT: '--text-dark',
      TEXT_MUTED: '--text-muted-dark',
      BACKGROUND: '--bg-dark',
      CARD: '--card-dark',
      BORDER: '--border-dark',
    },
    SPACING: {
      XS: '0.25rem',
      SM: '0.5rem',
      MD: '1rem',
      LG: '1.5rem',
      XL: '2rem',
      XXL: '3rem',
    },
    BREAKPOINTS: {
      SM: '640px',
      MD: '768px',
      LG: '1024px',
      XL: '1280px',
      XXL: '1536px',
    },
  };
  
  // Export default config object
  export default {
    ENV,
    API_ENDPOINTS,
    STORAGE_KEYS,
    POST_STATUS,
    USER_ROLES,
    PAGINATION,
    VALIDATION,
    SORT_OPTIONS,
    HTTP_STATUS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    ROUTES,
    FORM_FIELDS,
    DATE_FORMATS,
    FEATURES,
    CSS_VARIABLES,
  };