import { useState } from 'react';
import { MapPin, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface Props {
  onSave: (addr: Address) => void;
  initial?: Address;
  onCancel?: () => void;
}

export default function AddressForm({ onSave, initial, onCancel }: Props) {
  const [form, setForm] = useState<Address>(initial || {
    id: Date.now().toString(),
    name: '',
    phone: '',
    address: '',
    city: 'Araku Valley',
    state: 'Andhra Pradesh',
    pincode: '',
    landmark: '',
  });

  const handleChange = (field: keyof Address, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error('Fill all required fields');
      return;
    }
    if (form.phone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }
    if (form.pincode.length !== 6) {
      toast.error('Enter valid 6-digit pincode');
      return;
    }
    onSave(form);
    toast.success('Address saved');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
        <MapPin className="text-maroon-700" size={20} /> {initial ? 'Edit Address' : 'Add New Address'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Full Name *"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Phone Number *"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
          />
        </div>
      </div>
      <textarea
        value={form.address}
        onChange={(e) => handleChange('address', e.target.value)}
        placeholder="House/Flat no., Street, Locality *"
        rows={2}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none resize-none"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <input
          value={form.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="City *"
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
        />
        <input
          value={form.state}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="State *"
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
        />
        <input
          value={form.pincode}
          onChange={(e) => handleChange('pincode', e.target.value)}
          placeholder="Pincode *"
          maxLength={6}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
        />
      </div>
      <input
        value={form.landmark || ''}
        onChange={(e) => handleChange('landmark', e.target.value)}
        placeholder="Landmark (optional)"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
      />
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-maroon-700 text-white py-2.5 rounded-lg font-semibold hover:bg-maroon-800 transition"
        >
          {initial ? 'Update Address' : 'Save Address'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
