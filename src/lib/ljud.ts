// Uppläsning med inspelad röst (OmniVoice via Shipholms taltjänst).
//
// Texten som läses upp skrivs av barnet medan appen körs, så den kan inte
// spelas in i förväg: meningarna hämtas från tjänsten och spelas upp som ljud.
// Ingen talsyntes i webbläsaren används – svarar tjänsten inte blir det tyst
// och texten står kvar på skärmen.

const TAL_URL = 'https://api.shipholm.com/speak';

let ljud: HTMLAudioElement | null = null;
let url: string | null = null;
let tur = 0;

function tysta() {
  if (ljud) {
    ljud.onended = null;
    ljud.onerror = null;
    ljud.pause();
    ljud = null;
  }
  if (url) {
    URL.revokeObjectURL(url);
    url = null;
  }
}

export function kanLasa(): boolean {
  return typeof window !== 'undefined' && typeof window.fetch === 'function';
}

export function lasUpp(text: string, klart?: () => void) {
  const mening = (text || '').trim();
  if (!kanLasa() || !mening) {
    klart?.();
    return;
  }
  stopp();
  const min = ++tur;
  fetch(TAL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: mening, voice: 'omni' }),
  })
    .then(r => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
    .then(b => {
      if (min !== tur) return;
      url = URL.createObjectURL(b);
      const a = new Audio(url);
      ljud = a;
      const klar = () => {
        if (min === tur) tysta();
        klart?.();
      };
      a.onended = klar;
      a.onerror = klar;
      return a.play().catch(klar);
    })
    .catch(() => {
      // Tyst: texten syns redan.
      klart?.();
    });
}

export function stopp() {
  tur++;
  tysta();
}
