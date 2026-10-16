'use strict';
// Gnist – område 6: Vannkraftdammen. Bassenger der vannet stiger og synker i rytme, gallerier inne i dammen,
// jordspydet, Damvokter Sigrid og Spenningsålen i magasinet.
const DY0 = 118;   // øverste rad i sonen

// ---------- terrenget ----------
OMRAADER.push({ navn: 'Vannkraftdammen', kart: [
  [3, 146, 3, 149, AIR],                                   // nisjen med porten tilbake til linja
  [4, 118, 24, 149, AIR],                                  // damfoten (ute)
  [21, 150, 24, 156, AIR], [21, 153, 24, 153, ONE], [25, 154, 29, 156, AIR],   // sjakt og tunnel ned til det første bassenget
  [25, 118, 29, 138, AIR],
  [30, 118, 44, 156, AIR],                                 // basseng 1: vannet løfter deg opp
  [45, 118, 58, 138, AIR],                                 // fjellhylla foran damveggen
  [59, 132, 150, 138, AIR],                                // galleriet inne i dammen
  [70, 139, 90, 156, AIR],                                 // basseng 2
  [96, 126, 112, 138, AIR],                                // verktøylageret
  [114, 139, 134, 156, AIR],                               // basseng 3: står under spenning til det er jordet
  [151, 118, 158, 138, AIR],                               // hylla ved magasinet
  [159, 118, 159, 138, AIR], [160, 118, 195, 156, AIR],    // magasinet (bossen)
  [163, 143, 166, 143, ONE], [189, 143, 192, 143, ONE], [176, 141, 179, 141, ONE],
  [196, 118, 198, 138, AIR],
] });

// ---------- bassengene ----------
const JORDET = () => (S.oppdrag.jordet || 0) >= 1;
const ARENA6 = { x0: 160, x1: 195, gulv: 157, midt: 178, hoy: 146, lav: 155.6 };
VANNSTAND.push(
  { id: 'b1', x0: 30, x1: 44, topp: 139, bunn: 157, niva: () => rytmeNiva(155.6, 139.6, 11, 0), elektrisk: () => false },
  { id: 'b2', x0: 70, x1: 90, topp: 139, bunn: 157, niva: () => rytmeNiva(155.6, 140.4, 10, 3), elektrisk: () => false },
  { id: 'b3', x0: 114, x1: 134, topp: 139, bunn: 157, niva: () => 141.5, elektrisk: () => !JORDET(), felle: true },
  { id: 'b4', x0: 160, x1: 195, topp: 139, bunn: 157, niva: () => B6.aktiv ? B6.niva : rytmeNiva(ARENA6.lav, ARENA6.hoy, 12, 5),
    elektrisk: () => B6.aktiv && B6.strom === 'aktiv', varsel: () => B6.aktiv && B6.strom === 'varsel' });

// ---------- porter, figurer og oppdrag ----------
PORTER.push({ x: 198, y0: 96, y1: 99, til: [5, 149], krav: () => S.boss5, stengt: 'Porten er låst. Lynfuglen vokter linja.' },
  { x: 3, y0: 146, y1: 149, til: [195, 99], krav: () => true });
