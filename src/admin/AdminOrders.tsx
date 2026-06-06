import { useState, useEffect } from 'react';
import { Truck, CheckCircle, XCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';

interface OrderItem {
  id: string;
  product_name: string;
  weight: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  total_amount: number;
  delivery_charge: number;
  payment_method: string;
  payment_status: string;
  payment_id: string | null;
  address_snapshot: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Filter },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  { value: 'shipped', label: 'Shipped', color: 'bg-blue-100 text-blue-700', icon: Truck },
  { value: 'out-for-delivery', label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const paymentStatus = newStatus === 'cancelled' ? 'refunded' :
        newStatus === 'delivered' ? 'paid' : undefined;
      const payload: Record<string, string> = { status: newStatus };
      if (paymentStatus) payload.payment_status = paymentStatus;

      await updateDoc(doc(db, 'orders', orderId), payload);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusStyle = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-700';

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <div className="flex items-center gap-2">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-maroon-500 outline-none">
            <option value="all">All Orders</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order) => (
                <div key={order.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-maroon-200 transition ${selectedOrder?.id === order.id ? 'ring-2 ring-maroon-700' : ''}`} onClick={() => setSelectedOrder(order)}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-maroon-700">#{order.order_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>{order.status}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">₹{order.total_amount + order.delivery_charge}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{order.address_snapshot?.name || 'Unknown'}</span>
                    <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    <span>{formatDate(order.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold mb-4">Order #{selectedOrder.order_number}</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.value} onClick={() => updateStatus(selectedOrder.id, s.value)} disabled={updating} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedOrder.status === s.value ? s.color + ' ring-2 ring-offset-1 ring-maroon-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Payment</p>
                <p className="text-sm"><span className="text-gray-700">Method:</span> {selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                <p className="text-sm"><span className="text-gray-700">Status:</span> <span className={selectedOrder.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{selectedOrder.payment_status}</span></p>
                {selectedOrder.payment_id && <p className="text-sm text-gray-500">ID: {selectedOrder.payment_id}</p>}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Delivery Address</p>
                <p className="text-sm text-gray-700">{selectedOrder.address_snapshot?.name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.address_snapshot?.address}</p>
                <p className="text-sm text-gray-600">{selectedOrder.address_snapshot?.city}, {selectedOrder.address_snapshot?.state} - {selectedOrder.address_snapshot?.pincode}</p>
                <p className="text-sm text-gray-500">{selectedOrder.address_snapshot?.phone}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Items</p>
                <div className="space-y-2">
                  {(selectedOrder.order_items || []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.product_name} ({item.weight}) x{item.quantity}</span>
                      <span className="font-medium">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹{selectedOrder.total_amount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>₹{selectedOrder.delivery_charge}</span></div>
                <div className="flex justify-between font-bold text-lg mt-1"><span>Total</span><span>₹{selectedOrder.total_amount + selectedOrder.delivery_charge}</span></div>
              </div>

              <div className="text-xs text-gray-400">{formatDate(selectedOrder.created_at)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
