import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { SEED_PRODUCTS } from '../data/products';
import { fetchProducts } from '../services/database';
import type { Product } from '../types';

const fallbackProducts: Product[] = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

export default function Products() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ status: 'active' })
      .then(setProducts)
      .catch(() => setProducts(fallbackProducts))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">All Products</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-white rounded-xl animate-pulse h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Products</h1>
      {products.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
