'use strict';
// Gnist – tegning av verden, figurer, lys og glød.
// ---------- tegning ----------
const MOTES = Array.from({ length: 64 }, () => ({ x: Math.random(), y: Math.random(), z: .3 + Math.random() * 1.1, ph: Math.random() * 6.28, f: .3 + Math.random() * .8, vx: (Math.random() - .5) * 14, c: Math.random() < .7 ? 'c' : 'w' }));
function glod(spr, x, y, r, a) { if (a <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(spr, x - r, y - r, r * 2, r * 2); }
function jagget(x1, y1, x2, y2, utslag, n, seed) { const r = rng(seed); ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i < n; i++) { const t = i / n, nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1, o = (r() - .5) * 2 * utslag;
    ctx.lineTo(lerp(x1, x2, t) + nx / l * o, lerp(y1, y2, t) + ny / l * o); } ctx.lineTo(x2, y2); ctx.stroke(); }
function synlig(x, y, m) { const vw = cssW / skala, vh = cssH / skala; return x > cam.x - m && x < cam.x + vw + m && y > cam.y - m && y < cam.y + vh + m; }

function tegnBakgrunn(kx, ky) {
  if (ky >= NY0 * T - 1) return tegnNordBg(kx, ky);
  if (ky >= XY0 * T - 1) return tegnDataBg(kx, ky);
  if (ky >= SY0 * T - 1) return tegnSumpBg(kx, ky);
  if (ky >= DY0 * T - 1) return tegnDamBg(kx, ky);
  if (ky >= LY0 * T - 1) return tegnLinjaBg(kx, ky);
  const cw = cv.width, ch = cv.height;
  const maxY = Math.max(1, 34 * T - cssH / skala), t = clamp(ky / maxY, 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(BG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .04, -(LH * hk - ch) * (.25 + t * .5), LW * hk, LH * hk);
  // skyer som driver sakte
  for (let i = 0; i < 4; i++) { const w = cw * (.7 + i * .2), x = (((S.t * (6 + i * 3) * dpr + i * cw * .37 - kx * skala * dpr * .03) % (cw + w)) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .06 + i * .015; ctx.drawImage(TAKE, x, ch * (.12 + i * .1) - w * .19, w, w * .375); }
  ctx.globalAlpha = 1;
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch;
  const lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lagX0 = (p, f = 0) => { let x0 = -((((kx * skala * dpr * p - f) % lw) + lw) % lw); if (x0 > 0) x0 -= lw; return x0; };
  const lag = (bilde, p, pv, a, f) => { if (!bilde || a <= 0) return; ctx.globalAlpha = a; const y = lagY(pv);
    for (let x = lagX0(p, f); x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); ctx.globalAlpha = 1; };
  lag(BG.fjell, .04, .15, 1);
  // fjernlaget ligger slik at kraftverket i horisonten er i bildet når introen ser mot det
  lag(BG.fjern, .08, .25, 1, fjernForskyv(lw));
  // et rødt varsellys blinker fortsatt på pipa til kraftverket langt borte
  { const b = .5 + .5 * Math.sin(S.t * 2.4), y = lagY(.25) + 349 * k; ctx.globalCompositeOperation = 'lighter';
    for (let x = lagX0(.08, fjernForskyv(lw)) + 1467 * k; x < cw + 40; x += lw) if (x > -40) { glod(SPR.r, x, y, 44 * k, .5 + .5 * b); glod(SPR.h, x, y, 4 * k, .6 + .4 * b); }
    ctx.globalCompositeOperation = 'source-over'; }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(cw * (.55 + i * .16) - (kx * skala * dpr * .05) % cw, -ch * .1); ctx.rotate(.42 + Math.sin(S.t * .2 + i) * .03);
    ctx.globalAlpha = .045 + .02 * Math.sin(S.t * .5 + i * 2); ctx.drawImage(STRALE, -ch * .12, 0, ch * (.18 + i * .06), ch * 1.6); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  lag(BG.midt, .3, .5, 1);
  // vinduene i ruinbyen tennes litt etter litt etter hvert som strømmen kommer tilbake
  const byLys = Math.max(S.power, lysNiva() * .5);
  if (byLys > 0) { if (!BG.midtLys) BG.midtLys = lagMidt(true); lag(BG.midtLys, .3, .5, byLys); }
  // blinkende varsellys på kranene
  if (byLys > 0) { const y0 = lagY(.5), blink = (Math.sin(S.t * 2.4) > .2) ? 1 : .25; ctx.globalCompositeOperation = 'lighter';
    for (let x = lagX0(.3) - lw; x < cw + lw; x += lw) for (const [lx, ly] of KRANLYS) { const sx = x + lx * k, sy = y0 + ly * k; if (sx < -50 || sx > cw + 50) continue;
      glod(SPR.r, sx, sy, 16 * k, .9 * blink * Math.min(1, byLys * 3)); } ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  lag(BG.naer, .55, .8, 1);
  // tåkebanker som driver
  for (let i = 0; i < 3; i++) { const w = cw * 1.1, x = ((S.t * (10 + i * 7) * dpr - kx * skala * dpr * (.6 + i * .1) + i * w * .6) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .07; ctx.drawImage(TAKE, x, ch * (.55 + i * .12), w, w * .25); }
  ctx.globalAlpha = 1;
}
function tegnMotes(nar) {
  const cw = cv.width, ch = cv.height; ctx.globalCompositeOperation = 'lighter';
  for (const m of MOTES) { if ((m.z >= 1) !== nar) continue;
    const sx = ((m.x * cw - cam.x * skala * dpr * m.z * .6 + S.t * m.vx * dpr) % (cw + 60) + cw + 60) % (cw + 60) - 30;
    const sy = ((m.y * ch - cam.y * skala * dpr * m.z * .6 + Math.sin(S.t * m.f + m.ph) * 22 * dpr) % (ch + 60) + ch + 60) % (ch + 60) - 30;
    glod(m.c === 'c' ? SPR.c : SPR.w, sx, sy, (4 + m.z * 9) * dpr, (.25 + .3 * Math.sin(S.t * m.f * 2 + m.ph)) * (nar ? .5 : .8)); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
// mørke kabler i forgrunnen (bare ute), gir dybde uten å skjule banen
function tegnForgrunn() {
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T); if (inne(tx, ty)) return;
  const m = skala * dpr, ox = -cam.x * m * 1.3, oy = -cam.y * m * 1.15;
  ctx.strokeStyle = 'rgba(3,6,14,.85)'; ctx.lineWidth = 3 * m;
  for (let i = 0; i < 8; i++) { const x = i * 900 * m + ox, w = 620 * m, y = (60 + (i % 3) * 140) * m + oy;
    if (x > cv.width || x + w < 0 || y > cv.height + 200 * m || y < -300 * m) continue;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + w / 2, y + (110 + Math.sin(S.t * .7 + i) * 6) * m, x + w, y + 10 * m); ctx.stroke(); }
}

function tegnLampe(c, i) {
  const X = c.x * T + T / 2, Y = (c.y + 1) * T, lit = S.cpLit.has(i);
  ctx.strokeStyle = '#1b2232'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y - 26); ctx.lineTo(X - 9, Y); ctx.moveTo(X, Y - 26); ctx.lineTo(X + 9, Y); ctx.moveTo(X, Y - 26); ctx.lineTo(X, Y); ctx.stroke();
  ctx.fillStyle = '#e8b730'; rr(ctx, X - 9, Y - 36, 18, 12, 3); ctx.fill();
  const naer = !lit && Math.abs(P.x + P.w / 2 - X) < 3 * T && Math.abs(P.y + P.h - Y) < 2 * T, flimmer = naer && Math.sin(S.t * 31 + i) * Math.sin(S.t * 7.3) > .35;
  ctx.fillStyle = lit ? '#fff6d2' : flimmer ? '#9a8f6a' : '#3a3f4e'; rr(ctx, X - 6, Y - 34, 12, 8, 2); ctx.fill();
}
function tegnBryter(b) {
  const X = b.x * T + T / 2, Y = (b.y + 1) * T;
  ctx.fillStyle = '#1b2232'; ctx.fillRect(X - 2, Y - 14, 4, 14);
  ctx.fillStyle = '#39425a'; rr(ctx, X - 10, Y - 38, 20, 26, 3); ctx.fill(); ctx.strokeStyle = '#59647f'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X, Y - 25); ctx.lineTo(X + 6, b.av ? Y - 17 : Y - 33); ctx.stroke(); ctx.lineCap = 'butt';
  const blink = b.av ? 1 : (Math.sin(S.t * 8) > 0 ? 1 : .4);
  ctx.fillStyle = b.av ? '#4dff9a' : `rgba(255,70,70,${blink})`; ctx.beginPath(); ctx.arc(X - 5, Y - 33, 2.5, 0, 7); ctx.fill();
}
function tegnTavle() {
  const X = TAVLE.x * T + 4, Y = (TAVLE.y + 2) * T, w = T * 2 - 8, h = 66;
  ctx.strokeStyle = '#151a26'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X + 10, Y - h); ctx.bezierCurveTo(X + 6, Y - h - 40, X - 30, Y - h - 30, X - 40, Y - h - 90); ctx.stroke();
  const gr = ctx.createLinearGradient(X, 0, X + w, 0); gr.addColorStop(0, '#5a657d'); gr.addColorStop(1, '#3a4256');
  ctx.fillStyle = gr; rr(ctx, X, Y - h, w, h, 4); ctx.fill(); ctx.strokeStyle = '#7d89a3'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(X + w / 2 - .5, Y - h + 6, 1, h - 12);
  ctx.fillStyle = '#f2c23c'; ctx.beginPath(); ctx.moveTo(X + 14, Y - h + 12); ctx.lineTo(X + 22, Y - h + 26); ctx.lineTo(X + 6, Y - h + 26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#222'; ctx.fillRect(X + 13.3, Y - h + 16, 1.4, 6);
  const on = S.ending > 0 || S.ferdig; ctx.fillStyle = on ? '#4dff9a' : (Math.sin(S.t * 5) > 0 ? '#ff4646' : '#5a2020'); ctx.beginPath(); ctx.arc(X + w - 10, Y - h + 12, 3, 0, 7); ctx.fill();
}
function tegnFunn(f) {
  const X = f.x * T + T / 2, Y = f.y * T + T / 2 + Math.sin(S.t * 2) * 4;
  ctx.fillStyle = 'rgba(20,30,50,.6)'; ctx.beginPath(); ctx.arc(X, Y, 11, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(X, Y); ctx.fillStyle = '#ffd36b';
  if (f.id === 'dobbel') { ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(-1, -7); ctx.lineTo(-1, 2); ctx.lineTo(6, 3); ctx.lineTo(6, 7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); }
  else if (f.id === 'hansker') { rr(ctx, -5, -4, 10, 11, 3); ctx.fill(); for (let i = 0; i < 3; i++) { rr(ctx, -5 + i * 3.4, -9, 2.6, 7, 1.3); ctx.fill(); } rr(ctx, 4, -2, 5, 2.6, 1.3); ctx.fill(); }
  else if (f.id === 'krok') { ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(-1, -2, 5, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -2); ctx.quadraticCurveTo(9, 4, 2, 8); ctx.stroke(); ctx.fillRect(-2, -3, 2, 2); }
  else if (f.id === 'klatre') { ctx.fillRect(-2, -9, 4, 14); ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(9, -6); ctx.lineTo(9, -3); ctx.lineTo(2, 1); ctx.fill(); ctx.beginPath(); ctx.moveTo(-2, 5); ctx.lineTo(2, 5); ctx.lineTo(0, 10); ctx.fill(); }
  else if (f.id === 'lynglid') { ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-9, 4); ctx.bezierCurveTo(-4, -6, 2, 6, 9, -4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1, 9); ctx.lineTo(2, 3); ctx.lineTo(0, 3); ctx.lineTo(3, -2); ctx.stroke(); }
  else if (f.id === 'fiber') { ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-8, 5); ctx.bezierCurveTo(-3, -8, 3, 8, 8, -5); ctx.stroke(); ctx.fillRect(-9, 4, 4, 4); ctx.fillRect(5, -7, 4, 4); }
  else if (f.id === 'stovler') { ctx.beginPath(); ctx.moveTo(-6, -9); ctx.lineTo(0, -9); ctx.lineTo(0, 1); ctx.lineTo(6, 3); ctx.lineTo(7, 7); ctx.lineTo(-7, 7); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#1d2228'; ctx.fillRect(-7, 5, 14, 2); }
  else if (f.id.startsWith('liv')) { ctx.fillStyle = '#bff4ff'; ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-9, 1, -7, -8, 0, -3); ctx.bezierCurveTo(7, -8, 9, 1, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(2, -9); ctx.lineTo(-5, 1); ctx.lineTo(0, 1); ctx.lineTo(-2, 9); ctx.lineTo(5, -2); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function tegnFiende(e) {
  if (e.type === 'sveve') return tegnSveve(e);
  if (e.type === 'rele') return tegnRele(e);
  if (tegnFiende2(e)) return;
  // gnistlus: en kabelbille med rusten kobberrygg, nagler og lysende øyne, så den skiller seg fra bakgrunnen
  const X = e.x + e.w / 2, Y = e.y + e.h, t = e.t, v = e.varsel || 0, id = (e.x0 || 0) | 0;
  ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir * 1.25, 1.25); ctx.rotate(-v * .14 + (v > .5 ? Math.sin(t * 40) * .03 : 0)); ctx.lineCap = 'round';
  // kabelbein med blanke kobbertupper
  for (let i = -1; i <= 1; i++) { const s = Math.sin(t * 14 + i * 2) * 2.5;
    ctx.strokeStyle = '#1a0c06'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(i * 5, -5); ctx.lineTo(i * 5 + 3 + s, -2.5); ctx.lineTo(i * 5 + 1.5 + s, -.4); ctx.stroke();
    ctx.fillStyle = '#e09a54'; ctx.beginPath(); ctx.arc(i * 5 + 1.5 + s, -.4, .9, 0, 7); ctx.fill(); }
  // ryggskjoldet: kobber med rust og to plater
  const gr = ctx.createLinearGradient(0, -14, 0, -3); gr.addColorStop(0, '#b4552e'); gr.addColorStop(.6, '#7a3018'); gr.addColorStop(1, '#3a160c');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, -7, 11, 7, 0, Math.PI, 0); ctx.lineTo(11, -4); ctx.lineTo(-11, -4); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); rustFlekker(-11, -14, 22, 10, id + 7, 4, .8);
  ctx.strokeStyle = 'rgba(30,10,4,.55)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-3, -14); ctx.quadraticCurveTo(-4, -9, -3, -4); ctx.moveTo(-8, -11); ctx.quadraticCurveTo(-9, -7, -8, -4); ctx.stroke();
  ctx.fillStyle = 'rgba(255,220,170,.22)'; ctx.beginPath(); ctx.ellipse(-2, -11.5, 6, 1.6, -.1, 0, 7); ctx.fill(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,190,120,.85)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, -7, 11, 7, 0, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#2a120a'; ctx.fillRect(-11, -5, 22, 1.6);
  nagler([[-6, -6.5], [1, -7.5]], .9);
  // hodet: en liten isolator med øyne
  ctx.fillStyle = '#d9d2bf'; rr(ctx, 4, -12, 7, 7, 2); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(4, -8.5, 7, 1);
  ctx.fillStyle = v > .5 ? '#ff5a3c' : '#ffe36b'; ctx.beginPath(); ctx.arc(8.2, -9.6, 1.9 + v * .6, 0, 7); ctx.arc(5.4, -10.2, 1.3 + v * .4, 0, 7); ctx.fill();
  // antennene med en liten lysbue mellom seg
  ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(6, -12); ctx.lineTo(4, -17); ctx.moveTo(9, -12); ctx.lineTo(11, -17); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,140,.95)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(4, -17); for (let k = 1; k < 4; k++) ctx.lineTo(4 + k * 1.75, -17 + (Math.sin(t * 30 + k * 2) > 0 ? -1.4 : 1.2)); ctx.lineTo(11, -17); ctx.stroke();
  ctx.restore();
}
// svevegnist: en flygende isolator med summende vinger og en avrevet kabel som henger under
function tegnSveve(e) {
  const X = e.x + e.w / 2, Y = e.y + e.h / 2, t = e.t, va = e.varsel || 0;
  ctx.save(); ctx.translate(X + (va > .5 ? Math.sin(t * 50) * 1.2 : 0), Y); ctx.scale(e.dir * 1.25, 1.25); ctx.lineCap = 'round';
  // vingene: tynne metallrammer med slør
  const v = Math.sin(t * 40) * 3;
  ctx.fillStyle = 'rgba(255,220,180,.32)'; ctx.beginPath(); ctx.ellipse(-3, -8 + v * .3, 8, 3 + v * .5, -.4, 0, 7); ctx.ellipse(4, -8 - v * .3, 8, 3 - v * .4, .4, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,30,.7)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.ellipse(-3, -8 + v * .3, 8, 3 + v * .5, -.4, 0, 7); ctx.ellipse(4, -8 - v * .3, 8, 3 - v * .4, .4, 0, 7); ctx.stroke();
  // kabelen som henger og svinger under
  ctx.strokeStyle = '#1a0c06'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, 6); ctx.quadraticCurveTo(-5 + Math.sin(t * 3) * 3, 11, -3 + Math.sin(t * 3 + 1) * 4, 15); ctx.stroke();
  ctx.strokeStyle = '#e09a54'; ctx.lineWidth = .8; ctx.beginPath(); const kx = -3 + Math.sin(t * 3 + 1) * 4; ctx.moveTo(kx, 15); ctx.lineTo(kx - 1.5, 17); ctx.moveTo(kx, 15); ctx.lineTo(kx + 1.2, 17.2); ctx.stroke();
  // kroppen: en brun isolator med ribber
  const gr = ctx.createLinearGradient(0, -8, 0, 8); gr.addColorStop(0, '#bb5a3e'); gr.addColorStop(.55, '#7a2e1c'); gr.addColorStop(1, '#3a1810');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, 0, 9, 7, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let k = -1; k <= 1; k++) ctx.fillRect(-9, k * 3.6 + .8, 18, 1.2);
  ctx.fillStyle = 'rgba(255,225,190,.2)'; ctx.beginPath(); ctx.ellipse(-2, -4, 5, 1.6, -.2, 0, 7); ctx.fill(); rustFlekker(-9, -7, 18, 14, 31, 2, .7); ctx.restore();
  ctx.strokeStyle = 'rgba(255,190,120,.85)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, 0, 9, 7, 0, 0, 7); ctx.stroke();
  // metallkappe og varselbånd
  ctx.fillStyle = '#5a5e68'; rr(ctx, -4, -9, 8, 3, 1); ctx.fill(); ctx.fillStyle = '#f2c23c'; ctx.fillRect(-6, 4, 12, 2.5); ctx.fillStyle = '#1a1a1a'; for (let k = -5; k < 6; k += 3) ctx.fillRect(k, 4, 1.2, 2.5);
  ctx.fillStyle = va > .5 ? '#ff5a3c' : '#ffe36b'; ctx.beginPath(); ctx.arc(5, -1, 2.4 + va * .6, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(5.6, -1.7, .7, 0, 7); ctx.fill();
  ctx.restore();
}
// releet står på gulvet og blinker mens det lader. Kontaktarmen slår ned når det fyrer.
function tegnRele(e) {
  const X = e.x + e.w / 2, Y = e.y + e.h, lad = e.lad > 0 && Math.sin(S.t * (14 + e.lad * 30)) > 0;
  ctx.save(); ctx.translate(X, Y); ctx.scale(1.15, 1.15); ctx.lineCap = 'round';
  // kabel ut bak
  ctx.strokeStyle = '#1a0c06'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-e.dir * 10, -5); ctx.quadraticCurveTo(-e.dir * 16, -3, -e.dir * 18, 0); ctx.stroke();
  // stålkassen med rust og nagler
  const gr = ctx.createLinearGradient(0, -20, 0, 0); gr.addColorStop(0, '#5e3a2e'); gr.addColorStop(1, '#341a14');
  ctx.fillStyle = gr; rr(ctx, -11, -20, 22, 20, 3); ctx.fill();
  ctx.save(); rr(ctx, -11, -20, 22, 20, 3); ctx.clip(); rustRenner(-11, -20, 22, 20, 61, 3); rustFlekker(-11, -20, 22, 20, 62, 3, .6); ctx.restore();
  ctx.strokeStyle = 'rgba(255,170,110,.85)'; ctx.lineWidth = 1.2; rr(ctx, -11, -20, 22, 20, 3); ctx.stroke();
  nagler([[-8.5, -17.5], [8.5, -17.5], [-8.5, -2.5], [8.5, -2.5]], .8);
  // spolen med kobbervikling
  ctx.fillStyle = '#20120d'; rr(ctx, -7, -17, 9, 13, 1.5); ctx.fill();
  for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#b8662a' : '#e08a3a'; ctx.fillRect(-6, -16 + k * 2.4, 7, 1.6); }
  // kontaktarmen: løftet når den lader, slått ned ellers
  ctx.strokeStyle = '#c9ced8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(3, -14); ctx.lineTo(9, e.lad > 0 ? -17 : -12); ctx.stroke();
  ctx.fillStyle = lad ? '#ffffff' : '#ffe36b'; ctx.beginPath(); ctx.arc(e.dir * 6 + 1, -7, 2.6, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a0c06'; ctx.fillRect(-12, -2, 24, 2);
  ctx.restore();
}
// fagkort: et lite gult kort som svever
function tegnFagkort() { FAG.forEach((f, i) => { if (S.fag.has(i)) return; const X = f.x * T + T / 2, Y = f.y * T + T / 2 + Math.sin(S.t * 2 + i) * 3; if (!synlig(X, Y, 60)) return;
  ctx.save(); ctx.translate(X, Y); ctx.rotate(Math.sin(S.t * 1.3 + i) * .15);
  ctx.fillStyle = f.spor ? '#bfe8ff' : '#ffd36b'; rr(ctx, -8, -10, 16, 20, 2.5); ctx.fill(); ctx.fillStyle = f.spor ? '#10283a' : '#3a2408'; ctx.fillRect(-5, -6, 10, 1.6); ctx.fillRect(-5, -2, 10, 1.6); ctx.fillRect(-5, 2, 7, 1.6);
  ctx.fillStyle = '#e07a22'; ctx.beginPath(); ctx.moveTo(1, 4); ctx.lineTo(-2, 8.5); ctx.lineTo(.5, 8.5); ctx.lineTo(-1, 11); ctx.lineTo(3.5, 6); ctx.lineTo(1, 6); ctx.fill();
  ctx.restore(); }); }
