import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Sparkles } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    if (sessionStorage.getItem('debzane_install_dismissed')) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt automatically after 2 seconds on mobile if not standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions for iOS/Chrome
      alert('To install Debzane Teleprompter:\n\n• On Chrome / Android: Tap the ⋮ menu at top right and select "Install app" or "Add to Home screen".\n• On Safari / iOS: Tap the Share button ⎋ and select "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    sessionStorage.setItem('debzane_install_dismissed', 'true');
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <aside aria-label="Install App" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-debzane-blue-950 via-slate-900 to-amber-950/80 border-2 border-amber-400/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <img
          src="/debzane-logo.jpg"
          alt="Debzane Concepts Logo"
          className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-heading font-bold text-sm text-slate-100">
              Install Debzane Teleprompter
            </h4>
            <span className="p-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded">
              FREE
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5 leading-tight">
            Install on your phone for full-screen offline use with zero browser bars!
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-lg shadow transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install to Phone</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
