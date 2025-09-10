import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Save the intended destination to redirect back after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if user account is active
  if (user && !user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Inactive</h2>
          <p className="text-gray-600 mb-6">
            Your account has been deactivated. Please contact support for assistance.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={() => {
                localStorage.removeItem('userToken');
                window.location.href = '/';
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;