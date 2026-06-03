import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, TrendingUp, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PaymentStats {
  paymentMethod: string;
  ordersCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  percentage: number;
}

export default function AdminPaymentAnalytics() {
  const [stats, setStats] = useState<PaymentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all-time');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchPaymentAnalytics();
  }, [filter]);

  const fetchPaymentAnalytics = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('payment_method, total_amount, delivery_charge, status, created_at');

      // Apply date filter
      const now = new Date();
      if (filter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        query = query.gte('created_at', today);
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', weekAgo);
      } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', monthAgo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const orders = (data || []).filter((o) => o.status !== 'cancelled');

      // Calculate stats by payment method
      const paymentMap: Record<string, { count: number; revenue: number }> = {
        cod: { count: 0, revenue: 0 },
        upi: { count: 0, revenue: 0 },
      };

      orders.forEach((order) => {
        const method = order.payment_method || 'cod';
        if (!paymentMap[method]) paymentMap[method] = { count: 0, revenue: 0 };
        paymentMap[method].count++;
        paymentMap[method].revenue += (order.total_amount + order.delivery_charge) || 0;
      });

      const total = orders.reduce((sum, o) => sum + (o.total_amount + o.delivery_charge || 0), 0);

      const statsArray = Object.entries(paymentMap)
        .map(([method, data]) => ({
          paymentMethod: method === 'cod' ? 'Cash on Delivery' : method === 'upi' ? 'UPI Payment' : method,
          ordersCount: data.count,
          totalRevenue: data.revenue,
          avgOrderValue: data.count > 0 ? Math.round(data.revenue / data.count) : 0,
          percentage: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);

      setStats(statsArray);
      setTotalRevenue(total);
      setTotalOrders(orders.length);
    } catch (err) {
      console.error('Failed to fetch payment analytics:', err);
      toast.error('Failed to load payment analytics');
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Payment Analytics</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500 outline-none"
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="all-time">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Total Revenue</span>
            <DollarSign size={20} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-100 mt-1">{totalOrders} orders</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Average Order Value</span>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</p>
          <p className="text-sm text-blue-100 mt-1">Per order</p>
        </div>

        <div className="bg-gradient-to-br from-maroon-700 to-maroon-800 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-warm-200">Total Orders</span>
            <Filter size={20} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">{totalOrders}</p>
          <p className="text-sm text-warm-200 mt-1">Completed orders</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <CreditCard size={20} className="text-maroon-700" />
          Payment Method Breakdown
        </h2>

        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.paymentMethod} className="border border-gray-100 rounded-xl p-4 hover:border-maroon-200 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{stat.paymentMethod}</h3>
                  <p className="text-sm text-gray-500">{stat.ordersCount} orders</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-maroon-700">₹{stat.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.percentage}% of revenue</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    stat.paymentMethod === 'Cash on Delivery' ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Orders</p>
                  <p className="font-semibold text-gray-800">{stat.ordersCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Revenue</p>
                  <p className="font-semibold text-gray-800">₹{stat.totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Order</p>
                  <p className="font-semibold text-gray-800">₹{stat.avgOrderValue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={`mini-${stat.paymentMethod}`} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-2">{stat.paymentMethod}</p>
            <p className="text-2xl font-bold text-maroon-700">{stat.ordersCount}</p>
            <p className="text-xs text-gray-500 mt-1">₹{(stat.totalRevenue / 1000).toFixed(1)}K</p>
          </div>
        ))}
      </div>
    </div>
  );
}
