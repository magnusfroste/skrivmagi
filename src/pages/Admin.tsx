import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Save, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'magnus@froste.eu';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [imageProvider, setImageProvider] = useState<'dalle3' | 'lovable_ai'>('dalle3');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        toast.error('Åtkomst nekad');
        navigate('/');
        return;
      }
      loadSettings();
    }
  }, [user, authLoading, navigate]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'image_provider')
        .single();

      if (error) throw error;
      setImageProvider(data.value as 'dalle3' | 'lovable_ai');
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Kunde inte ladda inställningar');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke('admin-settings', {
        body: { 
          action: 'update',
          key: 'image_provider',
          value: imageProvider
        }
      });

      if (error) throw error;
      toast.success('✓ Inställningar sparade');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Kunde inte spara inställningar');
    } finally {
      setSaving(false);
    }
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
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚙️ Appinställningar
            </CardTitle>
            <CardDescription>
              Konfigurera systemets inställningar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">📷 Bildgenerering</h3>
              <RadioGroup value={imageProvider} onValueChange={(v) => setImageProvider(v as any)}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="dalle3" id="dalle3" />
                    <Label htmlFor="dalle3" className="flex-1 cursor-pointer">
                      <div className="font-semibold">⚡ DALL-E 3 (OpenAI)</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Högsta kvalitet, ~15-20 sekunder per bild
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="lovable_ai" id="lovable_ai" />
                    <Label htmlFor="lovable_ai" className="flex-1 cursor-pointer">
                      <div className="font-semibold">🚀 Lovable AI (Google Gemini)</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Snabbare, ~5-10 sekunder per bild
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Spara inställningar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
