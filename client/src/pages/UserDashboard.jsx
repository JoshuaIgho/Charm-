import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import orderService from '../services/orderService';
import { InlineLoading, CardSkeleton } from '../components/common/Loading';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { getItemsCount, getTotalPrice } = useCart();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load user dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load recent orders
        const ordersResponse = await orderService.getUserOrders({ 
          limit: 5, 
          sort: '-createdAt' 
        });
        
        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data.orders || []);
          
          // Calculate order stats
          const orders = ordersResponse.data.orders || [];
          const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(order => order.status === 'pending').length,
            completedOrders: orders.filter(order => order.status === 'delivered').length,
            totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
          };
          setOrderStats(stats);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
      case 'confirmed':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'processing':
      case 'confirmed':
        return 'badge-primary';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'badge-success';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-secondary';
    }
  };



  const cartCount = getItemsCount();
  const cartTotal = getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        

          {/* Main Content */}
          <div className="lg:col-span-12">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Welcome Message */}
                <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Welcome back, {user?.firstName}! 👋
                      </h2>
                      <p className="text-primary-100">
                        Here's what's happening with your account today.
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <ShoppingBag className="h-16 w-16 text-primary-200" />
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.totalOrders || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Orders</div>
                  </div>

                  <div className="card text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.pendingOrders || 0}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>

                  <div className="card text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {isLoading ? <InlineLoading size="sm" /> : orderStats.completedOrders || 0}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>

                  <div className="card text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {cartCount}
                    </div>
                    <div className="text-sm text-gray-600">Items in Cart</div>
                  </div>
                </div>

                {/* Current Cart */}
                {cartCount > 0 && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Current Cart</h3>
                      <Link to="/cart" className="text-primary-600 hover:text-primary-500 font-medium">
                        View Cart
                      </Link>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                          </div>
                          <div className="text-sm text-gray-600">Ready for checkout</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600">
                            ₦{cartTotal.toLocaleString()}
                          </div>
                          <Link to="/checkout" className="btn-primary btn-sm mt-2">
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View All
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length > 0 ? (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <div>
                                  <div className="font-medium text-gray-900">
                                    Order #{order.orderNumber}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              <span className={`badge ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">
                                ₦{order.totalAmount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.items?.length || 0} items
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
                      <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                      <Link to="/products" className="btn-primary">
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                {/* Orders content will go here */}
                <div className="text-center py-8">
                  <p className="text-gray-600">Orders page content coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Wishlist</h3>
                {/* Wishlist content will go here */}
                <div className="text-center py-8">
                  <p className="text-gray-600">Wishlist page content coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Addresses</h3>
                {/* Addresses content will go here */}
                <div className="text-center py-8">
                  <p className="text-gray-600">Addresses page content coming soon...</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                {/* Settings content will go here */}
                <div className="text-center py-8">
                  <p className="text-gray-600">Settings page content coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;