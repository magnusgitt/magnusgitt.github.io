'use strict';
// Gnist – område 7: Sumpen. En druknet forstad der strømmen fra dammen rant ut da linjene falt.
// Vannet står under spenning, isolerstøvlene gjør det trygt å vasse, og Kvelerroten har grodd sammen med kablene.
const SY0 = 159;   // øverste rad i sonen
SONER.push({ id: 'sump', navn: 'Sumpen', y0: SY0, y1: 199 });

// ---------- terrenget ----------
// Bakken er rad 185: montøren står i rad 184. Under bakken går en gammel kulvert.
OMRAADER.push({ navn: 'Sumpen', kart: [
  [3, 181, 3, 184, AIR],                                   // nisjen med porten tilbake til dammen
  [4, 160, 36, 184, AIR],                                  // sumpkanten
  [26, 181, 30, 184, SOL], [22, 180, 25, 180, ONE], [31, 177, 34, 177, ONE],   // et sunket hus og et tak
  [37, 160, 72, 184, AIR],                                 // myra
  [44, 185, 46, 185, VANN], [53, 185, 56, 185, VANN], [63, 185, 65, 185, VANN],
  [49, 182, 51, 184, SOL], [59, 183, 60, 184, SOL], [47, 177, 50, 177, ONE], [56, 173, 59, 173, ONE],
  [68, 185, 69, 188, AIR],                                 // sjakt ned i kulverten
  [73, 160, 100, 184, AIR],                                // de druknede husene
  [82, 166, 96, 166, SOL], [82, 167, 82, 182, SOL], [96, 167, 96, 182, SOL],   // blokka der støvlene ligger
  [83, 180, 88, 180, ONE], [89, 176, 95, 176, ONE], [83, 172, 95, 172, ONE], [76, 179, 79, 179, ONE],
  [97, 185, 98, 188, AIR],                                 // sjakt opp fra kulverten
  [101, 183, 140, 184, AIR], [101, 185, 140, 185, VANN],   // undergangen: vannet går helt til taket
  [119, 185, 123, 185, SOL], [112, 183, 113, 183, SOL], [131, 183, 132, 183, SOL],
  [141, 160, 170, 184, AIR],                               // rotskogen
  [146, 185, 152, 185, VANN], [158, 185, 163, 185, VANN],
  [155, 177, 156, 184, SOL], [150, 180, 153, 180, ONE], [157, 173, 161, 173, ONE], [143, 176, 146, 176, ONE], [162, 169, 166, 169, ONE],
  [171, 165, 197, 184, AIR],                               // rotreiret (bossen)
  [176, 179, 179, 179, ONE], [189, 179, 192, 179, ONE], [182, 174, 186, 174, ONE],
  [40, 189, 100, 193, AIR], [40, 194, 100, 194, AIR],      // kulverten
  [48, 194, 56, 194, VANN], [72, 194, 80, 194, VANN], [86, 194, 92, 194, VANN],
  [62, 191, 64, 191, ONE], [83, 191, 85, 191, ONE],
] });
const ARENA7 = { x0: 172, x1: 196, gulv: 185, midt: 184.5, tak: 165 };

// ---------- porter, figurer og funn ----------
PORTER.push({ x: 198, y0: 135, y1: 138, til: [6, 184], krav: () => S.boss6, stengt: 'Porten er låst. Noe svømmer i magasinet.' },
  { x: 3, y0: 181, y1: 184, til: [196, 138], krav: () => true });
FIGURER.push({ id: 'ruth', x: 18, y: 184, navn: 'Ruth', drakt: { bukse: '#2e3a2a', jakke: '#6a5a2a', refleks: false, skjegg: false, hjelm: '#3a4a2a' },
  replikk() {
    if (S.boss7) return { linjer: ['Røttene har sluppet taket. For første gang på hundre år er vannet stille.', 'Men noe trakk i strømmen gjennom dem. Det kom ikke herfra.'] };
    if (S.ev.stovler) return { linjer: ['De støvlene har isolerende såle. Da kan du vasse der andre blir slått ned.', 'Røttene samler seg i reiret bak rotskogen. Pass deg for dem som skyter opp av bakken.'] };
    return { linjer: ['Hei! Jeg heter Ruth. Ikke gå uti vannet, det står under spenning.', 'Strømmen fra dammen rant hit ned da linjene falt, og nå ligger den i hele sumpen.',
      'Broren min hadde et par isolerstøvler. De ligger på toppen av blokka der borte.'] }; } });
