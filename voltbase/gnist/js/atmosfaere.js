'use strict';
// Gnist – atmosfære: dybde og lys i bildet. Et baklys med drivende tåke bak banen, lysstråler som faller
// skrått gjennom luften foran, uskarpe silhuetter i forgrunnen, store svevende lyskorn og en myk fargetone til slutt.
// Alt er forhåndstegnet på små lerreter og bare flyttes og farges per bilde, så det koster lite.

// ---------- forhåndstegnede lag ----------
// uskarphet legges på én gang til slutt (et filter på hver enkelt figur ble svært tregt)
function uskarp(c, px) { const u = nyC(c.width, c.height), g = u.getContext('2d'); try { g.filter = `blur(${px}px)`; } catch (e) {} g.drawImage(c, 0, 0); return u; }
// en lang, myk lysstråle: lys ved kilden, borte mot enden, myke kanter
const STRALE2 = (() => { const c = nyC(512, 64), g = c.getContext('2d');
  const l = g.createLinearGradient(0, 0, 512, 0); l.addColorStop(0, 'rgba(255,255,255,1)'); l.addColorStop(.35, 'rgba(255,255,255,.45)'); l.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = l; g.beginPath(); g.moveTo(0, 30); g.lineTo(512, 0); g.lineTo(512, 64); g.lineTo(0, 34); g.closePath(); g.fill();
  g.globalCompositeOperation = 'destination-in'; const t = g.createLinearGradient(0, 0, 0, 64); t.addColorStop(0, 'rgba(0,0,0,0)'); t.addColorStop(.5, 'rgba(0,0,0,1)'); t.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = t; g.fillRect(0, 0, 512, 64); return c; })();
