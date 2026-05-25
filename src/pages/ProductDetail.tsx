import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, Check, Star, Truck, Shield, Package } from 'lucide-react';
import { SEED_PRODUCTS } from '../data/products';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { discountPct } from '../utils/helpers';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  user_name?: string;
}

const seedProducts: Product[] = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [dbProduct, setDbProduct] = useState<{ stock_quantity: number; status: string } | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();

  const product = seedProducts.find((p) => p.id === id);

  useEffect(() => {
    if (id) {
      fetchReviews();
      fetchProductStock();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('*, users(name)')
        .eq('product_id', id)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped = data.map((r: { id: string; rating: number; title: string; comment: string; is_verified_purchase: boolean; created_at: string; users?: { name: string } }) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          is_verified_purchase: r.is_verified_purchase,
          created_at: r.created_at,
          user_name: r.users?.name || 'Customer',
        }));
        setReviews(mapped);
        if (mapped.length > 0) {
          setAvgRating(mapped.reduce((s: number, r: Review) => s + r.rating, 0) / mapped.length);
        }
      }
    } catch {
      // Fallback to empty reviews
    }
  };

  const fetchProductStock = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('stock_quantity, status')
        .eq('id', id)
        .maybeSingle();
      if (data) setDbProduct(data);
    } catch {
      // Fallback
    }
  };

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
  const inStock = dbProduct ? dbProduct.stock_quantity > 0 : product.status === 'active';

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
              <span className="text-sm font-semibold text-green-700">{avgRating > 0 ? avgRating.toFixed(1) : '4.5'}</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500 text-sm">{reviews.length || 125} Reviews</span>
            <span className="text-gray-400">|</span>
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>{inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          <div className="bg-warm-50 rounded-xl p-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-maroon-700">₹{product.offerPrice}</span>
              <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
              <span className="text-green-600 font-semibold">{discount}% off</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          {inStock && (
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
          )}

          <div className="flex gap-3">
            <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 flex items-center justify-center gap-2 bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 transition shadow-lg shadow-maroon-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={20} /> {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {inStock && (
              <button onClick={handleBuyNow} className="flex-1 bg-gold-400 text-maroon-900 py-3 rounded-xl font-semibold hover:bg-gold-500 transition">Buy Now</button>
            )}
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

      <section className="space-y-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-maroon-100 rounded-full flex items-center justify-center text-maroon-700 font-semibold text-sm">
                    {review.user_name?.charAt(0) || 'U'}
                  </div>
                  <span className="font-medium text-gray-800">{review.user_name}</span>
                  <StarRating rating={review.rating} />
                  {review.is_verified_purchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified Purchase</span>
                  )}
                </div>
                {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                <p className="text-gray-600 text-sm">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        )}

        <ReviewForm productId={id || ''} onReviewAdded={fetchReviews} />
      </section>
    </div>
  );
}
