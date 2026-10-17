'use strict';
// Gnist – område 9: Nordlyset. Fjellet bak kraftverket med snø, stamnettmaster og nordlys du kan gli på.
// På toppen står Sentralen, systemet som tok strømmen. Når den er slått, kommer slutten og ny runde+.
const NY0 = 260;   // øverste rad i sonen
SONER.push({ id: 'nord', navn: 'Nordlyset', y0: NY0, y1: 319 });

// ---------- terrenget ----------
OMRAADER.push({ navn: 'Nordlyset', kart: [
  [3, 312, 3, 315, AIR],                                   // nisjen med porten tilbake til kraftverket
  [4, 286, 34, 315, AIR],                                  // fjellfoten
  [35, 280, 100, 315, AIR],                                // skrenten opp mot bryterhuset
  [40, 313, 49, 315, SOL], [50, 310, 59, 315, SOL], [60, 307, 69, 315, SOL], [70, 304, 100, 315, SOL],
  [44, 306, 48, 306, ONE], [62, 300, 66, 300, ONE],
  [86, 296, 96, 296, SOL], [86, 297, 86, 301, SOL], [96, 297, 96, 301, SOL],   // bryterhuset
  [101, 276, 150, 314, AIR], [101, 315, 150, 315, HAZ],    // juvet: stupet i bunnen
  [124, 300, 127, 315, SOL],                               // en søyle midt i juvet
  [151, 276, 170, 300, AIR], [160, 296, 163, 296, ONE], [154, 292, 157, 292, ONE],   // toppkammen
  [171, 264, 197, 300, AIR],                               // toppen (Sentralen)
  [172, 291, 176, 291, ONE], [192, 291, 196, 291, ONE], [180, 281, 188, 281, ONE],
] });
const ARENA9 = { x0: 172, x1: 196, gulv: 301, midt: 184.5, tak: 264 };
const inneNord = (x, y) => x >= 87 && x <= 95 && y >= 297 && y <= 303;

// ---------- porter, nordlysbånd og funn ----------
PORTER.push({ x: 3, y0: 41, y1: 44, til: [6, 315], krav: () => S.boss8, stengt: 'En dør ut mot fjellet. Stormen utenfor er for sterk ennå.' },
  { x: 3, y0: 312, y1: 315, til: [6, 44], krav: () => true });
// båndene er stier av ruter, som fiberrørene, men montøren rir oppå dem
const BAND = [
  { pkt: [[101, 300], [106, 295], [113, 293], [119, 294], [123, 298]] },
  { pkt: [[128, 298], [133, 293], [140, 292], [146, 295], [150, 299]] },
  { pkt: [[77, 302], [79, 296], [82, 292], [84, 290]] },                    // en kort øvelse ved bryterhuset
  { pkt: [[176, 289], [178, 284], [181, 280]], arena: true },
  { pkt: [[192, 289], [190, 284], [187, 280]], arena: true },
];
IKON.lynglid = '<svg viewBox="0 0 24 24"><path d="M1 16c5-8 9 2 13-5s6-6 9-6v3c-3 0-4 2-7 6s-9 6-15 5zM9 20l3-5h-2l2-4"/></svg>';
FUNN.push({ id: 'lynglid', x: 91, y: 302, navn: 'Lynglid', tekst: 'Et par lynglidere fra linjemennene på stamnettet. Med dem kan du gli på nordlyset som på en skinne.',
  pc: 'Hopp opp i nordlyset. <b>Mellomrom</b> slipper taket', mob: 'Hopp opp i nordlyset. Trykk Hopp for å slippe' });

// ---------- sjekkpunkt, fagkort, lysorber og fiender ----------
VERKSTED.push(SJEKK.length);
SJEKK.push({ x: 8, y: 315 }, { x: 93, y: 303 }, { x: 155, y: 300 });
FAG.push(
  { x: 20, y: 315, tittel: 'Stamnettet', tekst: 'Stamnettet er motorveien i strømnettet. Det frakter strøm over lange avstander med høy spenning, i Norge stort sett 300 eller 420 kV.' },
  { x: 64, y: 299, tittel: 'Islast på linjer', tekst: 'Is og våt snø kan legge seg rundt linjene og gjøre dem mange ganger tyngre. Linjer i fjellet dimensjoneres for slik islast.' },
  { x: 88, y: 303, spor: true, tittel: 'Spor: hovedbryteren', tekst: 'En lapp er teipet over hovedbryteren: «Jeg slo av alt. Sentralen kan ikke stoppes så lenge den har strøm. Ikke slå på igjen før den er borte.»' },
  { x: 166, y: 299, tittel: 'Frakobling av anlegg', tekst: 'Et anlegg som skal kobles fra, skal brytes på alle faser og sikres mot innkobling, for eksempel med lås og skilt på bryteren.' });
ORBER.push([12, 313], [26, 312], [38, 310], [46, 304], [54, 307], [64, 298], [74, 301], [80, 298], [84, 288], [92, 300],
  [108, 292], [116, 291], [125, 297], [136, 290], [144, 292], [158, 294], [161, 294], [168, 298], [174, 289], [194, 289], [184, 279]);
FIENDE_DEF.push({ type: 'stormfugl', x: 30, y: 296 }, { type: 'isbjelle', x: 57, y: 309 }, { type: 'stormfugl', x: 66, y: 290 }, { type: 'skjold', x0: 71, x1: 84, y: 303 },
  { type: 'stormfugl', x: 112, y: 284 }, { type: 'stormfugl', x: 140, y: 284 }, { type: 'isbjelle', x: 158, y: 300 }, { type: 'jager', x: 165, y: 290 });