FIGURER.push({ id: 'sigrid', x: 16, y: 149, navn: 'Damvokter Sigrid', drakt: { bukse: '#26323a', jakke: '#2f7a6a', refleks: true, skjegg: false, hjelm: '#e8e8ea' },
  harNytt: () => !S.oppdrag.maaler || S.oppdrag.maaler === 2,
  replikk() { const s = S.oppdrag.maaler || 0;
    if (s === 0) return { linjer: ['Hei der! Jeg er Sigrid, jeg passer på dammen.', 'Slusene går av og på hele tiden. Vent til vannet løfter deg, så kommer du opp.',
      'Isolasjonsmåleren min falt i det siste bassenget, og der står vannet under spenning. Får du den opp, skal du få lysorber av meg.'], ferdig: () => { S.oppdrag.maaler = 1; lagre(); sjekkMaal(true); } };
    if (s === 1) return { linjer: ['Måleren ligger på bunnen av bassenget som står under spenning. Det må jordes før du hopper uti!'] };
    if (s === 2) return { linjer: ['Måleren min! Tusen takk.', 'Med den sjekker vi at isolasjonen i kablene er god nok før vi setter spenning på.', 'Her, ta ti lysorber til verkstedet.'],
      ferdig: () => { S.oppdrag.maaler = 3; S.brukt -= 10; lyd('orb'); toast('Ti lysorber fra Sigrid!'); lagre(); hud(); sjekkMaal(true); } };
    return { linjer: [S.boss6 ? 'Ålen er borte, og turbinene går rolig igjen. Takk!' : 'Noe stort svømmer i magasinet. Det blinker blått under vannet.'] }; } },
  { id: 'jp', x: 113, y: 138, navn: 'Jordingspunkt', knapp: 'Bruk jordingspunktet',
    tegn(X, Y) { ctx.fillStyle = '#2a3036'; rr(ctx, X - 9, Y - 22, 18, 22, 3); ctx.fill(); ctx.strokeStyle = '#3fae5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X, Y - 18); ctx.lineTo(X, Y - 6); ctx.stroke();
      ctx.fillStyle = '#f2c23c'; ctx.fillRect(X - 7, Y - 21, 14, 3); ctx.fillStyle = '#3fae5a'; ctx.fillRect(X - 7, Y - 17, 14, 2);
      if (JORDET()) { ctx.fillStyle = '#c98a3a'; ctx.fillRect(X - 1.5, Y - 40, 3, 30); ctx.fillStyle = '#e8b060'; ctx.beginPath(); ctx.moveTo(X - 4, Y - 40); ctx.lineTo(X, Y - 48); ctx.lineTo(X + 4, Y - 40); ctx.fill(); } },
    replikk() {
      if (JORDET()) return { linjer: ['Jordspydet står godt. Bassenget er jordet og trygt å svømme i.'] };
      if (!S.ev.jord) return { linjer: ['Et jordingspunkt. Her kan noe kobles til jord, men du har ikke noe å koble med.'] };
      return { linjer: ['Du slår jordspydet ned og kobler bassenget til jord.', 'Gnistene dør ut. Vannet er trygt nå.'],
        ferdig: () => { S.oppdrag.jordet = 1; lyd('jord'); S.flash = .5; S.flashF = '170,255,190'; S.shake = .3; sprut(113.5 * T, 138 * T, 30, 'c', 260); lagre(); sjekkMaal(true); } }; } });
GJENSTANDER.push({ oppdrag: 'maaler', x: 124, y: 156, funnet: 'Du fant isolasjonsmåleren til Sigrid!', tegn() {
  ctx.fillStyle = '#f2c23c'; rr(ctx, -9, -12, 18, 24, 3); ctx.fill(); ctx.fillStyle = '#1d2228'; ctx.fillRect(-6, -9, 12, 8); ctx.fillStyle = '#8fe3ff'; ctx.fillRect(-5, -8, 10, 6);
  ctx.fillStyle = '#c0392b'; ctx.fillRect(-6, 4, 4, 5); ctx.fillStyle = '#222'; ctx.fillRect(2, 4, 4, 5); } });

// ---------- sjekkpunkt, funn, fagkort, lysorber og fiender ----------
SJEKK.push({ x: 8, y: 149 }, { x: 52, y: 138 }, { x: 100, y: 138 }, { x: 141, y: 138 }, { x: 154, y: 138 });
VERKSTED.push(19);
IKON.jord = '<svg viewBox="0 0 24 24"><path d="M11 1h2l1 4h-4zM10.5 6h3v11h-3zM4 18h16v2H4zM6.5 21h11v1.5h-11zM9 23.2h6V24H9z"/></svg>';
FUNN.push({ id: 'jord', x: 104, y: 138, navn: 'Jordspyd', tekst: 'Et spyd av kobber. Slå det ned ved et jordingspunkt, så tar jorda strømmen ut av vannet.',
  pc: 'Stå ved et jordingspunkt og trykk <b>↓</b>', mob: 'Stå ved et jordingspunkt og trykk på knappen' },
  { id: 'liv7', x: 178, y: 156, boss6: true, navn: 'Livsgnist', liten: true });
