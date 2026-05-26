import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Check, Loader2, Wallet, Package, Shield, Tag, X } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getDeliveryCharge, DELIVERY_FREE_THRESHOLD } from '../utils/helpers';
import type { Address } from '../types';
import AddressForm from '../components/AddressForm';
import { loadRazorpay } from '../utils/razorpay';
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

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percentage' | 'flat' } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

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
      if (!data) { toast.error('Invalid or expired coupon code'); return; }
      if (data.min_order_value > subtotal) { toast.error(`Minimum order ₹${data.min_order_value} required`); return; }
      if (data.usage_limit && data.used_count >= data.usage_limit) { toast.error('Coupon usage limit reached'); return; }

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

    // Try saving to Supabase if user is authenticated
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

  const validatePayment = async (): Promise<boolean> => {
    const rateCheck = checkRateLimit('checkout_payment', 5, 300000);
    if (!rateCheck.allowed) { toast.error('Too many payment attempts'); return false; }

    const storedToken = secureStorage.get<string>('checkout_csrf');
    if (!validateCsrfToken(csrfToken, storedToken || '')) { toast.error('Security validation failed'); return false; }
    if (!validateCartItems()) return false;
    if (!selectedAddress) { toast.error('Select delivery address'); return false; }

    const expectedTotal = items.reduce((sum, item) => sum + item.product.offerPrice * item.qty, 0) - couponDiscount + deliveryCharge;
    if (grandTotal !== Math.max(0, expectedTotal)) { toast.error('Price mismatch detected'); return false; }

    return true;
  };

  const handlePayment = async () => {
    if (!(await validatePayment())) return;

    setLoading(true);
    const orderId = generateSecureId('ROA');

    const saveOrderToDb = async (paymentId?: string, status: string = 'paid') => {
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
            paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
            paymentStatus: status,
            paymentId,
            address: selectedAddress!,
            couponCode: appliedCoupon?.code,
          });
        } catch {
          // Fallback to localStorage
          secureStorage.set('lastOrder', {
            orderId,
            items: items.map((item) => ({ product: { id: item.product.id, name: sanitizeHtml(item.product.name), weight: item.product.weight, images: item.product.images, offerPrice: item.product.offerPrice }, qty: item.qty })),
            total: grandTotal,
            address: selectedAddress,
            status,
            paymentId,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        secureStorage.set('lastOrder', {
          orderId,
          items: items.map((item) => ({ product: { id: item.product.id, name: sanitizeHtml(item.product.name), weight: item.product.weight, images: item.product.images, offerPrice: item.product.offerPrice }, qty: item.qty })),
          total: grandTotal,
          address: selectedAddress,
          status,
          paymentId,
          createdAt: new Date().toISOString(),
        });
      }
    };

    if (paymentMethod === 'razorpay') {
      try {
        await loadRazorpay();
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'Roots of Araku',
          description: 'Order Payment',
          handler: async (response: { razorpay_payment_id: string }) => {
            if (!response.razorpay_payment_id) { toast.error('Payment verification failed'); return; }
            clearCart();
            await saveOrderToDb(response.razorpay_payment_id, 'paid');
            secureStorage.remove('checkout_csrf');
            navigate(`/order-success?id=${orderId}`);
          },
          prefill: { name: sanitizeHtml(selectedAddress!.name), email: user?.email || '', contact: selectedAddress!.phone },
          theme: { color: '#6B1A1A' },
        };
        const rzp = new (window as { Razorpay: new (opts: typeof options) => { open: () => void } }).Razorpay(options);
        rzp.open();
      } catch { toast.error('Payment initialization failed'); }
      finally { setLoading(false); }
    } else {
      clearCart();
      await saveOrderToDb(undefined, 'pending');
      secureStorage.remove('checkout_csrf');
      setLoading(false);
      navigate(`/order-success?id=${orderId}&cod=true`);
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
        <span className="text-sm text-gray-600">Secure checkout with 256-bit encryption</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex items-center justify-center gap-4 mb-8">
        {[{ num: 1, label: 'Address', Icon: MapPin }, { num: 2, label: 'Payment', Icon: CreditCard }, { num: 3, label: 'Confirm', Icon: Check }].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-maroon-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-maroon-700 text-white' : 'bg-gray-200'}`}><s.Icon size={16} /></div>
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
                        {selectedAddress?.id === addr.id && <div className="w-5 h-5 bg-maroon-700 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
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
              {selectedAddress && <button onClick={() => setStep(2)} className="mt-6 w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800">Continue to Payment</button>}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4 ${paymentMethod === 'razorpay' ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200'}`}>
                  <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-maroon-700" />
                  <Wallet size={24} className="text-maroon-700" />
                  <div><p className="font-semibold">Pay Online</p><p className="text-sm text-gray-500">UPI, Cards, Net Banking</p></div>
                </label>
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4 ${paymentMethod === 'cod' ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200'}`}>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-maroon-700" />
                  <Truck size={24} className="text-maroon-700" />
                  <div><p className="font-semibold">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when you receive</p></div>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800">Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && selectedAddress && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-3">Delivery Address</h2>
                <p className="text-gray-700">{sanitizeHtml(selectedAddress.name)}</p>
                <p className="text-gray-600">{sanitizeHtml(selectedAddress.address)}</p>
                <p className="text-gray-600">{sanitizeHtml(selectedAddress.city)}, {sanitizeHtml(selectedAddress.state)} - {selectedAddress.pincode}</p>
                <p className="text-gray-500">{selectedAddress.phone}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-3">Payment Method</h2>
                <p className="text-gray-700">{paymentMethod === 'razorpay' ? 'Pay Online (UPI/Cards/Net Banking)' : 'Cash on Delivery'}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-4">Order Items</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4">
                      <img src={item.product.images?.[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1"><p className="font-medium">{sanitizeHtml(item.product.name)}</p><p className="text-sm text-gray-500">{item.product.weight} x {item.qty}</p></div>
                      <p className="font-semibold">₹{item.product.offerPrice * item.qty}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Back</button>
                <button onClick={handlePayment} disabled={loading} className="flex-1 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${grandTotal}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

            {!appliedCoupon ? (
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none text-sm" />
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
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><span>Total</span><span>₹{grandTotal}</span></div>
            </div>
            {subtotal < DELIVERY_FREE_THRESHOLD && (
              <div className="bg-gold-100 rounded-lg p-3 mt-4 text-sm">Add ₹{DELIVERY_FREE_THRESHOLD - subtotal} more for <span className="font-semibold text-maroon-700">FREE delivery</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
