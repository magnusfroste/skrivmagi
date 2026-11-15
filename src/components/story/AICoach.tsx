import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X, Lightbulb, HelpCircle } from 'lucide-react';

interface AICoachProps {
  currentZone: 'inledning' | 'huvuddel' | 'avslutning' | null;
  onSuggestion?: (suggestion: string) => void;
}

const tips = {
  inledning: [
    '🌅 Börja med "Det var en gång..."',
    '👤 Berätta vem som är huvudpersonen',
    '🏠 Beskriv var sagan utspelar sig',
    '☀️ Berätta om vädret eller årstiden'
  ],
  huvuddel: [
    '⚡ Vad händer som är spännande?',
    '😱 Kanske uppstår ett problem?',
    '🤝 Träffar huvudpersonen någon?',
    '🗺️ Ger sig huvudpersonen ut på äventyr?'
  ],
  avslutning: [
    '🎉 Hur löses problemet?',
    '😊 Vad lär sig huvudpersonen?',
    '🌟 Avsluta med något fint!',
    '💤 "Och så levde de lyckliga..."'
  ]
};

export function AICoach({ currentZone }: AICoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-4 right-4 z-30 shadow-lg"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Visa AI-coach
      </Button>
    );
  }

  const currentTips = currentZone ? tips[currentZone] : [
    '👋 Välj en del av sagan att börja med!',
    '🧩 Dra kort från biblioteket',
    '✨ Jag hjälper dig på vägen!'
  ];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % currentTips.length);
  };

  return (
    <Card className="fixed bottom-20 lg:bottom-4 right-4 z-30 w-72 max-w-[calc(100%-2rem)] shadow-xl border-2 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">AI-coach</p>
              <p className="text-xs text-muted-foreground">Din skrivhjälpare</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" aria-label="Stäng skrivhjälpen" className="h-11 w-11" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{currentTips[currentTip % currentTips.length]}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Tips {currentTip + 1} av {currentTips.length}
          </span>
          <Button variant="ghost" size="sm" onClick={nextTip}>
            <HelpCircle className="h-4 w-4 mr-1" />
            Nästa tips
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
