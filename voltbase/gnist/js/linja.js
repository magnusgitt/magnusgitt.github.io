'use strict';
// Gnist – område 5: Høyspentlinja. Fjell og kraftmaster i storm, vindkast, glideskjerm,
// Gamle Ivar med et sideoppdrag og Lynfuglen på toppmasta.
const LY0 = 72;   // øverste rad i sonen

// ---------- terrenget ----------
// bakkehøyden (øverste faste rad) i hver kolonne
function linjaBakke(x) {
  if (x <= 14) return 105; if (x <= 22) return 104; if (x <= 30) return 102; if (x <= 46) return 100;
  if (x <= 54) return x === 50 || x === 51 ? 101 : 106;    // grop med en stein midt i
  if (x <= 62) return 100; if (x <= 96) return 114;         // juvet
  if (x <= 131) return 100; if (x <= 166) return x >= 148 && x <= 150 ? 97 : 115;   // Vindskaret med en søyle
  return 100;
}
// gropene har strømførende kabler i bunnen (nedfalne ledninger)
const linjaGrop = x => (x >= 47 && x <= 54 && x !== 50 && x !== 51) || (x >= 63 && x <= 96) || (x >= 132 && x <= 166 && !(x >= 148 && x <= 150));
// mastene: { x: midten, y0: toppen, y1: nederste rad, b: bredde nederst, armer: [[rad, halv bredde]] }. Armene er plattformer.
const STAAL = new Set();
MASTER.push(
  { x: 40.5, y0: 86, y1: 99, b: 4, armer: [[90, 2.5], [95, 3.5]] },
  { x: 57, y0: 82, y1: 99, b: 4, armer: [[87, 2], [92, 3], [96, 2]] },
  { x: 99.5, y0: 82, y1: 99, b: 4, armer: [[87, 2.5], [92, 3.5], [96, 2.5]] },
  { x: 113.5, y0: 78, y1: 99, b: 5, armer: [[84, 5.5], [88, 4.5], [92, 3.5], [96, 2.5]] },
  { x: 149.5, y0: 85, y1: 96, b: 3, armer: [[89, 1.5], [93, 2.5]] },
  { x: 177.5, y0: 88, y1: 99, b: 4, armer: [[91, 1.5], [95, 2.5]] },
  { x: 190.5, y0: 88, y1: 99, b: 4, armer: [[91, 1.5], [95, 2.5]] });
// ledningene mellom mastene: fra armene på den ene til armene på den neste, med litt heng
function ledningsSpenn(a, b, i) {
  const [ra, ha] = a.armer[i], [rb, hb] = b.armer[i];
  const xa = (a.x + ha) * T - 5, ya = ra * T + 27, xb = (b.x - hb) * T + 5, yb = rb * T + 27;
  return { xa, ya, xb, yb, heng: (xb - xa) * .055 };
}
const spennY = (s, x) => { const t = clamp((x - s.xa) / (s.xb - s.xa), 0, 1); return lerp(s.ya, s.yb, t) + s.heng * 4 * t * (1 - t); };
const SPENN = [];
for (let i = 0; i + 1 < MASTER.length; i++) { const a = MASTER[i], b = MASTER[i + 1]; if (a.y0 < LY0) continue;
  for (let k = 0; k < Math.min(2, a.armer.length, b.armer.length); k++) SPENN.push(ledningsSpenn(a, b, k)); }
// kroker som henger i den midterste ledningen over juvet
{ const s = ledningsSpenn(MASTER[1], MASTER[2], 1);
  for (const x of [65, 70, 75, 80, 85, 90, 94]) { const ly = spennY(s, x * T + T / 2), k = [x, (ly + 1.3 * T) / T]; k.linje = true; k.ly = ly; KROKER.push(k); } }

function byggLinja() {
  for (let x = 4; x <= 198; x++) { const g = linjaBakke(x); rect(x, LY0, x, g - 1, AIR); if (linjaGrop(x)) setT(x, g - 1, HAZ); }
  rect(3, 101, 3, 104, AIR);                        // nisjen med porten tilbake til byen
  rect(63, 57, 66, 60, AIR);                        // tunnelen fra bunnen av fallrøret i kraftverket
  // gjemmested: en hule i veggen nede i juvet, med en hylle foran
  rect(55, 106, 62, 109, AIR); rect(63, 110, 65, 113, SOL);
  // hylla nede i Vindskaret der jordingsstanga havnet
  rect(161, 110, 164, 114, SOL);
  STAAL.clear();
  for (const m of MASTER) for (const [r, hb] of m.armer) for (let x = Math.round(m.x - hb); x <= Math.round(m.x + hb) - 1; x++) if (tile(x, r) === AIR) { setT(x, r, ONE); STAAL.add(x + ',' + r); }
}
OMRAADER.push({ navn: 'Høyspentlinja', kart: [], bygg: byggLinja });

// ---------- porter, figurer og sideoppdrag ----------
PORTER.push({ x: 66, y0: 57, y1: 60, til: [5, 104], krav: () => S.boss4, stengt: 'Porten er låst. Generatoren må stanses først.' },
  { x: 3, y0: 101, y1: 104, til: [65, 60], krav: () => true });
