import React, { useState } from 'react';
import { 
  Tv, 
  Heart, 
  MessageSquareHeart, 
  Settings2, 
  Youtube, 
  Instagram, 
  Share2, 
  Check, 
  Sparkles,
  ExternalLink,
  Globe,
  Activity,
  Linkedin,
  Facebook,
  Radio
} from 'lucide-react';

interface NavbarProps {
  onOpenDonate: () => void;
  onOpenFeedback: () => void;
  onOpenSettings: () => void;
  onOpenOwnerProfile: () => void;
  onOpenStudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDonate,
  onOpenFeedback,
  onOpenSettings,
  onOpenOwnerProfile,
  onOpenStudio
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Debzane Concept Teleprompter',
        text: 'Debzane Concept Teleprompter — 100% Free Unlimited Studio Teleprompter with zero word limits!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-debzane-blue-900/60 bg-[#030914]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 py-2 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group" onClick={onOpenOwnerProfile}>
          <div className="relative flex-shrink-0" title="Founder: Oluwagbemisola J. Akinlade-Ogaji">
            <img
              src="/debzane-logo.jpg"
              alt="Debzane Concepts Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-amber-400 bg-slate-900 shadow">
              <img src="/founder.jpg" alt="Founder" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-heading font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-debzane-blue-100 to-amber-300 bg-clip-text text-transparent">
                Debzane
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                PROMPTER
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
              <span className="text-slate-300 font-medium">Debzane Concepts</span>
              <span className="text-slate-600">•</span>
              <span className="text-debzane-blue-300">JV ImpactVR Initiative LTD/GTE</span>
            </div>
          </div>
        </div>

        {/* Social Channels, External Links & Navigation Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick External Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 border-r border-slate-800 pr-2.5 mr-0.5">
            <a 
              href="https://debzane-wellness-coach.lovable.app" 
              target="_blank" 
              rel="noreferrer"
              title="Fresh & Fit Wellness"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Fresh & Fit</span>
            </a>

            <a 
              href="https://www.facebook.com/gbemisola.akinlade/" 
              target="_blank" 
              rel="noreferrer"
              title="Facebook Profile: Gbemisola Akinlade"
              className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <Facebook className="w-4 h-4" />
            </a>

            <a 
              href="https://www.linkedin.com/in/oluwagbemisola-j-akinlade-ogaji/" 
              target="_blank" 
              rel="noreferrer"
              title="LinkedIn Profile: Oluwagbemisola J. Akinlade-Ogaji"
              className="p-1.5 text-slate-400 hover:text-debzane-blue-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a 
              href="https://youtube.com/@debzane_concepts" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane on YouTube"
              className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a 
              href="https://www.tiktok.com/@debzane_concepts" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane on TikTok"
              className="p-1.5 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-900 font-bold text-xs"
            >
              TT
            </a>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Share Teleprompter"
          >
            {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Studio & Reaction Video Button */}
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-md shadow-red-600/30 transition-all transform active:scale-95 border border-red-400/30 animate-pulse"
            title="Open Split-Screen Video Studio & Reaction Recorder"
          >
            <Radio className="w-3.5 h-3.5 text-white" />
            <span>Studio / Video</span>
          </button>

          {/* User Feedback / Comments */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Reviews</span>
          </button>

          {/* Donate / Support Button */}
          <button
            onClick={onOpenDonate}
            className="relative flex items-center gap-1 px-3 sm:px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
            <span>Donate</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            title="Display & Speed Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
