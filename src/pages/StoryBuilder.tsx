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
import { ArrowLeft, Save, BookOpen, Loader2, Check } from 'lucide-react';
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
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Auto-save function with debounce
  const debouncedAutoSave = useCallback(async () => {
    if (!saga) return;
    
    const success = await updateSaga({
      title,
      inledning_text: texts.inledning || null,
      huvuddel_text: texts.huvuddel || null,
      avslutning_text: texts.avslutning || null
    });

    if (success) {
      setLastSaved(new Date());
    }
  }, [saga, title, texts, updateSaga]);

  // Trigger auto-save on text or title changes
  useEffect(() => {
    if (!isInitialLoad && saga) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save after 2 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(() => {
        debouncedAutoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, texts, isInitialLoad, saga, debouncedAutoSave]);

  const handleTextChange = (zone: ZoneType, text: string) => {
    setTexts(prev => ({
      ...prev,
      [zone]: text
    }));
  };

  const handleSave = async () => {
    if (!saga) return;

    // Clear auto-save timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const success = await updateSaga({
      title,
      inledning_text: texts.inledning || null,
      huvuddel_text: texts.huvuddel || null,
      avslutning_text: texts.avslutning || null
    });

    if (success) {
      setLastSaved(new Date());
      toast.success('Sparat! 💾');
    }
  };

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
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-[200px] font-semibold"
              placeholder="Sagans titel..."
            />
          </div>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Sparad {new Date(lastSaved).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : lastSaved ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? 'Sparar...' : 'Spara nu'}
            </Button>
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
              onTextChange={(text) => handleTextChange('inledning', text)}
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
              onTextChange={(text) => handleTextChange('huvuddel', text)}
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
              onTextChange={(text) => handleTextChange('avslutning', text)}
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
