import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, Calendar, CreditCard, ShoppingBag, ArrowLeft, MessageCircle, Download, RotateCcw } from 'lucide-react';
import OrderTimeline from '../components/OrderTimeline';
import { secureStorage } from '../utils/security';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { Order } from '../types';

const WA_NUMBER = '917036252018';

function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank');
}

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Your order is pending confirmation',
  confirmed: 'Order confirmed by seller',
  processing: 'We are processing your order',
  packed: 'Your order has been packed',
  shipped: 'Your order is on the way',
  'out-for-delivery': 'Out for delivery. Arriving soon!',
  delivered: 'Order delivered successfully',
  cancelled: 'Order has been cancelled',
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (user?.uid && id) {
          const ordersRef = collection(db, 'orders');
          const q = query(
            ordersRef,
            where('order_number', '==', id),
            where('user_id', '==', user.uid)
          );
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const orderDoc = snapshot.docs[0];
            const orderData = orderDoc.data();

            // Fetch order_items subcollection
            const itemsRef = collection(db, 'orders', orderDoc.id, 'order_items');
            const itemsSnapshot = await getDocs(itemsRef);
            const items = itemsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            setOrder({ ...orderData, order_items: items } as any);
            return;
          }
        }

        // Fallback to local storage
        const lastOrder = secureStorage.get<Order>('lastOrder');
        if (lastOrder && (lastOrder.orderId === id || lastOrder.orderId === `ROA-${id}`)) {
          setOrder(lastOrder);
        }
      } catch {
        console.error('Failed to fetch order');
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user]);

  const handleReorder = async () => {
    if (!order?.order_items) {
      toast.error('Cannot reorder this item');
      return;
    }

    try {
      setReordering(true);
      let hasProduct = false;
      for (const item of order.order_items) {
        const productRef = doc(db, 'products', item.product_id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const product = productSnap.data();
          addItem({ ...product, id: productSnap.id, qty: item.quantity } as any);
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
      setReordering(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h2>
        <Link to="/orders" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          View Orders
        </Link>
      </div>
    );
  }

  const handleWhatsApp = () => {
    openWhatsApp(`Hi, I have a query about my order #${order.order_number}`);
  };

  const items = order.order_items || (order.items || []);
  const currentStatus = order.status || 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-maroon-700 mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-maroon-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-warm-200">Order ID</p>
            <p className="font-bold text-lg">#{order.order_number}</p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase ${
              currentStatus === 'delivered'
                ? 'bg-green-500'
                : currentStatus === 'cancelled'
                  ? 'bg-red-500'
                  : currentStatus === 'shipped' || currentStatus === 'out-for-delivery'
                    ? 'bg-blue-500'
                    : 'bg-gold-400 text-maroon-900'
            }`}
          >
            {currentStatus.replace('-', ' ')}
          </span>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-4 text-lg">Track Your Order</h3>
            <OrderTimeline currentStatus={currentStatus} />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">{STATUS_MESSAGES[currentStatus] || 'Your order is being processed'}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-maroon-700" /> Delivery Address
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium">{order.address_snapshot?.name || order.address?.name}</p>
                <p className="text-gray-600 text-sm">{order.address_snapshot?.address || order.address?.address}</p>
                <p className="text-gray-600 text-sm">
                  {order.address_snapshot?.city || order.address?.city} -{' '}
                  {order.address_snapshot?.pincode || order.address?.pincode}
                </p>
                <p className="text-gray-500 text-sm">{order.address_snapshot?.phone || order.address?.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package size={18} className="text-maroon-700" /> Order Items
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item: Order['order_items'][number], idx: number) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="w-14 h-14 bg-gray-200 rounded flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product_name || item.product?.name}
                          className="w-full h-full object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product_name || item.product?.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.product?.weight || item.weight} x {item.quantity || item.qty}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.total_price || item.product?.offerPrice * item.qty) / 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-maroon-700">₹{order.total_amount + (order.delivery_charge || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  <Calendar size={14} className="inline mr-1" />
                  {new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  <CreditCard size={14} className="inline mr-1" />
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method === 'upi' ? 'UPI Payment' : 'Online Payment'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleReorder}
                disabled={reordering || currentStatus === 'cancelled'}
                className="flex items-center gap-2 px-4 py-2 bg-maroon-700 text-white rounded-lg font-medium hover:bg-maroon-800 disabled:opacity-50 transition"
              >
                <RotateCcw size={16} /> {reordering ? 'Adding...' : 'Reorder'}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                title="Download invoice (coming soon)"
              >
                <Download size={16} /> Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-600 mb-3">Need help with your order?</p>
        <button onClick={handleWhatsApp} className="flex items-center gap-2 text-green-600 font-semibold hover:underline">
          <MessageCircle size={18} /> Contact us on WhatsApp
        </button>
      </div>
    </div>
  );
}