FAG.push(
  { x: 12, y: 149, tittel: 'Fallhøyde og vannmengde', tekst: 'Effekten fra et vannkraftverk avhenger av fallhøyden og hvor mye vann som renner gjennom turbinen hvert sekund. Dobbel fallhøyde gir omtrent dobbel effekt.' },
  { x: 52, y: 133, tittel: 'Pumpekraft', tekst: 'Et pumpekraftverk pumper vann opp i magasinet når det er mye strøm, og slipper det ned igjen gjennom turbinene når det trengs strøm.' },
  { x: 100, y: 130, tittel: 'Generator og frekvens', tekst: 'Generatorene i kraftverkene går i takt med hverandre. I det nordiske strømnettet holdes frekvensen på 50 Hz.' },
  { x: 128, y: 152, tittel: 'Kapslingsgrad (IP)', tekst: 'Utstyr ute og i fuktige rom skal ha riktig kapslingsgrad. I IP-koden sier det første sifferet hvor tett det er mot støv, og det andre hvor godt det tåler vann.' },
  { x: 155, y: 138, tittel: 'Utjevningsforbindelse', tekst: 'I baderom og svømmeanlegg kobles ledende deler sammen med en utjevningsforbindelse, så det ikke kan oppstå farlig spenning mellom dem.' });
ORBER.push([6, 147], [20, 146], [27, 136], [34, 150], [40, 145], [37, 140], [48, 137], [56, 128], [64, 137], [75, 150], [80, 143], [86, 150],
  [93, 137], [98, 128], [110, 128], [118, 150], [124, 146], [131, 150], [146, 137], [164, 141], [190, 141], [177, 139], [185, 150]);
FIENDE_DEF.push({ x0: 46, x1: 54, y: 138 }, { type: 'sveve', x: 37, y: 132, ax: 3, ay: 2 }, { type: 'skytter', x: 57, y: 138 }, { type: 'skjold', x0: 60, x1: 69, y: 138 },
  { type: 'jager', x: 80, y: 134 }, { x0: 97, x1: 102, y: 138 }, { type: 'skytter', x: 137, y: 138 }, { type: 'skjold', x0: 140, x1: 150, y: 138 });

