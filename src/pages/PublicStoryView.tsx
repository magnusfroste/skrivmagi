import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Loader2, Play, Pause, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface PublicSaga {
  id: string;
  title: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  bild_inledning: string | null;
  bild_huvuddel: string | null;
  bild_avslutning: string | null;
  audio_elevenlabs_url: string | null;
  upvotes: number;
  share_slug: string;
}

export default function PublicStoryView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [saga, setSaga] = useState<PublicSaga | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (slug) {
      loadPublicSaga();
      checkIfVoted();
    }
  }, [slug]);

  const loadPublicSaga = async () => {
    const { data, error } = await supabase
      .from('sagor')
      .select('*')
      .eq('share_slug', slug)
      .eq('is_public', true)
      .single();

    if (error) {
      toast.error('Kunde inte hitta sagan');
      navigate('/upptack');
    } else {
      setSaga(data);
    }
    setLoading(false);
  };

  const checkIfVoted = () => {
    const voted = localStorage.getItem('voted_sagas');
    if (voted && saga) {
      const votedSet = new Set(JSON.parse(voted));
      setHasVoted(votedSet.has(saga.id));
    }
  };

  const handleUpvote = async () => {
    if (!saga || hasVoted) return;

    try {
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);

      const { error: upvoteError } = await supabase.rpc('upvote_saga', {
        p_saga_id: saga.id,
        p_voter_identifier: visitorId,
      });

      if (upvoteError) throw upvoteError;

      const voted = localStorage.getItem('voted_sagas');
      const votedSet = new Set(voted ? JSON.parse(voted) : []);
      votedSet.add(saga.id);
      localStorage.setItem('voted_sagas', JSON.stringify([...votedSet]));

      setHasVoted(true);
      setSaga({ ...saga, upvotes: saga.upvotes + 1 });
      toast.success('Gilla registrerad! 💖');
    } catch (error) {
      console.error('Error upvoting saga:', error);
      toast.error('Kunde inte gilla sagan');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!saga) return null;

  const pages = [
    { title: saga.title, content: null, image: saga.bild_inledning, type: 'cover' },
    { title: '🌅 Inledning', content: saga.inledning_text, image: saga.bild_inledning },
    { title: '⚡ Huvuddel', content: saga.huvuddel_text, image: saga.bild_huvuddel },
    { title: '🌟 Avslutning', content: saga.avslutning_text, image: saga.bild_avslutning }
  ];

  const currentPageData = pages[currentPage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/upptack')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <Button
            variant={hasVoted ? 'secondary' : 'outline'}
            size="sm"
            onClick={handleUpvote}
            disabled={hasVoted}
          >
            <Heart className={`h-4 w-4 mr-2 ${hasVoted ? 'fill-red-500 text-red-500' : ''}`} />
            {saga.upvotes || 0}
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-2xl mx-auto overflow-hidden">
          <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
            {currentPageData.image ? (
              <img
                src={currentPageData.image}
                alt={currentPageData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-16 w-16 mx-auto mb-2 opacity-50" />
              </div>
            )}

            {currentPage === 0 && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-8">
                <h1 className="text-4xl font-bold text-center">{saga.title}</h1>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            {currentPageData.type !== 'cover' && (
              <>
                <h2 className="text-xl font-semibold mb-4">{currentPageData.title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {currentPageData.content || 'Ingen text...'}
                </p>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                ← Föregående
              </Button>

              <div className="flex items-center gap-2">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
              >
                Nästa →
              </Button>
            </div>

            {/* Audio player */}
            {saga.audio_elevenlabs_url && (
              <div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-4">
                <Button size="icon" variant="outline" onClick={playAudio}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isPlaying ? 'Spelar upp...' : 'Klicka för att lyssna på sagan'}
                </span>
                <audio
                  ref={audioRef}
                  src={saga.audio_elevenlabs_url}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
