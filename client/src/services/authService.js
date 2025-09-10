import apiService from './api';

const authService = {
  // USER AUTHENTICATION

  // Register new user
  register: async (userData) => {
    return await apiService.post('/auth/register', userData);
  },

  // Login user
  login: async (email, password) => {
    return await apiService.post('/auth/login', { email, password });
  },

  // Get user profile
  getProfile: async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.get('/auth/me', config);
  },

  // Update user profile
  updateProfile: async (profileData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.put('/auth/profile', profileData, config);
  },

  // Change password
  changePassword: async (passwordData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.put('/auth/change-password', passwordData, config);
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await apiService.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await apiService.put(`/auth/reset-password/${token}`, { password });
  },

  // ADMIN AUTHENTICATION

  // Login admin
  adminLogin: async (email, password) => {
    return await apiService.post('/auth/admin/login', { email, password });
  },

  // Get admin profile
  getAdminProfile: async (token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.get('/auth/admin/me', config);
  },

  // Update admin profile
  updateAdminProfile: async (profileData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.put('/auth/admin/profile', profileData, config);
  },

  // Change admin password
  changeAdminPassword: async (passwordData, token) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.put('/auth/admin/change-password', passwordData, config);
  },

  // Initialize super admin (only works if no super admin exists)
  initializeSuperAdmin: async () => {
    return await apiService.post('/auth/admin/init');
  },

  // Validate token (generic method)
  validateToken: async (token, isAdmin = false) => {
    const endpoint = isAdmin ? '/auth/admin/me' : '/auth/me';
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    return await apiService.get(endpoint, config);
  },

  // Logout (client-side only - just removes tokens)
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
  }
};

export default authService;