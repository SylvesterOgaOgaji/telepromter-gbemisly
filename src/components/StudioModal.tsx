import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Script, PrompterSettings, VideoFilter, StudioOverlayConfig } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Youtube, 
  Upload, 
  Sparkles, 
  Layers, 
  Radio, 
  Sliders, 
  Square, 
  Download, 
  Smile, 
  Flame, 
  Heart, 
  ThumbsUp, 
  PartyPopper,
  FlipHorizontal,
  LayoutGrid,
  Columns,
  Rows,
  Image as ImageIcon,
  Check,
  ChevronRight,
  RefreshCw,
  Film
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
  settings: PrompterSettings;
  onUpdateSetting: <K extends keyof PrompterSettings>(key: K, value: PrompterSettings[K]) => void;
  onOpenTrimmer: (videoBlob: Blob) => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  script,
  settings,
  onUpdateSetting,
  onOpenTrimmer
}) => {
  // Wake lock to keep screen active
  useWakeLock(isOpen);

  // Studio Media Reference state
  const [mediaSourceType, setMediaSourceType] = useState<'none' | 'youtube' | 'file'>('none');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [youtubeEmbedId, setYoutubeEmbedId] = useState<string>('');
  const [localMediaUrl, setLocalMediaUrl] = useState<string>('');
  const [localMediaType, setLocalMediaType] = useState<'video' | 'audio'>('video');

  // Camera & Audio State
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Live Scrolling Prompter inside Studio
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(settings.speed || 24);

  // Overlay & Filter Configuration
  const [overlayConfig, setOverlayConfig] = useState<StudioOverlayConfig>({
    showTicker: true,
    tickerText: 'BREAKING: Debzane Concept Teleprompter Studio • For Bookings & Coaching Call: 08057961025 • High-Definition Studio Broadcast',
    tickerSpeed: 3,
    tickerBgColor: '#dc2626', // Red breaking news
    tickerTextColor: '#ffffff',
    showLogo: true,
    logoUrl: '/debzane-logo.jpg',
    logoPosition: 'top-right',
    filter: 'beauty',
    layout: 'split-h',
    mediaSwapped: false
  });

  // Floating reaction animations
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showSettingsTab, setShowSettingsTab] = useState<'overlays' | 'media' | 'prompter' | 'filters' | null>(null);

  // References
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const localVideoElemRef = useRef<HTMLVideoElement>(null);
  const prompterScrollRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const recordingTimerRef = useRef<any>(null);

  // Parse YouTube URL to Embed ID
  const parseYoutubeUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : '';
    } catch {
      return '';
    }
  };

  const handleApplyYoutube = () => {
    const id = parseYoutubeUrl(youtubeUrl);
    if (id) {
      setYoutubeEmbedId(id);
      setMediaSourceType('youtube');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLocalMediaUrl(url);
    if (file.type.startsWith('audio/')) {
      setLocalMediaType('audio');
    } else {
      setLocalMediaType('video');
    }
    setMediaSourceType('file');
  };

  // Initialize Camera & Microphone with Studio Ultra-HD constraints
  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);
    } catch (err) {
      console.warn('Camera/Mic access error:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      if (isRecording) stopRecording();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Master Play / Pause for Teleprompter + Reference Media
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    // Sync local video/audio if loaded
    if (localVideoElemRef.current) {
      if (nextState) {
        localVideoElemRef.current.play().catch(() => {});
      } else {
        localVideoElemRef.current.pause();
      }
    }
  };

  // Start / Stop Recording
  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType,
        videoBitsPerSecond: 4000000 // High 4Mbps quality
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        onOpenTrimmer(fullBlob);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      // Auto start prompter scroll when recording begins
      setIsPlaying(true);
      if (localVideoElemRef.current) localVideoElemRef.current.play().catch(() => {});

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPlaying(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (localVideoElemRef.current) localVideoElemRef.current.pause();
  };

  // Floating Reaction Trigger
  const triggerEmoji = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 70 // randomized horizontal position percentage
    };
    setFloatingEmojis(prev => [...prev.slice(-15), newEmoji]);

    if (emoji === '🎉') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    // Auto remove after 3s animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 3000);
  };

  // Ultra-Smooth Prompter Animation Frame Loop
  useEffect(() => {
    const scrollElem = prompterScrollRef.current;
    if (!scrollElem) return;

    const scrollLoop = (time: number) => {
      if (!lastScrollTimeRef.current) lastScrollTimeRef.current = time;
      const deltaTime = (time - lastScrollTimeRef.current) / 1000;
      lastScrollTimeRef.current = time;

      if (isPlaying && scrollElem) {
        const pixelsPerSecond = 10 + Math.pow(speed, 1.4) * 2.5;
        scrollElem.scrollTop += pixelsPerSecond * deltaTime;

        if (scrollElem.scrollTop + scrollElem.clientHeight >= scrollElem.scrollHeight - 5) {
          setIsPlaying(false);
        }
      }

      animFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastScrollTimeRef.current = 0;
    };
  }, [isPlaying, speed]);

  if (!isOpen) return null;

  // Filter Styles Map
  const getFilterStyle = (filter: VideoFilter) => {
    switch (filter) {
      case 'beauty':
        return 'contrast-[1.08] brightness-[1.12] saturate-[1.15] blur-[0.3px]';
      case 'cinematic':
        return 'contrast-[1.2] brightness-[0.95] saturate-[1.25] hue-rotate-[-8deg]';
      case 'matrix':
        return 'contrast-[1.3] brightness-[1.1] hue-rotate-[90deg] saturate-[1.8]';
      case 'monochrome':
        return 'grayscale contrast-[1.25] brightness-[1.05]';
      case 'vibrant':
        return 'saturate-[1.6] contrast-[1.15]';
      case 'sepia':
        return 'sepia contrast-[1.1] brightness-[0.95]';
      default:
        return '';
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* Studio Master Header */}
      <header className="h-16 px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-sm sm:text-base text-slate-100 tracking-wide">
                DEBZANE DUAL-STUDIO & REACTION SUITE
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                100% OFFLINE READY
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Record live split-screen reactions with synchronized prompter and CNN ticker
            </p>
          </div>
        </div>

        {/* Master Control Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Recording HUD */}
          {isRecording ? (
            <div className="flex items-center gap-2 bg-red-950/80 border border-red-500/60 px-3 py-1.5 rounded-xl animate-pulse">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="font-mono font-bold text-red-300 text-xs sm:text-sm">
                REC {formatTimer(recordingSeconds)}
              </span>
              <button
                onClick={stopRecording}
                className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md"
              >
                STOP
              </button>
            </div>
          ) : (
            <button
              onClick={startRecording}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all transform active:scale-95"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
              <span>START RECORDING</span>
            </button>
          )}

          {/* Quick Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Studio Viewport (Split Stage) */}
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden bg-black">
        
        {/* LEFT / TOP PANEL (Reference Video or Camera depending on swap) */}
        <div className={`relative flex-1 bg-slate-950 border-r border-b md:border-b-0 border-slate-800 flex flex-col justify-center items-center overflow-hidden min-h-[40vh] md:min-h-auto ${overlayConfig.mediaSwapped ? 'order-2' : 'order-1'}`}>
          
          {mediaSourceType === 'youtube' && youtubeEmbedId ? (
            <div className="w-full h-full aspect-video flex items-center justify-center bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeEmbedId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                title="Reference Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
              />
            </div>
          ) : mediaSourceType === 'file' && localMediaUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-black relative">
              {localMediaType === 'video' ? (
                <video
                  ref={localVideoElemRef}
                  src={localMediaUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                />
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                    <Radio className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Audio Track Loaded</h3>
                  <audio ref={localVideoElemRef as any} src={localMediaUrl} controls className="mx-auto" />
                </div>
              )}
            </div>
          ) : (
            // Default: Empty Reference Video Slot with Import Launcher
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
                <Youtube className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Load Reaction / Reference Media</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Paste any YouTube link or upload your own video/audio to react, commentary, or dub side-by-side.
                </p>
              </div>

              {/* YouTube Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste YouTube link here..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleApplyYoutube}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Load
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[10px] uppercase text-slate-500 font-bold">OR OFFLINE FILE</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload MP4 / MP3 File (100% Offline)</span>
                <input
                  type="file"
                  accept="video/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

        </div>

        {/* RIGHT / BOTTOM PANEL (Live Ultra-HD Camera + Integrated Scrolling Script) */}
        <div className={`relative flex-1 bg-slate-950 flex flex-col justify-center items-center overflow-hidden min-h-[45vh] md:min-h-auto ${overlayConfig.mediaSwapped ? 'order-1' : 'order-2'}`}>
          
          {/* Live Camera Video Engine */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${getFilterStyle(overlayConfig.filter)}`}
            />

            {/* Custom Brand Logo Watermark Overlay */}
            {overlayConfig.showLogo && (
              <div 
                className={`absolute z-20 p-3 pointer-events-none transition-all ${
                  overlayConfig.logoPosition === 'top-left' ? 'top-3 left-3' :
                  overlayConfig.logoPosition === 'top-right' ? 'top-3 right-3' :
                  overlayConfig.logoPosition === 'bottom-left' ? 'bottom-16 left-3' :
                  'bottom-16 right-3'
                }`}
              >
                <img 
                  src={overlayConfig.logoUrl} 
                  alt="Debzane Logo Watermark" 
                  className="h-10 sm:h-12 w-auto object-contain rounded-lg shadow-xl drop-shadow-md border border-white/20 backdrop-blur-sm"
                />
              </div>
            )}

            {/* Floating Live Reaction Emojis Animation Layer */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              {floatingEmojis.map(item => (
                <div
                  key={item.id}
                  className="absolute bottom-16 text-3xl sm:text-4xl animate-float-up opacity-90 transition-all drop-shadow-lg select-none"
                  style={{ left: `${item.left}%` }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>

            {/* In-Camera Teleprompter Text Corridor Overlay */}
            <div 
              ref={prompterScrollRef}
              onClick={togglePlay}
              className="absolute inset-0 z-20 overflow-y-scroll scrollbar-none px-6 sm:px-12 py-8 cursor-pointer bg-gradient-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-[1.5px]"
            >
              {/* Cue focus highlight box */}
              <div className="sticky top-1/3 left-0 right-0 h-20 border-y border-amber-400/40 bg-amber-400/10 pointer-events-none rounded-lg">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs">▶ CUE</div>
              </div>

              <div className="py-24 space-y-6 text-center max-w-xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-md">
                  {script.title}
                </h2>
                <div 
                  className="font-bold text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-pre-wrap"
                  style={{ fontSize: `${Math.max(22, settings.fontSize * 0.65)}px` }}
                >
                  {script.content || 'Paste or write your script in the editor to scroll live here.'}
                </div>
              </div>
            </div>

            {/* CNN-STYLE LIVE BREAKING NEWS SCROLLING TICKER */}
            {overlayConfig.showTicker && (
              <div 
                className="absolute bottom-0 left-0 right-0 z-30 h-10 flex items-center shadow-2xl border-t border-black/40 overflow-hidden font-bold tracking-wide select-none"
                style={{ backgroundColor: overlayConfig.tickerBgColor, color: overlayConfig.tickerTextColor }}
              >
                <div className="bg-black text-white px-3 h-full flex items-center text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 z-10 shadow-lg">
                  LIVE NEWS
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap">
                  <div className="inline-block animate-ticker text-xs sm:text-sm pl-4">
                    {overlayConfig.tickerText} • {overlayConfig.tickerText}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Floating Reaction Trigger Bar (Balloons, Thumbs-up, Fire) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl px-3 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
        <button
          onClick={() => triggerEmoji('🎈')}
          className="p-2 text-xl hover:scale-125 transition-transform active:scale-95"
          title="Floating Balloons"
        >
          🎈
        </button>
        <button
          onClick={() => triggerEmoji('👍')}
          className="p-2 text-xl hover:scale-125 transition-transform active:scale-95"
          title="Thumbs Up"
        >
          👍
        </button>
        <button
          onClick={() => triggerEmoji('🔥')}
          className="p-2 text-xl hover:scale-125 transition-transform active:scale-95"
          title="Fire"
        >
          🔥
        </button>
        <button
          onClick={() => triggerEmoji('💖')}
          className="p-2 text-xl hover:scale-125 transition-transform active:scale-95"
          title="Heart Love"
        >
          💖
        </button>
        <button
          onClick={() => triggerEmoji('🎉')}
          className="p-2 text-xl hover:scale-125 transition-transform active:scale-95"
          title="Party Confetti"
        >
          🎉
        </button>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>

        {/* Play / Pause Sync Button */}
        <button
          onClick={togglePlay}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all"
          title={isPlaying ? 'Pause Scroll' : 'Play Scroll'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
      </div>

      {/* Studio Bottom Quick Toolbelt */}
      <footer className="h-16 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 z-30">
        
        {/* Filter Selection Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-slate-500 font-bold text-[10px] uppercase hidden sm:inline">Camera FX:</span>
          {(['beauty', 'cinematic', 'matrix', 'monochrome', 'none'] as VideoFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setOverlayConfig(prev => ({ ...prev, filter: f }))}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all shrink-0 ${
                overlayConfig.filter === f
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {f === 'beauty' ? '✨ Beauty Glow' : f === 'matrix' ? '🟩 Matrix Cyber' : f}
            </button>
          ))}
        </div>

        {/* Stage Adjustments */}
        <div className="flex items-center gap-2">
          {/* Swap Sides */}
          <button
            onClick={() => setOverlayConfig(prev => ({ ...prev, mediaSwapped: !prev.mediaSwapped }))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Swap Left / Right Sides"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Swap Sides</span>
          </button>

          {/* Speed Slider */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono">SPD: {speed}</span>
            <input
              type="range"
              min={5}
              max={60}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>
        </div>

      </footer>

    </div>
  );
};
