import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, X, Volume2 } from 'lucide-react';
import { StoryCard } from '@/hooks/useStoryCards';
import { Badge } from '@/components/ui/badge';

interface StoryZoneProps {
  type: 'inledning' | 'huvuddel' | 'avslutning';
  text: string;
  onTextChange: (text: string) => void;
  droppedCards: StoryCard[];
  onCardDrop: (card: StoryCard) => void;
  onCardRemove: (cardId: string) => void;
  onGenerateText: () => void;
  isGenerating: boolean;
  mode: 'pussel' | 'halv' | 'fritt';
}

const zoneConfig = {
  inledning: {
    label: 'Inledning',
    emoji: '🌅',
    color: 'border-green-400 bg-green-50/50',
    headerColor: 'bg-green-100 text-green-800',
    hint: 'Här börjar din saga. Berätta vem som är med och var det händer.'
  },
  huvuddel: {
    label: 'Huvuddel',
    emoji: '⚡',
    color: 'border-yellow-400 bg-yellow-50/50',
    headerColor: 'bg-yellow-100 text-yellow-800',
    hint: 'Vad händer? Kanske uppstår ett problem eller äventyr!'
  },
  avslutning: {
    label: 'Avslutning',
    emoji: '🌟',
    color: 'border-blue-400 bg-blue-50/50',
    headerColor: 'bg-blue-100 text-blue-800',
    hint: 'Hur slutar sagan? Löses problemet?'
  }
};

export function StoryZone({
  type,
  text,
  onTextChange,
  droppedCards,
  onCardDrop,
  onCardRemove,
  onGenerateText,
  isGenerating,
  mode
}: StoryZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const config = zoneConfig[type];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardData = e.dataTransfer.getData('card');
    if (cardData) {
      onCardDrop(JSON.parse(cardData));
    }
  };

  const isHuvuddel = type === 'huvuddel';

  return (
    <div
      className={`rounded-xl border-4 transition-all ${config.color} ${
        isDragOver ? 'scale-[1.02] shadow-lg' : ''
      } ${isHuvuddel ? 'min-h-[280px]' : 'min-h-[200px]'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`px-4 py-2 rounded-t-lg flex items-center justify-between ${config.headerColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <span className="font-bold">{config.label}</span>
        </div>
        {droppedCards.length > 0 && (mode === 'pussel' || mode === 'halv') && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onGenerateText}
            disabled={isGenerating}
            className="h-7"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                Skapa text
              </>
            )}
          </Button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Dropped cards */}
        {(mode === 'pussel' || mode === 'halv') && (
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {droppedCards.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {isDragOver ? '👇 Släpp kortet här!' : '👉 Dra kort hit från biblioteket'}
              </p>
            ) : (
              droppedCards.map(card => (
                <Badge key={card.id} variant="secondary" className="py-1 px-2 gap-1">
                  {card.text}
                  <button onClick={() => onCardRemove(card.id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        )}

        {/* Text area */}
        {(mode === 'halv' || mode === 'fritt' || text) && (
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={config.hint}
            className="min-h-[100px] resize-none border-2"
            readOnly={mode === 'pussel'}
          />
        )}

        {!text && mode === 'pussel' && droppedCards.length > 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Klicka på "Skapa text" för att generera din text! ✨
          </p>
        )}
      </div>
    </div>
  );
}
