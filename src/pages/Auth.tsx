import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [classCode, setClassCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name.trim()) {
      toast.error('Skriv in ditt namn');
      setIsLoading(false);
      return;
    }

    // Validate class code for students
    if (role === 'student' && classCode.trim()) {
      const { data: classData } = await supabase
        .from('classes')
        .select('id')
        .eq('join_code', classCode.toUpperCase())
        .single();

      if (!classData) {
        toast.error('Ogiltig klasskod');
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(email, password, name, role);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('E-postadressen är redan registrerad');
      } else {
        toast.error('Något gick fel: ' + error.message);
      }
    } else {
      // Link student to class if class code was provided
      if (role === 'student' && classCode.trim()) {
        const { data: classData } = await supabase
          .from('classes')
          .select('id, class_name')
          .eq('join_code', classCode.toUpperCase())
          .single();

        if (classData) {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await supabase
              .from('profiles')
              .update({ class_id: classData.id })
              .eq('user_id', newUser.id);
            
            toast.success(`Välkommen till SkrivMagi! Du är nu med i ${classData.class_name} 🎉`);
          }
        }
      } else {
        toast.success('Välkommen till SkrivMagi! 🎉');
      }
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Fel e-post eller lösenord');
      } else {
        toast.error('Något gick fel: ' + error.message);
      }
    } else {
      toast.success('Välkommen tillbaka! 📚');
      navigate('/');
    }

    setIsLoading(false);
  };

  const roleIcons = {
    student: <BookOpen className="h-4 w-4" />,
    teacher: <GraduationCap className="h-4 w-4" />,
    parent: <Users className="h-4 w-4" />
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🪄</div>
          <CardTitle className="text-2xl">SkrivMagi</CardTitle>
          <CardDescription>Skapa magiska sagor och gå upp på scenen! ✨</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logga in</TabsTrigger>
              <TabsTrigger value="register">Skapa konto</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-post</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="din@email.se"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Lösenord</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Loggar in...' : 'Logga in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ditt namn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-post</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="din@email.se"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Lösenord</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Minst 6 tecken"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jag är</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          {roleIcons.student}
                          <span>Elev</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="teacher">
                        <div className="flex items-center gap-2">
                          {roleIcons.teacher}
                          <span>Lärare</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="parent">
                        <div className="flex items-center gap-2">
                          {roleIcons.parent}
                          <span>Förälder</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="class-code">Klasskod (valfritt)</Label>
                    <Input
                      id="class-code"
                      type="text"
                      placeholder="T.ex. ABC123"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Fråga din lärare om klasskoden för att gå med i klassen
                    </p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Skapar konto...' : 'Skapa konto'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
