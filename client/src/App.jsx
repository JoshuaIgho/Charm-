import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

// Protected Route Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';

// Global Styles
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <Header />
            
            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/*" element={
                  <AdminProtectedRoute>
                    <AdminPanel />
                  </AdminProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                      <p className="text-gray-600 mb-8">Page not found</p>
                      <a href="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                        Go Home
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            
            {/* Footer */}
            <Footer />
            
            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              className="z-50"
            />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;