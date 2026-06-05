import { useState, useEffect } from 'react';
import { Plus, MapPin, CreditCard as Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { Address } from '../types';
import AddressForm from '../components/AddressForm';
import toast from 'react-hot-toast';
import { fetchAddresses, saveAddress, deleteAddress as deleteDbAddress } from '../services/database';
import { secureStorage } from '../utils/security';

export default function Addresses() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadAddresses();
  }, [user?.uid, navigate]);

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const dbAddresses = await fetchAddresses(user.uid);
      setAddresses(dbAddresses);
    } catch {
      // Fallback to localStorage
      const saved = secureStorage.get<Address[]>('addresses');
      if (saved) setAddresses(saved);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (addr: Address) => {
    if (!user) return;
    try {
      const saved = await saveAddress(user.uid, addr);
      setAddresses((prev) => {
        const existing = prev.find((a) => a.id === addr.id);
        const updated = existing ? prev.map((a) => (a.id === saved.id ? saved : a)) : [...prev.filter((a) => a.id !== addr.id), saved];
        return updated;
      });
      setShowForm(false);
      setEditingAddress(null);
      toast.success('Address saved');
    } catch {
      // Fallback to localStorage
      setAddresses((prev) => {
        const existing = prev.find((a) => a.id === addr.id);
        const updated = existing ? prev.map((a) => (a.id === addr.id ? addr : a)) : [...prev, addr];
        secureStorage.set('addresses', updated);
        return updated;
      });
      setShowForm(false);
      setEditingAddress(null);
      toast.success('Address saved locally');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await deleteDbAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch {
      // Fallback
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      secureStorage.set('addresses', updated);
      toast.success('Address deleted');
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center"><div className="animate-spin w-10 h-10 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Saved Addresses</h1>
        <button onClick={() => { setEditingAddress(null); setShowForm(true); }} className="flex items-center gap-1 bg-maroon-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-maroon-800">
          <Plus size={18} /> Add New
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AddressForm onSave={handleSave} initial={editingAddress || undefined} onCancel={() => { setShowForm(false); setEditingAddress(null); }} />
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No saved addresses</h2>
          <p className="text-gray-500 mb-4">Add an address for faster checkout</p>
          <button onClick={() => setShowForm(true)} className="bg-maroon-700 text-white px-6 py-2 rounded-lg font-medium">Add Address</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-maroon-100 rounded-full flex items-center justify-center">
                    <MapPin className="text-maroon-700" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{addr.name}</p>
                    <p className="text-gray-600">{addr.phone}</p>
                    <p className="text-gray-600">{addr.address}</p>
                    <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.landmark && <p className="text-gray-500 text-sm">Landmark: {addr.landmark}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingAddress(addr); setShowForm(true); }} className="p-2 text-gray-500 hover:text-maroon-700 hover:bg-maroon-50 rounded-lg transition">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