// ---------- nye fiender ----------
// stormfugl: kretser høyt og stuper mot montøren i en bue. isbjelle: står stille og sender ut en ring av iskuler
FIENDE_TYPER.stormfugl = {
  ny: f => ({ type: 'stormfugl', hx: f.x * T, hy: f.y * T, x: f.x * T, y: f.y * T, w: 24, h: 16, dir: 1, liv: true, t: Math.random() * 6, fase: 'sirkel', fT: 2, mx: 0, my: 0, sx: 0, sy: 0 }),
  oppdater(e, dt, pcx, pcy) {
    e.fT -= dt * NG(); const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    if (e.fase === 'sirkel') { const mx = e.hx + Math.cos(e.t * .9) * 3 * T, my = e.hy + Math.sin(e.t * 1.8) * T; e.dir = mx > cx ? 1 : -1; e.x += (mx - cx) * Math.min(1, dt * 2); e.y += (my - cy) * Math.min(1, dt * 2);
      if (e.fT <= 0 && Math.abs(pcx - cx) < 7 * T && pcy > cy && pcy - cy < 9 * T) { e.fase = 'varsel'; e.fT = .45; lyd('jager'); } }
    else if (e.fase === 'varsel') { e.y -= 30 * dt; if (e.fT <= 0) { e.fase = 'stup'; e.fT = 1; e.sx = cx; e.sy = cy; e.mx = pcx; e.my = pcy; e.dir = pcx > cx ? 1 : -1; } }
    else if (e.fase === 'stup') { const k = 1 - Math.max(0, e.fT), ex = e.sx + (e.mx - e.sx) * 2 * k, ey = e.sy + (e.my - e.sy) * Math.sin(k * Math.PI) * 1.1;
      e.x = ex - e.w / 2; e.y = ey - e.h / 2; if (e.fT <= 0) { e.fase = 'sirkel'; e.fT = 2.4; e.hx = ex; } }
  },
  tegn(e) {
    const X = e.x + e.w / 2, Y = e.y + e.h / 2, v = e.varsel || 0, slag = e.fase === 'stup' ? .3 : Math.sin(e.t * 9);
    ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir, 1); if (e.fase === 'stup') ctx.rotate(.4);
    ctx.fillStyle = '#3a4656'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-6, s * (10 + slag * 6), -16, s * (4 + slag * 8)); ctx.lineTo(4, s * 2); ctx.fill(); }
    const gr = ctx.createLinearGradient(0, -6, 0, 6); gr.addColorStop(0, '#b8c8da'); gr.addColorStop(1, '#4a5a6e'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5.5, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.clip(); rustFlekker(-11, -5, 22, 10, 141, 2, .4); ctx.restore(); nagler([[-4, 1]], .7);
    ctx.fillStyle = '#c9a77a'; ctx.beginPath(); ctx.moveTo(10, -1); ctx.lineTo(16, 1); ctx.lineTo(10, 3); ctx.fill();
    ctx.fillStyle = v > .5 || e.fase !== 'sirkel' ? '#ff5a3c' : '#9ff0ff'; ctx.beginPath(); ctx.arc(6, -1.5, 1.8, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(160,255,210,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-16, -2); ctx.lineTo(-19, 2); ctx.stroke();
    ctx.restore();
  },
  glod(e) { glod(SPR.g, e.x + e.w / 2, e.y + e.h / 2, 18, .35); }
};
FIENDE_TYPER.isbjelle = {
  ny: f => ({ type: 'isbjelle', x: f.x * T + 4, y: (f.y + 1) * T - 26, w: 24, h: 26, dir: 1, liv: true, t: Math.random() * 3, lad: 0, pause: 1.5 }),
  oppdater(e, dt, pcx, pcy) {
    const cx = e.x + e.w / 2, cy = e.y + 8, naer = Math.hypot(pcx - cx, pcy - cy) < 9 * T; e.pause -= dt;
    if (naer && e.pause <= 0) { if (e.lad === 0) lyd('relelad'); e.lad += dt * NG();
      if (e.lad > .8) { e.lad = 0; e.pause = 2.8 / NG(); lyd('releskudd'); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + e.t, s = 170 * NG(); bolter.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, liv: 3, f: 'c' }); } } }
    else e.lad = Math.max(0, e.lad - dt);
  },
  tegn(e) {
    const X = e.x + e.w / 2, Y = e.y + e.h, rist = e.lad > 0 ? Math.sin(S.t * 60) * e.lad * 2 : 0;
    ctx.save(); ctx.translate(X + rist, Y);
    ctx.fillStyle = '#2a323e'; ctx.fillRect(-9, -5, 18, 5);
    // en isolatorstabel av glass, dekket av rim
    for (let k = 0; k < 4; k++) { const y = -8 - k * 5, w = 11 - k * 1.2; ctx.fillStyle = k % 2 ? '#8fd0e8' : '#b8e8f8'; ctx.beginPath(); ctx.ellipse(0, y, w, 3, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-w * .6, y - 1.5, w * .5, 1); }
    ctx.fillStyle = '#c9a77a'; ctx.fillRect(-1.5, -30, 3, 6); ctx.fillStyle = e.lad > 0 ? '#fff' : (e.varsel || 0) > .5 ? '#ff5a3c' : '#9ff0ff'; ctx.beginPath(); ctx.arc(0, -31, 3, 0, 7); ctx.fill();
    ctx.restore();
  },
  glod(e) { glod(SPR.c, e.x + e.w / 2, e.y - 4, 16 + e.lad * 40, .4 + e.lad * .6); }
};

