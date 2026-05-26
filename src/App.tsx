import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy } from 'react';
import { useAuthStore } from './store/authStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './auth/Login';
import Signup from './auth/Signup';
import ForgotPassword from './auth/ForgotPassword';
import AdminLogin from './admin/AdminLogin';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Search = lazy(() => import('./pages/Search'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-warm-50">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminApp /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/*" element={
            <AuthRedirect>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/order/:id" element={<OrderTracking />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/addresses" element={<Addresses />} />
                </Routes>
              </MainLayout>
            </AuthRedirect>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
