'use strict';
// Gnist – liv i omgivelsene: gress og planter som svaier i vinden og bøyer seg unna montøren,
// og en verden som får tilbake lys og varme etter hvert som strømmen kommer tilbake.
const lysNiva = () => [S.boss, S.boss2, S.boss3, S.boss4, S.boss5, S.boss6].filter(Boolean).length / 6;
// vind i gresset: to langsomme bølger, så ikke alt beveger seg i takt
const gressVind = x => Math.sin(S.t * .8 + x * .045) * .22 + Math.sin(S.t * 2.1 + x * .13) * .08 + (soneFor(Math.floor(P.y / T)) === 1 ? VIND.styrke * VIND.dir * .5 : 0);
function tegnGress() {
  if (S.kval < 1) return;
  const vw = cssW / skala, vh = cssH / skala, x0 = Math.max(0, Math.floor(camX / T) - 1), x1 = Math.min(MW - 1, Math.floor((camX + vw) / T) + 1);
  const y0 = Math.max(1, Math.floor(camY / T) - 1), y1 = Math.min(MH - 1, Math.floor((camY + vh) / T) + 1);
  const pcx = P.x + P.w / 2, pfy = P.y + P.h, fart = Math.abs(P.vx);
  ctx.lineCap = 'round';
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!erSol(x, y) || tile(x, y - 1) !== AIR) continue;
    const pal = palAt(x, y); if (pal !== PAL.ute && !pal.gress) continue;
    if (inne(x, y - 1)) continue;
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
TEGN_VERDEN.unshift(tegnGress);
