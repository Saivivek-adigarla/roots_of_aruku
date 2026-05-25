import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar, CreditCard, ShoppingBag, MessageCircle } from 'lucide-react';
import { secureStorage } from '../utils/security';
import { Order } from '../types';

const WA_NUMBER = '917036252018';

function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

export default function OrderSuccess() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lastOrder = secureStorage.get<Order>('lastOrder');
    if (lastOrder) setOrder(lastOrder);
    setLoading(false);
  }, []);

  const handleWhatsApp = () => {
    if (order) {
      const message = `Hi, I just placed order #${order.orderId}. Total: ₹${order.total}. Please confirm.`;
      openWhatsApp(message);
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
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center"><CheckCircle size={48} className="text-green-600" /></div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for shopping with Roots of Araku</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-maroon-700 text-white px-6 py-4 flex items-center justify-between">
          <div><p className="text-xs text-warm-200">Order ID</p><p className="font-bold text-lg">#{order.orderId}</p></div>
          <div className="text-right"><p className="text-xs text-warm-200">Total</p><p className="font-bold text-lg">₹{order.total}</p></div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4"><Calendar size={20} className="text-gray-400 mt-1" /><div><p className="text-xs text-gray-500">Order Date</p><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
          <div className="flex items-start gap-4"><MapPin size={20} className="text-gray-400 mt-1" /><div><p className="text-xs text-gray-500">Delivery Address</p><p className="font-medium">{order.address.name}</p><p className="text-gray-600">{order.address.address}</p><p className="text-gray-600">{order.address.city} - {order.address.pincode}</p></div></div>
          <div className="flex items-start gap-4"><CreditCard size={20} className="text-gray-400 mt-1" /><div><p className="text-xs text-gray-500">Payment Method</p><p className="font-medium">{order.status === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p></div></div>
          <div className="flex items-start gap-4"><Package size={20} className="text-gray-400 mt-1" /><div className="flex-1"><p className="text-xs text-gray-500 mb-2">Order Items</p><div className="space-y-2">{order.items.map((item, idx) => (<div key={idx} className="flex items-center gap-3"><img src={item.product.images?.[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded" /><div className="flex-1"><p className="font-medium text-sm">{item.product.name}</p><p className="text-xs text-gray-500">{item.product.weight} x {item.qty}</p></div><p className="font-semibold text-sm">₹{item.product.offerPrice * item.qty}</p></div>))}</div></div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={handleWhatsApp} className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"><MessageCircle size={20} /> WhatsApp</button>
        <Link to={`/order/${order.orderId}`} className="flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition"><Package size={20} /> Track Order</Link>
      </div>

      <div className="text-center"><Link to="/products" className="text-maroon-700 font-semibold hover:underline">Continue Shopping</Link></div>
    </div>
  );
}
