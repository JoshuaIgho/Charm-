import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ 
  product, 
  viewMode = 'grid', 
  onAddToCart,
  onAddToWishlist,
  showQuickView = true 
}) => {
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    try {
      if (onAddToCart) {
        await onAddToCart(product);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onAddToWishlist) {
      onAddToWishlist(product);
    }
  };

  const getImageUrl = () => {
    if (imageError) {
      return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
    }
    
    return product.primaryImage?.url || 
           product.images?.[0]?.url || 
           'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price).replace('NGN', '₦');
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex gap-6">
          {/* Product Image */}
          <div className="relative w-32 h-32 flex-shrink-0">
            <Link to={`/products/${product._id}`}>
              <img
                src={getImageUrl()}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNewStock && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    New
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    -{discountPercentage}%
                  </span>
                )}
                {product.stock?.status === 'low_stock' && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Low Stock
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 pr-4">
                <Link to={`/products/${product._id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                
                {product.category && (
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    {product.category}
                  </p>
                )}
              </div>

              {/* Wishlist Button */}
              {isAuthenticated && (
                <button
                  onClick={handleWishlistToggle}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Add to wishlist"
                >
                  <Heart className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            {/* Rating */}
            {product.reviews?.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.floor(product.reviews.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.reviews.averageRating.toFixed(1)} ({product.reviews.totalReviews})
                </span>
              </div>
            )}

            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {discountPercentage > 0 && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {showQuickView && (
                  <button
                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Quick view"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || isAddingToCart}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stock Status */}
            {!product.isAvailable && (
              <p className="text-red-600 text-sm font-medium mt-2">Out of Stock</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="product-card group">
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/products/${product._id}`}>
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNewStock && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-pulse">
              ✨ New
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
              -{discountPercentage}%
            </span>
          )}
          {product.stock?.status === 'low_stock' && (
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg animate-bounce">
              ⚠️ Low Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {isAuthenticated && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform group-hover:scale-110 shadow-lg"
            title="Add to wishlist"
          >
            <Heart className="h-5 w-5" />
          </button>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 flex items-end justify-center pb-8">
          <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
            {showQuickView && (
              <button
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl flex items-center gap-2 backdrop-blur-sm"
                title="Quick view"
              >
                <Eye className="h-5 w-5" />
                Quick View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          {product.category && (
            <p className="text-xs text-primary-600 uppercase tracking-wider font-bold mb-2 opacity-80">
              {product.category}
            </p>
          )}
          
          <Link to={`/products/${product._id}`}>
            <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-3 text-lg group-hover:text-primary-600">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating */}
        {product.reviews?.averageRating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 transition-colors ${
                    index < Math.floor(product.reviews.averageRating)
                      ? 'text-yellow-400 fill-current drop-shadow-sm'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              ({product.reviews.totalReviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {discountPercentage > 0 && (
              <span className="text-lg text-gray-500 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable || isAddingToCart}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
            !product.isAvailable 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : isAddingToCart
              ? 'bg-primary-500 text-white cursor-wait'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800'
          }`}
        >
          {isAddingToCart ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Adding to Cart...
            </>
          ) : !product.isAvailable ? (
            <>
              ❌ Out of Stock
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )

     

};

export default ProductCard;