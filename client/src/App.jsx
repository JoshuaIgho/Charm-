// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';

// Protected Route Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Global Styles
import './styles/globals.css';
import './style.css';

// ---------------- ADMIN LOGIN ----------------
function AdminLogin({ handleSuccess }) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Admin Portal</h1>
        <p>Please sign in with your Google account to continue</p>
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
          <p className="text-gray-600 mb-4">You must log in to view this page.</p>
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

// ---------------- MAIN ROUTES (INSIDE ROUTER) ----------------
function AppRoutes({ isAuthenticated, setIsAuthenticated, user, setUser }) {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const userData = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };
      setUser(userData);
      setIsAuthenticated(true);

      localStorage.setItem("adminUser", JSON.stringify(userData));

      // Redirect to adminPanel
      navigate("/adminPanel");
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("adminUser");
    navigate("/admin");
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
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

  // Load from localStorage
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
              <Header />
              <main className="flex-1">
                <AppRoutes
                  isAuthenticated={isAuthenticated}
                  setIsAuthenticated={setIsAuthenticated}
                  user={user}
                  setUser={setUser}
                />
              </main>
              <Footer />
              <ToastContainer position="top-right" autoClose={5000} theme="light" className="z-50" />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
