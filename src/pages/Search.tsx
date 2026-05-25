import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Package, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SEED_PRODUCTS } from '../data/products';
import { CATEGORIES } from '../utils/helpers';
import { Product } from '../types';

const products: Product[] = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    let filtered = products;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    setResults(filtered);
  }, [query, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (category) params.set('category', category);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for coffee, turmeric, honey..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none" />
        </div>
        <button type="submit" className="px-6 py-3 bg-maroon-700 text-white rounded-xl font-semibold hover:bg-maroon-800">Search</button>
      </form>

      <div className="flex gap-2 items-center mb-6 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button key={cat.value} onClick={() => {
            const params = new URLSearchParams(searchParams);
            if (category === cat.value) params.delete('category');
            else params.set('category', cat.value);
            if (query) params.set('q', query);
            setSearchParams(params);
          }} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${category === cat.value ? 'bg-maroon-700 text-white border-maroon-700' : 'bg-white text-gray-600 border-gray-200 hover:border-maroon-300'}`}>
            {cat.emoji} {cat.label}
          </button>
        ))}
        {(query || category) && <button onClick={clearFilters} className="px-4 py-2 text-maroon-700 font-medium hover:underline flex items-center gap-1"><X size={16} /> Clear all</button>}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No products found</h2>
          <Link to="/products" className="inline-block bg-maroon-700 text-white px-8 py-3 rounded-full font-semibold">View All Products</Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">{results.length} product{results.length !== 1 ? 's' : ''} found{query && <span className="text-maroon-700 font-medium"> for "{query}"</span>}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
