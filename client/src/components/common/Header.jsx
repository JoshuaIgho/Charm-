import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/"); // redirect after logout
  };

  return (
    <header className="shadow-sm border-b">
      {/* Top bar */}
      <div className="bg-orange-600 text-white text-sm px-6 py-2 flex justify-between items-center">
        <span>Lagos, Nigeria</span>
        <span>✨ Free shipping on orders over ₦50,000</span>
        <div className="flex items-center space-x-4">
          <a href="tel:+2341234567890">+234-123-456-7890</a>
          <a href="mailto:info@ta-jewelry.com">info@ta-jewelry.com</a>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-orange-600">
          CHARMÉ
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-lg mx-6">
          <input
            type="text"
            placeholder="Search for beautiful jewelry..."
            className="w-full border rounded-md px-4 py-2 focus:outline-none"
          />
        </div>

        {/* Right side (cart + auth) */}
        <div className="flex items-center space-x-6">
          <Link to="/cart" className="flex items-center space-x-1">
            <ShoppingBag size={20} />
            <span>Cart</span>
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/sign-in"
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1 font-medium">
                <User size={18} />
                <span>{user?.firstName || "User"}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 border rounded-md hover:bg-gray-50"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <nav className="bg-white px-6 py-3 border-t">
        <ul className="flex space-x-6 font-medium text-gray-700">
          <li>
            <Link to="/" className="hover:text-orange-600">
              Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-orange-600">
              All Products
            </Link>
          </li>
          <li>
            <Link to="/rings" className="hover:text-orange-600">
              Rings
            </Link>
          </li>
          <li>
            <Link to="/necklaces" className="hover:text-orange-600">
              Necklaces
            </Link>
          </li>
          <li>
            <Link to="/earrings" className="hover:text-orange-600">
              Earrings
            </Link>
          </li>
          <li>
            <Link to="/bracelets" className="hover:text-orange-600">
              Bracelets
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
