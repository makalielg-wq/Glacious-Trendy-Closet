import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Review } from '../types';
import { useAuth } from '../AuthContext';
import { addReview, getProductReviews } from '../firebase';
import { cn } from '../lib/utils';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSuccess }) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    if (comment.length < 2) {
      setError('Comment must be at least 2 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addReview({
        productId,
        userId: user.uid,
        userName: profile.displayName,
        userPhoto: profile.photoURL || '',
        rating,
        comment
      });
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-pink-50 p-6 rounded-2xl text-center">
        <p className="text-gray-600 mb-4">Please sign in to leave a review</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-tight">Write a Review</h3>
      
      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none transition-transform active:scale-90"
            >
              <Star
                size={28}
                className={cn(
                  "transition-colors",
                  (hover || rating) >= star ? "fill-pink-500 text-pink-500" : "text-gray-200"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you think about this product?"
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-pink-500 min-h-[100px] resize-none text-gray-700"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
          isSubmitting ? "bg-gray-200 text-gray-400" : "bg-pink-500 text-white shadow-lg shadow-pink-100 hover:bg-pink-600"
        )}
      >
        {isSubmitting ? "Submitting..." : (
          <>
            Submit Review <Send size={18} />
          </>
        )}
      </button>
    </form>
  );
};

interface ReviewListProps {
  productId: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getProductReviews(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl">
        <p className="text-gray-400">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border-b border-gray-100 pb-6 last:border-0"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden">
                  {review.userPhoto ? (
                    <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon size={20} className="text-pink-300" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{review.userName}</h4>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={cn(
                      star <= review.rating ? "fill-pink-500 text-pink-500" : "text-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
