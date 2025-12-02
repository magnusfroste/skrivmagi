import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Loader2, Plus, Trash2, Users } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';

interface Class {
  id: string;
  class_name: string;
  join_code: string;
  created_at: string;
}

interface Student {
  user_id: string;
  name: string;
  email: string;
}

export default function ClassManagement() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);

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
      loadClasses();
    }
  }, [user, role, authLoading]);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id);
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading classes:', error);
      toast.error('Kunde inte ladda klasser');
    } else {
      setClasses(data || []);
      if (data && data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    }
    setLoading(false);
  };

  const loadStudents = async (classId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, name, email')
      .eq('class_id', classId);

    if (error) {
      console.error('Error loading students:', error);
      toast.error('Kunde inte ladda elever');
    } else {
      setStudents(data || []);
    }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setCreating(true);
    const { data, error } = await supabase
      .from('classes')
      .insert({ class_name: newClassName, teacher_id: user?.id })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      toast.error('Kunde inte skapa klass');
    } else {
      toast.success('Klass skapad! ✨');
      setNewClassName('');
      loadClasses();
      setSelectedClass(data);
    }
    setCreating(false);
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Klasskod kopierad! 📋');
  };

  const removeStudent = async () => {
    if (!studentToRemove) return;

    const { error } = await supabase
      .from('profiles')
      .update({ class_id: null })
      .eq('user_id', studentToRemove.user_id);

    if (error) {
      console.error('Error removing student:', error);
      toast.error('Kunde inte ta bort elev');
    } else {
      toast.success('Elev borttagen från klassen');
      if (selectedClass) {
        loadStudents(selectedClass.id);
      }
    }
    setStudentToRemove(null);
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
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
        </div>
      </header>

      <main className="container py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">👥 Min klass</h1>
          <p className="text-muted-foreground">
            Hantera dina klasser och se vilka elever som är med
          </p>
        </div>

        {/* Create new class */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Skapa ny klass
            </CardTitle>
            <CardDescription>
              En klasskod genereras automatiskt som elever kan använda för att gå med
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createClass} className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="class-name" className="sr-only">
                  Klassnamn
                </Label>
                <Input
                  id="class-name"
                  placeholder="T.ex. 3A, Åk 2 Blå, ..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Skapa klass
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Class list and details */}
        {classes.length === 0 ? (
          <Card className="text-center p-8">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">Inga klasser än</h2>
            <p className="text-muted-foreground">
              Skapa din första klass för att börja använda SkrivMagi med dina elever
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Class selector */}
            <div className="space-y-3">
              <h2 className="font-semibold text-lg">Dina klasser</h2>
              {classes.map((cls) => (
                <Card
                  key={cls.id}
                  className={`cursor-pointer transition-all ${
                    selectedClass?.id === cls.id
                      ? 'border-primary shadow-md'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedClass(cls)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{cls.class_name}</CardTitle>
                    <CardDescription className="text-xs">
                      Skapad {new Date(cls.created_at).toLocaleDateString('sv-SE')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Selected class details */}
            {selectedClass && (
              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedClass.class_name}</CardTitle>
                    <CardDescription>Klasskod för elevregistrering</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-background rounded-lg border-2 border-dashed border-primary p-4 text-center">
                        <div className="text-3xl font-bold tracking-wider text-primary">
                          {selectedClass.join_code}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyJoinCode(selectedClass.join_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Visa denna kod för dina elever så de kan gå med i klassen vid registrering
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Elever ({students.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Inga elever har gått med ännu
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div
                            key={student.user_id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setStudentToRemove(student)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </main>

      <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ta bort elev från klass?</AlertDialogTitle>
            <AlertDialogDescription>
              {studentToRemove?.name} kommer att tas bort från klassen. Eleven kan gå med igen med
              klasskoden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={removeStudent}>Ta bort</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
