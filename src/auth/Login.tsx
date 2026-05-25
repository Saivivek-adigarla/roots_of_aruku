import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { Loader2, Mail, Lock, Phone, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isValidEmail,
  isValidPhone,
  sanitizeHtml,
  checkRateLimit,
  secureStorage,
  generateCsrfToken,
  validateCsrfToken,
} from '../utils/security';

export default function Login() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; otp?: string }>({});
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // Generate CSRF token on mount
    setCsrfToken(generateCsrfToken());
    secureStorage.set('csrf_token', csrfToken);
  }, []);

  const validateEmailForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoneForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!showOtpField) {
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!isValidPhone(phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    } else {
      if (!otp.trim()) {
        newErrors.otp = 'OTP is required';
      } else if (otp.length < 4 || otp.length > 6) {
        newErrors.otp = 'Please enter a valid OTP';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmailForm()) return;

    // Check rate limit
    const rateCheck = checkRateLimit('login_email', 5, 300000); // 5 attempts per 5 minutes
    if (!rateCheck.allowed) {
      toast.error(`Too many login attempts. Please try again in ${Math.ceil((rateCheck.resetAt - Date.now()) / 60000)} minutes.`);
      return;
    }

    // Validate CSRF
    const storedToken = secureStorage.get<string>('csrf_token');
    if (!validateCsrfToken(csrfToken, storedToken || '')) {
      toast.error('Security validation failed. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      const firebaseUser = userCredential.user;

      setUser({
        uid: firebaseUser.uid,
        name: sanitizeHtml(firebaseUser.displayName || 'User'),
        email: firebaseUser.email || sanitizedEmail,
        phone: firebaseUser.phoneNumber || '',
        isAdmin: sanitizedEmail === import.meta.env.VITE_ADMIN_EMAIL,
      });

      toast.success('Welcome back!');
      secureStorage.remove('csrf_token');
      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';

      // Don't expose specific error messages
      if (message.includes('user-not-found') || message.includes('wrong-password')) {
        toast.error('Invalid email or password');
      } else if (message.includes('too-many-requests')) {
        toast.error('Account temporarily locked. Try again later.');
      } else if (message.includes('invalid-email')) {
        toast.error('Invalid email format');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePhoneForm()) return;

    // Check rate limit for OTP requests
    if (!showOtpField) {
      const rateCheck = checkRateLimit('login_otp', 3, 300000); // 3 OTP requests per 5 minutes
      if (!rateCheck.allowed) {
        toast.error(`Too many OTP requests. Please try again later.`);
        return;
      }
    }

    setLoading(true);
    try {
      if (!showOtpField) {
        // In demo mode, just show OTP field
        toast.success('OTP sent to your phone');
        setShowOtpField(true);
        setCsrfToken(generateCsrfToken());
      } else {
        // Validate OTP (demo: accept any 4-6 digit code)
        const sanitizedOtp = otp.replace(/\D/g, '');
        if (sanitizedOtp.length < 4) {
          throw new Error('Invalid OTP');
        }

        const sanitizedPhone = phone.replace(/\D/g, '').slice(-10);
        setUser({
          uid: 'demo-' + sanitizedPhone,
          name: 'User',
          email: '',
          phone: sanitizedPhone,
          isAdmin: false,
        });

        toast.success('Login successful');
        navigate('/');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
    } finally {
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
                onClick={() => { setMode('email'); setErrors({}); setShowOtpField(false); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'email' ? 'bg-white text-maroon-700 shadow' : 'text-gray-600'}`}
              >
                <Mail className="inline w-4 h-4 mr-1" /> Email
              </button>
              <button
                onClick={() => { setMode('phone'); setErrors({}); setShowOtpField(false); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'phone' ? 'bg-white text-maroon-700 shadow' : 'text-gray-600'}`}
              >
                <Phone className="inline w-4 h-4 mr-1" /> Phone OTP
              </button>
            </div>

            {mode === 'email' ? (
              <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
                {errors.email && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    {errors.email}
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                    placeholder="Email address"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
                  />
                </div>

                {errors.password && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    {errors.password}
                  </div>
                )}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                    placeholder="Password"
                    autoComplete="current-password"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
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
              <form onSubmit={handlePhoneLogin} className="space-y-4" noValidate>
                {errors.phone && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <AlertTriangle size={14} />
                    {errors.phone}
                  </div>
                )}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: undefined })); }}
                    placeholder="Phone number (+91...)"
                    autoComplete="tel"
                    disabled={showOtpField}
                    className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition disabled:bg-gray-50`}
                  />
                </div>

                {showOtpField && (
                  <>
                    {errors.otp && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                        <AlertTriangle size={14} />
                        {errors.otp}
                      </div>
                    )}
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors(prev => ({ ...prev, otp: undefined })); }}
                        placeholder="Enter OTP"
                        className={`w-full pl-10 pr-4 py-3 border ${errors.otp ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
                      />
                    </div>
                  </>
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
