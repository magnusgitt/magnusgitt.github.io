// Strømmen må på – grunnmotor: skjerm, lagring, lyd, inndata og dialog.
'use strict';
const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d');
const TS = 16, VH = 12 * TS;  // 12 ruter høyt
let VW = 16 * TS;
const erTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (erTouch) document.body.classList.add('touch');

function tilpass() {
  const liggende = erTouch && innerWidth > innerHeight && innerHeight <= 560;
  const w = Math.min(innerWidth, liggende ? innerWidth : 1100);
  const h = innerHeight - (erTouch && !liggende ? 196 : 0);
  VW = Math.max(11 * TS, Math.min(24 * TS, Math.round(VH * w / Math.max(200, h) / 2) * 2));
  c.width = VW; c.height = VH; g.imageSmoothingEnabled = false;
}
addEventListener('resize', tilpass); tilpass();

// ── Lagring ─────────────────────────────────────────────────────────
// Samme nøkkel som første versjon. Eldre lagringer flyttes over i lastLagring().
const LAGRE = 'voltbase_eventyr_v1';
const LAGRE_VERSJON = 3;
const START = () => ({
  v: LAGRE_VERSJON, ting: {}, flagg: {}, kobber: 0, aapnet: {}, cuGram: true, omr: 'ute', pos: null,
  xp: 0, oppdrag: {}, valg: {}, rykte: 0, teller: {}, klokke: 7 * 60, dag: 1, spilletid: 0, kosmetikk: null,
});
let lagret = START();
let lagringsFeil = '';
function lastLagring() {
  let r = null;
  try { r = localStorage.getItem(LAGRE); } catch (e) { return; }
  if (!r) return;
  try {
    const gml = JSON.parse(r);
    if (!gml || typeof gml !== 'object') throw new Error('ugyldig');
    if (!gml.cuGram && !gml.v) { gml.kobber = (gml.kobber || 0) * 50; gml.cuGram = true; } // første versjon talte «Cu», nå gram
    const ny = Object.assign(START(), gml);
    for (const k of ['ting', 'flagg', 'aapnet', 'oppdrag', 'valg', 'teller']) if (!ny[k] || typeof ny[k] !== 'object') ny[k] = {};
    for (const k of ['kobber', 'xp', 'rykte', 'klokke', 'dag', 'spilletid']) if (typeof ny[k] !== 'number' || !isFinite(ny[k])) ny[k] = START()[k];
    // v2 hadde oppdrag uten mål-steg: «aktiv»/«ferdig» beholdes som de er
    ny.v = LAGRE_VERSJON;
    lagret = ny;
  } catch (e) {
    // Ødelagt lagring: ta vare på den og start på nytt i stedet for å krasje
    try { localStorage.setItem(LAGRE + '_feil_' + Date.now(), r); } catch (e2) {}
    lagringsFeil = 'Den gamle lagringen var skadet og kunne ikke leses. Du starter på nytt.';
    lagret = START();
  }
}
lastLagring();
const lagre = () => { try { localStorage.setItem(LAGRE, JSON.stringify(lagret)); } catch (e) {} };
const harLagring = () => { try { return !!localStorage.getItem(LAGRE); } catch (e) { return false; } };

// ── Lyd ─────────────────────────────────────────────────────────────
let lydKtx = null;
function pip(f = 600, d = 0.08, type = 'square', vol = 0.04, glid = 0) {
  try {
    lydKtx = lydKtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = lydKtx.createOscillator(), v = lydKtx.createGain();
    o.type = type; o.frequency.value = f; v.gain.value = vol; o.connect(v); v.connect(lydKtx.destination);
    const t0 = lydKtx.currentTime;
    if (glid) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + glid), t0 + d);
    o.start(t0); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.stop(t0 + d + 0.02);
  } catch (e) {}
}
const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => pip(f, 0.12, 'square', 0.05), i * 110));
const LYD = {
  mynt: () => { pip(1200, 0.05, 'triangle', 0.03); setTimeout(() => pip(1600, 0.05, 'triangle', 0.03), 50); },
  steg: () => pip(90 + Math.random() * 30, 0.025, 'triangle', 0.012),
  au: () => pip(160, 0.25, 'sawtooth', 0.06, -100),
  zap: () => pip(1400, 0.08, 'sawtooth', 0.03, -900),
  dor: () => { pip(220, 0.08, 'square', 0.03); setTimeout(() => pip(180, 0.1, 'square', 0.03), 70); },
  trapp: (opp) => [0, 1, 2].forEach((i) => setTimeout(() => pip(opp ? 260 + i * 70 : 400 - i * 70, 0.07, 'triangle', 0.04), i * 80)),
  feil: () => pip(150, 0.3, 'sawtooth', 0.05),
  riktig: () => { pip(660, 0.08, 'square', 0.04); setTimeout(() => pip(990, 0.12, 'square', 0.04), 90); },
  oppdrag: () => [784, 988, 1175].forEach((f, i) => setTimeout(() => pip(f, 0.09, 'triangle', 0.05), i * 90)),
};

