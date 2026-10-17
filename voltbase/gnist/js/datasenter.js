'use strict';
// Gnist – område 8: Datasenteret. Sentralens nedgravde serverhall bak kraftverket. Kalde ganger, blinkende rack,
// et kjøletårn med oppvind, fiberrør som lyset kan bære deg gjennom, og Kjølekjempen i kontrollrommet.
const XY0 = 200;   // øverste rad i sonen
SONER.push({ id: 'data', navn: 'Datasenteret', y0: XY0, y1: 259 });

// ---------- terrenget ----------
OMRAADER.push({ navn: 'Datasenteret', kart: [
  [3, 214, 3, 217, AIR],                                   // nisjen med porten tilbake til kraftverket
  [4, 206, 30, 217, AIR], [12, 213, 16, 213, ONE],         // slusa
  [31, 204, 92, 217, AIR],                                 // serverhallen
  [36, 213, 43, 213, ONE], [50, 210, 57, 210, ONE], [64, 213, 71, 213, ONE], [78, 209, 86, 209, ONE],
  [47, 217, 48, 217, HAZ], [69, 217, 70, 217, HAZ],
  [94, 200, 108, 240, AIR],                                // kjøletårnet
  [94, 232, 97, 232, ONE], [105, 226, 108, 226, ONE], [94, 219, 97, 219, ONE], [105, 212, 108, 212, ONE], [94, 205, 97, 205, ONE],
  [109, 200, 125, 205, AIR],                               // toppen av tårnet
  [109, 234, 160, 240, AIR],                               // kabelkulverten
  [118, 240, 119, 240, HAZ], [140, 240, 141, 240, HAZ], [128, 237, 132, 237, ONE], [146, 237, 150, 237, ONE],
  [124, 222, 150, 231, AIR], [130, 228, 134, 228, ONE], [140, 228, 144, 228, ONE],   // minibossrommet
  [161, 226, 197, 240, AIR],                               // kontrollrommet (bossen)
  [174, 231, 184, 231, ONE], [165, 235, 168, 235, ONE], [190, 235, 193, 235, ONE],
] });
const ARENA8 = { x0: 162, x1: 196, gulv: 241, midt: 179.5, tak: 226 };

// ---------- porter, rør og funn ----------
PORTER.push({ x: 11, y0: 57, y1: 60, til: [6, 217], krav: () => S.boss7, stengt: 'En tung ståldør. Noe på den andre siden trekker strøm.' },
  { x: 3, y0: 214, y1: 217, til: [13, 60], krav: () => true });
ROR.push({ pkt: [[91, 217], [92, 218], [92, 240], [94, 240]] },                       // serverhallen ned til foten av kjøletårnet
  { pkt: [[126, 234], [126, 231]], krav: () => !MR.rom },                             // kulverten opp til minibossrommet
  { pkt: [[162, 237], [162, 227], [176, 227], [176, 228]], krav: () => !B8.aktiv || B8.fase === 'kamp' },
  { pkt: [[196, 237], [196, 227], [183, 227], [183, 228]], krav: () => !B8.aktiv || B8.fase === 'kamp' },
  { pkt: [[4, 179], [2, 179], [2, 191], [20, 191]] });                               // Sumpen: fra veggen ved porten ned til et gjemmested
IKON.fiber = '<svg viewBox="0 0 24 24"><path d="M2 14c4-6 8 2 12-4s6-6 8-6v3c-2 0-3 1-6 5s-9 4-11 5zM2 18h4v4H2zM18 2h4v4h-4z"/></svg>';
FUNN.push({ id: 'fiber', x: 89, y: 216, navn: 'Fiberløp', tekst: 'En fiberkobling fra Sentralens eget nett. Med den kan lyset bære deg gjennom kabelrørene.',
  pc: 'Gå inn i munningen på et blått rør', mob: 'Gå inn i munningen på et blått rør' },
  { id: 'liv9', x: 179, y: 240, boss8: true, navn: 'Livsgnist', liten: true });

