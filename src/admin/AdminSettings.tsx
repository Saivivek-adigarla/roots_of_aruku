import { useState } from 'react';
import { Save, Store, Mail, Phone, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { secureStorage } from '../utils/security';

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  whatsappNumber: string;
  adminEmail: string;
}

export default function AdminSettings() {
  const [form, setForm] = useState<StoreSettings>({
    storeName: secureStorage.get<string>('store_name') || 'Roots of Araku',
    storeEmail: secureStorage.get<string>('store_email') || '',
    storePhone: secureStorage.get<string>('store_phone') || '',
    freeDeliveryThreshold: secureStorage.get<number>('free_delivery') || 499,
    deliveryCharge: secureStorage.get<number>('delivery_charge') || 49,
    whatsappNumber: secureStorage.get<string>('whatsapp_number') || '917036252018',
    adminEmail: secureStorage.get<string>('admin_email') || import.meta.env.VITE_ADMIN_EMAIL || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      secureStorage.set('store_name', form.storeName);
      secureStorage.set('store_email', form.storeEmail);
      secureStorage.set('store_phone', form.storePhone);
      secureStorage.set('free_delivery', form.freeDeliveryThreshold);
      secureStorage.set('delivery_charge', form.deliveryCharge);
      secureStorage.set('whatsapp_number', form.whatsappNumber);
      secureStorage.set('admin_email', form.adminEmail);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4"><Store size={20} className="text-maroon-700" /> Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input value={form.storeName} onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={form.storeEmail} onChange={(e) => setForm((f) => ({ ...f, storeEmail: e.target.value }))} placeholder="store@example.com" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={form.storePhone} onChange={(e) => setForm((f) => ({ ...f, storePhone: e.target.value }))} placeholder="+91..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4"><Truck size={20} className="text-maroon-700" /> Delivery Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above (₹)</label>
              <input type="number" value={form.freeDeliveryThreshold} onChange={(e) => setForm((f) => ({ ...f, freeDeliveryThreshold: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Charge (₹)</label>
              <input type="number" value={form.deliveryCharge} onChange={(e) => setForm((f) => ({ ...f, deliveryCharge: Number(e.target.value) }))} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">WhatsApp</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
            <input value={form.whatsappNumber} onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))} placeholder="917036252018" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input value={form.adminEmail} onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
