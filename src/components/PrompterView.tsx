import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PrompterSettings, Script } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Maximize, 
  Minimize, 
  FlipHorizontal, 
  FlipVertical, 
  Minus, 
  Plus, 
  Sliders, 
  Eye, 
  EyeOff, 
  Type, 
  Sparkles,
  Tv
} from 'lucide-react';

interface PrompterViewProps {
  script: Script;
  settings: PrompterSettings;
  onUpdateSetting: <K extends keyof PrompterSettings>(key: K, value: PrompterSettings[K]) => void;
  onClose: () => void;
}

export const PrompterView: React.FC<PrompterViewProps> = ({
  script,
  settings,
  onUpdateSetting,
  onClose
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const controlsTimeoutRef = useRef<any>(null);

  // Keep screen awake while in prompter view
  useWakeLock(true);

  // Auto-hide controls after inactivity while playing
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsDrawer) {
          setShowControls(false);
        }
      }, 3000);
    }
  }, [isPlaying, showSettingsDrawer]);

  useEffect(() => {
    const handleMouseMove = () => resetControlsTimer();
    const handleTouchStart = () => resetControlsTimer();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer]);

  // Start Countdown or Play
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCountdown(null);
    } else {
      if (settings.countdownSeconds > 0 && countdown === null) {
        setCountdown(settings.countdownSeconds);
      } else {
        setIsPlaying(true);
      }
    }
  };

  // Countdown timer ticker
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsPlaying(true);
    }
  }, [countdown]);

  // Animation Frame Loop for Ultra-Smooth Subpixel Scrolling
  useEffect(() => {
    const scrollElem = scrollContainerRef.current;
    if (!scrollElem) return;

    const scrollLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying && scrollElem) {
        // speed formula: pixels per second
        // speed 1 => 15px/sec, speed 50 => 120px/sec, speed 100 => 350px/sec
        const pixelsPerSecond = 10 + Math.pow(settings.speed, 1.4) * 2.5;
        scrollElem.scrollTop += pixelsPerSecond * deltaTime;

        // Check if reached end
        if (scrollElem.scrollTop + scrollElem.clientHeight >= scrollElem.scrollHeight - 5) {
          if (settings.autoReverseOnEnd) {
            scrollElem.scrollTop = 0;
          } else {
            setIsPlaying(false);
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scrollLoop);
    };

    animationFrameId.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      lastTimeRef.current = 0;
    };
  }, [isPlaying, settings.speed, settings.autoReverseOnEnd]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Reset to top
  const handleReset = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard Shortcuts & Bluetooth Foot Pedal / Remote Clicker support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleTogglePlay();
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          // Increase speed or step up
          if (e.shiftKey) {
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop -= 100;
          } else {
            onUpdateSetting('speed', Math.min(100, settings.speed + 3));
          }
          break;
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          // Decrease speed or step down
          if (e.shiftKey) {
            if (scrollContainerRef.current) scrollContainerRef.current.scrollTop += 100;
          } else {
            onUpdateSetting('speed', Math.max(1, settings.speed - 3));
          }
          break;
        case 'KeyR':
          handleReset();
          break;
        case 'KeyM':
          onUpdateSetting('mirrorH', !settings.mirrorH);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, settings, onClose]);

  // Mirror transformation class
  let mirrorClass = '';
  if (settings.mirrorH && settings.mirrorV) mirrorClass = 'prompter-mirror-both';
  else if (settings.mirrorH) mirrorClass = 'prompter-mirror-h';
  else if (settings.mirrorV) mirrorClass = 'prompter-mirror-v';

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{ backgroundColor: settings.backgroundColor }}
    >
      {/* Visual Reading Cue Overlay Guide */}
      {settings.cueLineVisible && (
        <div 
          className="cue-indicator transition-all duration-200 z-10"
          style={{
            top: `${settings.cueLinePositionPercent}%`,
            height: `${settings.fontSize * settings.lineHeight * 1.8}px`,
            borderColor: `${settings.highlightColor}44`,
            background: `linear-gradient(90deg, ${settings.highlightColor}08 0%, ${settings.highlightColor}18 50%, ${settings.highlightColor}08 100%)`,
          }}
        >
          {/* Subtle marker triangles on edges */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8" style={{ borderLeftColor: settings.highlightColor }}></div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8" style={{ borderRightColor: settings.highlightColor }}></div>
        </div>
      )}

      {/* Main Scrolling Text Area */}
      <div 
        ref={scrollContainerRef}
        onClick={handleTogglePlay}
        className={`w-full h-full overflow-y-scroll cursor-pointer scrollbar-none px-6 sm:px-12 md:px-20 ${mirrorClass}`}
        style={{
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Spacer before text so starting text aligns at cue line */}
        <div 
          style={{ height: `${settings.cueLinePositionPercent}vh` }} 
          className="w-full flex items-center justify-center opacity-40 text-xs tracking-widest uppercase text-slate-500"
        >
          <span>— START OF SCRIPT —</span>
        </div>

        {/* Script Content */}
        <div 
          className="mx-auto font-reading transition-all duration-200"
          style={{
            maxWidth: `${settings.maxWidthPercent}%`,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: `${settings.letterSpacing}px`,
            color: settings.textColor,
            fontFamily: settings.fontFamily === 'Monospace' ? 'monospace' : settings.fontFamily === 'Serif' ? 'serif' : settings.fontFamily === 'Space Grotesk' ? 'Space Grotesk, sans-serif' : 'Lexend, sans-serif',
          }}
        >
          {script.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-8 whitespace-pre-wrap">
              {paragraph || <br />}
            </p>
          ))}
        </div>

        {/* Spacer after text */}
        <div className="h-[80vh] w-full flex items-center justify-center opacity-40 text-xs tracking-widest uppercase text-slate-500">
          <span>— END OF SCRIPT —</span>
        </div>
      </div>

      {/* Countdown Visual Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-40 pointer-events-none">
          <div className="text-8xl sm:text-9xl font-extrabold text-teal-400 font-heading animate-ping">
            {countdown === 0 ? 'ACTION!' : countdown}
          </div>
          <p className="mt-6 text-slate-400 font-medium text-lg">
            Debzain Concept Teleprompter Starting...
          </p>
        </div>
      )}

      {/* Top Floating Mini Header */}
      <div 
        className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between pointer-events-none transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto shadow-lg">
          <Tv className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200 max-w-[160px] sm:max-w-[280px] truncate">
            {script.title}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-2.5 bg-slate-950/80 hover:bg-slate-800/90 text-slate-300 hover:text-white rounded-full border border-slate-800 backdrop-blur-md shadow-lg transition-all"
            title="Prompter Display Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-950/80 hover:bg-slate-800/90 text-slate-300 hover:text-white rounded-full border border-slate-800 backdrop-blur-md shadow-lg transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-red-950/70 hover:bg-red-900/90 text-red-200 rounded-full border border-red-800/60 backdrop-blur-md shadow-lg transition-all"
            title="Exit Prompter Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Control Dock */}
      <div 
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 z-30 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-4 px-4 py-3 bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/80">
          
          {/* Rewind to Start */}
          <button
            onClick={handleReset}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Rewind to start (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Decrement */}
          <button
            onClick={() => onUpdateSetting('speed', Math.max(1, settings.speed - 2))}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Decrease Speed (Down Arrow)"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 w-24 sm:w-36">
            <input
              type="range"
              min="1"
              max="100"
              value={settings.speed}
              onChange={(e) => onUpdateSetting('speed', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <span className="text-xs font-mono font-bold text-teal-400 w-7 text-right">
              {settings.speed}
            </span>
          </div>

          {/* Speed Increment */}
          <button
            onClick={() => onUpdateSetting('speed', Math.min(100, settings.speed + 2))}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Increase Speed (Up Arrow)"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1" />

          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
          </button>

          <div className="w-[1px] h-6 bg-slate-800 mx-1" />

          {/* Mirror H Toggle */}
          <button
            onClick={() => onUpdateSetting('mirrorH', !settings.mirrorH)}
            className={`p-2.5 rounded-xl border transition-all ${
              settings.mirrorH
                ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Horizontal Mirror (for beam splitter glass)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Mirror V Toggle */}
          <button
            onClick={() => onUpdateSetting('mirrorV', !settings.mirrorV)}
            className={`p-2.5 rounded-xl border transition-all ${
              settings.mirrorV
                ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Vertical Mirror (for inverted mount)"
          >
            <FlipVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Settings Drawer */}
      {showSettingsDrawer && (
        <div className="absolute right-6 top-20 w-80 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl z-40 text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-heading font-bold text-sm flex items-center gap-2 text-teal-300">
              <Sliders className="w-4 h-4" />
              Prompter Adjustments
            </h3>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Font Size */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Font Size</span>
                <span className="font-mono text-teal-400">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="96"
                value={settings.fontSize}
                onChange={(e) => onUpdateSetting('fontSize', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Line Spacing */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Line Height</span>
                <span className="font-mono text-teal-400">{settings.lineHeight}x</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.5"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => onUpdateSetting('lineHeight', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Column Width */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Reading Width</span>
                <span className="font-mono text-teal-400">{settings.maxWidthPercent}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={settings.maxWidthPercent}
                onChange={(e) => onUpdateSetting('maxWidthPercent', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Cue Line Position */}
            <div>
              <div className="flex justify-between mb-1">
                <span>Cue Marker Position</span>
                <span className="font-mono text-teal-400">{settings.cueLinePositionPercent}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={settings.cueLinePositionPercent}
                onChange={(e) => onUpdateSetting('cueLinePositionPercent', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>

            {/* Cue Line Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span>Show Reading Cue Line</span>
              <button
                onClick={() => onUpdateSetting('cueLineVisible', !settings.cueLineVisible)}
                className={`p-1.5 rounded-lg ${settings.cueLineVisible ? 'text-teal-400 bg-teal-950/60' : 'text-slate-500 bg-slate-900'}`}
              >
                {settings.cueLineVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Pre-roll Countdown */}
            <div className="flex items-center justify-between">
              <span>Pre-roll Countdown</span>
              <select
                value={settings.countdownSeconds}
                onChange={(e) => onUpdateSetting('countdownSeconds', Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
              >
                <option value={0}>Off (Instant)</option>
                <option value={3}>3 Seconds</option>
                <option value={5}>5 Seconds</option>
                <option value={10}>10 Seconds</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
