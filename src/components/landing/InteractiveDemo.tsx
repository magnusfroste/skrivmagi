import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RotateCcw, ArrowRight, User, MapPin, AlertTriangle, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DemoCard {
  id: string;
  emoji: string;
  text: string;
  kategori: string;
}

const categoryConfig = {
  karaktar: { label: 'Karaktär', icon: User, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  plats: { label: 'Plats', icon: MapPin, color: 'bg-green-100 text-green-700 border-green-300' },
  tid: { label: 'Tid', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  kansla: { label: 'Känsla', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  problem: { label: 'Problem', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-300' }
};

const demoCards: DemoCard[] = [
  { id: '1', emoji: '🦁', text: 'Ett modigt lejon', kategori: 'karaktar' },
  { id: '2', emoji: '🧙‍♂️', text: 'En vis trollkarl', kategori: 'karaktar' },
  { id: '3', emoji: '🏰', text: 'I ett magiskt slott', kategori: 'plats' },
  { id: '4', emoji: '🌲', text: 'Djupt i skogen', kategori: 'plats' },
  { id: '5', emoji: '⚡', text: 'Något oväntat händer', kategori: 'problem' },
  { id: '6', emoji: '🎉', text: 'Lyckligt slut', kategori: 'kansla' },
];

const zones = [
  { id: 'inledning', label: 'Inledning', emoji: '🌅', hint: 'Vem? Var?', headerColor: 'bg-green-100 text-green-800', borderColor: 'border-green-400' },
  { id: 'huvuddel', label: 'Huvuddel', emoji: '⚡', hint: 'Vad händer?', headerColor: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-400' },
  { id: 'avslutning', label: 'Avslutning', emoji: '🌟', hint: 'Hur slutar det?', headerColor: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-400' },
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
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            📚 Välj kort
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {availableCards.map((card) => {
              const config = categoryConfig[card.kategori as keyof typeof categoryConfig];
              const Icon = config.icon;
              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => handleDragStart(card)}
                  className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none ${config.color}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{card.text}</p>
                      <span className="text-[10px] opacity-70">{config.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    rounded-lg border-2 overflow-hidden transition-all
                    ${zone.borderColor}
                    ${placedCard ? 'border-solid' : 'border-dashed bg-muted/30'}
                    ${!placedCard && draggedCard ? 'ring-2 ring-purple-400 ring-offset-2' : ''}
                  `}
                >
                  {/* Zone header */}
                  <div className={`px-3 py-1.5 flex items-center gap-2 ${zone.headerColor}`}>
                    <span className="text-base">{zone.emoji}</span>
                    <span className="font-semibold text-xs">{zone.label}</span>
                  </div>
                  
                  {/* Zone content */}
                  <div className="p-3 min-h-[50px] bg-background/50">
                    {placedCard ? (
                      <div className="flex items-center gap-2 animate-scale-in">
                        <Badge variant="secondary" className="py-1 px-2">
                          {placedCard.text}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-muted-foreground italic">{zone.hint}</span>
                      </div>
                    )}
                  </div>
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
              Du har skapat din första saga!
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
