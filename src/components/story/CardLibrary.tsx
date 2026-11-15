import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, MapPin, Clock, Heart, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StoryCard } from '@/hooks/useStoryCards';

interface CardLibraryProps {
  cards: StoryCard[];
  onDragStart: (card: StoryCard) => void;
  onCardSelect: (zone: 'inledning' | 'huvuddel' | 'avslutning', card: StoryCard) => void;
}

const categoryConfig = {
  karaktar: { label: 'Karaktär', icon: User, color: 'bg-accent text-accent-foreground border-border' },
  plats: { label: 'Plats', icon: MapPin, color: 'bg-story-start text-story-start-foreground border-story-start-foreground/40' },
  tid: { label: 'Tid', icon: Clock, color: 'bg-story-end text-story-end-foreground border-story-end-foreground/40' },
  kansla: { label: 'Känsla', icon: Heart, color: 'bg-accent text-accent-foreground border-border' },
  problem: { label: 'Problem', icon: AlertTriangle, color: 'bg-story-middle text-story-middle-foreground border-story-middle-foreground/40' }
};

export function CardLibrary({ cards, onDragStart, onCardSelect }: CardLibraryProps) {
  const [selectedCard, setSelectedCard] = useState<StoryCard | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || card.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold text-lg">📚 Kortbibliotek</h3>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Sök kort"
                placeholder="Sök kort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          <Button size="sm"
            variant={selectedCategory === null ? 'default' : 'outline'}
            aria-pressed={selectedCategory === null} className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Alla
          </Button>
          {categories.map(cat => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <Button size="sm"
                key={cat}
                variant="outline"
                aria-pressed={selectedCategory === cat} className={`cursor-pointer ${selectedCategory === cat ? config.color : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {filteredCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inga kort hittades. Prova en annan sökning!
            </p>
          ) : (
            filteredCards.map(card => {
              const config = categoryConfig[card.kategori];
              const Icon = config.icon;
              
              return (
                <Button variant="outline"
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('card', JSON.stringify(card));
                    onDragStart(card);
                  }}
                  className={`w-full h-auto text-left justify-start p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${config.color}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{card.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm">{config.label}</span>
                        <span className="text-sm">Nivå {card.niva}</span>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })
          )}
        </div>
      </ScrollArea>
      <Dialog open={selectedCard !== null} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent><DialogHeader><DialogTitle>Välj del av sagan</DialogTitle><DialogDescription>{selectedCard?.text}</DialogDescription></DialogHeader>
          {(['inledning', 'huvuddel', 'avslutning'] as const).map(zone => <Button key={zone} variant="outline" onClick={() => { if (selectedCard) onCardSelect(zone, selectedCard); setSelectedCard(null); }}>{zone === 'inledning' ? '🌅 Inledning' : zone === 'huvuddel' ? '⚡ Huvuddel' : '🌟 Avslutning'}</Button>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
