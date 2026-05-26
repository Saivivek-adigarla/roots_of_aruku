import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, MapPin, Check, Loader2, Shield, Tag, X, Smartphone, MessageCircle, Package, Copy, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getDeliveryCharge, DELIVERY_FREE_THRESHOLD } from '../utils/helpers';
import type { Address } from '../types';
import AddressForm from '../components/AddressForm';
import toast from 'react-hot-toast';
import {
  isValidName,
  isValidPhone,
  isValidPincode,
  sanitizeHtml,
  checkRateLimit,
  secureStorage,
  generateCsrfToken,
  validateCsrfToken,
  generateSecureId,
} from '../utils/security';
import { supabase } from '../lib/supabase';
import { createOrder, fetchAddresses, saveAddress as saveDbAddress } from '../services/database';
import { generatePaymentQR, MERCHANT_UPI, openUPIApp } from '../utils/upiPayment';
import { openWhatsApp, buildOrderMessage } from '../utils/whatsapp';

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'flat' } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.offerPrice * item.qty, 0);
  const discountAmt = items.reduce((sum, item) => sum + (item.product.mrp - item.product.offerPrice) * item.qty, 0);
  const deliveryCharge = getDeliveryCharge(subtotal);
  const couponDiscount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.min(Math.round(subtotal * appliedCoupon.discount / 100), appliedCoupon.discount || Infinity)
      : appliedCoupon.discount
    : 0;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  useEffect(() => {
    setCsrfToken(generateCsrfToken());
    secureStorage.set('checkout_csrf', csrfToken);
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (user?.uid) {
      try {
        const dbAddresses = await fetchAddresses(user.uid);
        if (dbAddresses.length > 0) {
          setAddresses(dbAddresses);
          return;
        }
      } catch { /* fallback */ }
    }
    const savedAddresses = secureStorage.get<Address[]>('addresses');
    if (savedAddresses) setAddresses(savedAddresses);
  };

  const validateCartItems = useCallback(() => {
    for (const item of items) {
      if (item.product.offerPrice < 0 || item.product.mrp < 0) {
        toast.error('Invalid product price detected');
        return false;
      }
      if (item.qty <= 0 || item.qty > 100) {
        toast.error('Invalid quantity detected');
        return false;
      }
    }
    return true;
  }, [items]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { toast.error('Enter a coupon code'); return; }
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .lte('valid_from', new Date().toISOString())
        .gte('valid_until', new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      if (!data) { toast.error('Invalid or expired coupon'); return; }
      if (data.min_order_value > subtotal) { toast.error(`Minimum order ₹${data.min_order_value} required`); return; }
      if (data.usage_limit && data.used_count >= data.usage_limit) { toast.error('Coupon limit reached'); return; }

      const discount = data.discount_type === 'percentage'
        ? Math.min(Math.round(subtotal * data.discount_value / 100), data.max_discount || Infinity)
        : data.discount_value;

      setAppliedCoupon({ code: data.code, discount, type: data.discount_type });
      toast.success(`Coupon applied! You save ₹${discount}`);
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleAddressSave = async (addr: Address) => {
    if (!isValidName(addr.name)) { toast.error('Invalid name'); return; }
    if (!isValidPhone(addr.phone)) { toast.error('Invalid phone'); return; }
    if (!isValidPincode(addr.pincode)) { toast.error('Invalid pincode'); return; }

    const sanitizedAddress: Address = {
      ...addr,
      name: sanitizeHtml(addr.name),
      address: sanitizeHtml(addr.address),
      landmark: addr.landmark ? sanitizeHtml(addr.landmark) : '',
    };

    if (user?.uid) {
      try {
        const saved = await saveDbAddress(user.uid, sanitizedAddress);
        sanitizedAddress.id = saved.id;
      } catch { /* fallback */ }
    }

    setAddresses((prev) => {
      const existing = prev.find((a) => a.id === addr.id);
      const updated = existing ? prev.map((a) => (a.id === sanitizedAddress.id ? sanitizedAddress : a)) : [...prev, sanitizedAddress];
      secureStorage.set('addresses', updated);
      return updated;
    });
    setSelectedAddress(sanitizedAddress);
    setShowAddressForm(false);
    setStep(2);
  };

  const generateQR = async () => {
    setQrLoading(true);
    try {
      const qr = await generatePaymentQR({
        upiId: MERCHANT_UPI.upiId,
        merchantName: MERCHANT_UPI.merchantName,
        amount: grandTotal,
        transactionRef: generateSecureId('TXN'),
      });
      setQrCodeUrl(qr);
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const validatePayment = async (): Promise<boolean> => {
    const rateCheck = checkRateLimit('checkout_payment', 5, 300000);
    if (!rateCheck.allowed) { toast.error('Too many attempts'); return false; }

    const storedToken = secureStorage.get<string>('checkout_csrf');
    if (!validateCsrfToken(csrfToken, storedToken || '')) { toast.error('Security validation failed'); return false; }
    if (!validateCartItems()) return false;
    if (!selectedAddress) { toast.error('Select delivery address'); return false; }

    const expectedTotal = items.reduce((sum, item) => sum + item.product.offerPrice * item.qty, 0) - couponDiscount + deliveryCharge;
    if (grandTotal !== Math.max(0, expectedTotal)) { toast.error('Price mismatch'); return false; }

    return true;
  };

  const handleUPIPay = async () => {
    if (!(await validatePayment())) return;

    setLoading(true);
    const orderId = generateSecureId('ROA');

    // Save order to database
    const saveOrder = async (paymentStatus: string = 'upi_pending') => {
      if (user?.uid) {
        try {
          await createOrder({
            userId: user.uid,
            orderNumber: orderId,
            items: items.map((item) => ({
              productId: item.product.id,
              productName: sanitizeHtml(item.product.name),
              weight: item.product.weight,
              quantity: item.qty,
              unitPrice: item.product.offerPrice,
              totalPrice: item.product.offerPrice * item.qty,
            })),
            totalAmount: subtotal - couponDiscount,
            deliveryCharge,
            paymentMethod: 'upi',
            paymentStatus,
            address: selectedAddress!,
            couponCode: appliedCoupon?.code,
          });
        } catch {
          secureStorage.set('lastOrder', {
            orderId,
            items: items.map((item) => ({ product: { id: item.product.id, name: sanitizeHtml(item.product.name), weight: item.product.weight, images: item.product.images, offerPrice: item.product.offerPrice }, qty: item.qty })),
            total: grandTotal,
            address: selectedAddress,
            status: paymentStatus,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        secureStorage.set('lastOrder', {
          orderId,
          items: items.map((item) => ({ product: { id: item.product.id, name: sanitizeHtml(item.product.name), weight: item.product.weight, images: item.product.images, offerPrice: item.product.offerPrice }, qty: item.qty })),
          total: grandTotal,
          address: selectedAddress,
          status: paymentStatus,
          createdAt: new Date().toISOString(),
        });
      }
    };

    await saveOrder('upi_pending');
    clearCart();
    secureStorage.remove('checkout_csrf');

    // Open UPI app on mobile or show QR on desktop
    const txnRef = generateSecureId('TXN');
    const upiParams = {
      upiId: MERCHANT_UPI.upiId,
      merchantName: MERCHANT_UPI.merchantName,
      amount: grandTotal,
      transactionRef: txnRef,
    };

    // Try to open UPI app directly (works on mobile)
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      openUPIApp(upiParams);
    }

    // Redirect to order success with UPI QR code and WhatsApp redirect
    navigate(`/order-success?id=${orderId}&upi=true`, { state: { qrParams: upiParams } });
    setLoading(false);
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(MERCHANT_UPI.upiId);
      setCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield size={20} className="text-green-600" />
        <span className="text-sm text-gray-600">Secure checkout by PickUrStay Hotels — UPI payment only</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { num: 1, label: 'Address', Icon: MapPin },
          { num: 2, label: 'UPI Payment', Icon: QrCode },
          { num: 3, label: 'Confirm', Icon: Check },
        ].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-maroon-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-maroon-700 text-white' : 'bg-gray-200'}`}>
              <s.Icon size={16} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
            {s.num < 3 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-maroon-700' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Select Delivery Address</h2>
                <button onClick={() => setShowAddressForm(true)} className="text-maroon-700 font-medium hover:underline">+ Add New</button>
              </div>
              {showAddressForm ? (
                <AddressForm onSave={handleAddressSave} onCancel={() => setShowAddressForm(false)} />
              ) : addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`border-2 rounded-xl p-4 cursor-pointer transition ${selectedAddress?.id === addr.id ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="radio" name="address" checked={selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} className="sr-only" />
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{sanitizeHtml(addr.name)}</p>
                          <p className="text-gray-600 text-sm">{sanitizeHtml(addr.address)}</p>
                          <p className="text-gray-600 text-sm">{sanitizeHtml(addr.city)}, {sanitizeHtml(addr.state)} - {addr.pincode}</p>
                          <p className="text-gray-500 text-sm">{addr.phone}</p>
                        </div>
                        {selectedAddress?.id === addr.id && (
                          <div className="w-5 h-5 bg-maroon-700 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No saved addresses</p>
                  <button onClick={() => setShowAddressForm(true)} className="bg-maroon-700 text-white px-6 py-2 rounded-lg font-medium">Add Address</button>
                </div>
              )}
              {selectedAddress && (
                <button onClick={() => setStep(2)} className="mt-6 w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 transition">
                  Continue to Payment
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Smartphone size={20} className="text-maroon-700" /> UPI Payment
              </h2>

              <div className="bg-maroon-50 border border-maroon-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Pay using any UPI app</p>

                {/* UPI ID Display */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg font-bold text-maroon-700 select-all">{MERCHANT_UPI.upiId}</p>
                    <button
                      onClick={copyUPIId}
                      className="p-1.5 hover:bg-gray-100 rounded transition"
                      title="Copy UPI ID"
                    >
                      {copied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-500" />}
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="mb-4">
                  <button
                    onClick={generateQR}
                    disabled={qrLoading}
                    className="bg-maroon-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-maroon-800 transition inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <QrCode size={18} />
                    {qrLoading ? 'Generating...' : 'Show QR Code'}
                  </button>
                </div>

                {qrCodeUrl && (
                  <div className="inline-block bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  After payment, you'll be redirected to confirm your order via WhatsApp
                </p>
              </div>

              {/* Quick UPI App Buttons for Mobile */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { name: 'GPay', url: 'tez://upi/pay' },
                  { name: 'PhonePe', url: 'phonepe://pay' },
                  { name: 'Paytm', url: 'paytmmp://pay' },
                ].map((app) => (
                  <button
                    key={app.name}
                    onClick={() => {
                      const txnRef = generateSecureId('TXN');
                      const upiString = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI.upiId)}&pn=${encodeURIComponent(MERCHANT_UPI.merchantName)}&am=${grandTotal.toFixed(2)}&tr=${encodeURIComponent(txnRef)}&cu=INR`;
                      window.location.href = upiString;
                    }}
                    className="border border-gray-200 rounded-lg py-3 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    {app.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Back</button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 transition"
                >
                  I've Made the Payment
                </button>
              </div>
            </div>
          )}

          {step === 3 && selectedAddress && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-3">Delivery Address</h2>
                <p className="text-gray-700">{sanitizeHtml(selectedAddress.name)}</p>
                <p className="text-gray-600">{sanitizeHtml(selectedAddress.address)}</p>
                <p className="text-gray-600">{sanitizeHtml(selectedAddress.city)} - {selectedAddress.pincode}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-3">Payment</h2>
                <div className="flex items-center gap-3 text-gray-700">
                  <Smartphone size={20} className="text-maroon-700" />
                  <div>
                    <p className="font-medium">UPI — {MERCHANT_UPI.upiId}</p>
                    <p className="text-sm text-gray-500">Amount: ₹{grandTotal}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-4">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <img src={item.product.images?.[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium">{sanitizeHtml(item.product.name)}</p>
                        <p className="text-sm text-gray-500">{item.product.weight} × {item.qty}</p>
                      </div>
                      <p className="font-semibold">₹{item.product.offerPrice * item.qty}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Back</button>
                <button
                  onClick={handleUPIPay}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} /> {loading ? 'Processing...' : 'Confirm & WhatsApp'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            {!appliedCoupon ? (
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none text-sm"
                  />
                </div>
                <button onClick={applyCoupon} disabled={couponLoading || !couponCode} className="px-4 py-2 bg-maroon-700 text-white rounded-lg text-sm font-medium hover:bg-maroon-800 disabled:opacity-50">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                  <span className="text-sm text-green-600">-₹{couponDiscount}</span>
                </div>
                <button onClick={removeCoupon} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-green-600"><span>Product Discount</span><span>-₹{discountAmt}</span></div>
              {appliedCoupon && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon.code})</span><span>-₹{couponDiscount}</span></div>}
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${deliveryCharge}`}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><span>Total</span><span>₹{grandTotal}</span></div>
            </div>

            {subtotal < DELIVERY_FREE_THRESHOLD && (
              <div className="bg-gold-100 rounded-lg p-3 mt-4 text-sm">
                Add ₹{DELIVERY_FREE_THRESHOLD - subtotal} more for <span className="font-semibold text-maroon-700">FREE delivery</span>
              </div>
            )}

            {/* Payment Info Box */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-2">
                <Smartphone size={16} />
                UPI Payment Only
              </div>
              <p className="text-xs text-blue-700">
                Pay to <strong>{MERCHANT_UPI.upiId}</strong> via any UPI app. After payment, confirm on WhatsApp for order processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
