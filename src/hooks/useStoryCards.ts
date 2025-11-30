import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoryCard {
  id: string;
  kategori: 'karaktar' | 'plats' | 'tid' | 'kansla' | 'problem';
  text: string;
  bild_prompt: string;
  niva: number;
}

export function useStoryCards() {
  const [cards, setCards] = useState<StoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCards() {
      const { data, error } = await supabase
        .from('kort')
        .select('*')
        .order('kategori');

      if (error) {
        setError(error.message);
      } else {
        setCards(data as StoryCard[]);
      }
      setLoading(false);
    }

    fetchCards();
  }, []);

  const cardsByCategory = cards.reduce((acc, card) => {
    if (!acc[card.kategori]) {
      acc[card.kategori] = [];
    }
    acc[card.kategori].push(card);
    return acc;
  }, {} as Record<string, StoryCard[]>);

  return { cards, cardsByCategory, loading, error };
}
