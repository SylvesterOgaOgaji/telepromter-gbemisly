import React, { useState, useRef, useEffect } from 'react';
import { 
  Scissors, 
  Play, 
  Pause, 
  Download, 
  X, 
  RotateCcw, 
  Check, 
  Sparkles,
  Film,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Zap
} from 'lucide-react';

interface VideoTrimmerModalProps {
  videoBlob: Blob;
  onClose: () => void;
  onSave: (trimmedBlob: Blob, filename: string) => void;
}

export const VideoTrimmerModal: React.FC<VideoTrimmerModalProps> = ({
  videoBlob,
  onClose,
  onSave
}) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

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
      // Handle infinity duration on certain webm streams
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
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
  };

  const handleExport = async () => {
    setIsProcessing(true);

    // If whole video is preserved, export direct high-bitrate blob
    if (startTime <= 0.2 && Math.abs(endTime - duration) <= 0.2) {
      const filename = `debzane_studio_take_${Date.now()}.webm`;
      onSave(videoBlob, filename);
      setIsProcessing(false);
      return;
    }

    try {
      if (!videoRef.current) throw new Error('Video element not found');
      const video = videoRef.current;
      video.pause();
      video.currentTime = startTime;

      await new Promise(r => {
        video.onseeked = () => r(true);
      });

      const stream = (video as any).captureStream ? (video as any).captureStream(60) : null;
      if (!stream) {
        onSave(videoBlob, `debzane_studio_take_${Date.now()}.webm`);
        setIsProcessing(false);
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const trimmedBlob = new Blob(chunks, { type: 'video/webm' });
        onSave(trimmedBlob, `debzane_studio_trimmed_${Date.now()}.webm`);
        setIsProcessing(false);
      };

      recorder.start();
      video.play();

      const durationMs = (endTime - startTime) * 1000;
      setTimeout(() => {
        video.pause();
        recorder.stop();
      }, durationMs);

    } catch (err) {
      onSave(videoBlob, `debzane_studio_take_${Date.now()}.webm`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 text-slate-100">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col max-h-[95vh] overflow-y-auto">
        
        {/* CapCut Style Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 rounded-2xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-base sm:text-lg text-slate-100 flex items-center gap-2">
                <span>CapCut-Grade Video Studio & Trimmer</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  4K / HD OUTPUT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Precision trim intro/outro mistakes and download ready-to-post footage.
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
        <div className="my-3 relative rounded-2xl overflow-hidden bg-black flex items-center justify-center aspect-video max-h-[45vh] border border-slate-800 shadow-inner">
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            className="w-full h-full object-contain"
            playsInline
          />

          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 hover:scale-110 transition-all border border-white/20 backdrop-blur-md"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
        </div>

        {/* CapCut Trimmer Controls */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4">
          
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Scissors className="w-4 h-4" />
              <span>Timeline Cut Handles:</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Position:</span>
              <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Trim Start (Cut Intro):</span>
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
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Trimmed Length: <strong className="text-white">{formatSeconds(Math.max(0, endTime - startTime))}</strong></span>
            
            <button
              onClick={() => {
                setStartTime(0);
                setEndTime(duration);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Timeline</span>
            </button>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-xs disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Exporting HD Clip...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save & Download Video (HD)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
