import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Pencil, Plus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Saga {
  id: string;
  title: string;
  status: 'draft' | 'finished';
  lage: string;
  created_at: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
}

export default function MySagor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<Saga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadSagor();
    }
  }, [user, authLoading]);

  const loadSagor = async () => {
    const { data, error } = await supabase
      .from('sagor')
      .select('*')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Kunde inte ladda sagor');
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
      toast.error('Kunde inte ta bort sagan');
    } else {
      toast.success('Saga borttagen');
      loadSagor();
    }
  };

  const getStatusBadge = (saga: Saga) => {
    const hasAll = saga.inledning_text && saga.huvuddel_text && saga.avslutning_text;
    const hasAny = saga.inledning_text || saga.huvuddel_text || saga.avslutning_text;

    if (hasAll) {
      return <Badge className="bg-green-100 text-green-700">Komplett</Badge>;
    } else if (hasAny) {
      return <Badge className="bg-yellow-100 text-yellow-700">Påbörjad</Badge>;
    }
    return <Badge variant="secondary">Ny</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <Button size="sm" onClick={() => navigate('/')}>
            <Plus className="h-4 w-4 mr-2" />
            Ny saga
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Mina sagor</h1>
          <p className="text-muted-foreground">Alla sagor du har skapat</p>
        </div>

        {sagor.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Inga sagor ännu</h2>
            <p className="text-muted-foreground mb-4">
              Du har inte skapat några sagor än. Börja skriva din första saga!
            </p>
            <Button onClick={() => navigate('/')}>
              <Plus className="h-4 w-4 mr-2" />
              Skapa din första saga
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {sagor.map(saga => (
              <Card key={saga.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{saga.title}</CardTitle>
                    {getStatusBadge(saga)}
                  </div>
                  <CardDescription>
                    Skapad {formatDate(saga.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/bygg?lage=${saga.lage}&saga=${saga.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Redigera
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/saga/${saga.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Visa
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ta bort saga?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill ta bort "{saga.title}"? Detta går inte att ångra.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteSaga(saga.id)}>
                            Ta bort
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
