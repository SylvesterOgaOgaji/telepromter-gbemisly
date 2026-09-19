import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Script } from '../types';
import { 
  Play, 
  Plus, 
  Trash2, 
  Star, 
  Upload, 
  Download, 
  FileText, 
  Clock, 
  AlignLeft, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  Award, 
  ClipboardPaste,
  Bold,
  Italic,
  Highlighter,
  List,
  Sparkle
} from 'lucide-react';

interface ScriptEditorProps {
  scripts: Script[];
  activeScript: Script | null;
  activeScriptId: string;
  onSelectScript: (id: string) => void;
  onSaveScript: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  onDeleteScript: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onLaunchPrompter: () => void;
  onOpenOwnerProfile: () => void;
}

interface FloatingToolbarPos {
  x: number;
  y: number;
  visible: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  scripts,
  activeScript,
  activeScriptId,
  onSelectScript,
  onSaveScript,
  onDeleteScript,
  onToggleFavorite,
  onLaunchPrompter,
  onOpenOwnerProfile
}) => {
  const [title, setTitle] = useState(activeScript?.title || '');
  const [content, setContent] = useState(activeScript?.content || '');
  const [category, setCategory] = useState(activeScript?.category || 'General');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Mobile Tab View: 'library' or 'editor'
  const [mobileTab, setMobileTab] = useState<'library' | 'editor'>('editor');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Floating MS Word style inline context toolbar
  const [floatingToolbar, setFloatingToolbar] = useState<FloatingToolbarPos>({
    x: 0,
    y: 0,
    visible: false
  });

  // Sync state when active script changes
  useEffect(() => {
    if (activeScript) {
      setTitle(activeScript.title);
      setContent(activeScript.content);
      setCategory(activeScript.category || 'General');
    } else {
      setTitle('');
      setContent('');
      setCategory('General');
    }
  }, [activeScript?.id]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (activeScript) {
      onSaveScript({ id: activeScript.id, title: newTitle, content, category, favorite: activeScript.favorite });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (activeScript) {
      onSaveScript({ id: activeScript.id, title, content: newContent, category, favorite: activeScript.favorite });
    }
  };

  const handleCreateNew = () => {
    const newTitle = 'Untitled Script ' + (scripts.length + 1);
    const newContent = '';
    const newId = onSaveScript({ title: newTitle, content: newContent, category: 'General' });
    onSelectScript(newId);
    setMobileTab('editor');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleSelectScriptAndOpen = (id: string) => {
    onSelectScript(id);
    setMobileTab('editor');
  };

  // MS Word style Floating Toolbar on Text Selection or Right-Click / Tap
  const updateFloatingToolbarPosition = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If text is highlighted / selected
    if (start !== end && end > start) {
      const rect = textarea.getBoundingClientRect();
      // Calculate approximate position inside textarea
      const lineIndex = content.substr(0, start).split('\n').length;
      const topOffset = Math.min(rect.height - 60, Math.max(10, lineIndex * 24 - textarea.scrollTop + 10));

      setFloatingToolbar({
        x: Math.min(window.innerWidth - 280, Math.max(20, rect.left + 20)),
        y: Math.max(60, rect.top + topOffset - 45),
        visible: true
      });
    } else {
      // Hide toolbar if no text selected
      setFloatingToolbar(prev => ({ ...prev, visible: false }));
    }
  }, [content]);

  // Context Menu Handler (Right Click or Long Press on cursor point)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setFloatingToolbar({
      x: Math.min(window.innerWidth - 300, Math.max(10, e.clientX - 60)),
      y: Math.max(60, e.clientY - 50),
      visible: true
    });
  };

  // Text formatting tools for accessibility and emphasis
  const applyFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let replacement = '';
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}ENTER TEXT${suffix}`;
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    handleContentChange(newContent);

    // Hide floating toolbar after applying
    setFloatingToolbar(prev => ({ ...prev, visible: false }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 50);
  };

  const insertCueMarker = () => {
    applyFormatting('\n▶ [PAUSE / BREATHE] ◀\n');
  };

  const insertHighlightCue = () => {
    applyFormatting('⭐ [EMPHASIZE: ', '] ⭐');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const scriptName = file.name.replace(/\.[^/.]+$/, '');
        const newId = onSaveScript({
          title: scriptName,
          content: text,
          category: 'Imported'
        });
        onSelectScript(newId);
        setMobileTab('editor');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportText = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[/\\?%*:|"<>]/g, '_') || 'script'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const newText = content ? `${content}\n\n${text}` : text;
        handleContentChange(newText);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  // Metrics (Unlimited support)
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characters = content.length;
  const estimatedSeconds = Math.ceil(words / 2.5);
  const estMinutes = Math.floor(estimatedSeconds / 60);
  const estSecs = estimatedSeconds % 60;

  const filteredScripts = scripts.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 relative">
      
      {/* MS Word Style Floating Context Toolbar on Selection or Cursor Position */}
      {floatingToolbar.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${floatingToolbar.x}px`,
            top: `${floatingToolbar.y}px`,
            zIndex: 60
          }}
          className="flex items-center gap-1 p-1.5 bg-slate-950/98 border-2 border-amber-400 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in zoom-in-90 duration-150"
        >
          <button
            type="button"
            onClick={() => applyFormatting('**', '**')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-lg border border-slate-800 text-xs flex items-center gap-1 shadow"
            title="Bold Selection"
          >
            <Bold className="w-3.5 h-3.5" />
            <span>Bold</span>
          </button>

          <button
            type="button"
            onClick={() => applyFormatting('*', '*')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-debzane-blue-400 font-bold rounded-lg border border-slate-800 text-xs flex items-center gap-1 shadow"
            title="Italic Selection"
          >
            <Italic className="w-3.5 h-3.5" />
            <span>Italic</span>
          </button>

          <button
            type="button"
            onClick={insertCueMarker}
            className="p-1.5 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg border border-amber-500/30 text-xs flex items-center gap-1"
            title="Insert Pause Cue"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pause</span>
          </button>

          <button
            type="button"
            onClick={insertHighlightCue}
            className="p-1.5 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-bold rounded-lg border border-cyan-500/30 text-xs flex items-center gap-1"
            title="Emphasis Cue"
          >
            <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Emphasis</span>
          </button>

          <button
            type="button"
            onClick={() => applyFormatting('• ')}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-lg border border-slate-800 text-xs flex items-center gap-1"
            title="Bullet Point"
          >
            <span className="text-amber-400 font-bold">•</span>
            <span>Bullet</span>
          </button>

          <button
            type="button"
            onClick={() => setFloatingToolbar(prev => ({ ...prev, visible: false }))}
            className="p-1 text-slate-400 hover:text-white ml-0.5 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Switcher Tab */}
      <div className="flex lg:hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-1 mb-3.5 shadow-lg">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'editor'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Script Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('library')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'library'
              ? 'bg-gradient-to-r from-debzane-blue-500 to-debzane-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Library ({scripts.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Sidebar: Scripts Management & Owner Card */}
        <div className={`lg:col-span-4 flex flex-col gap-3.5 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Debzane Concepts Leader Card */}
          <div 
            onClick={onOpenOwnerProfile}
            className="group cursor-pointer bg-gradient-to-r from-debzane-blue-950/80 to-slate-900/90 border border-debzane-blue-800/60 hover:border-amber-400/60 rounded-2xl p-3.5 shadow-lg flex items-center gap-3.5 transition-all"
          >
            <div className="relative flex-shrink-0">
              <img
                src="/founder.jpg"
                alt="Debzane Leader"
                className="w-12 h-12 rounded-xl object-cover border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow">
                <Award className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                  Debzane Concepts
                </span>
              </div>
              <p className="text-[11px] text-amber-300/90 truncate">
                Oluwagbemisola J. Akinlade-Ogaji
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                <span className="text-debzane-blue-300">Public Health Practitioner</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col min-h-[480px] lg:h-[580px]">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-heading font-bold text-slate-100 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Script Library</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {scripts.length}
                </span>
              </h2>
              <div className="flex items-center gap-1.5">
                <label 
                  className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg cursor-pointer transition-colors"
                  title="Import script (.txt, .md, .json)"
                >
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".txt,.md,.json" onChange={handleFileUpload} className="hidden" />
                </label>
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg shadow-sm shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Scripts List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredScripts.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl text-slate-500">
                  <p className="text-xs">No scripts found</p>
                  <button 
                    onClick={handleCreateNew}
                    className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                  >
                    + Create a new script
                  </button>
                </div>
              ) : (
                filteredScripts.map((item) => {
                  const isActive = item.id === activeScriptId;
                  const itemWordCount = item.content.trim() ? item.content.trim().split(/\s+/).length : 0;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectScriptAndOpen(item.id)}
                      className={`group relative p-3 rounded-xl cursor-pointer border transition-all ${
                        isActive
                          ? 'bg-debzane-blue-950/60 border-amber-400/60 shadow-md shadow-amber-500/5'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm truncate ${isActive ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                            {item.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {item.content || 'Empty script... Click to edit.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(item.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              item.favorite ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
                            }`}
                            title="Favorite"
                          >
                            <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-400' : ''}`} />
                          </button>
                          {scripts.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this script?')) {
                                  onDeleteScript(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{itemWordCount} words</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Active Script Editor & Launch Prompt Button */}
        <div className={`lg:col-span-8 flex flex-col gap-4 ${mobileTab === 'library' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col min-h-[560px] lg:h-[650px]">
            
            {/* Header / Launch Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter script title..."
                  className="w-full text-base sm:text-xl font-bold bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-amber-400/50 pb-0.5 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handlePasteText}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all"
                  title="Paste from Clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Paste</span>
                </button>
                <button
                  onClick={handleCopyText}
                  className="p-2 sm:p-2.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Copy script text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleExportText}
                  className="p-2 sm:p-2.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-colors"
                  title="Export as .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLaunchPrompter}
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 font-heading font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-debzane-blue-400 hover:from-amber-300 hover:to-debzane-blue-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span className="tracking-wide">START PROMPTER</span>
                </button>
              </div>
            </div>

            {/* Accessibility & Rich Formatting Toolbar (Sticky top) */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 py-2 border-b border-slate-800/70 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 hidden sm:inline">Formatting:</span>
              
              <button
                type="button"
                onClick={() => applyFormatting('**', '**')}
                className="p-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1"
                title="Bold Text"
              >
                <Bold className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">Bold</span>
              </button>

              <button
                type="button"
                onClick={() => applyFormatting('*', '*')}
                className="p-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1"
                title="Italic Text"
              >
                <Italic className="w-3.5 h-3.5 text-debzane-blue-400" />
                <span className="text-[11px] italic">Italic</span>
              </button>

              <button
                type="button"
                onClick={insertCueMarker}
                className="p-1.5 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 flex items-center gap-1"
                title="Insert Pause Cue / Stage Direction"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold">Pause Marker</span>
              </button>

              <button
                type="button"
                onClick={insertHighlightCue}
                className="p-1.5 px-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 flex items-center gap-1"
                title="High-Contrast Highlight Cue"
              >
                <Highlighter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-semibold">Emphasis</span>
              </button>

              <button
                type="button"
                onClick={() => applyFormatting('• ')}
                className="p-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-slate-700 flex items-center gap-1"
                title="Bullet Point"
              >
                <span className="text-amber-400 font-bold">•</span>
                <span className="text-[11px]">Bullet</span>
              </button>

              <button
                type="button"
                onClick={() => handleContentChange('')}
                className="ml-auto p-1.5 px-2 text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                title="Clear Text"
              >
                Clear
              </button>
            </div>

            {/* Script Metrics Badge Row */}
            <div className="flex flex-wrap items-center gap-2 py-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
                <AlignLeft className="w-3.5 h-3.5 text-amber-400" />
                <span>{words} words</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
                <Clock className="w-3.5 h-3.5 text-debzane-blue-400" />
                <span>Est: {estMinutes}m {estSecs}s</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 rounded-lg border border-slate-800/80 text-slate-400">
                <span>{characters} chars</span>
              </div>
              <div className="ml-auto text-[10px] text-amber-400/90 font-medium hidden sm:block">
                ⚡ Unlimited length allowed (10+ pages)
              </div>
            </div>

            {/* Script Textarea Content with Selection and Context Menu Listener */}
            <div className="flex-1 mt-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onSelect={updateFloatingToolbarPosition}
                onKeyUp={updateFloatingToolbarPosition}
                onMouseUp={updateFloatingToolbarPosition}
                onTouchEnd={updateFloatingToolbarPosition}
                onContextMenu={handleContextMenu}
                placeholder="Type or paste your video script, sermon, speech, health lecture, or presentation here... (Highlight any text for instant MS Word style formatting tools)"
                className="w-full h-full p-3 sm:p-4 bg-slate-950/90 border border-slate-800/80 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/50 resize-none font-reading text-sm sm:text-base leading-relaxed overflow-y-auto"
              />
            </div>

            {/* Quick Tips Footer */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Tip: Highlight text or right-click anywhere for floating MS Word editing tools.</span>
              </span>
              <span className="text-amber-400/80 font-medium text-[11px]">Debzane Concepts • 100% Free</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
