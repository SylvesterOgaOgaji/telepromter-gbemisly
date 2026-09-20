import React, { useState, useRef, useEffect } from 'react';
import { Script, PrompterSettings, VideoFilter, StudioLayoutMode, ExportFormat } from '../types';
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
  Type,
  User,
  Split,
  Eye,
  EyeOff,
  FileVideo,
  FileAudio,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Search,
  Move,
  Minimize2,
  Maximize2,
  Copy,
  FileText,
  CheckCircle2,
  Share2,
  CornerDownRight,
  Tag,
  Scissors
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  getSupportedVideoMimeType, 
  sanitizeFileName, 
  generateMetadataText, 
  generateMetadataJSON, 
  generateVTTSubtitles, 
  downloadTextFile, 
  downloadBlobFile,
  VideoMetadata
} from '../utils/mediaExport';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script;
  settings: PrompterSettings;
  onUpdateSetting: <K extends keyof PrompterSettings>(key: K, value: PrompterSettings[K]) => void;
  onOpenTrimmer: (videoBlob: Blob, initialFileName?: string, initialFormat?: ExportFormat, initialMetadata?: VideoMetadata) => void;
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
  const [showReferenceBar, setShowReferenceBar] = useState(false);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Draggable Floating Mixer State
  const [showVolumeMixerHUD, setShowVolumeMixerHUD] = useState(true);
  const [isMixerMinimized, setIsMixerMinimized] = useState(false);
  const [mixerPos, setMixerPos] = useState({ x: 16, y: 70 });
  const [isDraggingMixer, setIsDraggingMixer] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 16,
    posY: 70
  });

  // Studio Layout Mode (Solo Camera, Split, PiP, Solo Media)
  const [layoutMode, setLayoutMode] = useState<StudioLayoutMode>('split');

  // Custom File Name & Output Format
  const [customFileName, setCustomFileName] = useState<string>(
    sanitizeFileName(script.title ? script.title.replace(/[^\w\s-]/gi, '') : 'my_studio_take')
  );
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('mp4');

  // Post-Recording Direct Export & Meta Hub State
  const [recordedTakeBlob, setRecordedTakeBlob] = useState<Blob | null>(null);
  const [showPostRecordExportHub, setShowPostRecordExportHub] = useState<boolean>(false);
  const [takeDuration, setTakeDuration] = useState<number>(0);
  const [takeVideoTitle, setTakeVideoTitle] = useState<string>(script.title || 'Debzane Studio Take');
  const [takeDescription, setTakeDescription] = useState<string>('Official video recording produced with Debzane Concept Teleprompter.');
  const [takeScriptWriteup, setTakeScriptWriteup] = useState<string>(script.content || '');
  const [takeTags, setTakeTags] = useState<string>('DebzaneConcepts, Teleprompter, StudioRecording, PublicSpeaking, ViralContent');
  const [copiedTakeMeta, setCopiedTakeMeta] = useState<boolean>(false);
  const [isExportingDirect, setIsExportingDirect] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string>('');


  // Media Reference state
  const [mediaSourceUrl, setMediaSourceUrl] = useState<string>('');
  const [onlineInputUrl, setOnlineInputUrl] = useState<string>('');
  const [isYoutubeIframe, setIsYoutubeIframe] = useState<boolean>(false);
  const [youtubeEmbedId, setYoutubeEmbedId] = useState<string>('');

  // Audio Volume Sliders & Mute Controls (0 to 200%)
  const [micVolume, setMicVolume] = useState<number>(1.2); // 120% mic boost
  const [mediaVolume, setMediaVolume] = useState<number>(0.35); // 35% video sound for clear speech
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [mediaMuted, setMediaMuted] = useState<boolean>(false);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);

  // Video Output & Orientation
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('beauty');
  const [brightness, setBrightness] = useState<number>(100);

  // Custom Logo, Watermark & News Ticker Text Customization
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('/debzane-logo.jpg');
  const [customLogoText, setCustomLogoText] = useState<string>('STUDIO');
  const [showTicker, setShowTicker] = useState<boolean>(false);
  const [tickerText, setTickerText] = useState<string>('BREAKING: Live Studio Recording • High Definition Output • 100% Free');
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
    setCustomFileName(sanitizeFileName(script.title || 'my_studio_take'));
  }, [script.id, script.title, script.content]);

  // Pre-load custom logo image
  useEffect(() => {
    if (showLogo && customLogoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = customLogoUrl;
      img.onload = () => {
        logoImageRef.current = img;
      };
    }
  }, [customLogoUrl, showLogo]);

  // Robust YouTube URL Parser
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
      setLayoutMode('split');
    } else if (onlineInputUrl.trim()) {
      setIsYoutubeIframe(false);
      setYoutubeEmbedId('');
      setMediaSourceUrl(onlineInputUrl.trim());
      setLayoutMode('split');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setIsYoutubeIframe(false);
    setYoutubeEmbedId('');
    setMediaSourceUrl(url);
    setLayoutMode('split');
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomLogoUrl(url);
    setShowLogo(true);
  };

  // Start Camera
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

  // Real-time audio volume gains for Microphone
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = micMuted ? 0 : micVolume;
    }
  }, [micVolume, micMuted]);

  // Real-time audio volume gains for Video & YouTube iframe
  useEffect(() => {
    if (mediaGainNodeRef.current) {
      mediaGainNodeRef.current.gain.value = mediaMuted ? 0 : mediaVolume;
    }
    if (mediaVideoRef.current) {
      mediaVideoRef.current.volume = mediaMuted ? 0 : Math.min(1, Math.max(0, mediaVolume));
    }
    try {
      const iframe = document.querySelector('iframe[title="YouTube Reference Player"]') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        const targetVol = mediaMuted ? 0 : Math.round(Math.min(1, mediaVolume) * 100);
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [targetVol]
        }), '*');

        if (mediaMuted || targetVol === 0) {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute' }), '*');
        } else {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'unMute' }), '*');
        }
      }
    } catch (e) {}
  }, [mediaVolume, mediaMuted]);

  // Math-based Filter String for Canvas Context
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

  /**
   * Aspect-Ratio Preserving Center-Crop (Object-Fit: Cover)
   * Prevents video from being squished, stretched, or pressed together!
   */
  const drawCoverImage = (
    context: CanvasRenderingContext2D,
    video: HTMLVideoElement,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    mirror: boolean = false,
    filterString: string = 'none'
  ) => {
    const vw = video.videoWidth || dw;
    const vh = video.videoHeight || dh;
    const videoAspect = vw / vh;
    const destAspect = dw / dh;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (videoAspect > destAspect) {
      // Source is wider than destination: crop left and right
      sw = vh * destAspect;
      sx = (vw - sw) / 2;
    } else {
      // Source is taller than destination: crop top and bottom
      sh = vw / destAspect;
      sy = (vh - sh) / 2;
    }

    context.save();
    context.beginPath();
    context.rect(dx, dy, dw, dh);
    context.clip();

    if (filterString !== 'none') {
      context.filter = filterString;
    }

    if (mirror) {
      context.translate(dx + dw, dy);
      context.scale(-1, 1);
      context.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
    } else {
      context.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
    }

    context.restore();
  };

  // 60FPS Canvas Compositing Engine with Aspect-Ratio Preserving Object-Fit Cover
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

      // 1. SOLO CAMERA MODE (Full-screen user without stretching)
      if (layoutMode === 'solo-camera') {
        drawCamera(ctx, 0, 0, targetWidth, targetHeight);
      } 
      // 2. SOLO MEDIA MODE
      else if (layoutMode === 'solo-media') {
        if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, 0, 0, targetWidth, targetHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, 0, 0, targetWidth, targetHeight, isYoutubeIframe ? 'YouTube Video Live' : 'Reference Video Fullscreen');
        }
      } 
      // 3. PICTURE-IN-PICTURE (PiP Floating Camera)
      else if (layoutMode === 'pip') {
        if (hasMedia && mediaVideoRef.current) {
          drawMedia(ctx, 0, 0, targetWidth, targetHeight, mediaVideoRef.current);
        } else {
          drawPlaceholder(ctx, 0, 0, targetWidth, targetHeight, isYoutubeIframe ? 'YouTube Video Live' : 'Reference Media');
        }

        const pipW = targetWidth * 0.32;
        const pipH = (pipW * 9) / 16;
        const pipX = targetWidth - pipW - 32;
        const pipY = targetHeight - pipH - (showTicker ? 80 : 32);

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 16;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(pipX, pipY, pipW, pipH);
        drawCamera(ctx, pipX, pipY, pipW, pipH);
        ctx.restore();
      } 
      // 4. SPLIT STUDIO (50/50 Side-by-Side or Top/Bottom with Cover-Crop)
      else {
        if (orientation === 'landscape') {
          const halfWidth = targetWidth / 2;
          const leftIsCam = mediaSwapped;
          const rightIsCam = !mediaSwapped;

          if (leftIsCam) {
            drawCamera(ctx, 0, 0, halfWidth, targetHeight);
          } else if (hasMedia && mediaVideoRef.current) {
            drawMedia(ctx, 0, 0, halfWidth, targetHeight, mediaVideoRef.current);
          } else {
            drawPlaceholder(ctx, 0, 0, halfWidth, targetHeight, isYoutubeIframe ? 'YouTube Embed Live' : 'Reference Video');
          }

          if (rightIsCam) {
            drawCamera(ctx, halfWidth, 0, halfWidth, targetHeight);
          } else if (hasMedia && mediaVideoRef.current) {
            drawMedia(ctx, halfWidth, 0, halfWidth, targetHeight, mediaVideoRef.current);
          } else {
            drawPlaceholder(ctx, halfWidth, 0, halfWidth, targetHeight, isYoutubeIframe ? 'YouTube Embed Live' : 'Reference Video');
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
            drawPlaceholder(ctx, 0, 0, targetWidth, halfHeight, isYoutubeIframe ? 'YouTube Embed Live' : 'Reference Video');
          }

          if (bottomIsCam) {
            drawCamera(ctx, 0, halfHeight, targetWidth, halfHeight);
          } else if (hasMedia && mediaVideoRef.current) {
            drawMedia(ctx, 0, halfHeight, targetWidth, halfHeight, mediaVideoRef.current);
          } else {
            drawPlaceholder(ctx, 0, halfHeight, targetWidth, halfHeight, isYoutubeIframe ? 'YouTube Embed Live' : 'Reference Video');
          }

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, halfHeight);
          ctx.lineTo(targetWidth, halfHeight);
          ctx.stroke();
        }
      }

      // Draw Custom Brand Logo & Title (Only if enabled)
      if (showLogo) {
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
      }

      // Draw News Ticker (Only if enabled)
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

      // Draw with cover aspect ratio to prevent squishing
      drawCoverImage(context, cameraVideoRef.current, x, y, w, h, true, getCanvasFilterString());
    };

    const drawMedia = (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, videoElem: HTMLVideoElement) => {
      // Draw with cover aspect ratio
      drawCoverImage(context, videoElem, x, y, w, h, false, 'none');
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
  }, [orientation, layoutMode, activeFilter, brightness, showLogo, customLogoText, customLogoUrl, showTicker, tickerText, mediaSwapped, mediaSourceUrl, isYoutubeIframe, cameraEnabled]);

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
      if (mediaVideoRef.current && layoutMode !== 'solo-camera') {
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

      const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(60) : null;

      const combinedStream = new MediaStream([
        ...(canvasStream ? canvasStream.getVideoTracks() : []),
        ...dest.stream.getAudioTracks()
      ]);

      const mimeType = getSupportedVideoMimeType(selectedFormat === 'mp4' ? 'mp4' : 'webm');

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 8000000
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedTakeBlob(fullBlob);
        setTakeDuration(recordingSeconds || 1);
        setTakeVideoTitle(scriptTitle || script.title || 'Debzane Studio Take');
        setTakeScriptWriteup(scriptContent || script.content || '');
        setShowPostRecordExportHub(true);
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      setIsPlaying(true);
      if (mediaVideoRef.current && layoutMode !== 'solo-camera') mediaVideoRef.current.play().catch(() => {});

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

  // Direct Clean Video & Meta Package Exporter (100% Deterministic / No-AI)
  const handleDirectCleanExport = () => {
    if (!recordedTakeBlob) return;
    setIsExportingDirect(true);

    const safeTitle = sanitizeFileName(takeVideoTitle || 'debzane_studio_take');
    const ext = selectedFormat === 'mp4' ? 'mp4' : 'webm';
    const videoFileName = `${safeTitle}_${Date.now().toString().slice(-4)}.${ext}`;

    const currentMeta: VideoMetadata = {
      title: takeVideoTitle || 'Debzane Studio Take',
      description: takeDescription,
      scriptContent: takeScriptWriteup,
      tags: takeTags.split(/[,#\s]+/).filter(Boolean),
      recordingDate: new Date().toLocaleString(),
      durationSeconds: takeDuration,
      resolution: '1080p Full HD',
      format: selectedFormat,
      creatorName: 'Debzane Creator',
      organization: 'Debzane Concepts',
      partner: 'JV ImpactVR Initiative LTD/GTE',
      opaySupportAccount: '8057961025'
    };

    // 1. Download Video
    downloadBlobFile(recordedTakeBlob, videoFileName);

    // 2. Download Description & Social Tags (.txt)
    downloadTextFile(generateMetadataText(currentMeta), `${safeTitle}_description.txt`);

    // 3. Download WebVTT Subtitles (.vtt)
    if (takeScriptWriteup.trim()) {
      downloadTextFile(generateVTTSubtitles(takeScriptWriteup, takeDuration), `${safeTitle}_subtitles.vtt`, 'text/vtt');
    }

    // 4. Download JSON-LD Schema Metadata (.json)
    downloadTextFile(generateMetadataJSON(currentMeta), `${safeTitle}_meta.json`, 'application/json');

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setExportSuccessMessage('Clean video & complete metadata package exported successfully!');
    setIsExportingDirect(false);
  };

  const handleCopyTakeMeta = () => {
    const currentMeta: VideoMetadata = {
      title: takeVideoTitle || 'Debzane Studio Take',
      description: takeDescription,
      scriptContent: takeScriptWriteup,
      tags: takeTags.split(/[,#\s]+/).filter(Boolean),
      recordingDate: new Date().toLocaleString(),
      durationSeconds: takeDuration,
      resolution: '1080p Full HD',
      format: selectedFormat,
      creatorName: 'Debzane Creator',
      organization: 'Debzane Concepts',
      partner: 'JV ImpactVR Initiative LTD/GTE',
      opaySupportAccount: '8057961025'
    };

    const formatted = generateMetadataText(currentMeta);
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedTakeMeta(true);
      setTimeout(() => setCopiedTakeMeta(false), 3000);
    });
  };

  const handleOpenInEditor = () => {
    if (!recordedTakeBlob) return;
    const currentMeta: VideoMetadata = {
      title: takeVideoTitle || 'Debzane Studio Take',
      description: takeDescription,
      scriptContent: takeScriptWriteup,
      tags: takeTags.split(/[,#\s]+/).filter(Boolean),
      recordingDate: new Date().toLocaleString(),
      durationSeconds: takeDuration,
      resolution: '1080p',
      format: selectedFormat,
      creatorName: 'Debzane Creator',
      organization: 'Debzane Concepts',
      partner: 'JV ImpactVR Initiative LTD/GTE',
      opaySupportAccount: '8057961025'
    };
    setShowPostRecordExportHub(false);
    onOpenTrimmer(recordedTakeBlob, takeVideoTitle || customFileName, selectedFormat, currentMeta);
  };

  const handleDiscardTake = () => {
    setRecordedTakeBlob(null);
    setShowPostRecordExportHub(false);
    setExportSuccessMessage('');
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

  // Touch / Mouse Dragging Handlers for Floating Mixer
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDraggingMixer(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: mixerPos.x,
      posY: mixerPos.y
    };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingMixer) return;
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const dx = clientX - dragStartRef.current.startX;
      const dy = clientY - dragStartRef.current.startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 180, dragStartRef.current.posX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 120, dragStartRef.current.posY + dy));
      setMixerPos({ x: newX, y: newY });
    };

    const handleEnd = () => {
      if (isDraggingMixer) setIsDraggingMixer(false);
    };

    if (isDraggingMixer) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingMixer]);

  if (!isOpen) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Quick search items
  const quickSearchActions = [
    { title: 'Audio Mixer HUD', desc: 'Control Mic & Video volume', action: () => { setShowVolumeMixerHUD(true); setShowQuickSearch(false); } },
    { title: 'Solo Camera Mode', desc: 'Record yourself full-screen with teleprompter', action: () => { setLayoutMode('solo-camera'); setShowQuickSearch(false); } },
    { title: 'Split 50/50 Mode', desc: 'Side-by-side reaction studio', action: () => { setLayoutMode('split'); setShowReferenceBar(true); setShowQuickSearch(false); } },
    { title: 'Picture-in-Picture (PiP)', desc: 'Floating camera over reference video', action: () => { setLayoutMode('pip'); setShowReferenceBar(true); setShowQuickSearch(false); } },
    { title: 'Beauty Glow Filter', desc: 'Skin smoothing and lighting boost', action: () => { setActiveFilter('beauty'); setShowQuickSearch(false); } },
    { title: 'Cinematic Film Filter', desc: 'Warm teal & orange movie grade', action: () => { setActiveFilter('cinematic'); setShowQuickSearch(false); } },
    { title: 'Matrix Cyber Filter', desc: 'Sci-fi futuristic matrix green', action: () => { setActiveFilter('matrix'); setShowQuickSearch(false); } },
    { title: 'MP4 Universal Format', desc: 'Playable on iPhone, Mac, Windows, Android', action: () => { setSelectedFormat('mp4'); setShowQuickSearch(false); } },
    { title: 'MP3 Audio Format', desc: 'Extract voice podcast audio only', action: () => { setSelectedFormat('mp3'); setShowQuickSearch(false); } },
    { title: 'Clean Feed (No Logo)', desc: 'Turn off all watermarks', action: () => { setShowLogo(false); setShowQuickSearch(false); } },
    { title: 'Custom Watermark Logo', desc: 'Upload your own brand logo', action: () => { setShowSettingsDrawer(true); setShowQuickSearch(false); } },
    { title: 'News Ticker Toggle', desc: 'Edit scrolling bottom broadcast ticker', action: () => { setShowTicker(!showTicker); setShowQuickSearch(false); } },
    { title: 'Orientation Switch', desc: 'Toggle 9:16 Portrait / 16:9 Landscape', action: () => { setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait'); setShowQuickSearch(false); } }
  ];

  const filteredSearchActions = quickSearchActions.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <header className="h-14 sm:h-16 px-2.5 sm:px-4 bg-slate-900/98 border-b border-slate-800 flex items-center justify-between z-30 backdrop-blur-md">
        
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-xl shadow-md flex items-center justify-center">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          
          <div>
            <h1 className="font-heading font-black text-xs sm:text-sm tracking-wide text-white flex items-center gap-1.5">
              <span>STUDIO</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-mono">
                {orientation === 'portrait' ? '9:16' : '16:9'}
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[90px] sm:max-w-[160px]">
              {scriptTitle || 'Take 1'}
            </p>
          </div>
        </div>

        {/* Center/Right: Quick Search, Audio/Video & Drawer Toggles */}
        <div className="flex items-center gap-1.5">
          
          {/* Quick Tool Search Button (Mobile & Desktop) */}
          <button
            onClick={() => setShowQuickSearch(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 flex items-center gap-1 text-xs font-semibold"
            title="Search Studio Features & Settings"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Microphone Mute Control */}
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
              micMuted 
                ? 'bg-red-950/80 border-red-500/80 text-red-300' 
                : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
            }`}
            title={micMuted ? 'Click to Unmute Mic' : 'Click to Mute Mic'}
          >
            {micMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">{micMuted ? 'Mic: OFF' : `Mic: ${Math.round(micVolume * 100)}%`}</span>
          </button>

          {/* Reference Video Sound Control (In split/pip mode) */}
          {layoutMode !== 'solo-camera' && (
            <button
              onClick={() => setMediaMuted(!mediaMuted)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                mediaMuted 
                  ? 'bg-red-950/80 border-red-500/80 text-red-300' 
                  : 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
              }`}
              title={mediaMuted ? 'Click to Unmute Media' : 'Click to Mute Media'}
            >
              {mediaMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden md:inline">{mediaMuted ? 'Video: OFF' : `Video: ${Math.round(mediaVolume * 100)}%`}</span>
            </button>
          )}

          {/* Audio Mixer HUD Toggle */}
          {layoutMode !== 'solo-camera' && (
            <button
              onClick={() => setShowVolumeMixerHUD(!showVolumeMixerHUD)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                showVolumeMixerHUD ? 'bg-amber-400 text-slate-950 border-amber-300 shadow' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Show / Hide Draggable Live Split Audio Mixer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Mixer</span>
            </button>
          )}

          {/* Orientation Switcher */}
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1 text-xs font-semibold transition-colors"
            title={`Switch to ${orientation === 'portrait' ? 'Landscape (16:9)' : 'Portrait (9:16)'}`}
          >
            {orientation === 'portrait' ? <Smartphone className="w-3.5 h-3.5 text-amber-400" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{orientation === 'portrait' ? '9:16' : '16:9'}</span>
          </button>

          {/* Branding & Watermark Drawer */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showSettingsDrawer ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Custom Logo & Watermark Settings"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Branding</span>
          </button>

          {/* Script Drawer */}
          <button
            onClick={() => setShowScriptDrawer(!showScriptDrawer)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showScriptDrawer ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Script</span>
          </button>

          {/* Close Studio */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DEDICATED MOBILE & DESKTOP STUDIO MODE & FORMAT BAR */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-30">
        
        {/* 1. Layout Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setLayoutMode('solo-camera')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              layoutMode === 'solo-camera'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Record myself full-screen with teleprompter"
          >
            <User className="w-3.5 h-3.5" />
            <span>Solo Camera</span>
          </button>

          <button
            onClick={() => { setLayoutMode('split'); setShowReferenceBar(true); }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              layoutMode === 'split'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Split screen 50/50 for reaction video"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split 50/50</span>
          </button>

          <button
            onClick={() => { setLayoutMode('pip'); setShowReferenceBar(true); }}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              layoutMode === 'pip'
                ? 'bg-purple-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Picture-in-Picture floating camera"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PiP</span>
          </button>
        </div>

        {/* 2. Output Format Selector & Custom File Name */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          
          {/* Format Selector Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold px-1 hidden xs:inline">FORMAT:</span>
            {(['mp4', 'webm', 'mp3', 'wav'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] uppercase transition-all ${
                  selectedFormat === fmt
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Export as .${fmt}`}
              >
                .{fmt}
              </button>
            ))}
          </div>

          {/* Custom File Name */}
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Name:</span>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="Name your file..."
              className="bg-transparent text-amber-300 font-bold text-xs font-mono focus:outline-none max-w-[110px] sm:max-w-[150px]"
            />
          </div>

          {/* Reference Video Bar Toggle (In Split / PiP mode) */}
          {layoutMode !== 'solo-camera' && (
            <button
              onClick={() => setShowReferenceBar(!showReferenceBar)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl border border-slate-700 flex items-center gap-1 text-[11px]"
            >
              <Youtube className="w-3 h-3 text-red-400" />
              <span>{showReferenceBar ? 'Hide Video Link' : 'Load Video Link'}</span>
            </button>
          )}

        </div>

      </div>

      {/* Reference Video Loader (Shown in Split/PiP) */}
      {showReferenceBar && layoutMode !== 'solo-camera' && (
        <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-20 animate-in slide-in-from-top-1">
          <div className="flex-1 flex items-center gap-1.5 min-w-[280px]">
            <input
              type="text"
              placeholder="Paste YouTube link (watch/shorts/youtu.be) or MP4 URL..."
              value={onlineInputUrl}
              onChange={(e) => setOnlineInputUrl(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleApplyOnlineUrl}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Load Video
            </button>
            <label className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl cursor-pointer text-slate-200 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload</span>
              <input type="file" accept="video/*,audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* QUICK SEARCH & TOOL PALETTE MODAL (Mobile & Desktop Searchable) */}
      {showQuickSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-amber-400" />
                <span>Search Studio Features & Controls</span>
              </span>
              <button
                onClick={() => setShowQuickSearch(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search (e.g. mixer, solo, beauty, mp4, watermark)..."
                autoFocus
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredSearchActions.length > 0 ? (
                filteredSearchActions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full p-2.5 bg-slate-950/60 hover:bg-amber-400/10 border border-slate-800 hover:border-amber-400/40 rounded-xl text-left transition-all group"
                  >
                    <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300">{item.title}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                  </button>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">No matching studio features found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Branding & Watermark Settings Drawer */}
      {showSettingsDrawer && (
        <div className="bg-slate-900/98 border-b border-slate-700 p-4 z-40 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto text-xs animate-in slide-in-from-top-2">
          
          {/* Watermark / Logo Customization & Toggle */}
          <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Watermark / Brand Logo:</span>
              </span>
              <button
                onClick={() => setShowLogo(!showLogo)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  showLogo ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showLogo ? 'Logo: ON' : 'Clean (NO LOGO)'}
              </button>
            </div>

            {showLogo && (
              <>
                <div className="flex items-center gap-2 pt-1">
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
                  placeholder="Brand Label (e.g. MY CHANNEL)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </>
            )}
          </div>

          {/* Scrolling News Ticker Editor & Toggle */}
          <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-amber-400" />
                <span>Bottom Scrolling News Ticker:</span>
              </span>
              <button
                onClick={() => setShowTicker(!showTicker)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                  showTicker ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {showTicker ? 'Ticker: ON' : 'Ticker: OFF'}
              </button>
            </div>

            {showTicker && (
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                placeholder="Enter custom phone number, booking info, or breaking headlines..."
                className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white resize-none h-16"
              />
            )}
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

      {/* EDGE-TO-EDGE FULL SCREEN STUDIO STAGE */}
      <main className="flex-1 relative flex items-center justify-center bg-black overflow-hidden w-full h-full">
        
        {/* The Live 60FPS Composited Canvas (Fills Screen Edge-to-Edge) */}
        <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${orientation === 'portrait' ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
          
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />

          {/* YouTube Embed Player Layer (In split/pip mode) */}
          {isYoutubeIframe && youtubeEmbedId && layoutMode !== 'solo-camera' && (
            <div 
              className={`absolute z-10 overflow-hidden ${
                layoutMode === 'pip'
                  ? 'inset-0'
                  : orientation === 'portrait' 
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

        {/* FULLY DRAGGABLE FLOATING AUDIO MIXER (Can move anywhere across/outside frame) */}
        {showVolumeMixerHUD && layoutMode !== 'solo-camera' && (
          <div 
            style={{ 
              transform: `translate3d(${mixerPos.x}px, ${mixerPos.y}px, 0)`,
              touchAction: 'none'
            }}
            className="fixed top-0 left-0 z-50 bg-slate-900/98 border border-slate-700/80 backdrop-blur-2xl rounded-2xl shadow-2xl text-xs select-none max-w-[290px]"
          >
            {/* Draggable Header */}
            <div 
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className="px-3 py-2 bg-slate-950/90 rounded-t-2xl border-b border-slate-800 flex items-center justify-between cursor-move active:cursor-grabbing"
              title="Touch or Drag to move anywhere on screen"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px]">
                <Move className="w-3.5 h-3.5 text-amber-400" />
                <span>Move Mixer</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMixerMinimized(!isMixerMinimized); }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title={isMixerMinimized ? 'Expand Mixer' : 'Minimize Mixer'}
                >
                  {isMixerMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowVolumeMixerHUD(false); }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Close Mixer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Minimized Pill View */}
            {isMixerMinimized ? (
              <div className="p-2 flex items-center gap-2 font-mono text-[11px]">
                <span className="text-emerald-400 font-bold">Mic:{Math.round(micVolume * 100)}%</span>
                <span className="text-slate-600">|</span>
                <span className="text-cyan-400 font-bold">Vid:{Math.round(mediaVolume * 100)}%</span>
              </div>
            ) : (
              /* Expanded Full Controls */
              <div className="p-3 space-y-2.5">
                
                {/* 1. Mic Boost Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      <span>My Voice:</span>
                    </span>
                    <span className="font-mono text-emerald-300 font-bold">{micMuted ? 'MUTED' : `${Math.round(micVolume * 100)}%`}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={micVolume}
                    onChange={(e) => setMicVolume(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* 2. Video Sound Volume Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Video Sound:</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">{mediaMuted ? 'MUTED' : `${Math.round(mediaVolume * 100)}%`}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={mediaVolume}
                    onChange={(e) => setMediaVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* Quick 1-Tap Balance Presets */}
                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => { setMicVolume(1.5); setMediaVolume(0.2); setMediaMuted(false); }}
                    className="flex-1 py-1 px-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-center"
                    title="Boost voice and lower video sound"
                  >
                    🎙️ Voice Focus
                  </button>
                  <button
                    onClick={() => { setMediaVolume(0); setMediaMuted(true); }}
                    className="flex-1 py-1 px-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-lg text-[10px] font-bold text-center"
                    title="Mute video audio completely"
                  >
                    🔇 Mute Vid
                  </button>
                  <button
                    onClick={() => { setMicVolume(1.0); setMediaVolume(1.0); setMediaMuted(false); }}
                    className="flex-1 py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold text-center"
                  >
                    ⚖️ 50/50
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

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
            Noir B&W
          </button>

          <button
            onClick={() => setActiveFilter('none')}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all shrink-0 text-[11px] sm:text-xs ${
              activeFilter === 'none' ? 'bg-slate-700 text-white' : 'bg-slate-800/60 text-slate-400'
            }`}
          >
            Normal (Raw)
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

          {/* Swap Panels (Split Mode) */}
          {layoutMode === 'split' && (
            <button
              onClick={() => setMediaSwapped(!mediaSwapped)}
              className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1 transition-colors text-[11px]"
              title="Swap Panels (Left/Right or Top/Bottom)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Swap</span>
            </button>
          )}

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

      {/* POST-RECORDING DIRECT EXPORT & METADATA PRODUCTION HUB MODAL */}
      {showPostRecordExportHub && recordedTakeBlob && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-debzane-blue-950/80 via-slate-900 to-amber-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/20">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white font-heading">
                      Take Recorded Successfully!
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      READY TO EXPORT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Cleanly export your video directly with complete writeup, title, description, and social meta tags.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDiscardTake}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                title="Close and Return to Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Banner */}
            {exportSuccessMessage && (
              <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-center justify-between gap-2 text-emerald-300 text-xs font-bold animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{exportSuccessMessage}</span>
                </div>
                <button
                  onClick={() => setExportSuccessMessage('')}
                  className="text-emerald-400 hover:text-white text-xs underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Column: Video Preview & Specs */}
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video shadow-inner flex items-center justify-center">
                  <video
                    src={URL.createObjectURL(recordedTakeBlob)}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Take Production Specs:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Duration:</span>
                      <span className="font-mono text-amber-300 font-bold">
                        {Math.floor(takeDuration / 60)}m {Math.floor(takeDuration % 60)}s
                      </span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Format & Quality:</span>
                      <span className="font-mono text-cyan-300 font-bold uppercase">
                        {selectedFormat} (1080p HD)
                      </span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Orientation:</span>
                      <span className="text-slate-200 font-bold capitalize">
                        {orientation}
                      </span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Author / Org:</span>
                      <span className="text-slate-200 font-bold truncate block">
                        Debzane Concepts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-debzane-blue-950/40 border border-debzane-blue-800/40 rounded-2xl p-3 text-[11px] text-slate-300">
                  <span className="font-bold text-amber-300 block mb-0.5">📦 Clean Direct Package Includes:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    <li>Clean Rendered Video File (<strong className="text-slate-200">.{selectedFormat}</strong>)</li>
                    <li>Social Description & Speech Write-up (<strong className="text-slate-200">.txt</strong>)</li>
                    <li>Synchronized WebVTT Subtitles (<strong className="text-slate-200">.vtt</strong>)</li>
                    <li>JSON-LD Video Schema Meta (<strong className="text-slate-200">.json</strong>)</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Title, Description, Script & Tags */}
              <div className="space-y-3.5">
                
                {/* Video Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Video Title:</span>
                    <span className="text-[10px] text-amber-400 font-normal">Included in file & metadata</span>
                  </label>
                  <input
                    type="text"
                    value={takeVideoTitle}
                    onChange={(e) => setTakeVideoTitle(e.target.value)}
                    placeholder="Enter video title..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Synopsis / Short Description:
                  </label>
                  <textarea
                    rows={2}
                    value={takeDescription}
                    onChange={(e) => setTakeDescription(e.target.value)}
                    placeholder="Short summary of this recording..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-medium"
                  />
                </div>

                {/* Script Write-Up */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Teleprompter Script / Speech Write-Up:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Auto-generates .vtt subtitles</span>
                  </label>
                  <textarea
                    rows={4}
                    value={takeScriptWriteup}
                    onChange={(e) => setTakeScriptWriteup(e.target.value)}
                    placeholder="Full speech transcript..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>

                {/* Meta Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Meta Tags & Hashtags (Comma Separated):</span>
                  </label>
                  <input
                    type="text"
                    value={takeTags}
                    onChange={(e) => setTakeTags(e.target.value)}
                    placeholder="DebzaneConcepts, Teleprompter, ViralVideo, PublicSpeaking"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

            </div>

            {/* Footer Action Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDiscardTake}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
                >
                  Discard & Re-Record
                </button>
                <button
                  onClick={handleCopyTakeMeta}
                  className="px-3.5 py-2.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                  title="Copy full YouTube & social description block with writeup and tags"
                >
                  {copiedTakeMeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTakeMeta ? 'Meta Copied!' : 'Copy Social Meta'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleOpenInEditor}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Scissors className="w-4 h-4 text-cyan-400" />
                  <span>Open in Video Editor</span>
                </button>

                <button
                  onClick={handleDirectCleanExport}
                  disabled={isExportingDirect}
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingDirect ? 'Exporting Package...' : 'Direct Clean Export (Video + Meta)'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
