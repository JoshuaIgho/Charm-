import apiService from './api';

const orderService = {
  // CUSTOMER ORDER METHODS

  // Create new order
  createOrder: async (orderData) => {
    return await apiService.post('/orders', orderData);
  },

  // Get user's orders
  getUserOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/orders/my-orders?${queryString}`);
  },

  // Get single order details
  getOrder: async (orderId) => {
    return await apiService.get(`/orders/${orderId}`);
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber) => {
    return await apiService.get(`/orders/number/${orderNumber}`);
  },

  // Track order status
  trackOrder: async (orderNumber) => {
    return await apiService.get(`/orders/track/${orderNumber}`);
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    return await apiService.patch(`/orders/${orderId}/cancel`, { reason });
  },

  // Request return/refund
  requestReturn: async (orderId, returnData) => {
    return await apiService.post(`/orders/${orderId}/return`, returnData);
  },

  // GUEST ORDER METHODS

  // Create guest order
  createGuestOrder: async (orderData) => {
    return await apiService.post('/orders/guest', orderData);
  },

  // Track guest order
  trackGuestOrder: async (orderNumber, email) => {
    return await apiService.post('/orders/guest/track', { orderNumber, email });
  },

  // ADMIN ORDER METHODS

  // Get all orders (admin)
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/admin/orders?${queryString}`);
  },

  // Get order details (admin)
  getAdminOrder: async (orderId) => {
    return await apiService.get(`/admin/orders/${orderId}`);
  },

  // Update order status
  updateOrderStatus: async (orderId, status, note = '') => {
    return await apiService.patch(`/admin/orders/${orderId}/status`, { status, note });
  },

  // Update payment status
  updatePaymentStatus: async (orderId, paymentStatus, paymentData = {}) => {
    return await apiService.patch(`/admin/orders/${orderId}/payment`, { 
      paymentStatus, 
      ...paymentData 
    });
  },

  // Add tracking number
  addTrackingNumber: async (orderId, trackingNumber, shippingMethod = 'standard') => {
    return await apiService.patch(`/admin/orders/${orderId}/tracking`, { 
      trackingNumber, 
      shippingMethod 
    });
  },

  // Process refund
  processRefund: async (orderId, refundData) => {
    return await apiService.post(`/admin/orders/${orderId}/refund`, refundData);
  },

  // Add admin note
  addAdminNote: async (orderId, note) => {
    return await apiService.post(`/admin/orders/${orderId}/notes`, { note });
  },

  // Bulk update orders
  bulkUpdateOrders: async (orderIds, updateData) => {
    return await apiService.patch('/admin/orders/bulk-update', { 
      orderIds, 
      updateData 
    });
  },

  // ANALYTICS AND REPORTING

  // Get order statistics
  getOrderStats: async (dateRange = null) => {
    const params = dateRange ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}` : '';
    return await apiService.get(`/admin/orders/stats${params}`);
  },

  // Get sales analytics
  getSalesAnalytics: async (period = 'week') => {
    return await apiService.get(`/admin/orders/analytics?period=${period}`);
  },

  // Get top customers
  getTopCustomers: async (limit = 10, dateRange = null) => {
    let params = `?limit=${limit}`;
    if (dateRange) {
      params += `&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    }
    return await apiService.get(`/admin/orders/top-customers${params}`);
  },

  // Get recent orders
  getRecentOrders: async (limit = 10) => {
    return await apiService.get(`/admin/orders/recent?limit=${limit}`);
  },

  // Get orders by status
  getOrdersByStatus: async (status, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.get(`/admin/orders/status/${status}?${queryString}`);
  },

  // REPORTS

  // Generate order report
  generateOrderReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.download(`/admin/orders/report?${queryString}`, 'orders-report.xlsx');
  },

  // Generate sales report
  generateSalesReport: async (dateRange) => {
    const params = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
    return await apiService.download(`/admin/orders/sales-report${params}`, 'sales-report.xlsx');
  },

  // Generate customer report
  generateCustomerReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiService.download(`/admin/orders/customer-report?${queryString}`, 'customer-report.xlsx');
  },

  // PAYMENT METHODS

  // Initialize payment
  initializePayment: async (orderId, paymentMethod) => {
    return await apiService.post(`/orders/${orderId}/payment/initialize`, { paymentMethod });
  },

  // Verify payment
  verifyPayment: async (orderId, paymentReference) => {
    return await apiService.post(`/orders/${orderId}/payment/verify`, { paymentReference });
  },

  // Process payment webhook
  processPaymentWebhook: async (webhookData) => {
    return await apiService.post('/orders/payment/webhook', webhookData);
  },

  // SHIPPING METHODS

  // Calculate shipping cost
  calculateShippingCost: async (shippingData) => {
    return await apiService.post('/orders/shipping/calculate', shippingData);
  },

  // Get shipping methods
  getShippingMethods: async (location = null) => {
    const params = location ? `?location=${location}` : '';
    return await apiService.get(`/orders/shipping/methods${params}`);
  },

  // Update shipping address
  updateShippingAddress: async (orderId, shippingAddress) => {
    return await apiService.patch(`/orders/${orderId}/shipping-address`, { shippingAddress });
  },

  // UTILITY METHODS

  // Validate order data
  validateOrder: async (orderData) => {
    return await apiService.post('/orders/validate', orderData);
  },

  // Get order template for guest checkout
  getOrderTemplate: async () => {
    return await apiService.get('/orders/template');
  },

  // Check discount code
  validateDiscountCode: async (code, orderTotal) => {
    return await apiService.post('/orders/discount/validate', { code, orderTotal });
  },

  // Apply discount code
  applyDiscountCode: async (orderId, code) => {
    return await apiService.post(`/orders/${orderId}/discount/apply`, { code });
  },

  // Remove discount code
  removeDiscountCode: async (orderId) => {
    return await apiService.delete(`/orders/${orderId}/discount`);
  }
};

export default orderService;