import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Pencil, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hamtaSaga, sagaSomText, type Saga } from '@/lib/lager';
import { ritaScen } from '@/lib/illustration';
import { kanLasa, lasUpp, stopp } from '@/lib/ljud';

interface Sida {
  nykel: 'inledning' | 'huvuddel' | 'avslutning';
  rubrik: string;
  text: string;
}

export default function SagaSida() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saga, setSaga] = useState<Saga | undefined>(() => (id ? hamtaSaga(id) : undefined));
  const [sida, setSida] = useState(0);
  const [laser, setLaser] = useState(false);
  const stoppRef = useRef(false);

  useEffect(() => {
    setSaga(id ? hamtaSaga(id) : undefined);
  }, [id]);

  useEffect(() => () => stopp(), []);

  const sidor: Sida[] = useMemo(() => {
    if (!saga) return [];
    const alla: Sida[] = [
      { nykel: 'inledning', rubrik: 'Inledning', text: saga.inledning_text },
      { nykel: 'huvuddel', rubrik: 'Huvuddel', text: saga.huvuddel_text },
      { nykel: 'avslutning', rubrik: 'Avslutning', text: saga.avslutning_text },
    ];
    return alla.filter(s => s.text.trim().length > 0);
  }, [saga]);

  if (!saga) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg">Sagan finns inte på den här enheten.</p>
        <Button onClick={() => navigate('/')}>Till startsidan</Button>
      </div>
    );
  }

  const aktuell = sidor[sida];
  const bild = ritaScen({
    motiv: saga.motiv.length ? saga.motiv : ['📖'],
    tid: saga.tid,
    fro: saga.title.length * 13 + sida * 97 + 5,
  });

  const lasa = () => {
    if (!aktuell) return;
    if (laser) {
      stopp();
      setLaser(false);
      return;
    }
    setLaser(true);
    stoppRef.current = false;
    lasUpp(`${aktuell.rubrik}. ${aktuell.text}`, () => {
      if (!stoppRef.current) setLaser(false);
    });
  };

  const laddaNer = () => {
    const blob = new Blob([sagaSomText(saga)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${saga.title.replace(/[^\wåäöÅÄÖ \-]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Tillbaka">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="truncate font-semibold">{saga.title}</h1>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/skapa?saga=${saga.id}`} aria-label="Fortsätt skriva">
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={laddaNer} aria-label="Ladda ner sagan">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <img src={bild} alt="" className="w-full" />
          <div className="p-5 sm:p-8">
            {sidor.length === 0 ? (
              <div className="text-center">
                <p className="text-lg">Det finns ingen text ännu.</p>
                <Button className="mt-4" onClick={() => navigate(`/skapa?saga=${saga.id}`)}>
                  Skriv sagan
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{aktuell.rubrik}</p>
                  <span className="text-xs text-muted-foreground">
                    Sida {sida + 1} av {sidor.length}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed">{aktuell.text}</p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={lasa} disabled={!kanLasa()}>
                    {laser ? <Square className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                    {laser ? 'Stoppa' : 'Läs upp'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      stopp();
                      setLaser(false);
                      setSida(s => Math.max(0, s - 1));
                    }}
                    disabled={sida === 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Före
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      stopp();
                      setLaser(false);
                      setSida(s => Math.min(sidor.length - 1, s + 1));
                    }}
                    disabled={sida >= sidor.length - 1}
                  >
                    Nästa
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {!kanLasa() && (
          <p className="mt-4 text-sm text-muted-foreground">
            Uppläsning använder webbläsarens röst. Om den inte hörs, prova i Safari eller Chrome.
          </p>
        )}
      </main>
    </div>
  );
}