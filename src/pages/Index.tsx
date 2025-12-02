import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle, Pencil, Sparkles, LogOut, BookOpen, GraduationCap } from 'lucide-react';

export default function Index() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleModeSelect = (mode: string) => {
    navigate(`/bygg?lage=${mode}`);
  };

  // Teacher dashboard redirect
  if (role === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪄</span>
            <h1 className="text-xl font-bold">SkrivMagi</h1>
          </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Lärare
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logga ut
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Lärarvy</h2>
            <p className="text-muted-foreground">Se och kommentera dina elevers sagor</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/larare')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Elevsagor
                </CardTitle>
                <CardDescription>Se alla sagor från dina elever</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/bygg?lage=pussel')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Testa sagobyggaren
                </CardTitle>
                <CardDescription>Prova själv att bygga en saga</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪄</span>
            <h1 className="text-xl font-bold">SkrivMagi</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/mina-sagor')}>
              Mina sagor
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/sagoscenen')}>
              🎭 SagoScenen
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Välkommen till SkrivMagi! 🪄✨</h2>
          <p className="text-xl text-muted-foreground">Välj hur du vill bygga din saga</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-green-200 bg-green-50/50"
            onClick={() => handleModeSelect('pussel')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <Puzzle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-xl">🧩 Pusselläge</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Dra och släpp färdiga kort för att bygga din saga. Enklast!
              </CardDescription>
              <div className="mt-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                Perfekt för nybörjare
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-yellow-200 bg-yellow-50/50"
            onClick={() => handleModeSelect('halv')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
                <Pencil className="h-10 w-10 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">✏️ Halv-fritt läge</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Använd kort som hjälp och skriv egna meningar också.
              </CardDescription>
              <div className="mt-4 inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                Bra för lite övning
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 border-blue-200 bg-blue-50/50"
            onClick={() => handleModeSelect('fritt')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-xl">✨ Fritt läge</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Skriv helt fritt med AI-coach som hjälper dig!
              </CardDescription>
              <div className="mt-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                För erfarna skribenter
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            🎯 Tips: En bra saga har en <span className="font-semibold text-green-600">inledning</span>, 
            <span className="font-semibold text-yellow-600"> huvuddel</span> och 
            <span className="font-semibold text-blue-600"> avslutning</span>!
          </p>
        </div>
      </main>
    </div>
  );
}
