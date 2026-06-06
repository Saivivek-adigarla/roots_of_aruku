import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-maroon-900 to-maroon-800 flex items-center justify-center z-50 overflow-hidden">
      <div className="relative z-10 text-center px-4">
        <div className="relative mb-12">
          <img
            src="/image copy copy copy copy copy copy copy.png"
            alt="Roots of Araku Logo"
            className="h-64 w-auto mx-auto drop-shadow-2xl relative z-10"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-light text-gold-300 tracking-wide mb-2">
            Premium Organic Products
          </h2>
          <p className="text-warm-300 text-lg font-light">
            From tribal farmers to your table
          </p>
        </div>
      </div>
    </div>
  );
}