IKON.stovler = '<svg viewBox="0 0 24 24"><path d="M5 2h7v11l7 3c1.6.7 3 2 3 3.8V21H3v-3l2-1zM3 22h19v1.6H3z"/></svg>';
FUNN.push({ id: 'stovler', x: 89, y: 171, navn: 'Isolerstøvler', tekst: 'Gummistøvler med isolerende såle. Nå kan du vasse trygt gjennom vann som står under spenning.',
  pc: 'Gå rett gjennom det blå vannet', mob: 'Gå rett gjennom det blå vannet' },
  { id: 'liv8', x: 184, y: 184, boss7: true, navn: 'Livsgnist', liten: true });

// ---------- sjekkpunkt, fagkort, lysorber og fiender ----------
VERKSTED.push(SJEKK.length);
SJEKK.push({ x: 8, y: 184 }, { x: 76, y: 184 }, { x: 121, y: 184 }, { x: 166, y: 184 });
FAG.push(
  { x: 86, y: 179, tittel: 'Nedfalt ledning', tekst: 'Regn alltid med at en ledning som ligger på bakken er strømførende. Hold god avstand, hold andre unna og ring 112.' },
  { x: 60, y: 193, tittel: 'Skrittspenning', tekst: 'Når strøm går ned i bakken, synker spenningen utover fra stedet. Står du med beina fra hverandre, kan det bli farlig spenning mellom dem. Ta små skritt for å komme deg unna.' },
  { x: 159, y: 172, tittel: 'Vernesko', tekst: 'Vernesko for elektrikere kan ha isolerende såle. De er et ekstra vern, men erstatter aldri det å gjøre anlegget spenningsløst.' });
ORBER.push([12, 182], [24, 178], [33, 175], [45, 181], [48, 175], [55, 182], [58, 171], [64, 181], [77, 177], [85, 178], [92, 170], [93, 174],
  [106, 184], [116, 184], [127, 184], [137, 184], [144, 174], [149, 182], [151, 178], [160, 182], [164, 167],
  [44, 191], [52, 192], [63, 189], [76, 192], [84, 189], [90, 192], [96, 191]);
FIENDE_DEF.push({ type: 'padde', x0: 40, x1: 52, y: 184 }, { type: 'padde', x0: 57, x1: 70, y: 184 }, { type: 'sverm', x: 58, y: 168 },
  { type: 'skjold', x0: 84, x1: 94, y: 184 }, { type: 'sverm', x: 89, y: 175 }, { type: 'sverm', x: 108, y: 184 }, { type: 'sverm', x: 128, y: 184 },
  { type: 'padde', x0: 142, x1: 154, y: 184 }, { type: 'sverm', x: 150, y: 168 }, { type: 'jager', x: 165, y: 170 }, { type: 'padde', x0: 82, x1: 98, y: 193 });

