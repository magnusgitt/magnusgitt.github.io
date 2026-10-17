'use strict';
// Gnist – lyd laget med Web Audio.
// ---------- lyd (lages med Web Audio, ingen lydfiler) ----------
const A = { c: null, master: null, stoy: null, surr: null };
let lydPa = true;
try { lydPa = localStorage.getItem(NOKKEL + '-lyd') !== 'av'; } catch (e) {}
function lydInit() {
  if (A.c) { if (A.c.state === 'suspended') A.c.resume().catch(() => {}); return; }
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)(); A.c = c;
    A.master = c.createGain(); A.master.gain.value = lydPa ? .9 : 0; A.master.connect(c.destination);
    const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; A.stoy = b;
    // svak brumming i bakgrunnen
    const dg = c.createGain(); dg.gain.value = .016; dg.connect(A.master);
    [[55, 1], [82.5, .35], [110, .45]].forEach(([f, v]) => { const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(dg); o.start(); });
    // elektrisk surr nær feller og sperrer (styrken settes hvert bilde)
    const ns = c.createBufferSource(); ns.buffer = b; ns.loop = true; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 2.5;
    const hum = c.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 100; const hg = c.createGain(); hg.gain.value = .12;
    const sg = c.createGain(); sg.gain.value = 0; ns.connect(bp); bp.connect(sg); hum.connect(hg); hg.connect(sg); sg.connect(A.master); ns.start(); hum.start(); A.surr = sg;
    if (c.state === 'suspended') c.resume().catch(() => {});
  } catch (e) { A.c = null; }
}
function settLyd(pa) { lydPa = pa; try { localStorage.setItem(NOKKEL + '-lyd', pa ? 'på' : 'av'); } catch (e) {}
  if (pa) lydInit(); if (A.master) A.master.gain.setTargetAtTime(pa ? .9 : 0, A.c.currentTime, .05);
  $('#bLyd').textContent = 'Lyd: ' + (pa ? 'på' : 'av'); $('#lydKnapp').textContent = pa ? '🔊' : '🔇'; }
