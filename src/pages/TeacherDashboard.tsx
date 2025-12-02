import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Loader2, MessageSquare, Search, User, Sparkles, Users } from 'lucide-react';
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
  is_public: boolean;
  profiles: {
    user_id: string;
    name: string;
    email: string;
  };
}

interface StudentStats {
  user_id: string;
  name: string;
  totalSagor: number;
  completeSagor: number;
  onStageSagor: number;
}

type StatusFilter = 'all' | 'complete' | 'started' | 'not_started';
type SortBy = 'newest' | 'oldest' | 'student' | 'status';

export default function TeacherDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sagor, setSagor] = useState<StudentSaga[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSaga, setSelectedSaga] = useState<StudentSaga | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Filtering and sorting state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [onStageFilter, setOnStageFilter] = useState(false);
  const [studentFilter, setStudentFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('newest');

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
    // Get students in teacher's classes using the security definer function
    const { data: studentIds, error: studentsError } = await supabase
      .rpc('get_students_in_teacher_classes', { _teacher_id: user?.id });

    if (studentsError) {
      console.error('Error loading students:', studentsError);
      toast.error('Kunde inte ladda elever');
      setLoading(false);
      return;
    }

    if (!studentIds || studentIds.length === 0) {
      setSagor([]);
      setLoading(false);
      return;
    }

    // Load sagor only from teacher's students
    const { data: sagorData, error: sagorError } = await supabase
      .from('sagor')
      .select('*')
      .in('student_id', studentIds)
      .order('created_at', { ascending: false });

    if (sagorError) {
      console.error('Error loading sagor:', sagorError);
      toast.error('Kunde inte ladda sagor');
      setLoading(false);
      return;
    }

    // Load profiles for each saga
    const uniqueStudentIds = [...new Set(sagorData?.map(s => s.student_id) || [])];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .in('user_id', uniqueStudentIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

    const enrichedSagor = (sagorData || []).map(saga => ({
      ...saga,
      profiles: profilesMap.get(saga.student_id) || { user_id: saga.student_id, name: 'Okänd', email: '' }
    }));

    setSagor(enrichedSagor as StudentSaga[]);
    setLoading(false);
  };

  // Calculate student statistics
  const studentStats = useMemo((): StudentStats[] => {
    const statsMap = new Map<string, StudentStats>();

    sagor.forEach(saga => {
      const userId = saga.profiles.user_id;
      if (!statsMap.has(userId)) {
        statsMap.set(userId, {
          user_id: userId,
          name: saga.profiles.name,
          totalSagor: 0,
          completeSagor: 0,
          onStageSagor: 0,
        });
      }

      const stats = statsMap.get(userId)!;
      stats.totalSagor++;
      if (saga.inledning_text && saga.huvuddel_text && saga.avslutning_text) {
        stats.completeSagor++;
      }
      if (saga.is_public) {
        stats.onStageSagor++;
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'sv'));
  }, [sagor]);

  const getSagaStatus = (saga: StudentSaga): 'complete' | 'started' | 'not_started' => {
    const hasAll = saga.inledning_text && saga.huvuddel_text && saga.avslutning_text;
    const hasAny = saga.inledning_text || saga.huvuddel_text || saga.avslutning_text;

    if (hasAll) return 'complete';
    if (hasAny) return 'started';
    return 'not_started';
  };

  const getStatusBadge = (saga: StudentSaga) => {
    const status = getSagaStatus(saga);

    if (status === 'complete') {
      return <Badge className="bg-green-100 text-green-700 border-green-300">🟢 Komplett</Badge>;
    } else if (status === 'started') {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-300">🟠 Påbörjad</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 border-red-300">🔴 Ej påbörjad</Badge>;
  };

  // Check if saga is newly published (within last 7 days)
  const isNewlyPublished = (saga: StudentSaga): boolean => {
    if (!saga.is_public) return false;
    const daysSinceCreation = (Date.now() - new Date(saga.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 7;
  };

  // Apply filters and sorting
  const filteredAndSortedSagor = useMemo(() => {
    let filtered = sagor.filter(saga => {
      // Search filter
      const studentName = saga.profiles?.name?.toLowerCase() || '';
      const title = saga.title.toLowerCase();
      const searchLower = search.toLowerCase();
      const matchesSearch = studentName.includes(searchLower) || title.includes(searchLower);

      // Status filter
      const status = getSagaStatus(saga);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      // On stage filter
      const matchesOnStage = !onStageFilter || saga.is_public;

      // Student filter
      const matchesStudent = !studentFilter || saga.profiles.user_id === studentFilter;

      return matchesSearch && matchesStatus && matchesOnStage && matchesStudent;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'student':
          return a.profiles.name.localeCompare(b.profiles.name, 'sv');
        case 'status': {
          const statusOrder = { complete: 0, started: 1, not_started: 2 };
          return statusOrder[getSagaStatus(a)] - statusOrder[getSagaStatus(b)];
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [sagor, search, statusFilter, onStageFilter, studentFilter, sortBy]);

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
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
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

      <main className="container py-8 space-y-8">
        {/* Header with stats */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">📖 Elevsagor</h1>
          <p className="text-muted-foreground">
            {sagor.length} sagor totalt • {sagor.filter(s => getSagaStatus(s) === 'complete').length} kompletta • {sagor.filter(s => s.is_public).length} på scenen
          </p>
        </div>

        {/* Student overview section */}
        {studentStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dina elever
              </CardTitle>
              <CardDescription>
                Översikt över elevernas aktivitet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {studentStats.map(stats => (
                  <button
                    key={stats.user_id}
                    onClick={() => setStudentFilter(studentFilter === stats.user_id ? null : stats.user_id)}
                    className={`text-left p-4 rounded-lg border transition-all hover:shadow-md ${
                      studentFilter === stats.user_id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stats.name}</span>
                      </div>
                      {studentFilter === stats.user_id && (
                        <Badge variant="secondary" className="text-xs">Filtrerad</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>📚 {stats.totalSagor} sagor</span>
                      <span>✅ {stats.completeSagor} kompletta</span>
                      {stats.onStageSagor > 0 && (
                        <span className="text-primary font-medium">🎭 {stats.onStageSagor} på scenen</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and sorting */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Status filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  Alla
                </Button>
                <Button
                  variant={statusFilter === 'complete' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('complete')}
                >
                  🟢 Komplett
                </Button>
                <Button
                  variant={statusFilter === 'started' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('started')}
                >
                  🟠 Påbörjad
                </Button>
                <Button
                  variant={statusFilter === 'not_started' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('not_started')}
                >
                  🔴 Ej påbörjad
                </Button>
                <div className="flex-1" />
                <Button
                  variant={onStageFilter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOnStageFilter(!onStageFilter)}
                >
                  🎭 På scenen
                </Button>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sortera:</span>
                <Button
                  variant={sortBy === 'newest' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('newest')}
                >
                  Nyast
                </Button>
                <Button
                  variant={sortBy === 'oldest' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('oldest')}
                >
                  Äldst
                </Button>
                <Button
                  variant={sortBy === 'student' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('student')}
                >
                  Elev A-Ö
                </Button>
                <Button
                  variant={sortBy === 'status' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('status')}
                >
                  Status
                </Button>
              </div>

              {/* Active filters indicator */}
              {(studentFilter || statusFilter !== 'all' || onStageFilter) && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Aktiva filter:</span>
                  {studentFilter && (
                    <Badge variant="secondary" className="gap-1">
                      {studentStats.find(s => s.user_id === studentFilter)?.name}
                      <button onClick={() => setStudentFilter(null)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1">
                      {statusFilter === 'complete' ? 'Komplett' : statusFilter === 'started' ? 'Påbörjad' : 'Ej påbörjad'}
                      <button onClick={() => setStatusFilter('all')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {onStageFilter && (
                    <Badge variant="secondary" className="gap-1">
                      På scenen
                      <button onClick={() => setOnStageFilter(false)} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStudentFilter(null);
                      setStatusFilter('all');
                      setOnStageFilter(false);
                    }}
                    className="ml-auto text-xs"
                  >
                    Rensa alla filter
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saga cards */}
        {filteredAndSortedSagor.length === 0 ? (
          <Card className="max-w-md mx-auto text-center p-8">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Inga sagor hittades</h2>
            <p className="text-muted-foreground">
              {search || statusFilter !== 'all' || onStageFilter || studentFilter
                ? 'Prova att justera dina filter'
                : 'Inga elever har skrivit sagor ännu'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedSagor.map(saga => (
              <Card key={saga.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{saga.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{saga.profiles?.name || 'Okänd elev'}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(saga)}
                  </div>
                  
                  {/* On Stage Badge */}
                  {saga.is_public && (
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                        🎭 På scenen
                      </Badge>
                      {isNewlyPublished(saga) && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Ny på scenen!
                        </Badge>
                      )}
                    </div>
                  )}
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
