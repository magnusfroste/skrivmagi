import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, User, MapPin, Clock, Heart, AlertTriangle, Layers } from 'lucide-react';
import { StoryCard } from '@/hooks/useStoryCards';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MobileCardDrawerProps {
  cards: StoryCard[];
  onCardSelect: (card: StoryCard, zone: 'inledning' | 'huvuddel' | 'avslutning') => void;
}

const categoryConfig = {
  karaktar: { label: 'Karaktär', icon: User, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  plats: { label: 'Plats', icon: MapPin, color: 'bg-green-100 text-green-700 border-green-200' },
  tid: { label: 'Tid', icon: Clock, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  kansla: { label: 'Känsla', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  problem: { label: 'Problem', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-200' }
};

export function MobileCardDrawer({ cards, onCardSelect }: MobileCardDrawerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<StoryCard | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.text.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || card.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>;

  const handleCardClick = (card: StoryCard) => {
    setSelectedCard(card);
  };

  const handleZoneSelect = (zone: 'inledning' | 'huvuddel' | 'avslutning') => {
    if (selectedCard) {
      onCardSelect(selectedCard, zone);
      setSelectedCard(null);
    }
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button 
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 shadow-lg gap-2 lg:hidden"
            size="lg"
          >
            <Layers className="h-5 w-5" />
            Välj kort
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="flex items-center gap-2">
              📚 Kortbibliotek
            </DrawerTitle>
            <DrawerDescription>
              Tryck på ett kort för att välja zon
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-3">
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

          <ScrollArea className="flex-1 px-4 max-h-[50vh]">
            <div className="grid grid-cols-2 gap-2 pb-4">
              {filteredCards.length === 0 ? (
                <p className="col-span-2 text-center text-muted-foreground py-8">
                  Inga kort hittades
                </p>
              ) : (
                filteredCards.map(card => {
                  const config = categoryConfig[card.kategori];
                  const Icon = config.icon;

                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`p-3 rounded-lg border-2 text-left transition-all active:scale-95 ${config.color}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium line-clamp-2">{card.text}</p>
                          <span className="text-xs opacity-70">{config.label}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Stäng</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Zone selection dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Välj zon för kortet</DialogTitle>
            <DialogDescription>
              {selectedCard?.text}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-1 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"
              onClick={() => handleZoneSelect('inledning')}
            >
              <span className="text-lg">🌅</span>
              <span className="font-semibold">Inledning</span>
              <span className="text-xs text-muted-foreground">Början av sagan</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-1 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100"
              onClick={() => handleZoneSelect('huvuddel')}
            >
              <span className="text-lg">⚡</span>
              <span className="font-semibold">Huvuddel</span>
              <span className="text-xs text-muted-foreground">Mitt i äventyret</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-1 border-2 border-green-200 bg-green-50 hover:bg-green-100"
              onClick={() => handleZoneSelect('avslutning')}
            >
              <span className="text-lg">🌈</span>
              <span className="font-semibold">Avslutning</span>
              <span className="text-xs text-muted-foreground">Slutet på sagan</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
