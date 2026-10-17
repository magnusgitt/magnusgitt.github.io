'use strict';
// Gnist – liv i omgivelsene: gress og planter som svaier i vinden og bøyer seg unna montøren,
// og en verden som får tilbake lys og varme etter hvert som strømmen kommer tilbake.
const lysNiva = () => Math.min(1, [S.boss, S.boss2, S.boss3, S.boss4, S.boss5, S.boss6, S.boss7].filter(Boolean).length / 6);
// vind i gresset: to langsomme bølger, så ikke alt beveger seg i takt
const gressVind = x => Math.sin(S.t * .8 + x * .045) * .22 + Math.sin(S.t * 2.1 + x * .13) * .08 + (soneFor(Math.floor(P.y / T)) === 1 ? VIND.styrke * VIND.dir * .5 : 0);
function tegnGress() {
  if (S.kval < 1) return;
  const vw = cssW / skala, vh = cssH / skala, x0 = Math.max(0, Math.floor(camX / T) - 1), x1 = Math.min(MW - 1, Math.floor((camX + vw) / T) + 1);
  const y0 = Math.max(1, Math.floor(camY / T) - 1), y1 = Math.min(MH - 1, Math.floor((camY + vh) / T) + 1);
  const pcx = P.x + P.w / 2, pfy = P.y + P.h, fart = Math.abs(P.vx);
  ctx.lineCap = 'round';
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const tl = tile(x, y);
    // sumpen: siv langs kanten der vannet ligger ute i det fri
    if (tl === VANN && tile(x, y - 1) === AIR && !inne(x, y - 1)) { tegnSump(x, y); continue; }
    if (!erSol(x, y)) continue;
    const ute = !inne(x, y + 1) && !inne(x, y - 1), pal = palAt(x, y), natur = pal === PAL.ute || pal.gress;
    // slyngplanter henger ned fra kanter og overheng ute
    if (natur && ute && tile(x, y + 1) === AIR && hs(x, y, 180) < .32) tegnSlynge(x, y);
    if (tile(x, y - 1) !== AIR || !natur || inne(x, y - 1)) continue;
    if (hs(x, y, 190) < .1) tegnBregne(x * T + hs(x, y, 191) * T, y * T, hs(x, y, 192));
    const X = x * T, Y = y * T, n = 2 + (hs(x, y, 140) * 3 | 0);
    for (let i = 0; i < n; i++) {
      const bx = X + hs(x, y, 141 + i) * T, h = 9 + hs(x, y, 150 + i) * 13, stiv = .6 + hs(x, y, 160 + i) * .8;
      let a = gressVind(bx) / stiv + Math.sin(S.t * 3.1 + bx * .7) * .05;
      // montøren skyver gresset til side når han går gjennom det
      const dx = bx - pcx; if (Math.abs(dx) < 20 && Math.abs(pfy - Y) < 14) a += Math.sign(dx || 1) * (1 - Math.abs(dx) / 20) * (.5 + Math.min(1, fart / RUN) * .6);
      a = clamp(a, -1.2, 1.2);
      const tx = bx + Math.sin(a) * h, ty = Y - Math.cos(a) * h;
      ctx.strokeStyle = pal.stra[(i + x) % 3]; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(bx, Y + 1); ctx.quadraticCurveTo(bx + Math.sin(a) * h * .3, Y - h * .55, tx, ty); ctx.stroke();
      if (hs(x, y, 170 + i) < .14) { ctx.fillStyle = 'rgba(214,206,170,.85)'; ctx.beginPath(); ctx.ellipse(tx, ty, 1.4, 2.6, a, 0, 7); ctx.fill(); }
    }
  }
}
function tegnSlynge(x, y) {
  const X = x * T + hs(x, y, 181) * T, Y = (y + 1) * T, l = 14 + hs(x, y, 182) * 52, sv = gressVind(X) * 10 + Math.sin(S.t * 1.3 + x) * 2;
  const dx = X - (P.x + P.w / 2), dy = Y + l * .5 - (P.y + P.h / 2), skyv = Math.abs(dx) < 18 && Math.abs(dy) < l * .6 + 14 ? Math.sign(dx || 1) * (18 - Math.abs(dx)) * .8 : 0;
  ctx.strokeStyle = '#1f3a2c'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(X + sv * .4, Y + l * .5, X + sv + skyv, Y + l); ctx.stroke();
  ctx.fillStyle = '#2a5038'; for (let b = 6; b < l; b += 6) { const k = b / l, bx = X + (sv + skyv) * k * k + (b % 12 ? 2.2 : -2.2); ctx.beginPath(); ctx.ellipse(bx, Y + b, 2.6, 1.3, b % 12 ? .5 : -.5, 0, 7); ctx.fill(); }
}
function tegnBregne(X, Y, h) {
  const n = 5, s = 14 + h * 12; ctx.strokeStyle = '#24452f'; ctx.fillStyle = '#2d5a3a'; ctx.lineWidth = 1.2;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i / (n - 1) - .5) * 2.2 + gressVind(X) * .5, ex = X + Math.cos(a) * s, ey = Y + Math.sin(a) * s * .8;
    ctx.beginPath(); ctx.moveTo(X, Y); ctx.quadraticCurveTo(X + Math.cos(a) * s * .6, Y + Math.sin(a) * s - 4, ex, ey); ctx.stroke();
    for (let k = .3; k < 1; k += .17) { const px = X + (ex - X) * k, py = Y + (ey - Y) * k - Math.sin(k * Math.PI) * 3; ctx.beginPath(); ctx.ellipse(px, py, 3 * (1.1 - k), 1.1, a + 1.2, 0, 7); ctx.fill(); } }
}
function tegnSump(x, y) {
  const X = x * T, Y = y * T + 3 + Math.sin(S.t * 1.4 + x) * 1;
  // siv der vannet møter land
  if (erSol(x - 1, y) || erSol(x + 1, y)) { const kx = erSol(x - 1, y) ? X + 4 : X + T - 4; ctx.strokeStyle = '#2b4a32'; ctx.lineWidth = 1.3;
    for (let i = 0; i < 5; i++) { const sx = kx + (hs(x, y, 210 + i) - .5) * 10, h = 18 + hs(x, y, 220 + i) * 22, a = gressVind(sx) * .6;
      ctx.beginPath(); ctx.moveTo(sx, Y + 6); ctx.quadraticCurveTo(sx + a * h * .3, Y - h * .5, sx + Math.sin(a) * h, Y - h); ctx.stroke();
      if (i % 2) { ctx.fillStyle = '#3a2618'; ctx.beginPath(); ctx.ellipse(sx + Math.sin(a) * h * .9, Y - h * .9, 1.6, 4, a, 0, 7); ctx.fill(); } } }
}
TEGN_VERDEN.unshift(tegnGress);
// ---------- vær: regnbyger over den døde byen, løv som faller fra trærne og tåke over dammen ----------
const VAER = { regn: 0, take: 0, lov: Array.from({ length: 12 }, () => ({ x: Math.random(), y: Math.random(), ph: Math.random() * 6.28, s: .6 + Math.random() * .6, f: Math.random() < .5 })) };
const DRAPER = Array.from({ length: 170 }, () => ({ x: Math.random(), y: Math.random(), z: .5 + Math.random() * .8 }));
// regnet kommer i byger: litt yr nesten hele tiden, og en skikkelig byge av og til
const bygeStyrke = () => .2 + .8 * clamp(Math.sin(S.t * .045) * 1.8 - .4, 0, 1);
function oppdaterVaer(dt) {
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T), sone = soneFor(ty), ute = !inne(tx, ty);
  const regnMaal = ute && sone === 0 ? bygeStyrke() * (1 - lysNiva() * .5) : 0, takeMaal = ute && sone >= 2 ? 1 : 0;
  VAER.regn += (regnMaal - VAER.regn) * Math.min(1, dt * .8); VAER.take += (takeMaal - VAER.take) * Math.min(1, dt * .6);
}
function tegnVaer() {
  if (S.kval < 1 && VAER.regn < .05) return;
  const cw = cv.width, ch = cv.height;
  if (VAER.regn > .02) {
    // regnstriper i skrå vinkel, nærmeste dråper raskest og tydeligst
    const n = Math.round(DRAPER.length * VAER.regn * (S.kval < 2 ? .5 : 1)), sk = -.18 + gressVind(P.x) * .3;
    ctx.strokeStyle = 'rgba(175,200,235,.55)'; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) { const d = DRAPER[i], l = (10 + d.z * 14) * dpr;
      const sy = ((d.y * ch + S.t * (700 + d.z * 500) * dpr - cam.y * skala * dpr * d.z * .4) % (ch + l * 2) + ch + l * 2) % (ch + l * 2) - l;
      const sx = ((d.x * cw + sy * sk - cam.x * skala * dpr * d.z * .4) % (cw + 40) + cw + 40) % (cw + 40) - 20;
      ctx.globalAlpha = (.12 + d.z * .22) * Math.min(1, VAER.regn * 1.4); ctx.lineWidth = (.6 + d.z * .7) * dpr;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sk * l, sy + l); ctx.stroke(); }
    // en svak grå slør over bildet når det regner tett
    ctx.globalAlpha = VAER.regn * .07; ctx.fillStyle = '#9fb4cc'; ctx.fillRect(0, 0, cw, ch);
  }
  // løv som virvler ned i byen, bare ute
  if (S.kval > 0 && SYN.ute && soneFor(Math.floor(P.y / T)) === 0) for (const b of VAER.lov) {
    const sx = ((b.x * cw + Math.sin(S.t * .9 + b.ph) * 40 * dpr + S.t * 18 * dpr * b.s - cam.x * skala * dpr * .9) % (cw + 40) + cw + 40) % (cw + 40) - 20;
    const sy = ((b.y * ch + S.t * 34 * dpr * b.s - cam.y * skala * dpr * .9) % (ch + 40) + ch + 40) % (ch + 40) - 20, r = (2.6 + b.s * 1.8) * dpr;
    ctx.globalAlpha = .55; ctx.fillStyle = b.f ? '#3d5a34' : '#6a4a2a'; ctx.save(); ctx.translate(sx, sy); ctx.rotate(S.t * 2 * b.s + b.ph); ctx.scale(1, Math.abs(Math.sin(S.t * 3 * b.s + b.ph)) * .8 + .2);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * .45, 0, 0, 7); ctx.fill(); ctx.restore(); }
  // lav tåke som driver langs bakken ved dammen
  if (VAER.take > .02) for (let i = 0; i < 3; i++) { const w = cw * 1.3, x = ((S.t * (14 + i * 9) * dpr - cam.x * skala * dpr * (.9 + i * .15) + i * w * .5) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .1 * VAER.take; ctx.drawImage(TAKE, x, ch * (.62 + i * .1), w, w * .28); }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt';
}
OPPDATER.push(oppdaterVaer);
TEGN_FORAN.push(tegnVaer);
