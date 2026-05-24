import { useState } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

function Dashboard() {
  const stats = [
    { label: 'Total Orders', value: '156', change: '+12%', icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Revenue', value: '₹45,230', change: '+8%', icon: LayoutDashboard, color: 'bg-green-500' },
    { label: 'Products', value: '24', change: '+2', icon: Package, color: 'bg-maroon-500' },
    { label: 'Customers', value: '89', change: '+15', icon: Users, color: 'bg-gold-500' },
  ];

  const recentOrders = [
    { id: 'ROA-001', customer: 'Rahul K.', amount: 599, status: 'delivered', date: '2025-05-24' },
    { id: 'ROA-002', customer: 'Priya M.', amount: 899, status: 'shipped', date: '2025-05-23' },
    { id: 'ROA-003', customer: 'Anil S.', amount: 349, status: 'confirmed', date: '2025-05-23' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-warm-100 text-warm-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/products" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition">
              <Package className="text-maroon-700" size={24} />
              <span className="text-sm font-medium">Manage Products</span>
            </Link>
            <Link to="/admin/orders" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition">
              <ShoppingCart className="text-maroon-700" size={24} />
              <span className="text-sm font-medium">View Orders</span>
            </Link>
            <Link to="/admin/customers" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition">
              <Users className="text-maroon-700" size={24} />
              <span className="text-sm font-medium">Customers</span>
            </Link>
            <Link to="/admin/settings" className="flex flex-col items-center gap-2 p-4 bg-warm-50 rounded-lg hover:bg-warm-100 transition">
              <Settings className="text-maroon-700" size={24} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsList() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <button className="px-4 py-2 bg-maroon-700 text-white rounded-lg font-medium hover:bg-maroon-800">Add Product</button>
      </div>
      <p className="text-gray-500">Product management coming soon...</p>
    </div>
  );
}

function OrdersList() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Orders</h2>
      <p className="text-gray-500">Order management coming soon...</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p className="text-gray-500">Store settings coming soon...</p>
    </div>
  );
}

export default function AdminApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
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

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-warm-50">
      <aside className={`fixed inset-y-0 left-0 w-64 bg-maroon-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform z-40`}>
        <div className="p-4 border-b border-maroon-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Leaf className="text-gold-400" size={24} />
            <span>Roots Admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={24} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-maroon-700' : 'hover:bg-maroon-800'}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-maroon-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:bg-maroon-800 rounded-lg">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={24} /></button>
          <div className="flex-1 lg:hidden" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-maroon-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="customers" element={<div className="bg-white rounded-xl p-6"><h2 className="text-xl font-bold mb-4">Customers</h2><p className="text-gray-500">Customer management coming soon...</p></div>} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
