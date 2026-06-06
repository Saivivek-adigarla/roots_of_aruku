import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { isValidName, sanitizeHtml, isValidPrice } from '../utils/security';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'coffee' | 'turmeric' | 'honey' | 'spices' | 'other';
  weight: string;
  mrp: number;
  selling_price: number;
  offer_price: number;
  description: string;
  benefits: string[];
  status: 'active' | 'outofstock' | 'discontinued';
  featured: boolean;
  images: string[];
  emoji: string;
  stock_quantity: number;
}

const CATEGORIES = [
  { value: 'coffee', label: 'Coffee' },
  { value: 'turmeric', label: 'Turmeric' },
  { value: 'honey', label: 'Honey' },
  { value: 'spices', label: 'Spices' },
  { value: 'other', label: 'Other' },
] as const;

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  slug: '',
  category: 'coffee',
  weight: '',
  mrp: 0,
  selling_price: 0,
  offer_price: 0,
  description: '',
  benefits: [],
  status: 'active',
  featured: false,
  images: [],
  emoji: '',
  stock_quantity: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [benefitInput, setBenefitInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setBenefitInput('');
    setImageInput('');
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      category: product.category,
      weight: product.weight,
      mrp: product.mrp,
      selling_price: product.selling_price,
      offer_price: product.offer_price,
      description: product.description,
      benefits: product.benefits || [],
      status: product.status,
      featured: product.featured,
      images: product.images || [],
      emoji: product.emoji,
      stock_quantity: product.stock_quantity,
    });
    setBenefitInput('');
    setImageInput('');
    setShowForm(true);
  };

  const addBenefit = () => {
    const val = benefitInput.trim();
    if (val && !form.benefits.includes(val)) {
      setForm((f) => ({ ...f, benefits: [...f.benefits, val] }));
      setBenefitInput('');
    }
  };

  const removeBenefit = (idx: number) => {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== idx) }));
  };

  const addImage = () => {
    const val = imageInput.trim();
    if (val) {
      setForm((f) => ({ ...f, images: [...f.images, val] }));
      setImageInput('');
    }
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Product name is required'); return; }
    if (!isValidName(form.name)) { toast.error('Invalid product name'); return; }
    if (!isValidPrice(form.mrp)) { toast.error('Invalid MRP'); return; }
    if (!isValidPrice(form.selling_price)) { toast.error('Invalid selling price'); return; }
    if (!isValidPrice(form.offer_price)) { toast.error('Invalid offer price'); return; }
    if (form.offer_price > form.mrp) { toast.error('Offer price cannot exceed MRP'); return; }

    setSaving(true);
    try {
      const payload = {
        name: sanitizeHtml(form.name),
        slug: form.slug || generateSlug(form.name),
        category: form.category,
        weight: form.weight,
        mrp: form.mrp,
        selling_price: form.selling_price,
        offer_price: form.offer_price,
        description: sanitizeHtml(form.description),
        benefits: form.benefits,
        status: form.status,
        featured: form.featured,
        images: form.images,
        emoji: form.emoji,
        stock_quantity: form.stock_quantity,
      };

      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), payload);
        toast.success('Product updated');
      } else {
        // Check for duplicate slug
        const snapshot = await getDocs(collection(db, 'products'));
        const exists = snapshot.docs.some(d => d.data().slug === payload.slug);
        if (exists) {
          toast.error('Product with this slug already exists');
          setSaving(false);
          return;
        }
        await addDoc(collection(db, 'products'), {
          ...payload,
          created_at: new Date(),
        });
        toast.success('Product added');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const discountPercent = (mrp: number, offer: number) =>
    Math.round(((mrp - offer) / mrp) * 100);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-maroon-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-maroon-800">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editing ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || generateSlug(e.target.value) }))} placeholder="e.g. Tribal Reserve Coffee" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Product['category'] }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight *</label>
                <input value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} placeholder="e.g. 100g" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP *</label>
                <input type="number" value={form.mrp} onChange={(e) => setForm((f) => ({ ...f, mrp: Number(e.target.value) }))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                <input type="number" value={form.selling_price} onChange={(e) => setForm((f) => ({ ...f, selling_price: Number(e.target.value) }))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price *</label>
                <input type="number" value={form.offer_price} onChange={(e) => setForm((f) => ({ ...f, offer_price: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input type="number" value={form.stock_quantity} onChange={(e) => setForm((f) => ({ ...f, stock_quantity: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Product['status'] }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none">
                  <option value="active">Active</option>
                  <option value="outofstock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} placeholder="e.g. ☕" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Product description..." className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
              <div className="flex gap-2 mb-2">
                <input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} placeholder="e.g. 100% Organic" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
                <button type="button" onClick={addBenefit} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.benefits.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-maroon-50 text-maroon-700 rounded-full text-sm">
                    {b}
                    <button type="button" onClick={() => removeBenefit(i)} className="hover:text-red-600"><X size={14} /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
              <div className="flex gap-2 mb-2">
                <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Image URL" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
                <button type="button" onClick={addImage} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1"><Upload size={14} /> Add</button>
              </div>
              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X size={16} className="text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-maroon-700" id="featured" />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Product</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex-1 bg-maroon-700 text-white py-2.5 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No products yet</h2>
          <p className="text-gray-500 mb-4">Add your first product to get started</p>
          <button onClick={openAdd} className="bg-maroon-700 text-white px-6 py-2 rounded-lg font-medium">Add Product</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pricing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-lg">{product.emoji}</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.weight}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{product.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-maroon-700">₹{product.offer_price}</p>
                      <p className="text-xs text-gray-400 line-through">₹{product.mrp}</p>
                      {discountPercent(product.mrp, product.offer_price) > 0 && (
                        <span className="text-xs text-green-600">{discountPercent(product.mrp, product.offer_price)}% off</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock_quantity > 10 ? 'text-green-600' : product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' :
                        product.status === 'outofstock' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status}
                      </span>
                      {product.featured && (
                        <span className="ml-1 inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-gold-100 text-maroon-700">Featured</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 text-gray-500 hover:text-maroon-700 hover:bg-maroon-50 rounded-lg transition"><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
