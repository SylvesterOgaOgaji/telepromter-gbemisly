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
  ExternalLink,
  Laptop,
  MoreVertical,
  Globe,
  Compass
} from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Platform Detection
  const [activeTab, setActiveTab] = useState<'android' | 'ios-chrome' | 'ios-safari' | 'desktop'>('android');
  const [installOutcome, setInstallOutcome] = useState<'success' | 'dismissed' | null>(null);

  useEffect(() => {
    // 1. Detect if already installed as standalone
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standaloneCheck);

    // 2. Detect User Agent
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isChromeOnIOS = isIOSDevice && /crios/.test(ua);
    const isAndroidDevice = /android/.test(ua) || /cros/.test(ua);

    if (isChromeOnIOS) {
      setActiveTab('ios-chrome');
    } else if (isIOSDevice) {
      setActiveTab('ios-safari');
    } else if (isAndroidDevice) {
      setActiveTab('android');
    } else {
      setActiveTab('android');
    }

    // 3. Listen for Android / Chrome PWA install trigger event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('debzane_install_dismissed') && !standaloneCheck) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for manual click from Navbar / Settings / Buttons
    const handleOpenInstall = () => {
      setShowInstallModal(true);
    };

    window.addEventListener('open-debzane-install', handleOpenInstall);

    // 5. Automatic banner display on first visit after 2 seconds
    if (!standaloneCheck && !sessionStorage.getItem('debzane_install_dismissed')) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-debzane-install', handleOpenInstall);
    };
  }, []);

  // Direct 1-Click Install Trigger for Android / PC Chrome / Edge
  const handleDirectAndroidInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallOutcome('success');
          setShowBanner(false);
          setTimeout(() => setShowInstallModal(false), 2000);
        } else {
          setInstallOutcome('dismissed');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      // If deferred prompt not ready, keep modal on Android tab to show the 3-dots Chrome guide
      setActiveTab('android');
      setShowInstallModal(true);
    }
  };

  const handleBannerClick = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isIOSDevice) {
      setShowInstallModal(true);
    } else if (deferredPrompt) {
      handleDirectAndroidInstall();
    } else {
      setShowInstallModal(true);
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
      {/* FLOATING PROMPT BANNER (FOR ANDROID, iPHONE, CHROMEBOOK & PC) */}
      {showBanner && !isDismissed && (
        <aside 
          aria-label="Install App" 
          className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-gradient-to-r from-debzane-blue-950 via-slate-900 to-amber-950/90 border-2 border-amber-400/60 rounded-3xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <img
              src="/debzane-logo.jpg"
              alt="Debzane Concepts Logo"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-heading font-black text-xs sm:text-sm text-slate-100">
                  Install Debzane Prompter
                </h4>
                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-md">
                  100% FREE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-tight">
                Works on Android, iPhone (Chrome & Safari), Chromebook & PC with full offline support.
              </p>
              
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleBannerClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install / Add to Home Screen</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
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

      {/* UNIVERSAL MULTI-PLATFORM INSTALLATION MODAL (ANDROID, iPHONE CHROME, iPHONE SAFARI, PC) */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 rounded-2xl shadow">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base sm:text-lg text-white">
                    Install Debzane Teleprompter
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Choose your device & browser for 1-tap installation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 my-3.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
              
              {/* Android & Chromebook Tab */}
              <button
                onClick={() => setActiveTab('android')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'android'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android / PC</span>
              </button>

              {/* iPhone Chrome Tab */}
              <button
                onClick={() => setActiveTab('ios-chrome')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'ios-chrome'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>iPhone Chrome</span>
              </button>

              {/* iPhone Safari Tab */}
              <button
                onClick={() => setActiveTab('ios-safari')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'ios-safari'
                    ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>iPhone Safari</span>
              </button>

              {/* Desktop / Laptop Tab */}
              <button
                onClick={() => setActiveTab('desktop')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeTab === 'desktop'
                    ? 'bg-indigo-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Mac & Windows</span>
              </button>
            </div>

            {/* TAB 1: ANDROID & CHROMEBOOK */}
            {activeTab === 'android' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <h4 className="text-sm font-black text-emerald-300">
                    🤖 1-Tap Direct Progressive Web App Install
                  </h4>
                  <p className="text-xs text-slate-300">
                    Installs directly to your home screen with zero APK downloads, no storage waste, and automatic updates.
                  </p>
                  
                  <button
                    onClick={handleDirectAndroidInstall}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Click Here to 1-Tap Install App</span>
                  </button>

                  {installOutcome === 'success' && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-300 font-bold mt-1">
                      <Check className="w-4 h-4" />
                      <span>Installation Started! Check your home screen.</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    <MoreVertical className="w-4 h-4 text-emerald-400" />
                    <span>If the 1-Tap button didn't trigger:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Tap the <strong>three dots (⋮)</strong> menu in Google Chrome at the top right.</li>
                    <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>Tap <strong>Install</strong> to finish!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 2: iPHONE GOOGLE CHROME (iOS) */}
            {activeTab === 'ios-chrome' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>How to Install on iPhone using Google Chrome:</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Apple iOS requires Chrome users to add the app to the home screen using Chrome's Share sheet.
                  </p>
                </div>

                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold">
                      Tap the <strong>Share Icon</strong> next to the Chrome URL bar:
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Look at the top right next to the web address (or tap the <strong>...</strong> three dots at the bottom right) and tap <strong>Share</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      <PlusSquare className="w-4 h-4 text-amber-400" />
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      In the Chrome share sheet, tap <strong>"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>Tap <strong>"Add"</strong> at the top right</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      The Debzane Prompter app icon will now be on your iPhone home screen!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: iPHONE SAFARI (iOS) */}
            {activeTab === 'ios-safari' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl">
                  <h4 className="text-xs font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>How to Install on iPhone using Apple Safari:</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Install standalone in Safari with 3 simple taps:
                  </p>
                </div>

                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>Tap the Safari <strong>Share Button (⎋)</strong></span>
                      <Share2 className="w-4 h-4 text-cyan-400" />
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      In Safari's bottom toolbar, tap the <strong>Share icon</strong> (square with arrow pointing up).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      <PlusSquare className="w-4 h-4 text-cyan-400" />
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Select <strong>"Add to Home Screen"</strong> with the <strong>+</strong> plus icon.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-bold flex items-center gap-1.5">
                      <span>Tap <strong>"Add"</strong> at the top right</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap <strong>Add</strong> to launch without address bars and with full offline storage.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DESKTOP & LAPTOP (MAC & WINDOWS) */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl text-xs space-y-2">
                  <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-400" />
                    <span>Install on Windows PC, Mac or Chromebook:</span>
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    On Chrome or Microsoft Edge on your computer:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                    <li>Click the <strong>Install icon (🖥️ / ⬇️)</strong> inside the URL address bar at the top right.</li>
                    <li>Click <strong>Install</strong> to add Debzane Prompter as a native desktop application!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                100% Free • Powered by Debzane Concepts
              </span>
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
