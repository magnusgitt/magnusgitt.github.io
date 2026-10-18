'use strict';
// Gnist – stemning: farger og lys per område, innendørs parallakse, bloom, lysstråler,
// små levende detaljer i verden og automatisk kvalitet etter hvor rask maskinen er.

// ---------- stemning per område ----------
// mf: fargen på mørket, tint: fargetone over hele bildet, dis: svakt lys ovenfra, bloom: hvor mye lyset gløder, bg: innendørs bakgrunn
const STEMNINGER = {
  ute:     { mf: [3, 7, 20],  tint: [255, 255, 255], dis: [120, 170, 255], bloom: .42, bg: 'kjeller' },
  kjeller: { mf: [13, 8, 9],  tint: [255, 236, 218], dis: [255, 170, 110], bloom: .5,  bg: 'kjeller' },
  hall:    { mf: [10, 5, 24], tint: [236, 226, 255], dis: [170, 130, 255], bloom: .55, bg: 'hall' },
  kabel:   { mf: [2, 12, 16], tint: [218, 244, 250], dis: [90, 210, 230],  bloom: .5,  bg: 'kabel' },
  pumpe:   { mf: [2, 8, 24],  tint: [212, 230, 255], dis: [80, 160, 255],  bloom: .55, bg: 'kabel' },
  stasjon: { mf: [5, 8, 28],  tint: [226, 234, 255], dis: [150, 180, 255], bloom: .5,  bg: 'hall' },
  kraft:   { mf: [3, 13, 6],  tint: [224, 255, 224], dis: [130, 255, 160], bloom: .5,  bg: 'kraft' },
  turbin:  { mf: [2, 13, 13], tint: [218, 255, 244], dis: [110, 240, 220], bloom: .6,  bg: 'kraft' },
  dam:     { mf: [2, 9, 16],  tint: [220, 242, 250], dis: [110, 210, 230], bloom: .5,  bg: 'kraft' },
  galleri: { mf: [3, 12, 14], tint: [222, 248, 240], dis: [120, 230, 200], bloom: .5,  bg: 'kraft' },
  sump:    { mf: [3, 11, 7],  tint: [228, 250, 226], dis: [150, 230, 150], bloom: .55, bg: 'kraft' },
  kulvert: { mf: [3, 10, 10], tint: [220, 244, 232], dis: [110, 220, 170], bloom: .55, bg: 'kabel' },
  data:    { mf: [2, 6, 16],  tint: [218, 232, 255], dis: [120, 180, 255], bloom: .6,  bg: 'kabel' },
  nord:    { mf: [5, 10, 22], tint: [232, 244, 255], dis: [150, 230, 210], bloom: .55, bg: 'kjeller' },
  linja:   { mf: [4, 9, 20],  tint: [228, 238, 255], dis: [150, 190, 235], bloom: .45, bg: 'kjeller' },
};
function stemningFor(tx, ty) {
  if (ty >= 260) return inneNord(tx, ty) ? 'kulvert' : 'nord';
  if (ty >= 200) return 'data';
  if (ty >= 159) return inne(tx, ty) ? 'kulvert' : 'sump';
  if (ty >= 118) return inne(tx, ty) ? 'galleri' : 'dam';
  if (ty >= 72) return 'linja';
  if (iKraft(tx, ty)) return erTurbin(tx, ty) ? 'turbin' : 'kraft';
  if (tx >= 132 && ty <= 27) return 'stasjon';
  if (iKjeller2(tx, ty)) return ty >= 43 && tx <= 139 ? 'pumpe' : 'kabel';
  if (erHall(tx, ty) && tx >= 74) return 'hall';
  if (inne(tx, ty)) return 'kjeller';
  return 'ute';
}
const ST = { navn: 'ute', mf: [3, 7, 20], tint: [255, 255, 255], dis: [120, 170, 255], bloom: .42, bgVekt: { kjeller: 1 } };
function oppdaterStemning(dt, snap) {
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  ST.navn = stemningFor(tx, ty); const m = STEMNINGER[ST.navn], k = snap ? 1 : 1 - Math.exp(-dt * 1.6);
  const varme = ST.navn === 'ute' ? Math.max(lysNiva(), S.power) : 0, VARM = { tint: [255, 238, 214], dis: [255, 190, 140] };
  for (const n of ['mf', 'tint', 'dis']) for (let i = 0; i < 3; i++) { const mal = VARM[n] ? m[n][i] + (VARM[n][i] - m[n][i]) * varme * .6 : m[n][i]; ST[n][i] += (mal - ST[n][i]) * k; }
  ST.bloom += (m.bloom - ST.bloom) * k;
  for (const s of ['kjeller', 'hall', 'kabel', 'kraft']) { const v = ST.bgVekt[s] || 0, mal = m.bg === s ? 1 : 0; ST.bgVekt[s] = v + (mal - v) * k; }
}

