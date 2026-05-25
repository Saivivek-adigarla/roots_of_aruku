import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, CreditCard, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import OrderTimeline from '../components/OrderTimeline';
import { secureStorage } from '../utils/security';
import { Order } from '../types';

const WA_NUMBER = '917036252018';

function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

const STATUS_MESSAGES: Record<string, string> = {
  placed: 'Your order has been placed successfully',
  paid: 'Payment received. Preparing your order.',
  confirmed: 'Order confirmed by seller',
  shipped: 'Your order is on the way',
  delivered: 'Order delivered successfully',
  cod: 'Order confirmed. Pay on delivery.',
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lastOrder = secureStorage.get<Order>('lastOrder');
    if (lastOrder && (lastOrder.orderId === id || lastOrder.orderId === `ROA-${id}`)) {
      setOrder(lastOrder);
    }
    setLoading(false);
  }, [id]);

  const getCurrentStatus = (status: string): string => {
    if (status === 'cod' || status === 'paid') return 'confirmed';
    return status;
  };

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
        <Link to="/orders" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">View Orders</Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    openWhatsApp(`Hi, I have a query about my order #${order.orderId}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-maroon-700 mb-6"><ArrowLeft size={18} /> Back</button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-maroon-700 text-white px-6 py-4 flex items-center justify-between">
          <div><p className="text-xs text-warm-200">Order ID</p><p className="font-bold text-lg">#{order.orderId}</p></div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase ${order.status === 'delivered' ? 'bg-green-500' : order.status === 'shipped' ? 'bg-blue-500' : 'bg-gold-400 text-maroon-900'}`}>{order.status}</span>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Track Your Order</h3>
            <OrderTimeline currentStatus={getCurrentStatus(order.status)} />
          </div>

          <div className="bg-warm-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700">{STATUS_MESSAGES[order.status] || 'Processing your order'}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2"><MapPin size={18} className="text-maroon-700" /> Delivery Address</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{order.address.name}</p>
                <p className="text-gray-600 text-sm">{order.address.address}</p>
                <p className="text-gray-600 text-sm">{order.address.city} - {order.address.pincode}</p>
                <p className="text-gray-500 text-sm">{order.address.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2"><Package size={18} className="text-maroon-700" /> Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <img src={item.product.images?.[0]} alt={item.product.name} className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.product.name}</p><p className="text-xs text-gray-500">{item.product.weight} x {item.qty}</p></div>
                    <p className="font-semibold text-sm">₹{item.product.offerPrice * item.qty}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-4 flex justify-between items-center">
            <div><p className="text-sm text-gray-600">Total Amount</p><p className="text-2xl font-bold text-maroon-700">₹{order.total}</p></div>
            <div className="text-right">
              <p className="text-sm text-gray-500"><Calendar size={14} className="inline mr-1" />{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className="text-sm text-gray-500"><CreditCard size={14} className="inline mr-1" />{order.status === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-600 mb-3">Need help with your order?</p>
        <button onClick={handleWhatsApp} className="flex items-center gap-2 text-green-600 font-semibold hover:underline"><MessageCircle size={18} /> Contact us on WhatsApp</button>
      </div>
    </div>
  );
}
