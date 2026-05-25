import { Link } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { getDeliveryCharge, DELIVERY_FREE_THRESHOLD } from '../utils/helpers';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce((sum, item) => sum + item.product.offerPrice * item.qty, 0);
  const discountAmt = items.reduce((sum, item) => sum + (item.product.mrp - item.product.offerPrice) * item.qty, 0);
  const deliveryCharge = getDeliveryCharge(subtotal);
  const grandTotal = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to your cart to get started</p>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart ({items.length} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear Cart</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
              <img src={item.product.images?.[0] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?w=400'} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.weight}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold text-maroon-700">₹{item.product.offerPrice}</span>
                  <span className="text-sm text-gray-400 line-through">₹{item.product.mrp}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.product.id, item.qty - 1)} className="p-2 hover:bg-gray-100"><Minus size={14} /></button>
                    <span className="w-8 text-center font-medium text-sm">{item.qty}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.qty + 1)} className="p-2 hover:bg-gray-100"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">₹{item.product.offerPrice * item.qty}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discountAmt}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg"><span>Total</span><span>₹{grandTotal}</span></div>
          </div>
          {subtotal < DELIVERY_FREE_THRESHOLD && (
            <div className="bg-gold-100 rounded-lg p-3 mt-4 text-sm">Add ₹{DELIVERY_FREE_THRESHOLD - subtotal} more for <span className="font-semibold text-maroon-700">FREE delivery</span></div>
          )}
          <Link to="/checkout" className="mt-4 block w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold text-center hover:bg-maroon-800 transition">Proceed to Checkout</Link>
          <Link to="/products" className="mt-2 block text-center text-sm text-maroon-700 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
