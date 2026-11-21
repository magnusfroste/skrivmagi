import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Pencil, Library, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { listaSagor } from '@/lib/lager';
import { ritaOmslag } from '@/lib/illustration';

const LAGEN = [
  {
    key: 'pussel',
    namn: 'Pussel',
    ikon: Sparkles,
    text: 'Välj kort med karaktär, plats och problem. Tryck på knappen – så blir det en saga.',
  },
  {
    key: 'halv',
    namn: 'Halv',
    ikon: BookOpen,
    text: 'Du får början av Skrivaren och skriver resten själv. Bra när du vill ha sällskap.',
  },
  {
    key: 'fritt',
    namn: 'Fritt',
    ikon: Pencil,
    text: 'Skriv helt själv. Få tips på vad som redan är bra och vad du kan lägga till.',
  },
];

export default function Hem() {
  const navigate = useNavigate();
  const sagor = listaSagor().slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <span className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Skrivmagi
          </span>
          <Link to="/mina-sagor" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Library className="h-4 w-4" />
            Mina sagor
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8">
        <section className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Skriv en saga – steg för steg</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Välj vem sagan handlar om, var den händer och vad som krånglar. Skrivaren hjälper dig att få ihop
            meningarna, och du bestämmer alltid själv över orden.
          </p>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {LAGEN.map(l => (
            <Card key={l.key} className="flex flex-col">
              <CardHeader>
                <l.ikon className="h-6 w-6 text-primary" />
                <CardTitle className="mt-2 text-xl">{l.namn}</CardTitle>
                <CardDescription>{l.text}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => navigate(`/skapa?lage=${l.key}`)}>
                  Börja
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {sagor.length > 0 && (
          <section className="mt-12">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">Dina senaste sagor</h2>
              <Link to="/mina-sagor" className="text-sm text-primary hover:underline">
                Visa alla
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sagor.map(s => (
                <Link key={s.id} to={`/saga/${s.id}`} className="group overflow-hidden rounded-xl border bg-card">
                  <img
                    src={ritaOmslag(s.title, s.motiv, s.tid)}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition group-hover:opacity-95"
                  />
                  <div className="p-3">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.lage}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-14 text-sm text-muted-foreground">
          Gratis · ingen inloggning · sagorna sparas bara på den här enheten · fungerar på iPad
        </p>
      </main>
    </div>
  );
}