import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, Suspense, lazy, useState } from 'react';
import { useAuthStore } from './store/authStore';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import BackButton from './components/BackButton';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

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
const OurStory = lazy(() => import('./pages/OurStory'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const ReturnsPolicy = lazy(() => import('./pages/ReturnsPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const Wholesale = lazy(() => import('./pages/Wholesale'));
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
  const location = useLocation();
  const showBackButton = location.pathname !== '/';

  return (
    <>
      <Navbar />
      {showBackButton && <BackButton className="fixed top-20 left-4 z-40 bg-white rounded-lg shadow-md hover:shadow-lg px-4 py-2" />}
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

function ProtectedPages({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  if (!initialized) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const SPLASH_KEY = 'roa_splash_shown';

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const [mounted, setMounted] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  useEffect(() => {
    // Check splash status from sessionStorage on mount
    const splashShown = sessionStorage.getItem(SPLASH_KEY) === 'true';
    setSplashComplete(splashShown);
    setMounted(true);
    initialize();
  }, [initialize]);

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_KEY, 'true');
    setSplashComplete(true);
  };

  // Wait for mount to prevent hydration mismatch
  if (!mounted || !initialized) return <LoadingFallback />;
  if (!splashComplete) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminApp /></ProtectedRoute>} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public Routes */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
          <Route path="/search" element={<MainLayout><Search /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
          <Route path="/story" element={<OurStory />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
          <Route path="/blog/:slug" element={<MainLayout><BlogPost /></MainLayout>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/wholesale" element={<MainLayout><Wholesale /></MainLayout>} />

          {/* Protected Routes */}
          <Route path="/checkout" element={<ProtectedPages><MainLayout><Checkout /></MainLayout></ProtectedPages>} />
          <Route path="/order-success" element={<ProtectedPages><MainLayout><OrderSuccess /></MainLayout></ProtectedPages>} />
          <Route path="/order/:id" element={<ProtectedPages><MainLayout><OrderTracking /></MainLayout></ProtectedPages>} />
          <Route path="/wishlist" element={<ProtectedPages><MainLayout><Wishlist /></MainLayout></ProtectedPages>} />
          <Route path="/profile" element={<ProtectedPages><MainLayout><Profile /></MainLayout></ProtectedPages>} />
          <Route path="/orders" element={<ProtectedPages><MainLayout><MyOrders /></MainLayout></ProtectedPages>} />
          <Route path="/addresses" element={<ProtectedPages><MainLayout><Addresses /></MainLayout></ProtectedPages>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
