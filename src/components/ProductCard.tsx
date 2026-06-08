import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { discountPct } from '../utils/helpers';
import { IMAGE_ALT_TEXT } from '../data/products';
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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fallbackImg = 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?w=400';
  const imgSrc = imgError ? fallbackImg : (product.images?.[0] || fallbackImg);
  const altText = IMAGE_ALT_TEXT[product.images?.[0] || ''] || `${product.name} - ${product.weight} - Roots of Araku organic ${product.category}`;

  const handleImgError = useCallback(() => setImgError(true), []);

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
    <Link to={`/product/${product.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={imgSrc}
          alt={altText}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={handleImgError}
          className={`w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <span className="text-3xl">{product.emoji}</span>
          </div>
        )}
        {product.showOfferBadge && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}
        {!inStock && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all duration-200 ${wishlisted ? 'text-red-500' : 'text-gray-400'}`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
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
