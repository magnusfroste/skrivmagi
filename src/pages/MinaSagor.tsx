import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listaSagor, taBortSaga } from '@/lib/lager';
import { ritaOmslag } from '@/lib/illustration';

const LAGE: Record<string, string> = { pussel: 'Pussel', halv: 'Halv', fritt: 'Fritt' };

export default function MinaSagor() {
  const navigate = useNavigate();
  const [sagor, setSagor] = useState(listaSagor());

  const radera = (id: string) => {
    taBortSaga(id);
    setSagor(listaSagor());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground" aria-label="Tillbaka">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-semibold">Mina sagor</h1>
          <Button className="ml-auto" size="sm" onClick={() => navigate('/skapa?lage=pussel')}>
            Ny saga
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6">
        {sagor.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-lg">Här samlas sagorna du skriver.</p>
            <p className="mt-2 text-sm text-muted-foreground">De sparas bara på den här enheten.</p>
            <Button className="mt-5" onClick={() => navigate('/skapa?lage=pussel')}>
              Skriv den första
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {sagor.map(s => (
              <li key={s.id} className="overflow-hidden rounded-xl border bg-card">
                <Link to={`/saga/${s.id}`}>
                  <img src={ritaOmslag(s.title, s.motiv, s.tid)} alt="" className="aspect-[4/3] w-full object-cover" />
                </Link>
                <div className="flex items-center gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {LAGE[s.lage]} · {new Date(s.andrad).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/skapa?saga=${s.id}`)} aria-label="Fortsätt skriva">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => radera(s.id)} aria-label="Ta bort">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}