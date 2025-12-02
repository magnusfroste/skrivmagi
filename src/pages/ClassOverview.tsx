import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Loader2, Sparkles, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Classmate {
  user_id: string;
  name: string;
  email: string;
}

interface PublicSaga {
  id: string;
  title: string;
  share_slug: string;
  upvotes: number;
  created_at: string;
  student_id: string;
  student_name: string;
}

interface ClassInfo {
  id: string;
  class_name: string;
}

export default function ClassOverview() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [publicSagas, setPublicSagas] = useState<PublicSaga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      if (role !== 'student') {
        navigate('/');
        return;
      }
      loadClassData();
    }
  }, [user, role, authLoading]);

  const loadClassData = async () => {
    // Get student's class
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('class_id')
      .eq('user_id', user?.id)
      .single();

    if (profileError || !profileData?.class_id) {
      console.error('Error loading profile:', profileError);
      setLoading(false);
      return;
    }

    // Get class info
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, class_name')
      .eq('id', profileData.class_id)
      .single();

    if (classError) {
      console.error('Error loading class:', classError);
      toast.error('Kunde inte ladda klassinformation');
    } else {
      setClassInfo(classData);
    }

    // Get all classmates
    const { data: classmatesData, error: classmatesError } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .eq('class_id', profileData.class_id)
      .order('name');

    if (classmatesError) {
      console.error('Error loading classmates:', classmatesError);
      toast.error('Kunde inte ladda klasskamrater');
    } else {
      setClassmates(classmatesData || []);
    }

    // Get all public sagas from classmates
    const classmateIds = classmatesData?.map(c => c.user_id) || [];
    
    if (classmateIds.length > 0) {
      const { data: sagasData, error: sagasError } = await supabase
        .from('sagor')
        .select('id, title, share_slug, upvotes, created_at, student_id')
        .in('student_id', classmateIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (sagasError) {
        console.error('Error loading sagas:', sagasError);
      } else {
        // Enrich with student names
        const classmatesMap = new Map(classmatesData?.map(c => [c.user_id, c.name]) || []);
        const enrichedSagas = (sagasData || []).map(saga => ({
          ...saga,
          student_name: classmatesMap.get(saga.student_id) || 'Okänd'
        }));
        setPublicSagas(enrichedSagas);
      }
    }

    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
          <div className="container flex h-14 items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka
            </Button>
          </div>
        </header>
        <main className="container py-8">
          <Card className="max-w-md mx-auto text-center p-8">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Du är inte med i någon klass</h2>
            <p className="text-muted-foreground mb-4">
              Fråga din lärare om klasskoden för att gå med i klassen
            </p>
            <Button onClick={() => navigate('/app')}>Tillbaka till start</Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Users className="h-8 w-8" />
            {classInfo.class_name}
          </h1>
          <p className="text-muted-foreground">
            {classmates.length} klasskamrater • {publicSagas.length} sagor på scenen
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Classmates list */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Klasskamrater ({classmates.length})
            </h2>
            <div className="space-y-2">
              {classmates.map((classmate) => (
                <Card
                  key={classmate.user_id}
                  className={`${
                    classmate.user_id === user?.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(classmate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        {classmate.name}
                        {classmate.user_id === user?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Det är jag!
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {publicSagas.filter(s => s.student_id === classmate.user_id).length} sagor på
                        scenen
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Public sagas from class */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Sagor på SagoScenen ({publicSagas.length})
            </h2>
            {publicSagas.length === 0 ? (
              <Card className="text-center p-8">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Ingen i klassen har publicerat sagor på SagoScenen ännu
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {publicSagas.map((saga) => (
                  <Card
                    key={saga.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/sagoscenen/visa/${saga.share_slug}`)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{saga.title}</span>
                        {saga.student_id === user?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Min saga
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {getInitials(saga.student_name)}
                          </AvatarFallback>
                        </Avatar>
                        {saga.student_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          👏 {saga.upvotes} applåder
                        </span>
                        <span>{formatDate(saga.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Call to action */}
        {publicSagas.filter(s => s.student_id === user?.id).length === 0 && (
          <Card className="mt-8 bg-primary/5 border-primary">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Dela dina sagor!</h3>
              <p className="text-muted-foreground mb-4">
                Visa dina klasskamrater vad du har skapat. Gå till "Mina sagor" och klicka på "Gå
                upp på scenen" för att publicera din saga.
              </p>
              <Button onClick={() => navigate('/mina-sagor')}>Gå till Mina sagor</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
