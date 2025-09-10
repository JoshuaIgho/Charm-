import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import productService from '../services/productService';

// Create Cart Context
const CartContext = createContext(null);

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage
  const initializeCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validate cart structure
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      localStorage.removeItem('cart');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage
  const saveCartToStorage = useCallback((cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }, []);

  // Initialize cart on mount
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(items);
    }
  }, [items, isInitialized, saveCartToStorage]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      // Optional: Ask user if they want to keep cart items
      // For now, we'll keep cart items for guest users
    }
  }, [isAuthenticated, items.length]);

  // Add item to cart
  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      setIsLoading(true);

      // Validate product and quantity
      if (!product || !product._id) {
        throw new Error('Invalid product');
      }

      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }

      // Check if product is available
      if (!product.isAvailable || product.stock?.status !== 'in_stock') {
        throw new Error('Product is currently out of stock');
      }

      // Check if enough stock is available
      const availableQuantity = product.availableQuantity || product.stock?.quantity || 0;
      const existingItem = items.find(item => item.product._id === product._id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const totalQuantity = currentQuantity + quantity;

      if (totalQuantity > availableQuantity) {
        throw new Error(`Only ${availableQuantity} items available in stock`);
      }

      // Update cart items
      setItems(prevItems => {
        if (existingItem) {
          // Update existing item quantity
          return prevItems.map(item =>
            item.product._id === product._id
              ? { ...item, quantity: totalQuantity }
              : item
          );
        } else {
          // Add new item
          return [...prevItems, {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
              images: product.images,
              primaryImage: product.primaryImage,
              sku: product.sku,
              isAvailable: product.isAvailable,
              stock: product.stock
            },
            quantity: quantity,
            addedAt: new Date().toISOString()
          }];
        }
      });

      toast.success(`${product.name} added to cart`);
      return { success: true };

    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    try {
      const item = items.find(item => item.product._id === productId);
      if (item) {
        setItems(prevItems => prevItems.filter(item => item.product._id !== productId));
        toast.success(`${item.product.name} removed from cart`);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  }, [items]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    try {
      if (newQuantity < 1) {
        removeFromCart(productId);
        return;
      }

      const item = items.find(item => item.product._id === productId);
      if (!item) return;

      // Check stock availability
      const availableQuantity = item.product.availableQuantity || item.product.stock?.quantity || 0;
      if (newQuantity > availableQuantity) {
        toast.error(`Only ${availableQuantity} items available in stock`);
        return;
      }

      setItems(prevItems =>
        prevItems.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update item quantity');
    }
  }, [items, removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    try {
      setItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  }, []);

  // Get cart item by product ID
  const getCartItem = useCallback((productId) => {
    return items.find(item => item.product._id === productId);
  }, [items]);

  // Check if product is in cart
  const isInCart = useCallback((productId) => {
    return items.some(item => item.product._id === productId);
  }, [items]);

  // Get total quantity of items in cart
  const getTotalQuantity = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Get total price of items in cart
  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  // Get cart summary
  const getCartSummary = useCallback(() => {
    const totalQuantity = getTotalQuantity();
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.075; // 7.5% tax (adjust as needed)
    const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over ₦50,000
    const total = subtotal + tax + shipping;

    return {
      totalQuantity,
      subtotal,
      tax,
      shipping,
      total,
      hasItems: totalQuantity > 0
    };
  }, [getTotalQuantity, getTotalPrice]);

  // Validate cart items against current product data
  const validateCart = useCallback(async () => {
    try {
      if (items.length === 0) return { valid: true, issues: [] };

      setIsLoading(true);
      const productIds = items.map(item => item.product._id);
      
      // Check product availability
      const availabilityResponse = await productService.checkAvailability(
        items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity
        }))
      );

      const issues = [];
      const updatedItems = [];

      for (const item of items) {
        const productCheck = availabilityResponse.data.find(
          check => check.productId === item.product._id
        );

        if (!productCheck) {
          issues.push({
            type: 'unavailable',
            productName: item.product.name,
            message: 'Product no longer available'
          });
          continue;
        }

        if (!productCheck.available) {
          issues.push({
            type: 'out_of_stock',
            productName: item.product.name,
            message: 'Product is out of stock'
          });
          continue;
        }

        if (item.quantity > productCheck.availableQuantity) {
          const adjustedQuantity = Math.min(item.quantity, productCheck.availableQuantity);
          updatedItems.push({
            ...item,
            quantity: adjustedQuantity
          });
          
          issues.push({
            type: 'quantity_adjusted',
            productName: item.product.name,
            message: `Quantity adjusted from ${item.quantity} to ${adjustedQuantity}`,
            originalQuantity: item.quantity,
            adjustedQuantity
          });
        } else {
          updatedItems.push(item);
        }

        // Check for price changes
        if (productCheck.currentPrice !== item.product.price) {
          updatedItems[updatedItems.length - 1].product.price = productCheck.currentPrice;
          issues.push({
            type: 'price_changed',
            productName: item.product.name,
            message: `Price updated from ₦${item.product.price.toLocaleString()} to ₦${productCheck.currentPrice.toLocaleString()}`,
            oldPrice: item.product.price,
            newPrice: productCheck.currentPrice
          });
        }
      }

      // Update cart with validated items
      if (updatedItems.length !== items.length || issues.length > 0) {
        setItems(updatedItems);
      }

      return {
        valid: issues.length === 0,
        issues,
        updatedItems
      };

    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        valid: false,
        issues: [{
          type: 'validation_error',
          message: 'Unable to validate cart items'
        }]
      };
    } finally {
      setIsLoading(false);
    }
  }, [items]);

  // Prepare cart for checkout
  const prepareCheckout = useCallback(async () => {
    try {
      const validation = await validateCart();
      
      if (!validation.valid) {
        // Show validation issues to user
        validation.issues.forEach(issue => {
          if (issue.type === 'unavailable' || issue.type === 'out_of_stock') {
            toast.error(issue.message);
          } else {
            toast.warning(issue.message);
          }
        });

        if (validation.issues.some(issue => 
          issue.type === 'unavailable' || issue.type === 'out_of_stock'
        )) {
          return { success: false, issues: validation.issues };
        }
      }

      // Prepare checkout data
      const checkoutData = {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        summary: getCartSummary()
      };

      return { success: true, data: checkoutData };

    } catch (error) {
      console.error('Error preparing checkout:', error);
      toast.error('Unable to prepare checkout');
      return { success: false, error: error.message };
    }
  }, [items, validateCart, getCartSummary]);

  // Sync cart with server (for authenticated users)
  const syncCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // This would sync cart with user's saved cart on server
      // Implementation depends on your backend cart sync endpoint
      // For now, we'll just validate the current cart
      await validateCart();
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, [isAuthenticated, validateCart]);

  // Import cart from external source (e.g., wishlist)
  const importItems = useCallback((externalItems) => {
    try {
      const validItems = externalItems.filter(item => 
        item.product && item.product._id && item.quantity > 0
      );

      setItems(prevItems => {
        const merged = [...prevItems];
        
        validItems.forEach(newItem => {
          const existingIndex = merged.findIndex(
            item => item.product._id === newItem.product._id
          );
          
          if (existingIndex >= 0) {
            merged[existingIndex].quantity += newItem.quantity;
          } else {
            merged.push({
              ...newItem,
              addedAt: new Date().toISOString()
            });
          }
        });

        return merged;
      });

      toast.success(`${validItems.length} items added to cart`);
    } catch (error) {
      console.error('Error importing items:', error);
      toast.error('Failed to import items to cart');
    }
  }, []);

  // Get cart items count for display
  const getItemsCount = useCallback(() => {
    return items.length;
  }, [items.length]);

  // Check if cart needs attention (out of stock items, etc.)
  const needsAttention = useCallback(() => {
    return items.some(item => 
      !item.product.isAvailable || 
      item.product.stock?.status !== 'in_stock'
    );
  }, [items]);

  // Get cart weight for shipping calculations
  const getTotalWeight = useCallback(() => {
    return items.reduce((total, item) => {
      const weight = item.product.weight?.value || 0;
      return total + (weight * item.quantity);
    }, 0);
  }, [items]);

  const value = {
    // State
    items,
    isLoading,
    isInitialized,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // Getters
    getCartItem,
    isInCart,
    getTotalQuantity,
    getTotalPrice,
    getCartSummary,
    getItemsCount,
    getTotalWeight,

    // Utilities
    validateCart,
    prepareCheckout,
    syncCart,
    importItems,
    needsAttention
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};

// Export context for advanced use cases
export { CartContext };
export default useCart;