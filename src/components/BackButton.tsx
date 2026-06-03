import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface BackButtonProps {
  className?: string;
  showOnHome?: boolean;
}

export default function BackButton({ className = '', showOnHome = false }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page unless explicitly enabled
  if (location.pathname === '/' && !showOnHome) {
    return null;
  }

  const handleBack = () => {
    // Try to go back in history
    window.history.back();

    // Fallback: if history is empty, go to home after a short delay
    setTimeout(() => {
      if (location.pathname === window.location.pathname) {
        navigate('/');
      }
    }, 500);
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-maroon-700 transition-colors group ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft
        size={20}
        className="group-hover:-translate-x-1 transition-transform"
      />
      <span className="font-medium">Back</span>
    </motion.button>
  );
}
