declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    confirmationResult?: { confirm: (code: string) => Promise<unknown> };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
}

interface RazorpayInstance {
  open: () => void;
}

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function openRazorpay(opts: {
  amount: number;
  name: string;
  phone: string;
  email: string;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  if (!key) {
    alert('Razorpay not configured');
    return;
  }
  const rzp = new window.Razorpay({
    key,
    amount: opts.amount * 100,
    currency: 'INR',
    name: 'Roots of Araku',
    description: 'Premium Organic Products',
    handler: (res) => opts.onSuccess(res.razorpay_payment_id),
    prefill: { name: opts.name, email: opts.email, contact: opts.phone },
    theme: { color: '#6B1A1A' },
  });
  rzp.open();
}