// tåke: myke skyer som kan gjentas sidelengs, farget etter området
const TAAKE = {};
function taakeFor(navn) {
  if (TAAKE[navn]) return TAAKE[navn];
  const [r, gg, b] = (STEMNINGER[navn] || STEMNINGER.ute).dis, c = nyC(1024, 256), g = c.getContext('2d'), rnd = rng(401 + navn.length);
  for (let i = 0; i < 70; i++) { const x = rnd() * 1024, y = 60 + rnd() * 140, rad = 40 + rnd() * 110, a = .05 + rnd() * .08;
    for (const dx of [-1024, 0, 1024]) { const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, rad); gr.addColorStop(0, `rgba(${r},${gg},${b},${a})`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx, y, rad * 1.8, rad * .6, 0, 0, 7); g.fill(); } }
  return (TAAKE[navn] = c);
}
// forgrunn: uskarpe, nesten svarte silhuetter langs nederkant og overkant, ulike etter område
const FORGRUNN = {};
function forgrunnFor(tema) {
  if (FORGRUNN[tema]) return FORGRUNN[tema];
  const W = 2048, bunn = nyC(W, 240), topp = nyC(W, 200), rnd = rng(503 + tema.length * 7);
  const gb = bunn.getContext('2d'), gt = topp.getContext('2d');
  const farge = '#03050a';
  gb.fillStyle = farge; gb.strokeStyle = farge; gt.fillStyle = farge; gt.strokeStyle = farge;
  const gress = (x, h, n) => { for (let i = 0; i < n; i++) { const bx = x + (rnd() - .5) * 60, hh = h * (.5 + rnd() * .6), b = (rnd() - .5) * 50;
    gb.lineWidth = 3 + rnd() * 4; gb.beginPath(); gb.moveTo(bx, 240); gb.quadraticCurveTo(bx + b * .3, 240 - hh * .6, bx + b, 240 - hh); gb.stroke(); } };
  const stein = (x, w, h) => { gb.beginPath(); gb.moveTo(x - w / 2, 240); gb.quadraticCurveTo(x - w * .45, 240 - h, x - w * .1, 240 - h * 1.05); gb.quadraticCurveTo(x + w * .4, 240 - h * .9, x + w / 2, 240); gb.fill(); };
  const siv = (x, n) => { for (let i = 0; i < n; i++) { const bx = x + (rnd() - .5) * 40, hh = 120 + rnd() * 100, b = (rnd() - .3) * 30; gb.lineWidth = 2.5 + rnd() * 2;
    gb.beginPath(); gb.moveTo(bx, 240); gb.quadraticCurveTo(bx + b * .2, 240 - hh * .5, bx + b, 240 - hh); gb.stroke(); if (rnd() < .4) { gb.beginPath(); gb.ellipse(bx + b, 240 - hh + 10, 4, 14, b * .01, 0, 7); gb.fill(); } } };
  const ror = (y, d) => { gt.fillRect(0, y - d / 2, W, d); for (let x = 60 + rnd() * 80; x < W; x += 180 + rnd() * 220) gt.fillRect(x - 6, y - d / 2 - 5, 12, d + 10); };
  const kabel = (x0, x1, y, heng) => { gt.lineWidth = 3 + rnd() * 3; gt.beginPath(); gt.moveTo(x0, y); gt.quadraticCurveTo((x0 + x1) / 2, y + heng, x1, y); gt.stroke(); };
  const ranke = (x, l) => { gt.lineWidth = 2 + rnd() * 2; gt.beginPath(); gt.moveTo(x, 0); let y = 0, xx = x; while (y < l) { y += 14; xx += (rnd() - .5) * 8; gt.lineTo(xx, y); } gt.stroke();
    for (let k = 18; k < l; k += 16 + rnd() * 10) { gt.beginPath(); gt.ellipse(x + (rnd() - .5) * 10, k, 6 + rnd() * 5, 3, rnd() * 3, 0, 7); gt.fill(); } };
  if (tema === 'inne') {
    for (let x = 0; x < W; x += 260 + rnd() * 300) { const w = 50 + rnd() * 90, h = 30 + rnd() * 50; gb.fillRect(x, 240 - h, w, h); if (rnd() < .5) { gb.lineWidth = 6; gb.beginPath(); gb.moveTo(x + w, 240 - h * .7); gb.lineTo(x + w + 40, 240); gb.stroke(); } }
    ror(26, 30); ror(70 + rnd() * 20, 14);
    for (let x = 0; x < W; x += 300 + rnd() * 300) kabel(x, x + 200 + rnd() * 200, 20, 60 + rnd() * 70);
  } else if (tema === 'sump' || tema === 'dam') {
    for (let x = 0; x < W; x += 140 + rnd() * 240) siv(x, 6 + (rnd() * 8 | 0));
    for (let x = 0; x < W; x += 400 + rnd() * 400) stein(x, 160 + rnd() * 120, 40 + rnd() * 40);
    if (tema === 'sump') for (let x = 40; x < W; x += 120 + rnd() * 200) ranke(x, 60 + rnd() * 130);
  } else if (tema === 'fjell') {
    for (let x = 0; x < W; x += 300 + rnd() * 360) stein(x, 220 + rnd() * 260, 60 + rnd() * 80);
    for (let x = 0; x < W; x += 180 + rnd() * 260) gress(x, 70, 6);
    for (let x = 0; x < W; x += 500 + rnd() * 500) kabel(x, x + 420 + rnd() * 300, 0, 90 + rnd() * 60);
  } else {
    for (let x = 0; x < W; x += 110 + rnd() * 200) gress(x, 100 + rnd() * 70, 8 + (rnd() * 8 | 0));
    for (let x = 0; x < W; x += 450 + rnd() * 450) stein(x, 140 + rnd() * 160, 30 + rnd() * 40);
    for (let x = 80; x < W; x += 220 + rnd() * 320) ranke(x, 50 + rnd() * 100);
  }
  return (FORGRUNN[tema] = { bunn: uskarp(bunn, 2.5), topp: uskarp(topp, 2.5) });
}
const temaFor = navn => ['kjeller', 'hall', 'kabel', 'pumpe', 'stasjon', 'kraft', 'turbin', 'galleri', 'kulvert', 'data'].includes(navn) ? 'inne' : navn === 'sump' ? 'sump' : navn === 'dam' ? 'dam' : navn === 'linja' || navn === 'nord' ? 'fjell' : 'ute';

// store, uskarpe lyskorn helt foran kameraet
const BOKEH = Array.from({ length: 14 }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 1.5 + Math.random() * 1.2, ph: Math.random() * 6.28, f: .15 + Math.random() * .3, r: 10 + Math.random() * 18 }));

// ---------- tilstand: hvor «ute» bildet er, glatt over tid ----------
const ATM = { ute: 1, tema: 'ute', bytt: 0, forrige: null };
function oppdaterAtm(dt) {
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T), ute = inne(tx, ty) ? 0 : 1;
  ATM.ute += (ute - ATM.ute) * Math.min(1, dt * 1.5);
  const t = temaFor(ST.navn); if (t !== ATM.tema) { ATM.forrige = ATM.tema; ATM.tema = t; ATM.bytt = 1; }
  ATM.bytt = Math.max(0, ATM.bytt - dt * 1.2);
}
OPPDATER.push(oppdaterAtm);
const disFarge = (a, lys) => { const [r, g, b] = ST.dis, k = lys || 0; return `rgba(${(r + (255 - r) * k) | 0},${(g + (255 - g) * k) | 0},${(b + (255 - b) * k) | 0},${a})`; };
const kildePos = () => { const cw = cv.width, ch = cv.height, m = skala * dpr; return [cw * .68 - ((camX * m * .02) % (cw * .3)), -ch * .32]; };   // over skjermkanten, så strålene kommer inn ovenfra uten et synlig midtpunkt

