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
  const [isOnline, setIsOnline] = useState(() => {
    // Safe check for SSR and edge cases
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [offlineSagor, setOfflineSagor] = useState<OfflineSaga[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setOfflineSagor(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse offline sagor:', e);
      // Clear corrupted data
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
    }
  }, []);

  // Save saga to offline storage
  const saveOffline = useCallback((saga: Omit<OfflineSaga, 'lastModified' | 'needsSync'>) => {
    if (typeof window === 'undefined') return;
    
    setOfflineSagor(prev => {
      const existingIndex = prev.findIndex(s => s.id === saga.id);
      const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      
      const newSaga: OfflineSaga = {
        ...saga,
        lastModified: Date.now(),
        needsSync: !isCurrentlyOnline,
      };

      let updated: OfflineSaga[];
      if (existingIndex >= 0) {
        updated = [...prev];
        updated[existingIndex] = newSaga;
      } else {
        updated = [...prev, newSaga];
      }

      try {
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save offline saga:', e);
      }
      
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
      try {
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update synced status:', e);
      }
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
      try {
        localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to remove offline saga:', e);
      }
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
