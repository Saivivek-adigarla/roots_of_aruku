import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X, Leaf, Tag, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';
import {
  collection, getDocs, query, where, orderBy, limit, doc, getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminCustomers from './AdminCustomers';
import AdminAnalytics from './AdminAnalytics';
import AdminPaymentAnalytics from './AdminPaymentAnalytics';
import AdminCoupons from './AdminCoupons';
import AdminInventory from './AdminInventory';
import AdminSettings from './AdminSettings';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStock: number;
  totalCustomers: number;
  unreadAlerts: number;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, lowStock: 0, totalCustomers: 0, unreadAlerts: 0 });
  const [recentOrders, setRecentOrders] = useState<{ order_number: string; total_amount: number; delivery_charge: number; status: string; created_at: string }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, productsSnap, customersSnap, alertsSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(5))),
          getDocs(collection(db, 'products')),
          getDocs(query(collection(db, 'users'), where('role', '==', 'customer'))),
          getDocs(query(collection(db, 'inventory_alerts'), where('is_read', '==', false))),
        ]);

        const orders = ordersSnap.docs.map((d) => ({ ...d.data() } as Record<string, unknown>));
        const products = productsSnap.docs.map((d) => d.data());

        const allOrdersSnap = await getDocs(collection(db, 'orders'));

        setStats({
          totalOrders: allOrdersSnap.size,
          totalRevenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + ((o.total_amount as number) || 0) + ((o.delivery_charge as number) || 0), 0),
          totalProducts: products.length,
          lowStock: products.filter((p) => (p.stock_quantity as number) > 0 && (p.stock_quantity as number) <= 10).length,
          totalCustomers: customersSnap.size,
          unreadAlerts: alertsSnap.size,
        });

        setRecentOrders(orders.slice(0, 5).map((o) => ({
          order_number: o.order_number as string,
          total_amount: o.total_amount as number,
          delivery_charge: (o.delivery_charge as number) || 0,
          status: o.status as string,
          created_at: o.created_at as string,
        })));
      } catch {
        // Graceful degradation
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: LayoutDashboard, color: 'bg-green-500' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Products', value: stats.totalProducts.toString(), sub: `${stats.lowStock} low stock`, icon: Package, color: 'bg-maroon-700' },
    { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'bg-gold-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}><stat.icon size={20} className="text-white" /></div>
              {stat.sub && <span className="text-xs text-yellow-600 font-medium">{stat.sub}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats.unreadAlerts > 0 && (
        <Link to="/admin/inventory" className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition">
          <AlertTriangle size={20} className="text-yellow-600" />
          <span className="text-yellow-800 font-medium">{stats.unreadAlerts} unread inventory alert{stats.unreadAlerts > 1 ? 's' : ''}</span>
        </Link>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.order_number} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div><p className="font-medium">#{order.order_number}</p><p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>
                  <div className="text-right"><p className="font-semibold">₹{order.total_amount + order.delivery_charge}</p><span className={`text-xs px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition"><Package className="text-maroon-700" size={24} /><span className="text-sm font-medium">Products</span></Link>
            <Link to="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition"><ShoppingCart className="text-maroon-700" size={24} /><span className="text-sm font-medium">Orders</span></Link>
            <Link to="/admin/coupons" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition"><Tag className="text-maroon-700" size={24} /><span className="text-sm font-medium">Coupons</span></Link>
            <Link to="/admin/inventory" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition"><AlertTriangle className="text-maroon-700" size={24} /><span className="text-sm font-medium">Inventory</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/payments', label: 'Payments', icon: BarChart3 },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/coupons', label: 'Coupons', icon: Tag },
  { path: '/admin/inventory', label: 'Inventory', icon: AlertTriangle },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Logged out');
      navigate('/admin/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  if (!user?.isAdmin) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <aside className={`fixed inset-y-0 left-0 w-64 bg-maroon-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform z-40`}>
        <div className="p-4 border-b border-maroon-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold"><Leaf className="text-gold-400" size={24} /><span>Roots Admin</span></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition hover:bg-maroon-800 ${location.pathname === item.path || (item.end && location.pathname === '/admin') ? 'bg-maroon-800' : ''}`}>
              <item.icon size={20} /><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-maroon-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:bg-maroon-800 rounded-lg"><LogOut size={20} /><span>Logout</span></button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={24} /></button>
          <div className="flex-1 lg:hidden" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-maroon-700 rounded-full flex items-center justify-center text-white font-bold text-sm">{user.name.charAt(0)}</div>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPaymentAnalytics />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
