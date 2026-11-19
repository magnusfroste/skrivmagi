import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Sparkles, CheckCircle, User, MapPin, AlertTriangle } from 'lucide-react';

const demoCards = [
  { id: 1, emoji: '🐉', text: 'En modig drake', kategori: 'karaktar', Icon: User },
  { id: 2, emoji: '🏰', text: 'I ett slott', kategori: 'plats', Icon: MapPin },
  { id: 3, emoji: '⚡', text: 'Något oväntat', kategori: 'problem', Icon: AlertTriangle },
];

const categoryColors = {
  karaktar: 'bg-purple-100 border-purple-300 text-purple-700',
  plats: 'bg-green-100 border-green-300 text-green-700',
  problem: 'bg-orange-100 border-orange-300 text-orange-700',
};

const zones = [
  { id: 'inledning', label: 'Inledning', emoji: '🌅', headerColor: 'bg-green-100 text-green-800', borderColor: 'border-green-400' },
  { id: 'huvuddel', label: 'Huvuddel', emoji: '⚡', headerColor: 'bg-yellow-100 text-yellow-800', borderColor: 'border-yellow-400' },
  { id: 'avslutning', label: 'Avslutning', emoji: '🌟', headerColor: 'bg-blue-100 text-blue-800', borderColor: 'border-blue-400' },
];

export const AnimatedDemo = () => {
  const { ref, isVisible } = useScrollAnimation(0.3);
  const [step, setStep] = useState(0);
  const [placedCards, setPlacedCards] = useState<Record<string, typeof demoCards[0] | null>>({
    inledning: null,
    huvuddel: null,
    avslutning: null,
  });

  useEffect(() => {
    if (!isVisible) return;

    const sequence = [
      () => setPlacedCards(prev => ({ ...prev, inledning: demoCards[0] })),
      () => setPlacedCards(prev => ({ ...prev, huvuddel: demoCards[1] })),
      () => setPlacedCards(prev => ({ ...prev, avslutning: demoCards[2] })),
      () => setStep(4),
      () => {
        setPlacedCards({ inledning: null, huvuddel: null, avslutning: null });
        setStep(0);
      },
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      sequence[currentIndex]();
      setStep(currentIndex + 1);
      currentIndex = (currentIndex + 1) % sequence.length;
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <div ref={ref} className="relative">
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 overflow-hidden">
        {/* Demo header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">SkrivMagi Demo</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card library */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              📚 Kortbibliotek
            </h4>
            <div className="space-y-2">
              {demoCards.map((card) => {
                const isPlaced = Object.values(placedCards).some(p => p?.id === card.id);
                const colorClass = categoryColors[card.kategori as keyof typeof categoryColors];
                const Icon = card.Icon;
                return (
                  <div
                    key={card.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-500
                      ${colorClass}
                      ${isPlaced ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                    `}
                    style={{
                      transform: isPlaced ? 'translateX(10px)' : 'translateX(0)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium text-sm">{card.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Story zones */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Din saga</h4>
            <div className="space-y-2">
              {zones.map((zone) => {
                const placedCard = placedCards[zone.id];
                return (
                  <div
                    key={zone.id}
                    className={`
                      rounded-lg border-2 overflow-hidden transition-all duration-500
                      ${zone.borderColor}
                      ${!placedCard ? 'border-dashed bg-muted/30' : 'border-solid bg-background'}
                    `}
                  >
                    {/* Zone header */}
                    <div className={`px-3 py-1.5 flex items-center gap-2 ${zone.headerColor}`}>
                      <span className="text-base">{zone.emoji}</span>
                      <span className="font-semibold text-xs">{zone.label}</span>
                    </div>
                    
                    {/* Zone content */}
                    <div className="p-3 min-h-[50px] flex items-center">
                      {placedCard ? (
                        <div className="flex items-center gap-2 animate-fade-in w-full">
                          <placedCard.Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm flex-1">{placedCard.text}</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Dra kort hit...
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${step >= s ? 'bg-primary scale-125' : 'bg-muted'}
              `}
            />
          ))}
        </div>

        {/* Completion overlay */}
        {step === 4 && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-2 animate-bounce" />
              <p className="font-bold text-lg">Sagan är klar!</p>
              <p className="text-sm text-muted-foreground">Nu kan du dela den på SagoScenen</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
