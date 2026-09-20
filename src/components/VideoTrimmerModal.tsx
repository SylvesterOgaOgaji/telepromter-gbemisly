import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  Download, 
  X, 
  RotateCcw, 
  Sparkles, 
  Film, 
  Music, 
  Type, 
  Settings, 
  Zap, 
  CheckCircle2, 
  Check,
  FileVideo, 
  FileAudio,
  Tag,
  Copy,
  FileText,
  ShieldCheck,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExportFormat, ExportResolution, VideoFilter } from '../types';
import { 
  getSupportedVideoMimeType, 
  extractAudioFromVideoBlob, 
  sanitizeFileName,
  generateMetadataText,
  generateMetadataJSON,
  generateVTTSubtitles,
  downloadTextFile,
  VideoMetadata
} from '../utils/mediaExport';

interface VideoTrimmerModalProps {
  videoBlob: Blob;
  initialFileName?: string;
  initialFormat?: ExportFormat;
  initialMetadata?: VideoMetadata;
  onClose: () => void;
  onSave: (exportedBlob: Blob, filename: string) => void;
}

export const VideoTrimmerModal: React.FC<VideoTrimmerModalProps> = ({
  videoBlob,
  initialFileName = 'my_studio_recording',
  initialFormat = 'mp4',
  initialMetadata,
  onClose,
  onSave
}) => {
  // Video Source & Playback
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Timeline Trim Handles
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  // Background Audio Mixing
  const [bgAudioUrl, setBgAudioUrl] = useState<string>('');
  const [bgAudioName, setBgAudioName] = useState<string>('');
  const [bgAudioVolume, setBgAudioVolume] = useState<number>(0.3);
  const [mainAudioVolume, setMainAudioVolume] = useState<number>(1.0);

  // Text Overlay / Captions
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<'top' | 'center' | 'bottom'>('bottom');
  const [textSize, setTextSize] = useState<number>(36);

  // Post-Processing Visual Filter
  const [postFilter, setPostFilter] = useState<VideoFilter>('none');

  // Metadata & Social Description State (100% Deterministic / No-AI)
  const [videoTitle, setVideoTitle] = useState<string>(
    initialMetadata?.title || initialFileName || 'Debzane Studio Production'
  );
  const [videoDescription, setTakeDescription] = useState<string>(
    initialMetadata?.description || 'Official video recording produced with Debzane Concept Teleprompter Studio.'
  );
  const [scriptWriteup, setScriptWriteup] = useState<string>(
    initialMetadata?.scriptContent || ''
  );
  const [tagsString, setTagsString] = useState<string>(
    initialMetadata?.tags?.join(', ') || 'DebzaneConcepts, Teleprompter, VideoCreation, Speaking, StudioTake'
  );
  const [copiedMeta, setCopiedMeta] = useState<boolean>(false);

  // Package Sidecar Options
  const [includeMetaSidecar, setIncludeMetaSidecar] = useState<boolean>(true);
  const [includeVttSubtitles, setIncludeVttSubtitles] = useState<boolean>(true);
  const [includeJsonMeta, setIncludeJsonMeta] = useState<boolean>(true);

  // Multi-Format Export Options
  const [fileName, setFileName] = useState<string>(sanitizeFileName(initialFileName));
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(initialFormat);
  const [selectedResolution, setSelectedResolution] = useState<ExportResolution>('1080p');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<'format' | 'metadata' | 'trim' | 'audio' | 'text' | 'filter'>('format');

  // Secondary Joined Clip
  const [secondaryVideoUrl, setSecondaryVideoUrl] = useState<string>('');
  const [secondaryVideoName, setSecondaryVideoName] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      const validDuration = isFinite(d) && d > 0 ? d : 30;
      setDuration(validDuration);
      setEndTime(validDuration);
      setStartTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      if (cur >= endTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) {
          videoRef.current.pause();
        }
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (bgAudioRef.current) bgAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().catch(() => {});
      if (bgAudioRef.current && bgAudioUrl) {
        bgAudioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
  };

  const handleBgAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgAudioUrl(url);
    setBgAudioName(file.name);
  };

  const getFilterStyle = () => {
    switch (postFilter) {
      case 'beauty':
        return 'brightness(1.12) contrast(1.08) saturate(1.2)';
      case 'cinematic':
        return 'contrast(1.3) saturate(1.35) hue-rotate(-8deg)';
      case 'matrix':
        return 'contrast(1.5) hue-rotate(90deg) saturate(2.2)';
      case 'monochrome':
        return 'grayscale(1) contrast(1.3)';
      case 'vibrant':
        return 'saturate(1.8) contrast(1.15)';
      case 'sepia':
        return 'sepia(0.9) contrast(1.15)';
      default:
        return 'none';
    }
  };

  const handleCopyMeta = () => {
    const currentMeta: VideoMetadata = {
      title: videoTitle || fileName,
      description: videoDescription,
      scriptContent: scriptWriteup,
      tags: tagsString.split(/[,#\s]+/).filter(Boolean),
      recordingDate: new Date().toLocaleString(),
      durationSeconds: Math.max(0, endTime - startTime) || duration,
      resolution: selectedResolution,
      format: selectedFormat,
      creatorName: 'Debzane Creator',
      organization: 'Debzane Concepts',
      partner: 'JV ImpactVR Initiative LTD/GTE',
      opaySupportAccount: '8057961025'
    };

    const formatted = generateMetadataText(currentMeta);
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedMeta(true);
      setTimeout(() => setCopiedMeta(false), 3000);
    });
  };

  // Master CapCut Export Engine
  const handleExport = async () => {
    setIsProcessing(true);
    setProgressPercent(10);

    const safeName = sanitizeFileName(videoTitle || fileName || 'my_studio_take');
    const extension = selectedFormat;
    const finalFileName = `${safeName}.${extension}`;

    const effectiveDuration = Math.max(0, endTime - startTime) || duration || 30;

    const currentMeta: VideoMetadata = {
      title: videoTitle || fileName,
      description: videoDescription,
      scriptContent: scriptWriteup,
      tags: tagsString.split(/[,#\s]+/).filter(Boolean),
      recordingDate: new Date().toLocaleString(),
      durationSeconds: effectiveDuration,
      resolution: selectedResolution,
      format: selectedFormat,
      creatorName: 'Debzane Creator',
      organization: 'Debzane Concepts',
      partner: 'JV ImpactVR Initiative LTD/GTE',
      opaySupportAccount: '8057961025'
    };

    // Helper to download sidecars
    const downloadSidecars = () => {
      if (includeMetaSidecar) {
        downloadTextFile(generateMetadataText(currentMeta), `${safeName}_description.txt`);
      }
      if (includeVttSubtitles && scriptWriteup.trim()) {
        downloadTextFile(generateVTTSubtitles(scriptWriteup, effectiveDuration), `${safeName}_subtitles.vtt`, 'text/vtt');
      }
      if (includeJsonMeta) {
        downloadTextFile(generateMetadataJSON(currentMeta), `${safeName}_meta.json`, 'application/json');
      }
    };

    // 1. Audio-only exports (MP3 / WAV)
    if (selectedFormat === 'mp3' || selectedFormat === 'wav') {
      try {
        setProgressPercent(40);
        const audioBlob = await extractAudioFromVideoBlob(videoBlob, selectedFormat);
        setProgressPercent(100);
        onSave(audioBlob, finalFileName);
        downloadSidecars();
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        setIsProcessing(false);
        return;
      } catch (err) {
        console.warn('Audio extraction fallback:', err);
      }
    }

    // 2. Pure WebM / MP4 Video Rendering with Canvas Compositing & Audio Mixing
    try {
      const video = videoRef.current;
      if (!video) throw new Error('Video element not available');

      // Target resolution dimensions
      let targetW = 1920;
      let targetH = 1080;
      if (selectedResolution === '4k') {
        targetW = 3840;
        targetH = 2160;
      } else if (selectedResolution === '720p') {
        targetW = 1280;
        targetH = 720;
      }

      // Check aspect ratio from original video
      const isPortrait = video.videoHeight > video.videoWidth;
      if (isPortrait) {
        const tmp = targetW;
        targetW = targetH;
        targetH = tmp;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Web Audio setup for multi-track audio mixing
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      // Main video audio source
      try {
        const mainSource = audioCtx.createMediaElementSource(video);
        const mainGain = audioCtx.createGain();
        mainGain.gain.value = isMuted ? 0 : mainAudioVolume;
        mainSource.connect(mainGain);
        mainGain.connect(dest);
        mainGain.connect(audioCtx.destination);
      } catch (e) {}

      // Background audio source (if attached)
      if (bgAudioRef.current && bgAudioUrl) {
        try {
          const bgSource = audioCtx.createMediaElementSource(bgAudioRef.current);
          const bgGain = audioCtx.createGain();
          bgGain.gain.value = bgAudioVolume;
          bgSource.connect(bgGain);
          bgGain.connect(dest);
          bgGain.connect(audioCtx.destination);
        } catch (e) {}
      }

      // Canvas capture stream
      const canvasStream = (canvas as any).captureStream ? (canvas as any).captureStream(60) : null;
      const combinedStream = new MediaStream([
        ...(canvasStream ? canvasStream.getVideoTracks() : []),
        ...dest.stream.getAudioTracks()
      ]);

      const mimeType = getSupportedVideoMimeType(selectedFormat === 'mp4' ? 'mp4' : 'webm');
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: selectedResolution === '4k' ? 16000000 : 8000000
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        setProgressPercent(100);
        onSave(finalBlob, finalFileName);
        downloadSidecars();
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        setIsProcessing(false);
      };

      // Seek video to startTime and start drawing loop
      video.pause();
      video.currentTime = startTime;
      await new Promise(r => { video.onseeked = () => r(true); });

      recorder.start(500);
      video.playbackRate = playbackSpeed;
      video.play();
      if (bgAudioRef.current && bgAudioUrl) {
        bgAudioRef.current.currentTime = 0;
        bgAudioRef.current.play().catch(() => {});
      }

      let renderActive = true;
      const drawFrame = () => {
        if (!renderActive) return;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetW, targetH);

        // Aspect-ratio preserving cover-crop draw
        const natW = video.videoWidth || targetW;
        const natH = video.videoHeight || targetH;
        const imgRatio = natW / natH;
        const targetRatio = targetW / targetH;
        let sx = 0, sy = 0, sWidth = natW, sHeight = natH;

        if (imgRatio > targetRatio) {
          sWidth = natH * targetRatio;
          sx = (natW - sWidth) / 2;
        } else {
          sHeight = natW / targetRatio;
          sy = (natH - sHeight) / 2;
        }

        // Apply filter
        ctx.filter = getFilterStyle();
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
        ctx.filter = 'none';

        // Draw Text Overlay
        if (overlayText.trim()) {
          ctx.save();
          ctx.fillStyle = textColor;
          ctx.font = `bold ${textSize * (targetW / 1920)}px "Space Grotesk", sans-serif`;
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 10;

          let textY = targetH - 80;
          if (textPosition === 'top') textY = 120;
          if (textPosition === 'center') textY = targetH / 2;

          ctx.fillText(overlayText, targetW / 2, textY);
          ctx.restore();
        }

        requestAnimationFrame(drawFrame);
      };

      drawFrame();

      const durationMs = ((endTime - startTime) / playbackSpeed) * 1000;
      setTimeout(() => {
        renderActive = false;
        video.pause();
        if (bgAudioRef.current) bgAudioRef.current.pause();
        recorder.stop();
        if (audioCtx.state !== 'closed') audioCtx.close().catch(() => {});
      }, durationMs);

    } catch (err) {
      console.warn('Canvas export fallback, saving original container:', err);
      onSave(videoBlob, finalFileName);
      downloadSidecars();
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 text-slate-100 font-sans select-none">
      
      {/* Hidden secondary video and audio elements for mixing */}
      {secondaryVideoUrl && (
        <video ref={secondaryVideoRef} src={secondaryVideoUrl} playsInline className="hidden" />
      )}
      {bgAudioUrl && (
        <audio ref={bgAudioRef} src={bgAudioUrl} loop className="hidden" />
      )}

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[96vh] overflow-y-auto">
        
        {/* CapCut Studio Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 via-teal-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-base sm:text-lg text-slate-100">
                  CapCut-Grade Pro Video Editor & Exporter
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  DIRECT & PACKAGE EXPORT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Trim clips, mix background music, add captions, apply filters, and export to MP4, MP3, 4K with complete writeup & meta tags.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="my-3 relative rounded-2xl overflow-hidden bg-black flex items-center justify-center aspect-video max-h-[40vh] border border-slate-800 shadow-inner">
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-contain"
            playsInline
          />

          {/* Live Preview Text Overlay */}
          {overlayText.trim() && (
            <div 
              className={`absolute left-0 right-0 text-center px-4 font-black pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                textPosition === 'top' ? 'top-6' : textPosition === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-6'
              }`}
              style={{ color: textColor, fontSize: `${Math.min(textSize, 28)}px` }}
            >
              {overlayText}
            </div>
          )}

          {/* Play/Pause Button Overlay */}
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all border border-white/20 backdrop-blur-md"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        </div>

        {/* CapCut Tools Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-3 overflow-x-auto scrollbar-none gap-1">
          <button
            onClick={() => setActiveTab('format')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'format' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Format & Export Preset</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'metadata' ? 'border-amber-400 text-amber-400 bg-amber-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            <span>Write-Up & Meta Tags</span>
          </button>

          <button
            onClick={() => setActiveTab('trim')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'trim' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Cut & Trim Range</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'audio' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Background Music & Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'text' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text & Captions</span>
          </button>

          <button
            onClick={() => setActiveTab('filter')}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'filter' ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Color Filters & Speed</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4">
          
          {/* TAB 1: Multi-Format Export Selection & File Name */}
          {activeTab === 'format' && (
            <div className="space-y-4">
              
              {/* Custom File Name Input */}
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                  <span>Custom File Name (Personalize Your Video Title):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => {
                      setVideoTitle(e.target.value);
                      setFileName(sanitizeFileName(e.target.value));
                    }}
                    placeholder="Enter your video title (e.g. Debzane_Leadership_Speech)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                  <span className="px-3 py-2 bg-slate-800 rounded-xl text-amber-300 font-mono text-xs font-bold border border-slate-700">
                    .{selectedFormat}
                  </span>
                </div>
              </div>

              {/* Format Buttons */}
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5">
                  Choose Output File Format:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* MP4 */}
                  <button
                    onClick={() => setSelectedFormat('mp4')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'mp4'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">MP4 Video</span>
                      <FileVideo className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Universal format for iPhone, iPad, Mac, Windows, Android, TikTok & Instagram.
                    </p>
                  </button>

                  {/* WebM */}
                  <button
                    onClick={() => setSelectedFormat('webm')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'webm'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">WebM Video</span>
                      <Film className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Ultra-lightweight web compression standard with instant streaming.
                    </p>
                  </button>

                  {/* MP3 Audio */}
                  <button
                    onClick={() => setSelectedFormat('mp3')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'mp3'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">MP3 Audio</span>
                      <FileAudio className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Extract voiceover & sound only for podcasts, Spotify & voice notes.
                    </p>
                  </button>

                  {/* WAV Audio */}
                  <button
                    onClick={() => setSelectedFormat('wav')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedFormat === 'wav'
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-sm">WAV Studio</span>
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      16-bit uncompressed lossless master audio recording.
                    </p>
                  </button>

                </div>
              </div>

              {/* Resolution Presets (For Video) */}
              {(selectedFormat === 'mp4' || selectedFormat === 'webm') && (
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1.5">
                    Resolution & Quality:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['1080p', '4k', '720p'] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                          selectedResolution === res
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {res === '4k' ? '4K Ultra HD (2160p)' : res === '1080p' ? 'Full HD (1080p) ★ Recommended' : 'Standard HD (720p)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sidecar Metadata Bundle Options */}
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Sidecar Metadata & Subtitle Packaging:</span>
                  </span>
                  <button
                    onClick={() => setActiveTab('metadata')}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Edit Write-Up & Tags →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeMetaSidecar}
                      onChange={(e) => setIncludeMetaSidecar(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 font-medium">Social Description (<strong>.txt</strong>)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeVttSubtitles}
                      onChange={(e) => setIncludeVttSubtitles(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 font-medium">Subtitles Captions (<strong>.vtt</strong>)</span>
                  </label>

                  <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={includeJsonMeta}
                      onChange={(e) => setIncludeJsonMeta(e.target.checked)}
                      className="accent-amber-400 w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 font-medium">Video Schema (<strong>.json</strong>)</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Write-Up & Meta Tags Management */}
          {activeTab === 'metadata' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>Video Title, Description & Social Write-Up:</span>
                </span>

                <button
                  onClick={handleCopyMeta}
                  className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  {copiedMeta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMeta ? 'Copied to Clipboard!' : 'Copy Social Meta'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Left: Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Video Title:
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Title of this production..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Synopsis / Description:
                    </label>
                    <textarea
                      rows={2}
                      value={videoDescription}
                      onChange={(e) => setTakeDescription(e.target.value)}
                      placeholder="Summary of what this video discusses..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Meta Tags & Hashtags (Comma Separated):
                    </label>
                    <input
                      type="text"
                      value={tagsString}
                      onChange={(e) => setTagsString(e.target.value)}
                      placeholder="DebzaneConcepts, Teleprompter, PublicSpeaking"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Right: Teleprompter Speech Write-Up */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Teleprompter Speech Write-Up (Transcript):</span>
                    <span className="text-[10px] text-slate-400 font-normal">Used for .vtt subtitles</span>
                  </label>
                  <textarea
                    rows={8}
                    value={scriptWriteup}
                    onChange={(e) => setScriptWriteup(e.target.value)}
                    placeholder="Full speech text read during the recording..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Cut & Trim Timeline */}
          {activeTab === 'trim' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Scissors className="w-4 h-4" />
                  <span>Timeline Cut Handles:</span>
                </span>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Current:</span>
                  <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Trim Start (Cut Intro Mistakes):</span>
                  <span className="font-mono text-cyan-400 font-bold">{formatSeconds(startTime)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), endTime - 0.5);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Trim End (Cut Outro):</span>
                  <span className="font-mono text-cyan-400 font-bold">{formatSeconds(endTime)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), startTime + 0.5);
                    setEndTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>Final Trimmed Length: <strong className="text-emerald-400">{formatSeconds(Math.max(0, endTime - startTime))}</strong></span>
                <button
                  onClick={() => {
                    setStartTime(0);
                    setEndTime(duration);
                    if (videoRef.current) videoRef.current.currentTime = 0;
                  }}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Cut Handles</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Background Audio Mixing */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Add Background Music Track (BGM):</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl cursor-pointer text-center font-bold text-xs">
                    <span>{bgAudioName ? `Selected: ${bgAudioName}` : 'Upload Background Music (.mp3 / .wav)'}</span>
                    <input type="file" accept="audio/*" onChange={handleBgAudioUpload} className="hidden" />
                  </label>
                  {bgAudioUrl && (
                    <button
                      onClick={() => { setBgAudioUrl(''); setBgAudioName(''); }}
                      className="px-3 py-2 bg-red-950 text-red-400 rounded-xl border border-red-800 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Volume Balancing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Original Voice Volume:</span>
                    <span className="font-mono text-cyan-400">{Math.round(mainAudioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={mainAudioVolume}
                    onChange={(e) => setMainAudioVolume(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Background Music Volume (Ducking):</span>
                    <span className="font-mono text-amber-400">{Math.round(bgAudioVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={bgAudioVolume}
                    onChange={(e) => setBgAudioVolume(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Text Overlay & Captions */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1">Overlay Caption Text:</label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Enter video title, call-to-action, or subtitle text..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Position:</label>
                  <select
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                  >
                    <option value="bottom">Bottom Lower-Third</option>
                    <option value="center">Center Screen</option>
                    <option value="top">Top Header</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Font Size ({textSize}px):</label>
                  <input
                    type="range"
                    min={18}
                    max={64}
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg mt-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Text Color:</label>
                  <div className="flex items-center gap-2 mt-1">
                    {['#ffffff', '#facc15', '#38bdf8', '#4ade80', '#f43f5e'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setTextColor(col)}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: col,
                          borderColor: textColor === col ? '#ffffff' : 'transparent'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Color Filters & Playback Speed */}
          {activeTab === 'filter' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5">Apply Post-Production Color Grading:</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'none', label: 'Original' },
                    { id: 'beauty', label: '✨ Beauty Glow' },
                    { id: 'cinematic', label: '🎬 Cinematic' },
                    { id: 'matrix', label: '🟩 Matrix Cyber' },
                    { id: 'monochrome', label: 'Noir Black & White' },
                    { id: 'vibrant', label: '🌈 Vibrant Boost' },
                    { id: 'sepia', label: '🎞️ Vintage Sepia' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPostFilter(f.id as VideoFilter)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        postFilter === f.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold text-xs mb-1.5">Playback & Export Speed:</label>
                <div className="flex items-center gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all ${
                        playbackSpeed === spd
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-1 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-black hover:brightness-110 shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2 text-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting Clean Package ({selectedFormat.toUpperCase()})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save & Export Clean Package ({selectedFormat.toUpperCase()} • {selectedResolution})</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
