// Skrivaren: en liten svensk berättelsemaskin som bygger text av korten.
// Ingen modell, inget nät – bara mallar, variation och en fröbarn-RNG.

export type Del = 'inledning' | 'huvuddel' | 'avslutning';

export interface Kortval {
  karaktar?: string;
  plats?: string;
  tid?: string;
  kansla?: string;
  problem?: string;
}

export interface TidigareDelar {
  inledning?: string;
  huvuddel?: string;
}

function rng(fro: number) {
  let s = fro % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function valj<T>(lista: T[], r: () => number): T {
  return lista[Math.floor(r() * lista.length) % lista.length];
}

const kapital = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Kortets text som bisats: "en liten kanin som heter Lova" -> "den lilla kaninen Lova" */
function somNamn(karaktar?: string): string {
  if (!karaktar) return 'huvudpersonen';
  const m = karaktar.match(/som heter ([A-ZÅÄÖ][\wåäöé]*)/);
  if (m) return m[1];
  return 'huvudpersonen';
}

/** "en liten kanin som heter Lova" -> "kaninen" */
function somVarelse(karaktar?: string): string {
  if (!karaktar) return 'huvudpersonen';
  if (/kanin/.test(karaktar)) return 'kaninen';
  if (/pojke/.test(karaktar)) return 'pojken';
  if (/flicka/.test(karaktar)) return 'flickan';
  if (/hund/.test(karaktar)) return 'hunden';
  if (/katt/.test(karaktar)) return 'katten';
  if (/drake|dragon/.test(karaktar)) return 'draken';
  if (/robot/.test(karaktar)) return 'roboten';
  if (/bagare/.test(karaktar)) return 'bagaren';
  if (/fiskare/.test(karaktar)) return 'fiskaren';
  if (/rymdfarare/.test(karaktar)) return 'rymdfararen';
  if (/fågel/.test(karaktar)) return 'fågeln';
  if (/spöke/.test(karaktar)) return 'spöket';
  if (/sjöjungfru/.test(karaktar)) return 'sjöjungfrun';
  return 'huvudpersonen';
}

function platsFras(plats?: string): string {
  if (!plats) return 'på en plats ingen glömt';
  return plats;
}

function problemFras(problem?: string): string {
  if (!problem) return 'något blev plötsligt annorlunda';
  return problem;
}

export function skriv(
  del: Del,
  kort: Kortval,
  tidigare: TidigareDelar = {},
  fro = Date.now(),
): string {
  const r = rng(fro);
  const namn = somNamn(kort.karaktar);
  const varelse = somVarelse(kort.karaktar);
  const plats = platsFras(kort.plats);
  const tid = kort.tid || 'en helt vanlig dag';
  const kansla = kort.kansla || 'glad och nyfiken';
  const problem = problemFras(kort.problem);
  const karaktar = kort.karaktar || 'en liten människa utan namn';

  if (del === 'inledning') {
    const oppning = valj(
      [
        `Det var ${tid} ${plats}.`,
        `${kapital(tid)} satt ${plats} och tittade ut över allt som rörde sig.`,
        `Ingen hade trott att ${tid} ${plats} skulle bli något särskilt.`,
        `${kapital(tid)} var allt som fanns, och ${plats} var allt som syntes.`,
      ],
      r,
    );
    const vem = valj(
      [
        `Där bodde ${karaktar}.`,
        `På den platsen fanns ${karaktar}, som alltid var ${kansla}.`,
        `${kapital(karaktar)} bodde där och var ${kansla}.`,
        `Alldeles i närheten fanns ${karaktar}, ${kansla} och full av frågor.`,
      ],
      r,
    );
    const krok = valj(
      [
        `Men just den här dagen hände något: ${problem}.`,
        `Då, helt plötsligt, märktes det att ${problem}.`,
        `Men det fanns ett bekymmer. ${kapital(problem)}.`,
        `Och mitt i alltihop: ${problem}.`,
      ],
      r,
    );
    return `${oppning} ${vem} ${krok}`;
  }

  if (del === 'huvuddel') {
    const forsta = valj(
      [
        `${kapital(namn)} stannade och tänkte efter.`,
        `Först visste ${varelse} inte alls vad som skulle göras.`,
        `${kapital(namn)} tog ett djupt andetag.`,
        `Det blev tyst omkring ${varelse} en liten stund.`,
      ],
      r,
    );
    const forsok = valj(
      [
        `${kapital(namn)} försökte först det enklaste sättet, men det räckte inte. Sedan försökte ${varelse} på ett helt annat sätt – och den här gången hände något.`,
        `Ingen av de vanliga lösningarna fungerade. ${kapital(namn)} fick hitta på något eget, och det var då idéen kom.`,
        `${kapital(namn)} frågade alla ${varelse} mötte, men ingen visste riktigt. Till slut var det en liten detalj som gav svaret.`,
        `${kapital(namn)} letade och letade. Det tog tid, och flera gånger ville ${varelse} ge upp. Men så såg ${varelse} något som glimmade.`,
      ],
      r,
    );
    const hjalp = valj(
      [
        `Tur var det att en vän dök upp och hjälpte till.`,
        `Då kom någon annan och ställde en fråga som gjorde allt lättare.`,
        `En liten fågel satt på en gren och tittade nyfiket på allt som hände.`,
        `Ingen var ensam om problemet, och det visade sig vara viktigt.`,
      ],
      r,
    );
    const kanslaRad = valj(
      [
        `${kapital(namn)} kände sig ${kansla} igen, men nu på ett annat sätt än förut.`,
        `Det var ${kansla} som drev ${varelse} vidare.`,
        `Fast ${varelse} var ${kansla} gick det ändå att fortsätta, ett steg i taget.`,
      ],
      r,
    );
    const fortsatt = tidigare.inledning
      ? valj([`Så fortsatte sagan.`, `Det som börjat som en vanlig dag blev något större.`], r)
      : valj([`Det var så allt började.`, `Och nu blev det svårare.`], r);
    return `${fortsatt} ${forsta} ${forsok} ${hjalp} ${kanslaRad}`;
  }

  const slut = valj(
    [
      `Till slut gick det. ${kapital(problem)} var inte längre ett problem, utan något ${namn} hade klarat.`,
      `Efter en lång stund lossnade det. Det som varit svårt blev plötsligt möjligt.`,
      `${kapital(namn)} hittade svaret till slut – och det var enklare än någon trott.`,
      `Så löste det sig, på det där sättet som bara händer när man inte ger upp.`,
    ],
    r,
  );
  const efter = valj(
    [
      `${kapital(namn)} var ${kansla}, och solen gick ner över ${plats.replace(/^(i|på|vid) /, '')}.`,
      `Sedan satt ${varelse} stilla en stund och lyssnade på allt som lät.`,
      `Alla som var med mindes den dagen länge.`,
      `${kapital(namn)} log och tänkte att nästa dag också skulle bli ett äventyr.`,
    ],
    r,
  );
  const sista = valj(
    [
      `Och så levde de lyckliga i alla sina dagar. Slut.`,
      `Sagan var slut, men äventyret hade bara börjat.`,
      `Slut för den här gången.`,
    ],
    r,
  );
  return `${slut} ${efter} ${sista}`;
}

/** Feedback till barnets egen text – konkret, snäll och utan poäng. */
export function tips(text: string): { bra: string[]; tips: string[] } {
  const rensad = text.trim();
  const bra: string[] = [];
  const rad: string[] = [];
  const ord = rensad ? rensad.split(/\s+/).filter(Boolean) : [];

  if (ord.length >= 25) bra.push('Du har skrivit en hel berättelse med många ord.');
  else if (ord.length >= 8) bra.push('Bra början – det finns redan en hel del att läsa.');
  else rad.push('Skriv några meningar till, så blir det lättare att leva sig in i sagan.');

  if (/[.!?]/.test(rensad)) bra.push('Du använder punkt och frågetecken, så texten går att följa.');
  else rad.push('Sätt punkt mellan meningarna. Då blir det lättare att läsa högt.');

  if (/(och|men|sedan|eftersom|därför|när|fast)/i.test(rensad))
    bra.push('Du binder ihop händelserna med små ord som gör texten levande.');
  else rad.push('Prova att knyta ihop två meningar med "och", "men" eller "sedan".');

  if (/(kände|tyckte|tänkte|ville|rädd|glad|ledsen|arg|nyfiken)/i.test(rensad))
    bra.push('Du berättar hur någon känner sig – det gör sagan starkare.');
  else rad.push('Skriv hur huvudpersonen känner sig inuti, inte bara vad den gör.');

  if (/(plötsligt|till slut|sedan|efter en stund|länge)/i.test(rensad))
    bra.push('Du visar tid – läsaren förstår att något händer efter något annat.');
  else rad.push('Berätta vad som händer först, sedan och till slut.');

  if (/[A-ZÅÄÖ][a-zåäö]+/.test(rensad.slice(1)))
    bra.push('Du använder namn och stora bokstäver på rätt sätt.');

  return { bra: bra.slice(0, 3), tips: rad.slice(0, 3) };
}
