'use strict';
// Gnist – spikerpistolen: kjøpes i verkstedet og skyter spiker mot vanlige fiender på avstand.
// Bossene tåler ikke spiker; de må fortsatt slås på sin egen måte.
OPPGRADERINGER.push({ id: 'spiker', navn: 'Spikerpistol', tekst: 'Skyter spiker mot fiender på avstand.', pris: 10 });
const SPIKER = [], FASTE_SPIKER = [];
let spikerCd = 0;
I.spikerP = false;
function skytSpiker() {
  if (!S.kjop.spiker || spikerCd > 0 || S.dod > 0 || S.mode !== 'spill') return false;
  spikerCd = .32; const d = P.face || 1;
  SPIKER.push({ x: P.x + P.w / 2 + d * 14, y: P.y + P.h * .42, vx: d * 980, liv: .42 });
  P.vx -= d * 40; lyd('spiker'); vib(8); gnister(P.x + P.w / 2 + d * 16, P.y + P.h * .42, 3, 'w'); return true;
}
function oppdaterSpiker(dt) {
  spikerCd = Math.max(0, spikerCd - dt);
  if (I.spikerP) { I.spikerP = false; skytSpiker(); }
  for (let i = SPIKER.length - 1; i >= 0; i--) { const s = SPIKER[i], x0 = s.x; s.x += s.vx * dt; s.liv -= dt;
    let borte = s.liv <= 0;
    if (!borte) for (const e of fiender) { if (!e.liv) continue; const lo = Math.min(x0, s.x), hi = Math.max(x0, s.x);
      if (hi > e.x - 2 && lo < e.x + e.w + 2 && s.y > e.y - 4 && s.y < e.y + e.h + 4) {
        borte = true;
        if (skjoldForan(e, x0)) { gnister(e.x + e.w / 2 + e.dir * 14, s.y, 8, 'w'); lyd('prell'); hint('skjoldspiker', 'Skjoldet stopper spikeren. Skyt den bakfra.', 3); }
        else { drepFiende(e); lyd('piskTreff'); sprut(e.x + e.w / 2, e.y + e.h / 2, 16, 'c', 200); gnister(e.x + e.w / 2, e.y + e.h / 2, 8, 'w'); }
        break; } }
    // veggen: spikeren blir sittende en stund (fiender sjekkes først, så en fiende inntil veggen også treffes)
    if (!borte && fast(Math.floor(s.x / T), Math.floor(s.y / T))) { borte = true; FASTE_SPIKER.push({ x: s.x - Math.sign(s.vx) * 6, y: s.y, d: Math.sign(s.vx), t: 4 }); if (FASTE_SPIKER.length > 12) FASTE_SPIKER.shift(); gnister(s.x, s.y, 4, 'w'); lyd('prell'); }
    if (borte) SPIKER.splice(i, 1); }
  for (let i = FASTE_SPIKER.length - 1; i >= 0; i--) if ((FASTE_SPIKER[i].t -= dt) <= 0) FASTE_SPIKER.splice(i, 1);
  if (S.kjop.spiker && !S.hintSett.has('spiker') && S.mode === 'spill') hint('spiker', erTouch ? 'Trykk Spiker for å skyte med spikerpistolen.' : 'Trykk G for å skyte med spikerpistolen.', 4);
}
function tegnSpiker() {
  const tegn = (x, y, d, a) => { ctx.globalAlpha = a; ctx.fillStyle = '#c9d2da'; ctx.fillRect(x - 9, y - 1.5, 18, 3); ctx.fillStyle = '#eef3f6'; ctx.fillRect(d > 0 ? x - 10 : x + 7, y - 3.5, 3, 7); ctx.globalAlpha = 1; };
  for (const s of SPIKER) { const g = ctx.createLinearGradient(s.x - Math.sign(s.vx) * 60, 0, s.x, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(1, 'rgba(255,240,200,.6)'); ctx.fillStyle = g; ctx.fillRect(Math.min(s.x, s.x - Math.sign(s.vx) * 60), s.y - 1, 60, 2); tegn(s.x, s.y, Math.sign(s.vx), 1); }
  for (const s of FASTE_SPIKER) tegn(s.x, s.y, s.d, Math.min(1, s.t));
}
OPPDATER.push(oppdaterSpiker);
TEGN_VERDEN.push(tegnSpiker);
TEGN_GLOD.push(() => { for (const s of SPIKER) glod(SPR.w, s.x, s.y, 16, .7); });
TILBAKESTILL.push(() => { SPIKER.length = 0; FASTE_SPIKER.length = 0; });