// verkstedbenk ved sjekkpunktet
function tegnVerksted(i) { const c = SJEKK[i], X = (c.x + 1.6) * T, Y = (c.y + 1) * T; if (!synlig(X, Y, 120)) return;
  ctx.fillStyle = '#5a3f27'; ctx.fillRect(X - 22, Y - 18, 44, 5); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(X - 20, Y - 13, 4, 13); ctx.fillRect(X + 16, Y - 13, 4, 13);
  ctx.fillStyle = '#7d89a3'; ctx.fillRect(X - 14, Y - 26, 10, 8); ctx.fillStyle = '#c9ced8'; ctx.fillRect(X + 2, Y - 24, 14, 3); ctx.fillStyle = '#e8b730'; ctx.fillRect(X + 12, Y - 27, 4, 9);
  if (S.verkNaer === i) { ctx.fillStyle = 'rgba(255,197,107,.9)'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center'; ctx.fillText('⚒', X, Y - 36 + Math.sin(S.t * 4) * 2); } }
function tegnKran() {
  const X = KRAN.x, Y = KRAN.y, W = KRAN.w; if (!synlig(X, Y, 300)) return;
  ctx.strokeStyle = '#141a26'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X + W / 2, -40); ctx.lineTo(X + W / 2, Y - 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(X + W / 2, Y - 26); ctx.lineTo(X + 4, Y); ctx.moveTo(X + W / 2, Y - 26); ctx.lineTo(X + W - 4, Y); ctx.stroke();
  ctx.fillStyle = '#d8a43a'; rr(ctx, X + W / 2 - 5, Y - 32, 10, 8, 2); ctx.fill();
  const gr = ctx.createLinearGradient(0, Y, 0, Y + 12); gr.addColorStop(0, '#a57c4c'); gr.addColorStop(1, '#5a3f27');
  ctx.fillStyle = gr; ctx.fillRect(X, Y, W, 10); ctx.fillStyle = 'rgba(255,230,180,.35)'; ctx.fillRect(X, Y, W, 1.4);
  ctx.fillStyle = '#3a2a1a'; for (let i = 0; i < 3; i++) ctx.fillRect(X + 6 + i * (W - 16) / 2, Y + 10, 4, 4);
}
function tegnLysbue() {
  const X = (LYSBUE.x + .5) * T, Y0 = LYSBUE.y0 * T, Y1 = (LYSBUE.y1 + 1) * T; if (!synlig(X, Y0, 100)) return;
  ctx.fillStyle = '#2b3142'; rr(ctx, X - 10, Y0 - 2, 20, 9, 2); ctx.fill(); rr(ctx, X - 10, Y1 - 7, 20, 9, 2); ctx.fill();
  ctx.fillStyle = '#c9a23a'; ctx.fillRect(X - 3, Y0 + 7, 6, 4); ctx.fillRect(X - 3, Y1 - 11, 6, 4);
  const fa = lysbueFase(); ctx.fillStyle = fa === 2 ? '#8ff0ff' : fa === 1 ? (Math.sin(S.t * 30) > 0 ? '#ffb347' : '#553311') : '#334'; ctx.fillRect(X + 5, Y0 + 1, 3, 3);
}
// montøren tegnes av enkle ledd, slik at løp, hopp, fall, landing og støt får hver sin positur
function ledd(hx, hy, a1, a2, l1, l2) { const kx = hx + Math.sin(a1) * l1, ky = hy + Math.cos(a1) * l1; return [kx, ky, kx + Math.sin(a1 - a2) * l2, ky + Math.cos(a1 - a2) * l2]; }
// ---------- montøren: figur, poser og animasjon ----------
// Posene blandes mykt over tid (uavhengig av bildefrekvens), føttene holdes nede på bakken,
// og verktøyet i beltet, hodet og snuingen har litt etterslep så figuren ikke føles stiv.
const ANIM = { sist: -1, p: null, face: 1, bakke: true, vy: 0, vxF: 0, acc: 0, hoppT: 0, flipT: 0, flipDir: 1, air: 0, landT: 0, landK: 0,
  stille: 0, blunkT: 2, blunk: 0, verk: 0, verkV: 0, dy: 0, skli: 0, rullT: 0, vt: 0, tilt: 0, spor: [] };
const POSE_FELT = ['b1', 'b2', 'a1', 'a2'];
function blandPose(a, b, k) { for (const f of POSE_FELT) { a[f][0] += (b[f][0] - a[f][0]) * k; a[f][1] += (b[f][1] - a[f][1]) * k; }
  for (const f of ['bob', 'hode', 'lean', 'tilt', 'blikk']) a[f] += ((b[f] || 0) - (a[f] || 0)) * k; return a; }
const kopiPose = p => ({ b1: [...p.b1], b2: [...p.b2], a1: [...p.a1], a2: [...p.a2], bob: p.bob || 0, hode: p.hode || 0, lean: p.lean || 0, tilt: p.tilt || 0, blikk: p.blikk || 0 });
const mix = (a, b, k) => a + (b - a) * k, glatt = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// ---------- menneskefiguren: montøren, vandreren og folkene du møter ----------
// Proporsjoner nærmere et ekte menneske: lengre bein, mindre hode, avsmalnende lemmer,
// arbeidsklær med refleks, støvler med såle og ansikt med nese, øre og øyebryn.
const KROPP = { hofte: -15, laar: 7.6, legg: 7.4, overarm: 5.8, underarm: 5.4 };
const MONTOR = { bukse: '#25324f', jakke: '#ff8a1e', refleks: true, hjelm: '#ffd23f', sko: '#4a3424', hud: '#e7b48f', har: '#3a2a20', lykt: true, knepute: true, belte: true };
const VANDRER = { bukse: '#2b2a2c', jakke: '#4a433b', refleks: false, hette: '#3d3732', sko: '#2a2420', hud: '#d9ab86', frakk: true, skjerf: true };
function lem(x1, y1, x2, y2, w1, w2) {
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  ctx.beginPath(); ctx.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); ctx.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2); ctx.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2); ctx.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(x1, y1, w1 / 2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x2, y2, w2 / 2, 0, 7); ctx.fill();
}
const morkere = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.round(c * k); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
function benLedd(bak, hy, a1, a2) { return ledd(bak ? -1.3 : 1.3, hy, a1, a2, KROPP.laar, KROPP.legg); }
// tegner et menneske med føttene ved y = 0. lean vipper overkroppen rundt hofta.
function menneske(pose, d, lean, bakke, ekstra) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const hy = KROPP.hofte + pose.bob, hoftY = hy;
  const ben = (a1, a2, bak) => { const hx = bak ? -1.3 : 1.3, [kx, ky, fx, fy] = benLedd(bak, hy, a1, a2);
    ctx.fillStyle = bak ? morkere(d.bukse, .72) : d.bukse; lem(hx, hy, kx, ky, 5.6, 4.4); lem(kx, ky, fx, fy - 1, 4.4, 3.4);
    if (!bak) { ctx.fillStyle = 'rgba(255,255,255,.07)'; lem(hx + 1.2, hy, kx + 1, ky, 1.6, 1.2); }
    if (d.knepute) { ctx.fillStyle = morkere(d.bukse, bak ? .5 : .62); ctx.beginPath(); ctx.ellipse(kx + Math.cos(a1) * .9, ky - Math.sin(a1) * .9, 1.5, 2, -a1, 0, 7); ctx.fill(); }
    if (d.refleks) { const t = .55, bx = kx + (fx - kx) * t, by = ky + (fy - ky) * t, l = Math.hypot(fx - kx, fy - ky) || 1, nx = -(fy - ky) / l, ny = (fx - kx) / l;
      ctx.strokeStyle = bak ? 'rgba(200,214,230,.6)' : 'rgba(232,242,255,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx + nx * 2, by + ny * 2); ctx.lineTo(bx - nx * 2, by - ny * 2); ctx.stroke(); }
    // støvelen: flat mot bakken når den står, peker ned når beinet svinger
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(bakke && fy > -1.8 ? 0 : -(a1 - a2) * .6);
    const sko = S.ev && S.ev.dobbel && d === MONTOR ? '#c4702a' : d.sko;
    ctx.fillStyle = bak ? morkere(sko, .7) : sko;
    ctx.beginPath(); ctx.moveTo(-2.4, -3.6); ctx.lineTo(1.6, -3.6); ctx.lineTo(2.4, -1.6); ctx.quadraticCurveTo(6.4, -1.5, 6.6, .2); ctx.lineTo(-2.8, .2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#121214'; ctx.fillRect(-2.9, .1, 9.7, 1.2); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(2.6, -1.4, 3, .6); ctx.restore(); };
  const arm = (a1, a2, bak) => { const sx = .4, sy = hy - 12, [ex, ey, hx2, hy2] = ledd(sx, sy, a1, -a2, KROPP.overarm, KROPP.underarm);
    ctx.fillStyle = bak ? morkere(d.jakke, .75) : d.jakke; lem(sx, sy, ex, ey, 3.9, 3.3); lem(ex, ey, hx2, hy2, 3.3, 2.8);
    const hanske = d === MONTOR && S.ev && S.ev.hansker; ctx.fillStyle = hanske ? '#f2c23c' : d.hud; ctx.beginPath(); ctx.arc(hx2, hy2, 1.9, 0, 7); ctx.fill();
    ctx.fillStyle = hanske ? '#c99a20' : morkere(d.hud, .82); ctx.beginPath(); ctx.arc(hx2 + .6, hy2 - .8, .9, 0, 7); ctx.fill(); };
  const kropp = () => { ctx.translate(0, hy); ctx.rotate(lean + pose.lean); ctx.translate(0, -hy); };
  ben(pose.b1[0], pose.b1[1], true);
  ctx.save(); kropp(); arm(pose.a1[0], pose.a1[1], true); if (ekstra && ekstra.bak) ekstra.bak(hy); ctx.restore();
  ben(pose.b2[0], pose.b2[1], false);
  ctx.save(); kropp();
  // overkroppen: jakke med skuldre, krage, glidelås og refleksbånd
  const torso = () => { ctx.beginPath(); ctx.moveTo(-5.4, hy + (d.frakk ? 6 : .8)); if (d.frakk) { ctx.lineTo(-3, hy + 4.6); ctx.lineTo(-.6, hy + 6.4); ctx.lineTo(2.4, hy + 4.8); ctx.lineTo(5.6, hy + 6.2); } else ctx.lineTo(5.2, hy + .8);
    ctx.lineTo(6.3, hy - 6); ctx.lineTo(5.5, hy - 11.2); ctx.lineTo(3.2, hy - 13.4); ctx.lineTo(-3.8, hy - 13.4); ctx.lineTo(-6.2, hy - 10.5); ctx.lineTo(-6.4, hy - 4); ctx.closePath(); };
  const jg = ctx.createLinearGradient(-6.4, 0, 6.4, 0); jg.addColorStop(0, morkere(d.jakke, .78)); jg.addColorStop(.6, d.jakke); jg.addColorStop(1, d.jakke);
  ctx.fillStyle = jg; torso(); ctx.fill();
  ctx.save(); torso(); ctx.clip();
  if (d.refleks) { ctx.fillStyle = '#e8f2ff'; ctx.fillRect(-7, hy - 4.6, 14, 1.5); ctx.fillRect(-7, hy - 8.6, 14, 1.5); ctx.fillStyle = 'rgba(120,140,170,.35)'; ctx.fillRect(-7, hy - 3.4, 14, .4); ctx.fillRect(-7, hy - 7.4, 14, .4); }
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(4.6, hy - 11, 1.2, 11); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-7, hy - 13.6, 3, 14);
  if (d.frakk) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-.6, hy - 12, 1.4, 19); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-7, hy - .6, 14, 1.8); }
  else { ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(5.3, hy - .6); ctx.lineTo(5, hy - 12.4); ctx.stroke(); }
  ctx.restore();
  if (d.belte) { ctx.fillStyle = '#2b241c'; ctx.fillRect(-5.6, hy - 1, 11.2, 2.2); ctx.fillStyle = '#b0a080'; ctx.fillRect(3, hy - 1, 2, 2.2); ctx.fillStyle = '#5a4028'; rr(ctx, -7.6, hy - .6, 4.2, 5, 1); ctx.fill(); }
  // hals og krage
  ctx.fillStyle = morkere(d.hud, .85); ctx.fillRect(-.4, hy - 16.6, 3, 3.6);
  ctx.fillStyle = d.skjerf ? '#5a4a3c' : '#24262c'; ctx.beginPath(); ctx.moveTo(-3.4, hy - 12.8); ctx.lineTo(3.4, hy - 12.8); ctx.lineTo(2.6, hy - 14.8); ctx.lineTo(-2.2, hy - 14.8); ctx.closePath(); ctx.fill();
  arm(pose.a2[0], pose.a2[1], false);
  // hodet
  ctx.save(); const hx0 = 1.4, hy0 = hy - 18.8; ctx.translate(0, pose.hode); ctx.translate(1, hy0 + 2); ctx.rotate(pose.tilt || 0); ctx.translate(-1, -(hy0 + 2));
  const bl = pose.blikk || 0;
  if (d.hette) { ctx.fillStyle = d.hette; ctx.beginPath(); ctx.ellipse(hx0 - .8, hy0 - .2, 5.8, 6.2, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-5, hy0); ctx.lineTo(-6.4, hy0 + 6); ctx.lineTo(-1, hy0 + 5); ctx.closePath(); ctx.fill(); }
  else { ctx.fillStyle = d.har || '#3a2a20'; ctx.beginPath(); ctx.ellipse(hx0 - 2, hy0 + .4, 2.8, 3.6, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = d.hud; ctx.beginPath(); ctx.ellipse(hx0 + (d.hette ? 1 : 0), hy0, d.hette ? 3.5 : 4.2, 4.6, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx0 + 3.6, hy0 - .8); ctx.lineTo(hx0 + 5.1, hy0 + .9); ctx.lineTo(hx0 + 3.6, hy0 + 1.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(120,60,40,.18)'; ctx.beginPath(); ctx.ellipse(hx0 - 1.6, hy0 + .6, 2, 3.4, 0, 0, 7); ctx.fill();
  if (!d.hette) { ctx.fillStyle = morkere(d.hud, .8); ctx.beginPath(); ctx.ellipse(hx0 - 1.2, hy0 + .2, 1.1, 1.6, 0, 0, 7); ctx.fill(); }
  if (d.skjegg) { ctx.fillStyle = d.skjegg === true ? '#e8e8ea' : d.skjegg; ctx.beginPath(); ctx.moveTo(hx0 - 1, hy0 + 1); ctx.quadraticCurveTo(hx0 + 1, hy0 + 6.4, hx0 + 4.6, hy0 + 2.6); ctx.lineTo(hx0 + 3.4, hy0 + 1.4); ctx.closePath(); ctx.fill(); }
  else if (d.hette) { ctx.fillStyle = 'rgba(40,30,25,.35)'; ctx.beginPath(); ctx.ellipse(hx0 + 2.4, hy0 + 2.6, 2.2, 1.6, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#1d1d24'; if (pose.blunk) ctx.fillRect(hx0 + 2 + bl * .6, hy0 - .9, 1.8, .6); else { ctx.beginPath(); ctx.ellipse(hx0 + 2.7 + bl * .6, hy0 - .8 - Math.abs(bl) * .2, .65, .8, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(40,26,20,.75)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(hx0 + 1.6, hy0 - 2.2); ctx.lineTo(hx0 + 3.8, hy0 - 2.3); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,40,30,.5)'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(hx0 + 2.3, hy0 + 2.6); ctx.lineTo(hx0 + 3.6, hy0 + 2.5); ctx.stroke();
  if (d.hette) { ctx.strokeStyle = morkere(d.hette, .7); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(hx0 + 1, hy0, 4.2, 5.2, 0, -1.6, 1.7); ctx.stroke(); }
  if (d.hjelm) { const hg = ctx.createLinearGradient(hx0 - 5, 0, hx0 + 5, 0); hg.addColorStop(0, morkere(d.hjelm, .78)); hg.addColorStop(1, d.hjelm);
    ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(hx0 - .2, hy0 - 2.1, 5.5, 4.8, 0, Math.PI, 0); ctx.fill(); rr(ctx, hx0 - 5.8, hy0 - 2.6, 13.4, 1.8, .9); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.ellipse(hx0 - .2, hy0 - 2.4, 3.4, 3.8, 0, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(hx0 - .2, hy0 - 6.8); ctx.lineTo(hx0 - .2, hy0 - 2.6); ctx.stroke();
    if (d.lykt) { ctx.fillStyle = '#2a2a30'; rr(ctx, hx0 + 4, hy0 - 5.4, 2.6, 2.6, .8); ctx.fill(); ctx.fillStyle = '#fff7d0'; ctx.beginPath(); ctx.arc(hx0 + 6.3, hy0 - 4.1, .9, 0, 7); ctx.fill(); } }
  ctx.restore();
  // hånden som retter på hjelmen ligger foran hodet
  if (pose.hjelm > .5) arm(pose.a2[0], pose.a2[1], false);
  ctx.restore();
}
function figur(lean, pose, bakke) {
  const hy = KROPP.hofte + pose.bob;
  // på bakken: hele figuren senkes til den laveste foten står på bakken, så bøyde knær gir en ekte huk
  if (bakke) { ANIM.dy = .4 - Math.max(benLedd(true, hy, pose.b1[0], pose.b1[1])[3], benLedd(false, hy, pose.b2[0], pose.b2[1])[3]); }
  else ANIM.dy += (0 - ANIM.dy) * .3;
  ctx.translate(0, ANIM.dy);
  const vandrer = ANIM.drakt === 'vandrer';
  // verktøyet i beltet henger og dingler etter bevegelsen
  menneske(pose, vandrer ? VANDRER : MONTOR, lean, bakke, vandrer ? null : { bak: hy => { ctx.save(); ctx.translate(-5.8, hy + .8); ctx.rotate(ANIM.verk);
    ctx.strokeStyle = '#6b4a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 7.5); ctx.stroke(); ctx.fillStyle = '#9aa3ad'; ctx.fillRect(-2.6, 6.5, 5.2, 2.2); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-2.6, 6.5, 5.2, .6); ctx.restore(); } });
}
// målposen for øyeblikket; tegnSpiller blander mot den
function poseFor(p) {
  const A = ANIM, fart = Math.min(1, Math.abs(p.vx) / RUN), ph = p.anim;
  if (A.overstyr) return A.overstyr;
  if (p.inv > .95 && S.dod <= 0) { const r = Math.sin(S.t * 30) * .15; return { b1: [-.6, .7], b2: [.5, 1.0], a1: [-2.5 + r, .5], a2: [-2.1 - r, .6], bob: -1, hode: .6, lean: -.15, tilt: -.2, fart: 40 }; }
  if (p.dashT > 0) return { b1: [-.9, .5], b2: [-.4, 1.1], a1: [-1.3, .3], a2: [-1.6, .2], bob: 0, hode: 0, fart: 40 };
  if (p.piskT > -.06) { const k = clamp(1 - p.piskT / .2, 0, 1), sl = 2.7 - k * 1.6;
    const ben = p.onGround ? { b1: [-.35, .25], b2: [.45, .35] } : { b1: [-.3, .6], b2: [.4, .9] };
    return { ...ben, a1: [-.9, .4], a2: [sl, .15], bob: p.onGround ? 1 : 0, hode: -.3, lean: .08 * (1 - k), fart: 45 }; }
  if (p.krok) { const sv = Math.sin(S.t * 6) * .12, sl = clamp(p.vx / 700, -1, 1) * p.face * .7;
    return { b1: [-.3 + sv - sl, .5 + Math.abs(sl) * .4], b2: [.25 - sv - sl, .8], a1: [3.0, .1], a2: [2.9, .15], bob: 0, hode: 0, tilt: -.15, fart: 20 }; }
  if (p.glir) { const sv = Math.sin(S.t * 5) * .1; return { b1: [-.2 + sv, .4], b2: [.25 - sv, .6], a1: [2.85, .15], a2: [3.05, .1], bob: 0, hode: -.2, fart: 14 }; }
  if (p.iVann) { const s = S.t * (4 + fart * 3), k = Math.sin(S.t * 7) * .35;
    return { b1: [-.2 + k, .5], b2: [.1 - k, .6], a1: [s % (Math.PI * 2), .5], a2: [(s + Math.PI) % (Math.PI * 2), .5], bob: 0, hode: -.3, lean: .35 * fart, tilt: -.2, fart: 10 }; }
  if (!p.onGround && p.vegg) { const r = Math.sin(S.t * 40) * .04; return { b1: [.5, .9], b2: [-.2, .5], a1: [2.6 + r, .3], a2: [2.2 - r, .6], bob: 0, hode: .2, tilt: .15, blikk: -1.6, fart: 25 }; }
  if (!p.onGround) {
    // dobbelthopp: en rask salto med knærne trukket inn
    if (A.flipT > 0) return { b1: [1.4, 2.4], b2: [1.6, 2.5], a1: [.6, 1.6], a2: [.9, 1.8], bob: 2, hode: .8, fart: 40 };
    // avspark: beina strekkes ned, armene kastes opp
    if (A.hoppT > 0) return { b1: [-.45, .15], b2: [.15, .2], a1: [-.8, .3], a2: [2.7, .2], bob: -1, hode: -.6, lean: .05, tilt: -.15, fart: 35 };
    // fra stigning, over toppen, til fall: glidende overgang styrt av vertikal fart
    const stig = { b1: [-.35, .9], b2: [.95, 1.6], a1: [-1.2, .5], a2: [2.4, .45], bob: 0, hode: -.5, lean: .06, tilt: -.12 };
    const topp = { b1: [.15, 1.3], b2: [.75, 1.4], a1: [-1.7, .3], a2: [1.8, .3], bob: .5, hode: -.2, lean: 0, tilt: 0 };
    const fl = Math.sin(S.t * (8 + Math.min(10, p.fallT * 14))) * Math.min(.35, .08 + p.fallT * .4);
    const fall = { b1: [-.25, .35], b2: [.35, .45], a1: [-2.4 + fl, .45], a2: [2.6 - fl, .4], bob: 0, hode: .3, lean: -.1, tilt: .12 };
    const k = clamp((p.vy + 420) / 840, 0, 1), m = k < .5 ? kopiPose(stig) : kopiPose(topp);
    blandPose(m, k < .5 ? topp : fall, k < .5 ? k * 2 : (k - .5) * 2); m.fart = 16; return m;
  }
  // kollbøtte: høyt fall i full fart rulles av, i stedet for å stoppe opp
  if (A.rullT > 0) return { b1: [1.5, 2.5], b2: [1.7, 2.6], a1: [1.2, 1.8], a2: [1.4, 1.9], bob: 2, hode: 1, lean: .5, tilt: .4, fart: 45 };
  // landing: en huk som er dypere jo høyere fallet var
  if (A.landT > 0) { const k = A.landK * clamp(A.landT / .22, 0, 1);
    return { b1: [.55 * k + .05, 1.35 * k + .1], b2: [.8 * k, 1.5 * k + .1], a1: [.5 * k, .4], a2: [.9 * k, .6], bob: 0, hode: .8 * k, lean: .22 * k, tilt: .15 * k, fart: 40 }; }
  // brems og snu: lener seg bakover og setter foten foran
  if (A.skli > 0) return { b1: [-.5, .6], b2: [.75, .15], a1: [-1.0, .5], a2: [-.6, .6], bob: 0, hode: .2, lean: -.28, tilt: -.1, fart: 26 };
  if (fart > .05) {
    // gange og løp: løpet får mer knelløft, bøyde albuer og fremoverlent kropp
    const r = glatt(.45, .95, fart), sv = Math.min(1, fart * 2.5);
    const s1 = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
    const loft = x => Math.pow(Math.max(0, Math.cos(x + .35)), 1.4);
    const aks = clamp(A.acc / 2600, -1, 1);
    const fjaer = x => .3 * r * Math.max(0, -Math.cos(x)) * Math.max(0, 1 - Math.abs(Math.sin(x)) * 1.2);
    return { b1: [s1 * (.55 + .38 * r) * sv, .12 + loft(ph) * (.6 + 1.1 * r) * sv + fjaer(ph)], b2: [s2 * (.55 + .38 * r) * sv, .12 + loft(ph + Math.PI) * (.6 + 1.1 * r) * sv + fjaer(ph + Math.PI)],
      a1: [s2 * (.5 + .5 * r) * sv - .15 * r, .25 + 1.3 * r], a2: [s1 * (.5 + .5 * r) * sv - .15 * r, .3 + 1.3 * r],
      bob: 0, hode: Math.abs(Math.cos(ph)) * .5 * r, lean: .03 + .1 * r + Math.max(0, aks) * .1 - Math.max(0, -aks) * .08, tilt: -.08 * r, fart: 24 };
  }
  // stille: pust, vekt over på ett bein, og små handlinger etter en stund
  const pust = Math.sin(S.t * 2.2), vekt = A.stille > 2 ? Math.sin(A.stille * .7) : 0;
  const base = { b1: [-.06 + vekt * .05, .12 + Math.max(0, vekt) * .18], b2: [.06 + vekt * .05, .12 + Math.max(0, -vekt) * .18], a1: [-.15, .2 + pust * .04], a2: [.15, .25 + pust * .04],
    bob: pust * .25, hode: pust * .25, lean: 0, tilt: 0, blikk: 0, blunk: A.blunk > 0, fart: 9 };
  const syk = A.stille > 3 ? (A.stille - 3) % 9 : -1;
  if (syk >= 0 && syk < 1.6) { base.a2 = [2.4, .32]; base.hjelm = 1; base.tilt = -.08; }                               // retter på hjelmen
  else if (syk >= 3.5 && syk < 6) { base.tilt = -.22 + Math.sin(syk * 1.8) * .1; base.blikk = syk < 4.8 ? .8 : -1.6; base.hode = -.4; }  // ser seg rundt og opp
  return base;
}
function oppdaterAnim(p) {
  const A = ANIM; let dt = A.sist < 0 ? 0 : S.t - A.sist; A.sist = S.t; dt = clamp(dt, 0, .05);
  const bakke = p.onGround;
  // overganger som oppdages fra spilltilstanden
  if (A.bakke && !bakke && p.vy < -300 && !p.krok) A.hoppT = .14;
  if (!bakke && p.air < A.air && p.vy < -300) { A.flipT = .34; A.hoppT = 0; }
  if (!A.bakke && bakke && A.vy > 250) { if (A.vy > 640 && Math.abs(p.vx) > 170 && Math.sign(p.vx) === p.face) A.rullT = .36; else { A.landK = clamp(A.vy / 820, .3, 1); A.landT = .1 + .14 * A.landK; } }
  if (p.veggT > 0 && A.vt <= 0 && !bakke) { A.flipT = .34; A.hoppT = 0; } A.vt = p.veggT;
  A.rullT -= dt; if (!bakke) A.rullT = 0;
  A.bakke = bakke; A.vy = p.vy; A.air = p.air;
  A.hoppT -= dt; A.flipT -= dt; A.landT -= dt;
  const aks = dt > 0 ? (p.vx - A.vxF) / dt : 0; A.vxF = p.vx; A.acc += (aks - A.acc) * Math.min(1, dt * 10);
  const dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
  A.skli = bakke && dir && Math.sign(p.vx) === -dir && Math.abs(p.vx) > 110 && p.dashT <= 0 ? .12 : A.skli - dt;
  A.stille = bakke && Math.abs(p.vx) < 20 && !dir && p.piskT <= 0 ? A.stille + dt : 0;
  A.blunkT -= dt; A.blunk -= dt; if (A.blunkT <= 0) { A.blunk = .12; A.blunkT = 2 + Math.random() * 3.5; }
  // verktøyet: en dempet pendel som reagerer på fartsendringer
  A.verkV += (-A.verk * 140 - A.verkV * 7 + clamp(A.acc * p.face, -3000, 3000) * .018 + (bakke ? 0 : clamp(p.vy, -800, 800) * .01)) * dt; A.verk = clamp(A.verk + A.verkV * dt, -1.1, 1.1);
  // snuing: figuren klemmes kort sammen i stedet for å speile seg på ett bilde
  A.face = mot(A.face, p.face, dt / .09);
  const maal = poseFor(p);
  if (!A.p) A.p = kopiPose(maal);
  blandPose(A.p, maal, 1 - Math.exp(-(maal.fart || 18) * dt)); A.p.blunk = maal.blunk; A.p.hjelm = maal.hjelm && Math.abs(A.p.a2[0] - 2.4) < .25 ? 1 : 0;
  return A.p;
}
function tegnSpiller() {
  const p = P; if (S.dod > 0 || p.ror) return;
  const pose = oppdaterAnim(p), A = ANIM;
  // etterbilder fra strømstøtet
  ctx.globalCompositeOperation = 'lighter';
  for (const s of p.spor) { ctx.globalAlpha = s.t / .28 * .5; ctx.fillStyle = '#5fd8ff'; rr(ctx, s.x - 1, s.y + 2, p.w + 2, p.h - 2, 7); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // et mykt lysspor følger montøren når det går fort, som et bånd av strøm
  { const v = Math.hypot(p.vx, p.vy), sp = A.spor; sp.push({ x: p.x + p.w / 2, y: p.y + p.h * .55, t: S.t, v });
    while (sp.length && (S.t - sp[0].t > .2 || sp.length > 40)) sp.shift();
    if (sp.length > 2 && S.kval > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (let i = 1; i < sp.length; i++) { const a = sp[i - 1], b = sp[i], k = 1 - (S.t - b.t) / .2, st = clamp((b.v - 330) / 400, 0, 1); if (st <= 0 || Math.hypot(b.x - a.x, b.y - a.y) > 60) continue;
        ctx.globalAlpha = k * st * .22; ctx.strokeStyle = '#7fdcff'; ctx.lineWidth = 2 + k * 7; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.lineCap = 'butt'; } }
  if (!(p.inv > 0 && Math.floor(p.inv * 18) % 2)) tegnHale();
  const fs = Math.sign(A.face) || p.face, fx = fs * Math.max(.3, Math.abs(A.face));
  ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h); ctx.scale(fx * p.sx, p.sy);
  // i lufta vipper hele kroppen litt i fartsretningen
  const vipp = !p.onGround && !p.krok && A.flipT <= 0 ? clamp(p.vx * p.face / RUN, -1, 1.4) * .12 + clamp(p.vy / 900, -1, 1) * .04 : 0; A.tilt += (vipp - A.tilt) * .2;
  if (Math.abs(A.tilt) > .002) { ctx.translate(0, -15); ctx.rotate(A.tilt); ctx.translate(0, 15); }
  if (A.flipT > 0) { ctx.translate(0, -16); ctx.rotate((1 - A.flipT / .34) * Math.PI * 2); ctx.translate(0, 16); }
  if (A.rullT > 0) { ctx.translate(0, -9); ctx.rotate((1 - A.rullT / .36) * Math.PI * 2); ctx.translate(0, 9); }
  if (p.inv > 0 && Math.floor(p.inv * 18) % 2) ctx.globalAlpha = .45;
  figur(p.lean * p.face, pose, p.onGround && A.flipT <= 0 && A.rullT <= 0);
  ctx.restore(); ctx.globalAlpha = 1;
}
// felles for bossene: rust, nagler, rustrenner og glødende sømmer
function rustFlekker(x, y, w, h, fro, n, a) {
  for (let i = 0; i < n; i++) { const rx = x + hs(fro, i, 1) * w, ry = y + hs(fro, i, 2) * h, r = 1.5 + hs(fro, i, 3) * 5;
    ctx.fillStyle = hs(fro, i, 4) < .5 ? `rgba(118,56,24,${.55 * (a || 1)})` : `rgba(168,88,40,${.45 * (a || 1)})`; ctx.beginPath(); ctx.ellipse(rx, ry, r, r * .7, hs(fro, i, 5) * 3, 0, 7); ctx.fill(); }
}
function rustRenner(x, y, w, h, fro, n) {
  for (let i = 0; i < (n || 4); i++) { const rx = x + hs(fro, i, 7) * w, l = h * (.3 + hs(fro, i, 8) * .6), g = ctx.createLinearGradient(0, y, 0, y + l);
    g.addColorStop(0, 'rgba(140,66,28,.6)'); g.addColorStop(1, 'rgba(140,66,28,0)'); ctx.fillStyle = g; ctx.fillRect(rx, y, 1.4 + hs(fro, i, 9) * 2, l); }
}
function nagler(pkt, r) { r = r || 1.5; for (const [x, y] of pkt) { ctx.fillStyle = '#12151c'; ctx.beginPath(); ctx.arc(x, y + .7, r + .4, 0, 7); ctx.fill(); ctx.fillStyle = '#8d93a0'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } }
// treffblink: et mykt, rundt hvitt lys over bossen (source-atop på hovedlerretet farget hele firkanten rundt den hvit)
function bossBlink(a) { if (a <= 0) return; ctx.globalCompositeOperation = 'lighter'; glod(SPR.h, 0, -4, 44, a * .7); glod(SPR.c, 0, -4, 70, a * .4); ctx.globalCompositeOperation = 'source-over'; }
function tegnBoss() {
  if (!B.aktiv) return;
  const X = B.x, Y = B.y, a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1, flimmer = B.stun > 0 && Math.sin(S.t * 40) > 0;
  const raseri = 3 - B.hp, v = B.varsel, rist = (B.fase === 'dod' ? 8 : v * 3) * (Math.random() - .5);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(X + rist, Y + (v > 0 ? -v * 4 : 0));
  const sk = 1 + B.lad * .08; ctx.scale(sk, sk); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // kabelarmene: tykk isolasjon, avskallet kobber ytterst. Før et slag krøller de seg opp.
  for (let i = 0; i < 5; i++) { const ox = -24 + i * 12, l = (34 + Math.sin(S.t * 2 + i) * 8 + raseri * 4) * (1 - v * .45), sv = Math.sin(S.t * 1.7 + i) * 14, sv2 = Math.sin(S.t * 1.3 + i) * 14;
    const ex = ox + Math.sin(S.t + i) * 6 + v * (ox * .6), ey = 18 + l;
    ctx.strokeStyle = '#0c0e14'; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(ox, 18); ctx.bezierCurveTo(ox + sv, 18 + l * .5, ox - sv2, 18 + l * .8, ex, ey); ctx.stroke();
    ctx.strokeStyle = i % 2 ? '#2b2f3c' : '#3a2a26'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#d98a46'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.sin(S.t * 3 + i) * 3, ey + 5); ctx.moveTo(ex, ey); ctx.lineTo(ex - 3, ey + 4); ctx.stroke();
    if (hs(i, (S.t * 9) | 0, 3) < .25 + raseri * .12) { ctx.strokeStyle = 'rgba(230,200,255,.95)'; ctx.lineWidth = 1; jagget(ex, ey + 4, ex + (hs(i, (S.t * 9) | 0, 4) - .5) * 14, ey + 12, 3, 3, (S.t * 30 | 0) + i); } }
  // sikringspatronene på sidene slukner etter hvert som sikringene slås av
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const tent = (s < 0 ? k : k + 4) < (B.hp / 3) * 8 + .01, cx = s * 36, cy = -14 + k * 9;
    ctx.fillStyle = '#c9c2b0'; rr(ctx, cx - 8, cy - 3.5, 16, 7, 3.5); ctx.fill(); ctx.fillStyle = '#7b7f88'; ctx.fillRect(cx - 8, cy - 3.5, 3, 7); ctx.fillRect(cx + 5, cy - 3.5, 3, 7);
    ctx.fillStyle = tent ? (Math.sin(S.t * 8 + k) > -.6 ? '#ffb45a' : '#ffd98a') : '#3a2a22'; ctx.fillRect(cx - 4, cy - 1.6, 8, 3.2);
    if (!tent) { ctx.strokeStyle = '#1a1210'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 3, cy - 3); ctx.lineTo(cx + 1, cy + 3); ctx.stroke(); } }
  // skapet: rusten stålkasse med naglede kanter, bulket hjørne og en sprukket måler
  const base = raseri === 2 ? ['#5a3a34', '#21140f'] : raseri === 1 ? ['#4b4048', '#1d181c'] : ['#47505e', '#1b1f28'];
  const gr = ctx.createLinearGradient(0, -30, 0, 26); gr.addColorStop(0, base[0]); gr.addColorStop(1, base[1]);
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-22, -30); ctx.lineTo(30, -30); ctx.lineTo(32, -26); ctx.lineTo(32, 18); ctx.lineTo(26, 24); ctx.lineTo(-30, 24); ctx.lineTo(-32, 18); ctx.lineTo(-32, -20); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); rustFlekker(-32, -30, 64, 54, 11, 16); rustRenner(-30, -26, 60, 46, 12, 5);
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(-32, -30, 64, 3); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-32, 18, 64, 6); ctx.restore();
  ctx.strokeStyle = v > 0 ? `rgba(255,${120 - v * 70},60,${.4 + v * .6})` : '#0c0e14'; ctx.lineWidth = v > 0 ? 2.4 : 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,160,180,.25)'; ctx.lineWidth = 1; rr(ctx, -27, -25, 54, 44, 4); ctx.stroke();
  nagler([[-28, -26], [28, -26], [-28, 20], [28, 20], [0, -26], [0, 20], [-28, -3], [28, -3]], 1.4);
  // fareskiltet, falmet
  ctx.fillStyle = 'rgba(214,170,50,.75)'; ctx.beginPath(); ctx.moveTo(19, 4); ctx.lineTo(25, 14); ctx.lineTo(13, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(18.5, 7.5, 1.2, 4);
  // toppen: to isolatorer. Når den lader, slår en bue mellom dem.
  ctx.fillStyle = '#20242f'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 10 - 2, -36, 4, 7);
  for (const s of [-16, 16]) { ctx.fillStyle = '#6b4a34'; ctx.fillRect(s - 1.5, -37, 3, 8); for (let r = 0; r < 3; r++) { ctx.fillStyle = r % 2 ? '#a77a52' : '#c49468'; rr(ctx, s - 6 + r * .5, -47 + r * 4, 12 - r, 4, 2); ctx.fill(); }
    ctx.fillStyle = '#9aa2b0'; ctx.fillRect(s - 2, -50, 4, 3); }
  if (B.lad > .05 || raseri === 2) { ctx.strokeStyle = `rgba(235,210,255,${Math.min(1, .35 + B.lad)})`; ctx.lineWidth = 1.4; jagget(-16, -50, 16, -50, 5 + B.lad * 4, 7, (S.t * 24) | 0); }
  // måleren: sprukket glass foran kjernen, nåla slår ut mot rødt når den lader
  const puls = Math.min(1, .7 + .3 * Math.sin(S.t * 6) + v * .6 + B.lad * .5), kr = 14 + B.lad * 4;
  ctx.fillStyle = '#0d0f16'; ctx.beginPath(); ctx.arc(0, -4, 17, 0, 7); ctx.fill(); ctx.strokeStyle = '#9ba3b4'; ctx.lineWidth = 2.2; ctx.stroke();
  const cg = ctx.createRadialGradient(0, -4, 0, 0, -4, kr); cg.addColorStop(0, '#ffffff'); cg.addColorStop(.4, raseri === 2 ? `rgba(255,120,200,${puls})` : `rgba(200,150,255,${puls})`); cg.addColorStop(1, 'rgba(120,60,220,.15)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, -4, Math.min(15.5, kr), 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(20,16,30,.6)'; ctx.lineWidth = 1; for (let i = 0; i < 7; i++) { const vv = Math.PI * (.85 + i * .22); ctx.beginPath(); ctx.moveTo(Math.cos(vv) * 12, -4 + Math.sin(vv) * 12); ctx.lineTo(Math.cos(vv) * 15, -4 + Math.sin(vv) * 15); ctx.stroke(); }
  const nv = Math.PI * (1.05 + clamp(.15 + raseri * .2 + B.lad * .5 + v * .3 + Math.sin(S.t * 13) * .03, 0, 1) * .9);
  ctx.strokeStyle = '#1a0f12'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(Math.cos(nv) * 13, -4 + Math.sin(nv) * 13); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = .9; ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(-3, -7); ctx.lineTo(-6, 1); ctx.moveTo(-3, -7); ctx.lineTo(4, -9); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-6, -11, 6, 3, -.6, 0, 7); ctx.fill();
  // visiret med øynene over måleren
  ctx.fillStyle = '#0b0d13'; rr(ctx, -20, -26, 40, 8, 3); ctx.fill();
  if (B.stun > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 7, -25); ctx.lineTo(s * 13, -19); ctx.moveTo(s * 13, -25); ctx.lineTo(s * 7, -19); ctx.stroke(); } }
  else { ctx.fillStyle = v > .3 ? '#ff6a4a' : '#ffd8ff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -21); ctx.lineTo(s * 17, -24 - raseri); ctx.lineTo(s * 16, -20); ctx.closePath(); ctx.fill(); } }
  bossBlink(flimmer ? .75 : 0);
  ctx.restore(); ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}
function tegnSpesialFliser() {
  // spøkelsesplattformer: tydelige med spenningstesteren, bare et svakt flimmer uten
  for (const [x, y] of ghoListe) { const X = x * T, Y = y * T; if (!synlig(X, Y, T)) continue;
    if (S.ev.tester) { ctx.fillStyle = 'rgba(255,210,90,.18)'; ctx.fillRect(X, Y, T, 10); ctx.strokeStyle = 'rgba(255,214,110,.9)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.strokeRect(X + .75, Y + .75, T - 1.5, 9); ctx.setLineDash([]); }
    else if (Math.sin(S.t * 3 + x * 1.7) > .85) { ctx.fillStyle = 'rgba(255,220,140,.08)'; ctx.fillRect(X, Y, T, 10); } }
  // svake vegger: murstein med sprekker
  SVAKE.forEach((v, i) => { if (S.knust.has(i) || !synlig(v.x0 * T, v.y0 * T, 200)) return;
    for (let y = v.y0; y <= v.y1; y++) for (let x = v.x0; x <= v.x1; x++) { if (tile(x, y) !== SVAK) continue; const X = x * T, Y = y * T;
      ctx.fillStyle = '#4a3a34'; ctx.fillRect(X - .5, Y - .5, T + 1, T + 1); ctx.fillStyle = '#5d4840';
      for (let r = 0; r < 4; r++) for (let k = -1; k < 2; k++) { const bx = X + k * 16 + (r % 2) * 8 + 1; ctx.fillRect(Math.max(X, bx), Y + r * 8 + 1, Math.min(14, X + T - Math.max(X, bx)), 6); }
      ctx.strokeStyle = 'rgba(10,6,4,.8)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(X + 6 + hs(x, y, 1) * 10, Y); ctx.lineTo(X + 14, Y + 12); ctx.lineTo(X + 9 + hs(x, y, 2) * 12, Y + 22); ctx.lineTo(X + 18, Y + T); ctx.stroke(); } });
  // transformatorer
  for (const [x0, y0, x1, y1] of TRAFOER) { const X = x0 * T, Y = y0 * T, W = (x1 - x0 + 1) * T, H = (y1 - y0 + 1) * T; if (!synlig(X, Y, 200)) continue;
    const gr = ctx.createLinearGradient(X, 0, X + W, 0); gr.addColorStop(0, '#4a5568'); gr.addColorStop(.5, '#5f6b80'); gr.addColorStop(1, '#3a4252');
    ctx.fillStyle = gr; ctx.fillRect(X, Y, W, H); ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let i = X + 8; i < X + W - 4; i += 9) ctx.fillRect(i, Y + 10, 4, H - 16);
    for (let i = 0; i < 3; i++) { const ix = X + W * (.25 + i * .25); ctx.fillStyle = '#c9a77a'; for (let k = 0; k < 4; k++) rr(ctx, ix - 6 + k, Y - 8 - k * 6, 12 - k * 2, 5, 2), ctx.fill(); }
    ctx.fillStyle = '#f2c23c'; ctx.beginPath(); ctx.moveTo(X + W / 2, Y + H / 2 - 10); ctx.lineTo(X + W / 2 + 10, Y + H / 2 + 7); ctx.lineTo(X + W / 2 - 10, Y + H / 2 + 7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#222'; ctx.fillRect(X + W / 2 - .8, Y + H / 2 - 5, 1.6, 7); }
}
function tegnBoss3() {
  if (!B3.aktiv) return;
  const a = B3.fase === 'dod' ? clamp(B3.dod / 3.2, 0, 1) : 1, f = B3.aktiv ? b3Fase() : 1, hev = B3.hev, flimmer = B3.stun > 0 && Math.sin(S.t * 40) > 0, kne = B3.ned > 0, v = B3.varsel;
  const [kx, ky] = b3Kjerne();
  ctx.save(); ctx.globalAlpha = a; ctx.translate(B3.x + (B3.fase === 'dod' ? (Math.random() - .5) * 10 : 0), B3.y); ctx.lineJoin = 'round';
  const topp = -130 + (kne ? 40 : 0), bunn = -30 + (kne ? 20 : 0);
  // beina: naglede stålbjelker med fotplater
  for (const s of [-1, 1]) { const x0 = s < 0 ? -30 : 12, y0 = -40 + (kne ? 20 : 0);
    ctx.fillStyle = '#232936'; ctx.fillRect(x0, y0, 18, -y0); ctx.fillStyle = '#31394a'; ctx.fillRect(x0 + 3, y0, 12, -y0); ctx.fillStyle = '#1a1f29'; ctx.fillRect(x0 + 7, y0, 4, -y0);
    rustRenner(x0, y0, 18, -y0, 31 + s, 3); ctx.fillStyle = '#1a1e27'; rr(ctx, x0 - 4, -6, 26, 6, 2); ctx.fill(); nagler([[x0 + 2, -3], [x0 + 16, -3]], 1.2); }
  // kjøleradiatorer på sidene
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = s * (42 + i * 3.2); ctx.fillStyle = i % 2 ? '#2e3646' : '#3a4356'; ctx.fillRect(x - 1.4, topp + 26, 2.8, bunn - topp - 34); }
  // tanken
  const gr = ctx.createLinearGradient(-40, 0, 40, 0); gr.addColorStop(0, '#3e4656'); gr.addColorStop(.5, '#5a6478'); gr.addColorStop(1, '#2c3240');
  ctx.fillStyle = gr; rr(ctx, -40, topp + 10, 80, bunn - topp - 10, 8); ctx.fill();
  ctx.save(); rr(ctx, -40, topp + 10, 80, bunn - topp - 10, 8); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,.22)'; for (let y = topp + 22; y < bunn - 6; y += 10) ctx.fillRect(-34, y, 68, 3.5);
  ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let y = topp + 25.5; y < bunn - 6; y += 10) ctx.fillRect(-34, y, 68, 1);
  rustFlekker(-40, topp + 10, 80, bunn - topp, 33, 22, .55); rustRenner(-36, topp + 14, 72, bunn - topp - 20, 34, 6);
  // oljesøl fra en lekk pakning
  const og = ctx.createLinearGradient(0, topp + 40, 0, bunn); og.addColorStop(0, 'rgba(10,8,6,.55)'); og.addColorStop(1, 'rgba(10,8,6,0)'); ctx.fillStyle = og; ctx.fillRect(22, topp + 40, 5, bunn - topp - 40); ctx.restore();
  ctx.strokeStyle = '#151922'; ctx.lineWidth = 2; rr(ctx, -40, topp + 10, 80, bunn - topp - 10, 8); ctx.stroke();
  nagler([[-35, topp + 15], [35, topp + 15], [-35, bunn - 5], [35, bunn - 5], [-35, (topp + bunn) / 2], [35, (topp + bunn) / 2]], 1.5);
  // merkeskiltet og fareskiltet
  ctx.fillStyle = '#a9a48e'; rr(ctx, -30, bunn - 22, 16, 10, 1.5); ctx.fill(); ctx.fillStyle = '#4a463c'; for (let i = 0; i < 3; i++) ctx.fillRect(-28, bunn - 20 + i * 3, 12 - i * 3, 1);
  ctx.fillStyle = '#d9b03a'; ctx.beginPath(); ctx.moveTo(22, bunn - 24); ctx.lineTo(30, bunn - 11); ctx.lineTo(14, bunn - 11); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(23, bunn - 21); ctx.lineTo(20.5, bunn - 16.5); ctx.lineTo(23.5, bunn - 16.5); ctx.lineTo(21, bunn - 12.5); ctx.stroke();
  // gjennomføringene på skuldrene: høye porselensstabler med kobberhetter
  const bus = [-26, 26].map(s => [s, topp + 10]);
  for (const [bx, by] of bus) { for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#8a5e3c' : '#b07a52'; rr(ctx, bx - 6 + k * .5, by - 6 - k * 6, 12 - k, 5, 2.4); ctx.fill(); }
    ctx.fillStyle = '#c98a4a'; ctx.fillRect(bx - 2.5, by - 38, 5, 6); ctx.fillStyle = v > 0 ? `rgba(255,${200 - v * 120},90,1)` : '#e0a060'; ctx.beginPath(); ctx.arc(bx, by - 39, 3, 0, 7); ctx.fill(); }
  if (v > .2 || (B3.stun <= 0 && hs(3, (S.t * 6) | 0, 9) < .15)) { ctx.strokeStyle = `rgba(255,230,180,${Math.max(.5, v)})`; ctx.lineWidth = 1.4; jagget(-26, topp - 29, 26, topp - 29, 6 + v * 6, 9, (S.t * 24) | 0); }
  // stang som løfter kjernen i siste fase
  if (hev > .05) { const sy = ky - B3.y; ctx.fillStyle = '#39425a'; ctx.fillRect(-7, sy, 14, topp + 10 - sy); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-5, sy, 3, topp + 10 - sy);
    ctx.strokeStyle = 'rgba(255,200,120,.5)'; ctx.lineWidth = 1; for (let y = sy + 12; y < topp; y += 16) { ctx.beginPath(); ctx.moveTo(-9, y); ctx.lineTo(9, y + 6); ctx.stroke(); } }
  // armene: gitterbommer med isolatorkjeder som gløder før slaget
  for (const s of [-1, 1]) { const sv = Math.sin(B3.t * 2 + s) * .2 + (v * .8);
    ctx.save(); ctx.translate(s * 40, topp + 30); ctx.rotate(s * (.35 + sv));
    ctx.fillStyle = '#20252f'; ctx.fillRect(-8, -4, 16, 10); nagler([[-4, 1], [4, 1]], 1.2);
    ctx.strokeStyle = '#3a4252'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(-5, 62); ctx.moveTo(5, 4); ctx.lineTo(5, 62); ctx.stroke();
    ctx.lineWidth = 1.5; ctx.beginPath(); for (let y = 6; y < 60; y += 11) { ctx.moveTo(-5, y); ctx.lineTo(5, y + 11); ctx.moveTo(5, y); ctx.lineTo(-5, y + 11); } ctx.stroke();
    for (let k = 0; k < 4; k++) { ctx.fillStyle = v > 0 ? `rgb(${201 + v * 54},${167 - v * 40},${122 - v * 70})` : '#c9a77a'; rr(ctx, -9, 62 + k * 7, 18, 5, 2.4); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-9, 65.5 + k * 7, 18, 1.5); }
    ctx.fillStyle = '#6b7280'; ctx.fillRect(-3, 90, 6, 6); ctx.restore(); }
  // hodet: ekspansjonstanken, liggende over kroppen, med et smalt visir
  const hy = hev > .05 ? Math.min(topp, ky - B3.y - 30) : topp;
  ctx.fillStyle = '#1f242f'; ctx.fillRect(-4, hy + 12, 8, 8);
  const hg = ctx.createLinearGradient(0, hy - 10, 0, hy + 14); hg.addColorStop(0, '#4a5366'); hg.addColorStop(1, '#1d222c'); ctx.fillStyle = hg; rr(ctx, -27, hy - 10, 54, 24, 11); ctx.fill();
  ctx.strokeStyle = '#11141b'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.save(); rr(ctx, -27, hy - 10, 54, 24, 11); ctx.clip(); rustFlekker(-27, hy - 10, 54, 24, 35, 6); ctx.restore();
  ctx.fillStyle = '#090b10'; rr(ctx, -20, hy - 2, 40, 9, 4); ctx.fill();
  ctx.fillStyle = B3.stun > 0 ? '#fff' : v > .3 ? '#ff6a3a' : '#ffb347'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 5, hy + 4); ctx.lineTo(s * 17, hy - .5); ctx.lineTo(s * 16, hy + 6); ctx.closePath(); ctx.fill(); }
  // brystplaten (fase 1) eller kjernen
  const aapen = (f === 1 && B3.sar > 0) || (f === 2 && kne) || (f === 3 && B3.sar > 0);
  ctx.translate(kx - B3.x, ky - B3.y);
  ctx.fillStyle = '#1a1e27'; rr(ctx, -19, -19, 38, 38, 7); ctx.fill();
  ctx.fillStyle = aapen ? '#fff6d8' : '#7e5228'; ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 2; rr(ctx, -16, -16, 32, 32, 6); ctx.fill(); ctx.stroke();
  if (!aapen) { ctx.save(); rr(ctx, -16, -16, 32, 32, 6); ctx.clip(); rustFlekker(-16, -16, 32, 32, 36, 8); ctx.restore(); }
  nagler([[-15, -15], [15, -15], [-15, 15], [15, 15]], 1.4);
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 14); cg.addColorStop(0, '#fff'); cg.addColorStop(.5, aapen ? 'rgba(255,220,140,.95)' : 'rgba(255,140,60,.8)'); cg.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, aapen ? 14 : 9, 0, 7); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
  if (flimmer) { ctx.save(); ctx.globalAlpha = .45 * a; ctx.globalCompositeOperation = 'lighter'; glod(SPR.h, B3.x, B3.y - 70, 90, .5); ctx.restore(); }
}
function tegnBoss4() {
  if (!B4.aktiv) return;
  const a = B4.fase === 'dod' ? clamp(B4.dod / 3, 0, 1) : 1, [hx, hy] = b4Navn(), flimmer = B4.stun > 0 && Math.sin(S.t * 40) > 0, gulv = TURBIN.gulv * T;
  ctx.globalAlpha = a; ctx.lineJoin = 'round';
  // akslingen ned til fundamentet
  const sg = ctx.createLinearGradient(hx - 18, 0, hx + 18, 0); sg.addColorStop(0, '#1a201c'); sg.addColorStop(.35, '#3a463e'); sg.addColorStop(1, '#151a17');
  ctx.fillStyle = sg; ctx.fillRect(hx - 18, hy, 36, gulv - hy); rustRenner(hx - 16, hy + 40, 32, gulv - hy - 60, 41, 4);
  for (let y = hy + 70; y < gulv - 30; y += 46) { ctx.fillStyle = '#121613'; ctx.fillRect(hx - 20, y, 40, 6); nagler([[hx - 14, y + 3], [hx + 14, y + 3]], 1.3); }
  // fundamentet i betong, med farestriper og et merkeskilt
  ctx.fillStyle = '#2c312e'; rr(ctx, hx - 74, gulv - 30, 148, 30, 4); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(hx - 72, gulv - 30, 144, 3);
  ctx.save(); rr(ctx, hx - 74, gulv - 30, 148, 30, 4); ctx.clip(); ctx.fillStyle = 'rgba(214,170,50,.55)'; for (let i = -80; i < 80; i += 16) { ctx.beginPath(); ctx.moveTo(hx + i, gulv - 8); ctx.lineTo(hx + i + 8, gulv - 8); ctx.lineTo(hx + i + 16, gulv); ctx.lineTo(hx + i + 8, gulv); ctx.closePath(); ctx.fill(); }
  rustFlekker(hx - 74, gulv - 30, 148, 22, 42, 8, .6); ctx.restore();
  ctx.fillStyle = '#a9a48e'; rr(ctx, hx + 26, gulv - 25, 22, 12, 1.5); ctx.fill(); ctx.fillStyle = '#4a463c'; for (let i = 0; i < 3; i++) ctx.fillRect(hx + 28, gulv - 23 + i * 3.4, 18 - i * 4, 1.1);
  nagler([[hx - 66, gulv - 22], [hx + 66, gulv - 22], [hx - 40, gulv - 22], [hx + 18, gulv - 22]], 1.6);
  // statoren: en tung ring med boltede flenser og kobberviklinger
  ctx.save(); ctx.translate(hx, hy);
  ctx.strokeStyle = '#0d110f'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(0, 0, 58, 0, 7); ctx.stroke();
  ctx.strokeStyle = flimmer ? '#e8fbff' : '#3b4a40'; ctx.lineWidth = 15; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 64, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
  for (let i = 0; i < 16; i++) { const v = i / 16 * 6.283, w = .2; ctx.strokeStyle = '#7a3e1c'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 57, v, v + w); ctx.stroke();
    ctx.strokeStyle = B4.golv === 2 ? '#ffd9a0' : '#d0803e'; ctx.lineWidth = 3.4; ctx.stroke(); ctx.strokeStyle = 'rgba(255,230,190,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 55.5, v + .02, v + w - .02); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { const v = (i + .5) / 12 * 6.283; nagler([[Math.cos(v) * 66, Math.sin(v) * 66]], 1.6); }
  // rotoren snurrer: skovler med lys kant
  ctx.save(); ctx.rotate(B4.vinkel * 2.2);
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); const bg = ctx.createLinearGradient(-6, 0, 6, 0); bg.addColorStop(0, flimmer ? '#fff' : '#56665b'); bg.addColorStop(1, flimmer ? '#dff' : '#2c3530');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-5, -14); ctx.lineTo(-7, -44); ctx.quadraticCurveTo(0, -49, 7, -44); ctx.lineTo(5, -14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(200,230,210,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -16); ctx.lineTo(-7, -43); ctx.stroke(); }
  ctx.restore();
  // navet med øyne
  ctx.fillStyle = '#1b221e'; ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fill(); ctx.strokeStyle = '#4c5a50'; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 6; i++) { const v = i / 6 * 6.283 + B4.vinkel * 2.2; nagler([[Math.cos(v) * 15, Math.sin(v) * 15]], 1.1); }
  ctx.fillStyle = '#0a0d0b'; rr(ctx, -13, -8, 26, 9, 4); ctx.fill();
  ctx.restore();
  ctx.fillStyle = B4.stun > 0 ? '#fff' : '#7fe0ff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(hx + s * 3, hy - 2); ctx.lineTo(hx + s * 12, hy - 6); ctx.lineTo(hx + s * 11, hy + 2); ctx.closePath(); ctx.fill(); }
  // kullbørstene på veggene: holderen med fjær, og børsten som gløder når den er åpen for et støt
  BORSTER.forEach(([x, y, r], i) => { const X = x * T, Y = y * T; if (!synlig(X, Y, 60)) return; const aktiv = B4.borste === i, hx0 = r > 0 ? X : X - 16;
    ctx.fillStyle = '#1d1f22'; rr(ctx, hx0, Y + 3, 16, 26, 2); ctx.fill(); ctx.strokeStyle = '#3c4044'; ctx.lineWidth = 1.2; ctx.stroke(); nagler([[hx0 + 4, Y + 6], [hx0 + 12, Y + 6], [hx0 + 4, Y + 26], [hx0 + 12, Y + 26]], 1);
    ctx.fillStyle = aktiv ? '#fff2c8' : '#3e3832'; ctx.fillRect(hx0 + 3, Y + 9, 10, 14);
    ctx.strokeStyle = '#8a8f96'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 5; k++) { ctx.moveTo(r > 0 ? X - 2 - k * 2 : X + 2 + k * 2, Y + 12); ctx.lineTo(r > 0 ? X - 3 - k * 2 : X + 3 + k * 2, Y + 20); } ctx.stroke();
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(X, Y + 16); ctx.lineTo(r > 0 ? X - 13 : X + 13, Y + 16); ctx.stroke();
    if (aktiv && hs(i, (S.t * 14) | 0, 2) < .5) { ctx.strokeStyle = 'rgba(255,240,200,.95)'; ctx.lineWidth = 1; jagget(r > 0 ? X - 13 : X + 13, Y + 16, r > 0 ? X - 22 : X + 22, Y + 10 + hs(i, (S.t * 14) | 0, 3) * 12, 3, 3, (S.t * 30) | 0); } });
  ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
}
function tegnBoss2() {
  if (!B2.aktiv) return;
  const X = B2.x, Y = B2.y, a = B2.fase === 'dod' ? clamp(B2.dod / 2.4, 0, 1) : 1, rs = 3 - B2.hp, ned = B2.ned > 0;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(X + (B2.fase === 'dod' ? (Math.random() - .5) * 8 : 0), Y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // kablene den henger i: tykke, med teipede skjøter
  for (const s of [-1, 1]) { const tx = s * 26, ty = -(Y - 43 * T);
    ctx.strokeStyle = '#07090e'; ctx.lineWidth = 5.5; ctx.beginPath(); ctx.moveTo(s * 13, -22); ctx.bezierCurveTo(s * 20, -60, s * 10, -120, tx, ty); ctx.stroke();
    ctx.strokeStyle = '#232a36'; ctx.lineWidth = 3.4; ctx.stroke();
    for (const k of [.18, .42]) { const px = s * (13 + 8 * k), py = -22 - 60 * k * 1.6; ctx.fillStyle = '#9a8a3a'; ctx.fillRect(px - 3.5, py - 2.5, 7, 5); } }
  // armene: avisolerte kabelbunter med kobbertråder som spriker og gnistrer
  for (const s of [-1, 1]) { const vift = Math.sin(B2.t * 3 + s) * .3 + (ned ? .9 : 0), ex = s * 30, ey = 30 + vift * 8;
    ctx.strokeStyle = '#0a0c10'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(s * 18, 0); ctx.quadraticCurveTo(s * 36, 10 + vift * 10, ex, ey); ctx.stroke();
    ctx.strokeStyle = '#3b2c22'; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.strokeStyle = '#d68a3a'; ctx.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + s * k * 1.6 + k, ey + 7 + Math.abs(k) * -.8); ctx.stroke(); }
    if (!ned && hs(s + 3, (S.t * 10) | 0, 5) < .35 + rs * .15) { ctx.strokeStyle = 'rgba(200,245,255,.95)'; ctx.lineWidth = 1; jagget(ex, ey + 7, ex + s * (4 + hs(s, (S.t * 10) | 0, 6) * 10), ey + 16, 3, 3, (S.t * 30 | 0) + s); } }
  const flimmer = B2.stun > 0 && Math.sin(S.t * 40) > 0;
  // selve koblingsboksen: sekskantet, rusten, med lokket hengende på ett hengsel
  const kropp = () => { ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(23, -11); ctx.lineTo(19, 19); ctx.lineTo(0, 27); ctx.lineTo(-19, 19); ctx.lineTo(-23, -11); ctx.closePath(); };
  const gr = ctx.createLinearGradient(0, -26, 0, 26); gr.addColorStop(0, rs === 2 ? '#3d5462' : '#3b4c64'); gr.addColorStop(1, '#121924');
  ctx.fillStyle = gr; kropp(); ctx.fill(); ctx.save(); ctx.clip(); rustFlekker(-23, -27, 46, 54, 21, 12); rustRenner(-18, -6, 36, 30, 22, 4); ctx.restore();
  ctx.strokeStyle = '#0a0d14'; ctx.lineWidth = 2; kropp(); ctx.stroke(); ctx.strokeStyle = 'rgba(160,190,220,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-21, -10); ctx.lineTo(0, -24); ctx.lineTo(21, -10); ctx.stroke();
  nagler([[0, -22], [-17, -9], [17, -9], [-15, 15], [15, 15], [0, 22]], 1.3);
  // lokket henger løst og dingler
  ctx.save(); ctx.translate(-19, 19); ctx.rotate(.9 + Math.sin(B2.t * 2.4) * .12); ctx.fillStyle = '#2c3a4c'; rr(ctx, -3, 0, 7, 22, 2); ctx.fill(); ctx.strokeStyle = '#0a0d14'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
  // rekkeklemmer i bakelitt med messingskruer på toppen
  ctx.fillStyle = '#16120f'; rr(ctx, -13, -33, 26, 7, 2); ctx.fill(); ctx.fillStyle = '#c9a23a'; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 8, -29.5, 1.8, 0, 7); ctx.fill(); }
  // vinduet: to kobberelektroder med en lysbue mellom seg
  ctx.fillStyle = '#05080d'; ctx.beginPath(); ctx.arc(0, 2, 13, 0, 7); ctx.fill(); ctx.strokeStyle = '#7d8ea6'; ctx.lineWidth = 2; ctx.stroke();
  const puls = .7 + .3 * Math.sin(S.t * 9);
  const cg = ctx.createRadialGradient(0, 2, 0, 0, 2, 13); cg.addColorStop(0, ned ? 'rgba(255,220,160,.9)' : '#ffffff'); cg.addColorStop(.45, ned ? 'rgba(255,170,80,.6)' : `rgba(120,230,255,${puls})`); cg.addColorStop(1, 'rgba(60,160,255,.08)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 2, 12, 0, 7); ctx.fill();
  ctx.fillStyle = '#b8743a'; ctx.fillRect(-12, 0, 8, 4); ctx.fillRect(4, 0, 8, 4); ctx.fillStyle = '#e8b070'; ctx.fillRect(-12, 0, 8, 1.2); ctx.fillRect(4, 0, 8, 1.2);
  if (!ned) { ctx.strokeStyle = '#f2fdff'; ctx.lineWidth = 1.6; jagget(-4, 2, 4, 2, 3 + rs, 5, (S.t * 28) | 0); }
  ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.ellipse(-5, -4, 5, 2.4, -.5, 0, 7); ctx.fill();
  // øynene: to smale lys over vinduet
  ctx.fillStyle = '#0a0d14'; rr(ctx, -16, -18, 32, 7, 3); ctx.fill();
  if (ned || B2.stun > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 6, -17); ctx.lineTo(s * 11, -12); ctx.moveTo(s * 11, -17); ctx.lineTo(s * 6, -12); ctx.stroke(); } }
  else { ctx.fillStyle = '#e6faff'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 3, -13.5); ctx.lineTo(s * 14, -17 - rs); ctx.lineTo(s * 13, -12.5); ctx.closePath(); ctx.fill(); } }
  bossBlink(flimmer ? .75 : 0);
  ctx.restore(); ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}
