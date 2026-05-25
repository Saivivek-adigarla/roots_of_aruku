import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronRight, Calendar, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
  product: { id: string; name: string; weight: string; images?: string[]; offerPrice: number };
  qty: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  address: { name: string; address: string; city: string; pincode: string };
  status: string;
  createdAt: string;
}

export default function MyOrders() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      const demoOrders = localStorage.getItem('demoOrders');
      const existing = demoOrders ? JSON.parse(demoOrders) : [];
      const lastOrderObj = JSON.parse(lastOrder);
      if (!existing.find((o: Order) => o.orderId === lastOrderObj.orderId)) {
        existing.push(lastOrderObj);
        localStorage.setItem('demoOrders', JSON.stringify(existing));
      }
      setOrders([lastOrderObj, ...existing.filter((o: Order) => o.orderId !== lastOrderObj.orderId)]);
    } else {
      const demoOrders = localStorage.getItem('demoOrders');
      setOrders(demoOrders ? JSON.parse(demoOrders) : []);
    }
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'confirmed': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cod': return 'bg-gold-100 text-gold-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-semibold text-maroon-700">{order.orderId}</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar size={14} />
                  {formatDate(order.createdAt)}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-start">
                <div className="flex gap-4 flex-1 min-w-0">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <img
                      key={idx}
                      src={item.product.images?.[0] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{order.items.map(i => i.product.name).join(', ')}</p>
                    <p className="text-sm text-gray-500">{order.items.reduce((s, i) => s + i.qty, 0)} items</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} /> {order.address.city}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-maroon-700">₹{order.total}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard size={14} />
                {order.status === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
              </div>
              <Link
                to={`/order/${order.orderId}`}
                className="flex items-center gap-1 text-maroon-700 font-medium hover:underline"
              >
                <Eye size={16} /> Track Order <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