FIGURER.push({ id: 'ivar', x: 12, y: 104, navn: 'Gamle Ivar', drakt: { bukse: '#2b3550', jakke: '#d8642a', refleks: true, skjegg: true, hjelm: '#e8e8ea' },
  harNytt: () => !S.oppdrag.jord || S.oppdrag.jord === 2,
  replikk() { const s = S.oppdrag.jord || 0;
    if (s === 0) return { linjer: ['Hei, unge montør! Jeg er Ivar. Jeg har gått langs denne linja i førti år.', 'Stormen tok jordingsstanga mi. Den blåste ned i Vindskaret, langt der borte.',
      'Uten den kan ingen jobbe trygt på linja. Finner du den, får du noe fint av meg.'], ferdig: () => { S.oppdrag.jord = 1; lagre(); sjekkMaal(true); } };
    if (s === 1) return { linjer: ['Jordingsstanga ligger nede i Vindskaret. Pass deg for vindkastene!'] };
    if (s === 2) return { linjer: ['Der er den jo! Tusen takk.', 'Før vi jobber på en linje, kobler vi den ut. Så jorder og kortslutter vi den på alle sider der den kan bli spenningssatt.',
      'Her, ta denne. Den gjør lynpisken din lengre.'], ferdig: () => { S.oppdrag.jord = 3; S.kjop.pisk2 = true; lyd('evne'); toast('Lengre lynpisk!'); lagre(); hud(); sjekkMaal(true); } };
    return { linjer: [S.boss5 ? 'Stormen har roet seg. Nå kan vi endelig jobbe på linja igjen.' : 'Ta vare på deg selv der ute. Det er noe som lyser på toppmasta.'] }; } },
  { id: 'berit', x: 63, y: 60, navn: 'Vaktmester Berit', drakt: { bukse: '#3a3a44', jakke: '#3f6a8a', refleks: false, skjegg: false, hjelm: '#f2c23c' },
    replikk() {
      if (!S.boss4) return { linjer: ['Hei! Jeg er Berit, vaktmester her nede.', 'Bak porten går en gammel tunnel opp til høyspentlinja.', 'Men den åpner seg ikke før Generatoren er stanset.'] };
      if (!S.boss5) return { linjer: ['Porten er åpen! Tunnelen går opp til høyspentlinja.', 'Det stormer der oppe. De sier en fugl av lyn har slått seg ned på toppmasta.'] };
      return { linjer: ['Lynfuglen er borte? Da kan linjearbeiderne endelig komme seg ut igjen.'] }; } });
