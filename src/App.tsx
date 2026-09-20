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
import { ExportFormat, VideoMetadata } from './types';

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
  const [trimmerFileName, setTrimmerFileName] = useState<string>('my_studio_take');
  const [trimmerFormat, setTrimmerFormat] = useState<ExportFormat>('mp4');
  const [trimmerMetadata, setTrimmerMetadata] = useState<VideoMetadata | undefined>(undefined);
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

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={() => setIsStudioOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border border-red-400/40 rounded-xl transition-all shadow-md shadow-red-600/30 active:scale-95"
                  >
                    <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Split Studio</span>
                  </button>

                  <a
                    href="https://youtube.com/@debzane_concepts"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all active:scale-95"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsDonateReminder(false);
                      setIsDonateOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition-all active:scale-95"
                  >
                    <Heart className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Support (OPay)</span>
                  </button>

                  <button
                    onClick={handleLaunchPrompter}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
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
          <footer className="border-t border-slate-900 bg-[#02060f] py-8 text-slate-500 text-xs mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-900 items-start">
                
                {/* Brand & Organization */}
                <div className="space-y-2">
                  <div 
                    onClick={() => setIsOwnerModalOpen(true)}
                    className="cursor-pointer flex items-center gap-2 group inline-flex"
                  >
                    <img src="/debzane-logo.jpg" alt="Debzane" className="w-6 h-6 rounded-full border border-amber-400/60" />
                    <span className="font-heading font-bold text-slate-200 group-hover:text-amber-300 transition-colors text-sm">
                      Debzane Concept Teleprompter
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A 100% free, unlimited, studio-grade video teleprompter created by <strong>Sylvester Oga Ogaji</strong> in strategic partnership with <strong className="text-debzane-blue-300">JV ImpactVR Initiative LTD/GTE</strong>.
                  </p>
                </div>

                {/* Founder Channels & Wellness */}
                <div className="space-y-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Founder & Programs</h4>
                  <div className="flex flex-col gap-1.5 text-[11px]">
                    <a
                      href="https://debzane-wellness-coach.lovable.app"
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Fresh & Fit Wellness Portal</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                    </a>
                    <a
                      href="https://www.facebook.com/gbemisola.akinlade/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-400 flex items-center gap-1.5"
                    >
                      <span>Facebook: Oluwagbemisola J. Akinlade-Ogaji</span>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/oluwagbemisola-j-akinlade-ogaji/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-debzane-blue-400 flex items-center gap-1.5"
                    >
                      <span>LinkedIn Profile</span>
                    </a>
                  </div>
                </div>

                {/* Community & Support Channels */}
                <div className="space-y-2">
                  <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Support & Feedback</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => { setIsDonateReminder(false); setIsDonateOpen(true); }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-400" />
                      <span>Support Dev (OPay)</span>
                    </button>

                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
                    >
                      Community Reviews
                    </button>

                    <a
                      href="https://youtube.com/@debzane_concepts"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright & Disclaimer */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>© 2026 Debzane Concepts & JV ImpactVR Initiative LTD/GTE. All rights reserved.</span>
                <span>Unlimited Multi-Page Prompter • 100% Offline Compatible</span>
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
          onOpenTrimmer={(blob, fileName, format, meta) => {
            setIsStudioOpen(false);
            setTrimmerBlob(blob);
            if (fileName) setTrimmerFileName(fileName);
            if (format) setTrimmerFormat(format);
            setTrimmerMetadata(meta);
          }}
        />
      )}

      {/* CapCut-Style Video Trimmer & Exporter Modal */}
      {trimmerBlob && (
        <VideoTrimmerModal
          videoBlob={trimmerBlob}
          initialFileName={trimmerFileName}
          initialFormat={trimmerFormat}
          initialMetadata={trimmerMetadata}
          onClose={() => {
            setTrimmerBlob(null);
            setTrimmerMetadata(undefined);
          }}
          onSave={(trimmedBlob, filename) => {
            const url = URL.createObjectURL(trimmedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            setTrimmerBlob(null);
            setTrimmerMetadata(undefined);
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
