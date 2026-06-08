import { useState, useEffect } from 'react';
import Logo from './Logo';

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
        <Logo size="xl" animated={true} showText={true} />
      </div>
    </div>
  );
}