// ---------- sjekkpunkt, fagkort, lysorber og fiender ----------
VERKSTED.push(SJEKK.length);
SJEKK.push({ x: 8, y: 217 }, { x: 59, y: 217 }, { x: 100, y: 240 }, { x: 155, y: 240 });
FAG.push(
  { x: 20, y: 216, spor: true, tittel: 'Spor: arbeidslogg', tekst: '«Sentralen trekker mer for hver uke. Den kobler inn nye linjer selv og svarer ikke når vi prøver å stoppe den. Stormene i byene kommer av overbelastningen.»' },
  { x: 74, y: 216, tittel: 'Kjøling av elektronikk', tekst: 'Servere og omformere blir varme. Uten god kjøling og lufting blir de overopphetet, og isolasjonen eldes raskere.' },
  { x: 120, y: 204, spor: true, tittel: 'Spor: et bilde', tekst: 'Et falmet bilde av en elektriker med en lykt i hånden, foran kraftverket. På baksiden står det: «Hvis noen finner dette: ikke slå på Sentralen igjen.»' },
  { x: 113, y: 204, tittel: 'Selektivitet', tekst: 'Vernene i et anlegg skal samarbeide, slik at bare vernet nærmest feilen løser ut. Da blir resten av anlegget stående med strøm.' },
  { x: 152, y: 239, tittel: 'Nødstrøm (UPS)', tekst: 'Et UPS-anlegg holder viktige laster i gang med batterier når strømmen går, til et aggregat starter eller anlegget kan slås av på en trygg måte.' },
  { x: 148, y: 230, tittel: 'Overspenningsvern', tekst: 'Overspenningsvern leder lynoverspenninger og koblingstopper til jord før de når utstyret.' });
ORBER.push([14, 211], [24, 215], [39, 211], [46, 214], [53, 208], [60, 214], [67, 211], [75, 214], [82, 207], [88, 212],
  [96, 230], [106, 224], [96, 217], [106, 210], [96, 203], [101, 236], [111, 203], [117, 202], [123, 203],
  [114, 238], [123, 238], [130, 235], [137, 238], [148, 235], [157, 238], [131, 226], [142, 226]);
FIENDE_DEF.push({ type: 'orm', x: 41, y: 217 }, { type: 'orm', x: 62, y: 217 }, { type: 'drone', x0: 45, x1: 76, y: 207 }, { type: 'skjold', x0: 76, x1: 87, y: 217 },
  { type: 'jager', x: 101, y: 222 }, { type: 'sveve', x: 101, y: 210, ax: 3, ay: 2 }, { type: 'skytter', x: 124, y: 205 },
  { type: 'orm', x: 115, y: 240 }, { type: 'orm', x: 135, y: 240 }, { type: 'orm', x: 151, y: 240 }, { type: 'drone', x0: 112, x1: 158, y: 236 });
MINIROM.push({ id: 'minidata', navn: 'Lagerhallen', x0: 124, x1: 150, y0: 222, y1: 231, dorer: [],
  bolger: [[{ type: 'skjold', x0: 128, x1: 146, y: 231 }, { type: 'jager', x: 130, y: 225 }],
    [{ type: 'drone', x0: 126, x1: 148, y: 224 }, { type: 'orm', x: 136, y: 231 }, { type: 'jager', x: 146, y: 225 }],
    [{ type: 'skjold', x0: 126, x1: 148, y: 231 }, { type: 'skytter', x: 148, y: 231 }, { type: 'drone', x0: 126, x1: 148, y: 223 }]] });

