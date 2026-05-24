import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Check, Loader2, Wallet, Package } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getDeliveryCharge, generateOrderId } from '../utils/helpers';
import type { Address } from '../components/AddressForm';
import AddressForm from '../components/AddressForm';
import { loadRazorpay } from '../utils/razorpay';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, discount, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [loading, setLoading] = useState(false);

  const subtotal = total();
  const discountAmt = discount();
  const deliveryCharge = getDeliveryCharge(subtotal);
  const grandTotal = subtotal + deliveryCharge;

  const handleAddressSave = (addr: Address) => {
    setAddresses(prev => {
      const existing = prev.find(a => a.id === addr.id);
      return existing ? prev.map(a => a.id === addr.id ? addr : a) : [...prev, addr];
    });
    setSelectedAddress(addr);
    setShowAddressForm(false);
    setStep(2);
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      toast.error('Select delivery address');
      return;
    }
    setLoading(true);
    const orderId = generateOrderId();
    if (paymentMethod === 'razorpay') {
      try {
        await loadRazorpay();
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
          amount: grandTotal * 100,
          currency: 'INR',
          name: 'Roots of Araku',
          description: 'Order Payment',
          order_id: '',
          handler: () => {
            clearCart();
            localStorage.setItem('lastOrder', JSON.stringify({
              orderId,
              items,
              total: grandTotal,
              address: selectedAddress,
              status: 'paid',
              createdAt: new Date().toISOString(),
            }));
            navigate(`/order-success?id=${orderId}`);
          },
          prefill: {
            name: selectedAddress.name,
            email: user?.email,
            contact: selectedAddress.phone,
          },
        };
        const rzp = new (window as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error('Payment initialization failed');
      } finally {
        setLoading(false);
      }
    } else {
      clearCart();
      localStorage.setItem('lastOrder', JSON.stringify({
        orderId,
        items,
        total: grandTotal,
        address: selectedAddress,
        status: 'cod',
        createdAt: new Date().toISOString(),
      }));
      setLoading(false);
      navigate(`/order-success?id=${orderId}&cod=true`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to checkout</p>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="flex items-center justify-center gap-4 mb-8">
        {[
          { num: 1, label: 'Address', icon: MapPin },
          { num: 2, label: 'Payment', icon: CreditCard },
          { num: 3, label: 'Confirm', icon: Check },
        ].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-maroon-700' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-maroon-700 text-white' : 'bg-gray-200'}`}>
              <s.icon size={16} />
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
                <button onClick={() => setShowAddressForm(true)} className="text-maroon-700 font-medium hover:underline">
                  + Add New
                </button>
              </div>
              {showAddressForm ? (
                <AddressForm onSave={handleAddressSave} onCancel={() => setShowAddressForm(false)} />
              ) : addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition ${selectedAddress?.id === addr.id ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="sr-only"
                      />
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{addr.name}</p>
                          <p className="text-gray-600 text-sm">{addr.address}</p>
                          <p className="text-gray-600 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
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
                  <button onClick={() => setShowAddressForm(true)} className="bg-maroon-700 text-white px-6 py-2 rounded-lg font-medium">
                    Add Address
                  </button>
                </div>
              )}
              {selectedAddress && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800"
                >
                  Continue to Payment
                </button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4 ${paymentMethod === 'razorpay' ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200'}`}>
                  <input type="radio" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-maroon-700" />
                  <Wallet size={24} className="text-maroon-700" />
                  <div>
                    <p className="font-semibold">Pay Online</p>
                    <p className="text-sm text-gray-500">UPI, Cards, Net Banking</p>
                  </div>
                </label>
                <label className={`border-2 rounded-xl p-4 cursor-pointer flex items-center gap-4 ${paymentMethod === 'cod' ? 'border-maroon-700 bg-maroon-50' : 'border-gray-200'}`}>
                  <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-maroon-700" />
                  <Truck size={24} className="text-maroon-700" />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive</p>
                  </div>
                </label>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-lg mb-3">Delivery Address</h2>
                <p className="text-gray-700">{selectedAddress?.name}</p>
                <p className="text-gray-600">{selectedAddress?.address}</p>
                <p className="text-gray-600">{selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.pincode}</p>
                <p className="text-gray-500">{selectedAddress?.phone}</p>
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
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-500">{item.product.weight} x {item.qty}</p>
                      </div>
                      <p className="font-semibold">₹{item.product.offerPrice * item.qty}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : `Pay ₹${grandTotal}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discountAmt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
            {subtotal < 499 && (
              <div className="bg-gold-100 rounded-lg p-3 mt-4 text-sm">
                Add ₹{499 - subtotal} more for <span className="font-semibold text-maroon-700">FREE delivery</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
