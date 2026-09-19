import React, { useState, useRef, useEffect } from 'react';
import { Script, PrompterSettings, VideoFilter } from '../types';
import { useWakeLock } from '../hooks/useWakeLock';
import { 
  Radio, 
  Play, 
  Pause, 
  X, 
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
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  VideoOff, 
  Layers, 
  Download,
  Flame,
  Heart,
  ThumbsUp,
  PartyPopper,
  Youtube,
  Link,
  Film,
  Image as ImageIcon,
  Type
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

  // Script text and inline editing
  const [scriptTitle, setScriptTitle] = useState(script.title);
  const [scriptContent, setScriptContent] = useState(script.content);
  const [showScriptDrawer, setShowScriptDrawer] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Media Reference state
  const [mediaSourceUrl, setMediaSourceUrl] = useState<string>('');
  const [onlineInputUrl, setOnlineInputUrl] = useState<string>('');
  const [isYoutubeIframe, setIsYoutubeIframe] = useState<boolean>(false);
  const [youtubeEmbedId, setYoutubeEmbedId] = useState<string>('');

  // Audio Volume Sliders & Mute Controls (For both desktop & mobile)
  const [micVolume, setMicVolume] = useState<number>(1);
  const [mediaVolume, setMediaVolume] = useState<number>(1);
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [mediaMuted, setMediaMuted] = useState<boolean>(false);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

  // Video Output & Orientation
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('beauty');
  const [brightness, setBrightness] = useState<number>(100);

  // Custom Logo & News Ticker Text Customization
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('/debzane-logo.jpg');
  const [customLogoText, setCustomLogoText] = useState<string>('DEBZANE STUDIO');
  const [showTicker, setShowTicker] = useState<boolean>(true);
  const [tickerText, setTickerText] = useState<string>('BREAKING: Debzane Concept Studio • For Coaching & Inquiries Call: 08057961025 • 100% Free');
  const [mediaSwapped, setMediaSwapped] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(settings.speed || 24);

  // Floating Emojis
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Refs
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const mediaVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prompterScrollRef = useRef<HTMLDivElement>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);
  const mediaGainNodeRef = useRef<GainNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const renderAnimIdRef = useRef<number | null>(null);
  const prompterAnimIdRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const recordIntervalRef = useRef<any>(null);

  useEffect(() => {
    setScriptTitle(script.title);
    setScriptContent(script.content);
  }, [script.id, script.title, script.content]);

  // Pre-load custom logo image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = customLogoUrl;
    img.onload = () => {
      logoImageRef.current = img;
    };
  }, [customLogoUrl]);

  // Robust YouTube URL Parser (Supports standard watch, youtu.be, embed, shorts, mobile)
  const extractYoutubeId = (url: string): string => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = trimmed.match(regExp);
    return match && match[1] ? match[1] : '';
  };

  const handleApplyOnlineUrl = () => {
    const ytId = extractYoutubeId(onlineInputUrl);
    if (ytId) {
      setIsYoutubeIframe(true);
      setYoutubeEmbedId(ytId);
      setMediaSourceUrl('');
    } else if (onlineInputUrl.trim()) {
      setIsYoutubeIframe(false);
      setYoutubeEmbedId('');
      setMediaSourceUrl(onlineInputUrl.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIsYoutubeIframe(false);
    setYoutubeEmbedId('');
    setMediaSourceUrl(url);
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomLogoUrl(url);
  };

  // Start Camera with high compatibility for Desktop, Tablets & Mobile phones
  const startCamera = async () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
      setCameraEnabled(true);
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err);
      setCameraEnabled(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
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
  }, [isOpen]);

  // Master Play/Pause
  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);

    if (mediaVideoRef.current) {
      if (next) mediaVideoRef.current.play().catch(() => {});
      else mediaVideoRef.current.pause();
    }
  };

  // Update real-time audio volume gains
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = micMuted ? 0 : micVolume;
    }
  }, [micVolume, micMuted]);

  useEffect(() => {
    if (mediaGainNodeRef.current) {
      mediaGainNodeRef.current.gain.value = mediaMuted ? 0 : mediaVolume;
    }
    if (mediaVideoRef.current) {
      mediaVideoRef.current.volume = mediaMuted ? 0 : mediaVolume;
    }
  }, [mediaVolume, mediaMuted]);

  // Explicit Math-based Filter String for Canvas Context
  const getCanvasFilterString = () => {
    let base = `brightness(${brightness}%)`;
    switch (activeFilter) {
      case 'beauty':
        return `${base} brightness(115%) contrast(108%) saturate(120%)`;
      case 'cinematic':
        return `${base} contrast(135%) saturate(135%) hue-rotate(-8deg)`;
      case 'matrix':
        return `${base} contrast(150%) hue-rotate(90deg) saturate(220%)`;
      case 'monochrome':
        return `${base} grayscale(100%) contrast(130%)`;
      case 'vibrant':
        return `${base} saturate(180%) contrast(115%)`;
      case 'sepia':
        return `${base} sepia(90%) contrast(115%)`;
      default:
        return base;
    }
  };

  // 60FPS Canvas Compositing Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tickerOffset = 0;

    const renderFrame = () => {
      const targetWidth = orientation === 'portrait' ? 1080 : 1920;
      const targetHeight = orientation === 'portrait' ? 1920 : 1080;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      // Fill Background
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const hasMedia = !isYoutubeIframe && mediaSourceUrl && mediaVideoRef.current && mediaVideoRef.current.readyState >= 2;

      // Layout calculations
      if (orientation === 'landscape') {
        const halfWidth = targetWidth / 2;
        const leftIsCam = mediaSwapped;
        const rightIsCam = !mediaSwapped;

        if (leftIsCam) {
          drawCamera(ctx, 0, 0, halfWidth, targetHeight);
        } else if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, 0, 0, halfWidth, targetHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, 0, 0, halfWidth, targetHeight, isYoutubeIframe ? 'YouTube Video Embed Live' : 'Reaction / Reference Video');
        }

        if (rightIsCam) {
          drawCamera(ctx, halfWidth, 0, halfWidth, targetHeight);
        } else if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, halfWidth, 0, halfWidth, targetHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, halfWidth, 0, halfWidth, targetHeight, isYoutubeIframe ? 'YouTube Video Embed Live' : 'Reaction / Reference Video');
        }

        // Center Divider
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(halfWidth, 0);
        ctx.lineTo(halfWidth, targetHeight);
        ctx.stroke();

      } else {
        // Portrait (9:16)
        const halfHeight = targetHeight / 2;
        const topIsCam = mediaSwapped;
        const bottomIsCam = !mediaSwapped;

        if (topIsCam) {
          drawCamera(ctx, 0, 0, targetWidth, halfHeight);
        } else if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, 0, 0, targetWidth, halfHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, 0, 0, targetWidth, halfHeight, isYoutubeIframe ? 'YouTube Video Embed Live' : 'Reaction / Reference Video');
        }

        if (bottomIsCam) {
          drawCamera(ctx, 0, halfHeight, targetWidth, halfHeight);
        } else if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, 0, halfHeight, targetWidth, halfHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, 0, halfHeight, targetWidth, halfHeight, isYoutubeIframe ? 'YouTube Video Embed Live' : 'Reaction / Reference Video');
        }

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, halfHeight);
        ctx.lineTo(targetWidth, halfHeight);
        ctx.stroke();
      }

      // Draw Custom Brand Logo & Title
      ctx.save();
      if (logoImageRef.current) {
        try {
          ctx.drawImage(logoImageRef.current, targetWidth - 280, 24, 44, 44);
        } catch (e) {}
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Space Grotesk", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(customLogoText || 'STUDIO', targetWidth - 220, 52);
      ctx.restore();

      // Draw CNN News Ticker
      if (showTicker) {
        const tickerHeight = 56;
        const tickerY = targetHeight - tickerHeight;

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(0, tickerY, targetWidth, tickerHeight);

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, tickerY, 140, tickerHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 22px "Space Grotesk", sans-serif';
        ctx.fillText('LIVE NEWS', 16, tickerY + 36);

        ctx.save();
        ctx.rect(140, tickerY, targetWidth - 140, tickerHeight);
        ctx.clip();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        tickerOffset -= 2.5;
        const fullText = `${tickerText}    •    ${tickerText}    •    ${tickerText}`;
        const textWidth = ctx.measureText(fullText).width;
        if (tickerOffset <= -textWidth / 3) tickerOffset = 0;

        ctx.fillText(fullText, 150 + tickerOffset, tickerY + 36);
        ctx.restore();
      }

      renderAnimIdRef.current = requestAnimationFrame(renderFrame);
    };

    const drawCamera = (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
      if (!cameraVideoRef.current || cameraVideoRef.current.readyState < 2 || !cameraEnabled) {
        context.save();
        context.fillStyle = '#050c1e';
        context.fillRect(x, y, w, h);
        context.fillStyle = '#94a3b8';
        context.font = 'bold 22px sans-serif';
        context.textAlign = 'center';
        context.fillText('Camera Inactive / Off', x + w / 2, y + h / 2);
        context.restore();
        return;
      }

      context.save();
      context.beginPath();
      context.rect(x, y, w, h);
      context.clip();

      context.filter = getCanvasFilterString();
      context.translate(x + w, y);
      context.scale(-1, 1);
      context.drawImage(cameraVideoRef.current, 0, 0, w, h);
      context.restore();
    };

    const drawMedia = (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, videoElem: HTMLVideoElement) => {
      context.save();
      context.beginPath();
      context.rect(x, y, w, h);
      context.clip();
      context.filter = 'none';
      context.drawImage(videoElem, x, y, w, h);
      context.restore();
    };

    const drawPlaceholder = (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, label: string) => {
      context.save();
      context.fillStyle = '#0b132b';
      context.fillRect(x, y, w, h);
      context.fillStyle = '#64748b';
      context.font = 'bold 24px sans-serif';
      context.textAlign = 'center';
      context.fillText(label, x + w / 2, y + h / 2);
      context.restore();
    };

    renderAnimIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (renderAnimIdRef.current) cancelAnimationFrame(renderAnimIdRef.current);
    };
  }, [orientation, activeFilter, brightness, showTicker, tickerText, mediaSwapped, mediaSourceUrl, isYoutubeIframe, cameraEnabled, customLogoText, customLogoUrl]);

  // Start Canvas + Audio Recording
  const startRecording = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      audioContextRef.current = audioCtx;
      audioDestinationRef.current = dest;

      // Microphone Track with Volume Gain
      if (mediaStreamRef.current && mediaStreamRef.current.getAudioTracks().length > 0) {
        const micSource = audioCtx.createMediaStreamSource(mediaStreamRef.current);
        const micGain = audioCtx.createGain();
        micGain.gain.value = micMuted ? 0 : micVolume;
        micSource.connect(micGain);
        micGain.connect(dest);
        micGainNodeRef.current = micGain;
      }

      // Media Track with Volume Gain
      if (mediaVideoRef.current) {
        try {
          const mediaSource = audioCtx.createMediaElementSource(mediaVideoRef.current);
          const mediaGain = audioCtx.createGain();
          mediaGain.gain.value = mediaMuted ? 0 : mediaVolume;
          mediaSource.connect(mediaGain);
          mediaGain.connect(dest);
          mediaGain.connect(audioCtx.destination);
          mediaGainNodeRef.current = mediaGain;
        } catch (e) {}
      }

      // Capture 60FPS Video
      const canvasStream = canvas.captureStream(60);

      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 6000000
      });

      recordedChunksRef.current = [];
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

      setIsPlaying(true);
      if (mediaVideoRef.current) mediaVideoRef.current.play().catch(() => {});

      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start composite studio recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPlaying(false);
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    if (mediaVideoRef.current) mediaVideoRef.current.pause();

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
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

  // Prompter Scroll
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

      prompterAnimIdRef.current = requestAnimationFrame(scrollLoop);
    };

    prompterAnimIdRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (prompterAnimIdRef.current) cancelAnimationFrame(prompterAnimIdRef.current);
      lastScrollTimeRef.current = 0;
    };
  }, [isPlaying, speed]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col select-none overflow-hidden animate-in fade-in duration-200 text-slate-100 font-sans">
      
      {/* Hidden Source Media Elements for Canvas Compositor */}
      <video ref={cameraVideoRef} autoPlay playsInline muted className="hidden" />
      {mediaSourceUrl && (
        <video 
          ref={mediaVideoRef} 
          src={mediaSourceUrl} 
          playsInline 
          crossOrigin="anonymous" 
          muted={mediaMuted} 
          className="hidden" 
        />
      )}

      {/* TOP STUDIO HARDWARE & CONTROL BAR */}
      <header className="h-16 px-3 sm:px-4 bg-slate-900/98 border-b border-slate-800 flex items-center justify-between z-30 backdrop-blur-md">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-xl shadow-md flex items-center justify-center">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-heading font-black text-xs sm:text-sm tracking-wide text-white flex items-center gap-2">
              <span>DEBZANE DUAL-STUDIO</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md border border-red-500/30">
                {orientation.toUpperCase()} ({orientation === 'portrait' ? '9:16' : '16:9'})
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-none">
              Script: <span className="text-amber-300 font-semibold">{scriptTitle || 'Untitled'}</span>
            </p>
          </div>
        </div>

        {/* Center/Right: Prominent Hardware Audio/Video Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Microphone Mute Control */}
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
              micMuted 
                ? 'bg-red-950/80 border-red-500/80 text-red-300' 
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
            }`}
            title={micMuted ? 'Click to Unmute Microphone' : 'Click to Mute Microphone'}
          >
            {micMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{micMuted ? 'Mic: MUTED' : 'Mic: ON'}</span>
          </button>

          {/* Speaker / Reference Video Sound Control */}
          <button
            onClick={() => setMediaMuted(!mediaMuted)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
              mediaMuted 
                ? 'bg-red-950/80 border-red-500/80 text-red-300' 
                : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
            }`}
            title={mediaMuted ? 'Click to Unmute Reference Sound' : 'Click to Mute Reference Sound'}
          >
            {mediaMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden md:inline">{mediaMuted ? 'Video Sound: MUTED' : 'Video Sound: ON'}</span>
          </button>

          {/* Camera On/Off Toggle */}
          <button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
              !cameraEnabled 
                ? 'bg-red-950/80 border-red-500/80 text-red-300' 
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {!cameraEnabled ? <VideoOff className="w-3.5 h-3.5 text-red-400" /> : <Camera className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden lg:inline">{cameraEnabled ? 'Camera: ON' : 'Camera: OFF'}</span>
          </button>

          {/* Orientation Switcher */}
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1 text-xs font-semibold transition-colors"
            title={`Switch to ${orientation === 'portrait' ? 'Landscape (16:9)' : 'Portrait (9:16)'}`}
          >
            {orientation === 'portrait' ? <Smartphone className="w-3.5 h-3.5 text-amber-400" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden xs:inline">{orientation === 'portrait' ? '9:16' : '16:9'}</span>
          </button>

          {/* Custom Logo & News Ticker Drawer Button */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showSettingsDrawer ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Custom Logo & News Ticker Settings"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logo & Ticker</span>
          </button>

          {/* Edit Script Drawer Button */}
          <button
            onClick={() => setShowScriptDrawer(!showScriptDrawer)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showScriptDrawer ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Script</span>
          </button>

          {/* Close Studio */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Logo & Ticker Customization Settings Drawer */}
      {showSettingsDrawer && (
        <div className="bg-slate-900/98 border-b border-slate-700 p-4 z-40 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto text-xs animate-in slide-in-from-top-2">
          
          {/* Custom Logo Upload */}
          <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Change Logo Here:</span>
            </span>
            <div className="flex items-center gap-2">
              <img src={customLogoUrl} alt="Logo Preview" className="w-10 h-10 object-contain rounded-lg border border-slate-700 bg-slate-900" />
              <label className="flex-1 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl cursor-pointer text-center font-bold">
                <span>Upload Custom Logo</span>
                <input type="file" accept="image/*" onChange={handleCustomLogoUpload} className="hidden" />
              </label>
            </div>
            <input
              type="text"
              value={customLogoText}
              onChange={(e) => setCustomLogoText(e.target.value)}
              placeholder="Brand Label (e.g. DEBZANE STUDIO)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* Scrolling News Ticker Editor */}
          <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 md:col-span-2">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-amber-400" />
              <span>Edit Scrolling Bottom News Ticker:</span>
            </span>
            <textarea
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              placeholder="Enter custom phone number, booking info, or breaking headlines..."
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white resize-none h-16"
            />
          </div>

        </div>
      )}

      {/* Script Drawer */}
      {showScriptDrawer && (
        <div className="bg-slate-900/98 border-b border-slate-700 p-3 z-40 flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-amber-300">Live Teleprompter Text:</span>
            <span>Edits update immediately in the prompter</span>
          </div>
          <textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white resize-none h-20"
            placeholder="Type script here..."
          />
        </div>
      )}

      {/* Media Input Link & Upload Bar with Real-time Volume Controls */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-20">
        
        {/* URL Input */}
        <div className="flex-1 flex items-center gap-1.5 min-w-[280px]">
          <span className="text-slate-400 font-bold hidden sm:inline flex items-center gap-1">
            <Link className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Video:</span>
          </span>
          <input
            type="text"
            placeholder="Paste YouTube link (e.g. watch?v=..., youtu.be, shorts), Facebook, or MP4 URL..."
            value={onlineInputUrl}
            onChange={(e) => setOnlineInputUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleApplyOnlineUrl}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Load Video
          </button>
          <label className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer text-slate-200 flex items-center gap-1">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Upload File</span>
            <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Real-time Volume Sliders for Desktop & Mobile */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800">
          
          {/* Mic Volume */}
          <div className="flex items-center gap-1.5" title="Microphone Volume">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={micVolume}
              onChange={(e) => setMicVolume(Number(e.target.value))}
              className="w-14 sm:w-16 accent-emerald-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Video Audio Volume */}
          <div className="flex items-center gap-1.5" title="Video Soundtrack Volume">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={mediaVolume}
              onChange={(e) => setMediaVolume(Number(e.target.value))}
              className="w-14 sm:w-16 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

        </div>

      </div>

      {/* Main Studio Compositor Stage */}
      <main className="flex-1 relative flex items-center justify-center bg-black overflow-hidden p-2">
        
        {/* The Live 60FPS Composited Canvas (This is what gets recorded with baked-in filters & split screen) */}
        <div className={`relative max-w-full max-h-full flex items-center justify-center rounded-2xl overflow-hidden border border-slate-800 shadow-2xl ${orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
          
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />

          {/* YouTube Embed Player Layer (If YouTube URL is loaded) */}
          {isYoutubeIframe && youtubeEmbedId && (
            <div 
              className={`absolute z-10 overflow-hidden ${
                orientation === 'portrait' 
                  ? (mediaSwapped ? 'bottom-0 left-0 right-0 h-1/2' : 'top-0 left-0 right-0 h-1/2')
                  : (mediaSwapped ? 'top-0 right-0 bottom-0 w-1/2' : 'top-0 left-0 bottom-0 w-1/2')
              }`}
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeEmbedId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`}
                title="YouTube Reference Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full border-0"
              />
            </div>
          )}

          {/* In-Camera Teleprompter Corridor Overlay */}
          <div 
            ref={prompterScrollRef}
            onClick={togglePlay}
            className="absolute inset-0 z-20 overflow-y-scroll scrollbar-none px-4 sm:px-8 py-6 cursor-pointer bg-gradient-to-b from-black/40 via-transparent to-black/60 backdrop-blur-[0.5px]"
          >
            <div className="sticky top-1/3 left-0 right-0 h-14 border-y border-amber-400/50 bg-amber-400/10 pointer-events-none rounded-lg flex items-center px-2">
              <span className="text-amber-400 font-bold text-[10px]">▶ CUE</span>
            </div>

            <div className="py-16 space-y-3 text-center max-w-md mx-auto">
              <h2 className="text-sm sm:text-base font-black text-amber-300 drop-shadow-md">
                {scriptTitle || 'Untitled'}
              </h2>
              <div className="font-bold text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] whitespace-pre-wrap text-sm sm:text-base">
                {scriptContent || 'Click "Script" at the top to add your text.'}
              </div>
            </div>
          </div>

          {/* Floating Live Reactions */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {floatingEmojis.map(item => (
              <div
                key={item.id}
                className="absolute bottom-16 text-3xl animate-float-up opacity-90 select-none"
                style={{ left: `${item.left}%` }}
              >
                {item.emoji}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Prominent Center-Bottom Recording HUD */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 max-w-[95vw]">
        
        {/* Floating Reactions */}
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl px-2 py-1.5 rounded-2xl flex items-center gap-1 shadow-2xl">
          <button onClick={() => triggerEmoji('🎈')} className="p-1 text-base hover:scale-125 transition-transform" title="Balloons">🎈</button>
          <button onClick={() => triggerEmoji('👍')} className="p-1 text-base hover:scale-125 transition-transform" title="Thumbs Up">👍</button>
          <button onClick={() => triggerEmoji('🔥')} className="p-1 text-base hover:scale-125 transition-transform" title="Fire">🔥</button>
          <button onClick={() => triggerEmoji('💖')} className="p-1 text-base hover:scale-125 transition-transform" title="Heart">💖</button>
          <button onClick={() => triggerEmoji('🎉')} className="p-1 text-base hover:scale-125 transition-transform" title="Party">🎉</button>
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

        {/* Play/Pause Prompter */}
        <button
          onClick={togglePlay}
          className="p-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-bold shadow-xl transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
        </button>

      </div>

      {/* Bottom Toolbelt with Baked-in Filters (Beauty Glow, Matrix Cyber, Cinematic Film) */}
      <footer className="h-16 px-3 sm:px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 z-30">
        
        {/* Filters Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none max-w-[55vw] sm:max-w-none">
          <span className="text-slate-500 font-bold text-[10px] uppercase hidden sm:inline">Filters:</span>
          
          <button
            onClick={() => setActiveFilter('beauty')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs flex items-center gap-1 ${
              activeFilter === 'beauty' ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Beauty Glow</span>
          </button>

          <button
            onClick={() => setActiveFilter('matrix')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs flex items-center gap-1 ${
              activeFilter === 'matrix' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span className="text-emerald-400">🟩</span>
            <span>Matrix Cyber</span>
          </button>

          <button
            onClick={() => setActiveFilter('cinematic')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs flex items-center gap-1 ${
              activeFilter === 'cinematic' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cinematic Film</span>
          </button>

          <button
            onClick={() => setActiveFilter('monochrome')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs ${
              activeFilter === 'monochrome' ? 'bg-slate-200 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Monochrome
          </button>

          <button
            onClick={() => setActiveFilter('none')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs ${
              activeFilter === 'none' ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Normal (No Filter)
          </button>
        </div>

        {/* Lighting, Swap & Speed Controls */}
        <div className="flex items-center gap-2">
          
          {/* Lighting / Sun Slider */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="range"
              min={70}
              max={140}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title="Camera Lighting Brightness"
            />
          </div>

          {/* Swap Panels */}
          <button
            onClick={() => setMediaSwapped(!mediaSwapped)}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
            title="Swap Panels (Left/Right or Top/Bottom)"
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
