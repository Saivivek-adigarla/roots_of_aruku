import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tag, Percent, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const emptyCoupon: Omit<Coupon, 'id'> = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_value: 0,
  max_discount: null,
  usage_limit: null,
  used_count: 0,
  valid_from: new Date().toISOString().slice(0, 16),
  valid_until: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 16),
  is_active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'coupons'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Coupon[];
      setCoupons(data);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyCoupon);
    setShowForm(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_value: coupon.min_order_value,
      max_discount: coupon.max_discount,
      usage_limit: coupon.usage_limit,
      used_count: coupon.used_count,
      valid_from: coupon.valid_from?.slice(0, 16) || '',
      valid_until: coupon.valid_until?.slice(0, 16) || '',
      is_active: coupon.is_active,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Coupon code is required'); return; }
    if (form.discount_value <= 0) { toast.error('Discount value must be positive'); return; }
    if (form.discount_type === 'percentage' && form.discount_value > 100) { toast.error('Percentage cannot exceed 100%'); return; }

    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_value: form.min_order_value,
        max_discount: form.max_discount,
        usage_limit: form.usage_limit,
        valid_from: form.valid_from,
        valid_until: form.valid_until,
        is_active: form.is_active,
      };

      if (editing) {
        await updateDoc(doc(db, 'coupons', editing.id), payload);
        toast.success('Coupon updated');
      } else {
        // Check for duplicate code
        const snapshot = await getDocs(query(collection(db, 'coupons')));
        const exists = snapshot.docs.some(d => d.data().code === payload.code);
        if (exists) {
          toast.error('Coupon code already exists');
          setSaving(false);
          return;
        }
        await addDoc(collection(db, 'coupons'), {
          ...payload,
          used_count: 0,
          created_at: new Date(),
        });
        toast.success('Coupon created');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error('Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateDoc(doc(db, 'coupons', coupon.id), { is_active: !coupon.is_active });
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const isExpired = (validUntil: string) => new Date(validUntil) < new Date();

  if (loading) {
    return <div className="text-center py-16"><div className="animate-spin w-12 h-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-maroon-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-maroon-800"><Plus size={18} /> Add Coupon</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editing ? 'Edit Coupon' : 'Create Coupon'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. WELCOME10" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'flat' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <div className="relative">
                  <input type="number" value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))} min={1} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {form.discount_type === 'percentage' ? <Percent size={16} /> : <IndianRupee size={16} />}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Value</label>
                <input type="number" value={form.min_order_value} onChange={(e) => setForm((f) => ({ ...f, min_order_value: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount (optional)</label>
                <input type="number" value={form.max_discount || ''} onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value ? Number(e.target.value) : null }))} min={0} placeholder="No limit" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit (optional)</label>
                <input type="number" value={form.usage_limit || ''} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value ? Number(e.target.value) : null }))} min={1} placeholder="Unlimited" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                <input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input type="datetime-local" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="e.g. 10% off on first order" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="accent-maroon-700" id="coupon-active" />
              <label htmlFor="coupon-active" className="text-sm font-medium text-gray-700">Active</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="flex-1 bg-maroon-700 text-white py-2.5 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50">{saving ? 'Saving...' : editing ? 'Update Coupon' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Tag size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No coupons</h2>
          <p className="text-gray-500 mb-4">Create your first coupon</p>
          <button onClick={openAdd} className="bg-maroon-700 text-white px-6 py-2 rounded-lg font-medium">Create Coupon</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className={`bg-white rounded-xl p-5 shadow-sm border ${!coupon.is_active || isExpired(coupon.valid_until) ? 'border-gray-200 opacity-60' : 'border-green-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-maroon-700">{coupon.code}</span>
                  <p className="text-sm text-gray-500">{coupon.description}</p>
                </div>
                <button onClick={() => toggleActive(coupon)} className={`px-2 py-1 rounded text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`} <span className="text-sm font-normal text-gray-500">off</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                {coupon.min_order_value > 0 && <p>Min order: ₹{coupon.min_order_value}</p>}
                {coupon.max_discount && <p>Max discount: ₹{coupon.max_discount}</p>}
                <p>Used: {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''} times</p>
                <p>Expires: {new Date(coupon.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(coupon)} className="p-2 text-gray-500 hover:text-maroon-700 hover:bg-maroon-50 rounded-lg transition"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
