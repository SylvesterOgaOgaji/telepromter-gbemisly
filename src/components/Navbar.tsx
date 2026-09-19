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
  Activity
} from 'lucide-react';

interface NavbarProps {
  onOpenDonate: () => void;
  onOpenFeedback: () => void;
  onOpenSettings: () => void;
  onOpenOwnerProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDonate,
  onOpenFeedback,
  onOpenSettings,
  onOpenOwnerProfile
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Debzane Concept Teleprompter',
        text: 'Check out Debzane Concept Teleprompter - 100% Free professional studio teleprompter by Sylvester Oga Ogaji & JV Impact Initiative!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b border-debzane-blue-900/60 bg-[#030914]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={onOpenOwnerProfile} title="Debzane Concepts Profile">
            <img
              src="/debzane-logo.jpg"
              alt="Debzane Concepts Logo"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
            />
            {/* Small founder avatar badge */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border border-amber-400 bg-slate-900">
              <img src="/founder.jpg" alt="Debzane Founder" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-debzane-blue-100 to-amber-300 bg-clip-text text-transparent">
                Debzane Concepts
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PROMPTER
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Powered by <strong className="text-debzane-blue-400 font-medium">JV Impact Initiative</strong></span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline">Dev: <strong className="text-slate-300">Sylvester Oga Ogaji</strong></span>
            </div>
          </div>
        </div>

        {/* Social Channels, External Links & Navigation Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* External Debzane Links */}
          <div className="hidden lg:flex items-center gap-1.5 border-r border-slate-800 pr-3 mr-1">
            <a 
              href="https://debzane-wellness-coach.lovable.app" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane Fresh & Fit Wellness Website"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Fresh & Fit Hub</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>

            <a 
              href="https://youtube.com/@debzane_concepts" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane Concepts on YouTube (@debzane_concepts)"
              className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a 
              href="https://instagram.com/debzane_concepts" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane on Instagram"
              className="p-2 text-slate-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-slate-900"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://tiktok.com/@debzane_concepts" 
              target="_blank" 
              rel="noreferrer"
              title="Debzane on TikTok"
              className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-900 font-bold text-xs"
            >
              TT
            </a>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Share Teleprompter"
          >
            {copied ? <Check className="w-4 h-4 text-amber-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* User Feedback / Comments */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Reviews</span>
          </button>

          {/* Donate / Support Button */}
          <button
            onClick={onOpenDonate}
            className="relative group flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
          >
            <Heart className="w-3.5 h-3.5 fill-slate-950 text-slate-950 animate-pulse" />
            <span>Donate</span>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            title="Teleprompter & Cloud Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
