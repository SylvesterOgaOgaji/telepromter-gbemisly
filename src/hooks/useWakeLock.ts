import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Screen WakeLock hook to prevent screen timeout during recording
 */
export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!isSupported || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      setIsLocked(true);
      wakeLockRef.current.addEventListener('release', () => {
        setIsLocked(false);
      });
    } catch (err) {
      console.warn('WakeLock request error:', err);
      setIsLocked(false);
    }
  }, [isSupported]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn('WakeLock release error:', err);
      }
    }
    setIsLocked(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [enabled, requestWakeLock, releaseWakeLock]);

  return { isSupported, isLocked, requestWakeLock, releaseWakeLock };
}
