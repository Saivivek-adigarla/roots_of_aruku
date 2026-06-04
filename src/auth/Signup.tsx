import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, ArrowRight, AlertTriangle, Check, Eye, EyeOff, Mountain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { isValidEmail, isValidName, isValidPhone, validatePassword, sanitizeHtml, checkRateLimit, secureStorage, generateCsrfToken, validateCsrfToken } from '../utils/security';
import { authService } from '../services/authService';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setMounted(true);
    const token = generateCsrfToken();
    setCsrfToken(token);
    secureStorage.set('csrf_signup_token', token);
  }, []);

  useEffect(() => {
    if (password) setPasswordValidation(validatePassword(password));
    else setPasswordValidation(null);
  }, [password]);

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    else if (!isValidName(name)) e.name = 'Name should be 2-100 letters only';
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email';
    if (phone && !isValidPhone(phone)) e.phone = 'Enter a valid 10-digit number';
    if (!password) e.password = 'Password is required';
    else { const pv = validatePassword(password); if (!pv.valid) e.password = pv.errors[0]; }
    if (!confirmPassword) e.confirmPassword = 'Please confirm password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;
    const rateCheck = checkRateLimit('signup', 3, 300000);
    if (!rateCheck.allowed) { toast.error('Too many signup attempts'); return; }
    const storedToken = secureStorage.get<string>('csrf_signup_token');
    if (!validateCsrfToken(csrfToken, storedToken || '')) { toast.error('Security validation failed'); return; }

    setLoading(true);
    try {
      const user = await authService.registerWithEmail(email, password, sanitizeHtml(name.trim()), phone ? phone.replace(/\D/g, '').slice(-10) : undefined);
      setUser(user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      if (msg.includes('already registered') || msg.includes('already exists')) setErrors({ email: 'An account with this email already exists' });
      else if (msg.includes('weak password') || msg.includes('Password should be')) setErrors({ password: 'Password is too weak' });
      else toast.error('Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-maroon-900">
      <div className="absolute inset-0">
        <img src="https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?w=1400" alt="Coffee" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-900/80 via-maroon-800/70 to-black/60" />
      </div>

      <div className={`hidden lg:flex flex-1 items-center justify-center relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
        <div className="text-center px-12 max-w-lg">
          <div className="w-24 h-24 bg-gold-400/20 backdrop-blur-md border border-gold-400/30 rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <Mountain size={48} className="text-gold-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">Roots of <span className="text-gold-400">Araku</span></h1>
          <p className="text-xl text-warm-200/90 mb-8">Real Taste from the Hills</p>
          <p className="text-warm-200/60 text-sm leading-relaxed">Join our community and discover premium organic coffee, wild turmeric, and golden honey from Araku Valley.</p>
        </div>
      </div>

      <div className={`flex-1 lg:max-w-md flex items-center justify-center relative z-10 p-4 sm:p-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gold-400/20 backdrop-blur-md border border-gold-400/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Mountain size={32} className="text-gold-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Roots of <span className="text-gold-400">Araku</span></h1>
            <p className="text-warm-200/70 text-sm">Real Taste from the Hills</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
              <p className="text-white/60 text-sm">Join the Roots of Araku family</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3" noValidate>
              {errors.name && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.name}</div>}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} placeholder="Full Name" autoComplete="name" maxLength={100} className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
              </div>
              {errors.email && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.email}</div>}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="Email address" autoComplete="email" className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
              </div>
              {errors.phone && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.phone}</div>}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">+91</span>
                <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, phone: '' })); }} placeholder="Phone (optional)" autoComplete="tel" className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
              </div>
              {errors.password && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.password}</div>}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} placeholder="Password" autoComplete="new-password" className="w-full pl-9 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              {passwordValidation && (
                <div className="bg-white/10 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50">Strength:</span>
                    <span className={`font-medium ${passwordValidation.strength === 'strong' ? 'text-green-400' : passwordValidation.strength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>{passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}</span>
                  </div>
                </div>
              )}
              {errors.confirmPassword && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.confirmPassword}</div>}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }} placeholder="Confirm Password" autoComplete="new-password" className="w-full pl-9 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm" />
                {password && confirmPassword && password === confirmPassword && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" size={16} />}
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gold-400 text-maroon-900 py-3 rounded-xl font-bold hover:bg-gold-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold-400/20">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
              <div className="text-center pt-2"><p className="text-white/40 text-sm">Already have an account? <Link to="/login" className="text-gold-400 font-semibold hover:text-gold-300 transition">Sign In</Link></p></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