// ---------- lynglid: montøren rir på nordlyset ----------
const NB = { cd: 0 };
// montøren griper båndet når det er innenfor kroppen hans (litt romslig), nærmest føttene vinner
function naermesteBand(px, py) {
  let best = null;
  for (const r of BAND) { if (r.arena && B9.aktiv && B9.fase !== 'kamp') continue; rorMaal(r);
    for (let s = 0; s <= r.len; s += 8) { const [x, y] = rorPunkt(r, s); if (x < P.x - 10 || x > P.x + P.w + 10 || y < P.y - 6 || y > P.y + P.h + 12) continue;
      const d = Math.hypot(x - px, y - py); if (!best || d < best.d) best = { r, s, d }; } }
  return best;
}
function oppdaterBandInngang(dt) {
  NB.cd = Math.max(0, NB.cd - dt);
  if (P.band || P.ror || P.onGround || NB.cd > 0 || S.dod > 0 || S.mode !== 'spill' || P.y < NY0 * T - 200) return;
  const b = naermesteBand(P.x + P.w / 2, P.y + P.h); if (!b) return;
  if (!S.ev.lynglid) { hint('band', 'Nordlyset ligger lavt som et bånd. Med riktig utstyr kunne du glidd på det.', 4); return; }
  const [x0, y0] = rorPunkt(b.r, b.s - 4), [x1, y1] = rorPunkt(b.r, b.s + 4), tx = x1 - x0;
  P.band = { r: b.r, s: b.s, dir: P.vx * tx < 0 ? -1 : P.vx * tx > 0 ? 1 : (tx >= 0 ? 1 : -1) }; if (P.krok) slippKrok(false);
  P.vx = P.vy = 0; P.dashT = 0; lyd('glid'); GN.flare = .6;
}
// kalles fra montørens bevegelse: mens han rir, følger han båndet
function flyttPaBand(p, dt) {
  const o = p.band, r = o.r; o.s += o.dir * 640 * dt;
  const [x, y] = rorPunkt(r, o.s); p.x = x - p.w / 2; p.y = y - p.h + 2; p.onGround = false; p.air = S.ev.dobbel ? 1 : 0; p.canDash = true;
  if (Math.random() < dt * 30) part(x - o.dir * 8, y, -o.dir * 60, -20, .5, 4, 'g', 0);
  const slutt = (o.dir > 0 && o.s >= r.len) || (o.dir < 0 && o.s <= 0);
  if (I.jumpP || slutt) { const [ax, ay] = rorPunkt(r, o.s - o.dir * 10), l = Math.hypot(x - ax, y - ay) || 1;
    p.vx = (x - ax) / l * 380; p.vy = Math.min(-300, (y - ay) / l * 380 - 200); if (I.jumpP) { I.jumpP = false; p.vy = -620; lyd('hopp'); }
    p.band = null; NB.cd = .35; p.fallT = 0; }
}
function tegnBand() {
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const r of BAND) { rorMaal(r); const [mx, my] = rorPunkt(r, r.len / 2); if (!synlig(mx, my, r.len / 2 + 120)) continue;
    const aktiv = S.ev.lynglid && !(r.arena && B9.aktiv && B9.fase !== 'kamp');
    for (const [farge, dy, b, a] of [['110,255,180', 0, 10, .35], ['170,120,255', -10, 14, .18], ['200,255,230', 0, 3, .7]]) {
      ctx.strokeStyle = `rgba(${farge},${a * (aktiv ? 1 : .45)})`; ctx.lineWidth = b; ctx.beginPath();
      for (let s = 0; s <= r.len; s += 10) { const [x, y] = rorPunkt(r, s), w = Math.sin(s * .03 + S.t * 2.4) * 3 + dy; s ? ctx.lineTo(x, y + w) : ctx.moveTo(x, y + w); } ctx.stroke(); }
    // gardiner av lys som henger ned fra båndet
    for (let s = 0; s <= r.len; s += 18) { const [x, y] = rorPunkt(r, s), h = 30 + Math.sin(s * .07 + S.t * 1.7) * 14, a = (.08 + .06 * Math.sin(s * .11 + S.t * 3)) * (aktiv ? 1 : .5);
      const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, `rgba(120,255,190,${a})`); gr.addColorStop(1, 'rgba(120,255,190,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 5, y, 10, h); } }
  ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
}
OPPDATER.push(oppdaterBandInngang);
TEGN_VERDEN.push(tegnBand);
TILBAKESTILL.push(() => { P.band = null; });

// ---------- himmelen over fjellet ----------
let NBG = null;
function lagNordBg() {
  const himmel = nyC(LW, LH), g = himmel.getContext('2d'), r = rng(101);
  let gr = g.createLinearGradient(0, 0, 0, LH); gr.addColorStop(0, '#01030a'); gr.addColorStop(.5, '#06122a'); gr.addColorStop(1, '#122a44'); g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  for (let i = 0; i < 380; i++) { const x = r() * LW, y = r() * LH * .7, a = (.2 + r() * .7) * (1 - y / (LH * .75)); g.fillStyle = `rgba(230,245,255,${a})`; g.fillRect(x, y, 1.4, 1.4); }
  const fjern = flislag((g, r) => {
    const top = x => 520 - 160 * Math.sin(x / LW * Math.PI * 2 * 2 + .3) - 60 * Math.sin(x / LW * Math.PI * 2 * 7 + 1) - 25 * Math.sin(x / LW * Math.PI * 2 * 13);
    const kropp = g.createLinearGradient(0, 300, 0, 760); kropp.addColorStop(0, '#34496a'); kropp.addColorStop(1, '#16243a');
    g.fillStyle = kropp; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 8) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    // snø bare på de høyeste toppene, med takkete underkant
    g.fillStyle = 'rgba(225,238,250,.55)'; g.beginPath(); g.moveTo(0, top(0)); for (let x = 0; x <= LW; x += 8) g.lineTo(x, top(x));
    for (let x = LW; x >= 0; x -= 8) { const y = top(x); g.lineTo(x, y + Math.max(0, 470 - y) * (.22 + .1 * Math.sin(x * .09)) + Math.abs(Math.sin(x * .21)) * 6); } g.closePath(); g.fill();
  }, 102);
  const midt = flislag((g, r) => {
    // stamnettmaster i rekke over fjellet, med linjer mellom
    const top = x => 680 - 50 * Math.sin(x / LW * Math.PI * 2 * 3 + 2) - 20 * Math.sin(x / LW * Math.PI * 2 * 8);
    g.fillStyle = '#0c1628'; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 6) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    g.fillStyle = 'rgba(220,235,250,.4)'; g.beginPath(); g.moveTo(0, top(0)); for (let x = 0; x <= LW; x += 6) g.lineTo(x, top(x)); for (let x = LW; x >= 0; x -= 6) g.lineTo(x, top(x) + 18 + 8 * Math.sin(x * .1)); g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) { const x = 150 + i * 400, y = top(x), h = 170;
      g.strokeStyle = '#08101e'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 30, y + 4); g.lineTo(x - 6, y - h); g.lineTo(x + 6, y - h); g.lineTo(x + 30, y + 4); g.stroke();
      g.lineWidth = 1.5; g.beginPath(); for (let k = 0; k < 7; k++) { const ya = y - h + k * h / 7; g.moveTo(x - 6 - k * 3.4, ya); g.lineTo(x + 6 + (k + 1) * 3.4, ya + h / 7); } g.stroke();
      g.lineWidth = 4; g.beginPath(); g.moveTo(x - 50, y - h + 20); g.lineTo(x + 50, y - h + 20); g.stroke();
      g.strokeStyle = 'rgba(8,16,30,.9)'; g.lineWidth = 1.4; for (const dx of [-46, 0, 46]) { g.beginPath(); g.moveTo(x + dx, y - h + 26); g.quadraticCurveTo(x + 200 + dx, y - h + 110, x + 400 + dx, top(x + 400) - h + 26); g.stroke(); } }
  }, 103);
  const naer = flislag((g, r) => {
    const top = x => 800 - 30 * Math.sin(x / LW * Math.PI * 2 * 2 + 1) - 12 * Math.sin(x / LW * Math.PI * 2 * 11);
    g.fillStyle = '#050b16'; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 10) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    g.fillStyle = 'rgba(230,240,255,.35)'; for (let x = 0; x < LW; x += 10) g.fillRect(x, top(x) - 1, 10, 3);
  }, 104);
  return { himmel, fjern, midt, naer };
}
function tegnNordBg(kx, ky) {
  if (!NBG) NBG = lagNordBg();
  const cw = cv.width, ch = cv.height, vh = cssH / skala, t = clamp((ky - NY0 * T) / Math.max(1, 60 * T - vh), 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(NBG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .03, -(LH * hk - ch) * (.2 + t * .5), LW * hk, LH * hk);
  // nordlyset på himmelen: lange gardiner som bølger sakte
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const y0 = ch * (.12 + i * .08), fx = kx * skala * dpr * .02;
    for (let x = -20; x < cw + 20; x += 6 * dpr) { const y = y0 + Math.sin((x + fx) * .004 + S.t * .3 + i * 2) * ch * .06 + Math.sin((x + fx) * .011 + S.t * .5) * ch * .02, h = ch * (.12 + .06 * Math.sin((x + fx) * .007 + S.t * .4 + i)),
      a = (.05 + .04 * Math.sin((x + fx) * .02 + S.t + i)) * (i === 1 ? .7 : 1);
      const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, i === 1 ? `rgba(170,110,255,${a})` : `rgba(110,255,170,${a})`); gr.addColorStop(1, 'rgba(110,255,170,0)'); ctx.fillStyle = gr; ctx.fillRect(x, y, 6 * dpr, h); } }
  ctx.globalCompositeOperation = 'source-over';
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch, lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lag = (bilde, p, pv) => { const y = lagY(pv); let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; for (let x = x0; x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); };
  lag(NBG.fjern, .05, .25); lag(NBG.midt, .18, .5); lag(NBG.naer, .4, .8);
}
// snøfall foran alt, bare på fjellet
const SNOFNUGG = Array.from({ length: 120 }, () => ({ x: Math.random(), y: Math.random(), z: .4 + Math.random() * .8, f: Math.random() * 6 }));
function tegnSno() {
  if (soneFor(Math.floor(P.y / T)) !== 5 || S.kval < 1) return; const cw = cv.width, ch = cv.height, n = S.kval < 2 ? 60 : SNOFNUGG.length;
  ctx.fillStyle = '#f2f8ff';
  for (let i = 0; i < n; i++) { const d = SNOFNUGG[i], sy = ((d.y * ch + S.t * (40 + d.z * 50) * dpr - cam.y * skala * dpr * d.z * .5) % ch + ch) % ch, sx = ((d.x * cw + Math.sin(S.t * .8 + d.f) * 20 * dpr - S.t * 25 * dpr * d.z - cam.x * skala * dpr * d.z * .5) % cw + cw) % cw;
    ctx.globalAlpha = .3 + d.z * .4; ctx.beginPath(); ctx.arc(sx, sy, (1 + d.z * 1.6) * dpr, 0, 7); ctx.fill(); }
  ctx.globalAlpha = 1;
}
TEGN_FORAN.push(tegnSno);

