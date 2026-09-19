import { useState, useEffect } from 'react';
import { Script } from '../types';

const STORAGE_KEY = 'debzane_teleprompter_scripts';

const DEFAULT_SAMPLE_SCRIPTS: Script[] = [
  {
    id: 'welcome-demo',
    title: '🌟 Welcome to Debzane Concept Teleprompter',
    category: 'Welcome & Guide',
    content: `Welcome to the Debzane Concept Teleprompter!

This professional studio teleprompter is built by Sylvester Oga Ogaji and powered by JV Impact Initiative for Debzane Concepts.

Features included in this 100% free tool:
• Ultra-smooth hardware-accelerated auto scrolling
• Complete Mirror mode for glass beam splitters & inverted rigs
• Bluetooth clicker & foot pedal shortcuts (Space to Pause, Up/Down for speed)
• Offline first: Your scripts are stored right in your device
• Screen Wake-Lock: Your display stays active while recording

To begin:
1. Adjust your desired font size and speed below.
2. Press Spacebar or tap Play.
3. You can mirror horizontally or vertically at any time.

Thank you for supporting free creator tools! Leave a review or support our mission if you love this product.`,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
    favorite: true
  },
  {
    id: 'wellness-script',
    title: '🌿 Debzane Wellness Coach — Living Fresh & Fit',
    category: 'Wellness & Health',
    content: `Hello beautiful people, welcome back to Debzane Concepts! 

Today on Fresh and Fit, we are exploring simple daily habits that transform your energy, nourish your mind, and restore your inner balance.

Remember, true wellness isn't about perfection; it's about consistency, nourishing your body with vitality, and staying committed to your personal growth.

Take a deep breath with me right now. Inhale confidence, exhale all doubts. Let's step into today's session with power!`,
    createdAt: Date.now() - 7200000,
    updatedAt: Date.now() - 7200000,
    favorite: true
  },
  {
    id: 'youtube-intro',
    title: '🎥 YouTube Creator Hook & Intro',
    category: 'Video Production',
    content: `Hey everyone, welcome back to Debzane Concepts! If you're new here, my name is Debzane, and in today's video we are breaking down everything you need to know about scaling your creative vision.

Before we dive in, make sure to hit that subscribe button, turn on the bell notification, and drop a comment below letting me know where you are watching from.

Let's get straight into point number one!`,
    createdAt: Date.now() - 10800000,
    updatedAt: Date.now() - 10800000,
    favorite: false
  }
];

export function useScriptStorage() {
  const [scripts, setScripts] = useState<Script[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading scripts from storage:', e);
    }
    return DEFAULT_SAMPLE_SCRIPTS;
  });

  const [activeScriptId, setActiveScriptId] = useState<string>(() => {
    return scripts[0]?.id || '';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scripts));
    } catch (e) {
      console.error('Error saving scripts to storage:', e);
    }
  }, [scripts]);

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0] || null;

  const saveScript = (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = Date.now();
    if (script.id) {
      // Update existing
      setScripts(prev => prev.map(s => s.id === script.id ? { ...s, ...script, updatedAt: now } : s));
      return script.id;
    } else {
      // Create new
      const newId = 'script_' + Math.random().toString(36).substr(2, 9);
      const newScript: Script = {
        ...script,
        id: newId,
        createdAt: now,
        updatedAt: now,
        favorite: false
      };
      setScripts(prev => [newScript, ...prev]);
      setActiveScriptId(newId);
      return newId;
    }
  };

  const deleteScript = (id: string) => {
    setScripts(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeScriptId === id) {
        setActiveScriptId(filtered[0]?.id || '');
      }
      return filtered;
    });
  };

  const toggleFavorite = (id: string) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s));
  };

  return {
    scripts,
    activeScript,
    activeScriptId,
    setActiveScriptId,
    saveScript,
    deleteScript,
    toggleFavorite,
    setScripts
  };
}
