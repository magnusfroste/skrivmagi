import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Lightbulb, Loader2, Sparkles, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { KATEGORIER, kortFor, hittaKort, type Kategori } from '@/data/kort';
import { skriv, tips, type Del, type Kortval } from '@/lib/skrivaren';
import { hamtaSaga, nySaga, sparaSaga, type Saga } from '@/lib/lager';
import { lasUpp, stopp } from '@/lib/ljud';

const DELAR: { key: Del; namn: string; hjalp: string }[] = [
  { key: 'inledning', namn: 'Inledning', hjalp: 'Vem är med, var är vi och vad händer först?' },
  { key: 'huvuddel', namn: 'Huvuddel', hjalp: 'Nu blir det svårt. Vad försöker huvudpersonen göra?' },
  { key: 'avslutning', namn: 'Avslutning', hjalp: 'Hur löser det sig till slut?' },
];

const LAGE_NAMN: Record<Saga['lage'], string> = { pussel: 'Pussel', halv: 'Halv', fritt: 'Fritt' };

export default function Skapa() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lage = (params.get('lage') as Saga['lage']) || 'pussel';
  const befintligId = params.get('saga');

  const [saga, setSaga] = useState<Saga>(() => (befintligId && hamtaSaga(befintligId)) || nySaga(lage));
  const [zon, setZon] = useState<Del>('inledning');
  const [valda, setValda] = useState<Record<Del, string[]>>({ inledning: [], huvuddel: [], avslutning: [] });
  const [niva, setNiva] = useState(1);
  const [skriver, setSkriver] = useState(false);
  const [sparat, setSparat] = useState(true);
  const [laser, setLaser] = useState(false);

  const text = (d: Del) =>
    d === 'inledning' ? saga.inledning_text : d === 'huvuddel' ? saga.huvuddel_text : saga.avslutning_text;

  const andraText = useCallback((d: Del, v: string) => {
    setSaga(prev => ({
      ...prev,
      ...(d === 'inledning'
        ? { inledning_text: v }
        : d === 'huvuddel'
          ? { huvuddel_text: v }
          : { avslutning_text: v }),
    }));
    setSparat(false);
  }, []);

  // Spara automatiskt en kort stund efter att texten ändrats.
  useEffect(() => {
    const t = setTimeout(() => {
      sparaSaga(saga);
      setSparat(true);
    }, 700);
    return () => clearTimeout(t);
  }, [saga]);

  useEffect(() => () => stopp(), []);

  const korten = useMemo(() => {
    const map: Record<string, string[]> = {};
    (Object.keys(valda) as Del[]).forEach(d => {
      valda[d].forEach(id => {
        const k = hittaKort(id);
        if (k) map[k.kategori] = [...(map[k.kategori] || []), k.text];
      });
    });
    return map;
  }, [valda]);

  const zonKortval = (d: Del): Kortval => {
    const k: Kortval = {};
    valda[d].forEach(id => {
      const kort = hittaKort(id);
      if (!kort) return;
      if (kort.kategori === 'karaktar') k.karaktar = kort.text;
      if (kort.kategori === 'plats') k.plats = kort.text;
      if (kort.kategori === 'tid') k.tid = kort.text;
      if (kort.kategori === 'kansla') k.kansla = kort.text;
      if (kort.kategori === 'problem') k.problem = kort.text;
    });
    return k;
  };

  const laggTill = (kategori: Kategori, id: string) => {
    setValda(prev => {
      const lista = prev[zon];
      if (lista.includes(id)) return prev;
      const samma = lista.filter(x => hittaKort(x)?.kategori !== kategori);
      return { ...prev, [zon]: [...samma, id] };
    });
  };

  const taBort = (id: string) => setValda(prev => ({ ...prev, [zon]: prev[zon].filter(x => x !== id) }));

  const skrivText = () => {
    const k = zonKortval(zon);
    if (lage !== 'fritt' && Object.keys(k).length === 0) {
      toast.error('Välj minst ett kort först.');
      return;
    }
    setSkriver(true);
    const valt = valda[zon].map(id => hittaKort(id)).filter(Boolean);
    const motiv = valt.map(k => k!.motiv);
    const tid = k.tid || '';
    setTimeout(() => {
      const ny = skriv(
        zon,
        k,
        {
          inledning: zon !== 'inledning' ? saga.inledning_text : undefined,
          huvuddel: zon === 'avslutning' ? saga.huvuddel_text : undefined,
        },
        Date.now() % 100000,
      );
      const nySagaUppdaterad: Saga = {
        ...saga,
        ...(zon === 'inledning' ? { inledning_text: ny } : zon === 'huvuddel' ? { huvuddel_text: ny } : { avslutning_text: ny }),
        motiv: motiv.length ? motiv : saga.motiv,
        tid: tid || saga.tid,
      };
      setSaga(nySagaUppdaterad);
      setSkriver(false);
      toast.success('Texten är klar – ändra hur mycket du vill.');
    }, 420);
  };

  const lasUppZon = () => {
    const t = text(zon);
    if (!t.trim()) return;
    setLaser(true);
    lasUpp(t, () => setLaser(false));
  };

  const oppnaSagan = () => {
    sparaSaga(saga);
    navigate(`/saga/${saga.id}`);
  };

  const tipsLista = useMemo(() => tips(text(zon)), [saga, zon]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Tillbaka">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Input
            value={saga.title}
            onChange={e => setSaga(prev => ({ ...prev, title: e.target.value }))}
            className="h-9 max-w-xs border-0 bg-transparent px-2 text-base font-semibold shadow-none focus-visible:ring-0"
            aria-label="Sagans titel"
          />
          <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">
            {LAGE_NAMN[saga.lage]}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {sparat ? <Check className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {sparat ? 'Sparat' : 'Sparar'}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-5">
        {saga.lage !== 'fritt' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Svårighet:</span>
            {[1, 2, 3].map(n => (
              <Button
                key={n}
                size="sm"
                variant={niva === n ? 'default' : 'outline'}
                onClick={() => setNiva(n)}
              >
                {n === 1 ? 'Lätt' : n === 2 ? 'Mellan' : 'Svår'}
              </Button>
            ))}
          </div>
        )}

        <nav className="mt-5 flex gap-2" aria-label="Sagans delar">
          {DELAR.map(d => {
            const klar = text(d.key).trim().length > 0;
            return (
              <button
                key={d.key}
                onClick={() => setZon(d.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition ${
                  zon === d.key ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40'
                }`}
              >
                {klar && <Check className="h-4 w-4" />}
                {d.namn}
              </button>
            );
          })}
        </nav>

        <p className="mt-3 text-sm text-muted-foreground">{DELAR.find(d => d.key === zon)?.hjalp}</p>

        {saga.lage !== 'fritt' && (
          <section className="mt-5 space-y-4">
            {KATEGORIER.map(kat => (
              <div key={kat.key}>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden>{kat.ikon}</span>
                  {kat.namn}
                  <span className="text-xs font-normal text-muted-foreground">{kat.fraga}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {kortFor(kat.key, niva).map(k => {
                    const valdKort = valda[zon].includes(k.id);
                    return (
                      <button
                        key={k.id}
                        onClick={() => (valdKort ? taBort(k.id) : laggTill(kat.key, k.id))}
                        className={`min-w-[168px] shrink-0 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                          valdKort ? 'border-primary bg-primary/10' : 'bg-card hover:border-primary/40'
                        }`}
                      >
                        <span className="mr-1" aria-hidden>
                          {k.motiv}
                        </span>
                        {k.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={skrivText} disabled={skriver}>
              {skriver ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Skriv texten åt mig
            </Button>
            <Button variant="outline" onClick={lasUppZon} disabled={!text(zon).trim() || laser}>
              <Volume2 className="mr-2 h-4 w-4" />
              Läs upp
            </Button>
            <span className="ml-auto text-xs text-muted-foreground">{text(zon).trim().split(/\s+/).filter(Boolean).length} ord</span>
          </div>

          <Textarea
            value={text(zon)}
            onChange={e => andraText(zon, e.target.value)}
            placeholder={
              lage === 'pussel'
                ? 'Här kommer texten när du trycker på knappen. Du kan ändra allt som står.'
                : 'Skriv din text här. Skrivaren hjälper dig om du vill.'
            }
            className="mt-3 min-h-[180px] resize-y text-base leading-relaxed"
          />
        </section>

        {text(zon).trim().length > 40 && (tipsLista.bra.length > 0 || tipsLista.tips.length > 0) && (
          <section className="mt-4 rounded-xl border bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-primary" />
              Skrivarens blick på texten
            </p>
            {tipsLista.bra.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {tipsLista.bra.map(t => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {tipsLista.tips.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {tipsLista.tips.map(t => (
                  <li key={t} className="flex gap-2">
                    <span aria-hidden>→</span>
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <X className="mr-2 h-4 w-4" />
            Stäng
          </Button>
          <Button className="ml-auto" onClick={oppnaSagan}>
            <BookOpen className="mr-2 h-4 w-4" />
            Läs sagan
          </Button>
        </div>
      </div>
    </div>
  );
}