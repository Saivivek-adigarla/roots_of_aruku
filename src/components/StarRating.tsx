import { Star } from 'lucide-react';
export default function StarRating({ rating }: { rating: number }) {
  return <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className={i < Math.round(rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />)}</div>;
}
