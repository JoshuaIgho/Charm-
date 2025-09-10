import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import productService from '../services/productService';
import { InlineLoading, CardSkeleton } from '../components/common/Loading';
import SignupModal from '../components/customer/SignupModal';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Load homepage data
  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        setIsLoading(true);
        
        // Load featured products and new arrivals in parallel
        const [featuredResponse, newArrivalsResponse] = await Promise.all([
          productService.getFeaturedProducts(8),
          productService.getNewArrivals(8)
        ]);

        if (featuredResponse.success) {
          setFeaturedProducts(featuredResponse.data.products || []);
        }

        if (newArrivalsResponse.success) {
          setNewArrivals(newArrivalsResponse.data.products || []);
        }
      } catch (error) {
        console.error('Error loading homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomepageData();
  }, []);

  // Show signup modal for new visitors
  useEffect(() => {
    if (!isAuthenticated) {
      const hasSeenModal = localStorage.getItem('hasSeenSignupModal');
      if (!hasSeenModal) {
        const timer = setTimeout(() => {
          setShowSignupModal(true);
          localStorage.setItem('hasSeenSignupModal', 'true');
        }, 5000); // Show after 5 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    if (!result.success && !isAuthenticated) {
      // Optionally show signup modal or login prompt
    }
  };

  const categories = [
    {
      name: 'Rings',
      path: '/products?category=rings',
      image: '/images/categories/rings.jpg',
      description: 'Elegant rings for every occasion'
    },
    {
      name: 'Necklaces',
      path: '/products?category=necklaces',
      image: '/images/categories/necklaces.jpg',
      description: 'Beautiful necklaces for every style'
    },
    {
      name: 'Earrings',
      path: '/products?category=earrings',
      image: '/images/categories/earrings.jpg',
      description: 'Stunning earrings for every style'
    },
    {
      name: 'Bracelets',
      path: '/products?category=bracelets',
      image: '/images/categories/bracelets.jpg',
      description: 'Delicate bracelets for any wrist'
    }
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders over ₦50,000'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Your payment information is safe with us'
    },
    {
      icon: RefreshCw,
      title: 'Easy Returns',
      description: '30-day return policy on all items'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'Authentic jewelry with lifetime warranty'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white opacity-10 rounded-full animate-bounce-subtle"></div>
          <div className="absolute top-32 right-20 w-32 h-32 border-2 border-gold-400 opacity-20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 border-2 border-white opacity-15 rounded-full animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 opacity-20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative container-custom section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-fade-in-up">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
                  <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></span>
                  New Collection Available
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-black leading-tight">
                  Meaningful 
                  <span className="block bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent animate-pulse">
                    Everyday Jewelry
                  </span>
                  <span className="block text-4xl lg:text-5xl font-light mt-2">
                    for the T-Girlies ✨
                  </span>
                </h1>
                
                <p className="text-xl text-gray-100 leading-relaxed max-w-xl font-light">
                  Discover our curated collection of elegant jewelry pieces designed 
                  to celebrate your unique style and tell your story every single day.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link
                  to="/products"
                  className="group relative overflow-hidden bg-gradient-to-r from-gold-500 to-gold-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-500 shadow-2xl hover:shadow-gold/25 transform hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Shop Collection
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                </Link>
                
                <Link
                  to="/about"
                  className="group border-2 border-white text-white hover:bg-white hover:text-primary-900 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 backdrop-blur-sm bg-white bg-opacity-10 hover:bg-opacity-100"
                >
                  <span className="flex items-center justify-center gap-3">
                    Our Story
                    <div className="w-2 h-2 bg-current rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                  </span>
                </Link>
              </div>

              {/* Special Offer */}
              <div className="glass-dark rounded-3xl p-8 border border-white border-opacity-20 transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl font-black">%</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Special Offer for New T-Girls</h3>
                    <p className="text-gray-200 leading-relaxed">
                      Get 10% off your first order when you join our exclusive community
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSignupModal(true)}
                  className="group text-gold-300 hover:text-gold-200 font-semibold flex items-center gap-2 transition-colors"
                >
                  Claim Your Discount
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-in-up lg:animate-fade-in-right">
              <div className="relative aspect-square">
                {/* Decorative rings */}
                <div className="absolute inset-0 rounded-full border-2 border-white opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full border-2 border-gold-400 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                
                <div className="relative z-10 aspect-square bg-gradient-to-br from-white to-gray-100 rounded-full overflow-hidden shadow-2xl border-8 border-white border-opacity-30">
                  <img
                    src="/images/hero-jewelry.jpg"
                    alt="Beautiful jewelry collection"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center animate-bounce-subtle shadow-2xl">
                  <Heart className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-2xl">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="text-center group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary-600 group-hover:text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-section text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our carefully curated collections, each piece selected for its 
              beauty, quality, and timeless appeal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={category.path}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card card-hover overflow-hidden">
                  <div className="aspect-square overflow-hidden rounded-lg mb-4">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center text-primary-600 font-medium">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-section text-gray-900 mb-4">Featured Collection</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked pieces that embody elegance and sophistication. 
              These are our most loved items by customers.
            </p>
          </div>

          {isLoading ? (
            <div className="product-grid">
              <CardSkeleton count={8} />
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.slice(0, 8).map((product, index) => (
                <div 
                  key={product._id}
                  className="card card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4 group">
                    <img
                      src={product.primaryImage?.url || product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    
                    {product.isNewStock && (
                      <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        New
                      </span>
                    )}
                    
                    {product.isOnSale && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Sale
                      </span>
                    )}

                    {/* Quick Add to Cart */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="btn-primary"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₦{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                        <span className="text-lg font-bold text-primary-600">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      {product.reviews?.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {product.reviews.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products" className="btn-primary btn-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-section text-gray-900 mb-4">New Arrivals</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Fresh additions to our collection. Be the first to discover 
                these beautiful new pieces.
              </p>
            </div>

            <div className="product-grid">
              {newArrivals.slice(0, 4).map((product, index) => (
                <div 
                  key={product._id}
                  className="card card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg mb-4 group">
                    <img
                      src={product.primaryImage?.url || product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      New
                    </span>

                    {/* Quick Add to Cart */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="btn-primary"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        ₦{product.price.toLocaleString()}
                      </span>
                      
                      {product.reviews?.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {product.reviews.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/products?new=true" className="btn-outline">
                View All New Arrivals
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="section-padding bg-primary-600 text-white">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-section mb-4">Stay in the Loop</h2>
            <p className="text-lg text-primary-100 mb-8">
              Be the first to know about new collections, exclusive offers, 
              and styling tips delivered straight to your inbox.
            </p>
            
            <button
              onClick={() => setShowSignupModal(true)}
              className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Join Our Newsletter
            </button>
            
            <p className="text-primary-200 text-sm mt-4">
              Plus get 10% off your first order!
            </p>
          </div>
        </div>
      </section>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  );
};

export default HomePage;