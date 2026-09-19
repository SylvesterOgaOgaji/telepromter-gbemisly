import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScriptEditor } from './components/ScriptEditor';
import { PrompterView } from './components/PrompterView';
import { DonateModal } from './components/DonateModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { OwnerModal } from './components/OwnerModal';
import { StudioModal } from './components/StudioModal';
import { VideoTrimmerModal } from './components/VideoTrimmerModal';
import { useScriptStorage } from './hooks/useScriptStorage';
import { useSettings } from './hooks/useSettings';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Tv, 
  Heart, 
  Share2, 
  Smartphone,
  Youtube,
  Instagram,
  Activity,
  ExternalLink,
  Radio
} from 'lucide-react';

import { InstallPrompt } from './components/InstallPrompt';
import { AccessibilityFloating } from './components/AccessibilityFloating';

export function App() {
  const {
    scripts,
    activeScript,
    activeScriptId,
    setActiveScriptId,
    saveScript,
    deleteScript,
    toggleFavorite
  } = useScriptStorage();

  const {
    settings,
    updateSetting,
    resetSettings
  } = useSettings();

  const [isPrompterActive, setIsPrompterActive] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [trimmerBlob, setTrimmerBlob] = useState<Blob | null>(null);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isDonateReminder, setIsDonateReminder] = useState(false);

  // Register Offline PWA Service Worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration notice:', err);
      });
    }
  }, []);

  // Track session usage count to show gentle donation reminder
  const handleLaunchPrompter = () => {
    setIsPrompterActive(true);
    const count = Number(localStorage.getItem('debzane_prompter_usage_count') || '0') + 1;
    localStorage.setItem('debzane_prompter_usage_count', count.toString());
  };

  const handleClosePrompter = () => {
    setIsPrompterActive(false);
    const count = Number(localStorage.getItem('debzane_prompter_usage_count') || '0');
    if (count > 0 && count % 2 === 0) {
      setTimeout(() => {
        setIsDonateReminder(true);
        setIsDonateOpen(true);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Studio Teleprompter Full Screen View */}
      {isPrompterActive && activeScript ? (
        <PrompterView
          script={activeScript}
          settings={settings}
          onUpdateSetting={updateSetting}
          onClose={handleClosePrompter}
        />
      ) : (
        <>
          {/* Top Bar Header */}
          <Navbar
            onOpenDonate={() => {
              setIsDonateReminder(false);
              setIsDonateOpen(true);
            }}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenOwnerProfile={() => setIsOwnerModalOpen(true)}
            onOpenStudio={() => setIsStudioOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Mission Hero Banner */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-1 sm:pb-2">
              <div className="bg-gradient-to-r from-debzane-blue-950/80 via-slate-900 to-amber-950/40 border border-debzane-blue-800/60 rounded-3xl p-3.5 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setIsOwnerModalOpen(true)}
                    className="relative cursor-pointer group flex-shrink-0"
                    title="View Debzane Concepts Leader"
                  >
                    <img
                      src="/debzane-logo.jpg"
                      alt="Debzane Concepts"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden border-2 border-slate-950 bg-slate-900 shadow">
                      <img src="/founder.jpg" alt="Debzane Leader" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                        <span>Debzane Concept Teleprompter</span>
                      </h2>
                      <span className="text-[9px] sm:text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-extrabold border border-amber-400/30">
                        100% FREE
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 max-w-2xl">
                      Official free teleprompter for <button onClick={() => setIsOwnerModalOpen(true)} className="text-amber-300 hover:underline font-semibold">Debzane Concepts</button>. Powered by <strong className="text-debzane-blue-300">JV ImpactVR Initiative LTD/GTE</strong> (Dev: Sylvester Oga Ogaji).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setIsStudioOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-400/40 rounded-xl transition-all shadow-md shadow-red-600/30"
                  >
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Split Studio</span>
                  </button>

                  <a
                    href="https://youtube.com/@debzane_concepts"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsDonateReminder(false);
                      setIsDonateOpen(true);
                    }}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Support Dev (OPay)</span>
                  </button>

                  <button
                    onClick={handleLaunchPrompter}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-debzane-blue-400 hover:from-amber-300 hover:to-debzane-blue-300 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Script Management & Studio Editor */}
            <ScriptEditor
              scripts={scripts}
              activeScript={activeScript}
              activeScriptId={activeScriptId}
              onSelectScript={setActiveScriptId}
              onSaveScript={saveScript}
              onDeleteScript={deleteScript}
              onToggleFavorite={toggleFavorite}
              onLaunchPrompter={handleLaunchPrompter}
              onLaunchStudio={() => setIsStudioOpen(true)}
              onOpenOwnerProfile={() => setIsOwnerModalOpen(true)}
            />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-[#02060f] py-6 text-slate-500 text-xs mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsOwnerModalOpen(true)}
                  className="font-bold text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <img src="/debzane-logo.jpg" alt="Debzane" className="w-4 h-4 rounded-full" />
                  <span>Debzane Concepts</span>
                </button>
                <span>•</span>
                <span>Created by Sylvester Oga Ogaji</span>
                <span>•</span>
                <span className="text-debzane-blue-400">JV ImpactVR Initiative LTD/GTE</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <a 
                  href="https://youtube.com/@debzane_concepts" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube Reviews</span>
                </a>
                <a 
                  href="https://debzane-wellness-coach.lovable.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>Fresh & Fit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => { setIsDonateReminder(false); setIsDonateOpen(true); }} className="hover:text-amber-400 transition-colors">
                  Donate (OPay)
                </button>
                <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-debzane-blue-400 transition-colors">
                  Reviews
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Floating Accessibility Assistive Tool Badge */}
      <AccessibilityFloating currentText={activeScript?.content} />

      {/* PWA Install Invite Prompt */}
      <InstallPrompt />

      {/* Dual-Studio Video & Reaction Recording Suite Modal */}
      {activeScript && (
        <StudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          script={activeScript}
          settings={settings}
          onUpdateSetting={updateSetting}
          onOpenTrimmer={(blob) => {
            setIsStudioOpen(false);
            setTrimmerBlob(blob);
          }}
        />
      )}

      {/* CapCut-Style Video Trimmer & Exporter Modal */}
      {trimmerBlob && (
        <VideoTrimmerModal
          videoBlob={trimmerBlob}
          onClose={() => setTrimmerBlob(null)}
          onSave={(trimmedBlob, filename) => {
            const url = URL.createObjectURL(trimmedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            setTrimmerBlob(null);
          }}
        />
      )}

      {/* Owner Profile & Bio Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onOpenDonate={() => {
          setIsDonateReminder(false);
          setIsDonateOpen(true);
        }}
      />

      {/* Support / Donation Modal with OPay Details */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        isReminder={isDonateReminder}
      />

      {/* Community Comments & Reviews Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
      />

    </div>
  );
}

export default App;
