import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: typeof TrendingUp;
  color: string;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<{ id: string; order_number: string; total: number; status: string; date: string }[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ category: string; count: number; revenue: number }[]>([]);
  const [inventoryStats, setInventoryStats] = useState({ active: 0, outOfStock: 0, unreadAlerts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ordersSnapshot, productsSnapshot] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'products')),
      ]);

      const orders = ordersSnapshot.docs.map(d => ({ ...d.data() })) as any[];
      const products = productsSnapshot.docs.map(d => ({ ...d.data() })) as any[];

      const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total_amount + o.delivery_charge, 0);
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const lowStock = products.filter((p) => p.stock_quantity <= 10 && p.stock_quantity > 0).length;

      setStats([
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: '0%', up: true, icon: DollarSign, color: 'bg-green-500' },
        { label: 'Total Orders', value: totalOrders.toString(), change: '0%', up: true, icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'Products', value: totalProducts.toString(), change: `${lowStock} low stock`, up: lowStock === 0, icon: Package, color: 'bg-maroon-700' },
        { label: 'Avg Order Value', value: totalOrders > 0 ? `₹${Math.round(totalRevenue / totalOrders)}` : '₹0', change: '0%', up: true, icon: TrendingUp, color: 'bg-gold-500' },
      ]);

      // Sort orders by created_at descending and take first 5
      const sortedOrders = orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentOrders(
        sortedOrders.slice(0, 5).map((o) => ({
          id: o.order_number,
          order_number: o.order_number,
          total: o.total_amount + o.delivery_charge,
          status: o.status,
          date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        }))
      );

      // Category breakdown
      const catMap: Record<string, { count: number; revenue: number }> = {};
      products.forEach((p) => {
        if (!catMap[p.category]) catMap[p.category] = { count: 0, revenue: 0 };
        catMap[p.category].count++;
        catMap[p.category].revenue += p.offer_price * p.stock_quantity;
      });
      setCategoryBreakdown(
        Object.entries(catMap).map(([category, data]) => ({ category, ...data }))
      );

      // Inventory stats
      const activeCount = products.filter((p) => p.status === 'active').length;
      const outOfStockCount = products.filter((p) => p.status === 'outofstock').length;
      const alertsSnapshot = await getDocs(query(collection(db, 'inventory_alerts'), where('is_read', '==', false)));
      const unreadAlertsCount = alertsSnapshot.docs.length;

      setInventoryStats({
        active: activeCount,
        outOfStock: outOfStockCount,
        unreadAlerts: unreadAlertsCount,
      });
    } catch {
      // Graceful degradation - show empty state
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-red-600'}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.order_number} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">#{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.total}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="capitalize font-medium text-gray-700">{cat.category}</span>
                    <span className="text-xs text-gray-400">{cat.count} products</span>
                  </div>
                  <span className="font-semibold text-maroon-700">₹{cat.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Inventory Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-700">{inventoryStats.active}</p>
            <p className="text-sm text-green-600">Active Products</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{inventoryStats.outOfStock}</p>
            <p className="text-sm text-yellow-600">Out of Stock</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-red-700">{inventoryStats.unreadAlerts}</p>
            <p className="text-sm text-red-600">Unread Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