// ---------- nye fiender ----------
// spolepadde: en tung spole som sitter stille og hopper mot montøren når han kommer nær
// gnistsverm: en klynge små gnister som driver etter montøren
FIENDE_TYPER.padde = {
  ny: f => ({ type: 'padde', x: (f.x0 + f.x1) / 2 * T, y: (f.y + 1) * T - 18, w: 24, h: 18, x0: f.x0 * T, x1: (f.x1 + 1) * T, vx: 0, vy: 0, dir: -1, liv: true, t: Math.random() * 2, hoppT: 1 + Math.random(), bakke: true }),
  oppdater(e, dt, pcx, pcy) {
    const dx = pcx - (e.x + e.w / 2), naer = Math.abs(dx) < 8 * T && Math.abs(pcy - (e.y + e.h / 2)) < 4 * T;
    if (e.bakke) { e.vx = 0; if (naer) e.dir = dx < 0 ? -1 : 1; e.hoppT -= dt * NG();
      if (e.hoppT <= 0) { e.hoppT = naer ? 1.3 : 2.6; e.vy = -430; e.vx = (naer ? e.dir : (Math.random() < .5 ? -1 : 1)) * 150 * NG(); e.bakke = false; if (naer) lyd('land'); } }
    e.vy = Math.min(900, e.vy + 1400 * dt);
    e.x += e.vx * dt; if (overlapp(e.x, e.y, e.w, e.h) || e.x < e.x0 || e.x + e.w > e.x1) { e.x -= e.vx * dt; e.vx = -e.vx * .3; }
    const forrige = e.y + e.h; e.y += e.vy * dt;
    const x0 = Math.floor(e.x / T), x1 = Math.floor((e.x + e.w - .01) / T);
    if (e.vy > 0) { const ty = Math.floor((e.y + e.h) / T);
      for (let x = x0; x <= x1; x++) if (fast(x, ty) || (tile(x, ty) === ONE && forrige <= ty * T + .5)) { e.y = ty * T - e.h; if (!e.bakke) stov(e.x + e.w / 2, e.y + e.h, 3, .4); e.vy = 0; e.bakke = true; break; } }
    else if (e.vy < 0) { const ty = Math.floor(e.y / T); for (let x = x0; x <= x1; x++) if (fast(x, ty)) { e.y = (ty + 1) * T; e.vy = 0; break; } }
  },
  tegn(e) {
    const X = e.x + e.w / 2, Y = e.y + e.h, v = e.varsel || 0, huk = e.bakke ? clamp(1 - e.hoppT / .35, 0, 1) * .25 : -.12;
    ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir, 1 - huk); ctx.lineCap = 'round';
    // bein
    ctx.strokeStyle = '#1a1e12'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-12, 0); ctx.moveTo(7, -4); ctx.lineTo(11, 0); ctx.stroke();
    ctx.strokeStyle = '#c98a3a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-10, 0); ctx.moveTo(10, 0); ctx.lineTo(13, 0); ctx.stroke();
    // kroppen: en mosegrodd spole med kobbervikling på magen
    const gr = ctx.createLinearGradient(0, -18, 0, 0); gr.addColorStop(0, '#4c5a32'); gr.addColorStop(1, '#232a16'); ctx.fillStyle = gr;
    ctx.beginPath(); ctx.ellipse(0, -8, 12, 9, 0, 0, 7); ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = 1.3; for (let k = -6; k <= 6; k += 2.4) { ctx.beginPath(); ctx.moveTo(k, -3); ctx.lineTo(k + 1.5, 1); ctx.stroke(); }
    rustFlekker(-12, -17, 24, 9, 91, 3, .5); ctx.fillStyle = 'rgba(120,170,80,.35)'; ctx.beginPath(); ctx.ellipse(-3, -15, 7, 2.4, -.2, 0, 7); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(190,230,140,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -8, 12, 9, 0, 0, 7); ctx.stroke(); nagler([[-7, -10], [8, -6]], .7);
    // øyne på stilker
    for (const ox of [2, 8]) { ctx.fillStyle = '#232a16'; ctx.fillRect(ox - 1, -18, 2, 4); ctx.fillStyle = v > .5 ? '#ff5a3c' : '#f2e36b'; ctx.beginPath(); ctx.arc(ox, -19, 2.2, 0, 7); ctx.fill(); }
    ctx.restore();
  },
  glod(e) { glod(SPR.g, e.x + e.w / 2 + e.dir * 5, e.y - 1, 12, .5 + (e.varsel || 0) * .4); }
};
FIENDE_TYPER.sverm = {
  ny: f => ({ type: 'sverm', hx: f.x * T + T / 2, hy: f.y * T + T / 2, x: f.x * T, y: f.y * T, w: 26, h: 22, dir: 1, liv: true, t: Math.random() * 6 }),
  oppdater(e, dt, pcx, pcy) {
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2, d = Math.hypot(pcx - cx, pcy - cy), jakt = d < 8 * T && Math.hypot(e.hx - cx, e.hy - cy) < 10 * T;
    const mx = jakt ? pcx : e.hx + Math.sin(e.t * .7) * T * 1.5, my = jakt ? pcy - 4 : e.hy + Math.sin(e.t * 1.3) * T * .6;
    const l = Math.hypot(mx - cx, my - cy) || 1, s = Math.min(l, (jakt ? 62 : 40) * NG() * dt);
    e.x += (mx - cx) / l * s; e.y += (my - cy) / l * s; e.dir = mx >= cx ? 1 : -1;
  },
  tegn(e) {
    const X = e.x + e.w / 2, Y = e.y + e.h / 2, v = e.varsel || 0;
    ctx.fillStyle = 'rgba(40,60,30,.35)'; ctx.beginPath(); ctx.arc(X, Y, 10, 0, 7); ctx.fill();
    for (let i = 0; i < 7; i++) { const a = e.t * (2.2 + i * .3) + i * 2.4, r = 5 + (i % 3) * 3.5, px = X + Math.cos(a) * r, py = Y + Math.sin(a * 1.3) * r * .8;
      ctx.strokeStyle = 'rgba(200,255,140,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - Math.cos(a + 1.57) * 4, py - Math.sin(a + 1.57) * 3); ctx.stroke();
      ctx.fillStyle = v > .5 && i % 2 ? '#ffb070' : '#eaff9a'; ctx.beginPath(); ctx.arc(px, py, 1.6, 0, 7); ctx.fill(); }
  },
  glod(e) { glod(SPR.g, e.x + e.w / 2, e.y + e.h / 2, 26, .45); }
};

