import { MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

interface WhatsAppButtonProps {
  variant?: 'floating' | 'inline' | 'product';
  message?: string;
  label?: string;
  className?: string;
}

const WHATSAPP_NUMBER = '917036252018';

export default function WhatsAppButton({
  variant = 'floating',
  message = 'Hi, I need help with Roots of Araku products.',
  label = 'Chat on WhatsApp',
  className = '',
}: WhatsAppButtonProps) {
  const handleClick = () => {
    openWhatsApp(message);
  };

  if (variant === 'floating') {
    return (
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 hover:shadow-xl transition-all hover:scale-105 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={20} className="shrink-0" />
        <span className="hidden sm:inline text-sm font-medium">Help</span>
      </a>
    );
  }

  if (variant === 'product') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors ${className}`}
      >
        <MessageCircle size={16} />
        {label}
      </button>
    );
  }

  // Inline variant
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors ${className}`}
    >
      <MessageCircle size={16} />
      {label}
    </button>
  );
}
