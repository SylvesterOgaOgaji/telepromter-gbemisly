import React, { useState, useEffect, useRef } from 'react';
import { 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Eye, 
  Sun, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Check, 
  Sparkles,
  HelpCircle,
  Play,
  Square,
  Move
} from 'lucide-react';

interface AccessibilityFloatingProps {
  currentText?: string;
  onAnnounce?: (msg: string) => void;
}

export const AccessibilityFloating: React.FC<AccessibilityFloatingProps> = ({ currentText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voiceAssistance, setVoiceAssistance] = useState(false);

  // Position state for movable draggable accessibility button
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const hasMovedRef = useRef(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Initialize position to top-right on mount
  useEffect(() => {
    const initialX = Math.max(16, window.innerWidth - 180);
    const initialY = 80;
    setPosition({ x: initialX, y: initialY });
  }, []);

  // Global mouse & touch move / up listeners for smooth dragging
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - dragStartRef.current.startX;
      const dy = clientY - dragStartRef.current.startY;

      if (Math.hypot(dx, dy) > 4) {
        hasMovedRef.current = true;
      }

      const buttonWidth = buttonRef.current?.offsetWidth || 150;
      const buttonHeight = buttonRef.current?.offsetHeight || 44;

      const newX = Math.min(Math.max(8, dragStartRef.current.posX + dx), window.innerWidth - buttonWidth - 8);
      const newY = Math.min(Math.max(8, dragStartRef.current.posY + dy), window.innerHeight - buttonHeight - 8);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  const handleStartDrag = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      posX: position?.x || (window.innerWidth - 180),
      posY: position?.y || 80
    };
  };

  // Apply High Contrast mode globally
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('accessibility-high-contrast');
    } else {
      document.documentElement.classList.remove('accessibility-high-contrast');
    }
  }, [highContrast]);

  // Apply Large Text scale globally
  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add('accessibility-large-text');
    } else {
      document.documentElement.classList.remove('accessibility-large-text');
    }
  }, [largeText]);

  // Text to Speech engine for visually impaired / blind users
  const toggleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isReadingAloud) {
      window.speechSynthesis.cancel();
      setIsReadingAloud(false);
    } else {
      const textToRead = currentText?.trim() || 'Debzane Concept Teleprompter is ready. Select or paste a script to begin.';
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = speechRate;
      utterance.onend = () => setIsReadingAloud(false);
      utterance.onerror = () => setIsReadingAloud(false);
      
      window.speechSynthesis.cancel(); // Reset queue
      window.speechSynthesis.speak(utterance);
      setIsReadingAloud(true);
    }
  };

  const playVoiceAnnouncement = (text: string) => {
    if ('speechSynthesis' in window && voiceAssistance) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Draggable Floating Accessibility Badge */}
      <div 
        ref={buttonRef}
        style={{
          position: 'fixed',
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : '80px',
          right: position ? undefined : '16px',
          zIndex: 50,
          touchAction: 'none'
        }}
        className="flex items-center select-none cursor-move"
        onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
      >
        <button
          onClick={() => {
            if (!hasMovedRef.current) {
              setIsOpen(!isOpen);
              playVoiceAnnouncement('Accessibility menu toggled');
            }
          }}
          className="group relative flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-extrabold text-xs rounded-full shadow-2xl border-2 border-white/80 transition-transform active:scale-95 shadow-red-600/40"
          title="Drag to move anywhere • Click to open Accessibility Options"
        >
          <Move className="w-3 h-3 opacity-70 group-hover:opacity-100" />
          <Accessibility className="w-4 h-4 animate-spin-slow text-white" />
          <span className="tracking-wide">ACCESSIBILITY</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1"></span>
        </button>
      </div>

      {/* Floating Accessibility Controls Drawer */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            left: position ? `${Math.min(Math.max(12, position.x - 140), window.innerWidth - 340)}px` : undefined,
            top: position ? `${Math.min(position.y + 50, window.innerHeight - 440)}px` : '120px',
            right: position ? undefined : '16px',
            zIndex: 60
          }}
          className="w-80 sm:w-88 max-h-[85vh] overflow-y-auto bg-slate-950/98 border-2 border-red-500/60 rounded-3xl p-5 shadow-2xl shadow-black backdrop-blur-2xl text-slate-100 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-600 text-white rounded-xl">
                <Accessibility className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-sm text-white">
                  Accessibility & Assistive Tools
                </h3>
                <p className="text-[10px] text-amber-300">
                  For Eyes, Ears, Motion & Speech
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            
            {/* 1. Ear Assistance: Read Aloud (Screen Reader) */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Read Script Aloud (Audio)</span>
                </span>
                <button
                  onClick={toggleTextToSpeech}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                    isReadingAloud
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow'
                  }`}
                >
                  {isReadingAloud ? (
                    <>
                      <Square className="w-3 h-3 fill-white" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-slate-950" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Listens to speech text for visually impaired creators or speech preparation.
              </p>
            </div>

            {/* 2. Eye Assistance: Super High Contrast */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold block text-slate-200">Super High Contrast</span>
                  <span className="text-[10px] text-slate-400">Pure Black & Vivid Gold</span>
                </div>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  highContrast ? 'bg-amber-400' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Eye Assistance: Magnified UI Text Size */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-debzane-blue-400" />
                <div>
                  <span className="font-bold block text-slate-200">Magnify App Elements</span>
                  <span className="text-[10px] text-slate-400">Larger touch targets & fonts</span>
                </div>
              </div>
              <button
                onClick={() => setLargeText(!largeText)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  largeText ? 'bg-debzane-blue-400' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    largeText ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Voice Announcements on interaction */}
            <div className="flex items-center justify-between p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="font-bold block text-slate-200">Voice Assistance</span>
                  <span className="text-[10px] text-slate-400">Audio spoken cues</span>
                </div>
              </div>
              <button
                onClick={() => setVoiceAssistance(!voiceAssistance)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  voiceAssistance ? 'bg-purple-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    voiceAssistance ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Debzane Inclusive Studio</span>
            <button
              onClick={() => {
                setHighContrast(false);
                setLargeText(false);
                setVoiceAssistance(false);
                if (isReadingAloud) {
                  window.speechSynthesis.cancel();
                  setIsReadingAloud(false);
                }
              }}
              className="text-amber-400 hover:underline"
            >
              Reset All
            </button>
          </div>

        </div>
      )}
    </>
  );
};
