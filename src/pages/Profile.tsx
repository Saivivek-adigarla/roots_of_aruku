import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Package, MapPin, Heart, LogOut, Edit2, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import toast from 'react-hot-toast';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setUser({ ...user!, name, phone });
    setEditing(false);
    toast.success('Profile updated');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-maroon-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.isAdmin && (
              <span className="inline-block mt-2 px-3 py-1 bg-gold-400 text-maroon-900 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}
          </div>

          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button onClick={() => navigate('/orders')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition border-b border-gray-100">
              <Package size={18} className="text-maroon-700" />
              <span>My Orders</span>
            </button>
            <button onClick={() => navigate('/addresses')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition border-b border-gray-100">
              <MapPin size={18} className="text-maroon-700" />
              <span>Saved Addresses</span>
            </button>
            <button onClick={() => navigate('/wishlist')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition">
              <Heart size={18} className="text-maroon-700" />
              <span>Wishlist</span>
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-maroon-700 font-medium hover:underline"
                >
                  <Edit2 size={16} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="px-3 py-1 border border-gray-300 rounded text-sm">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-maroon-700 text-white rounded text-sm">
                    <Save size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <User size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Full Name</label>
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-maroon-500"
                    />
                  ) : (
                    <p className="font-medium">{user.name}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Email Address</label>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Phone Number</label>
                  {editing ? (
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Add phone number"
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-maroon-500"
                    />
                  ) : (
                    <p className="font-medium">{user.phone || 'Not added'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
