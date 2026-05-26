import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Phone, ArrowRight, AlertTriangle, Check, Eye, EyeOff, Building2 } from 'lucide-react';
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
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-maroon-700 text-white px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-800 to-maroon-600 opacity-50" />
            <div className="relative">
              <div className="w-16 h-16 bg-gold-400 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                <Building2 size={32} className="text-maroon-900" />
              </div>
              <h1 className="text-2xl font-bold">Create Account</h1>
              <p className="text-warm-200 mt-1 text-sm">Join PickUrStay</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>
            {errors.name && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.name}</div>}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} placeholder="Full Name" autoComplete="name" maxLength={100} className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
            </div>
            {errors.email && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.email}</div>}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="Email address" autoComplete="email" className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
            </div>
            {errors.phone && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.phone}</div>}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
              <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, phone: '' })); }} placeholder="Phone number (optional)" autoComplete="tel" className={`w-full pl-12 pr-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
            </div>
            {errors.password && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.password}</div>}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} placeholder="Password" autoComplete="new-password" className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordValidation && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Strength:</span>
                  <span className={`font-medium ${passwordValidation.strength === 'strong' ? 'text-green-600' : passwordValidation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                  </span>
                </div>
              </div>
            )}
            {errors.confirmPassword && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.confirmPassword}</div>}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }} placeholder="Confirm Password" autoComplete="new-password" className={`w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
              {password && confirmPassword && password === confirmPassword && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />}
            </div>
            <button type="submit" disabled={loading} className="w-full bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2 transition">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>
            <div className="text-center"><p className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-maroon-700 font-semibold hover:underline">Sign In</Link></p></div>
          </form>
        </div>
      </div>
    </div>
  );
}
