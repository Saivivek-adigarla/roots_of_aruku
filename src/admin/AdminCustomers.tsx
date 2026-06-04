import { useState, useEffect } from 'react';
import { Users, Phone, Calendar, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  created_at: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, phone, role, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount, delivery_charge');

      const orderMap: Record<string, { count: number; total: number }> = {};
      (orders || []).forEach((o) => {
        if (!orderMap[o.user_id]) orderMap[o.user_id] = { count: 0, total: 0 };
        orderMap[o.user_id].count++;
        orderMap[o.user_id].total += o.total_amount + o.delivery_charge;
      });

      const customerList = (users || []).map((u) => ({
        id: u.id,
        name: u.name || 'Unknown',
        phone: u.phone || '',
        email: '',
        role: u.role,
        created_at: u.created_at,
        orderCount: orderMap[u.id]?.count || 0,
        totalSpent: orderMap[u.id]?.total || 0,
      }));

      setCustomers(customerList);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : customers;

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <div className="flex items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none text-sm" />
          <span className="text-sm text-gray-500">{filtered.length} customers</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No customers found</h2>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-maroon-100 rounded-full flex items-center justify-center text-maroon-700 font-semibold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-1"><Phone size={14} /> {customer.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 flex items-center gap-1"><ShoppingBag size={14} /> {customer.orderCount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-maroon-700">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> {new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
