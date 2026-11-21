// Uppläsning med webbläsarens egen röst (Web Speech API).
// Fungerar på iPad och i Chrome utan nät, utan röst-API och utan konto.

let roster: SpeechSynthesisVoice[] = [];

function laddaRoster() {
  if (!('speechSynthesis' in window)) return;
  roster = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  laddaRoster();
  window.speechSynthesis.onvoiceschanged = laddaRoster;
}

function svenskRost(): SpeechSynthesisVoice | undefined {
  if (!roster.length) laddaRoster();
  return roster.find(r => r.lang === 'sv-SE') || roster.find(r => r.lang.startsWith('sv'));
}

export function kanLasa(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function lasUpp(text: string, klart?: () => void) {
  if (!kanLasa() || !text.trim()) {
    klart?.();
    return;
  }
  stopp();
  const yttrande = new SpeechSynthesisUtterance(text);
  const röst = svenskRost();
  if (röst) yttrande.voice = röst;
  yttrande.lang = 'sv-SE';
  yttrande.rate = 0.92;
  yttrande.pitch = 1.05;
  yttrande.onend = () => klart?.();
  yttrande.onerror = () => klart?.();
  window.speechSynthesis.speak(yttrande);
}

export function stopp() {
  if (kanLasa()) window.speechSynthesis.cancel();
}