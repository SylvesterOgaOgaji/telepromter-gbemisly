import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Check, 
  Sparkles, 
  Share2, 
  PlusSquare, 
  ArrowDown, 
  Apple, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if running as installed standalone app (iOS standalone or PWA)
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standaloneCheck);

    // Detect iOS Device (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIOS(isIOSDevice);

    // Listen for custom trigger from Navbar, Settings, or Hero
    const handleOpenInstall = () => {
      if (isIOSDevice) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowBanner(true);
      }
    };

    window.addEventListener('open-debzane-install', handleOpenInstall);

    // Handle Android / Chrome PWA install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('debzane_install_dismissed') && !standaloneCheck) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If not standalone and not dismissed, show banner after 2.5s
    if (!standaloneCheck && !sessionStorage.getItem('debzane_install_dismissed')) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-debzane-install', handleOpenInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iPhone / iPad requires Safari "Add to Home Screen"
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      // Android / Chrome 1-tap install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback modal with instructions
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem('debzane_install_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* FLOATING INSTALL INVITATION BANNER */}
      {showBanner && !isDismissed && (
        <aside 
          aria-label="Install App" 
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-debzane-blue-950 via-slate-900 to-amber-950/90 border-2 border-amber-400/60 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <img
              src="/debzane-logo.jpg"
              alt="Debzane Concepts Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-heading font-black text-sm text-slate-100">
                  {isIOS ? 'Install on iPhone & iPad' : 'Install Debzane App'}
                </h4>
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-tight">
                {isIOS 
                  ? 'Add to your iPhone Home Screen for full-screen offline use with zero browser bars!'
                  : 'Install on your Android or PC for full-screen recording and offline use!'}
              </p>
              
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'How to Install (iPhone)' : 'Install App Now'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* DEDICATED iOS / iPHONE STEP-BY-STEP INSTALLATION MODAL */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 rounded-2xl shadow">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-white">
                    Install on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Follow 3 simple taps in Safari to install
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Step-by-Step Guide */}
            <div className="my-4 space-y-3.5 text-xs">
              
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-xl bg-debzane-blue-900/60 text-debzane-blue-300 font-black flex items-center justify-center shrink-0 border border-debzane-blue-700/50">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 font-bold mb-1 flex items-center gap-1.5">
                    <span>Tap the Safari <strong>Share Button</strong></span>
                    <Share2 className="w-4 h-4 text-cyan-400 inline" />
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Look at the bottom toolbar of Safari on iPhone (or top bar on iPad) and tap the <strong>Share icon</strong> (square with arrow pointing up).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-xl bg-amber-950/60 text-amber-300 font-black flex items-center justify-center shrink-0 border border-amber-700/50">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 font-bold mb-1 flex items-center gap-1.5">
                    <span>Select <strong>"Add to Home Screen"</strong></span>
                    <PlusSquare className="w-4 h-4 text-amber-400 inline" />
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Scroll down through the share options and tap <strong>"Add to Home Screen"</strong> (icon with a <strong>+</strong> plus sign).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <div className="w-7 h-7 rounded-xl bg-emerald-950/60 text-emerald-300 font-black flex items-center justify-center shrink-0 border border-emerald-700/50">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-slate-200 font-bold mb-1 flex items-center gap-1.5">
                    <span>Tap <strong>"Add"</strong> at Top Right</span>
                    <Check className="w-4 h-4 text-emerald-400 inline" />
                  </p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Confirm by tapping <strong>Add</strong> at the top right corner. The Debzane Prompter app icon will now appear on your home screen!
                  </p>
                </div>
              </div>

            </div>

            {/* iPhone Bottom Pointer Indicator */}
            <div className="p-3 bg-gradient-to-r from-debzane-blue-950/60 to-slate-900 border border-debzane-blue-800/40 rounded-2xl flex items-center justify-center gap-2 text-amber-300 text-xs font-bold text-center">
              <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Tap the Share icon at the bottom of Safari now</span>
              <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              Got It, I'll Add to Home Screen
            </button>

          </div>
        </div>
      )}
    </>
  );
};
