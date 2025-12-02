import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Eye, Trash2, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { LageBadge } from '@/components/story/LageBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SagaSkeleton } from '@/components/ui/saga-skeleton';

interface Saga {
  id: string;
  title: string;
  status: 'draft' | 'finished';
  lage: string;
  created_at: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  bild_inledning: string | null;
}

export default function MySagor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<Saga[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadSagor();
    }
  }, [user, authLoading, navigate]);

  const loadSagor = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sagor')
      .select('id, title, status, lage, created_at, inledning_text, huvuddel_text, avslutning_text, bild_inledning')
      .eq('student_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sagor:', error);
      toast.error('Kunde inte ladda dina sagor');
    } else {
      setSagor(data || []);
    }
    setLoading(false);
  };

  const deleteSaga = async (id: string) => {
    const { error } = await supabase
      .from('sagor')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saga:', error);
      toast.error('Kunde inte ta bort sagan');
    } else {
      toast.success('Sagan har tagits bort');
      setSagor(sagor.filter(s => s.id !== id));
    }
    setDeleteId(null);
  };

  const getStatusBadge = (saga: Saga) => {
    const hasAllParts = saga.inledning_text && saga.huvuddel_text && saga.avslutning_text;
    if (hasAllParts) {
      return <Badge variant="default" className="bg-green-500">Klar</Badge>;
    }
    return <Badge variant="secondary">Pågående</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMM yyyy', { locale: sv });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <Button size="sm" onClick={() => navigate('/skapa?lage=pussel')}>
            <Plus className="h-4 w-4 mr-2" />
            Ny saga
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          Mina sagor
        </h1>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SagaSkeleton key={i} />
            ))}
          </div>
        ) : sagor.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Du har inte skapat några sagor ännu</p>
            <Button onClick={() => navigate('/skapa?lage=pussel')}>
              <Plus className="h-4 w-4 mr-2" />
              Skapa din första saga!
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sagor.map((saga) => (
              <Card key={saga.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="aspect-video bg-muted cursor-pointer"
                  onClick={() => navigate(`/saga/${saga.id}`)}
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
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{saga.title}</CardTitle>
                    {getStatusBadge(saga)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <LageBadge lage={saga.lage} />
                    <span>•</span>
                    <span>{formatDate(saga.created_at)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/skapa?lage=${saga.lage}&saga=${saga.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Redigera
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/saga/${saga.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visa
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(saga.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort saga?</AlertDialogTitle>
            <AlertDialogDescription>
              Är du säker på att du vill ta bort denna saga? Detta går inte att ångra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteSaga(deleteId)}>
              Ta bort
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
