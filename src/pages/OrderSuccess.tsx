import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar, CreditCard, Phone, MessageCircle, ShoppingBag } from 'lucide-react';
import { openWhatsApp, buildOrderMessage } from '../utils/whatsapp';

interface OrderItem {
  product: { id: string; name: string; weight: string; images?: string[]; offerPrice: number };
  qty: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  total: number;
  address: { name: string; address: string; city: string; pincode: string; phone: string };
  status: string;
  createdAt: string;
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      setOrder(JSON.parse(lastOrder));
    }
    setLoading(false);
  }, []);

  const handleWhatsApp = () => {
    if (order) {
      const message = buildOrderMessage(order.orderId, order.items.length, order.total);
      openWhatsApp(import.meta.env.VITE_WHATSAPP_NUMBER || '917036252018', message);
    }
  };

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No recent order</h2>
        <p className="text-gray-500 mb-6">Place an order to see confirmation details</p>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for shopping with Roots of Araku</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-maroon-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-200">Order ID</p>
            <p className="font-bold text-lg">#{order.orderId}</p>
          </div>
          <div className="text-xs text-warm-200">COD: ₹{order.total}</div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <Calendar size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Delivery Address</p>
              <p className="font-medium">{order.address.name}</p>
              <p className="text-gray-600">{order.address.address}</p>
              <p className="text-gray-600">{order.address.city} - {order.address.pincode}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <CreditCard size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="font-medium">{order.status === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Package size={20} className="text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">Order Items</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={item.product.images?.[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.product.weight} x {item.qty}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{item.product.offerPrice * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.total}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Delivery</span>
              <span className={order.total >= 499 ? 'text-green-600' : ''}>{order.total >= 499 ? 'FREE' : '₹49'}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total</span>
              <span className="text-maroon-700">₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
        >
          <MessageCircle size={20} /> WhatsApp Order
        </button>
        <Link
          to={`/order/${order.orderId}`}
          className="flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition"
        >
          <Package size={20} /> Track Order
        </Link>
      </div>

      <div className="text-center">
        <Link to="/products" className="text-maroon-700 font-semibold hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
