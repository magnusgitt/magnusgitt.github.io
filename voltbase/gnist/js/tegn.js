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
  const cw = cv.width, ch = cv.height;
  const maxY = Math.max(1, MH * T - cssH / skala), t = clamp(ky / maxY, 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(BG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .04, -(LH * hk - ch) * (.25 + t * .5), LW * hk, LH * hk);
  // skyer som driver sakte
  for (let i = 0; i < 4; i++) { const w = cw * (.7 + i * .2), x = (((S.t * (6 + i * 3) * dpr + i * cw * .37 - kx * skala * dpr * .03) % (cw + w)) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .06 + i * .015; ctx.drawImage(TAKE, x, ch * (.12 + i * .1) - w * .19, w, w * .375); }
  ctx.globalAlpha = 1;
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch;
  const lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lagX0 = p => { let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; return x0; };
  const lag = (bilde, p, pv, a) => { if (!bilde || a <= 0) return; ctx.globalAlpha = a; const y = lagY(pv);
    for (let x = lagX0(p); x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); ctx.globalAlpha = 1; };
  lag(BG.fjern, .08, .25, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(cw * (.55 + i * .16) - (kx * skala * dpr * .05) % cw, -ch * .1); ctx.rotate(.42 + Math.sin(S.t * .2 + i) * .03);
    ctx.globalAlpha = .045 + .02 * Math.sin(S.t * .5 + i * 2); ctx.drawImage(STRALE, -ch * .12, 0, ch * (.18 + i * .06), ch * 1.6); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  lag(BG.midt, .3, .5, 1);
  if (BG.midtLys && S.power > 0) lag(BG.midtLys, .3, .5, S.power);
  // blinkende varsellys på kranene
  { const y0 = lagY(.5), blink = (Math.sin(S.t * 2.4) > .2) ? 1 : .25; ctx.globalCompositeOperation = 'lighter';
    for (let x = lagX0(.3) - lw; x < cw + lw; x += lw) for (const [lx, ly] of KRANLYS) { const sx = x + lx * k, sy = y0 + ly * k; if (sx < -50 || sx > cw + 50) continue;
      glod(SPR.r, sx, sy, 16 * k, .9 * blink); } ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
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
  ctx.fillStyle = lit ? '#fff6d2' : '#3a3f4e'; rr(ctx, X - 6, Y - 34, 12, 8, 2); ctx.fill();
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
  else if (f.id === 'liv') { ctx.fillStyle = '#bff4ff'; ctx.beginPath(); ctx.moveTo(0, 7); ctx.bezierCurveTo(-9, 1, -7, -8, 0, -3); ctx.bezierCurveTo(7, -8, 9, 1, 0, 7); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(2, -9); ctx.lineTo(-5, 1); ctx.lineTo(0, 1); ctx.lineTo(-2, 9); ctx.lineTo(5, -2); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
function tegnFiende(e) {
  const X = e.x + e.w / 2, Y = e.y + e.h, t = e.t;
  ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir, 1);
  ctx.strokeStyle = '#0b0f18'; ctx.lineWidth = 1.6;
  for (let i = -1; i <= 1; i++) { const s = Math.sin(t * 14 + i * 2) * 2.5; ctx.beginPath(); ctx.moveTo(i * 5, -5); ctx.lineTo(i * 5 + 3 + s, -2); ctx.lineTo(i * 5 + 1 + s, 0); ctx.stroke(); }
  const gr = ctx.createLinearGradient(0, -14, 0, -3); gr.addColorStop(0, '#2d3a55'); gr.addColorStop(1, '#141a28');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(0, -7, 11, 7, 0, Math.PI, 0); ctx.lineTo(11, -4); ctx.lineTo(-11, -4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(140,230,255,.9)'; ctx.beginPath(); ctx.arc(8, -7, 1.6, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(160,240,255,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(-3, -9); ctx.lineTo(0, -13); ctx.lineTo(3, -9); ctx.lineTo(6, -12); ctx.stroke();
  ctx.restore();
}
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
function figur(lean, pose) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const ben = (a1, a2, farge, bak) => { const hx = bak ? -1.5 : 1.5, [kx, ky, fx, fy] = ledd(hx, -12.5, a1, a2, 6.5, 6.5);
    ctx.strokeStyle = farge; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx, -12.5); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = S.ev.dobbel ? '#e08a2c' : '#20242e'; ctx.save(); ctx.translate(fx, fy); ctx.rotate(-(a1 - a2) * .6); rr(ctx, -3, -2, 8.5, 4.2, 2); ctx.fill(); ctx.restore(); };
  const arm = (a1, a2, farge) => { const [ex, ey, hx, hy] = ledd(0, -22.5, a1, -a2, 5.5, 5);
    ctx.strokeStyle = farge; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -22.5); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = S.ev.hansker ? '#ffcf3a' : '#e9b88e'; ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, 7); ctx.fill(); };
  const kropp = () => { ctx.translate(0, -12.5 + pose.bob); ctx.rotate(lean); ctx.translate(0, 12.5); };
  ben(pose.b1[0], pose.b1[1], '#22335a', true);
  ctx.save(); kropp(); arm(pose.a1[0], pose.a1[1], '#b8641f'); ctx.restore();
  ben(pose.b2[0], pose.b2[1], '#2a3d66', false);
  ctx.save(); kropp();
  ctx.fillStyle = '#ff962c'; rr(ctx, -7, -26, 14, 15, 4); ctx.fill();
  ctx.fillStyle = '#e8f2ff'; ctx.fillRect(-7, -20, 14, 2); ctx.fillRect(-7, -15.5, 14, 2);
  ctx.fillStyle = '#3a3226'; ctx.fillRect(-7, -12.5, 14, 2.5); ctx.fillStyle = '#c9a23a'; ctx.fillRect(3, -12.5, 2, 2.5);
  arm(pose.a2[0], pose.a2[1], '#e07a22');
  ctx.translate(0, pose.hode);
  ctx.fillStyle = '#f0c39a'; ctx.beginPath(); ctx.arc(1, -31, 5.6, 0, 7); ctx.fill();
  ctx.fillStyle = '#1d1d24'; if (pose.blunk) ctx.fillRect(2.4, -31.6, 2.2, .9); else { ctx.beginPath(); ctx.arc(3.4, -31.5, 1, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(1, -33, 6.6, Math.PI, 0); ctx.fill(); ctx.fillRect(-6, -33.6, 15, 2.4);
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(-1, -36, 2, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#fff7d0'; ctx.beginPath(); ctx.arc(7.4, -34.6, 1.7, 0, 7); ctx.fill();
  ctx.restore();
}
function poseFor(p) {
  const fart = Math.min(1, Math.abs(p.vx) / RUN), ph = p.anim;
  if (p.dashT > 0) return { b1: [-.9, .5], b2: [-.4, 1.1], a1: [-1.3, .3], a2: [-1.6, .2], bob: 0, hode: 0 };
  if (!p.onGround) {
    if (p.vy < -80) return { b1: [-.35, 1.0], b2: [.75, 1.4], a1: [-2.5, .5], a2: [2.3, .4], bob: 0, hode: -.5 };
    const fl = Math.sin(S.t * 18) * .18;
    return { b1: [-.25, .35], b2: [.3, .5], a1: [-1.9 + fl, .3], a2: [1.9 - fl, .3], bob: 0, hode: 0 };
  }
  if (fart > .05) {
    const s = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
    return { b1: [s * .8 * fart, (Math.max(0, -Math.cos(ph)) * 1.2 + .1) * fart], b2: [s2 * .8 * fart, (Math.max(0, -Math.cos(ph + Math.PI)) * 1.2 + .1) * fart],
      a1: [s2 * .9 * fart, .7 * fart], a2: [s * .9 * fart, .7 * fart], bob: -Math.abs(Math.cos(ph)) * 1.4 * fart, hode: 0 };
  }
  const pust = Math.sin(S.t * 2.2) * .5, land = Math.max(0, p.landT) * 30;
  return { b1: [-.06 - land * .03, .1 + land * .08], b2: [.06 + land * .03, .1 + land * .08], a1: [-.15, .2], a2: [.15, .25], bob: pust * .3 + land, hode: pust * .3, blunk: (S.t % 4) < .12 };
}
function tegnSpiller() {
  const p = P; if (S.dod > 0) return;
  // etterbilder fra strømstøtet
  ctx.globalCompositeOperation = 'lighter';
  for (const s of p.spor) { ctx.globalAlpha = s.t / .28 * .5; ctx.fillStyle = '#5fd8ff'; rr(ctx, s.x - 1, s.y + 2, p.w + 2, p.h - 2, 7); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(p.x + p.w / 2, p.y + p.h); ctx.scale(p.face * p.sx, p.sy);
  if (p.inv > 0 && Math.floor(p.inv * 18) % 2) ctx.globalAlpha = .45;
  figur(p.lean * p.face, poseFor(p));
  ctx.restore(); ctx.globalAlpha = 1;
}
function tegnBoss() {
  if (!B.aktiv) return;
  const X = B.x, Y = B.y, a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1, flimmer = B.stun > 0 && Math.sin(S.t * 40) > 0;
  const raseri = 3 - B.hp;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(X + (B.fase === 'dod' ? (Math.random() - .5) * 8 : 0), Y);
  const sk = 1 + B.lad * .08; ctx.scale(sk, sk);
  ctx.strokeStyle = '#141826'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const ox = -24 + i * 12, l = 34 + Math.sin(S.t * 2 + i) * 8 + raseri * 4;
    ctx.beginPath(); ctx.moveTo(ox, 18); ctx.bezierCurveTo(ox + Math.sin(S.t * 1.7 + i) * 14, 18 + l * .5, ox - Math.sin(S.t * 1.3 + i) * 14, 18 + l * .8, ox + Math.sin(S.t + i) * 6, 18 + l); ctx.stroke(); }
  // spolene slukner etter hvert som sikringene slås av
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const tent = (s < 0 ? k : k + 4) < (B.hp / 3) * 8 + .01;
    ctx.fillStyle = tent ? '#c27a3e' : '#4a3426'; ctx.beginPath(); ctx.ellipse(s * 34, -12 + k * 8, 7, 4.5, 0, 0, 7); ctx.fill(); }
  const base = raseri === 2 ? ['#4a2a46', '#1f1220'] : raseri === 1 ? ['#3d3456', '#1c1828'] : ['#3a4157', '#1b1f2e'];
  const gr = ctx.createLinearGradient(0, -30, 0, 30); gr.addColorStop(0, flimmer ? '#d9d4ff' : base[0]); gr.addColorStop(1, flimmer ? '#8a80c0' : base[1]);
  ctx.fillStyle = gr; rr(ctx, -30, -28, 60, 50, 10); ctx.fill(); ctx.strokeStyle = '#59607c'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-24, 6 + i * 5); ctx.lineTo(24, 6 + i * 5); ctx.stroke(); }
  ctx.fillStyle = '#272c3f'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * 10 - 2, -36, 4, 9);
  for (const s of [-16, 16]) { ctx.fillStyle = '#d7dbe6'; rr(ctx, s - 4, -44, 8, 14, 3); ctx.fill(); ctx.fillStyle = '#9aa0b2'; for (let r = 0; r < 3; r++) ctx.fillRect(s - 5, -41 + r * 4, 10, 1.2); }
  const puls = Math.min(1, .7 + .3 * Math.sin(S.t * 6) + B.varsel * .6 + B.lad * .5);
  const cg = ctx.createRadialGradient(0, -4, 0, 0, -4, 16 + B.lad * 6); cg.addColorStop(0, '#ffffff'); cg.addColorStop(.4, raseri === 2 ? `rgba(255,120,200,${puls})` : `rgba(200,150,255,${puls})`); cg.addColorStop(1, 'rgba(120,60,220,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, -4, 16 + B.lad * 6, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffe1ff';
  if (B.stun > 0) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 9, -15); ctx.lineTo(s * 15, -9); ctx.moveTo(s * 15, -15); ctx.lineTo(s * 9, -9); ctx.stroke(); } }
  else for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 6, -10); ctx.lineTo(s * 18, -14 - raseri); ctx.lineTo(s * 17, -9); ctx.closePath(); ctx.fill(); }
  ctx.restore(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
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
  if (S.dod <= 0) { L(P.x + P.w / 2 + P.face * 8, P.y + 2, 220, .95); L(GN.x, GN.y, 130 + GN.flare * 80, .8); }
  SJEKK.forEach((c, i) => { const X = c.x * T + T / 2, Y = (c.y + 1) * T - 30; if (synlig(X, Y, 250)) L(X, Y, S.cpLit.has(i) ? 230 : 60, S.cpLit.has(i) ? .95 : .4); });
  ORBER.forEach(([x, y], i) => { if (S.orbTatt.has(i)) return; const X = x * T + T / 2, Y = y * T + T / 2; if (synlig(X, Y, 60)) L(X, Y, 55, .6); });
  for (const f of FUNN) if (!S.ev[f.id] && !(f.boss && !S.bossDone)) { const X = f.x * T + T / 2, Y = f.y * T + T / 2; if (synlig(X, Y, 200)) L(X, Y, 170, .9); }
  for (const [x, y] of hazListe) { const X = x * T + T / 2, Y = y * T + T - 10; if (synlig(X, Y, 80)) L(X, Y, 70 * (.6 + .4 * Math.sin(S.t * 30 + x * 3)), .6); }
  for (const kol of [73, 101]) { const t0 = tile(kol, 13); if (t0 === AIR) continue; L(kol * T + T / 2, 16 * T, t0 === DOOR ? 120 : 170, t0 === DOOR ? .5 : (S.ev.hansker ? .5 : .8)); }
  if (B.aktiv || !S.bossDone) BRYTERE.forEach(b => { if (synlig(b.x * T, b.y * T, 100)) L(b.x * T + T / 2, b.y * T + 6, b.av ? 60 : 90, .7); });
  if (synlig(TAVLE.x * T, TAVLE.y * T, 400)) L(TAVLE.x * T + T, TAVLE.y * T + 20, (S.ending > 0 || S.ferdig) ? 380 : 110, .9);
  if (B.aktiv) { const a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1; L(B.x, B.y, 300 + B.lad * 60, .9 * a); }
  for (const q of prosj) L(q.x, q.y, 70, .7);
  for (const b of bolger) L(b.x, b.row * T - 12, 80, .7);
  for (const s of striker) L(s.x, 15 * T, s.aktiv > 0 ? 260 : 90, s.aktiv > 0 ? .9 : .35);
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 80)) L(e.x + e.w / 2, e.y + 4, 50, .5);
  { const fa = lysbueFase(); if (fa && synlig(LYSBUE.x * T, LYSBUE.y0 * T, 120)) L((LYSBUE.x + .5) * T, 29.5 * T, fa === 2 ? 170 : 60, fa === 2 ? .85 : .4); }
  for (const [x, y] of KJELLERLYS) if (synlig(x * T, y * T, 200)) L(x * T + T / 2, y * T + 8, 150, .45);
  if (lyn) L((lyn.x1 + lyn.x2) / 2, (lyn.y1 + lyn.y2) / 2, 260, .8);
  if (S.power > 0) { const vw = cssW / skala; for (let x = 0; x < MW * T; x += 260) if (x > cam.x - 300 && x < cam.x + vw + 300) L(x, 10 * T, 600, S.power * .6); }
  if (S.hallLys > 0 && synlig(87 * T, 12 * T, 600)) for (let x = 76; x <= 99; x += 6) L(x * T, 9 * T, 300, .55 * S.hallLys);
}
function tegnGlod() {
  ctx.globalCompositeOperation = 'lighter';
  SJEKK.forEach((c, i) => { const X = c.x * T + T / 2, Y = (c.y + 1) * T - 30; if (!synlig(X, Y, 200)) return;
    if (S.cpLit.has(i)) { glod(SPR.w, X, Y, 90, .55 + .05 * Math.sin(S.t * 3 + i)); glod(SPR.h, X, Y, 14, .6);
      ctx.save(); ctx.translate(X, Y); ctx.rotate(-.5 + Math.sin(S.t * .3 + i) * .05); ctx.globalAlpha = .1; ctx.drawImage(KJEGLE, -60, 0, 120, 200); ctx.restore(); }
    else glod(SPR.w, X, Y, 30, .25); });
  ORBER.forEach(([x, y], i) => { if (S.orbTatt.has(i)) return; const X = x * T + T / 2, Y = y * T + T / 2 + Math.sin(S.t * 2 + i) * 4; if (!synlig(X, Y, 60)) return;
    glod(SPR.c, X, Y, 26, .8 + .2 * Math.sin(S.t * 4 + i)); glod(SPR.h, X, Y, 6, .9); });
  for (const f of FUNN) { if (S.ev[f.id] || (f.boss && !S.bossDone)) continue; const X = f.x * T + T / 2, Y = f.y * T + T / 2 + Math.sin(S.t * 2) * 4; if (!synlig(X, Y, 200)) continue;
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
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 60)) { glod(SPR.c, e.x + e.w / 2, e.y + 4, 18 + Math.sin(e.t * 9) * 3, .6);
    if (Math.sin(e.t * 23) > .7) { ctx.globalAlpha = .9; ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(190,245,255,.9)'; jagget(e.x + 4, e.y + 2, e.x + e.w - 4, e.y - 3, 3, 4, (e.t * 30 | 0)); } }
  if (!S.ev.hemmelig && synlig(10 * T, 29 * T, 100)) glod(SPR.c, 10 * T - 6, 29.5 * T, 14 + 4 * Math.sin(S.t * 2), .35);
  for (const [x, y] of KJELLERLYS) { if (x === 6 && !S.ev.hemmelig) continue; if (synlig(x * T, y * T, 120)) glod(SPR.w, x * T + T / 2, y * T + 8, 34, .35); }
  if (B.aktiv) { const a = B.fase === 'dod' ? clamp(B.dod / 2.4, 0, 1) : 1, rs = 3 - B.hp;
    glod(rs === 2 ? SPR.m : SPR.p, B.x, B.y, 170 + B.varsel * 80 + B.lad * 60, (.55 + .2 * Math.sin(S.t * 5)) * a); glod(SPR.h, B.x, B.y - 4, 22 + B.lad * 12, .7 * a);
    if (B.stun <= 0 && B.fase !== 'dod') { ctx.globalAlpha = .8; ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(220,180,255,.9)';
      for (let i = 0; i < 3 + rs; i++) { const v = (S.t * 3 + i * 2.1), r = 50 + 30 * Math.sin(v * 1.7); jagget(B.x, B.y - 4, B.x + Math.cos(v) * r, B.y + Math.sin(v) * r, 6, 5, (S.t * 18 | 0) + i * 7); } }
    if (B.varsel > 0) { ctx.globalAlpha = B.varsel * .6; ctx.fillStyle = 'rgba(200,140,255,1)'; const col = Math.floor(B.x / T); let row = Math.floor(B.y / T) + 1; while (row < MH && tile(col, row) !== SOL) row++;
      ctx.fillRect(B.x - 60, row * T - 3, 120, 3); } }
  for (const q of prosj) { glod(SPR.p, q.x, q.y, 28, .9); glod(SPR.h, q.x, q.y, 7, 1); }
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
    glod(SPR.w, lx, ly, 16, .7);
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(-P.face * Math.PI / 2 + P.face * .12); ctx.globalAlpha = .09; ctx.drawImage(KJEGLE, -50, 0, 100, 170); ctx.restore();
    const gs = 36 + 4 * Math.sin(S.t * 6) + GN.flare * 30;
    glod(SPR.c, GN.x, GN.y, gs, .75 + GN.flare * .25); glod(SPR.h, GN.x, GN.y, 8 + GN.flare * 6, 1);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
}
function tegnStov() { ctx.fillStyle = 'rgba(150,160,180,.35)'; for (const q of partikler) if (q.farge === 'd') { ctx.globalAlpha = q.liv / q.max * .6; ctx.beginPath(); ctx.arc(q.x, q.y, q.str * (1.4 - q.liv / q.max * .6), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
function tegnLys() {
  const g = lysG, k = lysC.width / cv.width, s = skala * dpr * k;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, lysC.width, lysC.height);
  const mork = S.mork * (1 - S.power * .75);
  g.fillStyle = `rgba(3,7,20,${mork})`; g.fillRect(0, 0, lysC.width, lysC.height);
  g.globalCompositeOperation = 'destination-out';
  for (const l of lys) { const r = l.r * s, x = (l.x - camX) * s, y = (l.y - camY) * s; if (x < -r || y < -r || x > lysC.width + r || y > lysC.height + r) continue;
    g.globalAlpha = clamp(l.i, 0, 1); g.drawImage(HULL, x - r, y - r, r * 2, r * 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(lysC, 0, 0, cv.width, cv.height);
}
let camX = 0, camY = 0;
function tegn() {
  S.frame++;
  const sh = S.shake > 0 ? Math.min(1, S.shake) * (INNST.rist ? 10 : 2.5) : 0;
  camX = cam.x + (Math.random() - .5) * sh; camY = cam.y + (Math.random() - .5) * sh;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  tegnBakgrunn(camX, camY);
  tegnMotes(false);
  const m = skala * dpr;
  ctx.setTransform(m, 0, 0, m, -camX * m, -camY * m);
  const vw = cssW / skala, vh = cssH / skala;
  const cx0 = Math.floor(camX / CPX), cx1 = Math.floor((camX + vw) / CPX), cy0 = Math.floor(camY / CPX), cy1 = Math.floor((camY + vh) / CPX);
  for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) { if (cx < 0 || cy < 0 || cx * CH >= MW || cy * CH >= MH) continue;
    ctx.drawImage(hentChunk(cx, cy), cx * CPX - 2, cy * CPX - 2, CPX + 4, CPX + 4); }
  // forhåndslag én bit utenfor skjermen per bilde
  const nx = (S.frame % 2 ? cx1 + 1 : cx0 - 1), ny = cy0 + (S.frame >> 1) % (cy1 - cy0 + 1);
  if (nx >= 0 && nx * CH < MW && ny >= 0 && ny * CH < MH && !chunks.has(nx + ',' + ny)) hentChunk(nx, ny);
  tegnDynamiskeFliser();
  tegnLysbue();
  tegnKran();
  SJEKK.forEach((c, i) => { if (synlig(c.x * T, c.y * T, 100)) tegnLampe(c, i); });
  if (synlig(TAVLE.x * T, TAVLE.y * T, 200)) tegnTavle();
  if (B.aktiv || !S.bossDone) BRYTERE.forEach(b => { if (synlig(b.x * T, b.y * T, 100)) tegnBryter(b); });
  for (const f of FUNN) if (!S.ev[f.id] && !(f.boss && !S.bossDone) && synlig(f.x * T, f.y * T, 100)) tegnFunn(f);
  for (const e of fiender) if (e.liv && synlig(e.x, e.y, 60)) tegnFiende(e);
  tegnBoss();
  tegnSpiller();
  tegnStov();
  samleLys();
  tegnLys();
  ctx.setTransform(m, 0, 0, m, -camX * m, -camY * m);
  tegnGlod();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  tegnForgrunn();
  tegnMotes(true);
  if (vign) ctx.drawImage(vign, 0, 0, cv.width, cv.height);
  if (S.flash > 0) { ctx.fillStyle = `rgba(${S.flashF},${Math.min(1, S.flash) * (INNST.rist ? .55 : .2)})`; ctx.fillRect(0, 0, cv.width, cv.height); }
  if (S.dod > 0) { ctx.fillStyle = `rgba(2,4,12,${clamp((1.2 - S.dod) / .6, 0, 1) * .85})`; ctx.fillRect(0, 0, cv.width, cv.height); }
}
