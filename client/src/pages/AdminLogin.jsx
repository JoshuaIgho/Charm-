import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ButtonLoading } from '../components/common/Loading';

// Validation schema
const adminLoginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email or username is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin, isAdminAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      const from = location.state?.from || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAdminAuthenticated, navigate, location]);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      clearErrors();
      const result = await adminLogin(data.email, data.password);
      
      if (result.success) {
        // Redirect to admin panel or intended page
        const from = location.state?.from || '/admin';
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: result.message || 'Admin login failed'
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Admin login failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-gray-300">Sign in to access the admin dashboard</p>
        </div>

        {/* Admin Login Form */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email or Username
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="text"
                  id="email"
                  className={`form-input pl-12 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter email or username"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input pl-12 pr-12 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter admin password"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Keep me signed in
              </label>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <ButtonLoading
              type="submit"
              isLoading={isSubmitting || isLoading}
              loadingText="Signing in..."
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Sign In to Admin Panel
            </ButtonLoading>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Security Notice</p>
                <p className="text-yellow-700">
                  This is a restricted area for authorized administrators only. 
                  All login attempts are logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="text-center space-y-4">
          <div className="text-gray-300 text-sm">
            Need help? Contact system administrator
          </div>
          <Link 
            to="/" 
            className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          >
            ← Back to main website
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>TA Jewelry Admin Portal v1.0</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;