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
  Activity,
  Linkedin,
  BookOpen,
  CheckCircle2
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Banner with gradient overlay */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-debzane-blue-900 via-debzane-blue-700 to-amber-600 relative flex-shrink-0">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Founder Portrait & Header */}
        <div className="px-5 sm:px-6 pb-6 pt-0 relative flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3.5 sm:gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative flex-shrink-0">
              <img
                src="/founder.jpg"
                alt="Oluwagbemisola J. Akinlade-Ogaji"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl"
              />
              <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 p-1.5 rounded-xl border-2 border-slate-900 shadow-lg">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                  Oluwagbemisola J. Akinlade-Ogaji
                </h3>
              </div>
              <p className="text-xs text-amber-300 font-semibold">
                Founder, Debzane Concepts • Public Health Practitioner
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Developer: <strong className="text-slate-200">Sylvester Oga Ogaji</strong> (JV Impact Initiative)
              </p>
            </div>
          </div>

          {/* About / Vision Statement */}
          <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <p>
              <strong>Debzane Concepts</strong> is a holistic wellness, lifestyle, and educational platform founded by <strong>Oluwagbemisola J. Akinlade-Ogaji</strong>, a certified Public Health Practitioner committed to empowering individuals, families, and creators worldwide.
            </p>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-200 space-y-1">
              <strong className="block text-amber-300">✨ Our Mission for Creators & Speakers:</strong>
              <span>
                "We believe communication should have no boundaries. That is why this studio teleprompter is built with <strong>zero limits on script length</strong> (paste 10, 50, or 100 pages freely) and zero paywalls."
              </span>
            </div>
          </div>

          {/* Connected Debzane Ecosystem Links */}
          <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Fresh & Fit Coach */}
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
                  <div className="text-[10px] text-slate-400">Wellness & Health Portal</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300" />
            </a>

            {/* LinkedIn Profile */}
            <a
              href="https://www.linkedin.com/in/oluwagbemisola-j-akinlade-ogaji/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-debzane-blue-400/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-debzane-blue-500/15 text-debzane-blue-400 rounded-lg">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-debzane-blue-300">
                    LinkedIn Profile
                  </div>
                  <div className="text-[10px] text-slate-400">Professional Bio</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-debzane-blue-300" />
            </a>

            {/* YouTube */}
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
                    YouTube Channel
                  </div>
                  <div className="text-[10px] text-slate-400">@debzane_concepts</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-300" />
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@debzane_concepts"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400/50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg font-black text-xs">
                  TT
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    TikTok
                  </div>
                  <div className="text-[10px] text-slate-400">@debzane_concepts</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onOpenDonate();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Heart className="w-3.5 h-3.5 fill-slate-950" />
              <span>Donate (OPay 8057961025)</span>
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
