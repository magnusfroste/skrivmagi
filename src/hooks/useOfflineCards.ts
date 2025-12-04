import { useState, useEffect } from 'react';
import { StoryCard } from '@/hooks/useStoryCards';

const CARDS_STORAGE_KEY = 'skrivmagi_offline_cards';
const CARDS_TIMESTAMP_KEY = 'skrivmagi_offline_cards_timestamp';

export function useOfflineCards() {
  const [cachedCards, setCachedCards] = useState<StoryCard[]>([]);
  const [lastCached, setLastCached] = useState<Date | null>(null);

  // Load cached cards on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CARDS_STORAGE_KEY);
      const timestamp = localStorage.getItem(CARDS_TIMESTAMP_KEY);
      
      if (stored) {
        setCachedCards(JSON.parse(stored));
      }
      if (timestamp) {
        setLastCached(new Date(timestamp));
      }
    } catch (error) {
      console.error('Failed to load cached cards:', error);
    }
  }, []);

  // Cache cards
  const cacheCards = (cards: StoryCard[]) => {
    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
      localStorage.setItem(CARDS_TIMESTAMP_KEY, new Date().toISOString());
      setCachedCards(cards);
      setLastCached(new Date());
    } catch (error) {
      console.error('Failed to cache cards:', error);
    }
  };

  // Get cached cards (fallback when offline)
  const getCachedCards = (): StoryCard[] => {
    return cachedCards;
  };

  // Check if cache is stale (older than 1 hour)
  const isCacheStale = (): boolean => {
    if (!lastCached) return true;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - lastCached.getTime() > oneHour;
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem(CARDS_STORAGE_KEY);
      localStorage.removeItem(CARDS_TIMESTAMP_KEY);
      setCachedCards([]);
      setLastCached(null);
    } catch (error) {
      console.error('Failed to clear card cache:', error);
    }
  };

  return {
    cachedCards,
    lastCached,
    cacheCards,
    getCachedCards,
    isCacheStale,
    clearCache,
  };
}