function tone(f1, f2, dur, type, vol, delay) {
  if (!A.c || !lydPa) return;
  try { const t = A.c.currentTime + (delay || 0), o = A.c.createOscillator(), g = A.c.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(A.master); o.start(t); o.stop(t + dur + .05); } catch (e) {}
}
function sus(dur, f1, f2, vol, delay, type) {
  if (!A.c || !lydPa) return;
  try { const t = A.c.currentTime + (delay || 0), s = A.c.createBufferSource(), f = A.c.createBiquadFilter(), g = A.c.createGain();
    s.buffer = A.stoy; f.type = type || 'lowpass'; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(A.master); s.start(t, Math.random() * .5); s.stop(t + dur + .05); } catch (e) {}
}
function lyd(n) {
  switch (n) {
    case 'hopp': tone(330, 560, .11, 'sine', .045); sus(.06, 2500, 900, .03); break;
    case 'dobbel': tone(560, 1050, .16, 'triangle', .045); tone(1120, 1500, .14, 'sine', .025, .04); sus(.15, 6000, 1500, .03, 0, 'highpass'); break;
    case 'land': sus(.09, 900, 200, .07); break;
    case 'steg': sus(.035, 2200, 700, .018); break;
    case 'orb': tone(1320, 1320, .25, 'sine', .035); tone(1980, 1980, .3, 'sine', .022, .06); break;
    case 'au': tone(240, 70, .28, 'sawtooth', .05); sus(.2, 3000, 300, .06); break;
    case 'evne': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, .6, 'triangle', .04, i * .09)); sus(.8, 9000, 2000, .03, 0, 'highpass'); break;
    case 'liv': [659, 880, 1175].forEach((f, i) => tone(f, f, .4, 'sine', .04, i * .08)); break;
    case 'hemmelig': [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, .35, 'triangle', .035, i * .1)); break;
    case 'bryter': sus(.08, 1500, 300, .12); tone(300, 90, .45, 'square', .04, .03); tone(160, 40, .9, 'sawtooth', .05, .1); break;
    case 'brol': tone(65, 38, 1.4, 'sawtooth', .08); tone(98, 50, 1.2, 'square', .03, .1); sus(1.2, 2500, 200, .07); break;
    case 'lad': tone(300, 900, .45, 'sawtooth', .02); break;
    case 'skudd': tone(900, 260, .16, 'square', .018); sus(.1, 5000, 1000, .03); break;
    case 'slag': tone(110, 35, .5, 'sawtooth', .07); sus(.4, 1200, 80, .1); break;
    case 'varsel': tone(1400, 1400, .08, 'square', .015); break;
    case 'nedslag': sus(.35, 8000, 600, .09, 0, 'highpass'); tone(200, 50, .3, 'sawtooth', .04); break;
    case 'dor': sus(.4, 600, 60, .14); tone(70, 40, .5, 'square', .05); break;
    case 'lampe': tone(520, 520, .3, 'sine', .035); tone(780, 780, .45, 'sine', .03, .1); break;
    case 'pisk': sus(.12, 9000, 2500, .05, 0, 'highpass'); tone(1800, 500, .12, 'sawtooth', .025); break;
    case 'piskTreff': sus(.1, 4000, 800, .07, 0, 'bandpass'); tone(900, 1500, .1, 'square', .025); break;
    case 'stot': sus(.22, 7000, 500, .07, 0, 'bandpass'); tone(1100, 200, .2, 'sawtooth', .03); break;
    case 'trakk': tone(500, 1000, .1, 'square', .025); sus(.1, 3000, 600, .05); break;
    case 'dod': tone(320, 40, .9, 'triangle', .06); sus(.6, 2000, 100, .06); break;
    case 'gjenoppstaa': tone(260, 780, .5, 'sine', .035); tone(390, 1170, .5, 'sine', .02, .08); break;
    case 'bue': sus(.25, 7000, 2500, .05, 0, 'highpass'); break;
    case 'bossdod': [200, 150, 100, 60].forEach((f, i) => tone(f, f / 2, .6, 'sawtooth', .06, i * .22)); sus(1.6, 4000, 60, .12); break;
    case 'krok': tone(1500, 700, .08, 'square', .02); sus(.12, 4000, 1500, .05, 0, 'bandpass'); tone(260, 180, .12, 'triangle', .04, .06); break;
    case 'slipp': sus(.1, 2500, 800, .035); break;
    case 'plask': sus(.35, 1800, 200, .1); tone(900, 200, .25, 'sawtooth', .03); break;
    case 'relelad': tone(200, 700, .7, 'square', .012); break;
    case 'releskudd': tone(1200, 400, .12, 'square', .02); sus(.08, 6000, 2000, .03, 0, 'highpass'); break;
    case 'brol2': tone(90, 45, 1.2, 'square', .05); sus(1.1, 6000, 400, .08, 0, 'bandpass'); tone(180, 60, .9, 'sawtooth', .03, .15); break;
    case 'golvvarsel': [0, .3, .6, .9].forEach(d => tone(1000, 1000, .1, 'square', .016, d)); break;
    case 'golv': sus(.7, 7000, 1500, .1, 0, 'highpass'); tone(100, 100, .8, 'sawtooth', .05); break;
    case 'utmattet': tone(400, 90, .9, 'triangle', .05); break;
    case 'b2treff': sus(.12, 2000, 300, .12); tone(600, 120, .5, 'square', .04); tone(150, 40, .8, 'sawtooth', .05, .08); break;
    case 'fag': [587, 740, 880].forEach((f, i) => tone(f, f, .35, 'sine', .035, i * .07)); tone(1175, 1175, .5, 'triangle', .02, .22); break;
    case 'slipe': sus(.6, 9000, 3000, .1, 0, 'highpass'); tone(2400, 1800, .5, 'sawtooth', .02); sus(.3, 600, 80, .12, .3); break;
    case 'brol3': tone(55, 30, 1.6, 'sawtooth', .09); tone(82, 41, 1.4, 'square', .04, .1); sus(1.4, 3000, 120, .09); break;
    case 'port': tone(220, 880, .5, 'sine', .035); sus(.5, 3000, 600, .05, 0, 'bandpass'); tone(330, 1320, .4, 'triangle', .02, .1); break;
    case 'snakk': tone(520 + Math.random() * 120, 480, .07, 'triangle', .025); tone(640, 600, .06, 'sine', .015, .06); break;
    case 'vind': sus(1.8, 900, 300, .07, 0, 'bandpass'); sus(1.4, 2400, 800, .03, .2, 'bandpass'); break;
    case 'glid': sus(.3, 1800, 600, .04, 0, 'bandpass'); tone(300, 380, .2, 'sine', .015); break;
    case 'jager': tone(700, 1100, .18, 'sawtooth', .015); tone(1100, 900, .12, 'square', .01, .1); break;
    case 'spiker': sus(.05, 7000, 1800, .07, 0, 'highpass'); tone(420, 160, .07, 'square', .03); tone(2400, 1800, .04, 'triangle', .015, .02); break;
    case 'prell': tone(1600, 1200, .1, 'square', .03); sus(.08, 6000, 2500, .05, 0, 'highpass'); tone(800, 600, .12, 'triangle', .03, .03); break;
    case 'lynfugl': tone(1400, 2200, .25, 'sawtooth', .025); tone(2200, 900, .35, 'square', .015, .2); sus(.3, 8000, 3000, .04, .1, 'highpass'); break;
    case 'torden': sus(1.6, 600, 60, .14); tone(60, 35, 1.2, 'sawtooth', .04); sus(.2, 8000, 2000, .06, 0, 'highpass'); break;
    case 'svom': sus(.25, 1400, 300, .06); tone(300, 180, .15, 'sine', .02); break;
    case 'sluse': tone(90, 60, 1.6, 'sawtooth', .035); sus(1.8, 700, 150, .08); break;
    case 'jord': tone(160, 60, .5, 'square', .05); sus(.4, 3000, 200, .1); tone(900, 1400, .3, 'triangle', .03, .25); break;
    case 'metallstonn': tone(72, 44, 1.5, 'sawtooth', .03); tone(108, 70, 1.2, 'triangle', .02, .15); sus(1.3, 900, 220, .05, .05, 'bandpass'); break;
    case 'rele': sus(.02, 6000, 3000, .05, 0, 'highpass'); tone(1800, 1200, .02, 'square', .01); break;
    case 'stromTilbake': tone(45, 100, 1.8, 'sawtooth', .03); tone(90, 200, 1.8, 'sine', .03); sus(1.6, 300, 1400, .03, 0, 'bandpass');
      [.3, .5, .62, .8, .9, 1.05].forEach(d => { sus(.025, 6000, 3000, .06, d, 'highpass'); tone(1800, 1200, .02, 'square', .01, d); });
      [523, 659, 784].forEach((f, i) => tone(f, f, 1.4, 'triangle', .028, 1.3 + i * .05)); break;
    case 'slutt': [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 1.6, 'triangle', .04, i * .16)); break;
  }
}

