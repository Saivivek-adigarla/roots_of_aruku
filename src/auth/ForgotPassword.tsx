import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email address'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Failed to send reset link.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-maroon-900">
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=1400" alt="Coffee beans" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-900/80 via-maroon-800/70 to-black/60" />
      </div>

      <div className={`flex-1 flex items-center justify-center relative z-10 p-4 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Leaf size={48} className="text-gold-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-1">Roots of <span className="text-gold-400">Araku</span></h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white mb-1">Forgot Password</h2>
              <p className="text-white/60 text-sm">Reset your password via email</p>
            </div>
            <div className="px-6 pb-6">
              {sent ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Check Your Email</h3>
                  <p className="text-white/60 text-sm mb-6">We sent a reset link to {email}</p>
                  <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-300 inline-flex items-center gap-1 transition"><ArrowLeft size={16} /> Back to Login</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-white/50 text-sm">Enter the email associated with your account to receive a reset link.</p>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-gold-400 text-maroon-900 py-3 rounded-xl font-bold hover:bg-gold-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-400/20">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <Link to="/login" className="text-xs text-gold-400 hover:text-gold-300 inline-flex items-center gap-1 transition"><ArrowLeft size={14} /> Back to Login</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
