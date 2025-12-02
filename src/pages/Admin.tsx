import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save, Shield, Eye, EyeOff, ExternalLink, TestTube } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'magnus@froste.eu';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [imageProvider, setImageProvider] = useState<'dalle3' | 'lovable_ai' | 'gemini_direct' | 'imagen_direct'>('dalle3');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);

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
        .select('key, value')
        .in('key', ['image_provider', 'gemini_api_key', 'tts_enabled']);

      if (error) throw error;

      const settings = data?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      if (settings?.image_provider) {
        setImageProvider(settings.image_provider as any);
      }
      if (settings?.gemini_api_key) {
        setGeminiApiKey(settings.gemini_api_key);
      }
      if (settings?.tts_enabled) {
        setTtsEnabled(settings.tts_enabled === 'true');
      }
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
      // Save image provider
      const { error: providerError } = await supabase.functions.invoke('admin-settings', {
        body: { 
          action: 'update',
          key: 'image_provider',
          value: imageProvider
        }
      });

      if (providerError) throw providerError;

      // Save API key if imagen_direct is selected and key is provided
      if (imageProvider === 'imagen_direct' && geminiApiKey) {
        const { error: keyError } = await supabase.functions.invoke('admin-settings', {
          body: {
            action: 'update',
            key: 'gemini_api_key',
            value: geminiApiKey,
          }
        });

        if (keyError) throw keyError;
      }

      // Save TTS enabled setting
      const { error: ttsError } = await supabase.functions.invoke('admin-settings', {
        body: {
          action: 'update',
          key: 'tts_enabled',
          value: ttsEnabled.toString()
        }
      });

      if (ttsError) throw ttsError;

      toast.success('✓ Inställningar sparade');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Kunde inte spara inställningar');
    } finally {
      setSaving(false);
    }
  };

  const testImageGeneration = async () => {
    if (!geminiApiKey) {
      toast.error('Ange API-nyckel först');
      return;
    }

    setTesting(true);
    setTestImageUrl(null);

    try {
      // First save the API key
      const { error: keyError } = await supabase.functions.invoke('admin-settings', {
        body: {
          action: 'update',
          key: 'gemini_api_key',
          value: geminiApiKey,
        }
      });

      if (keyError) throw keyError;

      // Then test image generation
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: 'En söt robot som håller en röd skateboard, barnteckningsstil, mjuka pastellfärger',
          saga_id: 'test',
          part: 'test'
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setTestImageUrl(data.imageUrl);
        toast.success('✓ Test lyckades! API-nyckeln fungerar.');
      } else {
        throw new Error('Ingen bild genererades');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(`Test misslyckades: ${error.message || 'Okänt fel'}`);
    } finally {
      setTesting(false);
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

                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="gemini_direct" id="gemini_direct" />
                    <Label htmlFor="gemini_direct" className="flex-1 cursor-pointer">
                      <div className="font-semibold">✨ Gemini 3 Pro (senaste modellen)</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Lovables senaste Gemini-modell för bildgenerering (~3-8 sekunder)
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="imagen_direct" id="imagen_direct" />
                    <Label htmlFor="imagen_direct" className="flex-1 cursor-pointer">
                      <div className="font-semibold">🖼️ Imagen 4.0 (egen nyckel)</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Googles senaste modell med din egen API-nyckel
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {imageProvider === 'imagen_direct' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="gemini_api_key">Gemini API-nyckel</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="gemini_api_key"
                        type={showApiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Din Gemini API-nyckel"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://aistudio.google.com/apikey', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hämta din API-nyckel från Google AI Studio
                  </p>
                  
                  <div className="mt-4 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={testImageGeneration}
                      disabled={testing || !geminiApiKey}
                      className="w-full"
                    >
                      {testing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Testar API-nyckel...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Testa API-nyckel
                        </>
                      )}
                    </Button>

                    {testImageUrl && (
                      <div className="border rounded-lg p-4 bg-muted/30">
                        <p className="text-sm font-medium mb-2 text-success">✓ Test lyckades!</p>
                        <img 
                          src={testImageUrl} 
                          alt="Testbild" 
                          className="w-full rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TTS Setting */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">🎙️ Uppläsning (Text-till-tal)</h3>
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label htmlFor="tts_enabled" className="font-semibold">Aktivera uppläsning</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visa "Skapa uppläsning"-knappen i sagvisningen (under utveckling)
                  </p>
                </div>
                <Switch
                  id="tts_enabled"
                  checked={ttsEnabled}
                  onCheckedChange={setTtsEnabled}
                />
              </div>
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
