import React, { useState, useEffect, useRef } from 'react';
import { FeedbackComment } from '../types';
import { 
  getPersistentReviews, 
  addPersistentReview,
  deletePersistentReview,
  exportReviewsToJSON,
  importReviewsFromJSON,
  checkBrowserPersistence,
  enableBrowserPersistence,
  getDeviceUserReview,
  hasUserReviewed
} from '../services/persistentReviewStorage';
import { 
  MessageSquareHeart, 
  X, 
  Star, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Youtube,
  Download,
  Upload,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Database,
  Edit3,
  ArrowRight
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
  onSuccessProceed?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  isMandatory = false,
  onSuccessProceed 
}) => {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [country, setCountry] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [isPersisted, setIsPersisted] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 1. Check if this device already has an existing review
      const userReview = getDeviceUserReview();
      if (userReview) {
        setHasExistingReview(true);
        setExistingReviewId(userReview.id);
        setUserName(userReview.userName || '');
        setCountry(userReview.country || '');
        setRating(userReview.rating || 5);
        setMessage(userReview.message || '');
      } else {
        setHasExistingReview(false);
        setExistingReviewId(null);
      }

      // 2. Fetch persistent reviews from IndexedDB
      getPersistentReviews().then(setComments);
      
      // 3. Request / check browser durable persistence API
      checkBrowserPersistence().then((persisted) => {
        setIsPersisted(persisted);
        if (!persisted) {
          enableBrowserPersistence().then(setIsPersisted);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await addPersistentReview({
      id: existingReviewId || undefined,
      userName: userName.trim(),
      country: country.trim() || 'Global',
      rating,
      message: message.trim()
    });

    const updated = await getPersistentReviews();
    setComments(updated);
    setIsSubmitting(false);
    setSubmittedSuccess(true);
    setHasExistingReview(true);

    setTimeout(() => {
      setSubmittedSuccess(false);
      if (onSuccessProceed) {
        onSuccessProceed();
      }
      if (isMandatory) {
        onClose();
      }
    }, 1800);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this review from your browser storage?')) {
      await deletePersistentReview(id);
      const updated = await getPersistentReviews();
      setComments(updated);
      if (existingReviewId === id) {
        setHasExistingReview(false);
        setExistingReviewId(null);
        setMessage('');
      }
    }
  };

  const handleExport = async () => {
    await exportReviewsToJSON();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const updated = await importReviewsFromJSON(content);
        setComments(updated);
        alert(`Successfully restored ${updated.length} reviews into browser persistent storage!`);
      } catch (err) {
        alert('Failed to import reviews. Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base sm:text-lg text-slate-100">
                  Community Reviews & Ratings
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  100% Genuine User Reviews
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Debzane Concept Teleprompter feedback & reviews stored permanently in browser IndexedDB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3.5 space-y-4 pr-1">
          
          {/* October 1st Creator Review Requirement Notice */}
          {isMandatory && (
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-slate-900 border border-amber-400/50 rounded-2xl flex items-start justify-between gap-3 text-amber-300 text-xs shadow-lg">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-white text-xs mb-0.5">
                    🌟 1-Time Creator Review Before Download:
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    To keep Debzane Concept Teleprompter <strong>100% free forever</strong> with zero paywalls, we require every creator on this device to submit one genuine review before downloading.
                  </p>
                </div>
              </div>

              {hasExistingReview && onSuccessProceed && (
                <button
                  type="button"
                  onClick={() => {
                    onSuccessProceed();
                    onClose();
                  }}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-all"
                >
                  <span>Skip & Download</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Existing Review detected on this device */}
          {hasExistingReview && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You have already submitted a review from this device. You can edit or refine your review below.</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40">
                1 Review / Device
              </span>
            </div>
          )}

          {/* Persistence & Backup Bar */}
          <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Storage: <strong className="text-emerald-400">IndexedDB Persistent Engine</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                accept=".json" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition-colors"
                title="Import reviews from JSON backup"
              >
                <Upload className="w-3 h-3" />
                <span>Import JSON</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-medium rounded-lg transition-colors"
                title="Export all reviews as a JSON backup"
              >
                <Download className="w-3 h-3" />
                <span>Backup (JSON)</span>
              </button>
            </div>
          </div>

          {/* Quick External Links for Social Reviews */}
          <div className="p-3 bg-gradient-to-r from-red-950/30 to-slate-950 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-500/15 text-red-400 rounded-xl">
                <Youtube className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">
                  Rate & Comment on Official YouTube
                </div>
                <div className="text-[11px] text-slate-400">Leave your review directly on @debzane_concepts videos</div>
              </div>
            </div>
            <a
              href="https://youtube.com/@debzane_concepts"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all flex-shrink-0"
            >
              <span>Open YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Submit / Edit Review Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                {hasExistingReview ? <Edit3 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                {hasExistingReview ? 'Edit Your Saved Review' : 'Add Your Review (1 Per Device)'}
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
                placeholder="Your Name (e.g. Sylvester, Creator)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="Location / Country (e.g. Nigeria / UK / USA)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <textarea
              placeholder="Tell us what you like or suggest any feature you want Sylvester & Debzane Concepts to add..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
              {submittedSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {hasExistingReview ? 'Review updated successfully!' : 'Thank you! Your review is permanently saved.'}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {hasExistingReview ? 'Updating your review for this device' : 'Stored securely • 1 review per creator device'}
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !userName.trim() || !message.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : hasExistingReview ? 'Update My Review' : 'Post Review'}</span>
              </button>
            </div>
          </form>

          {/* Existing Comments List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified Creator Reviews ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl text-center space-y-2">
                <MessageSquareHeart className="w-8 h-8 text-amber-400/60 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">
                  No public reviews submitted yet!
                </p>
                <p className="text-[11px] text-slate-500">
                  Be the very first creator to share your thoughts, rating, and feedback using the form above.
                </p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-[11px]">
                        {c.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <span>{c.userName}</span>
                          {c.country && (
                            <span className="text-[10px] text-slate-500 font-normal">({c.country})</span>
                          )}
                          {c.date && (
                            <span className="text-[10px] text-slate-600 font-mono">• {c.date}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < c.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-800'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-8">
                    "{c.message}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Debzane Concepts • Free Speech Studio</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