// ---------- nye fiender ----------
// kjøledrone: patruljerer under taket og slipper isnåler rett ned når montøren er under den
// kabelorm: ligger skjult i gulvet og skyter opp når montøren kommer nær
FIENDE_TYPER.drone = {
  ny: f => ({ type: 'drone', x: (f.x0 + f.x1) / 2 * T, y: f.y * T + 4, w: 26, h: 16, x0: f.x0 * T, x1: (f.x1 + 1) * T, dir: 1, liv: true, t: Math.random() * 6, lad: 0, pause: 1 }),
  oppdater(e, dt, pcx, pcy) {
    const cx = e.x + e.w / 2, under = Math.abs(pcx - cx) < T * .9 && pcy > e.y && pcy - e.y < 9 * T;
    if (e.lad > 0 || (under && e.pause <= 0)) { if (e.lad === 0) lyd('relelad'); e.lad += dt * NG();
      if (e.lad > .45) { e.lad = 0; e.pause = 1.4 / NG(); lyd('releskudd'); bolter.push({ x: cx, y: e.y + e.h, vx: 0, vy: 300 * NG(), liv: 4, f: 'c' }); } }
    else { e.pause -= dt; e.x += e.dir * 70 * NG() * dt; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x + e.w > e.x1) { e.x = e.x1 - e.w; e.dir = -1; } }
  },
  tegn(e) {
    const X = e.x + e.w / 2, Y = e.y + e.h / 2 + Math.sin(e.t * 3) * 2, v = e.varsel || 0;
    ctx.save(); ctx.translate(X, Y);
    // to små vifter
    for (const s of [-1, 1]) { ctx.fillStyle = '#1a2230'; ctx.fillRect(s * 11 - 1, -7, 2, 5); ctx.strokeStyle = 'rgba(190,220,255,.5)'; ctx.lineWidth = 1.4; const a = e.t * 40;
      ctx.beginPath(); ctx.moveTo(s * 11 - Math.cos(a) * 7, -8 - Math.sin(a) * 1.2); ctx.lineTo(s * 11 + Math.cos(a) * 7, -8 + Math.sin(a) * 1.2); ctx.stroke(); }
    const gr = ctx.createLinearGradient(0, -6, 0, 7); gr.addColorStop(0, '#6a7a90'); gr.addColorStop(1, '#2a3444'); ctx.fillStyle = gr; rr(ctx, -13, -5, 26, 11, 4); ctx.fill();
    ctx.save(); ctx.clip(); rustFlekker(-13, -5, 26, 11, 121, 2, .4); ctx.fillStyle = 'rgba(220,240,255,.5)'; ctx.fillRect(-11, -4, 22, 1.4); ctx.restore();
    ctx.strokeStyle = 'rgba(170,220,255,.8)'; ctx.lineWidth = 1; rr(ctx, -13, -5, 26, 11, 4); ctx.stroke(); nagler([[-9, 1], [9, 1]], .7);
    // isdysa under
    ctx.fillStyle = '#c8ecff'; ctx.beginPath(); ctx.moveTo(-3, 6); ctx.lineTo(3, 6); ctx.lineTo(0, 10 + e.lad * 8); ctx.fill();
    ctx.fillStyle = e.lad > 0 && Math.sin(S.t * 30) > 0 ? '#fff' : v > .5 ? '#ff5a3c' : '#8fe3ff'; ctx.beginPath(); ctx.arc(0, 0, 2.4, 0, 7); ctx.fill();
    ctx.restore();
  },
  glod(e) { glod(SPR.c, e.x + e.w / 2, e.y + e.h, 14 + e.lad * 30, .4 + e.lad); }
};
FIENDE_TYPER.orm = {
  ny: f => ({ type: 'orm', bx: f.x * T + T / 2, gulv: (f.y + 1) * T, x: f.x * T + 5, y: (f.y + 1) * T + 6, w: 22, h: 4, dir: 1, liv: true, t: Math.random() * 6, fase: 'skjult', fT: 0, opp: 0 }),
  oppdater(e, dt, pcx, pcy) {
    const naer = Math.abs(pcx - e.bx) < 3.2 * T && Math.abs(pcy - e.gulv) < 3 * T; e.fT -= dt * NG(); e.dir = pcx < e.bx ? -1 : 1;
    if (e.fase === 'skjult' && naer && e.fT <= 0) { e.fase = 'varsel'; e.fT = .55; lyd('golvvarsel'); }
    else if (e.fase === 'varsel' && e.fT <= 0) { e.fase = 'oppe'; e.fT = 1.3; lyd('bue'); stov(e.bx, e.gulv, 6, .8); }
    else if (e.fase === 'oppe' && e.fT <= 0) { e.fase = 'skjult'; e.fT = 1.4; }
    e.opp = mot(e.opp, e.fase === 'oppe' ? 1 : 0, dt * (e.fase === 'oppe' ? 9 : 3));
    const h = 4 + e.opp * 40; e.h = h; e.y = e.opp > .05 ? e.gulv - h : e.gulv + 6;
  },
  tegn(e) {
    const X = e.bx, G = e.gulv;
    if (e.fase === 'varsel' || e.opp < .05) { if (e.fase === 'varsel') { ctx.fillStyle = 'rgba(255,220,120,.6)'; ctx.beginPath(); ctx.ellipse(X, G - 1, 12, 2.5, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#1a1e26'; ctx.fillRect(X - 9, G - 2, 18, 2); return; }
    const h = e.opp * 40, sv = Math.sin(e.t * 6) * 4 * e.opp; ctx.lineCap = 'round';
    ctx.strokeStyle = '#121418'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(X, G + 2); ctx.quadraticCurveTo(X - sv, G - h * .5, X + sv * .5, G - h); ctx.stroke();
    ctx.strokeStyle = '#3a3f4a'; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#c98a3a'; ctx.lineWidth = 1.4; ctx.stroke();
    // hodet: en avrevet kabelende med kobbertråder som gnistrer
    const hx = X + sv * .5, hy = G - h; ctx.fillStyle = '#20242c'; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#e8a050'; ctx.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(hx + k * 1.5, hy - 4); ctx.lineTo(hx + k * 3, hy - 9 - Math.abs(Math.sin(e.t * 20 + k)) * 3); ctx.stroke(); }
    ctx.fillStyle = (e.varsel || 0) > .5 ? '#ff5a3c' : '#ffe36b'; ctx.beginPath(); ctx.arc(hx + e.dir * 2.5, hy, 1.8, 0, 7); ctx.fill(); ctx.lineCap = 'butt';
  },
  glod(e) { if (e.opp > .05) glod(SPR.o, e.bx, e.gulv - e.opp * 40 - 8, 16, .7 * e.opp); else if (e.fase === 'varsel') glod(SPR.o, e.bx, e.gulv - 2, 18, .6); }
};

// ---------- serverhallen bak ----------
let XBG = null;
function lagDataBg() {
  const himmel = nyC(LW, LH), g = himmel.getContext('2d'), r = rng(91);
  let gr = g.createLinearGradient(0, 0, 0, LH); gr.addColorStop(0, '#02040a'); gr.addColorStop(.5, '#06101e'); gr.addColorStop(1, '#0b1a2c'); g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  // takbjelker og kabelbaner langt inne i fjellet
  for (let y = 60; y < LH * .5; y += 90) { g.fillStyle = 'rgba(40,60,90,.35)'; g.fillRect(0, y, LW, 6); for (let x = 0; x < LW; x += 120) g.fillRect(x, y, 4, 40); }
  const rack = (g, r, x, y, w, h, mork, ledA) => {
    g.fillStyle = mork; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, y, w, 3);
    for (let yy = y + 8; yy < y + h - 6; yy += 9) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 3, yy + 6, w - 6, 1.5);
      for (let k = 0; k < 3; k++) if (r() < .55) { g.fillStyle = r() < .8 ? `rgba(120,220,255,${ledA})` : r() < .5 ? `rgba(120,255,160,${ledA})` : `rgba(255,120,90,${ledA})`; g.fillRect(x + 5 + k * 4, yy + 2, 2, 2); } } };
  const fjern = flislag((g, r) => {
    const bunn = 640; for (let x = 0; x < LW; x += 46) rack(g, r, x, bunn - 220, 40, 220, '#0a1424', .45);
    gr = g.createLinearGradient(0, bunn - 260, 0, bunn); gr.addColorStop(0, 'rgba(6,16,30,.6)'); gr.addColorStop(1, 'rgba(6,16,30,0)'); g.fillStyle = gr; g.fillRect(0, bunn - 260, LW, 260);
    g.fillStyle = '#070d18'; g.fillRect(0, bunn, LW, LH - bunn);
  }, 92);
  const midt = flislag((g, r) => {
    const bunn = 760; for (let x = 10; x < LW; x += 140) { rack(g, r, x, bunn - 330, 60, 330, '#081020', .8); rack(g, r, x + 62, bunn - 330, 60, 330, '#091224', .8); }
    g.strokeStyle = '#060c16'; g.lineWidth = 5; for (let x = 0; x < LW; x += 70) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 30, 260, x + 10, bunn - 330); g.stroke(); }
    g.fillStyle = '#050a14'; g.fillRect(0, bunn, LW, LH - bunn);
  }, 93);
  const naer = flislag((g, r) => {
    // kjølerør og kabelbunter i forgrunnen
    const bunn = 840; g.fillStyle = '#03070e'; g.fillRect(0, bunn, LW, LH - bunn);
    for (let x = 80; x < LW; x += 300 + r() * 200) { g.fillStyle = '#04080f'; g.fillRect(x, 0, 22, LH); g.fillStyle = 'rgba(150,200,255,.07)'; g.fillRect(x + 3, 0, 3, LH);
      for (let y = 40; y < LH; y += 120) { g.fillStyle = '#0a1220'; g.fillRect(x - 4, y, 30, 8); } }
  }, 94);
  return { himmel, fjern, midt, naer };
}
function tegnDataBg(kx, ky) {
  if (!XBG) XBG = lagDataBg();
  const cw = cv.width, ch = cv.height, vh = cssH / skala, t = clamp((ky - XY0 * T) / Math.max(1, 60 * T - vh), 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(XBG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .03, -(LH * hk - ch) * (.2 + t * .5), LW * hk, LH * hk);
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch, lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lagX0 = p => { let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; return x0; };
  const lag = (bilde, p, pv) => { const y = lagY(pv); for (let x = lagX0(p); x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); };
  lag(XBG.fjern, .08, .3); lag(XBG.midt, .22, .5);
  // lysdioder som blinker i rackene nærmest
  ctx.globalCompositeOperation = 'lighter';
  { const y0 = lagY(.5); for (let x = lagX0(.22); x < cw + lw; x += lw) for (let i = 0; i < 40; i++) { const rx = hs(i, 3, 901), ry = hs(i, 4, 902), b = Math.sin(S.t * (2 + hs(i, 5, 903) * 6) + i) > .3;
    if (b) glod(i % 5 ? SPR.c : SPR.g, x + (10 + rx * (LW - 20)) * k, y0 + (440 + ry * 300) * k, 5 * k, .8); } }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  lag(XBG.naer, .45, .8);
  // kald luft som siger langs gulvet
  for (let i = 0; i < 2; i++) { const w = cw * 1.2, x = ((S.t * (8 + i * 5) * dpr - kx * skala * dpr * (.6 + i * .1) + i * w * .5) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .08; ctx.drawImage(TAKE, x, ch * (.72 + i * .1), w, w * .25); }
  ctx.globalAlpha = 1;
}

// ---------- kjøletårnet: viftene blåser deg opp når du glir ----------
OPPVIND.push({ x0: 97, x1: 105, y0: 201, y1: 239 });
function tegnTarnVifter() {
  if (!synlig(101 * T, 240 * T, 400)) return;
  for (const x of [98.5, 103.5]) { const X = x * T, Y = 240.6 * T; ctx.fillStyle = '#121822'; ctx.fillRect(X - 70, Y - 6, 140, 12);
    ctx.save(); ctx.translate(X, Y); ctx.scale(1, .25); ctx.strokeStyle = 'rgba(170,210,255,.6)'; ctx.lineWidth = 6; for (let k = 0; k < 4; k++) { const a = S.t * 14 + k * 1.57; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); ctx.stroke(); } ctx.restore(); }
}

// ---------- Kjølekjempen ----------
// Et kjøleanlegg på størrelse med et hus. Det fryser gulvet til is og slipper istapper fra taket,
// tiner så hallen med damp, og blir til slutt så varmt at kjernen på toppen åpner seg.
const B8 = { aktiv: false, fase: '', introT: 0, hp: 3, t: 0, x: 0, syklus: '', sT: 0, angT: 0, skuddT: 0, dod: 0, is: [], damp: [], banner: false, vx: 1 };
const b8Fase = () => B8.hp >= 3 ? 1 : B8.hp === 2 ? 2 : 3;
const B8_B = 3 * T, B8_H = 4 * T;   // halv bredde og høyde
const b8Kjerne = () => [B8.x, ARENA8.gulv * T - B8_H - 8];
function lukkArena8(v) { rect(161, ARENA8.tak, 161, ARENA8.gulv - 1, v); rect(197, ARENA8.tak, 197, ARENA8.gulv - 1, v); }
function resetBoss8() { Object.assign(B8, { aktiv: false, fase: '', hp: S.boss8 ? 0 : 3, syklus: '', dod: 0 }); B8.is.length = 0; B8.damp.length = 0; if (tile(161, 238) === DOOR) lukkArena8(AIR); hud(); }
function startBoss8() {
  Object.assign(B8, { aktiv: true, fase: 'intro', introT: 2.4, hp: 3, t: 0, x: ARENA8.midt * T, syklus: 'frys', sT: 6.5, angT: 1.6, skuddT: 2.2, banner: false, vx: 1 });
  B8.is.length = 0; B8.damp.length = 0; lukkArena8(DOOR); lyd('dor'); S.shake = .5; P.vx = 0; hud();
}
function b8Treff() {
  B8.hp--; lyd('b2treff'); S.shake = .5; S.flash = .45; S.flashF = '200,235,255'; vib(50); const [kx, ky] = b8Kjerne(); sprut(kx, ky, 40, 'c', 300); gnister(kx, ky, 16, 'w'); hud();
  if (B8.hp <= 0) { B8.fase = 'dod'; B8.dod = 2.6; S.slow = .9; lyd('bossdod'); B8.is.length = 0; B8.damp.length = 0; return; }
  B8.syklus = 'frys'; B8.sT = b8Fase() === 3 ? 6 : 6.5; B8.angT = 1.4; lyd('sluse'); if (B8.hp === 2) hint(null, 'Kjempen skyter iskuler nå. Slå dem bort med pisken!', 3.5);
}
function sluttBoss8() {
  S.boss8 = true; B8.aktiv = false; B8.fase = ''; lukkArena8(AIR); S.flash = 1; S.flashF = '220,240,255'; const [kx, ky] = b8Kjerne(); sprut(kx, ky, 100, 'c', 420); ring(kx, ky, 30, 'h', 380); lyd('slutt'); vib([40, 60, 120]);
  banner('Kontrollrommet er stille', 'Kjølekjempen er slått', 3.5); sjelSier('B8'); lagre(); hud(); sjekkMaal(true);
}
function oppdaterBoss8(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2, gulvY = ARENA8.gulv * T;
  if (!B8.aktiv) { if (!S.boss8 && S.dod <= 0 && !S.overgang && !P.ror && pcx > 163.5 * T && pcx < 196 * T && pcy > (ARENA8.tak + 1) * T && pcy < gulvY) startBoss8(); return; }
  B8.t += dt;
  // istapper: rister i taket, faller og knuses
  for (let i = B8.is.length - 1; i >= 0; i--) { const s = B8.is[i];
    if (s.varsel > 0) { s.varsel -= dt; continue; }
    s.vy += 2200 * dt; s.y += s.vy * dt;
    if (S.dod <= 0 && Math.abs(s.x - pcx) < 9 + P.w / 2 && s.y > P.y && s.y - 26 < P.y + P.h) skade(s.x, false);
    if (s.y >= gulvY) { gnister(s.x, gulvY - 4, 10, 'c'); sprut(s.x, gulvY - 6, 8, 'h', 160); lyd('prell'); B8.is.splice(i, 1); } }
  // damp som skyter opp av ristene i gulvet
  for (let i = B8.damp.length - 1; i >= 0; i--) { const d = B8.damp[i];
    if (d.varsel > 0) { d.varsel -= dt; if (d.varsel <= 0) { d.aktiv = .9; lyd('sluse'); } continue; }
    d.aktiv -= dt; if (Math.random() < dt * 40) part(d.x + (Math.random() - .5) * 20, gulvY, (Math.random() - .5) * 40, -300 - Math.random() * 200, .5, 10, 'h', -50);
    if (S.dod <= 0 && Math.abs(d.x - pcx) < 14 + P.w / 2 && P.y + P.h > gulvY - 4 * T) skade(d.x, false); if (d.aktiv <= 0) B8.damp.splice(i, 1); }
  if (B8.fase === 'intro') { B8.introT -= dt;
    if (!B8.banner && B8.introT < 1.8) { B8.banner = true; lyd('brol2'); S.shake = .6; banner('Kjølekjempen', 'Kontrollrommet', 2.4); }
    if (B8.introT <= 0) { B8.fase = 'kamp'; hud(); hint(null, 'Gulvet blir glatt når kjempen fryser. Vent til kjernen på toppen gløder, og slå den.', 4.5); } return; }
  if (B8.fase === 'dod') { B8.dod -= dt; const [kx, ky] = b8Kjerne(); if (Math.random() < dt * 30) gnister(kx + (Math.random() - .5) * 120, ky + Math.random() * 100, 3, 'c'); if (B8.dod <= 0) sluttBoss8(); return; }
  const f = b8Fase(), ng = NG(); B8.sT -= dt * ng;
  if (B8.syklus !== 'over') { B8.x += B8.vx * 34 * ng * dt; if (B8.x < (ARENA8.midt - 5) * T) B8.vx = 1; if (B8.x > (ARENA8.midt + 5) * T) B8.vx = -1; }
  if (B8.syklus === 'frys') {
    B8.angT -= dt * ng; if (B8.angT <= 0) { B8.angT = f === 1 ? 1.1 : f === 2 ? .9 : .7; const ny = x => B8.is.push({ x: clamp(x, (ARENA8.x0 + .5) * T, (ARENA8.x1 + .5) * T), y: (ARENA8.tak + 1) * T, vy: 0, varsel: .8 / ng });
      ny(pcx + (Math.random() - .5) * T); if (f === 3) ny(ARENA8.x0 * T + Math.random() * (ARENA8.x1 - ARENA8.x0) * T); lyd('varsel'); }
    if (Math.random() < dt * 12) part(ARENA8.x0 * T + Math.random() * (ARENA8.x1 - ARENA8.x0) * T, gulvY - 3, 0, -20, .8, 3, 'h', 0);
    if (B8.sT <= 0) { B8.syklus = 'tin'; B8.sT = 4.5; B8.angT = .8; lyd('sluse'); } }
  else if (B8.syklus === 'tin') {
    B8.angT -= dt * ng; if (B8.angT <= 0) { B8.angT = f === 1 ? 1 : f === 2 ? .8 : .6; B8.damp.push({ x: clamp(pcx + (Math.random() - .5) * T, (ARENA8.x0 + .5) * T, (ARENA8.x1 + .5) * T), varsel: .8 / ng, aktiv: 0 }); lyd('golvvarsel'); }
    if (B8.sT <= 0) { B8.syklus = 'over'; B8.sT = 3.4; lyd('utmattet'); } }
  else if (B8.syklus === 'over') { const [kx, ky] = b8Kjerne(); if (Math.random() < dt * 20) part(kx + (Math.random() - .5) * 40, ky, (Math.random() - .5) * 60, -120, .6, 8, 'o', -40);
    if (B8.sT <= 0) { B8.syklus = 'frys'; B8.sT = f === 3 ? 6 : 6.5; B8.angT = 1.2; } }
  if (f >= 2 && B8.syklus !== 'over') { B8.skuddT -= dt * ng; if (B8.skuddT <= 0) { B8.skuddT = f === 3 ? 1.7 : 2.4; const sx = B8.x + (pcx < B8.x ? -B8_B : B8_B), sy = gulvY - B8_H * .6, a = Math.atan2(pcy - sy, pcx - sx), s = 230 * ng;
    bolter.push({ x: sx, y: sy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, liv: 4, f: 'c' }); lyd('releskudd'); sprut(sx, sy, 8, 'c', 120); } }
  if (S.dod > 0 || P.ror) return;
  const iKropp = Math.abs(pcx - B8.x) < B8_B + P.w / 2 - 4 && P.y + P.h > gulvY - B8_H + 6;
  const [kx, ky] = b8Kjerne(), vedKjerne = Math.abs(pcx - kx) < 30 + P.w / 2 && Math.abs(pcy - ky) < 26 + P.h / 2;
  if (B8.syklus === 'over') {
    const pisk = P.piskT > 0 ? piskOmraade() : null, piskTraff = pisk && kx > pisk.x0 - 30 && kx < pisk.x1 + 30 && ky > pisk.y0 - 26 && ky < pisk.y1 + 26, trakk = vedKjerne && P.vy > 0 && P.y + P.h < ky + 6;
    if (piskTraff || (vedKjerne && P.dashT > 0) || trakk) { if (trakk) { P.vy = -520; P.air = S.ev.dobbel ? 1 : 0; } b8Treff(); }
  } else if (iKropp || vedKjerne) skade(B8.x, false);
}
function tegnBoss8() {
  const gy = ARENA8.gulv * T;
  if (B8.aktiv && B8.syklus === 'frys' && B8.fase === 'kamp') { ctx.fillStyle = 'rgba(200,235,255,.35)'; ctx.fillRect(ARENA8.x0 * T, gy - 2, (ARENA8.x1 - ARENA8.x0 + 1) * T, 5);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let x = ARENA8.x0; x <= ARENA8.x1; x += 2) ctx.fillRect(x * T + hs(x, 1, 811) * 20, gy - 1, 8, 1.2); }
  for (const s of B8.is) { const sx = s.x + (s.varsel > 0 ? Math.sin(S.t * 50) * 1.5 : 0);
    if (s.varsel > 0) { const a = 1 - s.varsel / .8; ctx.fillStyle = `rgba(0,0,0,${.15 + a * .35})`; ctx.beginPath(); ctx.ellipse(s.x, gy - 1, 6 + a * 8, 2, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#d8f2ff'; ctx.beginPath(); ctx.moveTo(sx - 7, s.y - 26); ctx.lineTo(sx + 7, s.y - 26); ctx.lineTo(sx, s.y); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(sx - 3, s.y - 24, 2, 14); }
  for (const d of B8.damp) if (d.varsel > 0) { const a = 1 - d.varsel / .8; ctx.fillStyle = '#1a222c'; ctx.fillRect(d.x - 12, gy - 3, 24, 3); ctx.fillStyle = `rgba(255,255,255,${.2 + a * .5})`; for (let k = -1; k <= 1; k++) ctx.fillRect(d.x + k * 7 - 1, gy - 3, 2, 3); }
    else { const gr = ctx.createLinearGradient(0, gy, 0, gy - 4 * T); gr.addColorStop(0, 'rgba(240,250,255,.7)'); gr.addColorStop(1, 'rgba(240,250,255,0)'); ctx.fillStyle = gr; ctx.fillRect(d.x - 14, gy - 4 * T, 28, 4 * T); }
  if (!B8.aktiv) return;
  const a = B8.fase === 'dod' ? clamp(B8.dod / 2.6, 0, 1) : 1, X = B8.x, top = gy - B8_H, frys = B8.syklus === 'frys', over = B8.syklus === 'over';
  ctx.globalAlpha = a;
  // kroppen: et stort kjøleaggregat med to vifter
  const gr = ctx.createLinearGradient(0, top, 0, gy); gr.addColorStop(0, '#5a6a7e'); gr.addColorStop(1, '#232b38'); ctx.fillStyle = gr; rr(ctx, X - B8_B, top, B8_B * 2, B8_H, 6); ctx.fill();
  ctx.save(); ctx.clip(); rustRenner(X - B8_B, top, B8_B * 2, B8_H, 131, 6); rustFlekker(X - B8_B, top, B8_B * 2, B8_H, 132, 5, .6); ctx.restore();
  ctx.strokeStyle = over ? '#ff8a3a' : 'rgba(170,220,255,.8)'; ctx.lineWidth = 2; rr(ctx, X - B8_B, top, B8_B * 2, B8_H, 6); ctx.stroke();
  for (const s of [-1, 1]) { const fx = X + s * B8_B * .5, fy = top + B8_H * .55, rad = 34;
    ctx.fillStyle = '#10151d'; ctx.beginPath(); ctx.arc(fx, fy, rad, 0, 7); ctx.fill();
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(B8.t * (over ? 2 : frys ? 14 : 8) * s); ctx.fillStyle = frys ? '#b8e4ff' : '#6a7888';
    for (let k = 0; k < 5; k++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(rad * .6, -10, rad * .9, 4); ctx.lineTo(rad * .3, 6); ctx.fill(); } ctx.restore();
    ctx.strokeStyle = '#4a5666'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(fx - rad, fy + k * 12); ctx.lineTo(fx + rad, fy + k * 12); ctx.stroke(); }
    ctx.strokeStyle = '#2a323e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(fx, fy, rad, 0, 7); ctx.stroke(); }
  nagler([[X - B8_B + 8, top + 8], [X + B8_B - 8, top + 8], [X - B8_B + 8, gy - 8], [X + B8_B - 8, gy - 8]], 1.4);
  // kobberrør langs siden
  ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - B8_B - 4, gy); ctx.lineTo(X - B8_B - 4, top + 16); ctx.lineTo(X - B8_B + 20, top + 16); ctx.moveTo(X + B8_B + 4, gy); ctx.lineTo(X + B8_B + 4, top + 22); ctx.lineTo(X + B8_B - 20, top + 22); ctx.stroke();
  // øynene: to lysdioder
  for (const s of [-1, 1]) { ctx.fillStyle = over ? '#ff5a3c' : frys ? '#e8fbff' : '#ffe36b'; ctx.beginPath(); ctx.arc(X + s * 14, top + 14, 4, 0, 7); ctx.fill(); }
  // frost på toppen
  if (frys) { ctx.fillStyle = 'rgba(230,248,255,.85)'; ctx.fillRect(X - B8_B + 2, top - 2, B8_B * 2 - 4, 5); for (let k = 0; k < 9; k++) { const ix = X - B8_B + 10 + k * 20; ctx.beginPath(); ctx.moveTo(ix - 3, top + 3); ctx.lineTo(ix + 3, top + 3); ctx.lineTo(ix, top + 10 + hs(k, 2, 812) * 8); ctx.fill(); } }
  // kjernen på toppen: lukket til den blir overopphetet
  const [kx, ky] = b8Kjerne(); ctx.fillStyle = '#2a323e'; rr(ctx, kx - 22, ky - 6, 44, 16, 4); ctx.fill();
  ctx.fillStyle = over ? '#ffb070' : '#3a4656'; ctx.beginPath(); ctx.arc(kx, ky, over ? 13 : 10, Math.PI, 0); ctx.fill();
  if (over) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(kx, ky - 2, 5, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,170,.85)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const v = S.t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(kx + Math.cos(v) * 22, ky - 30 + Math.sin(v) * 5, 2.5, 0, 7); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
function boss8Glod() {
  for (const d of B8.damp) if (d.varsel <= 0) glod(SPR.h, d.x, ARENA8.gulv * T - 2 * T, 50, .25);
  if (!B8.aktiv) return; const a = B8.fase === 'dod' ? clamp(B8.dod / 2.6, 0, 1) : 1, [kx, ky] = b8Kjerne();
  glod(B8.syklus === 'over' ? SPR.o : SPR.c, kx, ky, B8.syklus === 'over' ? 70 : 40, .6 * a);
  for (const s of [-1, 1]) glod(SPR.c, B8.x + s * B8_B * .5, ARENA8.gulv * T - B8_H * .45, 40, (B8.syklus === 'frys' ? .45 : .2) * a);
}

// ---------- registrering ----------
BOSSER.push({ navn: 'Kjølekjempen', aktiv: () => B8.aktiv, hp: () => B8.hp, maks: 3, kamp: () => B8.fase === 'kamp' || B8.fase === 'dod' });
GLATT.push(() => B8.aktiv && B8.fase === 'kamp' && B8.syklus === 'frys' && P.onGround && P.y + P.h > (ARENA8.gulv - .2) * T && P.x / T > ARENA8.x0 - 1);
OPPDATER.push(dt => {
  oppdaterBoss8(dt);
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (!S.ev.fiber && tx >= 84 && tx <= 92 && ty >= 210 && ty <= 217 && S.hintSett.has('ror')) hint('ror2', 'Det må finnes en måte å komme gjennom rørene på.', 3.5);
  if (S.ev.fiber && tx >= 94 && tx <= 108 && ty >= 228 && ty <= 240 && S.ev.glid) hint('taarn', 'Viftene blåser oppover. Gli inn i lufta over dem.', 4);
});
TILBAKESTILL.push(() => { if (B8.aktiv && !S.boss8) resetBoss8(); else { B8.is.length = 0; B8.damp.length = 0; } });
TEGN_VERDEN.push(tegnTarnVifter, tegnBoss8);
TEGN_GLOD.push(boss8Glod);
LYSKILDER.push(L => {
  if (B8.aktiv) { const a = B8.fase === 'dod' ? clamp(B8.dod / 2.6, 0, 1) : 1, [kx, ky] = b8Kjerne(); L(kx, ky + 40, 300, .9 * a); }
  for (const s of B8.is) L(s.x, s.y, 60, .4);
  if (synlig(101 * T, 238 * T, 300)) L(101 * T, 238 * T, 220, .6);
});
