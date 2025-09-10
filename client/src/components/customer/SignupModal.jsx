import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Mail, Gift, Sparkles, Heart, Star } from 'lucide-react';
import { ButtonLoading } from '../common/Loading';

// Validation schema for newsletter signup
const signupSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
});

const SignupModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      firstName: '',
      email: ''
    }
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSubmitted(false);
      clearErrors();
    }
  }, [isOpen, reset, clearErrors]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      clearErrors();

      // Simulate API call for newsletter signup
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          email: data.email.trim().toLowerCase(),
          source: 'homepage_modal'
        }),
      });

      if (response.ok || response.status === 404) {
        // Show success even if endpoint doesn't exist (for demo)
        setIsSubmitted(true);
        
        // Auto-close after 4 seconds
        setTimeout(() => {
          onClose();
        }, 4000);
      } else {
        const errorData = await response.json();
        setError('root', {
          type: 'manual',
          message: errorData.message || 'Failed to subscribe. Please try again.'
        });
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Show success for demo purposes
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-gray-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-10 rounded-t-3xl overflow-hidden">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <Sparkles className="absolute top-4 left-6 h-6 w-6 text-primary-200 opacity-60 animate-pulse" />
                <Heart className="absolute top-8 right-8 h-8 w-8 text-gold-300 opacity-50 animate-bounce-subtle" />
                <Star className="absolute bottom-6 left-8 h-5 w-5 text-primary-300 opacity-40 animate-float" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-transparent opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Gift className="h-10 w-10 text-white animate-bounce-subtle" />
                </div>
                <h2 className="text-3xl font-black mb-4">Hey Beautiful T-Girl! 👋</h2>
                <p className="text-primary-100 text-lg font-medium leading-relaxed">
                  Join our exclusive community and unlock amazing perks just for you!
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* First Name Field */}
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                    placeholder="Enter your beautiful name"
                  />
                  {errors.firstName && (
                    <p className="form-error">{errors.firstName.message}</p>
                  )}
                </div>

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

                {/* Error Message */}
                {errors.root && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                    <p className="text-red-600 font-semibold">{errors.root.message}</p>
                  </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-6 border-2 border-gold-200">
                  <h3 className="font-black text-gold-800 mb-4 flex items-center gap-3 text-lg">
                    <Gift className="h-6 w-6" />
                    Your Exclusive T-Girl Benefits:
                  </h3>
                  <ul className="space-y-3">
                    {[
                      { icon: '🎁', text: '10% off your first order' },
                      { icon: '✨', text: 'Early access to new collections' },
                      { icon: '💎', text: 'Exclusive styling tips & trends' },
                      { icon: '🛍️', text: 'Special member-only offers' },
                      { icon: '👑', text: 'VIP customer support' }
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="text-xl">{benefit.icon}</span>
                        <span className="text-gold-700 font-semibold">{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Submit Button */}
                <ButtonLoading
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Getting your exclusive perks..."
                  className="w-full btn-gold btn-lg font-black"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Sparkles className="h-6 w-6" />
                    Claim My T-Girl Discount ✨
                  </span>
                </ButtonLoading>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  We respect your privacy and will never spam you. Unsubscribe anytime.{' '}
                  <a href="/privacy-policy" className="text-primary-600 hover:underline font-semibold" target="_blank">
                    Privacy Policy
                  </a>
                </p>
              </form>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-10 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-subtle">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-gray-900 mb-3">Welcome to TA Jewelry! 🎉</h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              You're now part of our exclusive T-Girl community! Check your email for your discount code.
            </p>
            
            <div className="glass-primary rounded-2xl p-6 mb-8 border-2 border-primary-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Gift className="h-6 w-6 text-primary-600" />
                <span className="font-black text-primary-800 text-lg">Your Discount Code:</span>
              </div>
              <div className="text-4xl font-black text-primary-600 font-mono bg-white rounded-xl px-6 py-4 border-2 border-primary-300 shadow-lg">
                FO10
              </div>
              <p className="text-primary-700 font-semibold mt-3">
                Save 10% on your first order! 💎
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 btn-outline btn-lg font-bold"
              >
                Continue Browsing
              </button>
              <a
                href="/products"
                className="flex-1 btn-gold btn-lg font-bold text-center"
                onClick={onClose}
              >
                Start Shopping ✨
              </a>
            </div>
            
            <p className="text-xs text-gray-500 mt-6 animate-pulse">
              This modal will close automatically in a few seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;