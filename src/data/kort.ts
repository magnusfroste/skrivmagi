// Den lokala kortleken. Ligger i bundle:n så att appen fungerar utan nät,
// utan konto och utan databas. Nivå 1 är enklast.

export type Kategori = 'karaktar' | 'plats' | 'tid' | 'kansla' | 'problem';

export interface Kort {
  id: string;
  kategori: Kategori;
  text: string;
  niva: 1 | 2 | 3;
  motiv: string; // används av den lokala bildverkstaden
}

export const KATEGORIER: { key: Kategori; namn: string; fraga: string; ikon: string }[] = [
  { key: 'karaktar', namn: 'Karaktär', fraga: 'Vem handlar sagan om?', ikon: '🧒' },
  { key: 'plats', namn: 'Plats', fraga: 'Var händer allt?', ikon: '🏕️' },
  { key: 'tid', namn: 'Tid', fraga: 'När är vi där?', ikon: '🌤️' },
  { key: 'kansla', namn: 'Känsla', fraga: 'Hur kännsdet?', ikon: '💛' },
  { key: 'problem', namn: 'Problem', fraga: 'Vad är det som krånglar?', ikon: '❓' },
];

export const KORT: Kort[] = [
  // ----------- nivå 1 -----------
  { id: 'k1', kategori: 'karaktar', text: 'en liten kanin som heter Lova', niva: 1, motiv: '🐰' },
  { id: 'k2', kategori: 'karaktar', text: 'en pojke som heter Ali', niva: 1, motiv: '👦' },
  { id: 'k3', kategori: 'karaktar', text: 'en flicka som heter Selma', niva: 1, motiv: '👧' },
  { id: 'k4', kategori: 'karaktar', text: 'en hund som heter Bo', niva: 1, motiv: '🐶' },
  { id: 'k5', kategori: 'karaktar', text: 'en katt som heter Maja', niva: 1, motiv: '🐱' },
  { id: 'k6', kategori: 'karaktar', text: 'en drake som heter Fjun', niva: 1, motiv: '🐉' },
  { id: 'k7', kategori: 'karaktar', text: 'en gubbe som heter Nils', niva: 1, motiv: '👴' },
  { id: 'k8', kategori: 'karaktar', text: 'en robot som heter Tio', niva: 1, motiv: '🤖' },

  { id: 'p1', kategori: 'plats', text: 'i en skog med höga träd', niva: 1, motiv: '🌳' },
  { id: 'p2', kategori: 'plats', text: 'vid en sjö med stilla vatten', niva: 1, motiv: '🏞️' },
  { id: 'p3', kategori: 'plats', text: 'i en liten stuga på landet', niva: 1, motiv: '🏡' },
  { id: 'p4', kategori: 'plats', text: 'på en skolgård med gungor', niva: 1, motiv: '🏫' },
  { id: 'p5', kategori: 'plats', text: 'på stranden en sommarkväll', niva: 1, motiv: '🏖️' },
  { id: 'p6', kategori: 'plats', text: 'i en stad med höga hus', niva: 1, motiv: '🏙️' },
  { id: 'p7', kategori: 'plats', text: 'i en trädgård med bärbuskar', niva: 1, motiv: '🌷' },
  { id: 'p8', kategori: 'plats', text: 'på ett berg högt över molnen', niva: 1, motiv: '⛰️' },

  { id: 't1', kategori: 'tid', text: 'en tidig morgon', niva: 1, motiv: '🌅' },
  { id: 't2', kategori: 'tid', text: 'en ljus sommardag', niva: 1, motiv: '☀️' },
  { id: 't3', kategori: 'tid', text: 'en regnig eftermiddag', niva: 1, motiv: '🌧️' },
  { id: 't4', kategori: 'tid', text: 'en mörk natt med stjärnor', niva: 1, motiv: '🌙' },
  { id: 't5', kategori: 'tid', text: 'en kall vinterdag med snö', niva: 1, motiv: '❄️' },
  { id: 't6', kategori: 'tid', text: 'en höstdag med löv på marken', niva: 1, motiv: '🍂' },
  { id: 't7', kategori: 'tid', text: 'en kväll när solen gick ner', niva: 1, motiv: '🌇' },
  { id: 't8', kategori: 'tid', text: 'en dag i början av våren', niva: 1, motiv: '🌱' },

  { id: 'u1', kategori: 'kansla', text: 'glad och nyfiken', niva: 1, motiv: '😊' },
  { id: 'u2', kategori: 'kansla', text: 'lite rädd men modig', niva: 1, motiv: '😟' },
  { id: 'u3', kategori: 'kansla', text: 'pigg och busig', niva: 1, motiv: '😄' },
  { id: 'u4', kategori: 'kansla', text: 'ledsen och ensam', niva: 1, motiv: '😢' },
  { id: 'u5', kategori: 'kansla', text: 'förvånad och förundrad', niva: 1, motiv: '😮' },
  { id: 'u6', kategori: 'kansla', text: 'stolt och stark', niva: 1, motiv: '💪' },
  { id: 'u7', kategori: 'kansla', text: 'trött och sömnig', niva: 1, motiv: '😴' },
  { id: 'u8', kategori: 'kansla', text: 'varm och trygg', niva: 1, motiv: '🤗' },

  { id: 'r1', kategori: 'problem', text: 'en nyckel har försvunnit', niva: 1, motiv: '🔑' },
  { id: 'r2', kategori: 'problem', text: 'en vän har gått vilse', niva: 1, motiv: '🧭' },
  { id: 'r3', kategori: 'problem', text: 'det finns inget vatten kvar', niva: 1, motiv: '💧' },
  { id: 'r4', kategori: 'problem', text: 'en bro har gått sönder', niva: 1, motiv: '🌉' },
  { id: 'r5', kategori: 'problem', text: 'någon har stulit en kaka', niva: 1, motiv: '🍪' },
  { id: 'r6', kategori: 'problem', text: 'det är för mörkt att se', niva: 1, motiv: '🕯️' },
  { id: 'r7', kategori: 'problem', text: 'en dörr har låst sig', niva: 1, motiv: '🚪' },
  { id: 'r8', kategori: 'problem', text: 'ett litet djur behöver hjälp', niva: 1, motiv: '🐣' },

  // ----------- nivå 2 -----------
  { id: 'k9', kategori: 'karaktar', text: 'en flicka som kan prata med fåglar', niva: 2, motiv: '🐦' },
  { id: 'k10', kategori: 'karaktar', text: 'en pojke som samlar på stenar', niva: 2, motiv: '🪨' },
  { id: 'k11', kategori: 'karaktar', text: 'en trollkarl med trasig hatt', niva: 2, motiv: '🧙' },
  { id: 'k12', kategori: 'karaktar', text: 'en sjöjungfru som vill se land', niva: 2, motiv: '🧜' },
  { id: 'k13', kategori: 'karaktar', text: 'en bagare som bakar drömmar', niva: 2, motiv: '🥐' },
  { id: 'k14', kategori: 'karaktar', text: 'en rymdfarare som saknar jorden', niva: 2, motiv: '🧑‍🚀' },
  { id: 'k15', kategori: 'karaktar', text: 'en gammal fiskare med en hemlighet', niva: 2, motiv: '🎣' },
  { id: 'k16', kategori: 'karaktar', text: 'en fågel som inte kan flyga', niva: 2, motiv: '🐧' },

  { id: 'p9', kategori: 'plats', text: 'i en bokhandel som doftar gammalt papper', niva: 2, motiv: '📚' },
  { id: 'p10', kategori: 'plats', text: 'i en grotta bakom ett vattenfall', niva: 2, motiv: '🕳️' },
  { id: 'p11', kategori: 'plats', text: 'på en marknad med färger och ljud', niva: 2, motiv: '🎪' },
  { id: 'p12', kategori: 'plats', text: 'i en skola där klockan stannat', niva: 2, motiv: '⏰' },
  { id: 'p13', kategori: 'plats', text: 'på en ö som ingen har ritat på kartan', niva: 2, motiv: '🏝️' },
  { id: 'p14', kategori: 'plats', text: 'i en trädgård som växer på natten', niva: 2, motiv: '🌙' },
  { id: 'p15', kategori: 'plats', text: 'i en tunnel under staden', niva: 2, motiv: '🚇' },
  { id: 'p16', kategori: 'plats', text: 'i ett bibliotek med flyttbara hyllor', niva: 2, motiv: '🗄️' },

  { id: 't9', kategori: 'tid', text: 'den första dagen efter lovet', niva: 2, motiv: '🎒' },
  { id: 't10', kategori: 'tid', text: 'en natt när norrskenet lyser', niva: 2, motiv: '🌌' },
  { id: 't11', kategori: 'tid', text: 'en dag som aldrig tar slut', niva: 2, motiv: '🕰️' },
  { id: 't12', kategori: 'tid', text: 'en morgon när allt är tyst', niva: 2, motiv: '🤫' },
  { id: 't13', kategori: 'tid', text: 'en eftermiddag i slutet av augusti', niva: 2, motiv: '🌾' },
  { id: 't14', kategori: 'tid', text: 'precis före ett åskväder', niva: 2, motiv: '⛈️' },
  { id: 't15', kategori: 'tid', text: 'en vår när snön smälter', niva: 2, motiv: '🌊' },
  { id: 't16', kategori: 'tid', text: 'en kväll när månen är full', niva: 2, motiv: '🌕' },

  { id: 'u9', kategori: 'kansla', text: 'nervös inför något nytt', niva: 2, motiv: '😬' },
  { id: 'u10', kategori: 'kansla', text: 'irriterad på sin bästa vän', niva: 2, motiv: '😤' },
  { id: 'u11', kategori: 'kansla', text: 'alldeles tyst inombords', niva: 2, motiv: '🫥' },
  { id: 'u12', kategori: 'kansla', text: 'full av skratt', niva: 2, motiv: '😂' },
  { id: 'u13', kategori: 'kansla', text: 'hemlängtande', niva: 2, motiv: '🥺' },
  { id: 'u14', kategori: 'kansla', text: 'överraskad av sin egen kraft', niva: 2, motiv: '✨' },
  { id: 'u15', kategori: 'kansla', text: 'otålig och rastlös', niva: 2, motiv: '⏳' },
  { id: 'u16', kategori: 'kansla', text: 'lättad över att vara framme', niva: 2, motiv: '😌' },

  { id: 'r9', kategori: 'problem', text: 'en storm har vänt upp och ner på allt', niva: 2, motiv: '🌪️' },
  { id: 'r10', kategori: 'problem', text: 'ett brev har kommit till fel person', niva: 2, motiv: '✉️' },
  { id: 'r11', kategori: 'problem', text: 'en maskin har slutat fungera', niva: 2, motiv: '⚙️' },
  { id: 'r12', kategori: 'problem', text: 'någon har målat över alla skyltar', niva: 2, motiv: '🎨' },
  { id: 'r13', kategori: 'problem', text: 'en vän säger att hen flyttar', niva: 2, motiv: '📦' },
  { id: 'r14', kategori: 'problem', text: 'det finns två kartor och bara en stämmer', niva: 2, motiv: '🗺️' },
  { id: 'r15', kategori: 'problem', text: 'en hemlighet vill ut', niva: 2, motiv: '🤐' },
  { id: 'r16', kategori: 'problem', text: 'Djuren i skogen har slutat låta', niva: 2, motiv: '🦌' },

  // ----------- nivå 3 -----------
  { id: 'k17', kategori: 'karaktar', text: 'en flicka som minns saker som inte hänt', niva: 3, motiv: '🪞' },
  { id: 'k18', kategori: 'karaktar', text: 'en pojke som bygger flygmaskiner av skräp', niva: 3, motiv: '✈️' },
  { id: 'k19', kategori: 'karaktar', text: 'en gammal drake som vill lära sig läsa', niva: 3, motiv: '🐲' },
  { id: 'k20', kategori: 'karaktar', text: 'ett spöke som ingen är rädd för', niva: 3, motiv: '👻' },
  { id: 'k21', kategori: 'karaktar', text: 'en uppfinnare som pratar med växter', niva: 3, motiv: '🌿' },
  { id: 'k22', kategori: 'karaktar', text: 'en sjöman som seglat i hundra år', niva: 3, motiv: '⛵' },
  { id: 'k23', kategori: 'karaktar', text: 'en bibliotekarie som lånar ut minnen', niva: 3, motiv: '🗝️' },
  { id: 'k24', kategori: 'karaktar', text: 'en fågelskådare som hör taggtråd sjunga', niva: 3, motiv: '🎶' },

  { id: 'p17', kategori: 'plats', text: 'i en stad byggd på en enda bro', niva: 3, motiv: '🌉' },
  { id: 'p18', kategori: 'plats', text: 'i en skog som flyttar sig när man sover', niva: 3, motiv: '🌲' },
  { id: 'p19', kategori: 'plats', text: 'på ett tåg som aldrig stannar', niva: 3, motiv: '🚂' },
  { id: 'p20', kategori: 'plats', text: 'i ett hus där rummen byter plats', niva: 3, motiv: '🚪' },
  { id: 'p21', kategori: 'plats', text: 'vid en fyr längst ut på en klippa', niva: 3, motiv: '🗼' },
  { id: 'p22', kategori: 'plats', text: 'i en underjordisk stad av glas', niva: 3, motiv: '🔮' },
  { id: 'p23', kategori: 'plats', text: 'på en ö där det alltid regnar', niva: 3, motiv: '🌧️' },
  { id: 'p24', kategori: 'plats', text: 'i en trädgård med en grind som viskar', niva: 3, motiv: '🚧' },

  { id: 't17', kategori: 'tid', text: 'den där dagen då alla klockor stannade', niva: 3, motiv: '⌛' },
  { id: 't18', kategori: 'tid', text: 'en natt som varar i trehundra dagar', niva: 3, motiv: '🌑' },
  { id: 't19', kategori: 'tid', text: 'en morgon som ingen minns', niva: 3, motiv: '🌫️' },
  { id: 't20', kategori: 'tid', text: 'en höst som inte vill ta slut', niva: 3, motiv: '🍁' },
  { id: 't21', kategori: 'tid', text: 'en dag som kommer tillbaka varje år', niva: 3, motiv: '🗓️' },
  { id: 't22', kategori: 'tid', text: 'en timme som är längre inuti än utanpå', niva: 3, motiv: '⏲️' },
  { id: 't23', kategori: 'tid', text: 'precis när isen bryts upp', niva: 3, motiv: '🧊' },
  { id: 't24', kategori: 'tid', text: 'en kväll när alla lampor tänds samtidigt', niva: 3, motiv: '💡' },

  { id: 'u17', kategori: 'kansla', text: 'klyvd mellan två val', niva: 3, motiv: '⚖️' },
  { id: 'u18', kategori: 'kansla', text: 'arg på ett sätt som inte syns', niva: 3, motiv: '🌋' },
  { id: 'u19', kategori: 'kansla', text: 'stolt men rädd att tappa det', niva: 3, motiv: '🪁' },
  { id: 'u20', kategori: 'kansla', text: 'sakta lättad', niva: 3, motiv: '🕊️' },
  { id: 'u21', kategori: 'kansla', text: 'nyfiken på det farliga', niva: 3, motiv: '🔦' },
  { id: 'u22', kategori: 'kansla', text: 'förvirrad men hoppfull', niva: 3, motiv: '🧩' },
  { id: 'u23', kategori: 'kansla', text: 'trött på att alltid vara den starka', niva: 3, motiv: '🫂' },
  { id: 'u24', kategori: 'kansla', text: 'alldeles stilla av förundran', niva: 3, motiv: '🌟' },

  { id: 'r17', kategori: 'problem', text: 'någon har tagit bort alla namn', niva: 3, motiv: '🏷️' },
  { id: 'r18', kategori: 'problem', text: 'en lögn har blivit sann', niva: 3, motiv: '🎭' },
  { id: 'r19', kategori: 'problem', text: 'en dörr öppnas bara för den som vågar', niva: 3, motiv: '🔓' },
  { id: 'r20', kategori: 'problem', text: 'staden har tappat sin färg', niva: 3, motiv: '🖌️' },
  { id: 'r21', kategori: 'problem', text: 'en vän har glömt vem hen är', niva: 3, motiv: '🫥' },
  { id: 'r22', kategori: 'problem', text: 'alla ljud har bytt plats', niva: 3, motiv: '🔔' },
  { id: 'r23', kategori: 'problem', text: 'ett löfte måste hållas före midnatt', niva: 3, motiv: '🤝' },
  { id: 'r24', kategori: 'problem', text: 'något växer under golvet', niva: 3, motiv: '🌱' },
];

export function kortFor(kategori: Kategori, niva: number): Kort[] {
  const max = niva <= 1 ? 1 : niva === 2 ? 2 : 3;
  return KORT.filter(k => k.kategori === kategori && k.niva <= max);
}

export function hittaKort(id: string): Kort | undefined {
  return KORT.find(k => k.id === id);
}