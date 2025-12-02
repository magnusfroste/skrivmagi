import { useState, useEffect, useCallback } from 'react';

const OFFLINE_STORAGE_KEY = 'skrivmagi_offline_sagor';

interface OfflineSaga {
  id: string;
  title: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  lage: string;
  lastModified: number;
  needsSync: boolean;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineSagor, setOfflineSagor] = useState<OfflineSaga[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline sagor on mount
  useEffect(() => {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (stored) {
      try {
        setOfflineSagor(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse offline sagor:', e);
      }
    }
  }, []);

  // Save saga to offline storage
  const saveOffline = useCallback((saga: Omit<OfflineSaga, 'lastModified' | 'needsSync'>) => {
    setOfflineSagor(prev => {
      const existingIndex = prev.findIndex(s => s.id === saga.id);
      const newSaga: OfflineSaga = {
        ...saga,
        lastModified: Date.now(),
        needsSync: !navigator.onLine,
      };

      let updated: OfflineSaga[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = newSaga;
      } else {
        updated = [...prev, newSaga];
      }

      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get offline saga by ID
  const getOfflineSaga = useCallback((id: string): OfflineSaga | undefined => {
    return offlineSagor.find(s => s.id === id);
  }, [offlineSagor]);

  // Mark saga as synced
  const markAsSynced = useCallback((id: string) => {
    setOfflineSagor(prev => {
      const updated = prev.map(s => 
        s.id === id ? { ...s, needsSync: false } : s
      );
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get all sagor that need syncing
  const getSagasNeedingSync = useCallback((): OfflineSaga[] => {
    return offlineSagor.filter(s => s.needsSync);
  }, [offlineSagor]);

  // Remove from offline storage
  const removeOffline = useCallback((id: string) => {
    setOfflineSagor(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    isOnline,
    offlineSagor,
    saveOffline,
    getOfflineSaga,
    markAsSynced,
    getSagasNeedingSync,
    removeOffline,
  };
}
