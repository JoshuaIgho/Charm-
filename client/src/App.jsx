// App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  UserButton,
} from "@clerk/clerk-react";

import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";

// Layout Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import UserDashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import WishlistPage from "./pages/WishlistPage";
import AddressesPage from "./pages/AddressesPage";
import SettingsPage from "./pages/SettingsPage";

// Global Styles
import "./styles/globals.css";
import "./style.css";

// ---------------- ADMIN LOGIN ----------------
function AdminLogin({ handleSuccess }) {
  return (
    <div className="login-container flex items-center justify-center min-h-[70vh]">
      <div className="login-card p-6 bg-white shadow rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Portal</h1>
        <p className="text-gray-600 mb-4">
          Please sign in with your Google account
        </p>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Google Login Failed")}
          theme="filled_blue"
          size="large"
          text="signin_with"
          shape="pill"
        />
      </div>
    </div>
  );
}

// ---------------- ADMIN PROTECTED ROUTE ----------------
function AdminProtectedRoute({ isAuthenticated, user, handleLogout }) {
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You must log in with Google to view this page.
          </p>
          <a
            href="/admin"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return <AdminPanel user={user} onLogout={handleLogout} />;
}

// ---------------- MAIN ROUTES ----------------
function AppRoutes({ isAuthenticated, setIsAuthenticated, user, setUser }) {
  const navigate = useNavigate();

  // Handle Google OAuth Success
  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem("adminUser", JSON.stringify(userData));

      navigate("/adminPanel");
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />

      {/* Clerk Auth */}
      <Route
        path="/sign-in"
        element={<SignIn routing="path" path="/sign-in" />}
      />
      <Route
        path="/sign-up"
        element={<SignUp routing="path" path="/sign-up" />}
      />

      {/* User Dashboard (Clerk Protected) */}
      <Route
        path="/dashboard"
        element={
          <SignedIn>
            <UserDashboard />
          </SignedIn>
        }
      />

      {/* Extra Clerk Protected Routes */}
      <Route
        path="/profile"
        element={
          <SignedIn>
            <ProfilePage />
          </SignedIn>
        }
      />
      <Route
        path="/orders"
        element={
          <SignedIn>
            <OrdersPage />
          </SignedIn>
        }
      />
      <Route
        path="/wishlist"
        element={
          <SignedIn>
            <WishlistPage />
          </SignedIn>
        }
      />
      <Route
        path="/addresses"
        element={
          <SignedIn>
            <AddressesPage />
          </SignedIn>
        }
      />
      <Route
        path="/settings"
        element={
          <SignedIn>
            <SettingsPage />
          </SignedIn>
        }
      />

      {/* Admin (Google OAuth) */}
      <Route path="/admin" element={<AdminLogin handleSuccess={handleSuccess} />} />
      <Route
        path="/adminPanel"
        element={
          <AdminProtectedRoute
            isAuthenticated={isAuthenticated}
            user={user}
            handleLogout={handleLogout}
          />
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">Page not found</p>
              <a
                href="/"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

// ---------------- APP ROOT ----------------
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Restore Admin session
  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Navbar */}
              <Header />
              <nav className="p-4 border-b flex justify-end">
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <a
                    href="/sign-in"
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Sign In
                  </a>
                </SignedOut>
              </nav>

              {/* Main Routes */}
              <main className="flex-1">
                <AppRoutes
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  user={user}
                  setUser={setUser}
                />
              </main>

              {/* Footer */}
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                theme="light"
                className="z-50"
              />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
