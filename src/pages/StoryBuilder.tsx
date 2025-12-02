import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSaga } from '@/hooks/useSaga';
import { useStoryCards, StoryCard } from '@/hooks/useStoryCards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardLibrary } from '@/components/story/CardLibrary';
import { StoryZone } from '@/components/story/StoryZone';
import { AICoach } from '@/components/story/AICoach';
import { ArrowLeft, BookOpen, Loader2, Check, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type StoryMode = 'pussel' | 'halv' | 'fritt';
type ZoneType = 'inledning' | 'huvuddel' | 'avslutning';

interface ZoneCards {
  inledning: StoryCard[];
  huvuddel: StoryCard[];
  avslutning: StoryCard[];
}

export default function StoryBuilder() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('lage') as StoryMode) || 'pussel';

  const { saga, createSaga, updateSaga, loadSaga, saving, loading } = useSaga();
  const { cards, loading: cardsLoading } = useStoryCards();

  const [title, setTitle] = useState('Min nya saga');
  const [zoneCards, setZoneCards] = useState<ZoneCards>({
    inledning: [],
    huvuddel: [],
    avslutning: []
  });
  const [texts, setTexts] = useState({
    inledning: '',
    huvuddel: '',
    avslutning: ''
  });
  const [generatingZone, setGeneratingZone] = useState<ZoneType | null>(null);
  const [draggedCard, setDraggedCard] = useState<StoryCard | null>(null);
  const [currentZone, setCurrentZone] = useState<ZoneType | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs to track current values without causing re-renders
  const titleRef = useRef(title);
  const textsRef = useRef(texts);
  const sagaRef = useRef(saga);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    const existingSagaId = searchParams.get('saga');
    if (user && !saga && isInitialLoad) {
      if (existingSagaId) {
        loadSaga(existingSagaId);
      } else {
        createSaga(mode);
      }
    }
  }, [user, saga, createSaga, loadSaga, authLoading, navigate, isInitialLoad]);

  // Update refs when state changes (without triggering auto-save)
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    textsRef.current = texts;
  }, [texts]);

  useEffect(() => {
    sagaRef.current = saga;
  }, [saga]);

  // Sync saga data to local state ONLY on initial load to prevent overwriting user changes
  useEffect(() => {
    if (saga && isInitialLoad) {
      setTitle(saga.title || 'Min nya saga');
      setTexts({
        inledning: saga.inledning_text || '',
        huvuddel: saga.huvuddel_text || '',
        avslutning: saga.avslutning_text || ''
      });
      setIsInitialLoad(false);
    }
  }, [saga, isInitialLoad]);

  const handleDragStart = (card: StoryCard) => {
    setDraggedCard(card);
  };

  const handleCardDrop = (zone: ZoneType, card: StoryCard) => {
    if (!zoneCards[zone].find(c => c.id === card.id)) {
      setZoneCards(prev => ({
        ...prev,
        [zone]: [...prev[zone], card]
      }));
    }
    setDraggedCard(null);
  };

  const handleCardRemove = (zone: ZoneType, cardId: string) => {
    setZoneCards(prev => ({
      ...prev,
      [zone]: prev[zone].filter(c => c.id !== cardId)
    }));
  };

  const handleGenerateText = async (zone: ZoneType) => {
    const cards = zoneCards[zone];
    if (cards.length === 0) {
      toast.error('Lägg till minst ett kort först!');
      return;
    }

    setGeneratingZone(zone);

    const cardsByCategory = cards.reduce((acc, card) => {
      acc[card.kategori] = card.text;
      return acc;
    }, {} as Record<string, string>);

    // Build previous parts context for coherent story
    const previousParts: Record<string, string> = {};
    if (zone === 'huvuddel' && texts.inledning) {
      previousParts.inledning = texts.inledning;
    } else if (zone === 'avslutning') {
      if (texts.inledning) previousParts.inledning = texts.inledning;
      if (texts.huvuddel) previousParts.huvuddel = texts.huvuddel;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-text', {
        body: {
          del: zone,
          karaktar: cardsByCategory.karaktar,
          plats: cardsByCategory.plats,
          tid: cardsByCategory.tid,
          kansla: cardsByCategory.kansla,
          problem: cardsByCategory.problem,
          previousParts: Object.keys(previousParts).length > 0 ? previousParts : undefined
        }
      });

      if (error) throw error;

      setTexts(prev => ({
        ...prev,
        [zone]: data.text
      }));

      toast.success('Text skapad! ✨');
    } catch (error) {
      console.error('Error generating text:', error);
      toast.error('Kunde inte skapa text. Försök igen!');
    } finally {
      setGeneratingZone(null);
    }
  };

  // Auto-save function using refs to avoid unnecessary re-creations
  const debouncedAutoSave = useCallback(async () => {
    if (!sagaRef.current || isSavingRef.current) return;
    
    isSavingRef.current = true;
    
    const success = await updateSaga({
      title: titleRef.current,
      inledning_text: textsRef.current.inledning || null,
      huvuddel_text: textsRef.current.huvuddel || null,
      avslutning_text: textsRef.current.avslutning || null
    });

    isSavingRef.current = false;
    
    if (success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [updateSaga]);

  // Schedule auto-save with debounce
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      debouncedAutoSave();
    }, 2000);
  }, [debouncedAutoSave]);

  // Trigger auto-save on text or title changes
  useEffect(() => {
    if (!isInitialLoad && saga) {
      scheduleAutoSave();
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, texts, isInitialLoad, saga, scheduleAutoSave]);

  // Memoized text change handlers
  const handleInledningChange = useCallback((text: string) => {
    setTexts(prev => ({ ...prev, inledning: text }));
    setHasUnsavedChanges(true);
  }, []);

  const handleHuvuddelChange = useCallback((text: string) => {
    setTexts(prev => ({ ...prev, huvuddel: text }));
    setHasUnsavedChanges(true);
  }, []);

  const handleAvslutningChange = useCallback((text: string) => {
    setTexts(prev => ({ ...prev, avslutning: text }));
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!saga || isSavingRef.current) return;

    // Clear auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    isSavingRef.current = true;

    const success = await updateSaga({
      title,
      inledning_text: texts.inledning || null,
      huvuddel_text: texts.huvuddel || null,
      avslutning_text: texts.avslutning || null
    });

    isSavingRef.current = false;

    if (success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  };

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFinish = async () => {
    if (!texts.inledning || !texts.huvuddel || !texts.avslutning) {
      toast.error('Skriv klart alla delar av sagan först!');
      return;
    }

    await handleSave();
    navigate(`/saga/${saga?.id}`);
  };

  if (authLoading || cardsLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Laddar SkrivMagi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka
            </Button>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="max-w-[200px] font-semibold"
              placeholder="Sagans titel..."
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {saving ? (
                <>
                  <Cloud className="h-3.5 w-3.5 animate-pulse" />
                  <span>Sparar...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Cloud className="h-3.5 w-3.5" />
                  <span>Osparade ändringar</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span>Sparad</span>
                </>
              ) : null}
            </div>
            
            <Button size="sm" onClick={handleFinish}>
              <BookOpen className="h-4 w-4 mr-2" />
              Visa saga
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Story zones */}
          <div className="space-y-4">
            <StoryZone
              type="inledning"
              text={texts.inledning}
              onTextChange={handleInledningChange}
              droppedCards={zoneCards.inledning}
              onCardDrop={(card) => handleCardDrop('inledning', card)}
              onCardRemove={(id) => handleCardRemove('inledning', id)}
              onGenerateText={() => handleGenerateText('inledning')}
              isGenerating={generatingZone === 'inledning'}
              mode={mode}
            />

            <StoryZone
              type="huvuddel"
              text={texts.huvuddel}
              onTextChange={handleHuvuddelChange}
              droppedCards={zoneCards.huvuddel}
              onCardDrop={(card) => handleCardDrop('huvuddel', card)}
              onCardRemove={(id) => handleCardRemove('huvuddel', id)}
              onGenerateText={() => handleGenerateText('huvuddel')}
              isGenerating={generatingZone === 'huvuddel'}
              mode={mode}
            />

            <StoryZone
              type="avslutning"
              text={texts.avslutning}
              onTextChange={handleAvslutningChange}
              droppedCards={zoneCards.avslutning}
              onCardDrop={(card) => handleCardDrop('avslutning', card)}
              onCardRemove={(id) => handleCardRemove('avslutning', id)}
              onGenerateText={() => handleGenerateText('avslutning')}
              isGenerating={generatingZone === 'avslutning'}
              mode={mode}
            />
          </div>

          {/* Card library */}
          {(mode === 'pussel' || mode === 'halv') && (
            <div className="lg:sticky lg:top-20 h-[calc(100vh-8rem)]">
              <CardLibrary
                cards={cards}
                onDragStart={handleDragStart}
              />
            </div>
          )}
        </div>
      </main>

      <AICoach currentZone={currentZone} />
    </div>
  );
}