// ---------- Sentralen ----------
// Et kontrolltårn på toppen av fjellet. Den henter strøm fra tre linjer og er skjermet så lenge en av dem lyser.
// Kutt linja som lyser (slå isolatoren med pisken), og slå øyet når skjoldet faller.
const ISOLATORER = [[174, 288], [194, 288], [184, 278]];
const B9 = { aktiv: false, fase: '', introT: 0, hp: 3, t: 0, skjold: true, skjoldT: 0, linje: 0, lyn: [], laser: null, angT: 0, laserT: 0, dod: 0, banner: false };
const b9Fase = () => B9.hp >= 3 ? 1 : B9.hp === 2 ? 2 : 3;
const b9Oye = () => [ARENA9.midt * T, (ARENA9.gulv - 4.2) * T];
function lukkArena9(v) { rect(171, ARENA9.tak, 171, ARENA9.gulv - 1, v); rect(197, ARENA9.tak, 197, ARENA9.gulv - 1, v); }
function resetBoss9() { Object.assign(B9, { aktiv: false, fase: '', hp: S.boss9 ? 0 : 3, skjold: true, laser: null, dod: 0 }); B9.lyn.length = 0; if (tile(171, 296) === DOOR) lukkArena9(AIR); hud(); }
function startBoss9() {
  Object.assign(B9, { aktiv: true, fase: 'intro', introT: 2.8, hp: 3, t: 0, skjold: true, skjoldT: 0, linje: 0, laser: null, angT: 1.6, laserT: 5, banner: false });
  B9.lyn.length = 0; lukkArena9(DOOR); lyd('dor'); lyd('torden'); S.shake = .6; P.vx = 0; hud();
}
function b9Treff() {
  B9.hp--; lyd('b2treff'); S.shake = .6; S.flash = .5; S.flashF = '200,255,220'; vib(60); const [ox, oy] = b9Oye(); sprut(ox, oy, 50, 'g', 320); gnister(ox, oy, 16, 'w'); hud();
  if (B9.hp <= 0) { B9.fase = 'dod'; B9.dod = 3.2; S.slow = 1; lyd('bossdod'); B9.lyn.length = 0; B9.laser = null; return; }
  B9.skjold = true; B9.linje = 3 - B9.hp; lyd('dor'); hint(null, B9.hp === 2 ? 'Sentralen kobler inn en ny linje. Finn isolatoren som lyser!' : 'Den siste linja går over taket. Gli på nordlyset opp dit!', 4);
}
function sluttBoss9() {
  S.boss9 = true; B9.aktiv = false; B9.fase = ''; lukkArena9(AIR); S.flash = 1; S.flashF = '210,255,230'; lyd('slutt'); vib([60, 80, 160]);
  banner('Sentralen er slått av', 'For godt', 3.5); lagre(); hud(); SLUTT.t = .001; SLUTT.gx = GN.x; SLUTT.gy = GN.y;
}
function oppdaterBoss9(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2, gulvY = ARENA9.gulv * T;
  if (!B9.aktiv) { if (!S.boss9 && S.dod <= 0 && !S.overgang && pcx > 173.5 * T && pcx < 196 * T && pcy > (ARENA9.tak + 2) * T && pcy < gulvY) startBoss9(); return; }
  B9.t += dt;
  for (let i = B9.lyn.length - 1; i >= 0; i--) { const l = B9.lyn[i];
    if (l.varsel > 0) { l.varsel -= dt; if (l.varsel <= 0) { l.aktiv = .3; lyd('torden'); S.shake = Math.max(S.shake, .3); gnister(l.x, gulvY - 4, 14, 'g'); } }
    else { l.aktiv -= dt; if (S.dod <= 0 && Math.abs(l.x - pcx) < 14 + P.w / 2) skade(l.x, false); if (l.aktiv <= 0) B9.lyn.splice(i, 1); } }
  if (B9.laser) { const z = B9.laser; z.t -= dt; if (z.t <= 0) { if (z.fase === 'varsel') { z.fase = 'aktiv'; z.t = .6; lyd('golv'); } else B9.laser = null; }
    else if (z.fase === 'aktiv' && S.dod <= 0 && Math.abs(pcy - z.y) < 10 + P.h / 2 && pcx > ARENA9.x0 * T) skade(pcx + 1, false); }
  if (B9.fase === 'intro') { B9.introT -= dt;
    if (!B9.banner && B9.introT < 2) { B9.banner = true; lyd('brol2'); S.shake = .7; banner('Sentralen', 'Toppen av fjellet', 2.6); }
    if (B9.introT <= 0) { B9.fase = 'kamp'; hud(); hint(null, 'Sentralen er skjermet så lenge en linje lyser. Slå isolatoren som lyser med pisken.', 4.5); } return; }
  if (B9.fase === 'dod') { B9.dod -= dt; const [ox, oy] = b9Oye(); if (Math.random() < dt * 40) gnister(ox + (Math.random() - .5) * 120, oy - Math.random() * 200 + 60, 3, 'g'); if (B9.dod <= 0) sluttBoss9(); return; }
  const f = b9Fase(), ng = NG();
  if (B9.skjold) {
    B9.angT -= dt * ng; if (B9.angT <= 0) { B9.angT = f === 1 ? 1.6 : f === 2 ? 1.25 : 1; B9.lyn.push({ x: clamp(pcx + (Math.random() - .5) * T, (ARENA9.x0 + .5) * T, (ARENA9.x1 + .5) * T), varsel: .9 / ng, aktiv: 0, seed: (Math.random() * 1e6) | 0 }); lyd('varsel'); }
    if (f >= 2) { B9.laserT -= dt * ng; if (B9.laserT <= 0 && !B9.laser) { B9.laserT = f === 3 ? 4 : 5.5; B9.laser = { y: (ARENA9.gulv - .6) * T, fase: 'varsel', t: 1 / ng }; lyd('golvvarsel'); } }
    // pisken kutter linja som lyser
    const [ix, iy] = ISOLATORER[B9.linje], pisk = P.piskT > 0 ? piskOmraade() : null, X = (ix + .5) * T, Y = (iy + .5) * T;
    if (pisk && X > pisk.x0 - 20 && X < pisk.x1 + 20 && Y > pisk.y0 - 20 && Y < pisk.y1 + 20) { B9.skjold = false; B9.skjoldT = 4.5; B9.lyn.length = 0; B9.laser = null; lyd('bryter'); S.shake = .5; S.flash = .4; S.flashF = '200,255,220'; sprut(X, Y, 30, 'g', 260);
      hint(null, 'Linja er kuttet! Slå øyet før Sentralen kobler inn igjen.', 3); }
  } else {
    B9.skjoldT -= dt * ng; if (B9.skjoldT <= 0) { B9.skjold = true; B9.angT = 1; lyd('dor'); }
    if (S.dod <= 0) { const [ox, oy] = b9Oye(), pisk = P.piskT > 0 ? piskOmraade() : null, naer = Math.abs(pcx - ox) < 30 + P.w / 2 && Math.abs(pcy - oy) < 28 + P.h / 2;
      if ((pisk && ox > pisk.x0 - 28 && ox < pisk.x1 + 28 && oy > pisk.y0 - 28 && oy < pisk.y1 + 28) || (naer && P.dashT > 0)) b9Treff(); } }
}
function tegnBoss9() {
  const gy = ARENA9.gulv * T;
  for (const l of B9.lyn) { if (l.varsel > 0) { const a = 1 - l.varsel / .9; ctx.fillStyle = `rgba(160,255,200,${.2 + a * .5})`; ctx.beginPath(); ctx.ellipse(l.x, gy - 1, 12 + a * 6, 3, 0, 0, 7); ctx.fill(); continue; }
    ctx.strokeStyle = 'rgba(220,255,235,.95)'; ctx.lineWidth = 4; ctx.beginPath(); let x = l.x, y = (ARENA9.tak + 1) * T; ctx.moveTo(x, y);
    for (let k = 1; k <= 10; k++) { y += (gy - (ARENA9.tak + 1) * T) / 10; x = l.x + (hs(l.seed, k, 3) - .5) * 26; ctx.lineTo(x, y); } ctx.stroke(); }
  if (B9.laser) { const z = B9.laser; ctx.fillStyle = z.fase === 'varsel' ? `rgba(255,120,120,${.25 + .25 * Math.sin(S.t * 30)})` : 'rgba(255,240,240,.9)';
    ctx.fillRect(ARENA9.x0 * T, z.y - (z.fase === 'varsel' ? 1.5 : 5), (ARENA9.x1 - ARENA9.x0 + 1) * T, z.fase === 'varsel' ? 3 : 10); }
  // mastene og isolatorene
  for (let i = 0; i < 3; i++) { const [ix, iy] = ISOLATORER[i], X = (ix + .5) * T, Y = (iy + .5) * T, lyser = B9.aktiv && B9.skjold && B9.linje === i && B9.fase === 'kamp', kuttet = !B9.aktiv ? S.boss9 : i < B9.linje || (i === B9.linje && !B9.skjold);
    if (i < 2) { ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - 14, gy); ctx.lineTo(X - 3, Y + 10); ctx.lineTo(X + 3, Y + 10); ctx.lineTo(X + 14, gy); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k < 6; k++) { const ya = Y + 10 + k * (gy - Y - 10) / 6; ctx.moveTo(X - 3 - k * 2, ya); ctx.lineTo(X + 5 + k * 2, ya + (gy - Y - 10) / 6); } ctx.stroke(); }
    ctx.fillStyle = lyser ? '#d8fff0' : '#8fb0c8'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(X, Y - 6 + k * 6, 7 - k, 2.6, 0, 0, 7); ctx.fill(); }
    // linja fra isolatoren til Sentralen
    if (B9.aktiv && !kuttet) { const [ox, oy] = b9Oye(); ctx.strokeStyle = lyser ? 'rgba(180,255,220,.9)' : 'rgba(120,180,200,.5)'; ctx.lineWidth = lyser ? 2.5 : 1.5; ctx.setLineDash(lyser ? [8, 6] : []); ctx.lineDashOffset = -S.t * 60;
      ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo((X + ox) / 2, Math.max(Y, oy - 120) + 40, ox, oy - 120); ctx.stroke(); ctx.setLineDash([]); } }
  if (!B9.aktiv && !S.boss9 && !synlig(ARENA9.midt * T, gy - 150, 400)) return;
  const a = B9.fase === 'dod' ? clamp(B9.dod / 3.2, .15, 1) : 1, X = ARENA9.midt * T, top = gy - 7 * T, [ox, oy] = b9Oye();
  ctx.globalAlpha = a;
  // tårnet: et smalt kontrollhus med antenner og skjermer
  const gr = ctx.createLinearGradient(X - 70, 0, X + 70, 0); gr.addColorStop(0, '#1a2232'); gr.addColorStop(.5, '#3a4a62'); gr.addColorStop(1, '#141a28'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.moveTo(X - 80, gy); ctx.lineTo(X - 56, top); ctx.lineTo(X + 56, top); ctx.lineTo(X + 80, gy); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); rustRenner(X - 80, top, 160, gy - top, 151, 6); ctx.restore();
  ctx.strokeStyle = 'rgba(160,220,255,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const sx = X - 46 + c * 32, sy = top + 14 + r * 26, on = B9.aktiv && B9.fase !== 'dod' ? Math.sin(S.t * 3 + r * 2 + c) > -.2 : S.boss9 ? false : true;
    ctx.fillStyle = on ? (B9.skjold ? 'rgba(120,255,190,.7)' : 'rgba(255,150,120,.7)') : '#10161f'; ctx.fillRect(sx, sy, 24, 16); if (on) { ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 3; k++) ctx.fillRect(sx + 3, sy + 3 + k * 4, 6 + hs(r, c * 3 + k, 7) * 14, 1.5); } }
  ctx.strokeStyle = '#1a2230'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X - 30, top); ctx.lineTo(X - 30, top - 40); ctx.moveTo(X + 30, top); ctx.lineTo(X + 34, top - 56); ctx.stroke();
  ctx.fillStyle = Math.sin(S.t * 4) > 0 ? '#ff4a4a' : '#5a2020'; ctx.beginPath(); ctx.arc(X + 34, top - 56, 3, 0, 7); ctx.fill();
  // øyet
  ctx.fillStyle = '#0a0e14'; ctx.beginPath(); ctx.ellipse(ox, oy, 30, 18, 0, 0, 7); ctx.fill();
  const iris = B9.aktiv && B9.fase !== 'dod' ? (B9.skjold ? '#7affc0' : '#ff7a5a') : '#2a3440', lx = clamp((P.x - ox) * .05, -10, 10);
  ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(ox + lx, oy, 10, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ox + lx - 3, oy - 3, 3, 0, 7); ctx.fill();
  if (B9.aktiv && B9.skjold && B9.fase === 'kamp') { ctx.strokeStyle = `rgba(140,255,200,${.35 + .2 * Math.sin(S.t * 6)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ox, oy, 44, 30, 0, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function boss9Glod() {
  for (const l of B9.lyn) if (l.varsel <= 0) glod(SPR.g, l.x, ARENA9.gulv * T - 60, 80, .5);
  for (let i = 0; i < 3; i++) if (B9.aktiv && B9.skjold && B9.linje === i && B9.fase === 'kamp') { const [ix, iy] = ISOLATORER[i]; glod(SPR.g, (ix + .5) * T, (iy + .5) * T, 34 + 6 * Math.sin(S.t * 6), .9); }
  if (!B9.aktiv) return; const [ox, oy] = b9Oye(); glod(B9.skjold ? SPR.g : SPR.o, ox, oy, 60, .6);
}

// ---------- slutten: lyset legger seg i lykta, og verden tennes ----------
const SLUTT = { t: 0, gx: 0, gy: 0 };
let sluttKlasse = false;
function oppdaterSlutt(dt) {
  const panorama = SLUTT.t > 5; if (panorama !== sluttKlasse) { sluttKlasse = panorama; document.documentElement.classList.toggle('iSlutt', panorama); }
  if (S.boss9 && !S.ngPluss && !INTRO.aktiv && !SLUTT.t) GN.skjult = true;
  if (!SLUTT.t) return; SLUTT.t += dt; S.laas = .1; P.vx *= .9;
  if (SLUTT.t > 1.2 && SLUTT.t - dt <= 1.2) hint(null, SJEL_ORD.B9, 4.5);
  if (SLUTT.t > 4 && SLUTT.t - dt <= 4) { GN.skjult = true; S.flash = .8; S.flashF = '210,255,230'; lyd('slutt'); }
  if (SLUTT.t > 12 && S.mode === 'spill') { SLUTT.t = 0; S.mode = 'slutt'; visRulle(); }
}
function tegnSluttLys() {
  if (!SLUTT.t || SLUTT.t > 4) return; const k = clamp((SLUTT.t - 1.5) / 2.5, 0, 1), e = k * k * (3 - 2 * k), lx = P.x + P.w / 2 + P.face * 8, ly = P.y + 2;
  GN.skjult = true; const x = SLUTT.gx + (lx - SLUTT.gx) * e, y = SLUTT.gy + (ly - SLUTT.gy) * e - Math.sin(e * Math.PI) * 60;
  glod(SPR.c, x, y, 40 + (1 - e) * 10, 1); glod(SPR.h, x, y, 10, 1);
}
// panoramaet fra fjellet: byene i dalen tennes én etter én
function tegnPanorama() {
  if (!SLUTT.t || SLUTT.t < 5) return; const cw = cv.width, ch = cv.height, a = clamp((SLUTT.t - 5) / 1.2, 0, 1), lys = clamp((SLUTT.t - 7) / 1.2, 0, 1);
  ctx.globalAlpha = a; if (!NBG) NBG = lagNordBg(); ctx.drawImage(NBG.himmel, 0, 0, cw, ch);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) for (let x = 0; x < cw; x += 8 * dpr) { const y = ch * (.08 + i * .07) + Math.sin(x * .004 + S.t * .3 + i * 2) * ch * .05, h = ch * .16, al = (.07 + .05 * Math.sin(x * .02 + S.t + i)) * a;
    const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, i === 1 ? `rgba(170,110,255,${al})` : `rgba(110,255,170,${al})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(x, y, 8 * dpr, h); }
  ctx.globalCompositeOperation = 'source-over';
  // fjellsidene rammer inn dalen, med snø på toppene
  for (const [farge, sno, h0, amp, fr] of [['#1c2c46', 'rgba(220,235,250,.5)', .42, .1, 11], ['#0e1a2e', 'rgba(220,235,250,.3)', .5, .06, 23]]) {
    const kant = x => { const u = x / cw; return ch * (h0 + .28 * (1 - Math.min(1, Math.abs(u - .5) * 2.4))) - Math.sin(u * fr) * ch * amp * .4; };
    ctx.fillStyle = farge; ctx.beginPath(); ctx.moveTo(0, ch); for (let x = 0; x <= cw; x += 10) ctx.lineTo(x, kant(x)); ctx.lineTo(cw, ch); ctx.fill();
    ctx.fillStyle = sno; ctx.beginPath(); for (let x = 0; x <= cw; x += 10) ctx.lineTo(x, kant(x)); for (let x = cw; x >= 0; x -= 10) ctx.lineTo(x, kant(x) + Math.max(0, ch * .62 - kant(x)) * .12); ctx.closePath(); ctx.fill(); }
  // dalbunnen får et varmt skjær når lyset kommer
  const gy0 = ch * .62, gr = ctx.createLinearGradient(0, gy0, 0, ch); gr.addColorStop(0, '#08101e'); gr.addColorStop(1, '#03060c'); ctx.fillStyle = gr; ctx.fillRect(0, gy0, cw, ch - gy0);
  ctx.globalCompositeOperation = 'lighter';
  const dis = ctx.createLinearGradient(0, gy0 - ch * .08, 0, ch); dis.addColorStop(0, 'rgba(255,190,110,0)'); dis.addColorStop(.3, `rgba(255,190,110,${.22 * lys * a})`); dis.addColorStop(1, 'rgba(255,190,110,0)'); ctx.fillStyle = dis; ctx.fillRect(0, gy0 - ch * .08, cw, ch);
  // lysene i dalen: alt tennes nesten samtidig, med en liten forsinkelse ut mot kantene
  for (let i = 0; i < 340; i++) { const u = hs(i, 1, 951), v = hs(i, 2, 952), x = cw * (.04 + u * .92), y = gy0 + ch * (.02 + v * v * .3), d = Math.abs(u - .5) * .5;
    if (lys - d < 0) continue; const b = Math.min(1, (lys - d) * 5) * a * (.7 + .3 * Math.sin(S.t * 3 + i)); glod(hs(i, 3, 953) < .75 ? SPR.w : SPR.h, x, y, (5 + hs(i, 4, 954) * 9 + v * 6) * dpr, b); }
  ctx.globalCompositeOperation = 'source-over';
  // montøren på kanten, med lyset i lykta
  const mx = cw * .5, my = ch * .78; ctx.fillStyle = '#02050a'; ctx.beginPath(); ctx.moveTo(mx - 160 * dpr, ch); ctx.lineTo(mx - 60 * dpr, my); ctx.lineTo(mx + 80 * dpr, my + 6 * dpr); ctx.lineTo(mx + 200 * dpr, ch); ctx.fill();
  ctx.fillRect(mx - 5 * dpr, my - 30 * dpr, 10 * dpr, 30 * dpr); ctx.beginPath(); ctx.arc(mx, my - 36 * dpr, 7 * dpr, 0, 7); ctx.fill();
  glod(SPR.c, mx + 6 * dpr, my - 38 * dpr, 30 * dpr, a); glod(SPR.h, mx + 6 * dpr, my - 38 * dpr, 6 * dpr, a);
  ctx.globalAlpha = 1;
}

