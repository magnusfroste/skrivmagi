# Skrivmagi

Skrivmagi låter elever i åk 1–6 skriva en egen saga i tre delar: inledning, huvuddel och
avslutning. Eleven väljer kort med karaktär, plats, tid, känsla och problem, och Skrivaren
hjälper till att formulera texten. Eleven bestämmer alltid och kan ändra allt.

**Spela:** https://skrivverkstan.skolappar.com · En del av [Skolappar](https://www.skolappar.com) – pedagogiska appar av föräldrar · öppen källkod (MIT)

Började som ett Lovable-projekt och körs nu fristående, utan AI-tjänst och utan databas.

## Vad du kan göra

- **Tre sätt att skriva**:
  - *Pussel*: välj kort och tryck på knappen, så blir det en saga.
  - *Halv*: Skrivaren skriver början och du skriver resten.
  - *Fritt*: skriv helt själv och få tips.
- **Kortlek** med 122 kort i fem kategorier och tre svårighetsnivåer.
- **Skriv texten åt mig**: Skrivaren bygger meningar av korten med mallar och variation.
  Det är ingen AI-modell och inget nätanrop.
- **Skrivarens blick på texten**: när du skrivit en bit visar appen vad som redan är bra
  och vad du kan lägga till. Antal ord räknas medan du skriver.
- **Läs sagan** med en enkel bild till varje del. Bilden ritas i webbläsaren utifrån
  korten och tiden på dygnet.
- **Läs upp** en del med webbläsarens svenska röst, om den finns.
- **Mina sagor**: sparade sagor som du kan öppna igen eller ta bort.

## Kom igång

```bash
npm install
npm run dev        # utvecklingsserver
npm run build      # produktionsbygge till dist/
npm run build:dev  # bygge i utvecklingsläge
npm run preview    # förhandsgranska bygget
npm run lint       # eslint
```

Docker-bygget använder Node 22.

## Docker

```bash
docker build -t skrivmagi .
docker run --rm -p 8080:8080 skrivmagi
```

Bygget serveras av nginx med `deploy/nginx.conf`.

## Integritet

- Inget konto, ingen inloggning, inga kakor och ingen analys.
- Inga anrop till externa servrar. Text, bilder och tips skapas lokalt i webbläsaren.
- Uppläsningen använder webbläsarens inbyggda talsyntes (`speechSynthesis`).
- Typsnittet Fredoka följer med appen (`public/fonts/`).
- Sagorna sparas bara i `localStorage` under nyckeln `skrivmagi:sagor`. Rensa webbläsardata
  så är de borta.

## Struktur

```
index.html              startskärm, metadata
src/
  pages/Hem.tsx         startsida med de tre skrivsätten
  pages/Skapa.tsx       skrivvyn: kort, nivåer, text och tips
  pages/Saga.tsx        läsvyn med bilder och uppläsning
  pages/MinaSagor.tsx   sparade sagor
  data/kort.ts          kortleken
  lib/skrivaren.ts      textmaskinen och tipsen, helt lokal
  lib/illustration.ts   ritar scenbilder som SVG
  lib/ljud.ts           uppläsning med webbläsarens röst
  lib/lager.ts          sparade sagor i localStorage
deploy/nginx.conf       nginx-konfiguration för containern
```

## Licens

MIT – se [LICENSE](LICENSE).
