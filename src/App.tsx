import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ScriptEditor } from './components/ScriptEditor';
import { PrompterView } from './components/PrompterView';
import { DonateModal } from './components/DonateModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { OwnerModal } from './components/OwnerModal';
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
  ExternalLink
} from 'lucide-react';

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
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Studio Teleprompter Full Screen View */}
      {isPrompterActive && activeScript ? (
        <PrompterView
          script={activeScript}
          settings={settings}
          onUpdateSetting={updateSetting}
          onClose={() => setIsPrompterActive(false)}
        />
      ) : (
        <>
          {/* Top Bar Header */}
          <Navbar
            onOpenDonate={() => setIsDonateOpen(true)}
            onOpenFeedback={() => setIsFeedbackOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenOwnerProfile={() => setIsOwnerModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Mission Hero Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
              <div className="bg-gradient-to-r from-debzane-blue-950/80 via-slate-900 to-amber-950/40 border border-debzane-blue-800/60 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div 
                    onClick={() => setIsOwnerModalOpen(true)}
                    className="relative cursor-pointer group flex-shrink-0"
                    title="View Debzane Concepts Leader"
                  >
                    <img
                      src="/debzane-logo.jpg"
                      alt="Debzane Concepts"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full overflow-hidden border-2 border-slate-950 bg-slate-900 shadow">
                      <img src="/founder.jpg" alt="Debzane Leader" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>Debzane Concept Teleprompter Studio</span>
                      </h2>
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                        100% FREE • NO PAYWALL
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                      Official free teleprompter for <button onClick={() => setIsOwnerModalOpen(true)} className="text-amber-300 hover:underline font-semibold">Debzane Concepts</button> & creators worldwide. Powered by <strong className="text-debzane-blue-300">JV Impact Initiative</strong> (Dev: Sylvester Oga Ogaji).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                  <a
                    href="https://debzane-wellness-coach.lovable.app"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fresh & Fit Coach</span>
                  </a>

                  <button
                    onClick={() => setIsDonateOpen(true)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Support Dev</span>
                  </button>

                  <button
                    onClick={() => setIsPrompterActive(true)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-debzane-blue-400 hover:from-amber-300 hover:to-debzane-blue-300 rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Launch Prompter</span>
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
              onLaunchPrompter={() => setIsPrompterActive(true)}
              onOpenOwnerProfile={() => setIsOwnerModalOpen(true)}
            />
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-[#02060f] py-6 text-slate-500 text-xs mt-12">
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
                <span className="text-debzane-blue-400">JV Impact Initiative</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                <a 
                  href="https://debzane-wellness-coach.lovable.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>Fresh & Fit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button onClick={() => setIsDonateOpen(true)} className="hover:text-amber-400 transition-colors">
                  Donate
                </button>
                <button onClick={() => setIsFeedbackOpen(true)} className="hover:text-debzane-blue-400 transition-colors">
                  Reviews
                </button>
                <button onClick={() => setIsSettingsOpen(true)} className="hover:text-slate-200 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Owner Profile & Bio Modal */}
      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* Support / Donation Modal */}
      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
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
