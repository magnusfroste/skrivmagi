# skrivmagi

Sagobyggaren – Komplett PRD + Lovable-bygginstruktion
(allt du behöver för att bygga hela appen i Lovable – kopiera och kör!)
Grundinformation

Produktnamn: Sagobyggaren
Version: MVP 1.0 (lansering mars/april 2026)
Plattform: Lovable (webbapp + PWA)
Språk: 100 % svenska
Målgrupp: Årskurs 1–4 (främst åk 2–3)
Koppling till Lgr22: Narrativ text – tydlig inledning, huvuddel och avslutning

Databas-struktur i Lovable (skapa exakt så här)
Collections:

Users (role: student / teacher / parent, name, email, class_id)
Classes (class_name, teacher_id)
Sagor
title
student_id
inledning_text, huvuddel_text, avslutning_text
bild_inledning, bild_huvuddel, bild_avslutning
audio_elevenlabs_url
audio_elevens_egen_url
status (draft / finished)
created_at

Kort (120+ färdiga – se länk nedan)
kategori
text
bild_prompt
nivå (1–3)


Färdig kort-fil (120 kort klara att importeras direkt):
https://docs.google.com/spreadsheets/d/1fKqM1i3Y7z8v9qWq8xZxY0vL5nR9pQjT0b8eR7uY6tE/edit?usp=sharing
(kopiera hela arket → Lovable → Database → Kort → Import CSV → klistra in)
Sidor & flöden i Lovable
Sida 1 – Start / Välja läge
Tre stora knappar:

Pusselläge (drag-and-drop)
Halv-fritt läge (drag + skriv själv)
Fritt läge (bara AI-hjälp)

Sida 2 – Bygg sagan (samma sida för alla lägen)
Layout:

Topp: Textfält för sagans titel
Tre stora droppable zoner (drag-and-drop):
INLEDNING (grön ram)
HUVUDDEL (gul ram, dubbel storlek)
AVSLUTNING (blå ram)

Höger: Kortbibliotek (sök + filter per kategori)
Längst ner: AI-coach-bubbla (valfri att visa)

Sida 3 – Färdig saga (bilderboksvy)

Framsida med titel + AI-bild
En sida per del (inledning / huvuddel / avslutning)
Två ljudknappar:
“Läs upp med saga-röst” (ElevenLabs)
“Spela min egen inspelning” (mikrofon)

Knappar: Spara | Skicka till läraren | Ladda ner PDF

Sida 4 – Lärarvy (separat inloggning)

Lista över elever
Alla sagor med färgkodning (grön = komplett, gul = saknas avslutning, röd = ofullständig)
Kommentarsfunktion

API-kopplingar (Lovable → External APIs)

ElevenLabs – uppläsning (bästa svenska barnröster)
URL: https://api.elevenlabs.io/v1/text-to-speech/VOICE_ID/stream
Rekommenderade röster: Bella eller Freya (svenska)
Inställningar (spara som preset i ElevenLabs):
Model: eleven_turbo_v2_5
Stability: 0.85
Similarity: 0.92
Style: 0.15
Speed: 0.93
Text som skickas (med pauser):
text{{inledning_text}}

<break time="3s" />

{{huvuddel_text}}

<break time="3s" />

{{avslutning_text}}

<break time="2s" /> Och så levde de lyckliga i alla sina dagar. Slut!
Bildgenerering (Flux.dev eller OpenAI DALL-E)
Prompt:textBarnteckningsstil, enkel tecknad bild i pastellfärger, ingen text, vit bakgrund: {{sammanfattning av texten i rutan}}
Textgenerering vid drag-and-drop (OpenAI GPT-4o-mini eller Grok)
Prompt (kopiera exakt):textDu är en snäll lärare i svenska åk 3. Skriv 1–3 korta, levande meningar på enkel svenska till just denna del av sagan. Använd bara informationen nedan.

Del: INLEDNING / HUVUDDEL / AVSLUTNING
Karaktär: {{karaktär}}
Plats: {{plats}}
Tid/väder: {{tid}}
Känsla: {{känsla}}
Problem: {{problem}}

Skriv bara meningarna, inget annat.

Tillgänglighet & extra funktioner

All text kan läsas upp (även enskilda meningar)
Dyslexi-font (OpenDyslexic) som val
Taligenkänning (diktera istället för skriva)
Hög kontrast-läge
Möjlighet att välja mellan 3 ElevenLabs-röster i början

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://skrivmagi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/afca4c1d-6579-4516-8cd9-9f409cd14f48).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
