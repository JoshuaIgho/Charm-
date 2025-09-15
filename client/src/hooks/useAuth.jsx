import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // for API calls
  const [isInitialized, setIsInitialized] = useState(false); // for initial auth check

  // Initialize auth from localStorage
  const initializeAuth = useCallback(async () => {
    try {
      // Check user token
      const userToken = localStorage.getItem('userToken');
      if (userToken) {
        try {
          const response = await authService.getProfile(userToken);
          if (response.success && response.data.user) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('userToken');
          }
        } catch {
          localStorage.removeItem('userToken');
        }
      }

      // Check admin token
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        try {
          const response = await authService.getAdminProfile(adminToken);
          if (response.success && response.data.admin) {
            setAdmin(response.data.admin);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch {
          localStorage.removeItem('adminToken');
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // --------- User Auth Functions ---------
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token && response.data.user) {
        localStorage.setItem('userToken', response.token);
        setUser(response.data.user);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success && response.token && response.data.user) {
        localStorage.setItem('userToken', response.token);
        setUser(response.data.user);
        toast.success('Registration successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    toast.success('Logged out successfully');
  };

  // --------- Admin Auth Functions ---------
  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.adminLogin(email, password);
      
      
      if (response.success && response.token && response.data.admin) {
        localStorage.setItem('adminToken', response.token);
        setAdmin(response.data.admin);
        toast.success('Admin login successful!');
        return { success: true };
      } else {
        toast.error(response.message || 'Admin login failed');
        return { success: false, message: response.message };
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Admin login failed');
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    toast.success('Admin logged out successfully');
  };

  const hasAdminPermission = (permission) => {
    return admin?.permissions?.includes(permission) || admin?.role === 'super_admin';
  };

  // --------- Utility ---------
  const isAuthenticated = Boolean(user);
  const isAdminAuthenticated = Boolean(admin);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isLoading,
        isInitialized,
        isAuthenticated,
        isAdminAuthenticated,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        hasAdminPermission,
        initializeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default useAuth;
