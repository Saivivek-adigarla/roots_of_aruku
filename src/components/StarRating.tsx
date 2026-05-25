import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = 14, interactive = false, onRate }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(i + 1)}
          className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={i < Math.round(rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
