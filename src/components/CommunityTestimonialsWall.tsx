import React, { useState, useEffect } from 'react';
import { FeedbackComment } from '../types';
import { getPersistentReviews } from '../services/persistentReviewStorage';
import { MessageSquareHeart, Star, Quote, Heart, Sparkles, ShieldCheck } from 'lucide-react';

interface CommunityTestimonialsWallProps {
  onOpenFeedback: () => void;
}

export const CommunityTestimonialsWall: React.FC<CommunityTestimonialsWallProps> = ({ onOpenFeedback }) => {
  const [reviews, setReviews] = useState<FeedbackComment[]>([]);

  useEffect(() => {
    getPersistentReviews().then(setReviews);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-b from-slate-900 via-debzane-blue-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl text-slate-950 shadow-md shadow-amber-500/20">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-heading">
                  Community Wall of Praise & Testimonials
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  REAL CREATORS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                What public health educators, YouTube creators, and speakers say about Debzane Concept Teleprompter
              </p>
            </div>
          </div>

          <button
            onClick={onOpenFeedback}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Leave a Testimonial</span>
          </button>
        </div>

        {/* Testimonials Cards Grid */}
        {reviews.length === 0 ? (
          <div className="p-8 bg-slate-950/60 border border-slate-800/80 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto text-amber-400">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                Preparing for Verified Creator Reviews
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No mock data allowed. Every rating here is submitted by real speakers and content creators using Debzane Concept Teleprompter.
              </p>
            </div>
            <button
              onClick={onOpenFeedback}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Be The First Creator to Review</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {reviews.slice(0, 8).map((rev) => (
              <div 
                key={rev.id}
                className="bg-slate-950/90 border border-slate-800/80 hover:border-amber-400/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 text-xs">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {rev.date || 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-4">
                    "{rev.message}"
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 truncate">
                    {rev.userName}
                  </span>
                  <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    {rev.country || 'Global'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Banner callout */}
        <div className="p-3 bg-debzane-blue-950/40 border border-debzane-blue-800/40 rounded-2xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 shrink-0" />
            <span>100% Free Public Initiative powered by <strong>Debzane Concepts</strong> and <strong>JV ImpactVR Initiative LTD/GTE</strong>.</span>
          </div>
          <button 
            onClick={onOpenFeedback} 
            className="text-amber-300 hover:underline font-bold text-xs shrink-0 ml-2"
          >
            View All Reviews →
          </button>
        </div>

      </div>
    </section>
  );
};