// ---------- ny runde+ ----------
function startNyRunde() {
  lydInit(); nyttSpill(null); S.ngPluss = true; for (const k of EVNER) if (k !== 'hemmelig') S.ev[k] = true; INTRO.tatt = true; ANIM.drakt = 'montor'; GN.skjult = false;
  P.max = maksLiv(); P.hp = P.max; S.mode = 'spill'; sist = performance.now(); visLag(null); hud(); lagre();
  banner('Ny runde+', 'Alle evner, men fiendene tåler mer', 3); setTimeout(() => sjekkMaal(true), 1500);
}

// ---------- registrering ----------
BOSSER.push({ navn: 'Sentralen', aktiv: () => B9.aktiv, hp: () => B9.hp, maks: 3, kamp: () => B9.fase === 'kamp' || B9.fase === 'dod' });
OPPDATER.push(dt => {
  oppdaterBoss9(dt); oppdaterSlutt(dt);
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (inneNord(tx, ty) && !S.boss9) hint('bryterhus', '«Det var jeg som slo av. Hele nettet, på en gang. Ellers hadde Sentralen tatt alt.»', 5);
  if (S.ev.lynglid && tx >= 96 && tx <= 101 && ty >= 296 && ty <= 304) hint('juv', 'Hopp opp i nordlyset over juvet.', 3.5);
});
TILBAKESTILL.push(() => { if (B9.aktiv && !S.boss9) resetBoss9(); else { B9.lyn.length = 0; B9.laser = null; } });
TEGN_VERDEN.push(tegnBoss9, tegnSluttLys);
TEGN_GLOD.push(boss9Glod, () => { if (S.boss9 && !S.ngPluss && !SLUTT.t) glod(SPR.c, P.x + P.w / 2 + P.face * 8, P.y + 2, 30, .8); });
TEGN_FORAN.push(tegnPanorama);
LYSKILDER.push(L => {
  if (B9.aktiv || (S.boss9 === false && synlig(ARENA9.midt * T, (ARENA9.gulv - 4) * T, 300))) { const [ox, oy] = b9Oye(); L(ox, oy, 320, .9); }
  for (const l of B9.lyn) if (l.varsel <= 0) L(l.x, ARENA9.gulv * T - 80, 200, .8);
  for (const r of BAND) { rorMaal(r); const [mx, my] = rorPunkt(r, r.len / 2); if (synlig(mx, my, 300)) for (let s = 0; s <= r.len; s += 60) { const [x, y] = rorPunkt(r, s); L(x, y, 110, .5); } }
});
