import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Heart,
  MapPin,
  Package,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

// Create a portal component for the dropdown
const DropdownPortal = ({ isOpen, onClose, position, children }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if click was on the user menu button
        const userMenuButton = document.querySelector('[data-user-menu-button]');
        if (userMenuButton && !userMenuButton.contains(event.target)) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="fixed z-50 bg-white rounded-3xl shadow-elegant-lg border border-gray-100 animate-scale-in overflow-hidden"
      style={position}
    >
      {/* Close button for dropdown */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
        aria-label="Close menu"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
      {children}
    </div>
  );
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemsCount, getTotalPrice } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({});
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect for header background only
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          !event.target.closest('[data-mobile-menu-button]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (!headerRef.current) return;
    
    const headerRect = headerRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: headerRect.bottom + window.scrollY,
      right: window.innerWidth - headerRect.right,
      width: '288px' // Fixed width for the dropdown
    });
  };

  // Navigation links
  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/products' },
    { name: 'Rings', path: '/products?category=rings' },
    { name: 'Necklaces', path: '/products?category=necklaces' },
    { name: 'Earrings', path: '/products?category=earrings' },
    { name: 'Bracelets', path: '/products?category=bracelets' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    if (!isUserMenuOpen) {
      updateDropdownPosition();
    }
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const cartItemsCount = getItemsCount();
  const cartTotal = getTotalPrice();

  return (
    <>
      <header 
        ref={headerRef}
        className={`sticky top-0 z-40 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white bg-opacity-95 backdrop-blur-xl shadow-elegant border-b border-gray-200' 
            : 'bg-white shadow-elegant'
        }`}
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white text-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 animate-gradient bg-size-200"></div>
          <div className="container-custom py-3 relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 animate-fade-in-right">
                  <MapPin className="h-4 w-4 text-primary-200" />
                  <span className="font-semibold">Lagos, Nigeria</span>
                </div>
                <div className="hidden sm:block animate-fade-in-right" style={{ animationDelay: '0.2s' }}>
                  <span className="bg-white bg-opacity-20 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border border-white border-opacity-30">
                    ✨ Free shipping on orders over ₦50,000
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="hidden md:flex items-center gap-2 hover:text-primary-200 transition-colors cursor-pointer font-medium">
                  📞 +234-123-456-7890
                </span>
                <span className="hidden md:flex items-center gap-2 hover:text-primary-200 transition-colors cursor-pointer font-medium">
                  ✉️ info@ta-jewelry.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container-custom py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-4 text-2xl font-bold group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl flex items-center justify-center shadow-elegant group-hover:shadow-elegant-lg transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                <span className="text-white text-xl font-black relative z-10">CBS</span>
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <span className="block text-gradient-primary font-black tracking-tight text-2xl">
                  CHARMÉ
                </span>
                <span className="block text-xs text-gray-600 font-semibold tracking-widest uppercase">
                  For the C-Girlies
                </span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative group">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for beautiful jewelry..."
                    className="w-full pl-14 pr-16 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white text-lg placeholder-gray-400 group-hover:border-gray-300 shadow-inner focus:shadow-lg"
                  />
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Button - Mobile */}
              <button 
                className="md:hidden p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-105"
                onClick={() => {/* Handle mobile search */}}
              >
                <Search className="h-6 w-6 text-gray-600" />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link 
                  to="/wishlist" 
                  className="p-3 hover:bg-gray-100 rounded-2xl relative transition-all duration-300 group hover:scale-105"
                >
                  <Heart className="h-6 w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                    Your Wishlist
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link 
                to="/cart" 
                className="p-3 hover:bg-gray-100 rounded-2xl relative transition-all duration-300 group hover:scale-105"
              >
                <ShoppingBag className="h-6 w-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white px-4 py-2 rounded-xl text-xs whitespace-nowrap">
                  {cartItemsCount > 0 ? `${cartItemsCount} items - ₦${cartTotal.toLocaleString()}` : 'Your cart is empty'}
                </div>
              </Link>

              {/* User Menu */}
<div className="relative">
  {isAuthenticated ? (
    <div>
      <button
        data-user-menu-button
        onClick={handleUserMenuToggle}
        className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-2xl transition-all duration-300 group hover:scale-105"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center border-2 border-primary-300 group-hover:border-primary-400 transition-all duration-300 shadow-lg">
          <span className="text-primary-700 text-lg font-bold">
            {user?.firstName?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-bold text-gray-900">
            {user?.firstName || 'User'}
          </div>
          <div className="text-xs text-gray-500 font-medium">My Account</div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
      </button>
    </div>
  ) : (
    <div className="hidden md:flex items-center gap-2">
      <Link
        to="/login"
        className="px-6 py-3 text-sm font-semibold text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
      >
        Sign In
      </Link>
      <Link
        to="/register"
        className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
      >
        Sign Up
      </Link>
    </div>
  )}

  {/* Mobile Menu Button - Show on iPad and smaller */}
  <button
    data-mobile-menu-button
    onClick={handleMobileMenuToggle}
    className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 hover:scale-105 ml-2"
  >
    {isMobileMenuOpen ? (
      <X className="h-6 w-6 text-gray-600" />
    ) : (
      <Menu className="h-6 w-6 text-gray-600" />
    )}
  </button>
</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Desktop */}
        <div className="hidden lg:block border-t border-gray-100">
          <div className="container-custom">
            <nav className="flex items-center justify-center space-x-12 py-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-all duration-300 hover:text-primary-600 relative group ${
                    location.pathname === link.path 
                      ? 'text-primary-600' 
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-primary-600 to-primary-700 transform origin-left transition-transform duration-300 ${
                    location.pathname === link.path 
                      ? 'scale-x-100' 
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* User Dropdown Portal */}
      <DropdownPortal
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        position={dropdownPosition}
      >
        <div className="p-2">
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-primary-300 rounded-2xl flex items-center justify-center">
                <span className="text-primary-700 text-lg font-bold">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-600">{user?.email}</div>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-all duration-200"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              My Profile
            </Link>
            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-all duration-200"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Package className="h-4 w-4" />
              Order History
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-all duration-200"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              My Wishlist
            </Link>
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-70 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-all duration-200"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </div>
      </DropdownPortal>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 pt-[1px] bg-black bg-opacity-50 z-40">
          <div ref={mobileMenuRef} className="bg-white h-full overflow-y-auto animate-slide-down">
            <div className="container-custom py-6">
              {/* Mobile Menu Header with Close Button */}
              <div className="flex justify-between items-center mb-8 px-4">
                <h2 className="text-xl font-bold text-gray-900"></h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mb-8 px-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for beautiful jewelry..."
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-2 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4 px-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-6 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700 border-l-4 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Actions - Only show for unauthenticated users */}
              {!isAuthenticated && (
                <div className="mt-8 space-y-3 px-4">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 text-center">
                    <h3 className="text-lg font-bold text-primary-800 mb-2">Join TA Jewelry</h3>
                    <p className="text-sm text-primary-600 mb-4">Get exclusive access to new collections and member-only deals!</p>
                    <div className="space-y-3">
                      <Link
                        to="/register"
                        className="block w-full text-center px-6 py-3 text-sm font-semibold bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 shadow-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Create Account
                      </Link>
                      <Link
                        to="/login"
                        className="block w-full text-center px-6 py-3 text-sm font-semibold text-primary-600 border-2 border-primary-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500">
                      Already have an account? <Link to="/login" className="text-primary-600 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>Sign in here</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;