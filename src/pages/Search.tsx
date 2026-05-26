import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Package, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { SEED_PRODUCTS } from '../data/products';
import { searchProducts } from '../services/database';
import { CATEGORIES } from '../utils/helpers';
import type { Product } from '../types';

const fallbackProducts: Product[] = SEED_PRODUCTS.map((p, i) => ({ id: String(i), ...p }));

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    searchProducts(query, category || undefined, sort || undefined, priceRange)
      .then(setResults)
      .catch(() => {
        // Fallback to local data
        let filtered = fallbackProducts;
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (category) filtered = filtered.filter((p) => p.category === category);
        filtered = filtered.filter((p) => p.offerPrice >= priceRange[0] && p.offerPrice <= priceRange[1]);
        if (sort === 'price-low') filtered.sort((a, b) => a.offerPrice - b.offerPrice);
        else if (sort === 'price-high') filtered.sort((a, b) => b.offerPrice - a.offerPrice);
        setResults(filtered);
      })
      .finally(() => setLoading(false));
  }, [query, category, sort, priceRange]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    setSearchParams(params);
  };

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set('sort', value);
    else params.delete('sort');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 2000]);
    setSearchParams({});
  };

  const hasActiveFilters = query || category || sort || priceRange[0] > 0 || priceRange[1] < 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for coffee, turmeric, honey..." className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none" />
        </div>
        <button type="submit" className="px-6 py-3 bg-maroon-700 text-white rounded-xl font-semibold hover:bg-maroon-800">Search</button>
        <button type="button" onClick={() => setShowFilters(!showFilters)} className={`px-4 py-3 border rounded-xl font-medium flex items-center gap-2 ${showFilters ? 'border-maroon-700 bg-maroon-50 text-maroon-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
          <SlidersHorizontal size={18} /> <span className="hidden sm:inline">Filters</span>
        </button>
      </form>

      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</label>
            <div className="flex items-center gap-4">
              <input type="range" min={0} max={2000} step={50} value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="flex-1 accent-maroon-700" />
              <input type="range" min={0} max={2000} step={50} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="flex-1 accent-maroon-700" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><ArrowUpDown size={14} /> Sort By</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => updateSort(opt.value)} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${sort === opt.value ? 'bg-maroon-700 text-white border-maroon-700' : 'bg-white text-gray-600 border-gray-200 hover:border-maroon-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showFilters && (
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
          {hasActiveFilters && <button onClick={clearFilters} className="px-4 py-2 text-maroon-700 font-medium hover:underline flex items-center gap-1"><X size={16} /> Clear all</button>}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="bg-white rounded-xl animate-pulse h-72" />)}
        </div>
      ) : results.length === 0 ? (
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