// ---------- musikk (lages fortløpende, et eget tema for hvert område) ----------
// Hvert tema: tempo, grunntone (MIDI), skala, akkordrekke (trinn i skalaen) og hvor tett arpeggioen spiller.
const TEMA = {
  ute:    { bpm: 84, rot: 57, skala: [0, 2, 3, 5, 7, 8, 10], akk: [0, 5, 2, 6], arp: .55, lys: 1 },
  kjeller:{ bpm: 70, rot: 50, skala: [0, 2, 3, 5, 7, 9, 10], akk: [0, 3, 0, 6], arp: .35, lys: .6 },
  hall:   { bpm: 108, rot: 52, skala: [0, 1, 3, 5, 7, 8, 10], akk: [0, 1, 0, 6], arp: .8, lys: .8, puls: true },
  kabel:  { bpm: 76, rot: 54, skala: [0, 2, 3, 5, 7, 8, 10], akk: [0, 5, 3, 4], arp: .45, lys: .7 },
  stasjon:{ bpm: 92, rot: 55, skala: [0, 2, 4, 5, 7, 9, 10], akk: [0, 3, 4, 0], arp: .6, lys: .9 },
  boss3:  { bpm: 132, rot: 50, skala: [0, 1, 3, 5, 7, 8, 10], akk: [0, 5, 1, 4], arp: 1, lys: .9, puls: true },
  kraft:  { bpm: 66, rot: 48, skala: [0, 2, 3, 5, 7, 8, 11], akk: [0, 5, 3, 6], arp: .4, lys: .55 },
  boss4:  { bpm: 126, rot: 52, skala: [0, 1, 3, 5, 7, 8, 11], akk: [0, 3, 1, 5], arp: .95, lys: .85, puls: true },
  dam:    { bpm: 74, rot: 50, skala: [0, 2, 4, 5, 7, 9, 11], akk: [0, 5, 3, 4], arp: .55, lys: .85 },
  boss6:  { bpm: 128, rot: 50, skala: [0, 1, 3, 5, 7, 8, 10], akk: [0, 3, 5, 1], arp: .95, lys: .9, puls: true },
  sump:   { bpm: 68, rot: 47, skala: [0, 2, 3, 5, 7, 8, 10], akk: [0, 6, 3, 4], arp: .45, lys: .7 },
  boss7:  { bpm: 124, rot: 47, skala: [0, 1, 3, 5, 6, 8, 10], akk: [0, 1, 5, 3], arp: .95, lys: .85, puls: true },
  data:   { bpm: 88, rot: 45, skala: [0, 2, 3, 5, 7, 8, 11], akk: [0, 5, 6, 4], arp: .7, lys: .75 },
  boss8:  { bpm: 130, rot: 45, skala: [0, 1, 3, 5, 7, 8, 11], akk: [0, 6, 1, 5], arp: 1, lys: .9, puls: true },
  linja:  { bpm: 80, rot: 53, skala: [0, 2, 3, 5, 7, 9, 10], akk: [0, 4, 5, 3], arp: .5, lys: .9 },
  boss5:  { bpm: 138, rot: 53, skala: [0, 2, 3, 5, 7, 8, 10], akk: [0, 6, 5, 4], arp: 1, lys: .95, puls: true },
  boss2:  { bpm: 120, rot: 54, skala: [0, 1, 3, 5, 6, 8, 10], akk: [0, 1, 4, 1], arp: .9, lys: .8, puls: true },
};
const MUS = { gain: null, tema: null, neste: 0, steg: 0, takt: 0 };
const midiF = m => 440 * Math.pow(2, (m - 69) / 12);
function musTone(f, t, dur, type, vol) { const o = A.c.createOscillator(), g = A.c.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.4, dur * .3)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(MUS.gain); o.start(t); o.stop(t + dur + .05); }
function velgTema() {
  if (B8.aktiv && B8.fase !== 'dod') return 'boss8'; if (B7.aktiv && B7.fase !== 'dod') return 'boss7'; if (B6.aktiv && B6.fase !== 'dod') return 'boss6'; if (B5.aktiv && B5.fase !== 'dod') return 'boss5'; if (B4.aktiv && B4.fase !== 'dod') return 'boss4';
  if (P.y >= XY0 * T) return 'data'; if (P.y >= SY0 * T) return 'sump'; if (P.y >= DY0 * T) return 'dam'; if (P.y >= LY0 * T) return 'linja'; if (B3.aktiv && B3.fase !== 'dod') return 'boss3'; if (B2.aktiv && B2.fase !== 'dod') return 'boss2'; if (B.aktiv && B.fase !== 'dod') return 'hall';
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (iKraft(tx, ty)) return 'kraft'; if (tx >= 132 && ty <= 27) return 'stasjon'; if (iKjeller2(tx, ty)) return 'kabel'; if (erHall(tx, ty)) return S.bossDone ? 'ute' : 'kjeller'; if (inne(tx, ty)) return 'kjeller'; return 'ute';
}
function oppdaterMusikk() {
  if (!A.c) return;
  if (!MUS.gain) { MUS.gain = A.c.createGain(); MUS.gain.gain.value = 0; MUS.gain.connect(A.master); }
  const pa = INNST.mus && lydPa && (S.mode === 'spill' || S.mode === 'evne' || S.mode === 'kart' || S.mode === 'verk' || S.mode === 'dialog');
  MUS.gain.gain.setTargetAtTime(pa ? 1 : 0, A.c.currentTime, .4);
  if (!pa) { MUS.neste = 0; return; }
  const navn = velgTema(); const now = A.c.currentTime;
  if (MUS.neste < now) { MUS.neste = now + .05; MUS.steg = 0; }
  // planlegg noter litt fram i tid
  while (MUS.neste < now + .25) {
    if (MUS.steg % 16 === 0) { MUS.tema = TEMA[navn]; if (MUS.steg === 0 || MUS.steg >= 64) { MUS.steg = 0; } MUS.takt = MUS.steg / 16 | 0; }
    const tm = MUS.tema, sek = 60 / tm.bpm / 4, t = MUS.neste, st = MUS.steg, trinn = tm.akk[(st / 16 | 0) % tm.akk.length];
    const note = k => { const n = trinn + k, okt = Math.floor(n / 7); return tm.rot + tm.skala[((n % 7) + 7) % 7] + 12 * okt; };
    try {
      if (st % 16 === 0) { for (const k of [0, 2, 4]) musTone(midiF(note(k)), t, sek * 16, 'triangle', .011 * tm.lys); musTone(midiF(note(0) - 12), t, sek * 8, 'sine', .03); }
      if (st % 16 === 8) musTone(midiF(note(0) - 12), t, sek * 7, 'sine', .022);
      if (tm.puls && st % 2 === 0) musTone(midiF(note(0) - 24), t, sek * 1.2, 'square', .006);
      if (st % 2 === 0 && hs(st, MUS.takt, navn.length) < tm.arp) { const k = [0, 2, 4, 7, 4, 2][(st / 2) % 6 | 0] + (hs(st, 3, MUS.takt) < .2 ? 1 : 0);
        musTone(midiF(note(k) + 12), t, sek * 3, 'sine', .014 * tm.lys); }
    } catch (e) {}
    MUS.neste += sek; MUS.steg = (MUS.steg + 1) % 64;
  }
}