function tegnDor(kol, y0, y1) { const X = kol * T, Y0 = y0 * T, Y1 = (y1 + 1) * T; if (!synlig(X, Y0, 200)) return;
  ctx.fillStyle = '#2a3042'; ctx.fillRect(X - 2, Y0 - 8, T + 4, 9);
  if (tile(kol, y0) !== DOOR) return;
  const gr = ctx.createLinearGradient(X, 0, X + T, 0); gr.addColorStop(0, '#2b3044'); gr.addColorStop(.5, '#424a64'); gr.addColorStop(1, '#22263a');
  ctx.fillStyle = gr; ctx.fillRect(X + 2, Y0, T - 4, Y1 - Y0); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let y = Y0 + 8; y < Y1; y += 12) ctx.fillRect(X + 2, y, T - 4, 2);
  ctx.fillStyle = 'rgba(255,120,60,.8)'; ctx.fillRect(X + T / 2 - 1.5, Y0, 3, Y1 - Y0); }
function tegnLuke(kx, ky, b) { kx = kx || 125; ky = ky || 19; const X = kx * T, Y = ky * T, W = (b || 4) * T; if (!synlig(X, Y, 200)) return;
  if (tile(kx, ky) === LUKE) { const gr = ctx.createLinearGradient(0, Y, 0, Y + T); gr.addColorStop(0, '#59647f'); gr.addColorStop(1, '#2a3042');
    ctx.fillStyle = gr; ctx.fillRect(X, Y, W, T); ctx.fillStyle = 'rgba(0,0,0,.4)'; for (let i = 1; i < (b || 4); i++) ctx.fillRect(X + i * T - 1, Y + 3, 2, T - 6);
    ctx.fillStyle = 'rgba(240,195,60,.5)'; for (let i = 0; i < (b || 4) * 2; i++) ctx.fillRect(X + 4 + i * 16, Y + 2, 8, 3);
    ctx.fillStyle = '#c9ced8'; ctx.fillRect(X + W / 2 - 8, Y + T / 2 - 2, 16, 4); }
  else { ctx.fillStyle = '#0d1216'; ctx.fillRect(X, Y, W, T); ctx.fillStyle = '#2a3042'; ctx.fillRect(X - 6, Y, 6, T); ctx.fillRect(X + W, Y, 6, T);
    ctx.save(); ctx.translate(X + W + 6, Y); ctx.rotate(-1.25); ctx.fillStyle = '#4a5470'; ctx.fillRect(0, -6, W * .55, 6); ctx.restore(); } }
