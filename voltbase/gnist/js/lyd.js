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
    case 'stot': sus(.22, 7000, 500, .07, 0, 'bandpass'); tone(1100, 200, .2, 'sawtooth', .03); break;
    case 'trakk': tone(500, 1000, .1, 'square', .025); sus(.1, 3000, 600, .05); break;
    case 'dod': tone(320, 40, .9, 'triangle', .06); sus(.6, 2000, 100, .06); break;
    case 'gjenoppstaa': tone(260, 780, .5, 'sine', .035); tone(390, 1170, .5, 'sine', .02, .08); break;
    case 'bue': sus(.25, 7000, 2500, .05, 0, 'highpass'); break;
    case 'bossdod': [200, 150, 100, 60].forEach((f, i) => tone(f, f / 2, .6, 'sawtooth', .06, i * .22)); sus(1.6, 4000, 60, .12); break;
    case 'slutt': [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, 1.6, 'triangle', .04, i * .16)); break;
  }
}
