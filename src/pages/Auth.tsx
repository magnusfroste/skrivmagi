import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, User, GraduationCap, Users } from 'lucide-react';

type UserRole = 'student' | 'teacher' | 'parent';

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatedClassId, setValidatedClassId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/app');
    }
  }, [user, authLoading, navigate]);

  // Validate class code when it changes (debounced)
  useEffect(() => {
    if (role !== 'student' || classCode.length < 6) {
      setValidatedClassId(null);
      return;
    }

    const validateCode = async () => {
      const { data } = await supabase
        .from('classes')
        .select('id')
        .eq('join_code', classCode.toUpperCase())
        .maybeSingle();
      
      setValidatedClassId(data?.id || null);
    };

    const timeout = setTimeout(validateCode, 300);
    return () => clearTimeout(timeout);
  }, [classCode, role]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error('Fyll i alla fält');
      return;
    }

    if (password.length < 6) {
      toast.error('Lösenordet måste vara minst 6 tecken');
      return;
    }

    // For students, validate class code
    if (role === 'student' && classCode) {
      if (!validatedClassId) {
        toast.error('Ogiltig klasskod');
        return;
      }
    }

    setLoading(true);

    const redirectUrl = `${window.location.origin}/`;
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role
        }
      }
    });

    if (error) {
      setLoading(false);
      if (error.message.includes('already registered')) {
        toast.error('E-postadressen är redan registrerad');
      } else {
        toast.error(error.message);
      }
      return;
    }

    // If student with class code, update profile
    if (role === 'student' && validatedClassId && authData.user) {
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await supabase
        .from('profiles')
        .update({ class_id: validatedClassId })
        .eq('user_id', authData.user.id);
    }

    setLoading(false);
    toast.success('Konto skapat! Välkommen till SkrivMagi! ✨');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Fyll i e-post och lösenord');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Fel e-post eller lösenord');
      } else {
        toast.error(error.message);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const roleIcons = {
    student: <User className="h-4 w-4" />,
    teacher: <GraduationCap className="h-4 w-4" />,
    parent: <Users className="h-4 w-4" />
  };

  const roleLabels = {
    student: 'Elev',
    teacher: 'Lärare',
    parent: 'Förälder'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Välkommen till SkrivMagi ✨</CardTitle>
          <CardDescription>Logga in eller skapa ett konto</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.se"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Lösenord</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loggar in...
                    </>
                  ) : (
                    'Logga in'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Namn</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ditt namn"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-post</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.se"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Lösenord</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minst 6 tecken"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Jag är...</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['student', 'teacher', 'parent'] as UserRole[]).map((r) => (
                      <Button
                        key={r}
                        type="button"
                        variant={role === r ? 'default' : 'outline'}
                        className="flex flex-col h-auto py-3 gap-1"
                        onClick={() => setRole(r)}
                      >
                        {roleIcons[r]}
                        <span className="text-xs">{roleLabels[r]}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {role === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="class-code">Klasskod (valfritt)</Label>
                    <Input
                      id="class-code"
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                      placeholder="T.ex. ABC123"
                      maxLength={6}
                      className={classCode.length === 6 ? (validatedClassId ? 'border-green-500' : 'border-destructive') : ''}
                    />
                    {classCode.length === 6 && !validatedClassId && (
                      <p className="text-xs text-destructive">Ogiltig klasskod</p>
                    )}
                    {validatedClassId && (
                      <p className="text-xs text-green-600">✓ Klasskod giltig</p>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Skapar konto...
                    </>
                  ) : (
                    'Skapa konto'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
