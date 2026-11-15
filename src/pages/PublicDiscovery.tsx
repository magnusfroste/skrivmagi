import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Sparkles, Star, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SagaSkeleton } from '@/components/ui/saga-skeleton';

interface PublicSaga {
  id: string;
  title: string;
  share_slug: string | null;
  bild_inledning: string | null;
  upvotes: number | null;
  created_at: string;
}

const SAGAS_PER_PAGE = 12;

export default function PublicDiscovery() {
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<PublicSaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [votedSagas, setVotedSagas] = useState<Set<string>>(new Set());
  const [votingId, setVotingId] = useState<string | null>(null);

  const loadPublicSagor = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const offset = reset ? 0 : sagor.length;

    let query = supabase
      .from('sagor')
      .select('id, title, share_slug, bild_inledning, upvotes, created_at')
      .eq('is_public', true)
      .not('share_slug', 'is', null)
      .range(offset, offset + SAGAS_PER_PAGE - 1);

    if (sortBy === 'popular') {
      query = query.order('upvotes', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading public sagor:', error);
      toast.error('Kunde inte ladda sagor');
    } else {
      if (reset) {
        setSagor(data || []);
      } else {
        setSagor(prev => [...prev, ...(data || [])]);
      }
      setHasMore((data?.length || 0) === SAGAS_PER_PAGE);
    }

    setLoading(false);
    setLoadingMore(false);
  }, [sortBy, sagor.length]);

  const loadVotedSagas = () => {
    const stored = localStorage.getItem('voted_sagas');
    if (stored) {
      setVotedSagas(new Set(JSON.parse(stored)));
    }
  };

  useEffect(() => {
    loadPublicSagor(true);
    loadVotedSagas();
  }, [sortBy]);

  const handleUpvote = async (sagaId: string) => {
    if (votedSagas.has(sagaId) || votingId) return;

    setVotingId(sagaId);

    // Optimistic update
    setSagor(prev => prev.map(s => 
      s.id === sagaId ? { ...s, upvotes: (s.upvotes || 0) + 1 } : s
    ));

    try {
      const visitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);

      const { error: rpcError } = await supabase.rpc('upvote_saga', {
        p_saga_id: sagaId,
        p_voter_identifier: visitorId,
      });

      if (rpcError) throw rpcError;

      // Update local storage
      const newVotedSagas = new Set(votedSagas);
      newVotedSagas.add(sagaId);
      setVotedSagas(newVotedSagas);
      localStorage.setItem('voted_sagas', JSON.stringify([...newVotedSagas]));

      toast.success('Applåder! 👏');
    } catch (error) {
      // Rollback optimistic update on error
      setSagor(prev => prev.map(s => 
        s.id === sagaId ? { ...s, upvotes: (s.upvotes || 1) - 1 } : s
      ));
      console.error('Error upvoting:', error);
      toast.error('Kunde inte registrera din röst');
    } finally {
      setVotingId(null);
    }
  };

  const handleLoadMore = () => {
    loadPublicSagor(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
        </div>
      </header>

      <main className="container py-8">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            SagoScenen
          </div>
          <h1 className="text-4xl font-bold mb-2">Välkommen till SagoScenen! 🎭</h1>
          <p className="text-muted-foreground text-lg">
            Här har skrivmagikernas sagor premiär
          </p>
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            onClick={() => setSortBy('popular')}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            I strålkastarljuset
          </Button>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            onClick={() => setSortBy('newest')}
            className="gap-2"
          >
            <Clock className="h-4 w-4" />
            Premiärer
          </Button>
        </div>

        {/* Sagas grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SagaSkeleton key={i} />
            ))}
          </div>
        ) : sagor.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Inga sagor har publicerats ännu</p>
            <Button onClick={() => navigate('/skapa?lage=pussel')}>
              Bli först att gå upp på scenen! 🌟
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sagor.map((saga) => (
                <Card key={saga.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link to={`/sagoscenen/visa/${saga.share_slug}`} aria-label={`Läs ${saga.title}`}
                    className="block aspect-video bg-muted"
                  >
                    {saga.bild_inledning ? (
                      <img
                        src={saga.bild_inledning}
                        alt={saga.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📖
                      </div>
                    )}
                  </Link>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg"><Link className="flex min-h-11 items-center hover:text-primary" to={`/sagoscenen/visa/${saga.share_slug}`}>{saga.title}</Link></CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Button
                        variant={votedSagas.has(saga.id) ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleUpvote(saga.id)}
                        disabled={votedSagas.has(saga.id) || votingId === saga.id}
                        className="gap-2"
                      >
                        {votingId === saga.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart className={`h-4 w-4 ${votedSagas.has(saga.id) ? 'fill-current' : ''}`} />
                        )}
                        {saga.upvotes || 0} applåder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/sagoscenen/visa/${saga.share_slug}`)}
                      >
                        Läs saga →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load more button */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Laddar...
                    </>
                  ) : (
                    'Visa fler sagor'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
