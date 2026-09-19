import React, { useState } from 'react';
import { PrompterSettings } from '../types';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig 
} from '../services/supabase';
import { 
  Settings2, 
  X, 
  Database, 
  Smartphone, 
  HelpCircle, 
  Check, 
  RotateCcw,
  Palette,
  Eye,
  Key
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrompterSettings;
  onUpdateSetting: <K extends keyof PrompterSettings>(key: K, value: PrompterSettings[K]) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSetting,
  onResetSettings
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'shortcuts' | 'cloud' | 'mobile'>('display');
  
  // Supabase cloud config state
  const config = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(config.anonKey);
  const [savedCloudNotice, setSavedCloudNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveCloud = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
    setSavedCloudNotice(true);
    setTimeout(() => setSavedCloudNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100">
                Preferences & Cloud Config
              </h2>
              <p className="text-xs text-slate-400">
                Debzain Concept Teleprompter Studio Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 my-4">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'display'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Display & Styling</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'shortcuts'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pedal & Shortcuts</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'mobile'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android / Capacitor</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Storage & Persistence</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {activeTab === 'display' && (
            <div className="space-y-4">
              {/* Font Family */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Typography Font Family</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Lexend', 'Inter', 'Space Grotesk', 'Monospace'] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => onUpdateSetting('fontFamily', font)}
                      className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                        settings.fontFamily === font
                          ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => onUpdateSetting('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settings.backgroundColor}
                      onChange={(e) => onUpdateSetting('backgroundColor', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => onUpdateSetting('textColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={settings.textColor}
                      onChange={(e) => onUpdateSetting('textColor', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Highlight cue color */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cue Guide Highlight Accent</label>
                <div className="flex items-center gap-3">
                  {['#14b8a6', '#06b6d4', '#f59e0b', '#ec4899', '#3b82f6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => onUpdateSetting('highlightColor', color)}
                      className="w-7 h-7 rounded-full border-2 transition-transform active:scale-95"
                      style={{
                        backgroundColor: color,
                        borderColor: settings.highlightColor === color ? '#ffffff' : 'transparent'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={onResetSettings}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Display to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-300">
                <p className="font-semibold text-teal-300 mb-1">Hardware Pedals & Wireless Remotes</p>
                <p className="text-slate-400">
                  Debzain Concept Teleprompter supports all standard Bluetooth page turners, foot pedals (AirTurn, Donner, PageFlip, IK Multimedia), and presentation clickers.
                </p>
              </div>

              <div className="divide-y divide-slate-800">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Play / Pause Prompter</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">Spacebar</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Increase Speed</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">Up Arrow / PageUp</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Decrease Speed</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">Down Arrow / PageDown</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Rewind to Beginning</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">R</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Toggle Horizontal Glass Mirror</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">M</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Toggle Studio Fullscreen</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">F</kbd>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-slate-300">Exit Studio Prompter View</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-teal-300 font-mono">Esc</kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mobile' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-teal-300">Capacitor Android & Cloudflare R2 Deployment</h4>
                <p className="text-slate-400 leading-relaxed">
                  Debzain Concept Teleprompter is fully packaged for Android devices. You can install it straight as a web APK or build with Android Studio using:
                </p>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-teal-300 space-y-1">
                  <div>npm run build</div>
                  <div>npx cap add android</div>
                  <div>npx cap copy</div>
                  <div>npx cap open android</div>
                </div>
              </div>

              <div className="p-3 bg-teal-950/30 border border-teal-500/30 rounded-xl text-slate-300">
                <strong className="text-teal-300">10GB Free Cloudflare R2 Storage:</strong> All static builds and user script audio assets can be served completely free with zero egress fees via Cloudflare R2 & Pages.
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <Database className="w-4 h-4" />
                  <span>Browser-Native Persistent Storage: Active</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  All your scripts, studio settings, video trimmer cuts, and community reviews are stored locally in your browser's durable <strong>HTML5 IndexedDB Engine</strong> with automatic <strong>Persistent Storage API</strong> locking. Your data will not be evicted even under low disk space.
                </p>
              </div>

              <form onSubmit={handleSaveCloud} className="space-y-4 pt-1">
                <div className="text-slate-400 text-xs">
                  Optional: You can also connect a custom <strong className="text-teal-300">Supabase</strong> cloud database for cross-device multi-user sync.
                </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supabase Anon Public API Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedCloudNotice ? (
                  <span className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
                    <Check className="w-4 h-4" />
                    Supabase settings saved!
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    Works offline automatically if empty.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-all"
                >
                  Save Supabase Config
                </button>
              </div>
            </form>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Debzain Concept Teleprompter v1.0.0</span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
