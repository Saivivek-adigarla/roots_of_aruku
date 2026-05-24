import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { Loader2, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      setUser({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || email,
        phone: firebaseUser.phoneNumber || '',
        isAdmin: email === import.meta.env.VITE_ADMIN_EMAIL,
      });
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtpField) {
      if (!phone || phone.length < 10) {
        toast.error('Enter valid phone number');
        return;
      }
      setLoading(true);
      toast.success('OTP sent to your phone (demo mode)');
      setShowOtpField(true);
      setLoading(false);
    } else {
      if (!otp || otp.length < 4) {
        toast.error('Enter valid OTP');
        return;
      }
      setLoading(true);
      toast.success('Login successful (demo mode)');
      setUser({
        uid: 'demo-' + phone,
        name: 'User',
        email: '',
        phone: phone,
        isAdmin: false,
      });
      navigate('/');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-warm-50 to-warm-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-maroon-700 text-white px-8 py-6 text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-warm-200 mt-1 text-sm">Sign in to your Roots of Araku account</p>
          </div>

          <div className="p-8">
            <div className="flex rounded-lg bg-warm-100 p-1 mb-6">
              <button
                onClick={() => setMode('email')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'email' ? 'bg-white text-maroon-700 shadow' : 'text-gray-600'}`}
              >
                <Mail className="inline w-4 h-4 mr-1" /> Email
              </button>
              <button
                onClick={() => setMode('phone')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'phone' ? 'bg-white text-maroon-700 shadow' : 'text-gray-600'}`}
              >
                <Phone className="inline w-4 h-4 mr-1" /> Phone OTP
              </button>
            </div>

            {mode === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-maroon-700 hover:underline">Forgot Password?</Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (+91...)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition"
                  />
                </div>
                {showOtpField && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : showOtpField ? 'Verify OTP' : 'Send OTP'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/signup" className="text-sm text-gray-600">
                New customer? <span className="text-maroon-700 font-semibold hover:underline">Create an account</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