// ---------- kvalitet ----------
// 2: alt, 1: uten bloom, 0: uten innendørs parallakse og lysstråler. Går ned av seg selv hvis bildet blir tregt.
const KVAL_FAST = (() => { try { const v = new URLSearchParams(location.search).get('kval'); return v === null ? -1 : clamp(parseInt(v, 10) || 0, 0, 2); } catch (e) { return -1; } })();
// fast kvalitet: fra adressen (?kval=) eller valgt i innstillingene; ellers velges den automatisk
const kvalLast = () => KVAL_FAST >= 0 ? KVAL_FAST : INNST.grafikk === 'auto' ? -1 : INNST.grafikk;
S.kval = kvalLast() >= 0 ? kvalLast() : 2;
function settGrafikk(v) { INNST.grafikk = v; const f = kvalLast(), ny = f >= 0 ? f : 2; if ((ny === 0) !== (S.kval === 0)) chunks.clear(); S.kval = ny; MAAL.sum = MAAL.n = 0; lagreInnst(); }
const MAAL = { sum: 0, n: 0, spilt: 0 };
function maalYtelse(rdt) {
  if (kvalLast() >= 0 || S.mode !== 'spill' || document.hidden) { MAAL.sum = MAAL.n = 0; return; }
  MAAL.spilt += rdt; if (MAAL.spilt < 4) return;          // la oppstarten roe seg først
  MAAL.sum += rdt; MAAL.n++;
  if (MAAL.n >= 120) { const snitt = MAAL.sum / MAAL.n; MAAL.sum = MAAL.n = 0;
    if (snitt > 1 / 42 && S.kval > 0) { S.kval--; if (S.kval === 0) chunks.clear(); } }
}
const bakveggAlfa = () => S.kval > 0 ? .62 : 1;

