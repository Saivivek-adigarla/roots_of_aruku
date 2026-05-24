import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuthStore } from '../store/authStore';
import { Loader2, Mail, Lock, User, Phone, ArrowRight, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  isValidEmail,
  isValidPhone,
  isValidName,
  validatePassword,
  sanitizeHtml,
  checkRateLimit,
  secureStorage,
  generateCsrfToken,
  validateCsrfToken,
} from '../utils/security';

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
    setCsrfToken(generateCsrfToken());
    secureStorage.set('csrf_signup_token', csrfToken);
  }, []);

  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isValidName(name)) {
      newErrors.name = 'Name should contain only letters (2-100 characters)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (phone && !isValidPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const pwdValidation = validatePassword(password);
      if (!pwdValidation.valid) {
        newErrors.password = pwdValidation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Check rate limit
    const rateCheck = checkRateLimit('signup', 3, 300000); // 3 attempts per 5 minutes
    if (!rateCheck.allowed) {
      toast.error(`Too many signup attempts. Please try again later.`);
      return;
    }

    // Validate CSRF
    const storedToken = secureStorage.get<string>('csrf_signup_token');
    if (!validateCsrfToken(csrfToken, storedToken || '')) {
      toast.error('Security validation failed. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedName = sanitizeHtml(name.trim());

      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      await updateProfile(userCredential.user, { displayName: sanitizedName });

      setUser({
        uid: userCredential.user.uid,
        name: sanitizedName,
        email: sanitizedEmail,
        phone: phone ? phone.replace(/\D/g, '').slice(-10) : '',
        isAdmin: false,
      });

      toast.success('Account created successfully!');
      secureStorage.remove('csrf_signup_token');
      navigate('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed';

      if (message.includes('email-already-in-use')) {
        setErrors({ email: 'An account with this email already exists' });
        toast.error('Email already registered. Try logging in instead.');
      } else if (message.includes('weak-password')) {
        setErrors({ password: 'Password is too weak' });
      } else if (message.includes('invalid-email')) {
        setErrors({ email: 'Invalid email format' });
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-gradient-to-br from-warm-50 to-warm-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-maroon-700 text-white px-8 py-6 text-center">
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-warm-200 mt-1 text-sm">Join the Roots of Araku family</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4" noValidate>
            {errors.name && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle size={14} />
                {errors.name}
              </div>
            )}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder="Full Name"
                autoComplete="name"
                maxLength={100}
                className={`w-full pl-10 pr-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
              />
            </div>

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
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                placeholder="Email address"
                autoComplete="email"
                maxLength={254}
                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
              />
            </div>

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
                onChange={(e) => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }}
                placeholder="Phone number (optional)"
                autoComplete="tel"
                maxLength={15}
                className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                placeholder="Password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {passwordValidation && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordValidation.strength === 'strong' ? 'text-green-600' :
                    passwordValidation.strength === 'medium' ? 'text-gold-600' : 'text-red-600'
                  }`}>
                    {passwordValidation.strength.charAt(0).toUpperCase() + passwordValidation.strength.slice(1)}
                  </span>
                </div>
                <div className="flex gap-1">
                  {['At least 8 characters', 'Uppercase letter', 'Lowercase letter', 'Number'].map((req, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded ${
                        passwordValidation.valid && i < 3 ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                      title={req}
                    />
                  ))}
                </div>
              </div>
            )}

            {errors.confirmPassword && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                <AlertTriangle size={14} />
                {errors.confirmPassword}
              </div>
            )}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                placeholder="Confirm Password"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent outline-none transition`}
              />
              {password && confirmPassword && password === confirmPassword && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={18} />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-700 text-white py-3 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-maroon-700 font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