function tegnKroker() {
  for (const k of KROKER) { const X = k[0] * T + T / 2, Y = k[1] * T; if (!synlig(X, Y, 80)) continue;
    if (k.linje) { ctx.strokeStyle = '#2a3242'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, k.ly); ctx.lineTo(X, Y - 6); ctx.stroke();
      ctx.fillStyle = '#9fb7a8'; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.ellipse(X, k.ly + 7 + i * 5, 4, 1.8, 0, 0, 7); ctx.fill(); } }
    else { let top = k[1] - 1; while (top > 0 && !fast(k[0], top)) top--; const Y0 = (top + 1) * T;
      ctx.strokeStyle = '#3a4558'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, Y0); ctx.lineTo(X, Y - 6); ctx.stroke();
      ctx.fillStyle = '#2a3042'; ctx.fillRect(X - 7, Y0 - 1, 14, 4); }
    const maal = S.krokMaal === k, i = P.krok && P.krok.k === k;
    ctx.strokeStyle = maal || i ? '#bff4ff' : '#9aa3b5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, 5.5, 0, 7); ctx.stroke(); }
  if (P.krok && S.dod <= 0) { const hx = P.x + P.w / 2 + P.face * 2, hy = P.y + 4;
    ctx.strokeStyle = '#1b1f28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(P.krok.x, P.krok.y); ctx.stroke();
    ctx.strokeStyle = '#e07a22'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(P.krok.x, P.krok.y); ctx.stroke(); }
}
// strømførende vann (VANN) og vannet i koblingsrommet (BVANN), som bare er farlig når bossen setter strøm på
function tegnVann() {
  for (const [x, y] of vannListe) { const X = x * T, Y = y * T; if (!synlig(X, Y, T)) continue;
    if (tile(x, y) === VANN) { const b = Math.sin(S.t * 2.2 + x * .9) * 2;
      const gr = ctx.createLinearGradient(0, Y + 8, 0, Y + T); gr.addColorStop(0, 'rgba(70,170,210,.75)'); gr.addColorStop(1, 'rgba(10,40,70,.9)');
      ctx.fillStyle = gr; ctx.fillRect(X - .5, Y + 9 + b, T + 1, T - 9 - b);
      ctx.fillStyle = 'rgba(190,240,255,.55)'; ctx.fillRect(X - .5, Y + 9 + b, T + 1, 1.5); }
    else { const fa = B2.aktiv ? B2.golv : 0, Yf = Y - 4;
      ctx.fillStyle = fa === 2 ? 'rgba(120,220,255,.75)' : fa === 1 ? `rgba(240,200,80,${.45 + .3 * Math.sin(S.t * 18)})` : 'rgba(60,130,170,.55)';
      ctx.fillRect(X - .5, Yf + Math.sin(S.t * 2 + x) * 1, T + 1, 6);
      ctx.fillStyle = 'rgba(200,240,255,.4)'; ctx.fillRect(X - .5, Yf + Math.sin(S.t * 2 + x), T + 1, 1); } }
}
function tegnDynamiskeFliser() {
  for (const [x, y] of hazListe) { const X = x * T, Y = y * T; if (!synlig(X, Y, T)) continue;
    ctx.fillStyle = 'rgba(240,195,60,.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(X + i * 8 + 1, Y + T - 2, 4, 2);
    ctx.strokeStyle = '#11141b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - 2, Y + T - 3); ctx.quadraticCurveTo(X + T / 2, Y + T - 12 - hs(x, y, 1) * 6, X + T + 2, Y + T - 4); ctx.stroke();
    ctx.strokeStyle = '#d07a3a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X + 14, Y + T - 9); ctx.lineTo(X + 18, Y + T - 16); ctx.moveTo(X + 16, Y + T - 9); ctx.lineTo(X + 21, Y + T - 13); ctx.stroke(); }
  for (const kol of [73, 101]) { const t0 = tile(kol, 13); if (t0 === AIR) continue; const X = kol * T, Y0 = 13 * T, Y1 = 19 * T;
    if (!synlig(X, Y0, 200)) continue;
    ctx.fillStyle = '#2a3042'; ctx.fillRect(X - 2, Y0 - 8, T + 4, 9); ctx.fillRect(X - 2, Y1 - 6, T + 4, 6);
    ctx.fillStyle = Math.sin(S.t * 6) > 0 ? '#ff7a3a' : '#7a3a1a'; ctx.fillRect(X + 4, Y0 - 5, 4, 3);
    if (t0 === DOOR) { const gr = ctx.createLinearGradient(X, 0, X + T, 0); gr.addColorStop(0, '#2b3044'); gr.addColorStop(.5, '#424a64'); gr.addColorStop(1, '#22263a');
      ctx.fillStyle = gr; ctx.fillRect(X + 2, Y0, T - 4, Y1 - Y0 - 6); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let y = Y0 + 8; y < Y1 - 6; y += 12) ctx.fillRect(X + 2, y, T - 4, 2);
      ctx.fillStyle = 'rgba(255,120,60,.8)'; ctx.fillRect(X + T / 2 - 1.5, Y0, 3, Y1 - Y0 - 6); } }
  for (const [x, y] of KJELLERLYS) { if (x === 6 && !S.ev.hemmelig) continue; const X = x * T + T / 2, Y = y * T; if (!synlig(X, Y, 80)) continue;
    ctx.fillStyle = '#2a3040'; rr(ctx, X - 10, Y, 20, 5, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,236,190,.85)'; ctx.fillRect(X - 7, Y + 5, 14, 2); }
  // sprekker i veggen foran det hemmelige rommet
  if (!S.ev.hemmelig && synlig(10 * T, 29 * T, 100)) { ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.2; ctx.beginPath();
    ctx.moveTo(10 * T - 2, 28 * T + 6); ctx.lineTo(10 * T - 8, 29 * T); ctx.lineTo(10 * T - 4, 29 * T + 14); ctx.lineTo(10 * T - 10, 30 * T + 10); ctx.stroke(); }
}
// samler alle lyskilder før mørket legges over
function samleLys() {
  lys.length = 0;
  const L = (x, y, r, i) => lys.push({ x, y, r, i });
  if (S.dod <= 0 && ANIM.drakt !== 'vandrer') { L(P.x + P.w / 2 + P.face * 8, P.y + 2, S.kjop.lykt ? 330 : 220, .95); if (S.kjop.lykt) L(P.x + P.w / 2 + P.face * 120, P.y + 20, 160, .6); }
  if (S.dod <= 0 && !GN.skjult) L(GN.x, GN.y, 130 + GN.flare * 80, .8);
  SJEKK.forEach((c, i) => { const X = c.x * T + T / 2, Y = (c.y + 1) * T - 30; if (synlig(X, Y, 250)) L(X, Y, S.cpLit.has(i) ? 230 : 60, S.cpLit.has(i) ? .95 : .4); });
  ORBER.forEach(([x, y], i) => { if (S.orbTatt.has(i)) return; const X = x * T + T / 2, Y = y * T + T / 2; if (synlig(X, Y, 60)) L(X, Y, 55, .6); });
  FAG.forEach((f, i) => { if (S.fag.has(i)) return; const X = f.x * T + T / 2, Y = f.y * T + T / 2; if (synlig(X, Y, 60)) L(X, Y, 70, .7); });
  for (const f of FUNN) if (funnSynlig(f)) { const X = f.x * T + T / 2, Y = f.y * T + T / 2; if (synlig(X, Y, 200)) L(X, Y, 170, .9); }
  for (const [x, y] of hazListe) { const X = x * T + T / 2, Y = y * T + T - 10; if (synlig(X, Y, 80)) L(X, Y, 70 * (.6 + .4 * Math.sin(S.t * 30 + x * 3)), .6); }
  for (const kol of [73, 101]) { const t0 = tile(kol, 13); if (t0 === AIR) continue; L(kol * T + T / 2, 16 * T, t0 === DOOR ? 120 : 170, t0 === DOOR ? .5 : (S.ev.hansker ? .5 : .8)); }
  if (B.aktiv || !S.bossDone) BRYTERE.forEach(b => { if (synlig(b.x * T, b.y * T, 100)) L(b.x * T + T / 2, b.y * T + 6, b.av ? 60 : 90, .7); });
  if (synlig(TAVLE.x * T, TAVLE.y * T, 400)) L(TAVLE.x * T + T, TAVLE.y * T + 20, (S.ending > 0 || S.ferdig) ? 380 : 110, .9);
  if (B.aktiv) { const a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1; L(B.x, B.y, 300 + B.lad * 60, .9 * a); }
  for (const q of prosj) L(q.x, q.y, 70, .7);
  for (const q of bolter) L(q.x, q.y, 70, .7);
  for (const q of sveip) L(q.x, ((q.rad || ARENA2.gulv) - .55) * T, q.varsel > 0 ? 70 : 160, .8);
  if (B3.aktiv) { const a = B3.fase === 'dod' ? clamp(B3.dod / 3.2, 0, 1) : 1, [kx, ky] = b3Kjerne(); L(kx, ky, 300, .9 * a); L(B3.x, B3.y - 40, 200, .6 * a);
    if (B3.golv === 2) for (let x = GARD.x0; x <= GARD.x1; x += 4) L(x * T, GARD.gulv * T, 140, .6); }
  if (S.ev.tester) for (const [x, y] of ghoListe) if (x % 2 === 0 && synlig(x * T, y * T, 60)) L(x * T + T / 2, y * T + 4, 60, .45);
  for (const [x0, y0] of TRAFOER) if (synlig(x0 * T, y0 * T, 200)) L((x0 + 2) * T, (y0 - .5) * T, 120, .5);
  if (B4.aktiv) { const a = B4.fase === 'dod' ? clamp(B4.dod / 3, 0, 1) : 1, [hx, hy] = b4Navn(); L(hx, hy, 320, .9 * a);
    if (B4.borste >= 0) { const [bx, by] = borstePos(B4.borste); L(bx, by, 200, .9); }
    if (B4.golv === 2) for (let x = TURBIN.x0; x <= TURBIN.x1; x += 4) L(x * T, TURBIN.gulv * T, 140, .6); }
  if (B2.aktiv) { const a = B2.fase === 'dod' ? clamp(B2.dod / 2.4, 0, 1) : 1; L(B2.x, B2.y, 260, .9 * a); if (B2.golv === 2) for (let x = ARENA2.x0; x <= ARENA2.x1; x += 4) L(x * T, ARENA2.gulv * T, 140, .6); }
  for (const [x, y] of vannListe) if (tile(x, y) === VANN && x % 2 === 0 && synlig(x * T, y * T, 80)) L(x * T + T / 2, y * T + 12, 70, .35);
  if (S.ev.krok) for (const k of KROKER) if (synlig(k[0] * T, k[1] * T, 60)) L(k[0] * T + T / 2, k[1] * T, S.krokMaal === k ? 90 : 40, S.krokMaal === k ? .7 : .35);
  for (const b of bolger) L(b.x, b.row * T - 12, 80, .7);
  for (const s of striker) L(s.x, 15 * T, s.aktiv > 0 ? 260 : 90, s.aktiv > 0 ? .9 : .35);
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 80)) L(e.x + e.w / 2, e.y + 4, 95, .7);
  { const fa = lysbueFase(); if (fa && synlig(LYSBUE.x * T, LYSBUE.y0 * T, 120)) L((LYSBUE.x + .5) * T, 29.5 * T, fa === 2 ? 170 : 60, fa === 2 ? .85 : .4); }
  for (const [x, y] of KJELLERLYS) if (synlig(x * T, y * T, 200)) L(x * T + T / 2, y * T + 8, 150, .45);
  if (lyn) L((lyn.x1 + lyn.x2) / 2, (lyn.y1 + lyn.y2) / 2, 260, .8);
  detaljLys(L);
  for (const f of LYSKILDER) f(L);
  if (S.power > 0) { const vw = cssW / skala; for (let x = 0; x < MW * T; x += 260) if (x > cam.x - 300 && x < cam.x + vw + 300) L(x, 10 * T, 600, S.power * .6); }
  if (S.hallLys > 0 && synlig(87 * T, 12 * T, 600)) for (let x = 76; x <= 99; x += 6) L(x * T, 9 * T, 300, .55 * S.hallLys);
}
function tegnGlod() {
  ctx.globalCompositeOperation = 'lighter';
  tegnStraler(); tegnDetaljGlod(); tegnFotsporGlod(); tegnDodeGlod();
  SJEKK.forEach((c, i) => { const X = c.x * T + T / 2, Y = (c.y + 1) * T - 30; if (!synlig(X, Y, 200)) return;
    if (S.cpLit.has(i)) { glod(SPR.w, X, Y, 90, .55 + .05 * Math.sin(S.t * 3 + i)); glod(SPR.h, X, Y, 14, .6);
      ctx.save(); ctx.translate(X, Y); ctx.rotate(-.5 + Math.sin(S.t * .3 + i) * .05); ctx.globalAlpha = .1; ctx.drawImage(KJEGLE, -60, 0, 120, 200); ctx.restore(); }
    else glod(SPR.w, X, Y, 30, .25); });
  ORBER.forEach(([x, y], i) => { if (S.orbTatt.has(i)) return; const X = x * T + T / 2, Y = y * T + T / 2 + Math.sin(S.t * 2 + i) * 4; if (!synlig(X, Y, 60)) return;
    glod(SPR.c, X, Y, 26, .8 + .2 * Math.sin(S.t * 4 + i)); glod(SPR.h, X, Y, 6, .9); });
  FAG.forEach((f, i) => { if (S.fag.has(i)) return; const X = f.x * T + T / 2, Y = f.y * T + T / 2 + Math.sin(S.t * 2 + i) * 3; if (synlig(X, Y, 60)) glod(SPR.o, X, Y, 26 + 3 * Math.sin(S.t * 3 + i), .55); });
  for (const f of FUNN) { if (!funnSynlig(f)) continue; const X = f.x * T + T / 2, Y = f.y * T + T / 2 + Math.sin(S.t * 2) * 4; if (!synlig(X, Y, 200)) continue;
    glod(f.liten ? SPR.c : SPR.w, X, Y, 70 + 8 * Math.sin(S.t * 3), .8); glod(SPR.h, X, Y, 20, .5);
    ctx.save(); ctx.translate(X, Y); ctx.rotate(S.t * .4); ctx.globalAlpha = .22; ctx.fillStyle = f.liten ? '#b8f1ff' : '#ffe9b0';
    for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-4, 70); ctx.lineTo(4, 70); ctx.fill(); } ctx.restore(); }
  for (const [x, y] of hazListe) { const X = x * T + T / 2, Y = y * T + T - 10; if (!synlig(X, Y, 60)) continue;
    const fl = .5 + .5 * Math.sin(S.t * 37 + x * 7); glod(SPR.o, X, Y, 26 + fl * 10, .45 + fl * .3);
    if (fl > .6) { ctx.strokeStyle = 'rgba(190,240,255,.9)'; ctx.lineWidth = 1.2; ctx.globalAlpha = 1; jagget(X - 10, Y + 2, X + 8, Y - 10 - fl * 6, 4, 4, (S.t * 20 | 0) + x); } }
  for (const kol of [73, 101]) { const t0 = tile(kol, 13); if (t0 !== CUR) continue; const X = kol * T + T / 2; if (!synlig(X, 15 * T, 200)) continue;
    const a = S.ev.hansker ? .5 : 1; ctx.globalAlpha = a; ctx.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = k ? 'rgba(140,220,255,.8)' : 'rgba(240,250,255,.95)'; jagget(X + (k - 1) * 6, 13 * T, X - (k - 1) * 6, 19 * T - 6, 7, 10, (S.t * 15 | 0) * 3 + k); }
    for (let y = 13; y < 19; y++) glod(SPR.c, X, y * T + T / 2, 34, .35 * a); }
  { const fa = lysbueFase(), X = (LYSBUE.x + .5) * T; if (fa && synlig(X, LYSBUE.y0 * T, 120)) {
      if (fa === 2) { ctx.globalAlpha = 1; ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(230,250,255,.95)'; jagget(X, LYSBUE.y0 * T + 8, X, (LYSBUE.y1 + 1) * T - 8, 8, 9, (S.t * 22 | 0));
        ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(110,210,255,.3)'; jagget(X, LYSBUE.y0 * T + 8, X, (LYSBUE.y1 + 1) * T - 8, 8, 9, (S.t * 22 | 0));
        for (let y = LYSBUE.y0; y <= LYSBUE.y1; y++) glod(SPR.c, X, y * T + T / 2, 40, .4); }
      else { if (Math.sin(S.t * 40) > .3) { ctx.globalAlpha = .7; ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,200,120,.9)'; jagget(X, LYSBUE.y0 * T + 8, X + 4, LYSBUE.y0 * T + 26, 4, 3, (S.t * 30 | 0)); jagget(X, (LYSBUE.y1 + 1) * T - 8, X - 4, (LYSBUE.y1 + 1) * T - 26, 4, 3, (S.t * 31 | 0)); }
        glod(SPR.o, X, LYSBUE.y0 * T + 8, 22, .5); glod(SPR.o, X, (LYSBUE.y1 + 1) * T - 8, 22, .5); } } }
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 60)) { const v = e.varsel || 0; glod(SPR.o, e.x + e.w / 2, e.y + e.h / 2, 30 + Math.sin(e.t * 9) * 4, .75 - v * .3); glod(SPR.r, e.x + e.w / 2, e.y + e.h / 2, 14 + v * 24, .5 + v * .35);
    if (Math.sin(e.t * 23) > .7) { ctx.globalAlpha = .9; ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(190,245,255,.9)'; jagget(e.x + 4, e.y + 2, e.x + e.w - 4, e.y - 3, 3, 4, (e.t * 30 | 0)); } }
  if (!S.ev.hemmelig && synlig(10 * T, 29 * T, 100)) glod(SPR.c, 10 * T - 6, 29.5 * T, 14 + 4 * Math.sin(S.t * 2), .35);
  for (const [x, y] of KJELLERLYS) { if (x === 6 && !S.ev.hemmelig) continue; if (synlig(x * T, y * T, 120)) glod(SPR.w, x * T + T / 2, y * T + 8, 34, .35); }
  if (B.aktiv) { const a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1, rs = 3 - B.hp;
    glod(rs === 2 ? SPR.m : SPR.p, B.x, B.y, 170 + B.varsel * 80 + B.lad * 60, (.4 + .15 * Math.sin(S.t * 5)) * a); glod(SPR.h, B.x, B.y - 4, 13 + B.lad * 10, .5 * a);
    if (B.stun <= 0 && B.fase !== 'dod') { ctx.globalAlpha = .8; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(220,180,255,.9)';
      for (let i = 0; i < 3 + rs; i++) { const v = (S.t * 3 + i * 2.1), r = 50 + 30 * Math.sin(v * 1.7); jagget(B.x + Math.cos(v) * 30, B.y - 4 + Math.sin(v) * 30, B.x + Math.cos(v) * (r + 25), B.y + Math.sin(v) * (r + 25), 6, 5, (S.t * 18 | 0) + i * 7); } }
    if (B.varsel > 0) { ctx.globalAlpha = B.varsel * .6; ctx.fillStyle = 'rgba(200,140,255,1)'; const col = Math.floor(B.x / T); let row = Math.floor(B.y / T) + 1; while (row < MH && tile(col, row) !== SOL) row++;
      ctx.fillRect(B.x - 60, row * T - 3, 120, 3); } }
  for (const q of prosj) { glod(SPR[q.f || 'p'], q.x, q.y, 28, .9); glod(SPR.h, q.x, q.y, 7, 1); }
  for (const q of bolter) { glod(SPR[q.f || 'c'], q.x, q.y, 24, .95); glod(SPR.h, q.x, q.y, 6, 1); }
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 60)) fiende2Glod(e);
  for (const e of fiender) if (e.liv && e.type === 'rele' && e.lad > 0) glod(SPR.c, e.x + e.w / 2 + e.dir * 8, e.y + 13, 14 + e.lad * 40, .5 + e.lad * .5);
  // vann: små utladninger i det strømførende vannet, og hele gulvet i koblingsrommet når det er strøm på
  for (const [x, y] of vannListe) { const X = x * T + T / 2; if (!synlig(X, y * T, 40)) continue;
    if (tile(x, y) === VANN) { glod(SPR.c, X, y * T + 14, 22, .25 + .1 * Math.sin(S.t * 5 + x));
      if (hs(x, (S.t * 6) | 0, 3) < .08) { ctx.globalAlpha = .9; ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(200,245,255,.95)'; jagget(X - 12, y * T + 11, X + 12, y * T + 11, 5, 5, (S.t * 20 | 0) + x); } }
    else if (B2.aktiv && B2.golv) { const Y = y * T - 2;
      if (B2.golv === 1) glod(SPR.o, X, Y, 26, .25 + .2 * Math.sin(S.t * 18));
      else { glod(SPR.c, X, Y, 40, .55); if (hs(x, (S.t * 12) | 0, 5) < .3) { ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(220,250,255,.95)'; jagget(X - 16, Y, X + 16, Y - 4, 6, 5, (S.t * 25 | 0) + x); } } } }
  if (B3.aktiv) { const a = B3.fase === 'dod' ? clamp(B3.dod / 3.2, 0, 1) : 1, [kx, ky] = b3Kjerne(), f = b3Fase(), aapen = (f === 1 && B3.sar > 0) || (f === 2 && B3.ned > 0) || (f === 3 && B3.sar > 0);
    glod(aapen ? SPR.w : SPR.o, kx, ky, (aapen ? 90 : 60) + 10 * Math.sin(S.t * 6), (.6 + .2 * Math.sin(S.t * 7)) * a); glod(SPR.h, kx, ky, aapen ? 18 : 10, a);
    if (aapen) { ctx.globalAlpha = .6 + .3 * Math.sin(S.t * 10); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(kx, ky, 40 + 3 * Math.sin(S.t * 8), 0, 7); ctx.stroke(); }
    if (B3.varsel > 0) { ctx.globalAlpha = B3.varsel * .7; ctx.fillStyle = 'rgba(255,170,80,1)'; ctx.fillRect(B3.x - 90, GARD.gulv * T - 3, 180, 3); }
    if (B3.golv) for (let x = GARD.x0; x <= GARD.x1; x++) { const X = x * T + T / 2, Y = GARD.gulv * T - 2; if (!synlig(X, Y, 40)) continue;
      if (B3.golv === 1) glod(SPR.o, X, Y, 24, .25 + .2 * Math.sin(S.t * 18));
      else { glod(SPR.o, X, Y, 36, .5); if (hs(x, (S.t * 12) | 0, 7) < .3) { ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,235,200,.95)'; jagget(X - 16, Y, X + 16, Y - 5, 6, 5, (S.t * 25 | 0) + x); } } }
    if (B3.stun <= 0 && B3.fase === 'kamp') { ctx.globalAlpha = .8; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,220,160,.9)';
      for (let i = 0; i < 2 + (6 - B3.hp) / 2; i++) { const v = S.t * 3 + i * 2.2, r = 50 + 30 * Math.sin(v * 1.6); jagget(kx, ky, kx + Math.cos(v) * r, ky + Math.sin(v) * r, 6, 5, (S.t * 18 | 0) + i * 5); } } }
  if (B4.aktiv) { const a = B4.fase === 'dod' ? clamp(B4.dod / 3, 0, 1) : 1, [hx, hy] = b4Navn(), n = b4Armer(), L = 8.6 * T * B4.R;
    glod(SPR.c, hx, hy, 100 + 10 * Math.sin(S.t * 6), (.55 + .2 * Math.sin(S.t * 7)) * a); glod(SPR.h, hx, hy, 14, a);
    if (B4.fase !== 'dod') for (let i = 0; i < n; i++) { const v = B4.vinkel + i * Math.PI * 2 / n, ex = hx + Math.cos(v) * L, ey = hy + Math.sin(v) * L, sx = hx + Math.cos(v) * 20, sy = hy + Math.sin(v) * 20;
      ctx.globalAlpha = (B4.stun > 0 ? .25 : 1) * a; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(110,210,255,.3)'; jagget(sx, sy, ex, ey, 9, 10, (S.t * 20 | 0) + i * 9);
      ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(230,250,255,.95)'; jagget(sx, sy, ex, ey, 9, 10, (S.t * 20 | 0) + i * 9); glod(SPR.c, ex, ey, 30, .8 * a); }
    if (B4.borste >= 0) { const [bx, by] = borstePos(B4.borste); glod(SPR.w, bx, by, 60 + 8 * Math.sin(S.t * 8), .9); glod(SPR.h, bx, by, 14, 1);
      ctx.globalAlpha = .6 + .3 * Math.sin(S.t * 10); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 28 + 3 * Math.sin(S.t * 8), 0, 7); ctx.stroke(); }
    if (B4.golv) for (let x = TURBIN.x0; x <= TURBIN.x1; x++) { const X = x * T + T / 2, Y = TURBIN.gulv * T - 2; if (!synlig(X, Y, 40)) continue;
      if (B4.golv === 1) glod(SPR.o, X, Y, 24, .25 + .2 * Math.sin(S.t * 18));
      else { glod(SPR.c, X, Y, 36, .5); if (hs(x, (S.t * 12) | 0, 9) < .3) { ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(220,250,255,.95)'; jagget(X - 16, Y, X + 16, Y - 5, 6, 5, (S.t * 25 | 0) + x); } } } }
  if (S.ev.tester) for (const [x, y] of ghoListe) { const X = x * T + T / 2; if (synlig(X, y * T, 40)) glod(SPR.o, X, y * T + 4, 18, .25 + .08 * Math.sin(S.t * 4 + x)); }
  // lynpisken: en buet lynstripe som sveiper foran montøren
  if (P.piskT > -.12 && S.dod <= 0) { const k = Math.min(1, 1 - P.piskT / .2), fa = P.piskT > 0 ? 1 : (P.piskT + .12) / .12, hx = P.x + P.w / 2 + P.face * 6, hy = P.y + 10, a = -1.2 + k * 1.9, sd = (S.t * 40) | 0;
    const tx = hx + Math.cos(a) * PISK_LENGDE * P.face, ty = hy + Math.sin(a) * PISK_LENGDE * .75, mx = hx + Math.cos(a - .5) * PISK_LENGDE * .55 * P.face, my = hy + Math.sin(a - .5) * PISK_LENGDE * .5;
    ctx.globalAlpha = fa; ctx.lineCap = 'round';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(170,140,255,.4)'; jagget(hx, hy, mx, my, 5, 4, sd); jagget(mx, my, tx, ty, 6, 5, sd + 3);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(245,240,255,.98)'; jagget(hx, hy, mx, my, 5, 4, sd); jagget(mx, my, tx, ty, 6, 5, sd + 3);
    glod(SPR.p, tx, ty, 40, .9 * fa); glod(SPR.h, tx, ty, 10, fa); ctx.lineCap = 'butt'; }
  if (S.krokMaal && !P.krok) { const X = S.krokMaal[0] * T + T / 2, Y = S.krokMaal[1] * T; glod(SPR.c, X, Y, 30 + 6 * Math.sin(S.t * 8), .9); glod(SPR.h, X, Y, 8, .9); }
  if (P.krok) glod(SPR.c, P.krok.x, P.krok.y, 26, .8);
  for (const q of sveip) { const Y = ((q.rad || ARENA2.gulv) - .55) * T, ax0 = q.x0 || ARENA2.x0, ax1 = q.x1 || ARENA2.x1;
    if (q.varsel > 0) { ctx.globalAlpha = .3 + .3 * Math.sin(S.t * 30); ctx.fillStyle = 'rgba(120,220,255,1)'; ctx.fillRect(ax0 * T, Y + 10, (ax1 - ax0 + 1) * T, 3); glod(SPR.c, q.x, Y, 40, .7); }
    else { ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(235,252,255,1)'; jagget(q.x, Y - 16, q.x - q.dir * 6, Y + 14, 7, 6, (S.t * 30 | 0)); glod(SPR.c, q.x, Y, 60, 1); } }
  if (B2.aktiv) { const a = B2.fase === 'dod' ? clamp(B2.dod / 2.4, 0, 1) : 1, ned = B2.ned > 0;
    glod(ned ? SPR.o : SPR.c, B2.x, B2.y, 150 + 20 * Math.sin(S.t * 5), (.38 + .12 * Math.sin(S.t * 6)) * a); glod(SPR.h, B2.x, B2.y + 2, 11, .55 * a);
    if (ned) { ctx.globalAlpha = .6 + .3 * Math.sin(S.t * 10); ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(B2.x, B2.y, 34 + 3 * Math.sin(S.t * 8), 0, 7); ctx.stroke(); }
    else if (B2.stun <= 0 && B2.fase !== 'dod') { ctx.globalAlpha = .85; ctx.lineWidth = 1.3; ctx.strokeStyle = 'rgba(190,240,255,.95)';
      for (let i = 0; i < 2 + (3 - B2.hp); i++) { const v = S.t * 3.3 + i * 2.4, r = 40 + 26 * Math.sin(v * 1.9); jagget(B2.x, B2.y, B2.x + Math.cos(v) * r, B2.y + Math.sin(v) * r, 5, 5, (S.t * 18 | 0) + i * 5); } } }
  for (const b of bolger) { const Y = b.row * T; ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(230,200,255,.95)';
    jagget(b.x, Y, b.x + b.dir * 4, Y - 26, 6, 5, (S.t * 25 | 0) + (b.dir > 0 ? 1 : 9)); glod(SPR.p, b.x, Y - 12, 44, .8); }
  for (const s of striker) { if (s.varsel > 0) { const a = .22 + .22 * Math.sin(S.t * 30); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,110,200,1)';
      ctx.fillRect(s.x - 12, 6 * T, 24, 13 * T); ctx.globalAlpha = .9; ctx.fillRect(s.x - 16, 19 * T - 3, 32, 3); }
    else { ctx.globalAlpha = 1; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,240,255,1)'; jagget(s.x, 6 * T, s.x, 19 * T, 12, 14, (S.t * 40 | 0));
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,120,220,.35)'; jagget(s.x, 6 * T, s.x, 19 * T, 12, 14, (S.t * 40 | 0)); glod(SPR.m, s.x, 19 * T - 6, 70, 1); } }
  if (lyn) { ctx.globalAlpha = clamp(lyn.t / .3, 0, 1); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(245,235,255,1)'; jagget(lyn.x1, lyn.y1, lyn.x2, lyn.y2, 14, 12, (S.t * 30 | 0));
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(180,120,255,.35)'; jagget(lyn.x1, lyn.y1, lyn.x2, lyn.y2, 14, 12, (S.t * 30 | 0)); }
  { const X = TAVLE.x * T + T, Y = (TAVLE.y + 2) * T - 33; const on = S.ending > 0 || S.ferdig; if (synlig(X, Y, 300)) glod(on ? SPR.g : SPR.r, X, Y, on ? 120 : 40, on ? .5 : .35); }
  for (const q of partikler) { if (q.farge === 'd') continue; const k = q.liv / q.max; glod(SPR[q.farge] || SPR.w, q.x, q.y, q.str * (.4 + k * .6), k); }
  if (S.dod <= 0) {
    // hodelykt med en myk lyskjegle
    const lx = P.x + P.w / 2 + P.face * 8, ly = P.y + 2;
    if (ANIM.drakt !== 'vandrer') { glod(SPR.w, lx, ly, 16, .7);
      ctx.save(); ctx.translate(lx, ly); ctx.rotate(-P.face * Math.PI / 2 + P.face * .12); ctx.globalAlpha = S.kjop.lykt ? .13 : .09; if (S.kjop.lykt) ctx.drawImage(KJEGLE, -70, 0, 140, 250); else ctx.drawImage(KJEGLE, -50, 0, 100, 170); ctx.restore(); }
    const gs = 36 + 4 * Math.sin(S.t * 6) + GN.flare * 30;
    if (!GN.skjult) { glod(S.ngPluss ? SPR.g : SPR.c, GN.x, GN.y, gs, .75 + GN.flare * .25); glod(SPR.h, GN.x, GN.y, 8 + GN.flare * 6, 1); }
  }
  for (const f of TEGN_GLOD) f();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function tegnStov() { ctx.fillStyle = 'rgba(150,160,180,.35)'; for (const q of partikler) if (q.farge === 'd') { ctx.globalAlpha = q.liv / q.max * .6; ctx.beginPath(); ctx.arc(q.x, q.y, q.str * (1.4 - q.liv / q.max * .6), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
function tegnLys() {
  const g = lysG, k = lysC.width / cv.width, s = skala * dpr * k;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, lysC.width, lysC.height);
  const mork = S.mork * (1 - S.power * .75);
  g.fillStyle = `rgba(${ST.mf[0] | 0},${ST.mf[1] | 0},${ST.mf[2] | 0},${mork})`; g.fillRect(0, 0, lysC.width, lysC.height);
  g.globalCompositeOperation = 'destination-out';
  for (const l of lys) { const r = l.r * s, x = (l.x - camX) * s, y = (l.y - camY) * s; if (x < -r || y < -r || x > lysC.width + r || y > lysC.height + r) continue;
    g.globalAlpha = clamp(l.i, 0, 1); g.drawImage(HULL, x - r, y - r, r * 2, r * 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  tegnDis(g, lysC.width, lysC.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lysC, 0, 0, cv.width, cv.height);
}
let camX = 0, camY = 0;
function tegn() {
  S.frame++;
  const sh = S.shake > 0 ? Math.min(1, S.shake) * (INNST.rist ? 10 : 2.5) : 0;
  camX = cam.x + (Math.random() - .5) * sh; camY = cam.y + (Math.random() - .5) * sh;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (!maskeKlar || chunks.size === 0) lagInneMaske();
  maalSynlig(camX, camY);
  if (SYN.ute || S.kval < 1) tegnBakgrunn(camX, camY); else { ctx.fillStyle = '#080b12'; ctx.fillRect(0, 0, cv.width, cv.height); }
  tegnMotes(false);
  const m = skala * dpr;
  tegnInneBg(camX, camY);
  // bitene tegnes på hele skjermpiksler uten overlapp, så den halvgjennomsiktige bakveggen ikke får striper
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const vw = cssW / skala, vh = cssH / skala, pad = 2 * chunkRes;
  const cx0 = Math.floor(camX / CPX), cx1 = Math.floor((camX + vw) / CPX), cy0 = Math.floor(camY / CPX), cy1 = Math.floor((camY + vh) / CPX);
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
    const X0 = Math.round((cx * CPX - camX) * m), X1 = Math.round(((cx + 1) * CPX - camX) * m), Y0 = Math.round((cy * CPX - camY) * m), Y1 = Math.round(((cy + 1) * CPX - camY) * m);
    ctx.drawImage(hentChunk(cx, cy), pad, pad, CPX * chunkRes, CPX * chunkRes, X0, Y0, X1 - X0, Y1 - Y0); }
  ctx.setTransform(m, 0, 0, m, -camX * m, -camY * m);
  tegnDetaljer();
  // forhåndslag én bit utenfor skjermen per bilde
  const nx = (S.frame % 2 ? cx1 + 1 : cx0 - 1), ny = cy0 + (S.frame >> 1) % (cy1 - cy0 + 1);
  if (nx >= 0 && nx * CH < MW && ny >= 0 && ny * CH < MH && !chunks.has(nx + ',' + ny)) hentChunk(nx, ny);
  tegnDynamiskeFliser();
  tegnLuke(); tegnLuke(42, 32, 2); tegnDor(53, 57, 60); tegnDor(140, 54, 56); tegnDor(166, 52, 56); tegnDor(161, 19, 26); tegnDor(131, 15, 18);
  tegnSpesialFliser();
  tegnLysbue();
  tegnKran();
  for (const f of TEGN_VERDEN) f();
  SJEKK.forEach((c, i) => { if (synlig(c.x * T, c.y * T, 100)) tegnLampe(c, i); });
  if (synlig(TAVLE.x * T, TAVLE.y * T, 200)) tegnTavle();
  if (B.aktiv || !S.bossDone) BRYTERE.forEach(b => { if (synlig(b.x * T, b.y * T, 100)) tegnBryter(b); });
  for (const f of FUNN) if (funnSynlig(f) && synlig(f.x * T, f.y * T, 100)) tegnFunn(f);
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 60)) { tegnSkygge(e.x + e.w / 2, e.y + e.h, e.w); tegnFiende(e); }
  tegnDode();
  tegnKroker();
  for (const i of VERKSTED) tegnVerksted(i);
  tegnFagkort();
  tegnBoss();
  tegnBoss2();
  tegnBoss3();
  tegnBoss4();
  if (S.dod <= 0 && !P.krok) tegnSkygge(P.x + P.w / 2, P.y + P.h, P.w);
  tegnSpiller();
  tegnSkjerm(P);
  tegnVann();
  for (const f of TEGN_OVER) f();
  tegnStov();
  samleLys();
  tegnLys();
  ctx.setTransform(m, 0, 0, m, -camX * m, -camY * m);
  tegnGlod();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  tegnForgrunn();
  for (const f of TEGN_FORAN) f();
  tegnMotes(true);
  tegnBloom();
  if (vign) ctx.drawImage(vign, 0, 0, cv.width, cv.height);
  if (S.flash > 0) { ctx.fillStyle = `rgba(${S.flashF},${Math.min(1, S.flash) * (INNST.rist ? .55 : .2)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (S.dod > 0) { ctx.fillStyle = `rgba(2,4,12,${clamp((1.2 - S.dod) / .6, 0, 1) * .85})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  tegnOvergang();
}
