import { SEED_PRODUCTS } from '../data/products';
import ProductCard from '../components/ProductCard';

const products = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

export default function Products() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
