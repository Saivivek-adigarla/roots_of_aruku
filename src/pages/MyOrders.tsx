import { useEffect } from 'react';
import { ChevronRight, Calendar, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { fetchUserOrders } from '../services/database';
import { supabase } from '../lib/supabase';
import { secureStorage } from '../utils/security';
import toast from 'react-hot-toast';

interface DbOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  payment_status: string;
  address_snapshot: { name: string; phone: string; address: string; city: string; state: string; pincode: string };
  created_at: string;
  order_items: { product_id: string; product_name: string; weight: string; quantity: number; unit_price: number; total_price: number }[];
}

export default function MyOrders() {
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const dbOrders = await fetchUserOrders(user.uid);
      setOrders(dbOrders);
    } catch {
      const lastOrder = secureStorage.get<DbOrder>('lastOrder');
      const allOrders = secureStorage.get<DbOrder[]>('demoOrders') || [];
      if (lastOrder) {
        const exists = allOrders.find((o) => o.order_number === lastOrder.order_number);
        const updated = exists ? allOrders : [lastOrder, ...allOrders];
        setOrders(updated);
      } else {
        setOrders(allOrders);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order: DbOrder) => {
    if (!order.order_items) {
      toast.error('Cannot reorder this item');
      return;
    }

    try {
      setReorderingId(order.order_number);
      let hasProduct = false;
      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('id', item.product_id)
          .maybeSingle();

        if (product) {
          addItem({ ...product, qty: item.quantity });
          hasProduct = true;
        }
      }

      if (hasProduct) {
        toast.success('Items added to cart');
        navigate('/cart');
      } else {
        toast.error('Some items are unavailable');
      }
    } catch {
      toast.error('Failed to add items to cart');
    } finally {
      setReorderingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'processing':
      case 'packed':
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'out-for-delivery':
        return 'bg-indigo-100 text-indigo-700';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'cod':
        return 'bg-gold-100 text-gold-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'confirmed', 'processing', 'packed'].includes(order.status);
    if (filter === 'shipped') return ['shipped', 'out-for-delivery'].includes(order.status);
    if (filter === 'delivered') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === status
                  ? 'bg-maroon-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredOrders.length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <ShoppingBag size={48} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No {filter} orders</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.order_number} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-semibold text-maroon-700">{order.order_number}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={14} /> {formatDate(order.created_at)}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${getStatusColor(order.status)}`}>
                  {order.status.replace('-', ' ')}
                </span>
              </div>

              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{order.order_items?.map((i) => i.product_name).join(', ') || 'Order items'}</p>
                    <p className="text-sm text-gray-500">{order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0} items</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} /> {order.address_snapshot?.city || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-maroon-700">₹{order.total_amount + order.delivery_charge}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard size={14} />
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : `Paid Online${order.payment_status === 'paid' ? '' : ` (${order.payment_status})`}`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReorder(order)}
                    disabled={reorderingId === order.order_number || order.status === 'cancelled'}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-maroon-700 font-medium hover:bg-maroon-50 rounded-lg transition disabled:opacity-50"
                  >
                    <RotateCcw size={14} /> {reorderingId === order.order_number ? 'Adding...' : 'Reorder'}
                  </button>
                  <Link
                    to={`/order/${order.order_number}`}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-maroon-700 font-medium hover:bg-maroon-50 rounded-lg transition"
                  >
                    <Eye size={14} /> Track <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
