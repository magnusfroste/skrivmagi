// Sagolagret: alla sagor ligger i localStorage på enheten.
// Ingen inloggning, ingen server, inget som lämnar iPaden.

export interface Saga {
  id: string;
  title: string;
  lage: 'pussel' | 'halv' | 'fritt';
  inledning_text: string;
  huvuddel_text: string;
  avslutning_text: string;
  bilder: { inledning: string; huvuddel: string; avslutning: string };
  motiv: string[];
  tid: string;
  skapad: string;
  andrad: string;
}

const NYCKEL = 'skrivmagi:sagor';

function las(): Saga[] {
  try {
    const ra = localStorage.getItem(NYCKEL);
    const lista = ra ? (JSON.parse(ra) as Saga[]) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function skriv(lista: Saga[]) {
  try {
    localStorage.setItem(NYCKEL, JSON.stringify(lista));
  } catch {
    // Fullt minne eller privat läge – appen fortsätter fungera i minnet.
  }
}

export function listaSagor(): Saga[] {
  return las().sort((a, b) => (a.andrad < b.andrad ? 1 : -1));
}

export function hamtaSaga(id: string): Saga | undefined {
  return las().find(s => s.id === id);
}

export function nySaga(lage: Saga['lage']): Saga {
  const nu = new Date().toISOString();
  return {
    id: 'saga-' + Math.random().toString(36).slice(2, 10),
    title: 'Min saga',
    lage,
    inledning_text: '',
    huvuddel_text: '',
    avslutning_text: '',
    bilder: { inledning: '', huvuddel: '', avslutning: '' },
    motiv: [],
    tid: '',
    skapad: nu,
    andrad: nu,
  };
}

export function sparaSaga(saga: Saga): Saga {
  const lista = las();
  const uppdaterad = { ...saga, andrad: new Date().toISOString() };
  const i = lista.findIndex(s => s.id === saga.id);
  if (i >= 0) lista[i] = uppdaterad;
  else lista.push(uppdaterad);
  skriv(lista);
  return uppdaterad;
}

export function taBortSaga(id: string) {
  skriv(las().filter(s => s.id !== id));
}

export function sagaSomText(saga: Saga): string {
  const delar = [saga.title, '', saga.inledning_text, '', saga.huvuddel_text, '', saga.avslutning_text];
  return delar.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}