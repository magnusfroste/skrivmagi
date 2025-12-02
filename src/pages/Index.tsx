import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Library, Users, Sparkles, Pencil, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Index() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleModeSelect = (mode: string) => {
    navigate(`/skapa?lage=${mode}`);
  };

  // Teacher dashboard redirect
  useEffect(() => {
    if (!loading && role === 'teacher') {
      navigate('/larare');
    }
  }, [role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { label: 'Mina sagor', icon: Library, onClick: () => navigate('/mina-sagor') },
    { label: 'Min klass', icon: Users, onClick: () => navigate('/min-klass') },
    { label: 'SagoScenen', icon: Sparkles, onClick: () => navigate('/sagoscenen') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-semibold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            SkrivMagi
          </h1>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Button key={item.label} variant="outline" size="sm" onClick={item.onClick}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>

          {/* Mobile navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-2 mt-6">
                {navItems.map((item) => (
                  <Button 
                    key={item.label} 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => {
                      item.onClick();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
                <hr className="my-2" />
                <Button variant="ghost" className="justify-start text-destructive" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logga ut
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Hej, skrivmagiker! 🪄</h2>
          <p className="text-muted-foreground text-lg">Välj hur du vill skapa din saga idag</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50" onClick={() => handleModeSelect('pussel')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                Pusselläge
              </CardTitle>
              <CardDescription>
                Dra och släpp kort för att skapa din saga. Perfekt för nybörjare!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50" onClick={() => handleModeSelect('halv')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✍️</span>
                Halv-fritt läge
              </CardTitle>
              <CardDescription>
                Använd kort som inspiration och skriv din egen text.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50" onClick={() => handleModeSelect('fritt')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                Fritt läge
              </CardTitle>
              <CardDescription>
                Skriv helt fritt med hjälp av AI-coachen.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Eller utforska...</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/mina-sagor')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  Mina sagor
                </CardTitle>
                <CardDescription>Se och redigera dina tidigare sagor</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/skapa?lage=pussel')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Testa SkrivMagi
                </CardTitle>
                <CardDescription>Prova själv att skapa en saga</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