// ── Hjelpere ────────────────────────────────────────────────────────
const fmtCu = (gram) => {
  gram = Math.round(gram);
  if (gram < 1000) return gram + ' g';
  if (gram < 1e6) return (gram / 1000).toLocaleString('nb-NO', { maximumFractionDigits: 2 }) + ' kg';
  return (gram / 1e6).toLocaleString('nb-NO', { maximumFractionDigits: 2 }) + ' t';
};
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = (h ^ (h >>> 13)) * 1274126177 >>> 0; return h; };
const treff = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const tilf = (liste) => liste[Math.floor(Math.random() * liste.length)];
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// ── Inndata ─────────────────────────────────────────────────────────
const tast = { o: false, n: false, v: false, h: false };
let aTrykk = false;
const TK = { ArrowUp: 'o', KeyW: 'o', ArrowDown: 'n', KeyS: 'n', ArrowLeft: 'v', KeyA: 'v', ArrowRight: 'h', KeyD: 'h' };
const tastLyttere = [];  // (e) => true hvis tastetrykket er håndtert
addEventListener('keydown', (e) => {
  if (TK[e.code]) { tast[TK[e.code]] = true; e.preventDefault(); }
  if (iDialog && dialogKo[0] && dialogKo[0].valg && /^Digit[1-9]$/.test(e.code)) {
    const b = $('valg').children[Number(e.code.slice(5)) - 1];
    if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    return;
  }
  for (const f of tastLyttere) if (f(e)) return;
  if ((e.code === 'Space' || e.code === 'KeyE' || e.code === 'Enter') && !e.repeat) { aTrykk = true; e.preventDefault(); }
});
addEventListener('keyup', (e) => { if (TK[e.code]) tast[TK[e.code]] = false; });
addEventListener('blur', () => { tast.o = tast.n = tast.v = tast.h = false; });
function knapp(id, ned, opp) {
  const el = $(id);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.classList.add('aktiv'); ned(); });
  const slipp = (e) => { e.preventDefault(); el.classList.remove('aktiv'); if (opp) opp(); };
  el.addEventListener('pointerup', slipp); el.addEventListener('pointercancel', slipp); el.addEventListener('pointerleave', slipp);
}
knapp('pO', () => tast.o = true, () => tast.o = false);
knapp('pN', () => tast.n = true, () => tast.n = false);
knapp('pV', () => tast.v = true, () => tast.v = false);
knapp('pH', () => tast.h = true, () => tast.h = false);
knapp('knA', () => aTrykk = true);

// ── Dialog ──────────────────────────────────────────────────────────
// snakk(navn, sider, ferdig): sider er tekster eller { tekst, valg: [[tekst, fn], ...] }.
let dialogKo = [], iDialog = false, dialogPortrett = null, ventMelding = null;
function snakk(navn, sider, ferdig, portrett) {
  dialogKo = sider.map((s) => (typeof s === 'string' ? { tekst: s } : s));
  dialogKo.navn = navn; dialogKo.ferdig = ferdig;
  dialogPortrett = portrett === undefined ? (typeof portrettFor === 'function' ? portrettFor(navn) : null) : portrett;
  iDialog = true; meldingTimer = 0; $('melding').style.display = 'none'; visSide();
}
function visSide() {
  const s = dialogKo[0];
  $('dialogNavn').textContent = dialogKo.navn || '';
  $('dialogTekst').textContent = s.tekst;
  const pc = $('dialogPortrett'), px = pc.getContext('2d');
  px.clearRect(0, 0, 12, 16);
  if (dialogPortrett) { pc.classList.remove('skjult'); px.drawImage(dialogPortrett, 0, 0); } else pc.classList.add('skjult');
  const v = $('valg'); v.innerHTML = '';
  $('dialogVidere').style.display = s.valg ? 'none' : 'block';
  if (s.valg) for (const [i, [tekst, fn, av]] of s.valg.entries()) {
    const b = document.createElement('button'); b.textContent = (erTouch ? '' : (i + 1) + '. ') + tekst;
    if (av) b.classList.add('av');
    b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); lukkDialog(); fn(); });
    v.appendChild(b);
  }
  $('dialog').classList.add('vis'); $('dialog').scrollTop = 0;
  pip(880, 0.03, 'square', 0.02);
}
function nesteSide() {
  if (dialogKo[0] && dialogKo[0].valg) return;
  dialogKo.shift();
  if (dialogKo.length) visSide();
  else { const f = dialogKo.ferdig; lukkDialog(); if (f) f(); }
}
function lukkDialog() {
  iDialog = false; $('dialog').classList.remove('vis');
  if (ventMelding) { const m = ventMelding; ventMelding = null; setTimeout(() => { if (!iDialog) melding(m, 3.5); else ventMelding = m; }, 0); }
}
$('dialog').addEventListener('pointerdown', (e) => { if (e.target.tagName !== 'BUTTON') { e.preventDefault(); nesteSide(); } });

let meldingTimer = 0;
function melding(tekst, sek = 3) {
  if (iDialog) { ventMelding = tekst; return; }
  const m = $('melding'); m.textContent = tekst; m.style.display = 'block'; meldingTimer = sek;
}
let omrNavnTimer = 0;
function visOmrNavn(tekst) { const el = $('omrNavn'); el.textContent = tekst; el.classList.add('vis'); omrNavnTimer = 2.2; }
