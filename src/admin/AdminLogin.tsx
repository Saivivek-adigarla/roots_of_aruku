import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, Loader2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { isValidEmail, sanitizeHtml, checkRateLimit } from '../utils/security';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Enter email and password');
      return;
    }
    if (!isValidEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    const rateCheck = checkRateLimit('admin_login', 3, 300000);
    if (!rateCheck.allowed) {
      toast.error('Too many attempts. Try again later.');
      return;
    }

    setLoading(true);
    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const isAdminEmail = sanitizedEmail === import.meta.env.VITE_ADMIN_EMAIL;
      if (!isAdminEmail) {
        toast.error('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      setUser({
        uid: userCredential.user.uid,
        name: sanitizeHtml(userCredential.user.displayName || 'Admin'),
        email: userCredential.user.email || sanitizedEmail,
        phone: '',
        isAdmin: true,
      });
      toast.success('Admin login successful');
      navigate('/admin');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
        toast.error('Invalid credentials');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon-900 to-maroon-700 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-maroon-700 text-white px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} className="text-gold-400" />
            </div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-warm-200 mt-1 text-sm">Secure access for administrators</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoComplete="email" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Admin'}
            </button>
          </form>

          <div className="px-8 pb-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-maroon-700">Back to Store</a>
          </div>
        </div>
      </div>
    </div>
  );
}
