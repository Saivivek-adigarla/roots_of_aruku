import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import {
  isValidEmail,
  isValidPhone,
  checkRateLimit,
  secureStorage,
  generateCsrfToken,
  validateCsrfToken,
} from "../utils/security";
import { authService } from "../services/authService";
import Logo from "../components/Logo";

type LoginMode = "phone" | "email" | "google";

export default function Login() {
  const [mode, setMode] = useState<LoginMode>("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [csrfToken, setCsrfToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    setMounted(true);

    const token = generateCsrfToken();
    setCsrfToken(token);
    secureStorage.set("csrf_token", token);
  }, []);

  /* ---------------- RESEND TIMER ---------------- */
  useEffect(() => {
    if (resendTimer <= 0) return;

    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  /* ---------------- VALIDATION ---------------- */
  const validateEmailForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Enter a valid email";

    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePhoneForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!showOtpField) {
      if (!phone.trim()) e.phone = "Phone number is required";
      else if (!isValidPhone(phone))
        e.phone = "Enter a valid 10-digit number";
    } else {
      if (!otp.trim()) e.otp = "OTP is required";
      else if (otp.length < 4 || otp.length > 6)
        e.otp = "Enter valid OTP";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleEmailLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateEmailForm()) return;

    const rateCheck = checkRateLimit("login_email", 5, 300000);
    if (!rateCheck.allowed) {
      toast.error("Too many attempts. Try again later.");
      return;
    }

    const storedToken = secureStorage.get<string>("csrf_token");
    if (!validateCsrfToken(csrfToken, storedToken || "")) {
      toast.error("Security validation failed");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.loginWithEmail(email, password);
      setUser(user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";

      if (msg.includes("invalid")) toast.error("Invalid email or password");
      else if (msg.includes("confirmed"))
        toast.error("Please verify your email");
      else if (msg.includes("too_many_requests"))
        toast.error("Too many attempts. Try later.");
      else toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PHONE LOGIN ---------------- */
  const handlePhoneLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validatePhoneForm()) return;

    setLoading(true);

    try {
      if (!showOtpField) {
        const rateCheck = checkRateLimit("login_otp", 3, 300000);
        if (!rateCheck.allowed) {
          toast.error("Too many OTP requests");
          setLoading(false);
          return;
        }

        await authService.loginWithPhone(phone);

        toast.success("OTP sent to +91" + phone);
        setShowOtpField(true);
        setResendTimer(60);
      } else {
        const user = await authService.verifyPhoneOtp(phone, otp);
        setUser(user);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";

      if (msg.includes("otp")) toast.error("Invalid or expired OTP");
      else toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const user = await authService.loginWithGoogle();
      setUser(user);
      toast.success("Welcome!");
      navigate("/");
    } catch {
      toast.error("Google sign-in failed");
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const rateCheck = checkRateLimit("login_otp_resend", 2, 300000);
    if (!rateCheck.allowed) {
      toast.error("Too many requests");
      return;
    }

    try {
      await authService.loginWithPhone(phone);
      toast.success("OTP resent!");
      setResendTimer(60);
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Decorative */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 left-16 w-48 h-48 bg-red-600/20 rounded-full blur-3xl" />

      {/* LEFT */}
      <div className="hidden lg:flex flex-1 items-center justify-center">
        <div className="text-center">
          <Logo size="lg" showText />
          <p className="text-xl mt-4">Real Taste from the Hills</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/10 p-6 rounded-2xl backdrop-blur-xl">

          <h2 className="text-xl font-bold mb-4">Welcome Back</h2>

          {/* MODE */}
          <div className="flex mb-4 bg-white/10 p-1 rounded-xl">
            {["phone", "email", "google"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m as LoginMode);
                  setShowOtpField(false);
                  setErrors({});
                }}
                className={`flex-1 py-2 rounded-lg ${
                  mode === m ? "bg-white/20" : ""
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* EMAIL */}
          {mode === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white/10 rounded"
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white/10 rounded"
              />

              <button className="w-full bg-yellow-500 text-black p-3 rounded">
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </button>
            </form>
          )}

          {/* PHONE */}
          {mode === "phone" && (
            <form onSubmit={handlePhoneLogin} className="space-y-3">
              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                disabled={showOtpField}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="w-full p-3 bg-white/10 rounded"
              />

              {showOtpField && (
                <input
                  type="text"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  className="w-full p-3 bg-white/10 rounded"
                />
              )}

              <button className="w-full bg-yellow-500 text-black p-3 rounded">
                {loading
                  ? "Loading..."
                  : showOtpField
                  ? "Verify OTP"
                  : "Send OTP"}
              </button>

              {showOtpField && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-yellow-400"
                >
                  Resend OTP ({resendTimer})
                </button>
              )}
            </form>
          )}

          {/* GOOGLE */}
          {mode === "google" && (
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black p-3 rounded"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
