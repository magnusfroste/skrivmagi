import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Saga {
  id: string;
  title: string;
  student_id: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  bild_inledning: string | null;
  bild_huvuddel: string | null;
  bild_avslutning: string | null;
  audio_elevenlabs_url: string | null;
  audio_elevens_egen_url: string | null;
  status: 'draft' | 'finished';
  lage: string;
  teacher_comment: string | null;
  created_at: string;
  updated_at: string;
}

export function useSaga() {
  const { user } = useAuth();
  const [saga, setSaga] = useState<Saga | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const createSaga = useCallback(async (lage: string) => {
    if (!user) return null;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('sagor')
      .insert({
        student_id: user.id,
        lage,
        title: 'Min nya saga'
      })
      .select()
      .single();

    if (error) {
      toast.error('Kunde inte skapa saga');
      setLoading(false);
      return null;
    }

    setSaga(data as Saga);
    setLoading(false);
    return data as Saga;
  }, [user]);

  const updateSaga = useCallback(async (updates: Partial<Saga>) => {
    if (!saga) return;
    
    // Optimistic update - update UI immediately
    const previousSaga = saga;
    setSaga(prev => prev ? { ...prev, ...updates } : null);
    
    setSaving(true);
    const { error } = await supabase
      .from('sagor')
      .update(updates)
      .eq('id', saga.id);

    setSaving(false);

    if (error) {
      // Rollback on error
      setSaga(previousSaga);
      toast.error('Kunde inte spara ändringar');
      return false;
    }
    
    return true;
  }, [saga]);

  const loadSaga = useCallback(async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sagor')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Kunde inte ladda sagan');
    } else {
      setSaga(data as Saga);
    }
    setLoading(false);
  }, []);

  return { saga, setSaga, loading, saving, createSaga, updateSaga, loadSaga };
}
