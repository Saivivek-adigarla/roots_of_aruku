import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag } from 'lucide-react';
export default function Cart() {
  const { items, total } = useCartStore();
  return <div className="max-w-7xl mx-auto px-4 py-8">
    {items.length === 0 ? (
      <div className="text-center py-16"><ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" /><p className="text-gray-500 font-medium">Your cart is empty</p><Link to="/products" className="mt-4 inline-block bg-maroon-700 text-white px-6 py-2.5 rounded-full font-semibold">Browse Products</Link></div>
    ) : (
      <div><h1 className="text-2xl font-bold mb-6">Cart ({items.length} items)</h1><div className="bg-white rounded-lg p-6"><p className="text-lg font-bold">Total: ₹{total()}</p><Link to="/checkout" className="mt-4 inline-block bg-maroon-700 text-white px-6 py-3 rounded-full font-bold">Proceed to Checkout</Link></div></div>
    )}
  </div>;
}
