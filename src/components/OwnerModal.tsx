import React from 'react';
import { 
  X, 
  Sparkles, 
  Heart, 
  ExternalLink, 
  Youtube, 
  Instagram, 
  Globe, 
  ShieldCheck, 
  Award,
  Tv,
  Activity
} from 'lucide-react';

interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDonate: () => void;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  onOpenDonate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Banner with gradient overlay */}
        <div className="h-32 bg-gradient-to-r from-debzane-blue-900 via-debzane-blue-700 to-amber-600 relative">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Founder Portrait & Header */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 mb-4">
            <div className="relative">
              <img
                src="/founder.jpg"
                alt="Debzane Concepts Leader"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-xl border-2 border-slate-900 shadow-lg">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-heading font-extrabold text-xl text-white">
                  Debzane Concepts
                </h3>
                <span className="p-1 bg-amber-400/20 text-amber-300 rounded-md text-[10px] font-bold">
                  OFFICIAL
                </span>
              </div>
              <p className="text-xs text-amber-300 font-medium">
                Fresh & Fit Wellness Coach & Creator Network
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Technical Development by <strong className="text-slate-200">Sylvester Oga Ogaji</strong> (JV Impact Initiative)
              </p>
            </div>
          </div>

          {/* About / Vision Statement */}
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <p>
              Welcome to the official <strong>Debzane Concept Teleprompter</strong> suite. Debzane Concepts is dedicated to empowering individuals with wellness coaching, healthy lifestyle inspiration, and creator solutions.
            </p>
            <p>
              To make content creation accessible for everyone, this teleprompter was custom-engineered as a <strong>100% free tool</strong> without paywalls, subscriptions, or hidden charges.
            </p>
          </div>

          {/* Connected Debzane Ecosystem Links */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="https://debzane-wellness-coach.lovable.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 bg-debzane-blue-950/60 hover:bg-debzane-blue-900/60 border border-debzane-blue-800/60 hover:border-amber-400/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                    Fresh & Fit Coach
                  </div>
                  <div className="text-[10px] text-slate-400">Official Wellness Portal</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
            </a>

            <a
              href="https://youtube.com/@debzane_concepts"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-red-400/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-400/10 text-red-400 rounded-lg">
                  <Youtube className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-red-300">
                    YouTube (@debzane_concepts)
                  </div>
                  <div className="text-[10px] text-slate-400">Debzane Concepts Channel</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-300" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenDonate();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-slate-950" />
              <span>Support Development</span>
            </button>

            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
