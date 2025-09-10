import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Eye,
  Plus,
  Calendar,
  DollarSign
} from 'lucide-react';
import { InlineLoading, CardSkeleton } from '../common/Loading';
import orderService from '../../services/orderService';
import productService from '../../services/productService';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0
    },
    recentOrders: [],
    topProducts: [],
    lowStockProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Load dashboard data in parallel
      const [
        orderStatsResponse,
        productStatsResponse,
        recentOrdersResponse,
        lowStockResponse
      ] = await Promise.all([
        orderService.getOrderStats({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
        productService.getProductStats({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
        orderService.getRecentOrders(10),
        productService.getLowStockProducts()
      ]);

      const stats = {
        totalProducts: productStatsResponse.data?.totalProducts || 0,
        totalOrders: orderStatsResponse.data?.totalOrders || 0,
        totalCustomers: orderStatsResponse.data?.uniqueCustomers || 0,
        totalRevenue: orderStatsResponse.data?.totalRevenue || 0,
        pendingOrders: orderStatsResponse.data?.pendingOrders || 0,
        lowStockProducts: lowStockResponse.data?.products?.length || 0
      };

      setDashboardData({
        stats,
        recentOrders: recentOrdersResponse.data?.orders || [],
        lowStockProducts: lowStockResponse.data?.products?.slice(0, 5) || []
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount).replace('NGN', '₦');
  };

  const statCards = [
    {
      title: 'Total Products',
      value: dashboardData.stats.totalProducts,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      change: '+12%',
      changeType: 'positive',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600 bg-green-100',
      change: '+8%',
      changeType: 'positive',
      link: '/admin/orders'
    },
    {
      title: 'Total Customers',
      value: dashboardData.stats.totalCustomers,
      icon: Users,
      color: 'text-purple-600 bg-purple-100',
      change: '+23%',
      changeType: 'positive',
      link: '/admin/customers'
    },
    {
      title: 'Revenue',
      value: formatCurrency(dashboardData.stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
      change: '+15%',
      changeType: 'positive',
      link: '/admin/analytics'
    }
  ];

  const alertCards = [
    {
      title: 'Pending Orders',
      value: dashboardData.stats.pendingOrders,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
      link: '/admin/orders?status=pending'
    },
    {
      title: 'Low Stock Items',
      value: dashboardData.stats.lowStockProducts,
      icon: Package,
      color: 'text-red-600 bg-red-100',
      link: '/admin/products?stock=low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last year</option>
          </select>
          
          <Link
            to="/admin/products"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
          >
            {isLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </>
            )}
          </Link>
        ))}
      </div>

      {/* Alert Cards */}
      {(dashboardData.stats.pendingOrders > 0 || dashboardData.stats.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alertCards.map((alert) => (
            alert.value > 0 && (
              <Link
                key={alert.title}
                to={alert.link}
                className="bg-white rounded-lg border-l-4 border-yellow-400 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${alert.color}`}>
                    <alert.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {alert.value}
                    </div>
                    <div className="text-sm text-gray-600">{alert.title}</div>
                    <div className="text-sm text-primary-600 font-medium mt-1">
                      Click to view →
                    </div>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.customerName || 'Guest'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent orders</p>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <Link
              to="/admin/products?stock=low"
              className="text-primary-600 hover:text-primary-500 font-medium text-sm"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : dashboardData.lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-600 font-medium">
                      {product.stock.quantity} left
                    </div>
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="text-primary-600 hover:text-primary-500 text-sm"
                    >
                      Update Stock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">All products are well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-primary-600" />
            <span className="font-medium">Add New Product</span>
          </Link>
          
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-green-600" />
            <span className="font-medium">View All Orders</span>
          </Link>
          
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Manage Products</span>
          </Link>
          
          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="font-medium">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;