// ---------- innendørs maske, lysåpninger og detaljer ----------
let innM = nyC(MW, MH), innA = new Uint8Array(MW * MH);
const AAPNINGER = [], DETALJ = new Map();
let maskeKlar = false;
function lagInneMaske() {
  maskeKlar = true;
  innM = nyC(MW, MH); const g = innM.getContext('2d'), d = g.createImageData(MW, MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const i = y * MW + x, v = !erSol(x, y) && inne(x, y) ? 1 : 0; innA[i] = v;
    if (v) { d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = d.data[i * 4 + 3] = 255; } }
  g.putImageData(d, 0, 0);
  // åpninger der lyset utenfra faller inn
  AAPNINGER.length = 0;
  for (let y = 1; y < MH; y++) { let start = -1;
    for (let x = 0; x <= MW; x++) { const ok = x < MW && innA[y * MW + x] && !erSol(x, y - 1) && !inne(x, y - 1) && !fast(x, y);
      if (ok && start < 0) start = x; if (!ok && start >= 0) { AAPNINGER.push({ x0: start, x1: x - 1, y }); start = -1; } } }
  // små levende detaljer: drypp, vifter, lamper, gnistrende kabler og ildfluer
  DETALJ.clear();
  const legg = (x, y, d) => { const k = Math.floor(x / CH) + ',' + Math.floor(y / CH); let a = DETALJ.get(k); if (!a) DETALJ.set(k, a = []); d.x = x; d.y = y; a.push(d); };
  for (let y = 1; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
    if (erSol(x, y)) continue;
    const i = innA[y * MW + x], tak = erSol(x, y - 1);
    if (i) {
      if (tak && !erHall(x, y) && hs(x, y, 201) < .05) { let fy = y; while (fy < MH - 1 && !fast(x, fy + 1) && tile(x, fy + 1) !== ONE && !erVann(tile(x, fy + 1))) fy++;
        if (fy - y >= 2) legg(x, y, { type: 'drypp', fy: (fy + 1) * T, per: 2.2 + hs(x, y, 202) * 3, fase: hs(x, y, 203) * 5, dx: 6 + hs(x, y, 204) * 20 }); }
      else if (tak && hs(x, y, 207) < .025) legg(x, y, { type: 'kabel', per: 2.6 + hs(x, y, 208) * 3, fase: hs(x, y, 209) * 4, dx: 8 + hs(x, y, 210) * 16, sist: -1 });
      else if (!tak && hs(x, y, 211) < .008 && erSol(x, y + 3)) { let fri = true; for (let dy = -1; dy <= 1 && fri; dy++) for (let dx = -1; dx <= 1; dx++) if (!innA[(y + dy) * MW + x + dx]) { fri = false; break; }
        if (fri) legg(x, y, { type: 'vifte', v: (hs(x, y, 212) < .5 ? -1 : 1) * (2 + hs(x, y, 213) * 3), r: 10 + hs(x, y, 214) * 4 }); }
      else if ((erSol(x - 1, y) || erSol(x + 1, y)) && hs(x, y, 215) < .04) legg(x, y, { type: 'led', side: erSol(x - 1, y) ? -1 : 1, f: .4 + hs(x, y, 216) * 1.2, fase: hs(x, y, 217), farge: hs(x, y, 218) < .55 ? 'r' : hs(x, y, 218) < .8 ? 'g' : 'o', dy: 6 + hs(x, y, 219) * 18 });
    } else if (!inne(x, y) && erSol(x, y + 1) && !erSol(x, y) && hs(x, y, 221) < .06) legg(x, y, { type: 'flue', fase: hs(x, y, 222) * 6.28, r: 14 + hs(x, y, 223) * 22 });
  }
}
function forSynligeDetaljer(f) {
  const vw = cssW / skala, vh = cssH / skala;
  const cx0 = Math.floor(camX / CPX) - 1, cx1 = Math.floor((camX + vw) / CPX) + 1, cy0 = Math.floor(camY / CPX) - 1, cy1 = Math.floor((camY + vh) / CPX) + 1;
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { const a = DETALJ.get(cx + ',' + cy); if (a) for (const d of a) f(d); }
}
const G_DRYPP = 900;
function tegnDetaljer() {
  if (!maskeKlar) return;
  forSynligeDetaljer(d => {
    const X = d.x * T, Y = d.y * T;
    if (d.type === 'drypp') { const fx = X + d.dx, h = d.fy - Y, ft = Math.sqrt(2 * h / G_DRYPP), f = (S.t + d.fase) % d.per;
      if (f < .7) { const s = f / .7; ctx.fillStyle = 'rgba(170,215,240,.75)'; ctx.beginPath(); ctx.ellipse(fx, Y + 1 + s * 2, 1.3 + s, 1.2 + s * 1.8, 0, 0, 7); ctx.fill(); }
      else if (f - .7 < ft) { const t = f - .7, y = Y + 3 + .5 * G_DRYPP * t * t; ctx.fillStyle = 'rgba(190,230,250,.85)'; ctx.beginPath(); ctx.ellipse(fx, y, 1.4, 3, 0, 0, 7); ctx.fill(); }
      else if (f - .7 - ft < .45) { const t = (f - .7 - ft) / .45; ctx.strokeStyle = `rgba(190,230,250,${.6 * (1 - t)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(fx, d.fy - 1, 2 + t * 9, .8 + t * 2, 0, 0, 7); ctx.stroke();
        if (t < .3) { ctx.fillStyle = 'rgba(190,230,250,.7)'; for (const s of [-1, 1]) ctx.fillRect(fx + s * (2 + t * 14), d.fy - 3 - t * 10, 1.2, 1.2); } } }
    else if (d.type === 'vifte') { const cx = X + 16, cy = Y + 16;
      ctx.fillStyle = '#10151b'; ctx.beginPath(); ctx.arc(cx, cy, d.r + 3, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(170,200,220,.18)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(S.t * d.v); ctx.fillStyle = '#2a333d';
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.ellipse(d.r * .5, 0, d.r * .48, d.r * .2, .35, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#3c4753'; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, 7); ctx.fill(); ctx.restore();
      ctx.strokeStyle = 'rgba(10,14,18,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - d.r - 3, cy); ctx.lineTo(cx + d.r + 3, cy); ctx.moveTo(cx, cy - d.r - 3); ctx.lineTo(cx, cy + d.r + 3); ctx.stroke(); }
    else if (d.type === 'led') { const lx = d.side < 0 ? X + 3 : X + T - 9;
      ctx.fillStyle = '#1b2129'; rr(ctx, lx, Y + d.dy - 4, 6, 9, 1.5); ctx.fill();
      const paa = ((S.t * d.f + d.fase) % 1) < .5; ctx.fillStyle = paa ? (d.farge === 'r' ? '#ff5a4a' : d.farge === 'g' ? '#5dff9a' : '#ffb347') : '#2a2a2a'; ctx.fillRect(lx + 1.5, Y + d.dy - 2, 3, 3); }
    else if (d.type === 'kabel') { const kx = X + d.dx, f = (S.t + d.fase) % d.per, sv = Math.sin(S.t * 1.3 + d.fase) * 2;
      ctx.strokeStyle = '#2b2f38'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(kx, Y); ctx.quadraticCurveTo(kx + 3 + sv, Y + 10, kx + sv * 1.5, Y + 20); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,210,230,.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx + 1, Y); ctx.quadraticCurveTo(kx + 4 + sv, Y + 10, kx + 1 + sv * 1.5, Y + 19); ctx.stroke();
      ctx.strokeStyle = '#c4762e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx + sv * 1.5, Y + 20); ctx.lineTo(kx + sv * 1.5 - 1.5, Y + 23); ctx.moveTo(kx + sv * 1.5, Y + 20); ctx.lineTo(kx + sv * 1.5 + 1, Y + 23.5); ctx.stroke();
      const n = Math.floor((S.t + d.fase) / d.per); if (f < .12 && d.sist !== n && S.mode === 'spill') { d.sist = n; gnister(kx + sv * 1.5, Y + 23, 6, Math.random() < .5 ? 'w' : 'c'); } }
  });
}
function tegnDetaljGlod() {
  if (!maskeKlar) return;
  forSynligeDetaljer(d => {
    const X = d.x * T, Y = d.y * T;
    if (d.type === 'led') { if (((S.t * d.f + d.fase) % 1) < .5) glod(d.farge === 'r' ? SPR.r : d.farge === 'g' ? SPR.g : SPR.o, d.side < 0 ? X + 6 : X + T - 6, Y + d.dy - .5, 9, .7); }
    else if (d.type === 'kabel') { const f = (S.t + d.fase) % d.per; if (f < .16) { const kx = X + d.dx + Math.sin(S.t * 1.3 + d.fase) * 3, a = 1 - f / .16;
      glod(SPR.c, kx, Y + 23, 36, .9 * a); glod(SPR.h, kx, Y + 23, 8, a); ctx.globalAlpha = a; ctx.strokeStyle = 'rgba(220,250,255,.95)'; ctx.lineWidth = 1.1; jagget(kx, Y + 22, kx + (hs(d.x, (S.t * 30) | 0, 1) - .5) * 26, Y + 34, 4, 4, (S.t * 40) | 0); } }
    else if (d.type === 'flue') { const fx = X + 16 + Math.sin(S.t * .7 + d.fase) * d.r, fy = Y + 6 + Math.sin(S.t * 1.13 + d.fase * 2) * 10 - Math.abs(Math.sin(S.t * .4 + d.fase)) * 14;
      const a = .35 + .45 * Math.max(0, Math.sin(S.t * 2.3 + d.fase * 3)); glod(SPR.g, fx, fy, 10, a); glod(SPR.h, fx, fy, 2.5, a); }
  });
}
function detaljLys(L) {
  if (!maskeKlar) return;
  forSynligeDetaljer(d => { if (d.type === 'kabel') { const f = (S.t + d.fase) % d.per; if (f < .16) L(d.x * T + d.dx, d.y * T + 23, 130, .8 * (1 - f / .16)); }
    else if (d.type === 'led' && ((S.t * d.f + d.fase) % 1) < .5) L(d.side < 0 ? d.x * T + 6 : d.x * T + T - 6, d.y * T + d.dy, 34, .4); });
}
// lys som faller inn gjennom åpninger, og myke kjegler under taklampene
function tegnStraler() {
  if (S.kval < 1) return;
  for (const a of AAPNINGER) { const X = (a.x0 + a.x1 + 1) / 2 * T, Y = a.y * T, w = (a.x1 - a.x0 + 1) * T; if (!synlig(X, Y + 4 * T, w / 2 + 8 * T)) continue;
    ctx.save(); ctx.translate(X, Y - T * .3); ctx.rotate(.12 + Math.sin(S.t * .25 + a.x0) * .04); ctx.globalAlpha = (.13 + .04 * Math.sin(S.t * .6 + a.y)) * (1 + S.power * .6);
    ctx.drawImage(STRALE, -w * .8, 0, w * 1.6, 11 * T); ctx.globalAlpha *= .6; ctx.drawImage(STRALE, -w * .35, 0, w * .7, 7 * T); ctx.restore(); }
  for (const [x, y] of KJELLERLYS) { if (x === 6 && !S.ev.hemmelig) continue; const X = x * T + T / 2, Y = y * T + 6; if (!synlig(X, Y + 80, 160)) continue;
    ctx.globalAlpha = .07; ctx.drawImage(KJEGLE, X - 60, Y, 120, 190); }
  ctx.globalAlpha = 1;
}

// ---------- innendørs bakgrunner (malte lag som kan gjentas i begge retninger) ----------
const IW = 1024, IH = 768, INNE_BG = {};
function inneLag(fn, seed, fyll) { const c = nyC(IW, IH), g = c.getContext('2d'); if (fyll) { g.fillStyle = fyll; g.fillRect(0, 0, IW, IH); }
  for (const ox of [-IW, 0, IW]) for (const oy of [-IH, 0, IH]) { g.save(); g.translate(ox, oy); fn(g, rng(seed)); g.restore(); } return c; }
function lampeDott(g, x, y, r, farge, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${farge},${a})`); gr.addColorStop(.25, `rgba(${farge},${a * .35})`); gr.addColorStop(1, `rgba(${farge},0)`);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = `rgba(255,250,235,${a})`; g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
function ror(g, x0, y, x1, d, farge, kant) { g.fillStyle = farge; g.fillRect(x0, y - d / 2, x1 - x0, d); g.fillStyle = kant; g.fillRect(x0, y - d / 2, x1 - x0, 1.5);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, y + d / 2 - 2, x1 - x0, 2); for (let x = x0 + 40; x < x1; x += 90) { g.fillStyle = farge; g.fillRect(x - 3, y - d / 2 - 3, 6, d + 6); g.fillStyle = kant; g.fillRect(x - 3, y - d / 2 - 3, 6, 1); } }
function haengKabel(g, x0, y0, x1, y1, heng, farge, b) { g.strokeStyle = farge; g.lineWidth = b; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + heng, x1, y1); g.stroke(); }
const INNE_STIL = {
  kjeller: [
    (g, r) => { // fjernt: søyler, bjelker og varme lamper langt inne
      for (let i = 0; i < 8; i++) { const x = i * 128 + r() * 30; g.fillStyle = '#1a1c24'; g.fillRect(x, 0, 30, IH); g.fillStyle = 'rgba(255,220,180,.05)'; g.fillRect(x + 26, 0, 3, IH);
        for (let y = 0; y < IH; y += 192) { g.fillStyle = '#1d2029'; g.fillRect(x - 8, y + 60, 46, 10); } }
      for (let y = 40; y < IH; y += 256) { g.fillStyle = '#15171e'; g.fillRect(0, y, IW, 22); g.fillStyle = 'rgba(255,220,180,.06)'; g.fillRect(0, y, IW, 2); }
      for (let i = 0; i < 14; i++) lampeDott(g, r() * IW, r() * IH, 30 + r() * 30, '255,180,110', .35 + r() * .3);
    },
    (g, r) => { // nærmere: tykke pilarer, rør og hengende kabler
      for (let i = 0; i < 3; i++) { const x = i * 340 + r() * 120; g.fillStyle = '#0d0f15'; g.fillRect(x, 0, 54, IH); g.fillStyle = 'rgba(255,230,200,.07)'; g.fillRect(x + 48, 0, 4, IH);
        for (let y = 20; y < IH; y += 120) { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 6, y, 42, 2); } }
      for (let k = 0; k < 2; k++) ror(g, 0, 150 + k * 384 + r() * 40, IW, 16 + r() * 8, '#14171f', 'rgba(255,220,180,.12)');
      for (let i = 0; i < 6; i++) { const x = r() * IW, y = r() * IH; haengKabel(g, x, y, x + 120 + r() * 160, y + (r() - .5) * 40, 30 + r() * 40, '#080a0e', 2.2 + r() * 2); }
    },
  ],
  hall: [
    (g, r) => { // fjernt: høye vinduer i måneskinn og store transformatorer
      for (let i = 0; i < 4; i++) { const x = i * 256 + 60 + r() * 40, y = 60 + r() * 60;
        const gr = g.createLinearGradient(0, y, 0, y + 260); gr.addColorStop(0, 'rgba(170,160,255,.22)'); gr.addColorStop(1, 'rgba(120,110,220,.03)');
        g.fillStyle = gr; g.fillRect(x, y, 90, 260); g.fillStyle = '#100d1e'; for (let k = 1; k < 4; k++) g.fillRect(x, y + k * 65, 90, 4); g.fillRect(x + 43, y, 4, 260);
        g.globalAlpha = .07; g.fillStyle = '#c8c0ff'; g.beginPath(); g.moveTo(x, y + 260); g.lineTo(x + 90, y + 260); g.lineTo(x + 230, y + 700); g.lineTo(x + 80, y + 700); g.fill(); g.globalAlpha = 1; }
      for (let i = 0; i < 3; i++) { const x = i * 340 + r() * 80, y = 470; g.fillStyle = '#17142a'; g.fillRect(x, y, 180, 240); g.fillStyle = 'rgba(0,0,0,.3)'; for (let k = x + 10; k < x + 170; k += 14) g.fillRect(k, y + 30, 6, 190);
        for (let k = 0; k < 3; k++) { g.fillStyle = '#231e3a'; for (let s = 0; s < 5; s++) g.fillRect(x + 30 + k * 55 - 10 + s, y - 12 - s * 14, 20 - s * 2, 9); } }
      for (let y = 20; y < IH; y += 384) { g.fillStyle = '#141126'; g.fillRect(0, y, IW, 26); g.strokeStyle = '#141126'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x < IW; x += 40) { g.moveTo(x, y + 26); g.lineTo(x + 20, y + 60); g.lineTo(x + 40, y + 26); } g.stroke(); g.fillRect(0, y + 58, IW, 6); }
    },
    (g, r) => { // nærmere: samleskinner på isolatorer og stålsøyler
      for (let k = 0; k < 2; k++) { const y = 200 + k * 384; g.fillStyle = '#0e0c1a'; g.fillRect(0, y, IW, 10);
        for (let x = 30; x < IW; x += 150) { g.fillStyle = '#2a2440'; for (let s = 0; s < 4; s++) g.fillRect(x - 7 + s, y + 10 + s * 7, 14 - s * 2, 5); }
        for (const d of [0, 18, 36]) { g.fillStyle = '#5a3a20'; g.fillRect(0, y - 20 - d, IW, 4); } }
      for (let i = 0; i < 3; i++) { const x = i * 341 + r() * 100; g.fillStyle = '#0b0915'; g.fillRect(x, 0, 36, IH); g.fillStyle = 'rgba(200,190,255,.08)'; g.fillRect(x + 32, 0, 3, IH);
        g.fillStyle = 'rgba(0,0,0,.5)'; for (let y = 12; y < IH; y += 24) { g.beginPath(); g.arc(x + 9, y, 1.8, 0, 7); g.arc(x + 27, y, 1.8, 0, 7); g.fill(); } }
    },
  ],
  kabel: [
    (g, r) => { // fjernt: tunnelbuer som forsvinner innover, med en rad lamper
      for (let i = 0; i < 5; i++) { const x = i * 205 + r() * 20; for (let k = 0; k < 2; k++) { const y = k * 384 + 330;
        g.strokeStyle = '#132024'; g.lineWidth = 22; g.beginPath(); g.arc(x + 100, y, 120, Math.PI, 0); g.stroke(); g.strokeStyle = 'rgba(150,230,240,.07)'; g.lineWidth = 2; g.beginPath(); g.arc(x + 100, y, 131, Math.PI, 0); g.stroke();
        g.fillStyle = '#0f1a1d'; g.fillRect(x - 20, y, 40, 54); lampeDott(g, x + 100, y - 105, 26, '120,230,240', .45); } }
      for (let i = 0; i < 10; i++) lampeDott(g, r() * IW, r() * IH, 18 + r() * 14, r() < .7 ? '255,190,120' : '120,230,240', .3);
    },
    (g, r) => { // nærmere: kabelbroer med tunge kabler og stiger
      for (let k = 0; k < 2; k++) { const y = 120 + k * 384 + r() * 30; g.fillStyle = '#0c1416'; g.fillRect(0, y, IW, 7); g.fillStyle = 'rgba(160,230,240,.12)'; g.fillRect(0, y, IW, 1.5);
        for (let x = 0; x < IW; x += 64) g.fillRect(x, y, 3, 14);
        for (let c = 0; c < 4; c++) for (let x = 0; x < IW; x += 128) haengKabel(g, x, y + 7 + c * 3, x + 128, y + 7 + c * 3, 10 + c * 6 + r() * 8, ['#05090a', '#0a0f11', '#1a0d08', '#0a0a12'][c], 2.6); }
      for (let i = 0; i < 2; i++) { const x = i * 512 + 200 + r() * 100; g.fillStyle = '#0a1113'; g.fillRect(x, 0, 5, IH); g.fillRect(x + 34, 0, 5, IH); for (let y = 0; y < IH; y += 24) g.fillRect(x, y, 39, 3); }
    },
  ],
  kraft: [
    (g, r) => { // fjernt: enorme turbinhus og trykkrør
      for (let i = 0; i < 3; i++) { const x = i * 341 + 170, y = 300 + (i % 2) * 300;
        g.fillStyle = '#122016'; g.beginPath(); g.arc(x, y, 150, 0, 7); g.fill(); g.strokeStyle = 'rgba(170,255,190,.06)'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 150, 3.6, 5.6); g.stroke();
        g.strokeStyle = '#0d1810'; g.lineWidth = 16; g.beginPath(); for (let a = 0; a < 12; a += .2) { const rr_ = 30 + a * 9; g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); } g.stroke();
        lampeDott(g, x, y, 40, '120,255,170', .3); }
      g.strokeStyle = '#101c13'; g.lineWidth = 60; for (let i = 0; i < 2; i++) { const x = i * 512 + 80; g.beginPath(); g.moveTo(x, -20); g.lineTo(x + 300, IH + 20); g.stroke(); }
      g.strokeStyle = 'rgba(170,255,190,.05)'; g.lineWidth = 3; for (let i = 0; i < 2; i++) { const x = i * 512 + 80 + 28; g.beginPath(); g.moveTo(x, -20); g.lineTo(x + 300, IH + 20); g.stroke(); }
    },
    (g, r) => { // nærmere: gangbruer med rekkverk, ventilratt og målere
      for (let k = 0; k < 2; k++) { const y = 260 + k * 384; g.fillStyle = '#0a110c'; g.fillRect(0, y, IW, 8); g.fillRect(0, y - 34, IW, 3);
        for (let x = 0; x < IW; x += 36) g.fillRect(x, y - 34, 3, 34); g.fillStyle = 'rgba(170,255,190,.1)'; g.fillRect(0, y, IW, 1.5); }
      for (let i = 0; i < 4; i++) { const x = i * 256 + 80 + r() * 60; g.fillStyle = '#0c140e'; g.fillRect(x, 0, 22, IH); g.fillStyle = 'rgba(170,255,190,.07)'; g.fillRect(x + 3, 0, 4, IH);
        const y = 120 + r() * 500; g.strokeStyle = '#1d2a20'; g.lineWidth = 4; g.beginPath(); g.arc(x + 11, y, 20, 0, 7); g.stroke(); for (let s = 0; s < 3; s++) { g.beginPath(); g.moveTo(x + 11, y); g.lineTo(x + 11 + Math.cos(s * 2.1) * 20, y + Math.sin(s * 2.1) * 20); g.stroke(); }
        g.fillStyle = '#1a241c'; g.beginPath(); g.arc(x + 11, y + 70, 11, 0, 7); g.fill(); g.fillStyle = 'rgba(230,255,200,.35)'; g.beginPath(); g.arc(x + 11, y + 70, 8, 0, 7); g.fill(); g.strokeStyle = '#1a241c'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 11, y + 70); g.lineTo(x + 16, y + 65); g.stroke(); }
    },
  ],
};
const INNE_FYLL = { kjeller: '#101218', hall: '#0f0c1c', kabel: '#0a1316', kraft: '#0b130d' };
function hentInneBg(stil) { if (!INNE_BG[stil]) INNE_BG[stil] = [inneLag(INNE_STIL[stil][0], 101, INNE_FYLL[stil]), inneLag(INNE_STIL[stil][1], 202, null)]; return INNE_BG[stil]; }
let innC = null, innG = null;
// hva som synes på skjermen: innendørs bakvegg og/eller åpen himmel (da kan himmelen hoppes over innendørs)
const SYN = { inne: false, ute: true };
function maalSynlig(kx, ky) {
  const vw = cssW / skala, vh = cssH / skala, x0 = Math.max(0, Math.floor(kx / T) - 1), x1 = Math.min(MW - 1, Math.floor((kx + vw) / T) + 1), y0 = Math.max(0, Math.floor(ky / T) - 1), y1 = Math.min(MH - 1, Math.floor((ky + vh) / T) + 1);
  SYN.inne = false; SYN.ute = kx < 0 || ky < 0 || kx + vw > MW * T || ky + vh > MH * T;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * MW + x; if (innA[i]) SYN.inne = true; else if (!erSol(x, y)) SYN.ute = true; if (SYN.inne && SYN.ute) return; }
}
function tegnInneBg(kx, ky) {
  if (S.kval < 1 || !maskeKlar || !SYN.inne) return;
  const w = Math.ceil(cv.width / 3), h = Math.ceil(cv.height / 3);
  if (!innC || innC.width !== w || innC.height !== h) { innC = nyC(w, h); innG = innC.getContext('2d'); }
  const g = innG, s = skala * dpr / 3; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, w, h);
  for (const stil of ['kjeller', 'hall', 'kabel', 'kraft']) { const v = ST.bgVekt[stil] || 0; if (v < .02) continue; const lag = hentInneBg(stil);
    [[lag[0], .3, .82], [lag[1], .55, .95]].forEach(([b, p, sk]) => { const tw = IW * s * sk, th = IH * s * sk;
      let ox = -((kx * s * p) % tw); if (ox > 0) ox -= tw; let oy = -((ky * s * p) % th); if (oy > 0) oy -= th;
      g.globalAlpha = v; for (let y = oy; y < h; y += th) for (let x = ox; x < w; x += tw) g.drawImage(b, x, y, tw + 1, th + 1); }); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.imageSmoothingEnabled = true;
  g.drawImage(innM, -kx * s, -ky * s, MW * T * s, MH * T * s);
  g.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(innC, 0, 0, cv.width, cv.height);
}

