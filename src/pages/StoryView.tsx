import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Volume2, Mic, Download, Send, Loader2, Play, Pause, Image, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Saga {
  id: string;
  title: string;
  inledning_text: string | null;
  huvuddel_text: string | null;
  avslutning_text: string | null;
  bild_inledning: string | null;
  bild_huvuddel: string | null;
  bild_avslutning: string | null;
  audio_elevenlabs_url: string | null;
  is_public: boolean;
  share_slug: string | null;
}

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [saga, setSaga] = useState<Saga | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 3, part: '' });
  const [isSharing, setIsSharing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (id) {
      loadSaga();
    }
  }, [id, user, authLoading]);

  const loadSaga = async () => {
    const { data, error } = await supabase
      .from('sagor')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Kunde inte ladda sagan');
      navigate('/mina-sagor');
    } else {
      setSaga(data);
      if (data.audio_elevenlabs_url) {
        setAudioUrl(data.audio_elevenlabs_url);
      }
    }
    setLoading(false);
  };

  const generateNarration = async () => {
    if (!saga) return;

    const fullText = `${saga.title}. 

${saga.inledning_text || ''}

${saga.huvuddel_text || ''}

${saga.avslutning_text || ''}

Och så levde de lyckliga i alla sina dagar. Slut!`;

    setIsGeneratingAudio(true);

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: fullText }
      });

      if (error) throw error;

      // Save audio to storage
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const fileName = `${saga.id}/narration.mp3`;
      const { error: uploadError } = await supabase.storage
        .from('saga-ljud')
        .upload(fileName, audioBlob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('saga-ljud')
        .getPublicUrl(fileName);

      // Update saga with audio URL
      await supabase
        .from('sagor')
        .update({ audio_elevenlabs_url: publicUrl })
        .eq('id', saga.id);

      setAudioUrl(publicUrl);
      toast.success('Uppläsning klar! 🎧');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('Kunde inte skapa uppläsning');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const generateImages = async () => {
    if (!saga) return;

    setIsGeneratingImages(true);
    toast.info('🎨 Skapar bilder... Detta tar cirka 1-2 minuter.', {
      duration: 5000
    });

    try {
      const parts = [
        { key: 'bild_inledning', text: saga.inledning_text, name: 'Inledning' },
        { key: 'bild_huvuddel', text: saga.huvuddel_text, name: 'Huvuddel' },
        { key: 'bild_avslutning', text: saga.avslutning_text, name: 'Avslutning' }
      ];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.text) {
          setImageProgress({ current: i + 1, total: parts.length, part: part.name });
          
          const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { 
              text: part.text, 
              sagaId: saga.id, 
              partKey: part.key,
              title: saga.title
            }
          });

          if (error) throw error;

          await supabase
            .from('sagor')
            .update({ [part.key]: data.imageUrl })
            .eq('id', saga.id);
        }
      }

      await loadSaga();
      toast.success('Bilder skapade! 🎨');
    } catch (error) {
      console.error('Error generating images:', error);
      toast.error('Kunde inte skapa bilder');
    } finally {
      setIsGeneratingImages(false);
      setImageProgress({ current: 0, total: 3, part: '' });
    }
  };

  const handleShare = async () => {
    if (!saga) return;

    setIsSharing(true);

    try {
      // Generate unique slug if not exists
      let slug = saga.share_slug;
      if (!slug) {
        slug = `${saga.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;
      }

      // Make saga public
      const { error } = await supabase
        .from('sagor')
        .update({ is_public: true, share_slug: slug })
        .eq('id', saga.id);

      if (error) throw error;

      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/sagoscenen/visa/${slug}`;
      await navigator.clipboard.writeText(shareUrl);

      toast.success('Din saga har premiär på SagoScenen! Länk kopierad! 🎭✨');
      setSaga({ ...saga, is_public: true, share_slug: slug });
    } catch (error) {
      console.error('Error sharing saga:', error);
      toast.error('Kunde inte dela sagan');
    } finally {
      setIsSharing(false);
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const pages = [
    { title: saga?.title || 'Min saga', content: null, image: saga?.bild_inledning, type: 'cover' },
    { title: '🌅 Inledning', content: saga?.inledning_text, image: saga?.bild_inledning },
    { title: '⚡ Huvuddel', content: saga?.huvuddel_text, image: saga?.bild_huvuddel },
    { title: '🌟 Avslutning', content: saga?.avslutning_text, image: saga?.bild_avslutning }
  ];

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!saga) return null;

  const currentPageData = pages[currentPage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/mina-sagor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tillbaka
          </Button>
          <div className="flex items-center gap-2">
            {/* Image generation button with status */}
            <div className="flex flex-col items-end gap-1">
              <Button
                variant={saga.bild_inledning && saga.bild_huvuddel && saga.bild_avslutning ? "default" : "outline"}
                size="sm"
                onClick={generateImages}
                disabled={isGeneratingImages}
              >
                {isGeneratingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Skapar {imageProgress.current}/{imageProgress.total}...
                  </>
                ) : saga.bild_inledning && saga.bild_huvuddel && saga.bild_avslutning ? (
                  <>
                    ✓ Bilder skapade
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    🎨 Skapa bilder
                  </>
                )}
              </Button>
              {isGeneratingImages && imageProgress.part && (
                <span className="text-xs text-muted-foreground">
                  {imageProgress.part}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateNarration}
              disabled={isGeneratingAudio}
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Volume2 className="h-4 w-4 mr-2" />
              )}
              Skapa uppläsning
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Share2 className="h-4 w-4 mr-2" />
              )}
              {saga.is_public ? 'På scenen!' : '🎭 Gå upp på scenen'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Card className="max-w-2xl mx-auto overflow-hidden">
          {/* Image area */}
          <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
            {currentPageData.image ? (
              <img
                src={currentPageData.image}
                alt={currentPageData.title}
                className="w-full h-full object-cover"
              />
            ) : isGeneratingImages ? (
              <div className="text-center text-muted-foreground">
                <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                <p className="font-semibold text-lg">Skapar din bild...</p>
                <p className="text-sm mt-2">{imageProgress.part}</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Image className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Klicka "Skapa bilder" för att generera illustrationer</p>
              </div>
            )}

            {currentPage === 0 && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-8">
                <h1 className="text-4xl font-bold text-center">{saga.title}</h1>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            {currentPageData.type !== 'cover' && (
              <>
                <h2 className="text-xl font-semibold mb-4">{currentPageData.title}</h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {currentPageData.content || 'Ingen text ännu...'}
                </p>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                ← Föregående
              </Button>

              <div className="flex items-center gap-2">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                disabled={currentPage === pages.length - 1}
              >
                Nästa →
              </Button>
            </div>

            {/* Audio player */}
            {audioUrl && (
              <div className="mt-4 p-4 bg-muted rounded-lg flex items-center gap-4">
                <Button size="icon" variant="outline" onClick={playAudio}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {isPlaying ? 'Spelar upp...' : 'Klicka för att lyssna på sagan'}
                </span>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