// ---------- bak banen: baklys og drivende tåke ----------
// baklys, tåke og stråler er myke, så de tegnes i en tredjedels oppløsning og skaleres opp (mye billigere)
let atmC = null, atmG = null;
function lavOppl(fn) {
  const w = Math.ceil(cv.width / 3), h = Math.ceil(cv.height / 3);
  if (!atmC || atmC.width !== w || atmC.height !== h) { atmC = nyC(w, h); atmG = atmC.getContext('2d'); }
  const g = atmG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h);
  g.globalCompositeOperation = 'lighter'; fn(g, w, h, w / cv.width); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(atmC, 0, 0, cv.width, cv.height); ctx.globalCompositeOperation = 'source-over';
}
function tegnBaklys() {
  if (S.kval < 1 || SLUTT_AKTIV()) return;
  lavOppl((g, w, h, k) => { const m = skala * dpr * k, u = ATM.ute;
    // en stor, myk lyskilde over skjermkanten (bare når himmelen synes)
    if (u > .05) { const [sx, sy] = kildePos(), R = Math.max(w, h) * 1.05, gr = g.createRadialGradient(sx * k, sy * k, 0, sx * k, sy * k, R);
      gr.addColorStop(0, disFarge(.22 * u, .5)); gr.addColorStop(.35, disFarge(.09 * u, .25)); gr.addColorStop(1, disFarge(0));
      g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    // to tåkelag som driver sakte sidelengs i hver sin dybde
    const tk = taakeFor(ST.navn), tw = 1024 * m * 1.6, th = 256 * m * 1.6;
    for (const [p, fart, yk, a] of [[.18, 9, .42, .75], [.42, 20, .62, .6]]) {
      let x = -(((camX * p + S.t * fart) * m) % tw); if (x > 0) x -= tw; const y = h * yk - th / 2 - (camY * m * p * .25) % (th * .25);
      g.globalAlpha = a * (.55 + .45 * u); for (; x < w; x += tw) g.drawImage(tk, x, y, tw + 1, th); } });
}
const SLUTT_AKTIV = () => typeof SLUTT !== 'undefined' && SLUTT.t > 5;

// ---------- foran: lysstråler, forgrunn og lyskorn ----------
function tegnStralerForan() {
  if (S.kval < 1 || SLUTT_AKTIV() || ATM.ute < .05) return;
  lavOppl((g, w, h, k) => { const u = ATM.ute, [sx, sy] = kildePos(), L = Math.hypot(w, h) * 1.1;
    for (let i = 0; i < 7; i++) { const vin = 1.75 + (i - 3) * .16 + Math.sin(S.t * .11 + i * 1.7) * .05, b = (40 + hs(i, 3, 77) * 90) * dpr * k * (1 + i % 2),
        a = (.035 + .03 * Math.sin(S.t * .37 + i * 2.1)) * u * (1 + S.power * .5);
      g.save(); g.translate(sx * k, sy * k); g.rotate(vin); g.globalAlpha = Math.max(0, a); g.drawImage(STRALE2, 0, -b / 2, L, b); g.restore(); } });
}
function tegnForgrunnLag() {
  if (S.kval < 1 || SLUTT_AKTIV() || S.mode === 'meny') return;
  // størrelsen følger skjermen, ikke verden: forgrunnen skal ramme inn, aldri dekke banen
  const cw = cv.width, ch = cv.height, m = skala * dpr, touch = erTouch ? .75 : 1;
  const tegnTema = (tema, a) => { const f = forgrunnFor(tema), bh = ch * .2 * touch, sk = bh / 240, w = 2048 * sk;
    let x = -((camX * m * 1.35) % w); if (x > 0) x -= w;
    const yb = ch - bh * .78, th = 200 * sk * (tema === 'inne' ? .9 : .7);
    ctx.globalAlpha = a; for (let xx = x; xx < cw; xx += w) { ctx.drawImage(f.bunn, xx, yb, w + 1, bh); ctx.drawImage(f.topp, xx, -th * .25, w + 1, th); } };
  if (ATM.bytt > 0 && ATM.forrige) tegnTema(ATM.forrige, ATM.bytt * .92);
  tegnTema(ATM.tema, (1 - ATM.bytt) * .92);
  ctx.globalAlpha = 1;
  // lyskorn
  ctx.globalCompositeOperation = 'lighter';
  for (const b of BOKEH) { const sx = ((b.x * cw - camX * m * b.z * .5) % (cw + 200) + cw + 200) % (cw + 200) - 100, sy = ((b.y * ch - camY * m * b.z * .3 + Math.sin(S.t * b.f + b.ph) * 30 * dpr) % (ch + 200) + ch + 200) % (ch + 200) - 100;
    glod(ST.navn === 'ute' && S.power < .5 ? SPR.c : SPR.w, sx, sy, b.r * b.z * dpr, .07 + .05 * Math.sin(S.t * b.f * 3 + b.ph)); }
  ctx.globalCompositeOperation = 'source-over';
}
TEGN_BAK.push(tegnBaklys);
TEGN_FORAN.push(tegnStralerForan, tegnForgrunnLag);
