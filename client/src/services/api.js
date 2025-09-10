import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add user token if available
    const userToken = localStorage.getItem('userToken');
    if (userToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    // Add admin token for admin routes
    if (config.url?.includes('/admin/') || config.url?.includes('/auth/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear tokens and redirect to login
          if (data.message?.includes('admin')) {
            localStorage.removeItem('adminToken');
            if (window.location.pathname.includes('/admin/')) {
              window.location.href = '/admin/login';
            }
          } else {
            localStorage.removeItem('userToken');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          break;
          
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access denied:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.config.url);
          break;
          
        case 429:
          // Rate limit exceeded
          console.error('Rate limit exceeded. Please try again later.');
          break;
          
        case 500:
          // Internal server error
          console.error('Server error. Please try again later.');
          break;
          
        default:
          console.error('API Error:', data.message || error.message);
      }
      
      // Return the error response for handling in components
      return Promise.reject({
        message: data.message || 'An error occurred',
        status,
        data
      });
    }
    
    // Network error or timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        message: 'Request timeout. Please check your connection.',
        code: 'TIMEOUT'
      });
    }
    
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, formData, onUploadProgress = null) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      return await api.post(url, formData, config);
    } catch (error) {
      throw error;
    }
  },

  // Download file
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Create blob link to download
      const blob = new Blob([response]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(link.href);
      
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Export both the configured axios instance and the service
export { api };
export default apiService;