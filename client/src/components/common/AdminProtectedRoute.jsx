import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const AdminProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  requiredRole = null,
  redirectTo = '/admin/login' 
}) => {
  const { admin, isAdminAuthenticated, isLoading, isInitialized, hasAdminPermission } = useAuth();
  const location = useLocation();

  // Show loading while auth is being initialized
  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  // Redirect to admin login if not authenticated
  if (!isAdminAuthenticated || !admin) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check if admin account is active
  if (admin && !admin.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Account Inactive</h2>
          <p className="text-gray-600 mb-6">
            Your admin account has been deactivated. Please contact the system administrator.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin/login';
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Check if admin account is locked
  if (admin && admin.isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-yellow-500 text-5xl mb-4">
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Locked</h2>
          <p className="text-gray-600 mb-6">
            Your admin account is temporarily locked due to multiple failed login attempts. 
            Please try again later or contact the system administrator.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken');
              window.location.href = '/admin/login';
            }}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-ban"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required role ({requiredRole}) to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: {admin.role}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/admin"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermission && !hasAdminPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Permission Required</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permission ({requiredPermission}) to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-2">Your permissions:</p>
          <div className="text-sm text-gray-500 mb-6">
            {admin.permissions?.length > 0 ? (
              <ul className="list-disc list-inside text-left bg-gray-50 p-3 rounded">
                {admin.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-400">No permissions assigned</span>
            )}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <a
              href="/admin"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render protected admin content
  return children;
};

// HOC for specific permission requirements
export const withPermission = (permission) => {
  return (Component) => {
    return (props) => (
      <AdminProtectedRoute requiredPermission={permission}>
        <Component {...props} />
      </AdminProtectedRoute>
    );
  };
};

// HOC for specific role requirements
export const withRole = (role) => {
  return (Component) => {
    return (props) => (
      <AdminProtectedRoute requiredRole={role}>
        <Component {...props} />
      </AdminProtectedRoute>
    );
  };
};

export default AdminProtectedRoute;