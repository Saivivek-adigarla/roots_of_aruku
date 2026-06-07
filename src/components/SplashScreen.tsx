import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-maroon-900 to-maroon-800 flex items-center justify-center z-50 overflow-hidden">
      <div className="relative z-10 text-center px-4">
        <Leaf size={80} className="text-gold-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gold-300 tracking-wide mb-2">Roots of Araku</h1>
        <p className="text-gold-200 text-lg">Premium Organic Products</p>
      </div>
    </div>
  );
}

