import React, { useState, useRef, useEffect } from 'react';
import { Script, PrompterSettings, VideoFilter, StudioOverlayConfig } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';
import { 
  Radio, 
  Play, 
  Pause, 
  X, 
  Youtube, 
  Upload, 
  Sparkles, 
  Square, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Sun, 
  Edit3, 
  HelpCircle, 
  Sliders, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Layers
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
  useWakeLock(isOpen);

  // Script text and quick inline editing inside Studio
  const [scriptTitle, setScriptTitle] = useState(script.title);
  const [scriptContent, setScriptContent] = useState(script.content);
  const [showScriptDrawer, setShowScriptDrawer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Studio Media Reference state
  const [mediaSourceType, setMediaSourceType] = useState<'none' | 'youtube' | 'file'>('none');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [youtubeEmbedId, setYoutubeEmbedId] = useState<string>('');
  const [localMediaUrl, setLocalMediaUrl] = useState<string>('');
  const [localMediaType, setLocalMediaType] = useState<'video' | 'audio'>('video');

  // Camera, Lighting & Orientation State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [lightingBrightness, setLightingBrightness] = useState<number>(100); // 70 to 150%

  // Live Scrolling Prompter inside Studio
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(settings.speed || 24);

  // Overlay & Filter Configuration
  const [overlayConfig, setOverlayConfig] = useState<StudioOverlayConfig>({
    showTicker: true,
    tickerText: 'BREAKING: Debzane Concept Teleprompter Studio • For Bookings & Health Coaching Call: 08057961025',
    tickerSpeed: 3,
    tickerBgColor: '#dc2626',
    tickerTextColor: '#ffffff',
    showLogo: true,
    logoUrl: '/debzane-logo.jpg',
    logoPosition: 'top-right',
    filter: 'beauty',
    layout: 'split-h',
    mediaSwapped: false
  });

  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

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

  useEffect(() => {
    setScriptTitle(script.title);
    setScriptContent(script.content);
  }, [script.id, script.title, script.content]);

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

  // Start Camera with adaptive constraints based on Orientation
  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: orientation === 'portrait' ? { ideal: 1080 } : { ideal: 1920 },
          height: orientation === 'portrait' ? { ideal: 1920 } : { ideal: 1080 },
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
    } catch (err) {
      console.warn('Camera access error:', err);
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
  }, [isOpen, orientation]);

  // Master Play / Pause for Teleprompter & Media
  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (localVideoElemRef.current) {
      if (nextState) localVideoElemRef.current.play().catch(() => {});
      else localVideoElemRef.current.pause();
    }
  };

  // Recording Controls
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
        videoBitsPerSecond: 4000000
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

      // Auto start prompter scroll
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

  // Reactions
  const triggerEmoji = (emoji: string) => {
    const newEmoji: FloatingEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: 15 + Math.random() * 70
    };
    setFloatingEmojis(prev => [...prev.slice(-15), newEmoji]);

    if (emoji === '🎉') {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
    }, 3000);
  };

  // Prompter Scroll loop
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
        return 'contrast-[1.08] saturate-[1.15] blur-[0.25px]';
      case 'cinematic':
        return 'contrast-[1.22] saturate-[1.25] hue-rotate-[-6deg]';
      case 'matrix':
        return 'contrast-[1.3] hue-rotate-[90deg] saturate-[1.8]';
      case 'monochrome':
        return 'grayscale contrast-[1.25]';
      case 'vibrant':
        return 'saturate-[1.6] contrast-[1.15]';
      case 'sepia':
        return 'sepia contrast-[1.1]';
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
      
      {/* Studio Header */}
      <header className="h-14 sm:h-16 px-3 sm:px-4 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-xl shadow-md flex items-center justify-center">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xs sm:text-sm text-slate-100 tracking-wide">
              DEBZANE DUAL-STUDIO
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[160px] sm:max-w-none">
              Script: <span className="text-amber-300 font-semibold">{scriptTitle || 'Untitled Script'}</span>
            </p>
          </div>
        </div>

        {/* Top Controls & Instructions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Edit Script Button */}
          <button
            onClick={() => setShowScriptDrawer(!showScriptDrawer)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showScriptDrawer ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Edit script text directly"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Edit Text</span>
          </button>

          {/* Orientation Toggle */}
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
            title={`Switch to ${orientation === 'portrait' ? 'Landscape (16:9)' : 'Portrait (9:16 for TikTok/Shorts)'}`}
          >
            {orientation === 'portrait' ? <Smartphone className="w-4 h-4 text-amber-400" /> : <Monitor className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Help Instructions Toggle */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Studio Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Close Studio */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Close Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Interactive Instructions Dropdown */}
      {showInstructions && (
        <div className="bg-slate-900 border-b border-amber-500/30 p-3 sm:p-4 text-xs text-slate-300 z-40 animate-in slide-in-from-top-2">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="space-y-1">
              <strong className="text-amber-300 font-bold">🎬 Quick Studio Instructions:</strong>
              <p className="text-[11px] text-slate-400">
                1. <strong>Edit Text</strong> to change your script words on the fly. 2. <strong>Load Reaction Video</strong> on the left (YouTube link or offline file). 3. Hit the big red <strong>RECORD</strong> button at the bottom. When you finish, you can trim off intro/outro pauses and download in HD.
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs self-end sm:self-center font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Inline Script Drawer for Mobile/Tablet */}
      {showScriptDrawer && (
        <div className="bg-slate-900/98 border-b border-slate-700 p-3 z-40 flex flex-col gap-2 max-h-[35vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-amber-300">Live Script Editor:</span>
            <span>Changes reflect immediately in the prompter</span>
          </div>
          <textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            placeholder="Type your script here..."
            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none h-24 font-reading"
          />
        </div>
      )}

      {/* Main Studio Viewport (Split Stage) */}
      <main className={`flex-1 relative flex overflow-hidden bg-black ${orientation === 'portrait' ? 'flex-col' : 'flex-col md:flex-row'}`}>
        
        {/* LEFT / TOP PANEL: Reaction / Reference Media */}
        <div className={`relative flex-1 bg-slate-950 border-r border-b md:border-b-0 border-slate-800 flex flex-col justify-center items-center overflow-hidden min-h-[35vh] md:min-h-auto ${overlayConfig.mediaSwapped ? 'order-2' : 'order-1'}`}>
          
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
                <div className="p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-white font-bold text-sm">Audio Track Loaded</h3>
                  <audio ref={localVideoElemRef as any} src={localMediaUrl} controls className="mx-auto" />
                </div>
              )}
            </div>
          ) : (
            // Default Media Slot
            <div className="p-4 sm:p-6 text-center max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-base">Reaction Media Slot</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Paste YouTube link or upload offline video to react side-by-side.
                </p>
              </div>

              {/* YouTube Input Box */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Paste YouTube URL..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={handleApplyYoutube}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all"
                >
                  Load
                </button>
              </div>

              <label className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Local Media (Offline)</span>
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

        {/* RIGHT / BOTTOM PANEL: Live Camera + Scrolling Prompter */}
        <div className={`relative flex-1 bg-slate-950 flex flex-col justify-center items-center overflow-hidden min-h-[45vh] md:min-h-auto ${overlayConfig.mediaSwapped ? 'order-1' : 'order-2'}`}>
          
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ filter: `brightness(${lightingBrightness}%)` }}
          >
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${getFilterStyle(overlayConfig.filter)}`}
            />

            {/* Custom Brand Logo */}
            {overlayConfig.showLogo && (
              <div 
                className={`absolute z-20 p-2.5 pointer-events-none transition-all ${
                  overlayConfig.logoPosition === 'top-left' ? 'top-2 left-2' :
                  overlayConfig.logoPosition === 'top-right' ? 'top-2 right-2' :
                  overlayConfig.logoPosition === 'bottom-left' ? 'bottom-16 left-2' :
                  'bottom-16 right-2'
                }`}
              >
                <img 
                  src={overlayConfig.logoUrl} 
                  alt="Logo Watermark" 
                  className="h-8 sm:h-10 w-auto object-contain rounded-lg shadow-xl border border-white/20"
                />
              </div>
            )}

            {/* Floating Live Reactions */}
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

            {/* In-Camera Teleprompter Corridor */}
            <div 
              ref={prompterScrollRef}
              onClick={togglePlay}
              className="absolute inset-0 z-20 overflow-y-scroll scrollbar-none px-4 sm:px-10 py-6 cursor-pointer bg-gradient-to-b from-black/60 via-black/35 to-black/70 backdrop-blur-[1px]"
            >
              <div className="sticky top-1/3 left-0 right-0 h-16 border-y border-amber-400/40 bg-amber-400/10 pointer-events-none rounded-lg flex items-center px-2">
                <span className="text-amber-400 font-bold text-[10px]">▶ CUE</span>
              </div>

              <div className="py-20 space-y-4 text-center max-w-lg mx-auto">
                <h2 className="text-base sm:text-xl font-black text-amber-300 drop-shadow-md">
                  {scriptTitle || 'Untitled'}
                </h2>
                <div 
                  className="font-bold text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-pre-wrap text-sm sm:text-lg"
                >
                  {scriptContent || 'Click "Edit Text" at the top to write your script.'}
                </div>
              </div>
            </div>

            {/* CNN LIVE SCROLLING TICKER */}
            {overlayConfig.showTicker && (
              <div 
                className="absolute bottom-0 left-0 right-0 z-30 h-8 sm:h-9 flex items-center shadow-2xl border-t border-black/40 overflow-hidden font-bold select-none"
                style={{ backgroundColor: overlayConfig.tickerBgColor, color: overlayConfig.tickerTextColor }}
              >
                <div className="bg-black text-white px-2.5 h-full flex items-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 z-10 shadow-lg">
                  LIVE NEWS
                </div>
                <div className="flex-1 overflow-hidden whitespace-nowrap">
                  <div className="inline-block animate-ticker text-xs pl-3">
                    {overlayConfig.tickerText} • {overlayConfig.tickerText}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Prominent Center Bottom Recording & Reaction Trigger Bar */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 max-w-[95vw]">
        
        {/* Reaction Buttons */}
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl px-2 py-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
          <button onClick={() => triggerEmoji('🎈')} className="p-1.5 text-lg hover:scale-125 transition-transform" title="Balloons">🎈</button>
          <button onClick={() => triggerEmoji('👍')} className="p-1.5 text-lg hover:scale-125 transition-transform" title="Thumbs Up">👍</button>
          <button onClick={() => triggerEmoji('🔥')} className="p-1.5 text-lg hover:scale-125 transition-transform" title="Fire">🔥</button>
          <button onClick={() => triggerEmoji('💖')} className="p-1.5 text-lg hover:scale-125 transition-transform" title="Heart">💖</button>
          <button onClick={() => triggerEmoji('🎉')} className="p-1.5 text-lg hover:scale-125 transition-transform" title="Party">🎉</button>
        </div>

        {/* Master Record Trigger */}
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/50 flex items-center gap-2 animate-pulse border-2 border-white/40"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>STOP REC ({formatTimer(recordingSeconds)})</span>
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/40 flex items-center gap-2 border-2 border-white/20 transform active:scale-95"
          >
            <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>
            <span>START RECORDING</span>
          </button>
        )}

        {/* Play / Pause Scroll */}
        <button
          onClick={togglePlay}
          className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-bold shadow-xl transition-all"
          title={isPlaying ? 'Pause Prompter' : 'Play Prompter'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
        </button>

      </div>

      {/* Studio Bottom Quick Toolbelt */}
      <footer className="h-14 sm:h-16 px-3 sm:px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 z-30">
        
        {/* Camera Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-[55vw] sm:max-w-none">
          <span className="text-slate-500 font-bold text-[10px] uppercase hidden sm:inline">FX:</span>
          {(['beauty', 'cinematic', 'matrix', 'monochrome', 'none'] as VideoFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setOverlayConfig(prev => ({ ...prev, filter: f }))}
              className={`px-2.5 py-1 rounded-xl capitalize font-semibold transition-all shrink-0 text-[11px] sm:text-xs ${
                overlayConfig.filter === f
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {f === 'beauty' ? '✨ Beauty' : f === 'matrix' ? '🟩 Matrix' : f}
            </button>
          ))}
        </div>

        {/* Lighting & Swap Sides Toolbelt */}
        <div className="flex items-center gap-2">
          
          {/* Lighting Brightness Slider */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min={70}
              max={150}
              value={lightingBrightness}
              onChange={(e) => setLightingBrightness(Number(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title="Lighting Brightness"
            />
          </div>

          {/* Swap Sides Button */}
          <button
            onClick={() => setOverlayConfig(prev => ({ ...prev, mediaSwapped: !prev.mediaSwapped }))}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
            title="Swap Left / Right Panels"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          {/* Speed Slider */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono">SPD:{speed}</span>
            <input
              type="range"
              min={5}
              max={60}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-14 sm:w-16 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>
        </div>

      </footer>

    </div>
  );
};
