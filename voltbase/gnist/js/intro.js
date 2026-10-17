'use strict';
// Gnist – introen: en død verden, en ensom vandrer, den døde elektrikeren og arven.
// Spilles med spillets egen verden, kamera og figur, og kan hoppes over med et trykk.
const ELEKTRIKER = { x: 9, y: 23 };                    // under det sammenraste skuret ved starten
const INTRO = { aktiv: false, t: 0, tekst: -1, tatt: true, kam: null };
const INTRO_TEKST = [
  [1, 5.2, 'For hundre år siden forsvant strømmen fra verden.'],
  [6, 9.6, 'Ingen husker lenger hvorfor. Lys er blitt en myte.'],
  [10.4, 14, 'Her ble den siste elektrikeren liggende.'],
  [15, 18.6, '«Jeg holdt lyset i gang så lenge jeg kunne. Ta verktøyet mitt.»', 'sjel'],
  [20, 24.4, '«Kraftverket står der ennå. Hjelp meg å tenne det igjen.»', 'sjel'],
];
const INTRO_SLUTT = 25.6;
function startIntro() {
  Object.assign(INTRO, { aktiv: true, t: 0, tekst: -1, tatt: false, kam: { x: 60 * T, y: 4 * T } });
  ANIM.drakt = 'vandrer'; GN.skjult = true;
  P.x = 1.2 * T; P.y = 24 * T - P.h; P.vx = P.vy = 0; P.face = 1; P.onGround = true;
  S.mode = 'intro'; document.documentElement.classList.add('iIntro'); $('#intro').classList.add('vis'); $('#introTekst').textContent = ''; $('#introTekst').classList.remove('vis');
  cam.x = INTRO.kam.x; cam.y = INTRO.kam.y; nullInput();
}
function introTa() {
  // sjelen til elektrikeren stiger opp fra brystet hans som et lite lys, og vandreren tar utstyret og blir montøren
  INTRO.tatt = true; ANIM.drakt = 'montor'; GN.skjult = false; ANIM.overstyr = null;
  const [bx, by] = sjelPunkt(); GN.x = bx; GN.y = by; GN.vx = -10; GN.vy = -70; GN.flare = 1.1;
  S.flash = .35; S.flashF = '170,230,255'; ring(bx, by, 20, 'c', 120); sprut(bx, by, 18, 'c', 90); lyd('evne'); vib([15, 30, 15]);
}
function sluttIntro() {
  if (!INTRO.aktiv) return; INTRO.aktiv = false; document.documentElement.classList.remove('iIntro');
  if (!INTRO.tatt) introTa();
  ANIM.overstyr = null; TS.left = TS.right = TS.jump = false; oppdaterTaster();
  $('#intro').classList.remove('vis'); S.mode = 'spill'; sist = performance.now();
  P.vx = 0; oppdaterKamera(0, true); setTimeout(() => sjekkMaal(true), 1500);
  if (erTouch && cssH > cssW && !snuVist) { snuVist = true; S.mode = 'snu'; visLag('#lagSnu'); }
  banner('Gnist', 'Byggeplassen'); S.hintSett.add('omr-Byggeplassen');
  setTimeout(() => hint(null, erTouch ? 'Gå med venstre tommel. Hopp med høyre. Hold inne for høyere hopp.' : 'Gå med piltastene. Hopp med mellomrom. Hold inne for høyere hopp.', 5), 1600);
  setTimeout(() => { if (S.mode === 'spill') hint(null, '«Står du stille, viser jeg deg veien videre.»', 5); }, 8500);
}
function oppdaterIntro(dt) {
  const t = (INTRO.t += dt), vw = cssW / skala, vh = cssH / skala, kx = ELEKTRIKER.x * T;
  // vandreren går langsomt inn fra venstre og stopper ved skuret
  const gaar = t > 7 && P.x < kx - 1.6 * T;
  P.piskT = -1; P.dashT = 0; P.spor.length = 0;
  P.vx = gaar ? 62 : 0; P.face = 1; P.onGround = true; P.vy = 0;
  if (gaar) { const f = Math.sin(P.anim); P.x += 62 * dt; P.anim += dt * 62 * .075; if (Math.sign(f) !== Math.sign(Math.sin(P.anim))) { fottrinn(); stov(P.x + P.w / 2, P.y + P.h, 1, .3); } }
  // han ser ned på skjelettet, kneler og tar utstyret
  if (t > 7 && !gaar && t <= 12.6) ANIM.overstyr = { b1: [-.08, .14], b2: [.08, .14], a1: [-.15, .2], a2: [.15, .25], bob: 0, hode: .4, lean: .06, tilt: .3, fart: 4 };
  else if (t > 12.6 && t < 16.2) ANIM.overstyr = { b1: [.15, 1.6], b2: [1.1, 1.9], a1: [.3, .4], a2: [1.15, .25], bob: 0, hode: 1.2, lean: .38, tilt: .3, fart: 7 };
  else if (t >= 16.2 && t < 17.5) ANIM.overstyr = { b1: [-.05, .2], b2: [.1, .3], a1: [-.2, .3], a2: [1.5, 1.6], bob: 0, hode: 0, lean: 0, tilt: -.1, fart: 8 };
  else if (t >= 17.5 && t < INTRO_SLUTT) ANIM.overstyr = { b1: [-.08, .14], b2: [.08, .14], a1: [-.15, .2], a2: [.15, .25], bob: 0, hode: -.6, lean: -.04, tilt: -.28, blikk: .8, fart: 4 };
  if (t > 15.2 && !INTRO.tatt) introTa();
  // kameraet: langsomt over den døde byen, ned til vandreren, og til slutt ut mot kraftverket i det fjerne
  let mx, my;
  if (t < 6) { const k = glatt(0, 6, t); mx = mix(58 * T, 14 * T, k) - vw / 2; my = mix(3 * T, 12 * T, k) - vh / 2; }
  else if (t < 17.5) { mx = P.x + P.w / 2 - vw * .42; my = P.y - vh * .55; }
  else if (t < 22) { const k = glatt(17.5, 20.5, t); mx = P.x + P.w / 2 - vw * .42 + k * 10 * T; my = P.y - vh * .55 - k * 6 * T; }
  else { const k = glatt(22, 25, t); mx = P.x + P.w / 2 - vw * .42 + (1 - k) * 10 * T; my = P.y - vh * .55 - (1 - k) * 6 * T; }
  mx = clamp(mx, 0, MW * T - vw); my = clamp(my, 0, 72 * T - vh);
  const f = 1 - Math.exp(-dt * (t < 6 ? 3 : 2.2)); INTRO.kam.x += (mx - INTRO.kam.x) * f; INTRO.kam.y += (my - INTRO.kam.y) * f;
  // tekstlinjene tones inn og ut
  const i = INTRO_TEKST.findIndex(([a, b]) => t >= a && t < b);
  if (i !== INTRO.tekst) { INTRO.tekst = i; const el = $('#introTekst'); el.classList.remove('vis'); if (i >= 0) setTimeout(() => { if (INTRO.tekst === i) { el.textContent = INTRO_TEKST[i][2]; el.classList.toggle('sjel', INTRO_TEKST[i][3] === 'sjel'); el.classList.add('vis'); } }, 380); }
  if (t >= INTRO_SLUTT) sluttIntro();
}
// sjelen til elektrikeren forteller videre etter hver boss
const SJEL_ORD = {
  B1: '«Hallen har lys igjen. Jeg kjenner strømmen i veggene, som et hjerte som slår.»',
  B2: '«Jeg koblet disse rommene for lenge siden. Den natta klarte jeg ikke å stoppe det som skjedde.»',
  B3: '«Byen våkner. Men strømmen ble ikke borte av seg selv. Noen slo den av.»',
  B4: '«Kraftverket går igjen. Linja opp mot fjellet fører til dammen. Der begynte det.»',
  B5: '«Stormen var aldri vær. Den var strøm uten styring, akkurat som den natta.»',
  B6: '«Dammen er stille. Men lyset skal lenger enn hit. Jeg blir med deg.»',
  B7: '«Røttene drakk av den samme strømmen. Noe lenger inne i nettet trekker fortsatt i den.»',
};
function sjelSier(id) { setTimeout(() => { if (S.mode === 'spill' && !GN.skjult) { hint(null, SJEL_ORD[id], 4); GN.flare = 1; } }, 3800); }
// brystet til skjelettet, der sjelen hans ennå lyser svakt
function sjelPunkt() { return [ELEKTRIKER.x * T + 29, (ELEKTRIKER.y + 1) * T - 15]; }
function sjelGlod() {
  if (!INTRO.aktiv || INTRO.tatt || INTRO.t < 9.5) return; const [x, y] = sjelPunkt(); if (!synlig(x, y, 80)) return;
  const k = glatt(9.5, 15, INTRO.t), p = .75 + .25 * Math.sin(INTRO.t * 2.6);
  glod(SPR.c, x, y, 10 + 22 * k, (.15 + .55 * k) * p); glod(SPR.h, x, y, 2 + 3 * k, (.3 + .6 * k) * p);
}
TEGN_GLOD.push(sjelGlod);
function fjernForskyv(lw) {
  const vw = cssW / grunnSkala, kxF = clamp(ELEKTRIKER.x * T - 1.6 * T + 12 - vw * .42 + 10 * T, 0, MW * T - vw);
  return .66 * cv.width - 1380 * lw / LW + kxF * grunnSkala * dpr * .08;
}
function introKamera() { if (INTRO.aktiv) { cam.x = INTRO.kam.x; cam.y = INTRO.kam.y; cam.zoom = 1; skala = grunnSkala; } }
// den døde elektrikeren under et sammenrast skur, med verktøykassa ved siden av
function tegnElektriker() {
  const X = ELEKTRIKER.x * T, Y = (ELEKTRIKER.y + 1) * T; if (!synlig(X, Y, 200) || soneFor(ELEKTRIKER.y) !== 0) return;
  ctx.save(); ctx.lineCap = 'round';
  // skuret: en knekt stolpe og en bølgeblikkplate som har rast ned
  ctx.fillStyle = '#20262e'; ctx.fillRect(X + 34, Y - 54, 5, 54); ctx.save(); ctx.translate(X + 36, Y - 54); ctx.rotate(.95);
  ctx.fillStyle = '#39424c'; ctx.fillRect(-4, -2, 74, 7); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 74; i += 7) ctx.fillRect(i - 4, -2, 2, 7); ctx.fillStyle = 'rgba(150,90,50,.45)'; ctx.fillRect(20, -2, 14, 7); ctx.restore();
  ctx.fillStyle = '#2a3038'; ctx.save(); ctx.translate(X - 18, Y); ctx.rotate(-.28); ctx.fillRect(0, -6, 60, 6); ctx.restore();
  // skjelettet sitter lent mot stolpen
  const bx = X + 28, by = Y;
  ctx.strokeStyle = '#d9d2bf'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.lineTo(bx - 12, by - 3); ctx.lineTo(bx - 20, by - 1); ctx.moveTo(bx, by - 5); ctx.lineTo(bx - 10, by - 8); ctx.lineTo(bx - 18, by - 2); ctx.stroke();
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 1, by - 5); ctx.lineTo(bx + 3, by - 22); ctx.stroke();
  ctx.lineWidth = 1.2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(bx + 2.6 - i * .2, by - 19 + i * 3); ctx.quadraticCurveTo(bx - 4, by - 18 + i * 3, bx - 3, by - 15 + i * 3); ctx.stroke(); }
  ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(bx + 3, by - 20); ctx.lineTo(bx - 4, by - 13); ctx.lineTo(bx - 9, by - 6); ctx.stroke();
  if (!INTRO.tatt) { ctx.fillStyle = 'rgba(255,150,44,.8)'; ctx.beginPath(); ctx.moveTo(bx - 4, by - 22); ctx.lineTo(bx + 7, by - 22); ctx.lineTo(bx + 6, by - 8); ctx.lineTo(bx - 3, by - 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(232,242,255,.7)'; ctx.fillRect(bx - 4, by - 17, 10, 1.6); }
  else { ctx.fillStyle = 'rgba(70,58,46,.8)'; ctx.beginPath(); ctx.moveTo(bx - 3, by - 21); ctx.lineTo(bx + 6, by - 21); ctx.lineTo(bx + 5, by - 9); ctx.lineTo(bx - 1, by - 12); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#e4ddc8'; ctx.beginPath(); ctx.arc(bx + 5, by - 26, 4.6, 0, 7); ctx.fill(); ctx.fillRect(bx + 5, by - 24, 4.5, 3);
  ctx.fillStyle = '#2a2622'; ctx.beginPath(); ctx.arc(bx + 6.6, by - 26.5, 1.3, 0, 7); ctx.arc(bx + 3.4, by - 26.2, 1.1, 0, 7); ctx.fill();
  if (!INTRO.tatt) { ctx.fillStyle = '#d8b632'; ctx.beginPath(); ctx.arc(bx + 5, by - 28, 5.6, Math.PI, 0); ctx.fill(); ctx.fillRect(bx - .5, by - 28.6, 12, 2); }
  // verktøykassa, åpen
  const tx = X + 2, ty = Y; ctx.fillStyle = '#8a3a22'; rr(ctx, tx, ty - 9, 18, 9, 1.5); ctx.fill(); ctx.save(); ctx.translate(tx + 18, ty - 9); ctx.rotate(-1.9); ctx.fillStyle = '#6e2e1b'; ctx.fillRect(0, 0, 18, 3); ctx.restore();
  ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx + 4, ty - 9); ctx.lineTo(tx + 6, ty - 15); ctx.moveTo(tx + 10, ty - 9); ctx.lineTo(tx + 13, ty - 14); ctx.stroke();
  ctx.restore();
}
TEGN_VERDEN.push(tegnElektriker);
// et trykk eller en tast hopper over introen
$('#intro').addEventListener('pointerdown', e => { e.preventDefault(); if (INTRO.t > .4) sluttIntro(); });
