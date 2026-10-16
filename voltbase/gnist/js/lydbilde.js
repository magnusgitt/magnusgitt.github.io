'use strict';
// Gnist – lydbildet: vind over ruinene, gammelt metall som knirker, fottrinn etter underlag,
// metallstønn når en boss våkner, og lyden av at strømmen kommer tilbake.
const LB = { vind: null, filter: null, knirkT: 5, niva: -1, stromT: 0, fase: [] };
function lydbildeInit() {
  if (LB.vind || !A.c) return;
  try { const c = A.c, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = A.stoy; s.loop = true;
    f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = .7; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(A.master); s.start(); LB.vind = g; LB.filter = f; } catch (e) {}
}
// hva montøren står på
function underlag() {
  if (P.iVann) return 'vann';
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h + 2) / T), t = tile(tx, ty);
  if (t === ONE || t === LUKE) return 'metall';
  if (inne(tx, ty - 1)) return 'betong';
  const pal = palAt(tx, ty); return pal === PAL.ute || pal.gress ? 'gress' : 'stein';
}
function fottrinn() {
  if (!A.c || !lydPa) return;
  switch (underlag()) {
    case 'gress': sus(.08, 1500, 400, .022); sus(.05, 6000, 3000, .007, .01, 'highpass'); break;
    case 'metall': tone(360 + Math.random() * 80, 280, .07, 'triangle', .016); sus(.03, 4200, 1600, .016, 0, 'bandpass'); break;
    case 'betong': sus(.035, 2600, 900, .02); tone(150, 90, .04, 'sine', .012); break;
    case 'vann': sus(.14, 1600, 350, .03, 0, 'bandpass'); break;
    default: sus(.035, 2200, 700, .018);
  }
}
// knirk: mange små klikk tett etter hverandre, som metall som glipper mot metall
function knirk(tung) {
  if (!A.c || !lydPa) return; const f = (tung ? 60 : 110) + Math.random() * 70, n = 10 + (Math.random() * 10 | 0), opp = Math.random() < .5 ? 1 : -1;
  for (let i = 0; i < n; i++) tone(f * (1 + opp * i * .025), f * (1 + opp * i * .025) * .9, .05, 'square', tung ? .007 : .0045, i * (.035 + Math.random() * .02));
  sus(n * .045, tung ? 700 : 1400, tung ? 250 : 600, tung ? .02 : .01, 0, 'bandpass');
}
function oppdaterLydbilde(dt) {
  if (!A.c) return; lydbildeInit(); if (!LB.vind) return;
  const spill = S.mode === 'spill' || S.mode === 'intro', ty = Math.floor((P.y + P.h / 2) / T), sone = soneFor(ty);
  const ute = sone === 1 || (ST.navn === 'ute' && sone === 0), kast = sone === 1 ? VIND.styrke : 0, t = A.c.currentTime;
  // vinden: sterkest ute i den døde byen, stilner litt etter hvert som byen våkner
  const maal = !spill || !lydPa ? 0 : (ute ? .045 : .01) * (1 - lysNiva() * .4) * (.75 + .25 * Math.sin(S.t * .23)) + kast * .05;
  LB.vind.gain.setTargetAtTime(maal, t, .7); LB.filter.frequency.setTargetAtTime(360 + 240 * (.5 + .5 * Math.sin(S.t * .31)) + kast * 600, t, .8);
  if (spill && ute && sone === 0) { LB.knirkT -= dt * (1.2 - lysNiva() * .7); if (LB.knirkT <= 0) { LB.knirkT = 8 + Math.random() * 12; knirk(Math.random() < .3); } }
  // en boss som våkner, stønner som gammelt metall
  [B, B2, B3, B4].forEach((b, i) => { if (b.fase === 'intro' && LB.fase[i] !== 'intro') { knirk(true); lyd('metallstonn'); } LB.fase[i] = b.fase; });
  // strømmen kommer tilbake: litt etter at en boss er slått, går et anlegg i gang et sted i byen
  const n = lysNiva(); if (LB.niva < 0 || n < LB.niva) LB.niva = n; else if (n > LB.niva) { LB.niva = n; LB.stromT = 2.4; }
  if (LB.stromT > 0 && S.mode === 'spill') { LB.stromT -= dt; if (LB.stromT <= 0) lyd('stromTilbake'); }
}
