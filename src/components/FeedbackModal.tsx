import React, { useState, useEffect } from 'react';
import { FeedbackComment } from '../types';
import { 
  fetchFeedbackList, 
  submitFeedbackComment 
} from '../services/supabase';
import { 
  MessageSquareHeart, 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles,
  User,
  Quote
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [userName, setUserName] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFeedbackList().then(setComments);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await submitFeedbackComment({
      userName: userName.trim(),
      country: country.trim() || 'Global',
      rating,
      message: message.trim()
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    const updated = await fetchFeedbackList();
    setComments(updated);

    setTimeout(() => {
      setSubmittedSuccess(false);
      setMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100">
                Community Reviews & Feedback
              </h2>
              <p className="text-xs text-slate-400">
                Share your experience using Debzain Concept Teleprompter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Submit Review Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Leave a comment or feature request
              </h3>
              
              {/* Star Rating picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your Name (e.g. Samuel, Debzain Fan)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
              <input
                type="text"
                placeholder="Location / Country (e.g. Lagos, Nigeria)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <textarea
              placeholder="Tell us how you use the teleprompter, or suggest new features you want Sylvester to add..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              {submittedSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  Thank you! Your feedback has been posted.
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Your review will be visible to fellow creators.
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !userName.trim() || !message.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>

          {/* Existing Comments List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Creator Reviews ({comments.length})
            </h3>

            {comments.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold text-xs">
                      {c.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{c.userName}</span>
                        {c.country && (
                          <span className="text-[10px] text-slate-500 font-normal">({c.country})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{c.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < c.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-9">
                  "{c.message}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Synced with Cloud Community DB</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
