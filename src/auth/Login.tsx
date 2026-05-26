import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, Phone, ArrowRight, AlertTriangle, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPhone, sanitizeHtml, checkRateLimit, secureStorage, generateCsrfToken, validateCsrfToken } from '../utils/security';
import { authService } from '../services/authService';

type LoginMode = 'email' | 'phone' | 'google';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setCsrfToken(generateCsrfToken());
    secureStorage.set('csrf_token', generateCsrfToken());
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const validateEmailForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePhoneForm = (): boolean => {
    const e: Record<string, string> = {};
    if (!showOtpField) {
      if (!phone.trim()) e.phone = 'Phone number is required';
      else if (!isValidPhone(phone)) e.phone = 'Enter a valid 10-digit number';
    } else {
      if (!otp.trim()) e.otp = 'OTP is required';
      else if (otp.length < 4 || otp.length > 6) e.otp = 'Enter a valid OTP';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmailForm()) return;
    const rateCheck = checkRateLimit('login_email', 5, 300000);
    if (!rateCheck.allowed) { toast.error('Too many attempts. Try again later.'); return; }
    const storedToken = secureStorage.get<string>('csrf_token');
    if (!validateCsrfToken(csrfToken, storedToken || '')) { toast.error('Security validation failed'); return; }

    setLoading(true);
    try {
      const user = await authService.loginWithEmail(email, password);
      setUser(user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) toast.error('Invalid email or password');
      else if (msg.includes('Email not confirmed')) toast.error('Please verify your email first');
      else if (msg.includes('too_many_requests')) toast.error('Too many attempts. Try later.');
      else toast.error('Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhoneForm()) return;

    setLoading(true);
    try {
      if (!showOtpField) {
        const rateCheck = checkRateLimit('login_otp', 3, 300000);
        if (!rateCheck.allowed) { toast.error('Too many OTP requests'); setLoading(false); return; }
        await authService.loginWithPhone(phone);
        toast.success('OTP sent to your phone!');
        setShowOtpField(true);
        setResendTimer(60);
      } else {
        const user = await authService.verifyPhoneOtp(phone, otp);
        setUser(user);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('invalid_otp') || msg.includes('Invalid one-time')) toast.error('Invalid OTP. Please try again.');
      else if (msg.includes('otp_expired')) toast.error('OTP expired. Please resend.');
      else toast.error(msg || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch {
      toast.error('Google sign-in failed');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    const rateCheck = checkRateLimit('login_otp_resend', 2, 300000);
    if (!rateCheck.allowed) { toast.error('Too many requests'); return; }
    try {
      await authService.loginWithPhone(phone);
      toast.success('OTP resent!');
      setResendTimer(60);
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-900">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-maroon-700 text-white px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-maroon-800 to-maroon-600 opacity-50" />
            <div className="relative">
              <div className="w-16 h-16 bg-gold-400 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                <Building2 size={32} className="text-maroon-900" />
              </div>
              <h1 className="text-2xl font-bold">PickUrStay</h1>
              <p className="text-warm-200 mt-1 text-sm">Sign in to your account</p>
            </div>
          </div>

          <div className="p-8">
            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
              {[
                { key: 'phone' as const, label: 'Phone OTP', icon: Phone },
                { key: 'email' as const, label: 'Email', icon: Mail },
                { key: 'google' as const, label: 'Google', icon: null },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setMode(tab.key); setErrors({}); setShowOtpField(false); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${mode === tab.key ? 'bg-white text-maroon-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.icon ? <tab.icon className="inline w-4 h-4 mr-1" /> : null}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Google Login */}
            {mode === 'google' && (
              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
                <p className="text-xs text-gray-500 text-center">Secure one-click sign in with your Google account</p>
              </div>
            )}

            {/* Email Login */}
            {mode === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
                {errors.email && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.email}</div>}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} placeholder="Email address" autoComplete="email" className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
                </div>
                {errors.password && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.password}</div>}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} placeholder="Password" autoComplete="current-password" className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`} />
                </div>
                <div className="text-right"><Link to="/forgot-password" className="text-sm text-maroon-700 hover:underline">Forgot Password?</Link></div>
                <button type="submit" disabled={loading} className="w-full bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {/* Phone OTP Login */}
            {mode === 'phone' && (
              <form onSubmit={handlePhoneLogin} className="space-y-4" noValidate>
                {errors.phone && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.phone}</div>}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">+91</span>
                  <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, phone: '' })); }} placeholder="10-digit mobile number" autoComplete="tel" disabled={showOtpField} className={`w-full pl-12 pr-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition disabled:bg-gray-50`} />
                </div>

                {showOtpField && (
                  <>
                    {errors.otp && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg"><AlertTriangle size={14} />{errors.otp}</div>}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, otp: '' })); }} placeholder="Enter 6-digit OTP" autoFocus className={`w-full pl-10 pr-4 py-3 border ${errors.otp ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition text-center text-lg tracking-widest`} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-gray-500">OTP sent to +91{phone}</p>
                      <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0} className="text-maroon-700 font-medium hover:underline disabled:text-gray-400 disabled:no-underline">
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="w-full bg-maroon-700 text-white py-3 rounded-xl font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : showOtpField ? 'Verify OTP & Login' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                New customer?{' '}
                <Link to="/signup" className="text-maroon-700 font-semibold hover:underline">Create an account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
