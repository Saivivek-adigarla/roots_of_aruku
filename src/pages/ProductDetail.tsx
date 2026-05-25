import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Check, Star, Truck, Shield, Package } from 'lucide-react';
import { SEED_PRODUCTS } from '../data/products';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { discountPct } from '../utils/helpers';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import { Product } from '../types';

const products: Product[] = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h2>
        <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">Browse Products</Link>
      </div>
    );
  }

  const wishlisted = has(product.id);
  const discount = discountPct(product.mrp, product.offerPrice);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`Added ${qty} item${qty > 1 ? 's' : ''} to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/checkout');
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % (product.images.length || 1));
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + (product.images.length || 1)) % (product.images.length || 1));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm mb-6">
        <Link to="/" className="text-gray-500 hover:text-maroon-700">Home</Link>
        <span className="mx-2 text-gray-300">/</span>
        <Link to="/products" className="text-gray-500 hover:text-maroon-700">Products</Link>
        <span className="mx-2 text-gray-300">/</span>
        <span className="text-maroon-700 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="relative bg-white rounded-2xl overflow-hidden aspect-square">
            <img src={product.images?.[currentImage] || 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg'} alt={product.name} className="w-full h-full object-contain" />
            {product.images && product.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white"><ChevronLeft size={24} /></button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full shadow flex items-center justify-center hover:bg-white"><ChevronRight size={24} /></button>
              </>
            )}
            {product.showOfferBadge && <span className="absolute top-4 left-4 bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">{discount}% OFF</span>}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setCurrentImage(idx)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImage === idx ? 'border-maroon-700' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-500">{product.weight}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
              <Star size={14} fill="currentColor" className="text-green-700" />
              <span className="text-sm font-semibold text-green-700">4.5</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 text-sm">125 Reviews</span>
            <span className="text-gray-400">|</span>
            <span className="text-green-600 text-sm font-medium">In Stock</span>
          </div>

          <div className="bg-warm-50 rounded-xl p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-maroon-700">₹{product.offerPrice}</span>
              <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
              <span className="text-green-600 font-semibold">{discount}% off</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100"><Minus size={18} /></button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-gray-100"><Plus size={18} /></button>
            </div>
            <button onClick={() => toggle(product)} className={`p-3 rounded-lg border ${wishlisted ? 'text-red-500 border-red-500' : 'text-gray-400 border-gray-200'}`}>
              <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition shadow-lg shadow-maroon-200">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="flex-1 bg-gold-400 text-maroon-900 py-3 rounded-xl font-semibold hover:bg-gold-500 transition">Buy Now</button>
          </div>

          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
            <div className="text-center"><Truck className="w-6 h-6 mx-auto text-maroon-700 mb-1" /><p className="text-xs text-gray-600">Free Delivery</p><p className="text-xs text-gray-400">Orders over ₹499</p></div>
            <div className="text-center"><Shield className="w-6 h-6 mx-auto text-maroon-700 mb-1" /><p className="text-xs text-gray-600">100% Organic</p><p className="text-xs text-gray-400">Certified</p></div>
            <div className="text-center"><Package className="w-6 h-6 mx-auto text-maroon-700 mb-1" /><p className="text-xs text-gray-600">Secure Packaging</p><p className="text-xs text-gray-400">Safe delivery</p></div>
          </div>

          <div><h3 className="font-semibold mb-2">Description</h3><p className="text-gray-600 leading-relaxed">{product.description}</p></div>

          <div>
            <h3 className="font-semibold mb-2">Benefits</h3>
            <ul className="space-y-2">
              {product.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600"><Check size={16} className="text-green-500" />{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
        <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center text-maroon-700 font-semibold text-sm">U</div>
                <span className="font-medium">Customer {i}</span>
                <StarRating rating={5 - i * 0.5} />
              </div>
              <p className="text-gray-600 text-sm">{i === 1 ? 'Love the authentic taste from Araku Valley.' : i === 2 ? 'Fast delivery and excellent quality.' : 'Will order again!'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
