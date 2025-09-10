import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check for user token
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        try {
          const response = await authService.getProfile(userToken);
          if (response.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('userToken');
          }
        } catch (error) {
          console.error('Failed to validate user token:', error);
          localStorage.removeItem('userToken');
        }
      }

      // Check for admin token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const response = await authService.getAdminProfile(adminToken);
          if (response.success) {
            setAdmin(response.data.admin);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Failed to validate admin token:', error);
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // User Authentication Functions
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('userToken', response.token);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        localStorage.setItem('userToken', response.token);
        setUser(response.data.user);
        toast.success('Registration successful! Welcome to TA Jewelry!');
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await authService.updateProfile(profileData, token);
      
      if (response.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        toast.error(response.message || 'Profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await authService.changePassword({
        currentPassword,
        newPassword
      }, token);
      
      if (response.success) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        toast.error(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Admin Authentication Functions
  const adminLogin = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.adminLogin(email, password);
      
      if (response.success) {
        localStorage.setItem('adminToken', response.token);
        setAdmin(response.data.admin);
        toast.success('Admin login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Admin login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Admin login failed. Please try again.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    toast.success('Admin logged out successfully');
  };

  const updateAdminProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin authentication token found');

      const response = await authService.updateAdminProfile(profileData, token);
      
      if (response.success) {
        setAdmin(response.data.admin);
        toast.success('Admin profile updated successfully');
        return { success: true };
      } else {
        toast.error(response.message || 'Admin profile update failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Admin profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changeAdminPassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin authentication token found');

      const response = await authService.changeAdminPassword({
        currentPassword,
        newPassword
      }, token);
      
      if (response.success) {
        toast.success('Admin password changed successfully');
        return { success: true };
      } else {
        toast.error(response.message || 'Admin password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Admin password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Utility Functions
  const isAuthenticated = Boolean(user);
  const isAdminAuthenticated = Boolean(admin);
  const hasAdminPermission = (permission) => {
    return admin?.permissions?.includes(permission) || admin?.role === 'super_admin';
  };

  // Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to send password reset email');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send password reset email';
      toast.error(message);
      return { success: false, message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      
      if (response.success) {
        localStorage.setItem('userToken', response.token);
        setUser(response.data.user);
        toast.success('Password reset successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Password reset failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    // State
    user,
    admin,
    isLoading,
    isInitialized,
    isAuthenticated,
    isAdminAuthenticated,
    
    // User functions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    
    // Admin functions
    adminLogin,
    adminLogout,
    updateAdminProfile,
    changeAdminPassword,
    hasAdminPermission,
    
    // Utility functions
    initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export context for advanced use cases
export { AuthContext };
export default useAuth;