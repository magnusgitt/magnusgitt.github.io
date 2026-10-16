'use strict';
// Gnist – felles systemer for de nye områdene: soner, porter, figurer med sideoppdrag, vind og glideskjerm,
// nye fiendetyper (jager, skytter og skjold) og kraftmaster.

// ---------- soner ----------
// Verden er ett kart, men delt i soner som ligger under hverandre. Kameraet holder seg innenfor sonen montøren er i.
const SONER = [
  { id: 'byen', navn: 'Byen', y0: 0, y1: 71 },
  { id: 'linja', navn: 'Høyspentlinja', y0: 72, y1: 117 },
];
function soneFor(ty) { for (let i = SONER.length - 1; i >= 0; i--) if (ty >= SONER[i].y0) return i; return 0; }
const spillerSone = () => soneFor(Math.floor((P.y + P.h / 2) / T));

// ---------- porter mellom soner ----------
// { x, y0, y1: kolonne og rader porten dekker, til: [x, y] der montøren kommer ut, krav(): åpen?, stengt: tekst når den er låst }
const PORTER = [];
function portVed(px, py) { const tx = Math.floor(px / T), ty = Math.floor(py / T); return PORTER.find(p => tx === p.x && ty >= p.y0 && ty <= p.y1); }
function oppdaterPorter(dt) {
  const o = S.overgang;
  if (o) { o.t += dt; S.laas = .1; P.vx *= .8;
    if (!o.flyttet && o.t >= .35) { o.flyttet = true; P.x = o.til[0] * T + T / 2 - P.w / 2; P.y = (o.til[1] + 1) * T - P.h; P.vx = P.vy = 0; P.krok = null; P.safeX = P.x; P.safeY = P.y;
      GN.x = P.x; GN.y = P.y - 30; cam.anker = P.y; oppdaterKamera(0, true); oppdaterStemning(0, true); lagFiender(); for (const f of TILBAKESTILL) f(); }
    if (o.t >= .75) S.overgang = null; return; }
  if (S.dod > 0) return;
  const p = portVed(P.x + P.w / 2, P.y + P.h / 2); if (!p) return;
  if (!p.krav()) { hint('port-' + p.x, p.stengt, 4); P.vx = (P.x + P.w / 2 < (p.x + .5) * T ? -1 : 1) * 160; return; }
  S.overgang = { t: 0, til: p.til, flyttet: false }; lyd('port'); vib(20);
}
function tegnPorter() {
  for (const p of PORTER) { const X = p.x * T, Y0 = p.y0 * T, Y1 = (p.y1 + 1) * T; if (!synlig(X, Y0, 200)) continue; const aapen = p.krav();
    ctx.fillStyle = '#20262f'; ctx.fillRect(X - 6, Y0 - 10, T + 12, 10); ctx.fillRect(X - 6, Y0 - 10, 6, Y1 - Y0 + 10); ctx.fillRect(X + T, Y0 - 10, 6, Y1 - Y0 + 10);
    ctx.fillStyle = 'rgba(160,190,220,.25)'; ctx.fillRect(X - 6, Y0 - 10, T + 12, 1.5);
    const gr = ctx.createLinearGradient(0, Y0, 0, Y1); gr.addColorStop(0, aapen ? 'rgba(140,240,255,.35)' : 'rgba(60,70,90,.9)'); gr.addColorStop(1, aapen ? 'rgba(140,240,255,.08)' : 'rgba(30,36,48,.95)');
    ctx.fillStyle = gr; ctx.fillRect(X, Y0, T, Y1 - Y0);
    if (!aapen) { ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let y = Y0 + 8; y < Y1; y += 12) ctx.fillRect(X, y, T, 2); }
    ctx.fillStyle = aapen ? '#5dff9a' : (Math.sin(S.t * 4) > 0 ? '#ff5a4a' : '#5a2020'); ctx.beginPath(); ctx.arc(X + T / 2, Y0 - 5, 2.6, 0, 7); ctx.fill(); }
}
function porterGlod() {
  for (const p of PORTER) { if (!p.krav()) continue; const X = (p.x + .5) * T, Y = (p.y0 + p.y1 + 1) / 2 * T; if (!synlig(X, Y, 120)) continue;
    glod(SPR.c, X, Y, 70 + 6 * Math.sin(S.t * 3), .45); glod(SPR.g, X, p.y0 * T - 5, 14, .8);
    for (let i = 0; i < 3; i++) { const k = (S.t * .6 + i / 3) % 1; glod(SPR.h, X + Math.sin(i * 2 + S.t) * 8, (p.y1 + 1) * T - k * (p.y1 - p.y0 + 1) * T, 4, (1 - k) * .7); } }
}
function tegnOvergang() { const o = S.overgang; if (!o) return; const a = o.t < .35 ? o.t / .35 : 1 - (o.t - .35) / .4;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(2,4,10,${clamp(a, 0, 1)})`; ctx.fillRect(0, 0, cv.width, cv.height); }

// ---------- figurer og sideoppdrag ----------
// figur: { id, x, y (raden figuren står på), navn, drakt, replikk(): { linjer, ferdig() } }
const FIGURER = [], GJENSTANDER = [];
let figurNaer = null;
function oppdaterFigurer() {
  figurNaer = null; if (S.dod > 0 || anyBoss()) return;
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  for (const f of FIGURER) if (Math.abs(pcx - (f.x + .5) * T) < T * 1.6 && Math.abs(pcy - (f.y + .5) * T) < T * 1.4) { figurNaer = f; break; }
  // gjenstander til sideoppdrag
  for (const g of GJENSTANDER) { if ((S.oppdrag[g.oppdrag] || 0) >= 2) continue; const gx = (g.x + .5) * T, gy = (g.y + .5) * T;
    if (Math.abs(pcx - gx) < 22 && Math.abs(pcy - gy) < 26) { S.oppdrag[g.oppdrag] = 2; lyd('fag'); sprut(gx, gy, 30, 'w', 200); toast(g.funnet); lagre(); } }
}
const DLG = { linjer: [], i: 0, ferdig: null, navn: '' };
function snakk(f) {
  if (!f || S.mode !== 'spill') return; const r = f.replikk(); nullInput();
  DLG.linjer = r.linjer; DLG.i = 0; DLG.ferdig = r.ferdig || null; DLG.navn = f.navn; S.mode = 'dialog'; visDialog(); lyd('snakk');
}
function visDialog() { $('#dlgNavn').textContent = DLG.navn; $('#dlgTekst').textContent = DLG.linjer[DLG.i]; $('#dialog').classList.add('vis'); S.panelT = performance.now(); }
function nesteDialog() {
  if (S.mode !== 'dialog' || performance.now() - S.panelT < 250) return;
  DLG.i++; if (DLG.i < DLG.linjer.length) { visDialog(); lyd('snakk'); return; }
  $('#dialog').classList.remove('vis'); S.mode = 'spill'; sist = performance.now(); nullInput();
  if (DLG.ferdig) { const f = DLG.ferdig; DLG.ferdig = null; f(); } hud();
}
function tegnFigurer() {
  for (const f of FIGURER) { const X = (f.x + .5) * T, Y = (f.y + 1) * T; if (!synlig(X, Y, 80)) continue;
    tegnSkygge(X, Y, 16);
    ctx.save(); ctx.translate(X, Y); ctx.scale(P.x + P.w / 2 < X ? -1 : 1, 1);
    const d = f.drakt, pust = Math.sin(S.t * 2 + f.x) * .6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = d.bukse; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-2, -12); ctx.lineTo(-3, 0); ctx.moveTo(2, -12); ctx.lineTo(3, 0); ctx.stroke();
    ctx.fillStyle = '#22252e'; rr(ctx, -6, -2, 6, 3.5, 1.5); ctx.fill(); rr(ctx, 1, -2, 6, 3.5, 1.5); ctx.fill();
    ctx.fillStyle = d.jakke; rr(ctx, -7, -26 + pust * .3, 14, 15, 4); ctx.fill();
    if (d.refleks) { ctx.fillStyle = '#e8f2ff'; ctx.fillRect(-7, -20 + pust * .3, 14, 2); }
    ctx.strokeStyle = d.jakke; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(5, -22); ctx.lineTo(8, -15 + pust); ctx.stroke();
    ctx.fillStyle = '#e9b88e'; ctx.beginPath(); ctx.arc(8.5, -14 + pust, 2.4, 0, 7); ctx.fill();
    ctx.fillStyle = '#f0c39a'; ctx.beginPath(); ctx.arc(1, -31 + pust * .3, 5.6, 0, 7); ctx.fill();
    if (d.skjegg) { ctx.fillStyle = '#e8e8ea'; ctx.beginPath(); ctx.arc(1.5, -28.5 + pust * .3, 4.5, .1, Math.PI - .1); ctx.fill(); }
    ctx.fillStyle = '#1d1d24'; ctx.beginPath(); ctx.arc(3.4, -31.8 + pust * .3, .9, 0, 7); ctx.fill();
    ctx.fillStyle = d.hjelm; ctx.beginPath(); ctx.arc(1, -33 + pust * .3, 6.6, Math.PI, 0); ctx.fill(); ctx.fillRect(-6, -33.6 + pust * .3, 15, 2.4);
    ctx.restore(); ctx.lineCap = 'butt';
    if (figurNaer === f && S.mode === 'spill') { ctx.fillStyle = 'rgba(255,233,168,.95)'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'center'; ctx.fillText('💬', X, Y - 50 + Math.sin(S.t * 4) * 2); }
    else if (f.harNytt && f.harNytt()) { ctx.fillStyle = '#ffc56b'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', X, Y - 48 + Math.sin(S.t * 3) * 3); } }
  for (const g of GJENSTANDER) { if ((S.oppdrag[g.oppdrag] || 0) >= 2) continue; const X = (g.x + .5) * T, Y = (g.y + .5) * T + Math.sin(S.t * 2) * 3; if (!synlig(X, Y, 60)) continue;
    ctx.save(); ctx.translate(X, Y); ctx.rotate(-.6); g.tegn(); ctx.restore(); }
}
function figurGlod() {
  for (const g of GJENSTANDER) { if ((S.oppdrag[g.oppdrag] || 0) >= 2) continue; const X = (g.x + .5) * T, Y = (g.y + .5) * T; if (synlig(X, Y, 60)) { glod(SPR.w, X, Y, 40 + 4 * Math.sin(S.t * 3), .6); glod(SPR.h, X, Y, 8, .6); } }
  for (const f of FIGURER) { const X = (f.x + .5) * T, Y = f.y * T; if (synlig(X, Y, 80)) glod(SPR.w, X, Y - 2, 60, .35); }
}

// ---------- vind, oppvind og glideskjerm ----------
// vindkast kommer i en fast rytme: rolig → varsel → kast. Vindsonene sier hvor og hvilken vei det blåser.
const VINDSONER = [], OPPVIND = [];
const VIND = { fase: 'rolig', t: 0, styrke: 0, dir: 1 };
function oppdaterVind(dt) {
  VIND.t += dt; const lengde = { rolig: 3.2, varsel: 1.1, kast: 2.6 }[VIND.fase];
  if (VIND.t >= lengde) { VIND.t = 0; VIND.fase = VIND.fase === 'rolig' ? 'varsel' : VIND.fase === 'varsel' ? 'kast' : 'rolig';
    if (VIND.fase === 'kast' && vindSone(P.x + P.w / 2, P.y + P.h / 2)) { lyd('vind'); if (!S.tidsmodus) hint('vindkast', 'Vindkast! Vent til det løyer, eller bruk det.', 3); } }
  VIND.styrke = mot(VIND.styrke, VIND.fase === 'kast' ? 1 : 0, dt * 2.5);
}
function vindSone(x, y) { const tx = x / T, ty = y / T; return VINDSONER.find(v => tx >= v.x0 && tx <= v.x1 + 1 && ty >= v.y0 && ty <= v.y1 + 1); }
function iOppvind(x, y) { const tx = x / T, ty = y / T; return OPPVIND.find(v => tx >= v.x0 && tx <= v.x1 + 1 && ty >= v.y0 && ty <= v.y1 + 1); }
// kalles fra montørens bevegelse etter tyngdekraften
function luftKrefter(p, dt) {
  const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
  p.glir = !!(S.ev.glid && !p.onGround && !p.krok && p.dashT <= 0 && I.jumpHeld && (p.glirFor || p.vy > 30) && !p.vegg && S.laas <= 0);
  if (p.glir) { if (!p.glirFor) { lyd('glid'); p.glirT = 0; } p.glirT = (p.glirT || 0) + dt;
    if (p.vy > 95) p.vy = Math.max(95, p.vy - 4800 * dt); }
  p.glirFor = p.glir;
  const v = vindSone(cx, cy);
  if (v && VIND.styrke > 0) { const k = VIND.styrke * v.dir * (p.glir ? 1900 : p.onGround ? 600 : 1400); p.vx += k * dt; p.vx = clamp(p.vx, -560, 560); }
  const o = iOppvind(cx, cy);
  if (o && p.glir) { p.vy = mot(p.vy, -340, 4200 * dt); p.fallT = 0; }
}
function tegnSkjerm(p) {
  if (!p.glir || S.dod > 0) return; const X = p.x + p.w / 2, Y = p.y - 16, sv = Math.sin(S.t * 9) * 1.5, k = Math.min(1, (p.glirT || 0) * 8);
  ctx.save(); ctx.translate(X, Y); ctx.scale(k, k);
  ctx.strokeStyle = 'rgba(30,30,40,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-22, -2); ctx.lineTo(-4, 14); ctx.moveTo(22, -2); ctx.lineTo(4, 14); ctx.moveTo(0, -12); ctx.lineTo(0, 14); ctx.stroke();
  const gr = ctx.createLinearGradient(-26, 0, 26, 0); gr.addColorStop(0, '#d8642a'); gr.addColorStop(.5, '#ffb35a'); gr.addColorStop(1, '#d8642a');
  ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(0, -24 + sv, 26, 0); ctx.quadraticCurveTo(0, -10 + sv, -26, 0); ctx.fill();
  ctx.fillStyle = 'rgba(240,248,255,.85)'; ctx.beginPath(); ctx.moveTo(-14, -8); ctx.quadraticCurveTo(0, -18 + sv, 14, -8); ctx.quadraticCurveTo(0, -14 + sv, -14, -8); ctx.fill();
  ctx.restore();
}
function vindPartikler(dt) {
  const vw = cssW / skala, vh = cssH / skala;
  if (VIND.styrke > .05) for (const v of VINDSONER) { if (v.x1 * T < cam.x || v.x0 * T > cam.x + vw || v.y1 * T < cam.y || v.y0 * T > cam.y + vh) continue;
    if (Math.random() < dt * 40 * VIND.styrke) part(v.dir > 0 ? cam.x - 10 : cam.x + vw + 10, cam.y + Math.random() * vh, v.dir * (500 + Math.random() * 300), (Math.random() - .5) * 40, 1.6, 3, 'w', 0); }
  for (const o of OPPVIND) { if (o.x1 * T < cam.x - 40 || o.x0 * T > cam.x + vw + 40) continue;
    if (Math.random() < dt * 14) part((o.x0 + Math.random() * (o.x1 - o.x0 + 1)) * T, Math.min((o.y1 + 1) * T, cam.y + vh + 10), (Math.random() - .5) * 20, -220 - Math.random() * 160, 1.6, 4, 'c', 0); }
}
function tegnOppvind() {
  for (const o of OPPVIND) { const X0 = o.x0 * T, X1 = (o.x1 + 1) * T; if (!synlig(X0, o.y0 * T, (X1 - X0) + 400)) continue;
    for (let i = 0; i < 5; i++) { const k = (S.t * .5 + i / 5) % 1, y = (o.y1 + 1) * T - k * (o.y1 - o.y0 + 1) * T, x = X0 + (X1 - X0) * (.15 + .7 * hs(i, o.x0, 3)) + Math.sin(S.t * 2 + i) * 6;
      ctx.globalAlpha = Math.sin(k * Math.PI) * .35; ctx.strokeStyle = 'rgba(200,240,255,1)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.quadraticCurveTo(x + 6, y + 13, x, y); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}

// ---------- kraftmaster (gitter av stål, tegnes foran himmelen og bak montøren) ----------
// { x: midten i ruter, y0: toppen, y1: nederste rad, b: bredde nederst i ruter, armer: [[rad, halv bredde]] }
const MASTER = [];
function mastVed(m, y) { const k = (y - m.y0) / Math.max(1, m.y1 + 1 - m.y0); return lerp(.35, m.b / 2, k); }
function tegnMaster() {
  for (const m of MASTER) { const X = m.x * T, Y0 = m.y0 * T, Y1 = (m.y1 + 1) * T; if (!synlig(X, (Y0 + Y1) / 2, (Y1 - Y0) / 2 + 200)) continue;
    const h0 = .35 * T, h1 = m.b / 2 * T;
    ctx.strokeStyle = '#1b222c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - h0, Y0); ctx.lineTo(X - h1, Y1); ctx.moveTo(X + h0, Y0); ctx.lineTo(X + h1, Y1); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.beginPath(); const n = Math.max(3, Math.round((Y1 - Y0) / 40));
    for (let i = 0; i < n; i++) { const ya = lerp(Y0, Y1, i / n), yb = lerp(Y0, Y1, (i + 1) / n), ha = lerp(h0, h1, i / n), hb = lerp(h0, h1, (i + 1) / n);
      ctx.moveTo(X - ha, ya); ctx.lineTo(X + hb, yb); ctx.moveTo(X + ha, ya); ctx.lineTo(X - hb, yb); ctx.moveTo(X - hb, yb); ctx.lineTo(X + hb, yb); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(170,200,230,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X + h0 + 1.5, Y0); ctx.lineTo(X + h1 + 1.5, Y1); ctx.stroke();
    for (const [r, hb] of m.armer) { const Y = r * T; ctx.fillStyle = '#232b36'; ctx.fillRect(X - hb * T, Y, hb * 2 * T, 7); ctx.fillStyle = 'rgba(190,215,240,.22)'; ctx.fillRect(X - hb * T, Y, hb * 2 * T, 1.3);
      // isolatorer i endene
      for (const s of [-1, 1]) { const ix = X + s * (hb * T - 5); ctx.fillStyle = '#9fb7a8'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(ix, Y + 10 + k * 5, 4.5, 2, 0, 0, 7); ctx.fill(); } } }
    ctx.fillStyle = '#1b222c'; ctx.beginPath(); ctx.moveTo(X - 6, Y0); ctx.lineTo(X, Y0 - 12); ctx.lineTo(X + 6, Y0); ctx.fill(); }
}
function masteGlod() { for (const m of MASTER) { const X = m.x * T, Y = m.y0 * T - 12; if (synlig(X, Y, 100)) { const b = Math.sin(S.t * 2.2 + m.x) > .3 ? 1 : .25; glod(SPR.r, X, Y, 18, .9 * b); glod(SPR.h, X, Y, 3, b); } } }

// ---------- nye fiender ----------
// jager: svever stille til montøren kommer nær, så jager den. skytter: sikter og skyter lyskuler.
// skjold: går med et skjold foran seg. Slå den bakfra, eller hopp på den.
function nyFiende2(f) {
  if (f.type === 'jager') return { type: 'jager', hx: f.x * T + T / 2, hy: f.y * T + T / 2, x: f.x * T, y: f.y * T, w: 20, h: 18, vx: 0, vy: 0, dir: 1, liv: true, t: Math.random() * 6, jakt: false };
  if (f.type === 'skytter') return { type: 'skytter', x: f.x * T + 5, y: (f.y + 1) * T - 24, w: 22, h: 24, dir: -1, liv: true, t: 0, lad: 0, pause: 1.2 };
  if (f.type === 'skjold') return { type: 'skjold', x: (f.x0 + f.x1) / 2 * T, y: (f.y + 1) * T - 20, w: 26, h: 20, x0: f.x0 * T, x1: (f.x1 + 1) * T, dir: 1, liv: true, t: 0, snu: 0 };
  return null;
}
const NG = () => S.ngPluss ? 1.35 : 1;   // ny runde+: fiendene er raskere
function oppdaterFiende2(e, dt, pcx, pcy) {
  if (e.type === 'jager') {
    const dx = pcx - (e.x + e.w / 2), dy = pcy - (e.y + e.h / 2), d = Math.hypot(dx, dy);
    if (!e.jakt && d < 7 * T) { e.jakt = true; lyd('jager'); } else if (e.jakt && d > 11 * T) e.jakt = false;
    const mx = e.jakt ? pcx : e.hx + Math.sin(e.t * .8) * T, my = e.jakt ? pcy - 6 : e.hy + Math.sin(e.t * 1.6) * T * .4;
    const ax = mx - (e.x + e.w / 2), ay = my - (e.y + e.h / 2), l = Math.hypot(ax, ay) || 1, maks = (e.jakt ? 165 : 80) * NG();
    e.vx += ax / l * 520 * dt; e.vy += ay / l * 520 * dt; const v = Math.hypot(e.vx, e.vy); if (v > maks) { e.vx *= maks / v; e.vy *= maks / v; }
    e.x += e.vx * dt; e.y += e.vy * dt; e.dir = e.vx >= 0 ? 1 : -1; return true; }
  if (e.type === 'skytter') {
    const dx = pcx - (e.x + e.w / 2), dy = pcy - (e.y + 8), d = Math.hypot(dx, dy); e.dir = dx < 0 ? -1 : 1; e.sikt = Math.atan2(dy, dx);
    if (e.pause > 0) e.pause -= dt;
    else if (d < 11 * T) { if (e.lad === 0) lyd('relelad'); e.lad += dt * NG();
      if (e.lad > .9) { e.lad = 0; e.pause = 2.2 / NG(); lyd('releskudd'); const s = 230 * NG(); bolter.push({ x: e.x + e.w / 2 + Math.cos(e.sikt) * 14, y: e.y + 8 + Math.sin(e.sikt) * 14, vx: Math.cos(e.sikt) * s, vy: Math.sin(e.sikt) * s, liv: 5, f: 'o' }); } }
    else e.lad = Math.max(0, e.lad - dt);
    return true; }
  if (e.type === 'skjold') {
    const mot = Math.abs(pcx - (e.x + e.w / 2)) < 5 * T && Math.abs(pcy - (e.y + e.h / 2)) < 2 * T ? Math.sign(pcx - (e.x + e.w / 2)) : 0;
    if (mot && mot !== e.dir) { e.snu += dt; if (e.snu > .6) { e.dir = mot; e.snu = 0; } } else e.snu = 0;
    e.x += e.dir * 40 * NG() * dt; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x + e.w > e.x1) { e.x = e.x1 - e.w; e.dir = -1; } return true; }
  return false;
}
// skjoldet vender mot montøren: slag og støt forfra preller av
const skjoldForan = (e, px) => e.type === 'skjold' && Math.sign(px - (e.x + e.w / 2)) === e.dir;
function prellAv(e) { lyd('prell'); gnister(e.x + e.w / 2 + e.dir * 14, e.y + e.h / 2, 10, 'w'); P.vx = (P.x + P.w / 2 < e.x + e.w / 2 ? -1 : 1) * 330; P.vy = Math.min(P.vy, -200); P.dashT = 0; S.shake = Math.max(S.shake, .12); hint('skjold', 'Skjoldet tar slaget! Slå bakfra, eller hopp på den.', 3.5); }
function tegnFiende2(e) {
  if (e.type === 'jager') { const X = e.x + e.w / 2, Y = e.y + e.h / 2, t = e.t, va = e.jakt ? 1 : 0;
    ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir * 1.3, 1.3); ctx.rotate(clamp(e.vx / 600, -.4, .4));
    ctx.fillStyle = 'rgba(255,200,170,.35)'; const v = Math.sin(t * 45) * 3; ctx.beginPath(); ctx.ellipse(-2, -8, 9, 3 + v * .4, -.5, 0, 7); ctx.ellipse(-2, 8, 9, 3 - v * .4, .5, 0, 7); ctx.fill();
    const gr = ctx.createLinearGradient(-10, 0, 12, 0); gr.addColorStop(0, '#3a1408'); gr.addColorStop(1, '#c25a2c'); ctx.fillStyle = gr;
    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -7); ctx.lineTo(-10, 0); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,190,120,.85)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = va ? '#ff4a3a' : '#ffe36b'; ctx.beginPath(); ctx.arc(5, -1.5, 2.3, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,140,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-14, -3); ctx.lineTo(-16, 2); ctx.stroke(); ctx.restore(); return true; }
  if (e.type === 'skytter') { const X = e.x + e.w / 2, Y = e.y + e.h;
    ctx.fillStyle = '#2a1a14'; ctx.fillRect(X - 9, Y - 6, 18, 6); ctx.fillStyle = '#4a2a22'; rr(ctx, X - 10, Y - 20, 20, 15, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,170,110,.85)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.save(); ctx.translate(X, Y - 15); ctx.rotate(e.sikt || 0); ctx.fillStyle = '#6a3a28'; ctx.fillRect(0, -3.5, 15, 7); ctx.fillStyle = '#c9a77a'; for (let k = 0; k < 3; k++) ctx.fillRect(3 + k * 4, -4.5, 2, 9); ctx.restore();
    const lad = e.lad > 0 && Math.sin(S.t * (14 + e.lad * 30)) > 0; ctx.fillStyle = lad ? '#fff' : '#ff8a3a'; ctx.beginPath(); ctx.arc(X, Y - 15, 3.4, 0, 7); ctx.fill(); return true; }
  if (e.type === 'skjold') { const X = e.x + e.w / 2, Y = e.y + e.h, t = e.t;
    ctx.save(); ctx.translate(X, Y); ctx.scale(e.dir, 1);
    ctx.strokeStyle = '#1a0c06'; ctx.lineWidth = 2; for (let i = -1; i <= 1; i++) { const s = Math.sin(t * 12 + i * 2) * 2; ctx.beginPath(); ctx.moveTo(i * 7, -5); ctx.lineTo(i * 7 + 3 + s, 0); ctx.stroke(); }
    const gr = ctx.createLinearGradient(0, -20, 0, -4); gr.addColorStop(0, '#8a4a2a'); gr.addColorStop(1, '#3a1a0c'); ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(-2, -9, 13, 9, 0, Math.PI, 0); ctx.lineTo(11, -4); ctx.lineTo(-15, -4); ctx.fill();
    ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(6, -11, 1.8, 0, 7); ctx.fill();
    // skjoldet: en isolatorplate foran
    ctx.fillStyle = '#9aa7b8'; rr(ctx, 11, -20, 6, 20, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(12, -19, 1.5, 18);
    ctx.fillStyle = '#c9a77a'; for (let k = 0; k < 3; k++) ctx.fillRect(10, -17 + k * 6, 8, 1.6);
    ctx.restore(); return true; }
  return false;
}
function fiende2Glod(e) {
  if (e.type === 'skytter' && e.lad > 0) glod(SPR.o, e.x + e.w / 2, e.y + 9, 14 + e.lad * 40, .5 + e.lad * .5);
  if (e.type === 'skjold') glod(SPR.c, e.x + e.w / 2 + e.dir * 14, e.y + e.h / 2, 18, .35);
}

// ---------- bosser fra de nye områdene ----------
// hver boss: { navn, aktiv(), hp(), maks, kamp() (vises i HUD) }
const anyBoss = () => B.aktiv || B2.aktiv || B3.aktiv || B4.aktiv || BOSSER.some(b => b.aktiv());
const ekstraBoss = () => BOSSER.find(b => b.aktiv() && b.kamp());

// ---------- registrering ----------
OPPDATER.push(dt => { oppdaterVind(dt); oppdaterPorter(dt); oppdaterFigurer(); vindPartikler(dt); });
TEGN_VERDEN.push(() => { tegnMaster(); tegnOppvind(); tegnPorter(); tegnFigurer(); });
TEGN_GLOD.push(() => { masteGlod(); porterGlod(); figurGlod(); });
LYSKILDER.push(L => {
  for (const p of PORTER) if (p.krav() && synlig(p.x * T, p.y0 * T, 200)) L((p.x + .5) * T, (p.y0 + p.y1) / 2 * T, 160, .7);
  for (const f of FIGURER) if (synlig(f.x * T, f.y * T, 200)) L((f.x + .5) * T, f.y * T, 150, .6);
  for (const g of GJENSTANDER) if ((S.oppdrag[g.oppdrag] || 0) < 2 && synlig(g.x * T, g.y * T, 100)) L((g.x + .5) * T, (g.y + .5) * T, 100, .7);
  for (const m of MASTER) if (synlig(m.x * T, m.y0 * T, 100)) L(m.x * T, m.y0 * T - 12, 50, .5);
});
