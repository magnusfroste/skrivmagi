import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Loader2, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface PublicSaga {
  id: string;
  title: string;
  share_slug: string;
  bild_inledning: string | null;
  upvotes: number;
  created_at: string;
}

export default function PublicDiscovery() {
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<PublicSaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
  const [votedSagas, setVotedSagas] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPublicSagor();
    loadVotedSagas();
  }, [sortBy]);

  const loadPublicSagor = async () => {
    setLoading(true);

    let query = supabase
      .from('sagor')
      .select('id, title, share_slug, bild_inledning, upvotes, created_at')
      .eq('is_public', true);

    if (sortBy === 'popular') {
      query = query.order('upvotes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading public sagor:', error);
      toast.error('Kunde inte ladda sagor');
    } else {
      setSagor(data || []);
    }

    setLoading(false);
  };

  const loadVotedSagas = () => {
    const voted = localStorage.getItem('voted_sagas');
    if (voted) {
      setVotedSagas(new Set(JSON.parse(voted)));
    }
  };

  const handleUpvote = async (sagaId: string, shareSlug: string) => {
    if (votedSagas.has(sagaId)) {
      toast.info('Du har redan gillat denna saga!');
      return;
    }

    try {
      // Get current fingerprint (simple version using localStorage)
      const fingerprint = localStorage.getItem('user_fingerprint') || crypto.randomUUID();
      localStorage.setItem('user_fingerprint', fingerprint);

      // Insert upvote
      const { error: upvoteError } = await supabase
        .from('saga_upvotes')
        .insert({ saga_id: sagaId, voter_identifier: fingerprint });

      if (upvoteError) throw upvoteError;

      // Update upvotes count
      const saga = sagor.find(s => s.id === sagaId);
      if (saga) {
        await supabase
          .from('sagor')
          .update({ upvotes: saga.upvotes + 1 })
          .eq('id', sagaId);
      }

      // Update local state
      const newVoted = new Set(votedSagas);
      newVoted.add(sagaId);
      setVotedSagas(newVoted);
      localStorage.setItem('voted_sagas', JSON.stringify([...newVoted]));

      // Reload sagor to get updated counts
      loadPublicSagor();

      toast.success('Gilla registrerad! 💖');
    } catch (error) {
      console.error('Error upvoting saga:', error);
      toast.error('Kunde inte gilla sagan');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hem
          </Button>
          <h1 className="text-xl font-bold">Upptäck sagor ✨</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container py-8">
        {/* Sort buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={sortBy === 'popular' ? 'default' : 'outline'}
            onClick={() => setSortBy('popular')}
            size="sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Populärast
          </Button>
          <Button
            variant={sortBy === 'newest' ? 'default' : 'outline'}
            onClick={() => setSortBy('newest')}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Nyast
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sagor.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Inga delade sagor än...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sagor.map((saga) => (
              <Card key={saga.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={`/saga/public/${saga.share_slug}`}>
                  <div className="aspect-[4/3] bg-muted relative">
                    {saga.bild_inledning ? (
                      <img
                        src={saga.bild_inledning}
                        alt={saga.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-muted-foreground opacity-30" />
                      </div>
                    )}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link to={`/saga/public/${saga.share_slug}`}>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{saga.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <Button
                      variant={votedSagas.has(saga.id) ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleUpvote(saga.id, saga.share_slug)}
                      disabled={votedSagas.has(saga.id)}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${votedSagas.has(saga.id) ? 'fill-red-500 text-red-500' : ''}`}
                      />
                      {saga.upvotes || 0}
                    </Button>
                    <Link to={`/saga/public/${saga.share_slug}`}>
                      <Button variant="outline" size="sm">
                        Läs mer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
