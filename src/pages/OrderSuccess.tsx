import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MapPin, Calendar, Smartphone, MessageCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { secureStorage } from '../utils/security';
import toast from 'react-hot-toast';
import type { Order } from '../types';
import { openWhatsApp, buildOrderMessage } from '../utils/whatsapp';
import { MERCHANT_UPI, generatePaymentQR, openUPIApp } from '../utils/upiPayment';

export default function OrderSuccess() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isUPI = searchParams.get('upi') === 'true';

  useEffect(() => {
    const lastOrder = secureStorage.get<Order>('lastOrder');
    if (lastOrder) setOrder(lastOrder);

    // Generate QR for UPI payment
    if (isUPI && lastOrder) {
      generatePaymentQR({
        upiId: MERCHANT_UPI.upiId,
        merchantName: MERCHANT_UPI.merchantName,
        amount: lastOrder.total,
        transactionRef: lastOrder.orderId,
      }).then(setQrCodeUrl).catch(console.error);
    }

    setLoading(false);
  }, [isUPI]);

  const handleWhatsApp = () => {
    if (!order) return;
    const items = order.items.map(item => ({ name: item.product?.name ?? '', weight: item.product?.weight ?? '', qty: item.qty ?? 1, price: item.product?.offerPrice ?? 0 }));
    const message = buildOrderMessage(
      order.orderId,
      items,
      order.total,
      order.address
    );
    openWhatsApp(message);
    setWhatsappOpened(true);
  };

  const handleOpenUPI = () => {
    if (!order) return;
    openUPIApp({
      upiId: MERCHANT_UPI.upiId,
      merchantName: MERCHANT_UPI.merchantName,
      amount: order.total,
      transactionRef: order.orderId,
    });
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(MERCHANT_UPI.upiId);
      toast('UPI ID copied!', { icon: '📋' });
    } catch { /* fallback */ }
  };

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">No recent order</h2>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">Shop Now</Link>
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
        <p className="text-gray-600">Complete your UPI payment and confirm on WhatsApp</p>
      </div>

      {/* UPI Payment Section */}
      {isUPI && (
        <div className="bg-white rounded-xl shadow-sm border border-maroon-200 overflow-hidden mb-6">
          <div className="bg-maroon-700 text-white px-6 py-4">
            <h2 className="font-bold flex items-center gap-2"><Smartphone size={20} /> Complete UPI Payment</h2>
            <p className="text-warm-200 text-sm mt-1">Pay ₹{order.total} to confirm your order</p>
          </div>
          <div className="p-6">
            {/* UPI ID Copy */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4 border">
              <div>
                <p className="text-xs text-gray-500">UPI ID</p>
                <p className="text-lg font-bold text-maroon-700 select-all">{MERCHANT_UPI.upiId}</p>
              </div>
              <button onClick={copyUPIId} className="flex items-center gap-1.5 text-sm text-maroon-700 hover:underline font-medium">
                <Copy size={14} /> Copy
              </button>
            </div>

            {/* QR Code */}
            {qrCodeUrl ? (
              <div className="text-center mb-4">
                <div className="inline-block bg-white p-3 rounded-xl shadow-sm border">
                  <img src={qrCodeUrl} alt="UPI QR" className="w-52 h-52 mx-auto" />
                </div>
                <p className="text-xs text-gray-500 mt-2">Scan with any UPI app to pay ₹{order.total}</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Loader2 className="animate-spin w-8 h-8 text-maroon-700 mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Generating QR code...</p>
              </div>
            )}

            {/* Quick Pay Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleOpenUPI}
                className="bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} /> Open UPI App
              </button>
              <button
                onClick={handleWhatsApp}
                className={`py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  whatsappOpened ? 'bg-gray-100 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <MessageCircle size={16} /> {whatsappOpened ? 'Sent ✓' : 'Confirm on WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-maroon-700 text-white px-6 py-4 flex items-center justify-between">
          <div><p className="text-xs text-warm-200">Order ID</p><p className="font-bold text-lg">#{order.orderId}</p></div>
          <div className="text-right"><p className="text-xs text-warm-200">Total</p><p className="font-bold text-lg">₹{order.total}</p></div>
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
            <Smartphone size={20} className="text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Payment Method</p>
              <p className="font-medium">UPI — {MERCHANT_UPI.upiId}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Package size={20} className="text-gray-400 mt-1" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-2">Order Items</p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">{item.product?.weight} × {item.qty}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.product?.offerPrice ?? 0) * (item.qty ?? 1)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleWhatsApp}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${
            whatsappOpened ? 'bg-gray-100 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <MessageCircle size={20} /> {whatsappOpened ? 'WhatsApp ✓' : 'WhatsApp Us'}
        </button>
        <Link
          to={`/order/${order.orderId}`}
          className="flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition"
        >
          <Package size={20} /> Track Order
        </Link>
      </div>

      <div className="text-center">
        <Link to="/products" className="text-maroon-700 font-semibold hover:underline">Continue Shopping</Link>
      </div>
    </div>
  );
}
