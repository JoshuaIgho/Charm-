import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ButtonLoading } from '../components/common/Loading';

// Validation schema
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      clearErrors();
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Redirect to intended page or dashboard
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError('root', {
          type: 'manual',
          message: result.message || 'Login failed'
        });
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Login failed. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-200 opacity-30 rounded-full animate-float"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-2 border-gold-300 opacity-40 rounded-full animate-bounce-subtle"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 border-2 border-primary-300 opacity-25 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <Sparkles className="absolute top-1/4 right-1/4 h-8 w-8 text-gold-400 opacity-50 animate-pulse" />
        <Sparkles className="absolute bottom-1/3 left-1/4 h-6 w-6 text-primary-400 opacity-40 animate-bounce-subtle" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`max-w-md w-full space-y-8 relative z-10 transition-all duration-1000 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Header */}
        <div className="text-center animate-fade-in-down">
          <Link to="/" className="inline-flex items-center gap-4 text-3xl font-bold mb-6 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center shadow-elegant group-hover:shadow-elegant-lg transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
              <span className="text-white text-2xl font-black relative z-10">TA</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="block text-gradient-primary font-black tracking-tight">TA JEWELRY</span>
              <span className="block text-xs text-gray-600 font-semibold tracking-widest uppercase">For the T-Girlies</span>
            </div>
          </Link>
          <h2 className="text-4xl font-black text-gray-900 mb-3">Welcome Back! ✨</h2>
          <p className="text-gray-600 text-lg font-medium">Sign in to continue your jewelry journey</p>
        </div>

        {/* Login Form */}
        <div className="card-luxury animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`form-input pl-14 ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
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
                  className={`form-input pl-14 pr-14 ${errors.password ? 'form-input-error' : ''}`}
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 animate-scale-in">
                <p className="text-red-600 font-semibold">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <ButtonLoading
              type="submit"
              isLoading={isSubmitting || isLoading}
              loadingText="Signing you in..."
              className="w-full btn-primary btn-lg font-bold"
            >
              <span className="flex items-center justify-center gap-3">
                Sign In
                <ArrowRight className="h-5 w-5" />
              </span>
            </ButtonLoading>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-semibold">Don't have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-bold text-lg transition-colors"
              >
                Create a new account
                <Sparkles className="h-5 w-5 group-hover:animate-pulse" />
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <Link 
            to="/" 
            className="text-gray-600 hover:text-primary-600 font-medium transition-colors group inline-flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;