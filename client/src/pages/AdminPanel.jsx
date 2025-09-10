import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProductManagement from '../components/admin/ProductManagement.jsx';
import OrderManagement from '../components/admin/OrderManagement.jsx';
import AdminSettings from '../components/admin/AdminSettings.jsx';

const AdminPanel = () => {
  const location = useLocation();
  const { admin, adminLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      permission: null // No specific permission required
    },
    {
      path: '/admin/products',
      icon: Package,
      label: 'Products',
      permission: 'manage_products'
    },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: 'Orders',
      permission: 'manage_orders'
    },
    {
      path: '/admin/customers',
      icon: Users,
      label: 'Customers',
      permission: 'manage_users'
    },
    {
      path: '/admin/settings',
      icon: Settings,
      label: 'Settings',
      permission: 'manage_settings'
    }
  ];

  // Filter menu items based on admin permissions
  const visibleMenuItems = menuItems.filter(item => 
    !item.permission || admin?.hasPermission?.(item.permission) || admin?.role === 'super_admin'
  );

  const handleLogout = () => {
    adminLogout();
  };

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => item.path === currentPath);
    return currentItem?.label || 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <Link to="/admin" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">TA</span>
            </div>
            <span className="text-lg font-bold">Admin Panel</span>
          </Link>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {visibleMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {admin?.firstName?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {admin?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {admin?.role || 'admin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  {isSidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>

                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Welcome back, {admin?.firstName}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Admin Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-semibold">
                        {admin?.firstName?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {admin?.email}
                        </div>
                        <Link
                          to="/admin/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Account Settings
                        </Link>
                        <a
                          href="/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          View Website
                        </a>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/customers" element={
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Management</h2>
                <p className="text-gray-600">Customer management features coming soon...</p>
              </div>
            } />
            <Route path="/settings" element={<AdminSettings />} />
            
            {/* Redirect /admin/* to /admin */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;