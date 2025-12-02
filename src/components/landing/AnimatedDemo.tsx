import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Sparkles, CheckCircle } from 'lucide-react';

const demoCards = [
  { id: 1, emoji: '🐉', text: 'En modig drake', color: 'bg-pink-100 border-pink-300' },
  { id: 2, emoji: '🏰', text: 'I ett slott', color: 'bg-purple-100 border-purple-300' },
  { id: 3, emoji: '✨', text: 'Magisk kraft', color: 'bg-blue-100 border-blue-300' },
];

const zones = [
  { id: 'inledning', label: 'Inledning', color: 'bg-emerald-50 border-emerald-200' },
  { id: 'huvuddel', label: 'Huvuddel', color: 'bg-amber-50 border-amber-200' },
  { id: 'avslutning', label: 'Avslutning', color: 'bg-rose-50 border-rose-200' },
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
      // Step 1: Place first card
      () => setPlacedCards(prev => ({ ...prev, inledning: demoCards[0] })),
      // Step 2: Place second card
      () => setPlacedCards(prev => ({ ...prev, huvuddel: demoCards[1] })),
      // Step 3: Place third card
      () => setPlacedCards(prev => ({ ...prev, avslutning: demoCards[2] })),
      // Step 4: Show completion
      () => setStep(4),
      // Reset and loop
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
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Kortbibliotek</h4>
            <div className="space-y-2">
              {demoCards.map((card, index) => {
                const isPlaced = Object.values(placedCards).some(p => p?.id === card.id);
                return (
                  <div
                    key={card.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-500
                      ${card.color}
                      ${isPlaced ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}
                    `}
                    style={{
                      transform: isPlaced ? 'translateX(10px)' : 'translateX(0)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{card.emoji}</span>
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
                      p-3 rounded-lg border-2 border-dashed min-h-[60px] transition-all duration-500
                      ${placedCard ? placedCard.color.replace('border-dashed', '') : zone.color}
                    `}
                  >
                    {placedCard ? (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-2xl">{placedCard.emoji}</span>
                        <span className="font-medium text-sm">{placedCard.text}</span>
                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-xs text-muted-foreground">{zone.label}</span>
                      </div>
                    )}
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
              <p className="text-sm text-muted-foreground">Nu kan du lyssna på den</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
