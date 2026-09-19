import { useState, useEffect } from 'react';
import { PrompterSettings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'debzain_teleprompter_settings';

export function useSettings() {
  const [settings, setSettings] = useState<PrompterSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [settings]);

  const updateSetting = <K extends keyof PrompterSettings>(key: K, value: PrompterSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, setSettings, updateSetting, resetSettings };
}
