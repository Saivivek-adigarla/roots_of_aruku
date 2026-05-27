import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, Phone, ArrowRight, AlertTriangle, Mountain, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { isValidEmail, isValidPhone, checkRateLimit, secureStorage, generateCsrfToken, validateCsrfToken, sanitizeHtml } from '../utils/security';
import { authService } from '../services/authService';

type LoginMode = 'phone' | 'email' | 'google';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setMounted(true);
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

  const handleEmailLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
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

  const handlePhoneLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validatePhoneForm()) return;
    setLoading(true);
    try {
      if (!showOtpField) {
        const rateCheck = checkRateLimit('login_otp', 3, 300000);
        if (!rateCheck.allowed) { toast.error('Too many OTP requests'); setLoading(false); return; }
        await authService.loginWithPhone(phone);
        toast.success('OTP sent to +91' + phone);
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
    <div className="min-h-screen flex relative overflow-hidden bg-maroon-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?w=1400"
          alt="Araku Valley Hills"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-900/80 via-maroon-800/70 to-black/60" />
      </div>

      {/* Floating decorative elements */}
      <div className={`absolute top-20 right-20 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
      <div className={`absolute bottom-32 left-16 w-48 h-48 bg-maroon-600/20 rounded-full blur-3xl transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />

      {/* Left Panel - Branding (hidden on mobile) */}
      <div className={`hidden lg:flex flex-1 items-center justify-center relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
        <div className="text-center px-12 max-w-lg">
          <div className="w-24 h-24 bg-gold-400/20 backdrop-blur-md border border-gold-400/30 rounded-3xl mx-auto mb-8 flex items-center justify-center">
            <Mountain size={48} className="text-gold-400" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
            Roots of <span className="text-gold-400">Araku</span>
          </h1>
          <p className="text-xl text-warm-200/90 mb-8 leading-relaxed">
            Real Taste from the Hills
          </p>
          <p className="text-warm-200/60 text-sm leading-relaxed">
            Premium organic coffee, wild turmeric, and golden honey sourced directly from the tribal farms of Araku Valley, Eastern Ghats.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={`flex-1 lg:max-w-md flex items-center justify-center relative z-10 p-4 sm:p-8 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-gold-400/20 backdrop-blur-md border border-gold-400/30 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Mountain size={32} className="text-gold-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Roots of <span className="text-gold-400">Araku</span>
            </h1>
            <p className="text-warm-200/70 text-sm">Real Taste from the Hills</p>
          </div>

          {/* Glassmorphism Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-white/60 text-sm">Sign in to your Roots of Araku account</p>
            </div>

            <div className="px-6 pb-6">
              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-white/10 p-1 mb-5 border border-white/10">
                {[
                  { key: 'phone' as const, label: 'Phone', icon: Phone },
                  { key: 'email' as const, label: 'Email', icon: Mail },
                  { key: 'google' as const, label: 'Google', icon: null },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setMode(tab.key); setErrors({}); setShowOtpField(false); }}
                    className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                      mode === tab.key
                        ? 'bg-white/20 text-white shadow-sm backdrop-blur-md'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    {tab.icon && <tab.icon className="inline w-3.5 h-3.5 mr-1" />}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Google Login */}
              {mode === 'google' && (
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <p className="text-white/40 text-xs text-center">Secure one-click sign in with your Google account</p>
                </div>
              )}

              {/* Email Login */}
              {mode === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-3" noValidate>
                  {errors.email && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.email}</div>}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                      placeholder="Email address"
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm"
                    />
                  </div>
                  {errors.password && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.password}</div>}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                      placeholder="Password"
                      autoComplete="current-password"
                      className="w-full pl-9 pr-10 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-gold-400 hover:text-gold-300 transition">Forgot Password?</Link>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-400 text-maroon-900 py-3 rounded-xl font-bold hover:bg-gold-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold-400/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={16} /></>}
                  </button>
                </form>
              )}

              {/* Phone OTP Login */}
              {mode === 'phone' && (
                <form onSubmit={handlePhoneLogin} className="space-y-3" noValidate>
                  {errors.phone && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.phone}</div>}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, phone: '' })); }}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                      disabled={showOtpField}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-sm disabled:opacity-50"
                    />
                  </div>

                  {showOtpField && (
                    <>
                      {errors.otp && <div className="flex items-center gap-2 text-red-300 text-xs bg-red-500/20 px-3 py-2 rounded-lg"><AlertTriangle size={12} />{errors.otp}</div>}
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, otp: '' })); }}
                          placeholder="Enter 6-digit OTP"
                          autoFocus
                          className="w-full pl-9 pr-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/50 outline-none transition text-center text-lg tracking-[0.3em]"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/40">OTP sent to +91{phone}</span>
                        <button type="button" onClick={handleResendOtp} disabled={resendTimer > 0} className="text-gold-400 font-medium hover:text-gold-300 disabled:text-white/30 transition">
                          {resendTimer > 0 ? `${resendTimer}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold-400 text-maroon-900 py-3 rounded-xl font-bold hover:bg-gold-500 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gold-400/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : showOtpField ? 'Verify & Login' : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Divider */}
              <div className="mt-5 pt-4 border-t border-white/10 text-center">
                <p className="text-white/40 text-sm">
                  New customer?{' '}
                  <Link to="/signup" className="text-gold-400 font-semibold hover:text-gold-300 transition">Create an account</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
