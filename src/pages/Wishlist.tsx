import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { discountPct } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: typeof items[0]) => {
    addItem(product);
    toast.success('Added to cart');
  };

  const handleRemove = (productId: string) => {
    remove(productId);
    toast.success('Removed from wishlist');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon</p>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Wishlist ({items.length})</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <Link to={`/product/${product.id}`}>
              <img src={product.images?.[0] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg'} alt={product.name} className="w-full h-40 object-cover" />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.weight}</p>
              </Link>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-bold text-maroon-700">₹{product.offerPrice}</span>
                <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                <span className="text-xs text-green-600">{discountPct(product.mrp, product.offerPrice)}% off</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-1 bg-maroon-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-maroon-800 transition"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