// ---------- isolerstøvlene: vassing ----------
let vasset = false;
OPPDATER.push(() => {
  if (!S.ev.stovler) return;
  const fy = Math.floor((P.y + P.h - 2) / T), vasser = tile(Math.floor((P.x + P.w / 2) / T), fy) === VANN;
  if (vasser && !vasset) { lyd('plask'); sprut(P.x + P.w / 2, fy * T + 6, 10, 'c', 140); }
  if (vasser && Math.abs(P.vx) > 40 && Math.random() < .3) part(P.x + P.w / 2 - Math.sign(P.vx) * 6, fy * T + 5, -P.vx * .2, -40 - Math.random() * 40, .35, 3, 'c', 300);
  vasset = vasser;
});

// ---------- himmelen over sumpen ----------
let SBG = null;
function lagSumpBg() {
  const himmel = nyC(LW, LH), g = himmel.getContext('2d'), r = rng(81);
  let gr = g.createLinearGradient(0, 0, 0, LH); gr.addColorStop(0, '#03080a'); gr.addColorStop(.45, '#0b1c18'); gr.addColorStop(.8, '#1a3326'); gr.addColorStop(1, '#27402c');
  g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  for (let i = 0; i < 120; i++) { const x = r() * LW, y = r() * LH * .45, a = (.1 + r() * .4) * (1 - y / (LH * .5)); g.fillStyle = `rgba(220,240,220,${a})`; g.fillRect(x, y, 1.3, 1.3); }
  // en blek måne bak tåka
  myk(g, LW * .24, LH * .24, 300, 300, '200,230,190', .12); g.fillStyle = 'rgba(225,240,215,.75)'; g.beginPath(); g.arc(LW * .24, LH * .24, 30, 0, 7); g.fill();
  for (let i = 0; i < 24; i++) myk(g, r() * LW, LH * (.3 + r() * .4), 200 + r() * 300, 30 + r() * 50, '120,160,130', .05 + r() * .05);
  const fjern = flislag((g, r) => {
    // en druknet by: blokker som står halvveis i vannet, med noen få vinduer som fortsatt gløder
    const vann = 640;
    for (let x = 0; x < LW; x += 40 + r() * 90) { const w = 40 + r() * 80, h = 90 + r() * 220, y = vann - h;
      g.fillStyle = '#0f1d1a'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(0,0,0,.35)'; if (r() < .5) g.fillRect(x + w * .3, y - 10, w * .4, 10);
      for (let wy = y + 12; wy < vann - 12; wy += 18) for (let wx = x + 6; wx < x + w - 8; wx += 14) if (r() < .06) { g.fillStyle = r() < .6 ? 'rgba(170,255,190,.5)' : 'rgba(255,210,140,.45)'; g.fillRect(wx, wy, 5, 6); } }
    gr = g.createLinearGradient(0, vann, 0, LH); gr.addColorStop(0, '#13261f'); gr.addColorStop(1, '#0a1511'); g.fillStyle = gr; g.fillRect(0, vann, LW, LH - vann);
    g.fillStyle = 'rgba(170,230,190,.12)'; for (let i = 0; i < 40; i++) g.fillRect(r() * LW, vann + 4 + r() * 60, 30 + r() * 80, 1.5);
  }, 82);
  const midt = flislag((g, r) => {
    // døde trær med mose som henger fra greinene
    const bunn = 760; g.fillStyle = '#08120e'; g.fillRect(0, bunn, LW, LH - bunn);
    for (let x = 30; x < LW; x += 120 + r() * 160) { const h = 260 + r() * 200, top = bunn - h, l = r() < .5 ? -1 : 1;
      g.strokeStyle = '#08120e'; g.lineCap = 'round'; g.lineWidth = 14; g.beginPath(); g.moveTo(x, bunn + 10); g.quadraticCurveTo(x + l * 20, bunn - h * .5, x + l * 8, top); g.stroke();
      for (let k = 0; k < 5; k++) { const by = top + 20 + k * h * .15, bl = (60 + r() * 70) * (k % 2 ? 1 : -1), ex = x + bl, ey = by - 30 - r() * 30;
        g.lineWidth = 6 - k * .8; g.beginPath(); g.moveTo(x + l * 6, by); g.quadraticCurveTo(x + bl * .5, by - 10, ex, ey); g.stroke();
        g.strokeStyle = 'rgba(60,90,50,.55)'; g.lineWidth = 1.4; for (let m = 0; m < 4; m++) { const mx = x + bl * (.3 + m * .2), my = by - 10 - m * 6; g.beginPath(); g.moveTo(mx, my); g.lineTo(mx + 2, my + 20 + r() * 40); g.stroke(); } g.strokeStyle = '#08120e'; } }
  }, 83);
  const naer = flislag((g, r) => {
    // siv og røtter i forgrunnen
    const bunn = 820; g.fillStyle = '#040a07'; g.fillRect(0, bunn, LW, LH - bunn);
    g.strokeStyle = '#040a07'; g.lineCap = 'round';
    for (let x = 0; x < LW; x += 4 + r() * 8) { const h = 40 + r() * 110, b = (r() - .5) * 30; g.lineWidth = 1.5 + r() * 2; g.beginPath(); g.moveTo(x, bunn + 4); g.quadraticCurveTo(x + b * .3, bunn - h * .6, x + b, bunn - h); g.stroke(); }
    for (let x = 60; x < LW; x += 260 + r() * 200) { g.lineWidth = 9; g.beginPath(); g.moveTo(x - 80, bunn + 10); g.bezierCurveTo(x - 40, bunn - 90, x + 40, bunn - 90, x + 80, bunn + 10); g.stroke(); }
  }, 84);
  return { himmel, fjern, midt, naer };
}
function tegnSumpBg(kx, ky) {
  if (!SBG) SBG = lagSumpBg();
  const cw = cv.width, ch = cv.height, vh = cssH / skala, t = clamp((ky - SY0 * T) / Math.max(1, 41 * T - vh), 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(SBG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .04, -(LH * hk - ch) * (.2 + t * .5), LW * hk, LH * hk);
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch, lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lag = (bilde, p, pv) => { const y = lagY(pv); let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; for (let x = x0; x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); };
  lag(SBG.fjern, .06, .25); lag(SBG.midt, .2, .5);
  // ildfluer som driver mellom trærne
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 22; i++) { const s = i * 37.1, fx = ((hs(i, 1, 801) * cw + Math.sin(S.t * .3 + s) * 60 * dpr - kx * skala * dpr * .3) % cw + cw) % cw, fy = ch * (.35 + hs(i, 2, 802) * .5) + Math.sin(S.t * .7 + s) * 30 * dpr;
    const a = .4 + .4 * Math.sin(S.t * 2.3 + s); glod(SPR.g, fx, fy, 6 * dpr, a); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  lag(SBG.naer, .45, .8);
  for (let i = 0; i < 2; i++) { const w = cw * 1.2, x = ((S.t * (10 + i * 6) * dpr - kx * skala * dpr * (.6 + i * .1) + i * w * .5) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .14; ctx.drawImage(TAKE, x, ch * (.68 + i * .1), w, w * .25); }
  ctx.globalAlpha = 1;
}

// ---------- Kvelerroten ----------
// En gammel kabelbunt som røttene har grodd inn i. Røtter skyter opp av bakken der montøren står,
// og når roten er sliten, synker kjernen ned så den kan slås.
const B7 = { aktiv: false, fase: '', introT: 0, hp: 3, t: 0, x: 0, y: 0, syklus: '', sT: 0, rotT: 0, skuddT: 0, dod: 0, rotter: [], banner: false };
const b7Fase = () => B7.hp >= 3 ? 1 : B7.hp === 2 ? 2 : 3;
const B7_HOY = 170.5;
function lukkArena7(v) { rect(171, ARENA7.tak, 171, ARENA7.gulv - 1, v); rect(197, ARENA7.tak, 197, ARENA7.gulv - 1, v); }
function resetBoss7() { Object.assign(B7, { aktiv: false, fase: '', hp: S.boss7 ? 0 : 3, syklus: '', dod: 0 }); B7.rotter.length = 0; if (tile(171, 180) === DOOR) lukkArena7(AIR); hud(); }
function startBoss7() {
  Object.assign(B7, { aktiv: true, fase: 'intro', introT: 2.4, hp: 3, t: 0, x: ARENA7.midt * T, y: (ARENA7.tak - 3) * T, syklus: 'angrep', sT: 6, rotT: 1.5, skuddT: 2.4, banner: false });
  B7.rotter.length = 0; lukkArena7(DOOR); lyd('dor'); S.shake = .5; P.vx = 0; hud();
}
function nyRot(x) { B7.rotter.push({ x: clamp(x, (ARENA7.x0 + .5) * T, (ARENA7.x1 + .5) * T), varsel: .85 / NG(), aktiv: 0, seed: (Math.random() * 1e6) | 0 }); lyd('varsel'); }
function b7Treff() {
  B7.hp--; lyd('b2treff'); S.shake = .5; S.flash = .4; S.flashF = '200,255,170'; vib(50); sprut(B7.x, B7.y, 40, 'g', 300); gnister(B7.x, B7.y, 14, 'w'); hud();
  if (B7.hp <= 0) { B7.fase = 'dod'; B7.dod = 2.6; S.slow = .9; lyd('bossdod'); B7.rotter.length = 0; return; }
  B7.syklus = 'opp'; B7.sT = 1.2; if (B7.hp === 2) hint(null, 'Roten skyter frø nå. Slå dem bort med pisken!', 3.5);
}
function sluttBoss7() {
  S.boss7 = true; B7.aktiv = false; B7.fase = ''; lukkArena7(AIR); S.flash = 1; S.flashF = '210,255,190'; sprut(B7.x, B7.y, 90, 'g', 400); ring(B7.x, B7.y, 30, 'h', 380); lyd('slutt'); vib([40, 60, 120]);
  banner('Sumpen puster igjen', 'Kvelerroten er slått', 3.5); sjelSier('B7'); lagre(); hud(); sjekkMaal(true);
}
function oppdaterBoss7(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2, gulvY = ARENA7.gulv * T;
  if (!B7.aktiv) { if (!S.boss7 && S.dod <= 0 && !S.overgang && pcx > 173.5 * T && pcx < 196 * T && pcy > 166 * T && pcy < gulvY) startBoss7(); return; }
  B7.t += dt;
  for (let i = B7.rotter.length - 1; i >= 0; i--) { const r = B7.rotter[i];
    if (r.varsel > 0) { r.varsel -= dt; if (r.varsel <= 0) { r.aktiv = .75; lyd('bue'); S.shake = Math.max(S.shake, .2); stov(r.x, gulvY, 10, 1); } }
    else { r.aktiv -= dt; const h = rotHoyde(r); if (S.dod <= 0 && Math.abs(r.x - pcx) < 12 + P.w / 2 && P.y + P.h > gulvY - h) skade(r.x, false); if (r.aktiv <= 0) B7.rotter.splice(i, 1); } }
  if (B7.fase === 'intro') { B7.introT -= dt; B7.y += (B7_HOY * T - B7.y) * Math.min(1, dt * 1.5);
    if (!B7.banner && B7.introT < 1.8) { B7.banner = true; lyd('brol2'); S.shake = .6; banner('Kvelerroten', 'Rotreiret', 2.4); }
    if (B7.introT <= 0) { B7.fase = 'kamp'; hud(); hint(null, 'Se etter lyset i bakken, og hopp unna røttene. Slå kjernen når den synker ned.', 4.5); } return; }
  if (B7.fase === 'dod') { B7.dod -= dt; B7.y += 30 * dt; if (Math.random() < dt * 30) gnister(B7.x + (Math.random() - .5) * 60, B7.y + (Math.random() - .5) * 40, 3, 'g'); if (B7.dod <= 0) sluttBoss7(); return; }
  const f = b7Fase(), ng = NG(); B7.sT -= dt * ng;
  if (B7.syklus === 'angrep') {
    const mx = ARENA7.midt * T + Math.sin(B7.t * .6) * 5 * T; B7.x += (mx - B7.x) * Math.min(1, dt * 2); B7.y += ((B7_HOY + Math.sin(B7.t * 1.4) * .6) * T - B7.y) * Math.min(1, dt * 2);
    B7.rotT -= dt * ng;
    if (B7.rotT <= 0) { B7.rotT = f === 1 ? 1.5 : f === 2 ? 1.2 : .95; nyRot(pcx + (Math.random() - .5) * T); if (f === 3) nyRot(ARENA7.x0 * T + Math.random() * (ARENA7.x1 - ARENA7.x0) * T); }
    if (f >= 2) { B7.skuddT -= dt * ng; if (B7.skuddT <= 0) { B7.skuddT = f === 3 ? 1.7 : 2.3; const a0 = Math.atan2(pcy - B7.y, pcx - B7.x), s = 210 * ng;
      for (const da of [-.28, 0, .28]) bolter.push({ x: B7.x, y: B7.y + 14, vx: Math.cos(a0 + da) * s, vy: Math.sin(a0 + da) * s, liv: 4, f: 'g' }); lyd('releskudd'); sprut(B7.x, B7.y + 14, 8, 'g', 120); } }
    if (B7.sT <= 0) { B7.syklus = 'senk'; B7.sT = 1.1; lyd('utmattet'); } }
  else if (B7.syklus === 'senk') { B7.y += ((ARENA7.gulv - 1.1) * T - B7.y) * Math.min(1, dt * 4); if (B7.sT <= 0) { B7.syklus = 'lav'; B7.sT = 3.4; } }
  else if (B7.syklus === 'lav') { B7.y = (ARENA7.gulv - 1.15) * T + Math.sin(B7.t * 5) * 2; if (Math.random() < dt * 5) gnister(B7.x, B7.y - 10, 2, 'g');
    if (B7.sT <= 0) { B7.syklus = 'opp'; B7.sT = 1.2; } }
  else if (B7.syklus === 'opp') { B7.y += (B7_HOY * T - B7.y) * Math.min(1, dt * 2.5); if (B7.sT <= 0) { B7.syklus = 'angrep'; B7.sT = f === 3 ? 7 : 6; B7.rotT = 1; } }
  if (S.dod > 0) return;
  const borti = Math.abs(pcx - B7.x) < 32 + P.w / 2 && Math.abs(pcy - B7.y) < 28 + P.h / 2;
  if (B7.syklus === 'lav') {
    const pisk = P.piskT > 0 ? piskOmraade() : null;
    const piskTraff = pisk && B7.x > pisk.x0 - 32 && B7.x < pisk.x1 + 32 && B7.y > pisk.y0 - 30 && B7.y < pisk.y1 + 30, trakk = borti && P.vy > 0 && P.y + P.h < B7.y;
    if (piskTraff || (borti && P.dashT > 0) || trakk) { if (trakk) { P.vy = -480; P.air = S.ev.dobbel ? 1 : 0; } b7Treff(); }
  } else if (borti && B7.syklus === 'angrep') skade(B7.x, false);
}
// roten skyter raskt opp og trekker seg sakte ned igjen
const rotHoyde = r => r.varsel > 0 ? 0 : 3.4 * T * Math.min(1, (.75 - r.aktiv) / .12) * Math.min(1, r.aktiv / .3);
function tegnRot(x, gy, h, seed) {
  if (h <= 1) return; ctx.lineCap = 'round';
  const bue = (hs(seed, 1, 3) - .5) * 14;
  ctx.strokeStyle = '#1d140c'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(x, gy + 4); ctx.quadraticCurveTo(x + bue, gy - h * .5, x, gy - h); ctx.stroke();
  ctx.strokeStyle = '#4a3420'; ctx.lineWidth = 15; ctx.stroke();
  ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 2, gy); ctx.quadraticCurveTo(x - 2 + bue, gy - h * .5, x - 1, gy - h + 6); ctx.stroke();
  ctx.fillStyle = '#e8f6c0'; ctx.beginPath(); ctx.moveTo(x - 8, gy - h + 8); ctx.lineTo(x, gy - h - 14); ctx.lineTo(x + 8, gy - h + 8); ctx.fill();
  ctx.fillStyle = '#3a5a2a'; for (let k = 1; k < 4; k++) { const y = gy - h * k / 4; ctx.beginPath(); ctx.ellipse(x + (k % 2 ? 10 : -10), y, 7, 2.6, k % 2 ? .6 : -.6, 0, 7); ctx.fill(); }
  ctx.lineCap = 'butt';
}
function tegnBoss7() {
  const gy = ARENA7.gulv * T;
  for (const r of B7.rotter) { if (r.varsel > 0) { const a = 1 - r.varsel / .85; ctx.fillStyle = `rgba(200,255,140,${.25 + a * .5})`; ctx.beginPath(); ctx.ellipse(r.x, gy - 1, 14 + a * 6, 3, 0, 0, 7); ctx.fill();
      if (Math.random() < .3) stov(r.x, gy, 1, .3); } else tegnRot(r.x, gy, rotHoyde(r), r.seed); }
  if (!B7.aktiv) return; const a = B7.fase === 'dod' ? clamp(B7.dod / 2.6, 0, 1) : 1, lav = B7.syklus === 'lav', ty = ARENA7.tak * T;
  ctx.globalAlpha = a; ctx.lineCap = 'round';
  // tykke røtter og kabler som holder kjernen oppe fra taket
  for (let i = 0; i < 5; i++) { const fx = B7.x + (i - 2) * 26, sv = Math.sin(B7.t * 1.2 + i) * 8;
    ctx.strokeStyle = i % 2 ? '#2a1d12' : '#14181c'; ctx.lineWidth = i % 2 ? 10 : 6; ctx.beginPath(); ctx.moveTo(fx + (i - 2) * 20, ty); ctx.bezierCurveTo(fx + sv, ty + (B7.y - ty) * .4, B7.x + (i - 2) * 6 - sv, B7.y - 40, B7.x + (i - 2) * 5, B7.y - 10); ctx.stroke();
    if (i % 2 === 0) { ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = 1.2; ctx.stroke(); } }
  // kjernen: en sprukket isolator der det gløder grønt innenfra
  ctx.save(); ctx.translate(B7.x, B7.y); ctx.scale(1.5, 1.5);
  const gr = ctx.createRadialGradient(-6, -6, 2, 0, 0, 26); gr.addColorStop(0, lav ? '#f4ffd0' : '#c8f08a'); gr.addColorStop(.5, '#4a7a2a'); gr.addColorStop(1, '#1a2a12'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 20 + Math.sin(B7.t * 3) * 1.5, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(20,30,14,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(-4, -4); ctx.lineTo(-12, 6); ctx.moveTo(8, -18); ctx.lineTo(4, -2); ctx.lineTo(12, 10); ctx.stroke();
  ctx.fillStyle = '#9aa7b8'; for (const k of [-1, 1]) { rr(ctx, k * 18 - 4, -8, 8, 16, 2); ctx.fill(); } ctx.fillStyle = '#c9a77a'; for (const k of [-1, 1]) for (let m = 0; m < 3; m++) ctx.fillRect(k * 18 - 5, -6 + m * 5, 10, 1.4);
  ctx.fillStyle = lav ? '#cfe' : '#fff'; ctx.beginPath(); ctx.arc(0, 2, 6, 0, 7); ctx.fill(); ctx.fillStyle = lav ? '#567' : '#ff5a3c'; ctx.beginPath(); ctx.arc(0, 2, 3, 0, 7); ctx.fill();
  ctx.restore(); ctx.lineCap = 'butt';
  if (lav) { ctx.strokeStyle = 'rgba(255,240,170,.85)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const v = S.t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(B7.x + Math.cos(v) * 22, B7.y - 40 + Math.sin(v) * 5, 2.5, 0, 7); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
function boss7Glod() {
  for (const r of B7.rotter) if (r.varsel > 0) glod(SPR.g, r.x, ARENA7.gulv * T - 4, 30, .6 * (1 - r.varsel / .85));
  if (!B7.aktiv) return; const a = B7.fase === 'dod' ? clamp(B7.dod / 2.6, 0, 1) : 1;
  glod(SPR.g, B7.x, B7.y, 70, .55 * a); glod(SPR.h, B7.x, B7.y + 2, 10, .7 * a);
}

// ---------- registrering ----------
BOSSER.push({ navn: 'Kvelerroten', aktiv: () => B7.aktiv, hp: () => B7.hp, maks: 3, kamp: () => B7.fase === 'kamp' || B7.fase === 'dod' });
OPPDATER.push(dt => {
  oppdaterBoss7(dt);
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (!S.ev.stovler && tx >= 97 && tx <= 101 && ty >= 180 && ty <= 185) hint('undergang', 'Undergangen står full av vann under spenning. Uten noe som isolerer kommer du ikke gjennom.', 4.5);
  if (ty >= SY0 && ty < 186 && tx <= 12 && !S.hintSett.has('sump')) hint('sump', 'Det blå vannet står under spenning. Ikke gå uti.', 4);
});
TILBAKESTILL.push(() => { if (B7.aktiv && !S.boss7) resetBoss7(); else B7.rotter.length = 0; });
TEGN_VERDEN.push(tegnBoss7);
TEGN_GLOD.push(boss7Glod);
LYSKILDER.push(L => {
  if (B7.aktiv) { const a = B7.fase === 'dod' ? clamp(B7.dod / 2.6, 0, 1) : 1; L(B7.x, B7.y, 280, .9 * a); }
  for (const r of B7.rotter) L(r.x, ARENA7.gulv * T - 20, 90, .5);
});
