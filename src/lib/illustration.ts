// Bildverkstaden: ritar en enkel scen som data-URI-SVG i webbläsaren.
// Inga foton, inga nätanrop, inga typsnitt – bara former och färger.

export interface Scen {
  motiv: string[];
  tid?: string;
  plats?: string;
  fro?: number;
}

function farg(tid?: string): { a: string; b: string; sol: string } {
  const t = (tid || '').toLowerCase();
  if (/natt|stjärn|måne|mörk/.test(t)) return { a: '#101a3a', b: '#2c2a5e', sol: '#f6f2cf' };
  if (/kväll|sol.*ner|skymning/.test(t)) return { a: '#ffb199', b: '#7b6aa8', sol: '#ffcf6b' };
  if (/regn|åska|storm|grå/.test(t)) return { a: '#9fb3c8', b: '#dbe6ef', sol: '#f2f6fa' };
  if (/vinter|snö|is/.test(t)) return { a: '#e9f3fc', b: '#c3d9eb', sol: '#ffffff' };
  if (/höst|löv/.test(t)) return { a: '#ffd9a8', b: '#f5e6d0', sol: '#ffb763' };
  if (/morgon|vår/.test(t)) return { a: '#ffe6c7', b: '#d3ebf6', sol: '#ffd479' };
  return { a: '#cdeafd', b: '#eef8ff', sol: '#ffd479' };
}

const FIGURER = ['#f6a5a5', '#8fc9f0', '#f7c873', '#a8d8a8', '#b9a7f0', '#f2a8d0'];

export function ritaScen({ motiv, tid, fro = 7 }: Scen): string {
  const c = farg(tid);
  let s = Math.abs(Math.floor(fro)) % 2147483647 || 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;

  // Himmel
  let svg =
    '<defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1">' +
    `<stop offset="0%" stop-color="${c.a}"/><stop offset="100%" stop-color="${c.b}"/>` +
    '</linearGradient></defs>' +
    '<rect width="600" height="460" fill="url(#h)"/>';

  // Stjärnor på natten
  if (/^#101a3a$/.test(c.a)) {
    for (let i = 0; i < 30; i++) {
      svg += `<circle cx="${Math.floor(r() * 590)}" cy="${Math.floor(r() * 240)}" r="${1 + Math.floor(r() * 2)}" fill="#ffffff" opacity="0.8"/>`;
    }
  }

  // Sol eller måne
  svg += `<circle cx="488" cy="86" r="42" fill="${c.sol}" opacity="0.95"/>`;

  // Moln
  for (let i = 0; i < 3; i++) {
    const x = 60 + Math.floor(r() * 440);
    const y = 40 + Math.floor(r() * 90);
    svg += `<ellipse cx="${x}" cy="${y}" rx="${30 + Math.floor(r() * 24)}" ry="15" fill="#ffffff" opacity="0.55"/>`;
  }

  // Kullar
  svg +=
    '<path d="M0 384 Q150 336 300 384 T600 374 L600 460 L0 460 Z" fill="#a9dcb2"/>' +
    '<path d="M0 414 Q200 376 380 416 T600 408 L600 460 L0 460 Z" fill="#7cc98a"/>';

  // Träd
  for (let i = 0; i < 3; i++) {
    const x = 40 + i * 210 + Math.floor(r() * 40);
    const h = 64 + Math.floor(r() * 34);
    svg +=
      `<rect x="${x - 5}" y="${392 - h * 0.35}" width="10" height="${h * 0.4}" rx="4" fill="#8a6a4f"/>` +
      `<circle cx="${x}" cy="${386 - h * 0.5}" r="${h * 0.5}" fill="#63b878" opacity="0.95"/>`;
  }

  // Figurer: en per valt kort (högst fyra), i olika färger
  const antal = Math.min(4, Math.max(1, motiv.filter(Boolean).length));
  for (let i = 0; i < antal; i++) {
    const x = 150 + i * 96 + Math.floor(r() * 16);
    const bas = 404 - (i % 2) * 14;
    const storlek = i === 0 ? 52 : 34;
    const fyll = FIGURER[(Math.abs(fro) + i * 3) % FIGURER.length];
    svg +=
      `<circle cx="${x}" cy="${bas - storlek}" r="${storlek}" fill="${fyll}"/>` +
      `<circle cx="${x - storlek * 0.3}" cy="${bas - storlek * 1.15}" r="${storlek * 0.11}" fill="#2f3a44"/>` +
      `<circle cx="${x + storlek * 0.3}" cy="${bas - storlek * 1.15}" r="${storlek * 0.11}" fill="#2f3a44"/>` +
      `<path d="M${x - storlek * 0.28} ${bas - storlek * 0.8} Q${x} ${bas - storlek * 0.58} ${x + storlek * 0.28} ${bas - storlek * 0.8}" ` +
      `stroke="#2f3a44" stroke-width="${Math.max(2, storlek * 0.07)}" fill="none" stroke-linecap="round"/>` +
      `<rect x="${x - storlek * 0.4}" y="${bas}" width="10" height="${storlek * 0.42}" rx="5" fill="#2f3a44" opacity="0.35"/>` +
      `<rect x="${x + storlek * 0.4 - 10}" y="${bas}" width="10" height="${storlek * 0.42}" rx="5" fill="#2f3a44" opacity="0.35"/>`;
  }

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 460" width="600" height="460">${svg}</svg>`);
}

export function ritaOmslag(titel: string, motiv: string[], tid?: string): string {
  return ritaScen({ motiv: motiv.length ? motiv : ['x'], tid, fro: titel.length * 37 + 11 });
}