import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const AdminProtectedRoute = ({
  children,
  requiredPermission = null,
  requiredRole = null,
  redirectTo = '/admin/login',
}) => {
  const { admin, isAdminAuthenticated, isInitialized, hasAdminPermission } = useAuth();
  const location = useLocation();

  if (!isInitialized) return <Loading />;

  if (!isAdminAuthenticated || !admin) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!admin.isActive) return <Navigate to="/admin/login" replace />;

  if (requiredRole && admin.role !== requiredRole && admin.role !== 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  if (requiredPermission && !hasAdminPermission(requiredPermission)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
