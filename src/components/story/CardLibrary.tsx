import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, MapPin, Clock, Heart, AlertTriangle } from 'lucide-react';
import { StoryCard } from '@/hooks/useStoryCards';

interface CardLibraryProps {
  cards: StoryCard[];
  onDragStart: (card: StoryCard) => void;
}

const categoryConfig = {
  karaktar: { label: 'Karaktär', icon: User, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  plats: { label: 'Plats', icon: MapPin, color: 'bg-green-100 text-green-700 border-green-200' },
  tid: { label: 'Tid', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  kansla: { label: 'Känsla', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  problem: { label: 'Problem', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-200' }
};

export function CardLibrary({ cards, onDragStart }: CardLibraryProps) {
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
            placeholder="Sök kort..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Alla
          </Badge>
          {categories.map(cat => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <Badge
                key={cat}
                variant="outline"
                className={`cursor-pointer ${selectedCategory === cat ? config.color : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
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
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => onDragStart(card)}
                  className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${config.color}`}
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{card.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">{config.label}</span>
                        <span className="text-xs opacity-50">Nivå {card.niva}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