// ---------- bloom og fargetone ----------
let blC = null, blG = null;
function tegnBloom() {
  if (S.kval < 2) return;
  const w = Math.max(8, Math.ceil(cv.width / 6)), h = Math.max(8, Math.ceil(cv.height / 6));
  if (!blC || blC.width !== w || blC.height !== h) { blC = nyC(w, h); blG = blC.getContext('2d'); }
  const g = blG; g.globalAlpha = 1; g.globalCompositeOperation = 'copy'; g.imageSmoothingEnabled = true; g.drawImage(cv, 0, 0, w, h);
  // ganger bildet med seg selv to ganger: mørke farger forsvinner, de lyse blir igjen
  g.globalCompositeOperation = 'multiply'; g.drawImage(blC, 0, 0); g.drawImage(blC, 0, 0); g.drawImage(blC, 0, 0);
  // gløden får områdets fargetone
  const [r, gg, b] = ST.tint; g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = ST.bloom;
  ctx.drawImage(blC, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}
// farget dis ovenfra legges i mørkelaget (lav oppløsning), så det koster nesten ingenting
function tegnDis(g, w, h) {
  const [dr, dg, db] = ST.dis, gr = g.createLinearGradient(0, 0, 0, h * .75);
  gr.addColorStop(0, `rgba(${dr | 0},${dg | 0},${db | 0},.09)`); gr.addColorStop(1, `rgba(${dr | 0},${dg | 0},${db | 0},0)`);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(0, 0, w, h * .75); g.globalCompositeOperation = 'source-over';
}

// ---------- montøren og fiendene: skjerf, fotspor, skygger og død ----------
const FOTSPOR = [], DODE = [];
function fotspor(x, y) { if (FOTSPOR.length > 26) FOTSPOR.shift(); FOTSPOR.push({ x, y, t0: S.t }); }
// ny runde+: fiendene tåler ett slag før de går ut (et kort vindu hindrer at samme slag teller to ganger)
function drepFiende(e) { if (S.ngPluss) { if (!e.taalt) { e.taalt = S.t; gnister(e.x + e.w / 2, e.y + e.h / 2, 8, 'g'); return; } if (S.t - e.taalt < .3) return; }
  e.liv = false; DODE.push({ e: Object.assign({}, e), t: .5 }); for (const f of ETTER_DRAP) f(e); }
// refleksskjerfet: en kort kjede av punkter som henger etter hjelmen
const HALE = Array.from({ length: 9 }, () => ({ x: 0, y: 0, px: 0, py: 0 }));
function haleAnker() { const f = ANIM.face || P.face; return [P.x + P.w / 2 - f * 4 * P.sx, P.y + P.h + (ANIM.dy - 30) * P.sy]; }
function oppdaterHale(dt) {
  const [ax, ay] = haleAnker();
  if (Math.hypot(HALE[0].x - ax, HALE[0].y - ay) > 60) for (const p of HALE) { p.x = p.px = ax; p.y = p.py = ay; }
  const dt2 = dt * dt, vind = Math.sin(S.t * 3.3) * 28;
  for (let i = 1; i < HALE.length; i++) { const p = HALE[i], vx = (p.x - p.px) * .9, vy = (p.y - p.py) * .9; p.px = p.x; p.py = p.y; p.x += vx + (vind - P.face * 30) * dt2; p.y += vy + 500 * dt2; }
  HALE[0].x = ax; HALE[0].y = ay;
  for (let k = 0; k < 3; k++) for (let i = 1; i < HALE.length; i++) { const a = HALE[i - 1], b = HALE[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, l = 4;
    if (d > l) { b.x = a.x + dx / d * l; b.y = a.y + dy / d * l; } }
  for (let i = FOTSPOR.length - 1; i >= 0; i--) if (S.t - FOTSPOR[i].t0 > 1.6) FOTSPOR.splice(i, 1);
  for (let i = DODE.length - 1; i >= 0; i--) { DODE[i].t -= dt; if (DODE[i].t <= 0) DODE.splice(i, 1); }
}
function tegnHale() {
  if (S.dod > 0) return; ctx.lineCap = 'round';
  for (let i = 1; i < HALE.length; i++) { const a = HALE[i - 1], b = HALE[i]; ctx.strokeStyle = ANIM.drakt === 'vandrer' ? (i < 3 ? '#3a3430' : '#4a423a') : i < 3 ? '#e07a22' : '#ff962c'; ctx.lineWidth = 3.6 - i * .28; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  if (ANIM.drakt === 'vandrer') { ctx.lineCap = 'butt'; return; }
  ctx.strokeStyle = 'rgba(240,248,255,.75)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(HALE[2].x, HALE[2].y); for (let i = 3; i < 6; i++) ctx.lineTo(HALE[i].x, HALE[i].y); ctx.stroke();
  ctx.lineCap = 'butt';
}
function tegnFotsporGlod() {
  for (const f of FOTSPOR) { const a = 1 - (S.t - f.t0) / 1.6; if (a <= 0 || !synlig(f.x, f.y, 30)) continue;
    ctx.save(); ctx.translate(f.x, f.y - 1); ctx.scale(1, .35); glod(SPR.c, 0, 0, 12, a * .5); glod(SPR.h, 0, 0, 3, a * .5); ctx.restore(); }
}
// myk skygge på bakken under en figur
function tegnSkygge(x, y, w) {
  const r0 = Math.floor(y / T); let r = r0, ok = false;
  for (; r < r0 + 5; r++) { const t = tile(Math.floor(x / T), r); if (fast(Math.floor(x / T), r) || t === ONE) { ok = true; break; } }
  if (!ok) return; const gy = r * T, d = gy - y; if (d < -2) return; const k = clamp(1 - d / (4.5 * T), 0, 1);
  ctx.fillStyle = `rgba(0,0,0,${.32 * k})`; ctx.beginPath(); ctx.ellipse(x, gy + 1, w * (.45 + .4 * k), 3 + k, 0, 0, 7); ctx.fill();
}
function tegnDode() {
  for (const d of DODE) { const k = d.t / .5, e = d.e, cx = e.x + e.w / 2, cy = e.y + e.h / 2; if (!synlig(cx, cy, 60)) continue;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(cx, cy); ctx.rotate((1 - k) * 1.4 * (e.dir || 1)); ctx.scale(1 + (1 - k) * .5, 1 - (1 - k) * .45); ctx.translate(-cx, -cy - (1 - k) * 10);
    tegnFiende(e); ctx.restore(); }
  ctx.globalAlpha = 1;
}
function tegnDodeGlod() {
  for (const d of DODE) { const k = d.t / .5, e = d.e, cx = e.x + e.w / 2, cy = e.y + e.h / 2 - (1 - k) * 10; if (!synlig(cx, cy, 60)) continue;
    glod(SPR.h, cx, cy, 30 * (1.4 - k), k * k); glod(SPR.o, cx, cy, 50 * (1.5 - k), k * .7);
    ctx.globalAlpha = k * .8; ctx.strokeStyle = 'rgba(255,230,190,1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 8 + (1 - k) * 36, 0, 7); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
