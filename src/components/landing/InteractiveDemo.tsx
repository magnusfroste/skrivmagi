import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoCard {
  id: string;
  emoji: string;
  text: string;
  kategori: string;
}

const demoCards: DemoCard[] = [
  { id: '1', emoji: '🦁', text: 'Ett modigt lejon', kategori: 'karaktar' },
  { id: '2', emoji: '🧙‍♂️', text: 'En vis trollkarl', kategori: 'karaktar' },
  { id: '3', emoji: '🏰', text: 'I ett magiskt slott', kategori: 'plats' },
  { id: '4', emoji: '🌲', text: 'Djupt i skogen', kategori: 'plats' },
  { id: '5', emoji: '⚡', text: 'Något oväntat händer', kategori: 'problem' },
  { id: '6', emoji: '🎉', text: 'Lyckligt slut', kategori: 'kansla' },
];

const zones = [
  { id: 'inledning', label: '📖 Inledning', hint: 'Vem? Var?', color: 'border-emerald-300 bg-emerald-50' },
  { id: 'huvuddel', label: '⚡ Huvuddel', hint: 'Vad händer?', color: 'border-amber-300 bg-amber-50' },
  { id: 'avslutning', label: '🌟 Avslutning', hint: 'Hur slutar det?', color: 'border-rose-300 bg-rose-50' },
];

export const InteractiveDemo = () => {
  const [placedCards, setPlacedCards] = useState<Record<string, DemoCard | null>>({
    inledning: null,
    huvuddel: null,
    avslutning: null,
  });
  const [draggedCard, setDraggedCard] = useState<DemoCard | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleDragStart = (card: DemoCard) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zoneId: string) => {
    if (draggedCard) {
      const newPlacedCards = { ...placedCards, [zoneId]: draggedCard };
      setPlacedCards(newPlacedCards);
      setDraggedCard(null);
      
      // Check if all zones are filled
      if (Object.values(newPlacedCards).every(card => card !== null)) {
        setTimeout(() => setIsComplete(true), 300);
      }
    }
  };

  const handleReset = () => {
    setPlacedCards({ inledning: null, huvuddel: null, avslutning: null });
    setIsComplete(false);
  };

  const availableCards = demoCards.filter(
    card => !Object.values(placedCards).some(placed => placed?.id === card.id)
  );

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Prova själv!
        </h3>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="h-4 w-4" />
          Börja om
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Dra ett kort till varje del av sagan
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available cards */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Välj kort</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableCards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(card)}
                className="p-3 rounded-lg border-2 border-purple-200 bg-background cursor-grab active:cursor-grabbing hover:shadow-md hover:border-purple-400 transition-all select-none"
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="text-xs font-medium">{card.text}</span>
                </div>
              </div>
            ))}
            {availableCards.length === 0 && !isComplete && (
              <p className="col-span-2 text-center text-sm text-muted-foreground py-4">
                Alla kort är placerade!
              </p>
            )}
          </div>
        </div>

        {/* Drop zones */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Din saga</h4>
          <div className="space-y-2">
            {zones.map((zone) => {
              const placedCard = placedCards[zone.id];
              return (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(zone.id)}
                  className={`
                    p-3 rounded-lg border-2 border-dashed min-h-[70px] transition-all
                    ${placedCard ? 'border-solid bg-background' : zone.color}
                    ${!placedCard && draggedCard ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
                  `}
                >
                  {placedCard ? (
                    <div className="flex items-center gap-3 animate-scale-in">
                      <span className="text-2xl">{placedCard.emoji}</span>
                      <div>
                        <p className="text-xs text-muted-foreground">{zone.label}</p>
                        <p className="font-medium text-sm">{placedCard.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="font-medium text-sm">{zone.label}</span>
                      <span className="text-xs text-muted-foreground">{zone.hint}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Completion overlay */}
      {isComplete && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center animate-fade-in z-10">
          <div className="text-center p-6">
            <div className="text-5xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-xl font-bold mb-2">Fantastiskt!</h3>
            <p className="text-muted-foreground mb-4">
              Du har byggt din första saga!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={handleReset}>
                Prova igen
              </Button>
              <Link to="/auth">
                <Button className="gap-2">
                  Skapa fler sagor
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
