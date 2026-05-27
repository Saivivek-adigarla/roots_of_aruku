import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SEED_PRODUCTS } from '../data/products';
import { fetchProducts } from '../services/database';
import type { Product } from '../types';

const fallbackProducts: Product[] = SEED_PRODUCTS.slice(0, 4).map((p, i) => ({ id: String(i), ...p }));

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    fetchProducts({ featured: true, status: 'active' })
      .then(setFeatured)
      .catch(() => setFeatured(fallbackProducts));
  }, []);

  return (
    <div className="pb-12">
      <div className="relative h-80 bg-gradient-to-r from-maroon-700 to-maroon-600 flex items-center justify-center text-center text-white overflow-hidden">
        <img src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=1200" alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">Roots of Araku</h1>
          <p className="text-xl text-gold-400 mb-6">Real Taste from the Hills</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-gold-400 text-maroon-900 px-8 py-3 rounded-full font-bold hover:bg-gold-500"><ArrowRight size={16} /> Shop Now</Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-maroon-700 text-gold-400 text-center py-3 px-4 rounded-lg mb-8">LAUNCHING OFFER -- Up to 33% OFF on all products! Free delivery above ₹499</div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {featured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <img src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=600" alt="Story" className="rounded-2xl shadow-lg h-72 object-cover" />
          <div>
            <h2 className="text-3xl font-bold text-maroon-700 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Nestled in the Eastern Ghats, Araku Valley is home to ancient tribal communities who have cultivated coffee, turmeric, and wild honey for generations. Roots of Araku brings these pristine organic products directly to your doorstep.</p>
            <Link to="/about" className="inline-flex items-center gap-2 bg-maroon-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-maroon-800"><ArrowRight size={16} /> Know More</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
