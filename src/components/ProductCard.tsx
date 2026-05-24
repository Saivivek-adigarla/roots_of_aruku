import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../data/products';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { discountPct } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wishlisted = has(product.id);
  const discount = discountPct(product.mrp, product.offerPrice);

  return (
    <Link to={`/product/${product.id}`} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col p-3">
      <img src={product.images?.[0] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg'} alt={product.name} className="w-full h-40 object-cover rounded mb-3" />
      <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{product.name}</h3>
      <p className="text-xs text-gray-400">{product.weight}</p>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="font-bold text-maroon-700">₹{product.offerPrice}</span>
        <span className="text-gray-400 text-xs line-through">₹{product.mrp}</span>
        <span className="text-green-600 text-xs">{discount}% off</span>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added to cart!'); }} className="flex-1 flex items-center justify-center gap-1 bg-maroon-700 text-white py-1.5 rounded text-xs font-semibold hover:bg-maroon-800"><ShoppingCart size={12} /> Add</button>
        <button onClick={(e) => { e.preventDefault(); toggle(product); }} className={`px-2 py-1.5 rounded ${wishlisted ? 'text-red-500' : 'text-gray-400'}`}><Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} /></button>
      </div>
    </Link>
  );
}
