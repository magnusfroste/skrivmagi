import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Loader2, MessageSquare, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StudentSaga {
  id: string;
  title: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  teacher_comment: string | null;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

export default function TeacherDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<StudentSaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSaga, setSelectedSaga] = useState<StudentSaga | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (role !== 'teacher') {
        navigate('/');
        return;
      }
      loadSagor();
    }
  }, [user, role, authLoading]);

  const loadSagor = async () => {
    // Load all sagor with profiles
    const { data: sagorData, error: sagorError } = await supabase
      .from('sagor')
      .select('*')
      .order('created_at', { ascending: false });

    if (sagorError) {
      console.error('Error loading sagor:', sagorError);
      toast.error('Kunde inte ladda sagor');
      setLoading(false);
      return;
    }

    // Load profiles for each saga
    const studentIds = [...new Set(sagorData?.map(s => s.student_id) || [])];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .in('user_id', studentIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedSagor = (sagorData || []).map(saga => ({
      ...saga,
      profiles: profilesMap.get(saga.student_id) || { name: 'Okänd', email: '' }
    }));

    setSagor(enrichedSagor as StudentSaga[]);
    setLoading(false);
  };

  const getStatusBadge = (saga: StudentSaga) => {
    const hasAll = saga.inledning_text && saga.huvuddel_text && saga.avslutning_text;
    const hasTwo = [saga.inledning_text, saga.huvuddel_text, saga.avslutning_text].filter(Boolean).length === 2;
    const hasOne = saga.inledning_text || saga.huvuddel_text || saga.avslutning_text;

    if (hasAll) {
      return <Badge className="bg-green-100 text-green-700">🟢 Komplett</Badge>;
    } else if (hasTwo) {
      return <Badge className="bg-yellow-100 text-yellow-700">🟡 Nästan klar</Badge>;
    } else if (hasOne) {
      return <Badge className="bg-orange-100 text-orange-700">🟠 Påbörjad</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700">🔴 Ej påbörjad</Badge>;
  };

  const filteredSagor = sagor.filter(saga => {
    const studentName = saga.profiles?.name?.toLowerCase() || '';
    const title = saga.title.toLowerCase();
    const searchLower = search.toLowerCase();
    return studentName.includes(searchLower) || title.includes(searchLower);
  });

  const openCommentDialog = (saga: StudentSaga) => {
    setSelectedSaga(saga);
    setComment(saga.teacher_comment || '');
  };

  const saveComment = async () => {
    if (!selectedSaga) return;

    setSaving(true);
    const { error } = await supabase
      .from('sagor')
      .update({ teacher_comment: comment })
      .eq('id', selectedSaga.id);

    if (error) {
      toast.error('Kunde inte spara kommentar');
    } else {
      toast.success('Kommentar sparad! ✨');
      loadSagor();
      setSelectedSaga(null);
    }
    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
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
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök elev eller saga..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">📖 Elevsagor</h1>
          <p className="text-muted-foreground">
            {sagor.length} sagor totalt • {sagor.filter(s => s.inledning_text && s.huvuddel_text && s.avslutning_text).length} kompletta
          </p>
        </div>

        {filteredSagor.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Inga sagor hittades</h2>
            <p className="text-muted-foreground">
              {search ? 'Prova en annan sökning' : 'Inga elever har skrivit sagor ännu'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {filteredSagor.map(saga => (
              <Card key={saga.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{saga.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {saga.profiles?.name || 'Okänd elev'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(saga)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {formatDate(saga.created_at)}
                  </p>

                  {saga.teacher_comment && (
                    <div className="bg-muted/50 rounded p-2 mb-3 text-sm">
                      <p className="text-xs text-muted-foreground mb-1">Din kommentar:</p>
                      <p className="line-clamp-2">{saga.teacher_comment}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/saga/${saga.id}`)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Läs
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => openCommentDialog(saga)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Kommentera
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedSaga} onOpenChange={() => setSelectedSaga(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kommentera saga</DialogTitle>
            <DialogDescription>
              Skriv en kommentar till "{selectedSaga?.title}" av {selectedSaga?.profiles?.name}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Skriv din feedback här..."
            className="min-h-[150px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedSaga(null)}>
              Avbryt
            </Button>
            <Button onClick={saveComment} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Spara kommentar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