GJENSTANDER.push({ oppdrag: 'jord', x: 163, y: 109, funnet: 'Du fant jordingsstanga til Ivar!', tegn() {
  ctx.fillStyle = '#c9a43a'; ctx.fillRect(-2, -22, 4, 44); ctx.fillStyle = '#2a2a30'; ctx.fillRect(-2.5, -6, 5, 12);
  ctx.fillStyle = '#e8e8ea'; ctx.fillRect(-6, -24, 12, 3); ctx.strokeStyle = '#3fae5a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 20); ctx.quadraticCurveTo(10, 28, 4, 34); ctx.stroke(); } });

// ---------- vind ----------
VINDSONER.push({ x0: 44, x1: 62, y0: LY0, y1: 105, dir: -1 }, { x0: 63, x1: 96, y0: LY0, y1: 113, dir: 1 }, { x0: 132, x1: 166, y0: LY0, y1: 114, dir: 1 });
OPPVIND.push({ x0: 141, x1: 144, y0: 85, y1: 114 }, { x0: 156, x1: 159, y0: 85, y1: 114 });

// ---------- sjekkpunkt, funn, fagkort, lysorber og fiender (legges bakerst, så gamle indekser stemmer) ----------
SJEKK.push({ x: 6, y: 104 }, { x: 60, y: 99 }, { x: 104, y: 99 }, { x: 128, y: 99 }, { x: 169, y: 99 });
VERKSTED.push(14);
IKON.glid = '<svg viewBox="0 0 24 24"><path d="M1 10C5 3 19 3 23 10c-4-2-7-2-11 0-4-2-7-2-11 0zM5 10l6 8M19 10l-6 8M12 10v8M9 18h6v4H9z"/></svg>';
FUNN.push({ id: 'glid', x: 113, y: 83, navn: 'Glideskjerm', tekst: 'En skjerm av isolasjonsduk. Seil langt, og la oppvinden løfte deg.',
  pc: 'Hold <b>Mellomrom</b> mens du faller', mob: 'Hold <b>Hopp</b> mens du faller' },
  { id: 'liv6', x: 184, y: 99, boss5: true, navn: 'Livsgnist', liten: true });
FAG.push(
  { x: 28, y: 101, tittel: 'Høy spenning i lange linjer', tekst: 'Strømmen sendes langt med høy spenning. For samme effekt gir høyere spenning lavere strøm, og da blir varmetapet i ledningene mye mindre.' },
  { x: 57, y: 86, tittel: 'Jording ved linjearbeid', tekst: 'Før arbeid på en frakoblet linje skal den jordes og kortsluttes på alle sider der den kan bli spenningssatt. Da er du beskyttet om noen kobler inn ved en feil.' },
  { x: 77, y: 99, tittel: 'Avstand til høyspent', tekst: 'Strøm kan slå over gjennom lufta fra en høyspentledning. Hold god avstand, og kom aldri nær med stige, kran eller fiskestang.' },
  { x: 113, y: 87, tittel: 'Lynvern', tekst: 'Et lynvernanlegg leder lynet trygt ned i jorda gjennom fangstledere, nedledere og jordelektroder. Overspenningsvern beskytter det elektriske anlegget inne.' },
  { x: 149, y: 96, tittel: 'Isolatorer', tekst: 'Isolatorer av glass, porselen eller kompositt holder ledningene borte fra masta. Jo høyere spenning, jo lengre isolatorkjede trengs.' },
  { x: 58, y: 109, tittel: 'Skrittspenning', tekst: 'Faller en ledning ned, sprer spenningen seg i bakken rundt. Mellom føttene kan det bli farlig spenning. Hold god avstand og ring 112.' });
ORBER.push([9, 104], [18, 103], [27, 100], [36, 98], [40, 89], [43, 94], [50, 99], [58, 95], [55, 86], [68, 98], [73, 99], [83, 99], [88, 98],
  [99, 86], [106, 98], [110, 83], [117, 83], [124, 98], [138, 93], [142, 88], [157, 90], [162, 109], [56, 108], [60, 108], [170, 98], [186, 99], [192, 99]);
FIENDE_DEF.push({ x0: 15, x1: 22, y: 103 }, { type: 'jager', x: 28, y: 95 }, { type: 'skjold', x0: 31, x1: 45, y: 99 }, { type: 'sveve', x: 51, y: 96, ax: 2, ay: 1 },
  { type: 'jager', x: 77, y: 90 }, { type: 'skytter', x: 108, y: 99 }, { x0: 118, x1: 127, y: 99 }, { type: 'skytter', x: 129, y: 99 }, { type: 'sveve', x: 153, y: 92, ax: 2, ay: 2 },
  { type: 'skjold', x0: 56, x1: 62, y: 109 });

// ---------- himmelen over fjellet ----------
let LBG = null;
const LYNBLINK = { t: 5, a: 0, x: .5, seed: 1 };
function lagLinjaBg() {
  const himmel = nyC(LW, LH), g = himmel.getContext('2d'), r = rng(51);
  let gr = g.createLinearGradient(0, 0, 0, LH);
  gr.addColorStop(0, '#04060f'); gr.addColorStop(.45, '#0d1530'); gr.addColorStop(.75, '#1d2848'); gr.addColorStop(1, '#2e3758');
  g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  for (let i = 0; i < 160; i++) { const x = r() * LW, y = r() * LH * .5, a = (.15 + r() * .5) * (1 - y / (LH * .55)); g.fillStyle = `rgba(220,232,255,${a})`; g.fillRect(x, y, 1.4, 1.4); }
  const mx = LW * .3, my = LH * .17;
  myk(g, mx, my, 360, 360, '170,195,240', .16); gr = g.createRadialGradient(mx - 8, my - 8, 3, mx, my, 40); gr.addColorStop(0, '#fbfdff'); gr.addColorStop(.85, '#d6e0f5'); gr.addColorStop(1, 'rgba(214,224,245,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(mx, my, 40, 0, 7); g.fill();
  // tunge skyer: mørke under, månelys i kanten
  for (let i = 0; i < 46; i++) { const x = r() * LW, y = LH * (.04 + r() * .42), w = 160 + r() * 420, h = 30 + r() * 70;
    myk(g, x, y, w, h, '8,12,26', .45 + r() * .35); myk(g, x - w * .2, y - h * .45, w * .7, h * .4, '120,145,200', .06 + r() * .06); }
  const fjern = flislag((g, r) => {
    // fjerne fjell med snø på toppene
    const top = x => 470 - 120 * Math.sin(x / LW * Math.PI * 2 * 2 + 1) - 70 * Math.sin(x / LW * Math.PI * 2 * 5 + 2) - 30 * Math.sin(x / LW * Math.PI * 2 * 11);
    g.fillStyle = '#18223a'; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 8) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    // snøen ligger over en snøgrense, med ujevn underkant
    g.fillStyle = 'rgba(205,220,245,.5)'; g.beginPath(); g.moveTo(0, top(0));
    for (let x = 0; x <= LW; x += 8) g.lineTo(x, top(x));
    for (let x = LW; x >= 0; x -= 8) { const y = top(x); g.lineTo(x, y + Math.max(0, 430 - y) * (.18 + .1 * Math.sin(x * .07) + .05 * Math.sin(x * .23))); }
    g.closePath(); g.fill();
    const gr = g.createLinearGradient(0, 400, 0, 700); gr.addColorStop(0, 'rgba(60,80,120,0)'); gr.addColorStop(1, 'rgba(60,80,120,.5)'); g.fillStyle = gr; g.fillRect(0, 400, LW, 300);
  }, 61);
  const midt = flislag((g, r) => {
    const top = x => 590 - 70 * Math.sin(x / LW * Math.PI * 2 * 3 + .5) - 40 * Math.sin(x / LW * Math.PI * 2 * 7 + 1.3);
    g.fillStyle = '#0f1628'; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 6) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    g.fillStyle = 'rgba(190,210,240,.3)'; g.beginPath(); g.moveTo(0, top(0));
    for (let x = 0; x <= LW; x += 6) g.lineTo(x, top(x));
    for (let x = LW; x >= 0; x -= 6) { const y = top(x); g.lineTo(x, y + Math.max(0, 575 - y) * (.25 + .12 * Math.sin(x * .09))); }
    g.closePath(); g.fill();
    // en rekke kraftmaster langt borte
    for (let i = 0; i < 4; i++) { const x = 200 + i * 400, y = top(x), h = 110;
      g.strokeStyle = '#0a0f1c'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 14, y + 4); g.lineTo(x - 3, y - h); g.lineTo(x + 3, y - h); g.lineTo(x + 14, y + 4); g.stroke();
      g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k < 5; k++) { const ya = y - h + k * h / 5, yb = ya + h / 5; g.moveTo(x - 3 - k * 2, ya); g.lineTo(x + 5 + k * 2, yb); } g.stroke();
      g.lineWidth = 3; g.beginPath(); g.moveTo(x - 24, y - h + 18); g.lineTo(x + 24, y - h + 18); g.moveTo(x - 18, y - h + 36); g.lineTo(x + 18, y - h + 36); g.stroke();
      const nx = x + 400, ny = top(nx) - h + 22;
      g.strokeStyle = 'rgba(10,15,28,.9)'; g.lineWidth = 1.2; for (const dy of [0, 18]) { g.beginPath(); g.moveTo(x + 22, y - h + 22 + dy); g.quadraticCurveTo(x + 200, Math.max(y, ny) - h + 70 + dy, nx - 22, ny + dy); g.stroke(); } }
  }, 62);
  const naer = flislag((g, r) => {
    // granskog i silhuett
    const top = x => 760 - 40 * Math.sin(x / LW * Math.PI * 2 * 2 + 3) - 18 * Math.sin(x / LW * Math.PI * 2 * 9);
    g.fillStyle = '#060a14'; g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 10) g.lineTo(x, top(x)); g.lineTo(LW, LH); g.fill();
    for (let x = 0; x < LW; x += 14 + r() * 22) { const y = top(x) + 6, h = 50 + r() * 90, b = h * .32;
      g.beginPath(); g.moveTo(x, y - h); for (let k = 1; k <= 5; k++) { const yy = y - h + h * k / 5, bb = b * k / 5; g.lineTo(x + bb, yy); g.lineTo(x + bb * .45, yy); } g.lineTo(x + 2, y + 4);
      g.lineTo(x - 2, y + 4); for (let k = 5; k >= 1; k--) { const yy = y - h + h * k / 5, bb = b * k / 5; g.lineTo(x - bb * .45, yy); g.lineTo(x - bb, yy); } g.closePath(); g.fill();
      g.fillStyle = 'rgba(200,215,240,.18)'; for (let k = 1; k <= 4; k++) { const yy = y - h + h * k / 5, bb = b * k / 5; g.fillRect(x - bb * .9, yy - 1.5, bb * .9, 1.5); } g.fillStyle = '#060a14'; }
  }, 63);
  return { himmel, fjern, midt, naer };
}
function tegnLinjaBg(kx, ky) {
  if (!LBG) LBG = lagLinjaBg();
  const cw = cv.width, ch = cv.height, vh = cssH / skala, t = clamp((ky - LY0 * T) / Math.max(1, 46 * T - vh), 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(LBG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .05, -(LH * hk - ch) * (.2 + t * .5), LW * hk, LH * hk);
  // skyer som jager av sted i stormen
  for (let i = 0; i < 4; i++) { const w = cw * (.8 + i * .25), x = (((-S.t * (30 + i * 14) * dpr + i * cw * .41 - kx * skala * dpr * .04) % (cw + w)) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .1 + i * .02; ctx.drawImage(TAKE, x, ch * (.06 + i * .09) - w * .19, w, w * .375); }
  ctx.globalAlpha = 1;
  if (LYNBLINK.a > 0) { const a = LYNBLINK.a, lx = LYNBLINK.x * cw; ctx.fillStyle = `rgba(170,190,255,${a * .22})`; ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = `rgba(235,240,255,${a})`; ctx.lineWidth = 2.2 * dpr; ctx.save(); ctx.globalCompositeOperation = 'lighter'; jagget(lx, 0, lx + (hs(LYNBLINK.seed, 1, 2) - .5) * cw * .2, ch * .5, 26 * dpr, 12, LYNBLINK.seed); ctx.restore(); }
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch;
  const lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lagX0 = p => { let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; return x0; };
  const lag = (bilde, p, pv) => { const y = lagY(pv); for (let x = lagX0(p); x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); };
  lag(LBG.fjern, .06, .25); lag(LBG.midt, .2, .5);
  // blinkende lys på mastene langt borte
  { const y0 = lagY(.5), blink = Math.sin(S.t * 2.2) > .3 ? 1 : .2; ctx.globalCompositeOperation = 'lighter';
    for (let x = lagX0(.2); x < cw + lw; x += lw) for (let i = 0; i < 4; i++) { const mx = 200 + i * 400, sx = x + mx * k, sy = y0 + (590 - 70 * Math.sin(mx / LW * Math.PI * 6 + .5) - 40 * Math.sin(mx / LW * Math.PI * 14 + 1.3) - 112) * k;
      if (sx > -40 && sx < cw + 40) glod(SPR.r, sx, sy, 10 * k, .8 * blink); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  lag(LBG.naer, .45, .8);
  for (let i = 0; i < 2; i++) { const w = cw * 1.2, x = ((-S.t * (40 + i * 20) * dpr - kx * skala * dpr * (.6 + i * .1) + i * w * .5) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .08; ctx.drawImage(TAKE, x, ch * (.6 + i * .14), w, w * .25); }
  ctx.globalAlpha = 1;
}
// snø som driver foran alt, i vindens retning
const SNO = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), z: .4 + Math.random() * .9, ph: Math.random() * 6.28 }));
function tegnSno() {
  if (cam.y < LY0 * T - 10) return;
  const cw = cv.width, ch = cv.height, v = vindSone(P.x + P.w / 2, P.y + P.h / 2), dir = v ? v.dir : -1, drift = (-.25 + dir * (.35 + VIND.styrke * 1.4));
  ctx.fillStyle = '#e8f0ff';
  for (const s of SNO) { const sx = ((s.x * cw + S.t * drift * 160 * s.z * dpr - cam.x * skala * dpr * s.z * .5 + Math.sin(S.t * 1.3 + s.ph) * 10 * dpr) % (cw + 20) + cw + 20) % (cw + 20) - 10;
    const sy = ((s.y * ch + S.t * 70 * s.z * dpr - cam.y * skala * dpr * s.z * .5) % (ch + 20) + ch + 20) % (ch + 20) - 10, r = (1 + s.z * 1.6) * dpr;
    ctx.globalAlpha = .25 + s.z * .3; ctx.fillRect(sx, sy, r, r); }
  ctx.globalAlpha = 1;
}
// ledninger, kroker i linja og strømgardinene i arenaen
function tegnLedninger() {
  const sv = Math.sin(S.t * 1.7) * (4 + VIND.styrke * 10);
  ctx.strokeStyle = '#0d121c'; ctx.lineWidth = 2;
  for (const s of SPENN) { if (!synlig((s.xa + s.xb) / 2, s.ya, Math.abs(s.xb - s.xa) / 2 + 100)) continue;
    ctx.beginPath(); ctx.moveTo(s.xa, s.ya); ctx.quadraticCurveTo((s.xa + s.xb) / 2, (s.ya + s.yb) / 2 + s.heng * 2 + sv, s.xb, s.yb); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(170,200,235,.16)'; ctx.lineWidth = 1;
  for (const s of SPENN) { if (!synlig((s.xa + s.xb) / 2, s.ya, Math.abs(s.xb - s.xa) / 2 + 100)) continue;
    ctx.beginPath(); ctx.moveTo(s.xa, s.ya - 1); ctx.quadraticCurveTo((s.xa + s.xb) / 2, (s.ya + s.yb) / 2 + s.heng * 2 + sv - 1, s.xb, s.yb - 1); ctx.stroke(); }
  for (const kol of [171, 197]) if (tile(kol, 99) === DOOR && synlig(kol * T, 92 * T, 200)) { const X = (kol + .5) * T;
    ctx.strokeStyle = 'rgba(160,230,255,.75)'; ctx.lineWidth = 2; for (let i = 0; i < 2; i++) jagget(X + (i - .5) * 6, cam.y - 20, X - (i - .5) * 6, 100 * T, 7, 14, (S.frame >> 2) * 7 + i + kol); }
}
function ledningsGlod() {
  for (const kol of [171, 197]) if (tile(kol, 99) === DOOR && synlig(kol * T, 92 * T, 200)) for (let y = 88; y <= 99; y += 3) glod(SPR.c, (kol + .5) * T, y * T, 50, .4);
}

// ---------- Lynfuglen ----------
const ARENA5 = { x0: 172, x1: 196, gulv: 100, midt: 184.5 };
B5.lyn = [];
const b5Fase = () => B5.hp >= 4 ? 1 : B5.hp === 3 ? 2 : 3;
function aapneArena5() { for (const kol of [171, 197]) if (tile(kol, 99) === DOOR) rect(kol, LY0, kol, 99, AIR); }
function resetBoss5() { Object.assign(B5, { aktiv: false, fase: '', hp: S.boss5 ? 0 : 4, stun: 0, dod: 0, tilstand: '', tT: 0 }); B5.lyn.length = 0; aapneArena5(); hud(); }
function startBoss5() {
  Object.assign(B5, { aktiv: true, fase: 'intro', introT: 2.4, hp: 4, t: 0, x: ARENA5.midt * T, y: 76 * T, tilstand: 'sirkel', tT: 2.4, lynT: 2, vx: 0, vy: 0, dobbel: 0, banner: false });
  B5.lyn.length = 0; rect(171, LY0, 171, 99, DOOR); rect(197, LY0, 197, 99, DOOR); lyd('dor'); lyd('torden'); S.shake = .5; P.vx = 0; LYNBLINK.a = 1; hud();
}
function nyttLyn(x) { B5.lyn.push({ x: clamp(x, (ARENA5.x0 + .5) * T, (ARENA5.x1 + .5) * T), varsel: .95 / NG(), aktiv: 0, seed: (Math.random() * 1e6) | 0 }); lyd('varsel'); }
function b5Treff() {
  B5.hp--; lyd('b2treff'); S.shake = .5; S.flash = .45; S.flashF = '200,230,255'; vib(50); sprut(B5.x, B5.y, 40, 'c', 300); gnister(B5.x, B5.y, 16, 'w'); hud();
  if (B5.hp <= 0) { B5.fase = 'dod'; B5.dod = 2.6; S.slow = .9; lyd('bossdod'); B5.lyn.length = 0; return; }
  B5.tilstand = 'opp'; B5.tT = .7; if (B5.hp === 3) hint(null, 'Lynfuglen kaller ned lyn! Se etter lyset på bakken.', 3.5);
}
function sluttBoss5() {
  S.boss5 = true; B5.aktiv = false; B5.fase = ''; aapneArena5(); S.flash = 1; S.flashF = '220,235,255'; sprut(B5.x, B5.y, 100, 'c', 420); ring(B5.x, B5.y, 30, 'h', 380); lyd('slutt'); vib([40, 60, 120]);
  banner('Stormen har stilnet', 'Lynfuglen er slått', 3.5); lagre(); hud(); sjekkMaal(true);
}
function oppdaterBoss5(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  if (!B5.aktiv) { if (!S.boss5 && S.dod <= 0 && !S.overgang && pcx > 174 * T && pcx < 196 * T && pcy > 80 * T && pcy < 101 * T) startBoss5(); return; }
  B5.t += dt;
  for (let i = B5.lyn.length - 1; i >= 0; i--) { const l = B5.lyn[i];
    if (l.varsel > 0) { l.varsel -= dt; if (l.varsel <= 0) { l.aktiv = .28; lyd('torden'); S.shake = Math.max(S.shake, .3); LYNBLINK.a = .6; gnister(l.x, ARENA5.gulv * T - 4, 14, 'c'); } }
    else { l.aktiv -= dt; if (Math.abs(l.x - pcx) < 14 + P.w / 2 && S.dod <= 0) skade(l.x, false); if (l.aktiv <= 0) B5.lyn.splice(i, 1); } }
  if (B5.fase === 'intro') { B5.introT -= dt; B5.x += (ARENA5.midt * T - B5.x) * Math.min(1, dt * 2); B5.y += (89 * T - B5.y) * Math.min(1, dt * 2);
    if (!B5.banner && B5.introT < 1.8) { B5.banner = true; lyd('lynfugl'); S.shake = .7; banner('Lynfuglen', 'Toppmasta', 2.4); }
    if (B5.introT <= 0) { B5.fase = 'kamp'; hud(); hint(null, 'Vent til den stuper ned i bakken. Slå til mens den er ør!', 4); } return; }
  if (B5.fase === 'dod') { B5.dod -= dt; B5.y += 40 * dt; if (Math.random() < dt * 30) gnister(B5.x + (Math.random() - .5) * 40, B5.y + (Math.random() - .5) * 30, 3, 'c'); if (B5.dod <= 0) sluttBoss5(); return; }
  const f = b5Fase(), ng = NG(); B5.tT -= dt * ng;
  const st = B5.tilstand;
  if (st === 'sirkel') { const a = B5.t * (.8 + f * .15), mx = ARENA5.midt * T + Math.sin(a) * 9 * T, my = 89 * T + Math.sin(a * 2) * 1.6 * T;
    B5.vx = (mx - B5.x); B5.x += (mx - B5.x) * Math.min(1, dt * 3); B5.y += (my - B5.y) * Math.min(1, dt * 3);
    if (f >= 2) { B5.lynT -= dt * ng; if (B5.lynT <= 0) { B5.lynT = f === 3 ? 1.6 : 2.3; nyttLyn(pcx + (Math.random() - .5) * 3 * T); } }
    if (B5.tT <= 0) { B5.tilstand = 'varsel'; B5.tT = f === 3 ? .75 : .95; B5.mx = clamp(pcx, (ARENA5.x0 + 1) * T, ARENA5.x1 * T); B5.my = ARENA5.gulv * T - 18; B5.dobbel = f === 3 ? 1 : 0; lyd('lynfugl'); } }
  else if (st === 'varsel') { B5.y -= 50 * dt; B5.vx = B5.mx - B5.x;
    if (B5.tT <= 0) { B5.tilstand = 'stup'; const dx = B5.mx - B5.x, dy = B5.my - B5.y, l = Math.hypot(dx, dy) || 1; B5.vx = dx / l * 860 * ng; B5.vy = dy / l * 860 * ng; lyd('stot'); } }
  else if (st === 'stup') { B5.x += B5.vx * dt; B5.y += B5.vy * dt; if (Math.random() < .8) part(B5.x, B5.y, -B5.vx * .1, -B5.vy * .1, .35, 9, 'c', 0);
    if (B5.y >= B5.my) { B5.y = B5.my; B5.x = clamp(B5.x, (ARENA5.x0 + .5) * T, (ARENA5.x1 + .5) * T); S.shake = .45; lyd('slag'); vib(30); stov(B5.x, ARENA5.gulv * T, 14, 1.4); ring(B5.x, ARENA5.gulv * T - 6, 16, 'c', 260, .3);
      if (B5.dobbel > 0) { B5.dobbel--; B5.tilstand = 'hopp'; B5.tT = .45; } else { B5.tilstand = 'bakke'; B5.tT = 2.3; } } }
  else if (st === 'hopp') { B5.y += (88 * T - B5.y) * Math.min(1, dt * 6); if (B5.tT <= 0) { B5.tilstand = 'varsel'; B5.tT = .6; B5.mx = clamp(pcx, (ARENA5.x0 + 1) * T, ARENA5.x1 * T); lyd('lynfugl'); } }
  else if (st === 'bakke') { if (Math.random() < dt * 8) gnister(B5.x + (Math.random() - .5) * 30, B5.y - 10, 2, 'w'); if (B5.tT <= 0) { B5.tilstand = 'opp'; B5.tT = .8; } }
  else if (st === 'opp') { B5.y += (89 * T - B5.y) * Math.min(1, dt * 3); if (B5.tT <= 0) { B5.tilstand = 'sirkel'; B5.tT = f === 1 ? 2.6 : f === 2 ? 2.2 : 1.8; } }
  // treff: bare mens den ligger ør på bakken. Ellers gjør den vondt å komme borti.
  if (S.dod > 0) return;
  const naer = Math.abs(pcx - B5.x) < 24 + P.w / 2 && Math.abs(pcy - B5.y) < 20 + P.h / 2;
  if (B5.tilstand === 'bakke') {
    const pisk = P.piskT > 0 ? piskOmraade() : null;
    const piskTraff = pisk && B5.x > pisk.x0 - 20 && B5.x < pisk.x1 + 20 && B5.y > pisk.y0 - 20 && B5.y < pisk.y1 + 20;
    const trakk = naer && P.vy > 0 && P.y + P.h < B5.y;
    if (piskTraff || (naer && P.dashT > 0) || trakk) { if (trakk) { P.vy = -480; P.air = S.ev.dobbel ? 1 : 0; P.canDash = true; } if (piskTraff) P.piskTraff = true; b5Treff(); }
  } else if (naer && st !== 'opp') skade(B5.x, false);
}
function tegnBoss5() {
  if (!B5.aktiv) return; const X = B5.x, Y = B5.y, st = B5.tilstand, bakke = st === 'bakke' && B5.fase === 'kamp';
  // varsel: en linje dit den skal stupe, og en ring på bakken
  if (st === 'varsel' && B5.fase === 'kamp') { const a = .5 + .5 * Math.sin(S.t * 30);
    ctx.strokeStyle = `rgba(255,90,70,${.35 + a * .4})`; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(B5.mx, B5.my); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(255,120,90,${.6 + a * .3})`; ctx.beginPath(); ctx.ellipse(B5.mx, ARENA5.gulv * T - 2, 26, 6, 0, 0, 7); ctx.stroke(); }
  for (const l of B5.lyn) { if (l.varsel > 0) { const a = 1 - l.varsel / .95; ctx.fillStyle = `rgba(150,220,255,${.15 + a * .35})`; ctx.fillRect(l.x - 14, ARENA5.gulv * T - 6, 28, 6);
      ctx.strokeStyle = `rgba(150,220,255,${a * .5})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l.x, cam.y); ctx.lineTo(l.x, ARENA5.gulv * T); ctx.stroke(); }
    else { ctx.strokeStyle = '#f4fbff'; ctx.lineWidth = 4; jagget(l.x, cam.y - 20, l.x, ARENA5.gulv * T, 16, 12, l.seed); ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = 9; ctx.globalAlpha = .35; jagget(l.x, cam.y - 20, l.x, ARENA5.gulv * T, 16, 12, l.seed); ctx.globalAlpha = 1; } }
  const a = B5.fase === 'dod' ? clamp(B5.dod / 2.6, 0, 1) : 1; ctx.globalAlpha = a;
  const dir = st === 'stup' ? Math.sign(B5.vx) || 1 : (P.x + P.w / 2 < X ? -1 : 1);
  ctx.save(); ctx.translate(X, Y); ctx.scale(dir, 1); if (st === 'stup') ctx.rotate(Math.atan2(B5.vy, Math.abs(B5.vx)) * .8);
  const fl = bakke ? -.3 : st === 'stup' ? -.9 : Math.sin(B5.t * 9), rist = bakke ? Math.sin(S.t * 40) * 1 : 0;
  const vinge = (bak) => { const yTip = -8 - 30 * fl, xTip = -34 + (st === 'stup' ? -10 : 0);
    ctx.fillStyle = bak ? '#14304e' : '#2a6aa0'; ctx.beginPath(); ctx.moveTo(4, -6); ctx.lineTo(-6, yTip * .55 - 6); ctx.lineTo(xTip * .55, yTip - 2); ctx.lineTo(xTip * .7, yTip * .7 + 2); ctx.lineTo(xTip, yTip + 6);
    ctx.lineTo(xTip * .8, yTip * .4 + 6); ctx.lineTo(xTip * .55, 2); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = bak ? 'rgba(120,200,255,.35)' : 'rgba(200,245,255,.9)'; ctx.lineWidth = 1.3; ctx.stroke();
    if (!bak) { ctx.strokeStyle = 'rgba(214,140,70,.75)'; ctx.lineWidth = 1; ctx.beginPath(); for (const k of [.55, .75, 1]) { ctx.moveTo(2, -4); ctx.lineTo(xTip * k, (yTip + 4) * k - 2 * (1 - k)); } ctx.stroke();
      ctx.fillStyle = '#c9c2b0'; for (const k of [.35, .65]) { ctx.beginPath(); ctx.arc(xTip * k * .9, yTip * k * .8, 1.6, 0, 7); ctx.fill(); } } };
  ctx.save(); ctx.translate(2, -3); ctx.scale(.85, .85); vinge(true); ctx.restore();
  // halen: lynformede fjær
  ctx.fillStyle = '#1d4a78'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-30, -4); ctx.lineTo(-24, 2); ctx.lineTo(-34, 6); ctx.lineTo(-22, 7); ctx.lineTo(-28, 12); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(170,235,255,.8)'; ctx.lineWidth = 1; ctx.stroke();
  for (let k = 0; k < 3; k++) { ctx.fillStyle = k % 2 ? '#a77a52' : '#c49468'; ctx.beginPath(); ctx.ellipse(-36 - k * 5, 5 + k * 2 + Math.sin(B5.t * 6 + k) * 1.5, 2.6, 3.4, 0, 0, 7); ctx.fill(); }
  const gr = ctx.createLinearGradient(0, -12, 0, 10); gr.addColorStop(0, '#5fb8ec'); gr.addColorStop(1, '#173a63'); ctx.fillStyle = gr;
  ctx.beginPath(); ctx.ellipse(rist, 0, 16, 10, -.1, 0, 7); ctx.fill(); ctx.strokeStyle = st === 'varsel' ? `rgba(255,${110 + 80 * Math.sin(S.t * 30)},90,1)` : 'rgba(220,250,255,.85)'; ctx.lineWidth = st === 'varsel' ? 2 : 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(10,30,50,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(rist - 6, -9); ctx.quadraticCurveTo(rist - 9, 0, rist - 5, 9); ctx.moveTo(rist + 3, -10); ctx.quadraticCurveTo(rist, 0, rist + 4, 9.5); ctx.stroke();
  nagler([[rist - 11, -2], [rist - 1, 5], [rist + 8, -2]], 1);
  ctx.fillStyle = '#3d8cc6'; ctx.beginPath(); ctx.arc(14 + rist, -7, 7.5, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffd35a'; ctx.beginPath(); ctx.moveTo(20, -9); ctx.lineTo(29, -6); ctx.lineTo(20, -3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = bakke ? '#cfe' : '#fff'; ctx.beginPath(); ctx.arc(16 + rist, -8.5, 2.4, 0, 7); ctx.fill();
  if (!bakke) { ctx.fillStyle = st === 'varsel' ? '#ff4a3a' : '#1a2a50'; ctx.beginPath(); ctx.arc(16.6 + rist, -8.5, 1.2, 0, 7); ctx.fill(); }
  // toppen: tre små lyn
  ctx.strokeStyle = '#fff3a0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(10, -14); ctx.lineTo(8, -20); ctx.lineTo(11, -19); ctx.lineTo(9, -26); ctx.moveTo(14, -14); ctx.lineTo(15, -22); ctx.stroke();
  vinge(false);
  ctx.restore();
  if (bakke) { ctx.strokeStyle = 'rgba(255,240,170,.85)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const v = S.t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(X + Math.cos(v) * 16, Y - 24 + Math.sin(v) * 4, 2.5, 0, 7); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
function boss5Glod() {
  if (!B5.aktiv) return; const a = B5.fase === 'dod' ? clamp(B5.dod / 2.6, 0, 1) : 1;
  glod(SPR.c, B5.x, B5.y, 110 + Math.sin(S.t * 8) * 10, .5 * a); glod(SPR.h, B5.x + 10, B5.y - 6, 12, .5 * a);
  if (B5.tilstand === 'stup') for (let i = 1; i < 6; i++) glod(SPR.c, B5.x - B5.vx * .012 * i, B5.y - B5.vy * .012 * i, 50 - i * 6, .5 - i * .07);
  for (const l of B5.lyn) if (l.varsel <= 0) { for (let y = ARENA5.gulv * T; y > cam.y - 40; y -= 90) glod(SPR.c, l.x, y, 80, .6); glod(SPR.h, l.x, ARENA5.gulv * T - 6, 40, 1); }
    else glod(SPR.c, l.x, ARENA5.gulv * T - 4, 30 + (1 - l.varsel) * 30, .5);
}

// ---------- registrering ----------
BOSSER.push({ navn: 'Lynfuglen', aktiv: () => B5.aktiv, hp: () => B5.hp, maks: 4, kamp: () => B5.fase === 'kamp' || B5.fase === 'dod' });
OPPDATER.push(dt => {
  oppdaterBoss5(dt);
  if (spillerSone() === 1) { LYNBLINK.t -= dt; LYNBLINK.a = Math.max(0, LYNBLINK.a - dt * 2.2);
    if (LYNBLINK.t <= 0) { LYNBLINK.t = 7 + Math.random() * 9; LYNBLINK.a = 1; LYNBLINK.x = .1 + Math.random() * .8; LYNBLINK.seed = (Math.random() * 1e6) | 0; setTimeout(() => lyd('torden'), 500 + Math.random() * 700); } }
});
TILBAKESTILL.push(() => { if (B5.aktiv && !S.boss5) resetBoss5(); });
TEGN_VERDEN.unshift(tegnLedninger);
TEGN_VERDEN.push(tegnBoss5);
TEGN_FORAN.push(tegnSno);
TEGN_GLOD.push(() => { ledningsGlod(); boss5Glod(); });
LYSKILDER.push(L => {
  if (B5.aktiv) { const a = B5.fase === 'dod' ? clamp(B5.dod / 2.6, 0, 1) : 1; L(B5.x, B5.y, 320, .9 * a);
    for (const l of B5.lyn) L(l.x, ARENA5.gulv * T - 40, l.varsel > 0 ? 80 : 420, l.varsel > 0 ? .5 : 1); }
  if (LYNBLINK.a > .3 && spillerSone() === 1) L(cam.x + cssW / skala / 2, cam.y, 900, LYNBLINK.a * .5);
});