// ---------- himmelen over dammen ----------
let DBG = null;
function lagDamBg() {
  const himmel = nyC(LW, LH), g = himmel.getContext('2d'), r = rng(71);
  let gr = g.createLinearGradient(0, 0, 0, LH); gr.addColorStop(0, '#020812'); gr.addColorStop(.5, '#08202c'); gr.addColorStop(.8, '#123544'); gr.addColorStop(1, '#1d4250');
  g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  for (let i = 0; i < 260; i++) { const x = r() * LW, y = r() * LH * .6, a = (.2 + r() * .6) * (1 - y / (LH * .65)); g.fillStyle = `rgba(225,240,255,${a})`; g.fillRect(x, y, 1.4, 1.4); }
  // et svakt nordlys langt borte: et hint om hvor ferden går
  for (let i = 0; i < 5; i++) { const y0 = LH * (.12 + i * .03); g.strokeStyle = `rgba(110,255,180,${.05 - i * .007})`; g.lineWidth = 60 - i * 8; g.beginPath();
    for (let x = -50; x <= LW + 50; x += 25) { const y = y0 + Math.sin(x * .004 + i) * 50 + Math.sin(x * .011) * 20; x < 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  myk(g, LW * .78, LH * .2, 260, 260, '180,230,255', .14); g.fillStyle = '#eef6ff'; g.beginPath(); g.arc(LW * .78, LH * .2, 26, 0, 7); g.fill();
  const vegg = flislag((g, r) => {
    // damveggen: en stor bue av betong med lys i inspeksjonsvinduene
    const top = 330;
    gr = g.createLinearGradient(0, top, 0, LH); gr.addColorStop(0, '#1c2a33'); gr.addColorStop(1, '#0d161c'); g.fillStyle = gr; g.fillRect(0, top, LW, LH - top);
    g.fillStyle = '#26363f'; g.fillRect(0, top - 14, LW, 16); g.fillStyle = 'rgba(200,230,240,.18)'; g.fillRect(0, top - 14, LW, 2);
    for (let x = 0; x < LW; x += 80) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, top, 3, LH - top); }
    for (let y = top + 40; y < LH - 120; y += 70) for (let x = 30; x < LW; x += 160) if (r() < .5) { g.fillStyle = r() < .7 ? 'rgba(255,205,120,.6)' : 'rgba(150,230,255,.5)'; g.fillRect(x, y, 10, 6); }
    // overløp: lyse striper der vannet renner ned
    for (const x of [380, 1180]) { gr = g.createLinearGradient(x, 0, x + 120, 0); gr.addColorStop(0, 'rgba(160,220,240,0)'); gr.addColorStop(.5, 'rgba(180,235,250,.35)'); gr.addColorStop(1, 'rgba(160,220,240,0)');
      g.fillStyle = gr; g.fillRect(x, top - 10, 120, LH - top); }
  }, 72);
  return { himmel, vegg };
}
function tegnDamBg(kx, ky) {
  if (!DBG) DBG = lagDamBg(); if (!LBG) LBG = lagLinjaBg();
  const cw = cv.width, ch = cv.height, vh = cssH / skala, t = clamp((ky - DY0 * T) / Math.max(1, 41 * T - vh), 0, 1);
  const hk = Math.max(cw / LW, ch / LH) * 1.08;
  ctx.drawImage(DBG.himmel, (cw - LW * hk) / 2 - (kx / (MW * T)) * LW * hk * .04, -(LH * hk - ch) * (.2 + t * .5), LW * hk, LH * hk);
  const k = ch / 640, lw = LW * k, lh = LH * k, slakk = lh - ch, lagY = pv => -slakk * (.5 + (t - .5) * pv);
  const lagX0 = p => { let x0 = -((kx * skala * dpr * p) % lw); if (x0 > 0) x0 -= lw; return x0; };
  const lag = (bilde, p, pv) => { const y = lagY(pv); for (let x = lagX0(p); x < cw; x += lw) ctx.drawImage(bilde, x, y, lw + 1, lh); };
  lag(LBG.fjern, .05, .25); lag(DBG.vegg, .18, .45);
  // vannet som renner i overløpene
  { const y0 = lagY(.45); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(190,240,255,.08)';
    for (let x = lagX0(.18); x < cw + lw; x += lw) for (const ox of [380, 1180]) for (let i = 0; i < 6; i++) { const sx = x + (ox + 10 + i * 18) * k, fy = ((S.t * 160 + i * 97) % 500) * k; ctx.fillRect(sx, y0 + (320 + fy) * k / k, 3 * k, 60 * k); }
    ctx.globalCompositeOperation = 'source-over'; }
  lag(LBG.naer, .4, .8);
  for (let i = 0; i < 2; i++) { const w = cw * 1.2, x = ((S.t * (12 + i * 6) * dpr - kx * skala * dpr * (.6 + i * .1) + i * w * .5) % (cw + w) + cw + w) % (cw + w) - w;
    ctx.globalAlpha = .1; ctx.drawImage(TAKE, x, ch * (.7 + i * .1), w, w * .25); }
  ctx.globalAlpha = 1;
}

