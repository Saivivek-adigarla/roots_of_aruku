import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { discountPct } from '../utils/helpers';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const wishlisted = has(product.id);
  const discount = discountPct(product.mrp, product.offerPrice);
  const inStock = product.stockQuantity !== undefined ? product.stockQuantity > 0 : product.status === 'active';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) { toast.error('Product is out of stock'); return; }
    addItem(product);
    toast.success('Added to cart!');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
      <div className="relative">
        <img
          src={product.images?.[0] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?w=400'}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
        {product.showOfferBadge && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Out of Stock
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition ${wishlisted ? 'text-red-500' : 'text-gray-400'}`}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.weight}</p>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="text-lg font-bold text-maroon-700">₹{product.offerPrice}</span>
          <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="mt-2 w-full flex items-center justify-center gap-1.5 bg-maroon-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-maroon-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
