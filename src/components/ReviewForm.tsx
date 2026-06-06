import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { sanitizeHtml } from '../utils/security';

interface ReviewFormProps {
  productId: string;
  onReviewAdded: () => void;
}

export default function ReviewForm({ productId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to write a review'); return; }
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    if (comment.length > 1000) { toast.error('Comment too long (max 1000 characters)'); return; }

    setSubmitting(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      await addDoc(reviewsRef, {
        product_id: productId,
        user_id: user.uid,
        rating,
        title: sanitizeHtml(title.trim()),
        comment: sanitizeHtml(comment.trim()),
        is_verified_purchase: false,
        created_at: new Date().toISOString(),
      });

      toast.success('Review submitted!');
      setRating(0);
      setTitle('');
      setComment('');
      onReviewAdded();
    } catch (error: any) {
      if (error.message?.includes('unique')) {
        toast.error('You have already reviewed this product');
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600">Please log in to write a review.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">Write a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating *</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button key={i} type="button" onClick={() => setRating(i + 1)} onMouseEnter={() => setHoverRating(i + 1)} onMouseLeave={() => setHoverRating(0)} className="p-0.5 hover:scale-125 transition-transform">
              <Star size={28} className={i < (hoverRating || rating) ? 'text-gold-400 fill-gold-400' : 'text-gray-300'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sum up your experience" maxLength={100} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review *</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience with this product..." rows={4} maxLength={1000} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none resize-none" />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={submitting || rating === 0} className="bg-maroon-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-maroon-800 disabled:opacity-50 flex items-center gap-2">
        <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