// ---------- Spenningsålen ----------
const b6Fase = () => B6.hp >= 3 ? 1 : B6.hp === 2 ? 2 : 3;
function resetBoss6() { Object.assign(B6, { aktiv: false, fase: '', hp: S.boss6 ? 0 : 3, strom: '', syklus: '', dod: 0 }); hud(); }
function startBoss6() {
  Object.assign(B6, { aktiv: true, fase: 'intro', introT: 2.2, hp: 3, t: 0, x: ARENA6.midt * T, y: 154 * T, dir: 1, syklus: 'hoy', sT: 7, niva: rytmeNiva(ARENA6.lav, ARENA6.hoy, 12, 5), strom: '', stromT: 2.5, skuddT: 2, banner: false });
  lyd('sluse'); S.shake = .4; hud();
}
function b6Treff() {
  B6.hp--; lyd('b2treff'); S.shake = .5; S.flash = .4; S.flashF = '170,240,255'; vib(50); sprut(B6.x, B6.y, 40, 'c', 300); gnister(B6.x, B6.y, 14, 'w'); hud();
  if (B6.hp <= 0) { B6.fase = 'dod'; B6.dod = 2.6; S.slow = .9; lyd('bossdod'); B6.strom = ''; return; }
  B6.syklus = 'fyll'; B6.sT = 1.8; lyd('sluse'); if (B6.hp === 2) hint(null, 'Ålen skyter gnister nå. Slå dem bort med pisken!', 3.5);
}
function sluttBoss6() {
  S.boss6 = true; B6.aktiv = false; B6.fase = ''; S.flash = 1; S.flashF = '200,250,255'; sprut(B6.x, B6.y, 90, 'c', 400); lyd('slutt'); vib([40, 60, 120]);
  banner('Magasinet er stille', 'Spenningsålen er slått', 3.5); lagre(); hud(); sjekkMaal(true);
}
function oppdaterBoss6(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  if (!B6.aktiv) { if (!S.boss6 && S.dod <= 0 && !S.overgang && pcx > 161 * T && pcx < 195 * T && pcy > 140 * T && pcy < 158 * T) startBoss6(); return; }
  // ut av magasinet: kampen begynner på nytt neste gang, så spillet aldri låser seg
  if (B6.fase !== 'dod' && (pcx < 159.5 * T || pcx > 196 * T || pcy < 137 * T)) { resetBoss6(); return; }
  B6.t += dt; const f = b6Fase(), ng = NG();
  if (B6.fase === 'intro') { B6.introT -= dt; B6.niva += (ARENA6.hoy - B6.niva) * Math.min(1, dt * 2); B6.y += ((B6.niva + 4) * T - B6.y) * Math.min(1, dt * 2);
    if (!B6.banner && B6.introT < 1.6) { B6.banner = true; banner('Spenningsålen', 'Magasinet', 2.4); S.shake = .5; lyd('brol2'); }
    if (B6.introT <= 0) { B6.fase = 'kamp'; hud(); hint(null, 'Hold deg unna vannet når det gløder. Slå ålen når vannet er tappet ut.', 4.5); } return; }
  if (B6.fase === 'dod') { B6.dod -= dt; B6.niva += (ARENA6.lav - B6.niva) * Math.min(1, dt); if (Math.random() < dt * 30) gnister(B6.x + (Math.random() - .5) * 80, B6.y, 3, 'c'); if (B6.dod <= 0) sluttBoss6(); return; }
  B6.sT -= dt * ng;
  if (B6.syklus === 'hoy') { B6.niva += (ARENA6.hoy - B6.niva) * Math.min(1, dt * 2);
    // svømmer i en bue under overflaten
    const mx = ARENA6.midt * T + Math.sin(B6.t * (.5 + f * .1)) * 15 * T, my = (ARENA6.hoy + 4.5 + Math.sin(B6.t * 1.3) * 3) * T;
    B6.dir = mx > B6.x ? 1 : -1; B6.x += (mx - B6.x) * Math.min(1, dt * 1.5); B6.y += (my - B6.y) * Math.min(1, dt * 1.5);
    // strøm i vannet: varsel først, så støt
    B6.stromT -= dt * ng;
    if (B6.strom === '' && B6.stromT <= 0) { B6.strom = 'varsel'; B6.stromT = 1.1; lyd('golvvarsel'); }
    else if (B6.strom === 'varsel' && B6.stromT <= 0) { B6.strom = 'aktiv'; B6.stromT = 1.2; lyd('golv'); S.shake = Math.max(S.shake, .25); }
    else if (B6.strom === 'aktiv' && B6.stromT <= 0) { B6.strom = ''; B6.stromT = f === 1 ? 2.6 : f === 2 ? 2.1 : 1.6; }
    if (f >= 2) { B6.skuddT -= dt * ng; if (B6.skuddT <= 0 && !P.iVann) { B6.skuddT = f === 3 ? 1.5 : 2.2; const sx = B6.x, sy = B6.niva * T, a = Math.atan2(pcy - sy, pcx - sx), s = 240 * ng;
      bolter.push({ x: sx, y: sy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, liv: 4, f: 'c' }); lyd('releskudd'); sprut(sx, sy, 8, 'c', 120); } }
    if (B6.sT <= 0 && B6.strom !== 'aktiv') { B6.syklus = 'tapp'; B6.sT = 2; B6.strom = ''; lyd('sluse'); } }
  else if (B6.syklus === 'tapp') { B6.niva += (ARENA6.lav - B6.niva) * Math.min(1, dt * 2.2); B6.y += ((ARENA6.gulv - .45) * T - B6.y) * Math.min(1, dt * 3);
    if (B6.sT <= 0) { B6.syklus = 'lav'; B6.sT = 3.6; } }
  else if (B6.syklus === 'lav') { B6.niva = ARENA6.lav; B6.y = (ARENA6.gulv - .45) * T + Math.abs(Math.sin(B6.t * 6)) * -4; if (Math.random() < dt * 6) gnister(B6.x, B6.y - 6, 2, 'c');
    if (B6.sT <= 0) { B6.syklus = 'fyll'; B6.sT = 1.8; lyd('sluse'); } }
  else if (B6.syklus === 'fyll') { B6.niva += (ARENA6.hoy - B6.niva) * Math.min(1, dt * 1.6); if (B6.sT <= 0) { B6.syklus = 'hoy'; B6.sT = f === 3 ? 8 : 7; B6.stromT = 1.5; } }
  if (S.dod > 0) return;
  // kroppen: hodet og to ledd bak gjør vondt å komme borti mens den svømmer
  const ledd = [0, 1, 2].map(i => [B6.x - B6.dir * i * 26, B6.y + Math.sin(B6.t * 6 - i) * 5]);
  const borti = ledd.some(([x, y]) => Math.abs(pcx - x) < 18 + P.w / 2 && Math.abs(pcy - y) < 14 + P.h / 2);
  if (B6.syklus === 'lav') {
    const pisk = P.piskT > 0 ? piskOmraade() : null, [hx, hy] = ledd[0];
    const piskTraff = pisk && hx > pisk.x0 - 20 && hx < pisk.x1 + 20 && hy > pisk.y0 - 20 && hy < pisk.y1 + 20, trakk = borti && P.vy > 0 && P.y + P.h < B6.y;
    if (piskTraff || (borti && P.dashT > 0) || trakk) { if (trakk) { P.vy = -480; P.air = S.ev.dobbel ? 1 : 0; } b6Treff(); }
  } else if (borti && B6.syklus === 'hoy') skade(B6.x, false);
  if (B6.strom === 'aktiv' && P.iVann) { skade(pcx, false); P.vy = -520; }
}
function tegnBoss6() {
  if (!B6.aktiv) return; const a = B6.fase === 'dod' ? clamp(B6.dod / 2.6, 0, 1) : 1, lav = B6.syklus === 'lav';
  ctx.globalAlpha = a;
  const n = 7, ledd = []; for (let i = 0; i < n; i++) ledd.push([B6.x - B6.dir * i * 15, B6.y + Math.sin(B6.t * (lav ? 9 : 5) - i * .8) * (lav ? 3 : 7)]);
  ctx.lineCap = 'round'; ctx.strokeStyle = '#123247'; ctx.lineWidth = 24; ctx.beginPath(); ledd.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  ctx.strokeStyle = '#2a6f8f'; ctx.lineWidth = 16; ctx.stroke();
  ctx.strokeStyle = B6.strom === 'aktiv' ? '#e8fbff' : B6.strom === 'varsel' ? '#ffe36b' : '#7fdcff'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -S.t * 40; ctx.stroke(); ctx.setLineDash([]);
  // finne langs ryggen
  ctx.fillStyle = 'rgba(127,220,255,.6)'; for (let i = 1; i < n - 1; i++) { const [x, y] = ledd[i]; ctx.beginPath(); ctx.moveTo(x - 6, y - 8); ctx.lineTo(x, y - 18 - Math.sin(B6.t * 8 + i) * 3); ctx.lineTo(x + 6, y - 8); ctx.fill(); }
  ctx.lineCap = 'butt';
  const [hx, hy] = ledd[0]; ctx.save(); ctx.translate(hx, hy); ctx.scale(B6.dir, 1);
  ctx.fillStyle = '#1d4a66'; ctx.beginPath(); ctx.ellipse(6, 0, 20, 14, 0, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(190,240,255,.8)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#0a1a24'; ctx.beginPath(); ctx.moveTo(14, 4); ctx.lineTo(27, 2 + (lav ? Math.sin(B6.t * 12) * 3 : 0)); ctx.lineTo(14, 8); ctx.fill();
  ctx.fillStyle = lav ? '#cfe' : '#fff'; ctx.beginPath(); ctx.arc(12, -5, 4, 0, 7); ctx.fill(); ctx.fillStyle = lav ? '#567' : '#ff5a3c'; ctx.beginPath(); ctx.arc(13, -5, 2, 0, 7); ctx.fill();
  ctx.restore();
  if (lav) { ctx.strokeStyle = 'rgba(255,240,170,.85)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const v = S.t * 5 + i * 2.1; ctx.beginPath(); ctx.arc(hx + Math.cos(v) * 14, hy - 22 + Math.sin(v) * 4, 2.5, 0, 7); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
function boss6Glod() { if (!B6.aktiv) return; const a = B6.fase === 'dod' ? clamp(B6.dod / 2.6, 0, 1) : 1;
  for (let i = 0; i < 7; i += 2) glod(SPR.c, B6.x - B6.dir * i * 15, B6.y, 50, (B6.strom === 'aktiv' ? .8 : .45) * a); glod(SPR.r, B6.x + B6.dir * 12, B6.y - 5, 12, .8 * a); }

// ---------- registrering ----------
BOSSER.push({ navn: 'Spenningsålen', aktiv: () => B6.aktiv, hp: () => B6.hp, maks: 3, kamp: () => B6.fase === 'kamp' || B6.fase === 'dod' });
OPPDATER.push(dt => {
  oppdaterBoss6(dt);
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (!JORDET() && tx >= 108 && tx <= 113 && ty >= 130 && ty <= 139) hint('b3', S.ev.jord ? 'Bruk jordspydet ved jordingspunktet.' : 'Vannet står under spenning. Finn noe å jorde det med.', 4);
  if (tx >= 26 && tx <= 44 && ty >= 145 && ty <= 157) hint('b1', 'Vent på vannet. Det løfter deg opp.', 3.5);
});
TILBAKESTILL.push(() => { if (B6.aktiv && !S.boss6) resetBoss6(); });
TEGN_VERDEN.push(tegnBoss6);
TEGN_GLOD.push(boss6Glod);
LYSKILDER.push(L => {
  if (B6.aktiv) { const a = B6.fase === 'dod' ? clamp(B6.dod / 2.6, 0, 1) : 1; L(B6.x, B6.y, 260, .9 * a); if (B6.strom === 'aktiv') for (let x = ARENA6.x0; x <= ARENA6.x1; x += 5) L(x * T, B6.niva * T + 30, 200, .7); }
  for (const v of VANNSTAND) if (v.elektrisk() && synlig(v.x0 * T, v.niva() * T, 400)) for (let x = v.x0; x <= v.x1; x += 4) L((x + .5) * T, v.niva() * T + 10, 120, .5);
});
