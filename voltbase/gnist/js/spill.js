'use strict';
// Gnist – spillogikk: partikler, spillets gang, montøren, boss og kamera.
// ---------- partikler ----------
function part(x, y, vx, vy, liv, str, farge, grav) { if (partikler.length > 500) partikler.shift();
  partikler.push({ x, y, vx, vy, liv, max: liv, str, farge, grav: grav || 0 }); }
function gnister(x, y, n, f) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = 60 + Math.random() * 220; part(x, y, Math.cos(a) * s, Math.sin(a) * s - 60, .3 + Math.random() * .4, 3 + Math.random() * 4, f || 'w', 500); } }
function stov(x, y, n, kraft) { const k = kraft || 1; for (let i = 0; i < n; i++) part(x + (Math.random() - .5) * 16, y - 2, (Math.random() - .5) * 140 * k, -Math.random() * 50 * k, .35 + Math.random() * .35, 4 + Math.random() * 5, 'd', 60); }
function sprut(x, y, n, f, fart) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, s = (fart || 200) * (.3 + Math.random()); part(x, y, Math.cos(a) * s, Math.sin(a) * s, .5 + Math.random() * .7, 6 + Math.random() * 10, f, 0); } }
function ring(x, y, n, f, fart, flat) { for (let i = 0; i < n; i++) { const a = i / n * 6.28; part(x, y, Math.cos(a) * fart, Math.sin(a) * fart * (flat || 1), .45, 6, f, 0); } }

// ---------- spillets gang ----------
function lagFiender() { fiender.length = 0; for (const f of FIENDE_DEF) fiender.push({ x: (f.x0 + f.x1) / 2 * T, y: (f.y + 1) * T - 14, w: 22, h: 14, x0: f.x0 * T, x1: (f.x1 + 1) * T, dir: 1, liv: true, t: Math.random() * 6 }); }
function nyttSpill(lagret) {
  byggKart();
  S.ev = { dobbel: false, hansker: false, stot: false, liv: false, hemmelig: false }; S.cp = 0; S.cpLit = new Set([0]); S.orbTatt = new Set(); S.bossDone = false; S.tid = 0; S.ferdig = false;
  S.ending = 0; S.power = 0; S.dod = 0; S.hintSett = new Set(); S.dodsfall = 0; S.omr = ''; S.maal = ''; S.hallLys = 0; S.slow = 0; S.evneVent = 0; S.laas = 0;
  if (lagret) { Object.assign(S.ev, lagret.ev); S.cp = lagret.cp; S.cpLit = new Set([0, ...lagret.cpLit, lagret.cp]); S.orbTatt = new Set(lagret.orb);
    S.bossDone = lagret.boss; S.tid = lagret.tid; S.ferdig = lagret.ferdig; S.dodsfall = lagret.dod; }
  BRYTERE.forEach(b => b.av = S.bossDone);
  if (S.bossDone) { rect(101, 13, 101, 18, AIR); S.hallLys = 1; }
  if (S.ferdig) { S.power = 1; if (!BG.midtLys) BG.midtLys = lagMidt(true); }
  P.max = 4 + (S.ev.liv ? 1 : 0);
  B.aktiv = false; B.fase = ''; B.hp = S.bossDone ? 0 : 3; B.dod = 0; prosj.length = 0; bolger.length = 0; striker.length = 0; partikler.length = 0;
  beregnDyp(); chunks.clear();
  respawn(true);
  hud();
}
function respawn(stille) {
  const c = SJEKK[S.cp];
  P.x = c.x * T + T / 2 - P.w / 2; P.y = (c.y + 1) * T - P.h; P.vx = P.vy = 0; P.hp = P.max; P.inv = stille ? 0 : 1; P.dashT = 0; P.safeX = P.x; P.safeY = P.y;
  P.air = 0; P.spor.length = 0; P.onGround = true; P.canDash = true; P.paKran = false;
  if (B.aktiv && !S.bossDone) resetBoss();
  lagFiender();
  GN.x = P.x; GN.y = P.y - 30; GN.vx = GN.vy = 0;
  cam.anker = P.y; oppdaterKamera(0, true); hud();
  if (!stille) { lagre(); lyd('gjenoppstaa'); ring(P.x + P.w / 2, P.y + P.h / 2, 18, 'c', 160); }
}
function resetBoss() { B.aktiv = false; B.fase = ''; B.hp = 3; B.stun = 0; B.dod = 0; B.t = 0; B.x = 87.5 * T; B.y = 7.4 * T; BRYTERE.forEach(b => b.av = false);
  prosj.length = 0; bolger.length = 0; striker.length = 0; S.laas = 0; rect(73, 13, 73, 18, CUR); hud(); }
function startBoss() {
  B.aktiv = true; B.fase = 'intro'; B.introT = 2.6; B.hp = 3; B.t = 0; B.skuddT = 1.6; B.slagT = 5.5; B.lynT = 3; B.stun = 0; B.lad = 0;
  B.x = 87.5 * T; B.y = 3 * T;
  rect(73, 13, 73, 18, DOOR); lyd('dor'); S.shake = .4; P.vx = 0;
  gnister(73.5 * T, 16 * T, 16, 'o');
  setTimeout(() => { if (B.fase === 'intro') { lyd('brol'); S.shake = .8; banner('Overspenningen', 'Trafohallen', 2.4); } }, 700);
  hud();
}
function skade(fraX, felle) {
  if (P.inv > 0 || S.ending || S.dod > 0 || P.dashT > 0) return;
  P.hp--; P.inv = 1.3; S.shake = .35; S.flash = .45; S.flashF = '255,60,60'; lyd('au'); S.slow = .12; vib(P.hp <= 0 ? [60, 40, 120] : 70);
  sprut(P.x + P.w / 2, P.y + P.h / 2, 14, 'r', 220); hud(); pop('#liv');
  if (P.hp <= 0) { S.dod = 1.2; S.dodsfall++; lyd('dod'); sprut(P.x + P.w / 2, P.y + P.h / 2, 40, 'c', 300); return; }
  if (felle) { P.x = P.safeX; P.y = P.safeY; P.vx = P.vy = 0; P.dashT = 0; ring(P.x + P.w / 2, P.y + P.h / 2, 12, 'c', 120); }
  else { P.vx = (P.x + P.w / 2 < fraX ? -1 : 1) * 330; P.vy = -360; P.dashT = 0; }
}
function faaEvne(f) {
  S.ev[f.id] = true; lagre();
  const fx = f.x * T + T / 2, fy = f.y * T + T / 2;
  if (f.liten) { P.max = 5; P.hp = P.max; lyd('liv'); sprut(fx, fy, 30, 'c', 200); toast('Livsgnist funnet! Du tåler ett treff mer.'); hud(); pop('#liv'); return; }
  lyd('evne'); S.flash = .9; S.flashF = '255,235,190'; S.shake = .3; GN.flare = 1; vib([30, 60, 30]);
  sprut(fx, fy, 60, 'w', 320); sprut(fx, fy, 30, 'c', 200); ring(fx, fy, 24, 'w', 260);
  if (f.id === 'dobbel') P.air = 1;
  $('#evneIkon').innerHTML = IKON[f.id]; $('#evneNavn').textContent = f.navn; $('#evneTekst').textContent = f.tekst;
  $('#evneCtrl').innerHTML = erTouch ? f.mob : f.pc;
  hud(); S.evneVent = .75; nullInput();
}
function lukkEvne() { if (S.mode !== 'evne') return; S.mode = 'spill'; sist = performance.now(); nullInput(); visLag(null); sjekkMaal(true);
  if (S.ev.stot && !S.hintSett.has('stotbruk')) hint('stotbruk', 'Hovedtavla er på andre siden av sjakten.'); }
function nullInput() { I.jumpP = I.dashP = false; for (const k in K) K[k] = false; TS.left = TS.right = TS.jump = TS.dash = false; oppdaterTaster();
  $('#pad').dataset.dir = ''; document.querySelectorAll('.rund').forEach(b => b.classList.remove('trykk')); }

// ---------- montøren ----------
const RUN = 255;
function oppdaterSpiller(dt) {
  const p = P;
  // kranlasten beveger seg og tar med montøren
  KRAN.t += dt; const kx = KRAN.x0 + (.5 - .5 * Math.cos(KRAN.t * .55)) * (KRAN.x1 - KRAN.x0); KRAN.dx = kx - KRAN.x; KRAN.x = kx;
  if (S.dod > 0) return;
  if (p.paKran) flyttX(p, KRAN.dx);
  const laast = S.ending > 0 || S.laas > 0;
  const L = I.left && !laast, R = I.right && !laast;
  if (I.jumpP) { I.jumpP = false; if (!laast) p.buf = .14; }
  if (I.dashP) { I.dashP = false; if (!laast && S.ev.stot && p.canDash && p.dashCd <= 0 && p.dashT <= 0) {
    if (L) p.face = -1; if (R) p.face = 1;
    p.dashT = .16; p.canDash = false; p.dashCd = .3; p.vy = 0; lyd('stot'); S.shake = .12; GN.flare = .8; vib(18);
    ring(p.x + p.w / 2, p.y + p.h / 2, 10, 'c', 140, .6); } }
  p.buf -= dt; p.dashCd -= dt; p.inv -= dt; p.landT -= dt;
  p.coyote = p.onGround ? .11 : p.coyote - dt;
  if (p.dashT > 0) {
    p.dashT -= dt; p.vx = p.face * 930; p.vy = 0;
    p.sporT -= dt; if (p.sporT <= 0) { p.sporT = .022; p.spor.push({ x: p.x, y: p.y, t: .28 }); }
    if (Math.random() < .9) part(p.x + p.w / 2 - p.face * 8, p.y + p.h / 2 + (Math.random() - .5) * 22, -p.face * 60, (Math.random() - .5) * 50, .3, 7, 'c', 0);
    if (p.dashT <= 0) p.vx = p.face * 300;
  } else {
    const dir = (R ? 1 : 0) - (L ? 1 : 0);
    if (dir && dir !== p.face && p.onGround && Math.abs(p.vx) > 150) stov(p.x + p.w / 2, p.y + p.h, 3, .6);
    if (dir) p.face = dir;
    let acc;
    if (p.onGround) acc = dir ? (Math.sign(p.vx) === -dir ? 4200 : 2700) : 3400;   // rask snu og presis stopp
    else acc = dir ? 1900 : 900;                                                     // god luftkontroll, men farten bevares litt
    const toppfart = (!p.onGround && Math.abs(p.vx) > RUN && Math.sign(p.vx) === dir) ? Math.abs(p.vx) * .995 : RUN;
    p.vx = mot(p.vx, dir * toppfart, acc * dt);
    let gm = p.vy < 0 && !I.jumpHeld ? 2.5 : (p.vy > 0 ? 1.2 : 1);
    if (Math.abs(p.vy) < 90 && I.jumpHeld) gm *= .55;   // litt «sveve» på toppen av hoppet
    const maksFall = I.down ? 980 : 820;
    p.vy = Math.min(p.vy + 2000 * gm * dt, maksFall);
    if (p.buf > 0) {
      if (p.coyote > 0) { p.vy = -640; p.coyote = 0; p.buf = 0; p.onGround = false; p.sy = 1.28; p.sx = .78; lyd('hopp'); stov(p.x + p.w / 2, p.y + p.h, 5, .8); GN.vy += 140; p.paKran = false; }
      else if (p.air > 0) { p.vy = -600; p.air--; p.buf = 0; p.sy = 1.22; p.sx = .82; lyd('dobbel'); GN.flare = .7;
        ring(p.x + p.w / 2, p.y + p.h, 16, 'w', 150, .35); part(p.x + p.w / 2, p.y + p.h, 0, 30, .35, 26, 'c', 0); }
    }
  }
  const varBakke = p.onGround, vyFor = p.vy;
  p.onGround = false; p.paKran = false;
  flyttX(p, p.vx * dt);
  if (flyttY(p, p.vy * dt) === 1) p.onGround = true;
  if (p.onGround) { p.air = S.ev.dobbel ? 1 : 0; p.canDash = true;
    if (!varBakke && vyFor > 250) { const k = clamp(vyFor / 820, .3, 1); p.sx = 1 + .32 * k; p.sy = 1 - .3 * k; p.landT = .12 * k; stov(p.x + p.w / 2, p.y + p.h, 4 + (8 * k | 0), k); lyd('land'); if (k > .7) vib(12); } }
  if (!p.onGround && p.vy > 0) p.fallT += dt; else p.fallT = 0;
  p.sx += (1 - p.sx) * Math.min(1, dt * 13); p.sy += (1 - p.sy) * Math.min(1, dt * 13);
  if (p.onGround && Math.abs(p.vx) > 20) { const for_ = Math.sin(p.anim); p.anim += dt * Math.abs(p.vx) * .052; if (Math.sign(for_) !== Math.sign(Math.sin(p.anim))) { lyd('steg'); if (Math.random() < .5) stov(p.x + p.w / 2, p.y + p.h, 1, .3); } }
  const maalLean = p.dashT > 0 ? .55 * p.face : p.onGround ? clamp(p.vx / RUN, -1, 1) * .13 : clamp(p.vx / RUN, -1, 1) * .08;
  p.lean += (maalLean - p.lean) * Math.min(1, dt * 14);
  // feller (strømførende kabler)
  const x0 = Math.floor((p.x + 3) / T), x1 = Math.floor((p.x + p.w - 3) / T), y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h - 1) / T);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (tile(x, y) === HAZ && p.y + p.h > y * T + T * .55) { skade(0, true); return; }
  // trygt sted å komme tilbake til
  if (p.onGround && !p.paKran) { const fy = Math.floor((p.y + p.h + 1) / T), lx = Math.floor(p.x / T), hx = Math.floor((p.x + p.w) / T);
    let ok = tile(lx, fy) !== AIR && tile(hx, fy) !== AIR && tile(lx, fy) !== HAZ && tile(hx, fy) !== HAZ;
    for (let k = -2; k <= 2 && ok; k++) if (tile(lx + k, fy - 1) === HAZ || tile(lx + k, fy) === HAZ) ok = false;
    if (Math.abs(p.x + p.w / 2 - (LYSBUE.x + .5) * T) < T * 1.5 && fy - 1 >= LYSBUE.y0 && fy - 1 <= LYSBUE.y1) ok = false;
    if (ok) { p.safeX = p.x; p.safeY = p.y; } }
}
function lysbueFase() { const f = S.t % LYSBUE.per; return f < 1.2 ? 0 : f < 1.75 ? 1 : f < 2.95 ? 2 : 0; } // 0 av, 1 varsel, 2 på
let sistBue = 0;
function oppdaterVerden(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  if (S.dod > 0) { S.dod -= dt; if (S.dod <= 0) respawn(); return; }
  // sjekkpunkt
  SJEKK.forEach((c, i) => { const cx = c.x * T + T / 2, cy = c.y * T + T / 2;
    if (Math.abs(pcx - cx) < T * 1.2 && Math.abs(pcy - cy) < T * 1.4) {
      if (!S.cpLit.has(i)) { S.cpLit.add(i); lyd('lampe'); sprut(cx, cy - 10, 24, 'w', 160); toast('Sjekkpunkt tent'); }
      if (S.cp !== i || P.hp < P.max) { if (P.hp < P.max) pop('#liv'); S.cp = i; P.hp = P.max; hud(); lagre(); } } });
  // lysorber
  ORBER.forEach(([x, y], i) => { if (S.orbTatt.has(i)) return; const ox = x * T + T / 2, oy = y * T + T / 2 + Math.sin(S.t * 2 + i) * 4;
    if (Math.abs(pcx - ox) < 22 && Math.abs(pcy - oy) < 26) { S.orbTatt.add(i); lyd('orb'); sprut(ox, oy, 16, 'c', 140); hud(); pop('#orbtall'); lagre();
      if (S.orbTatt.size === ORBER.length) toast('Alle lysorbene funnet!'); } });
  // hemmelig rom
  if (!S.ev.hemmelig) { const tx = Math.floor(pcx / T), ty = Math.floor(pcy / T);
    if (iSkjult(tx, ty)) { S.ev.hemmelig = true; beregnDyp(); chunks.clear(); lyd('hemmelig'); toast('Hemmelig rom funnet!'); sprut(pcx, pcy, 30, 'c', 180); lagre(); } }
  // funn
  for (const f of FUNN) { if (S.ev[f.id] || (f.boss && !S.bossDone)) continue; const fx = f.x * T + T / 2, fy = f.y * T + T / 2;
    if (Math.abs(pcx - fx) < 22 && Math.abs(pcy - fy) < 26) { faaEvne(f); return; } }
  // fiender (gnistlus): hopp på dem eller bruk støtet
  for (const e of fiender) { if (!e.liv) continue; e.t += dt;
    e.x += e.dir * 46 * dt; if (e.x < e.x0) { e.x = e.x0; e.dir = 1; } if (e.x + e.w > e.x1) { e.x = e.x1 - e.w; e.dir = -1; }
    if (P.x + P.w > e.x && P.x < e.x + e.w && P.y + P.h > e.y && P.y < e.y + e.h) {
      if (P.dashT > 0 || (P.vy > 0 && P.y + P.h - e.y < 14)) { e.liv = false; lyd('trakk'); vib(15); sprut(e.x + e.w / 2, e.y + e.h / 2, 18, 'c', 200); S.shake = .15;
        if (P.dashT <= 0) { P.vy = -470; P.air = S.ev.dobbel ? 1 : 0; P.canDash = true; P.sy = 1.2; P.sx = .85; } }
      else skade(e.x + e.w / 2, false); } }
  // lysbue i kjelleren
  { const fa = lysbueFase(); if (fa === 2 && sistBue !== 2 && Math.abs(pcx - (LYSBUE.x + .5) * T) < 600) lyd('bue'); sistBue = fa;
    if (fa === 2 && Math.abs(pcx - (LYSBUE.x + .5) * T) < 10 + P.w / 2 && P.y + P.h > LYSBUE.y0 * T && P.y < (LYSBUE.y1 + 1) * T) skade((LYSBUE.x + .5) * T, false); }
  // brytere
  if (B.aktiv && B.fase === 'kamp') BRYTERE.forEach(b => { if (b.av) return; const bx = b.x * T + T / 2, by = b.y * T + T / 2;
    if (Math.abs(pcx - bx) < 20 && Math.abs(pcy - by) < 26) { b.av = true; B.hp--; B.stun = 1.8; lyd('bryter'); S.shake = .5; vib(50); S.flash = .5; S.flashF = '200,150,255'; S.hallFlimmer = 1;
      sprut(bx, by, 26, 'p', 240); lyn = { x1: bx, y1: by, x2: B.x, y2: B.y, t: .35 }; prosj.length = 0; striker.length = 0;
      if (B.hp <= 0) { B.fase = 'dod'; B.dod = 2.4; S.slow = .9; lyd('bossdod'); }
      else toast(`Sikring ${3 - B.hp} av 3 slått av`);
      hud(); } });
  oppdaterBoss(dt);
  // område og hint
  const tx = Math.floor(pcx / T), ty = Math.floor(pcy / T);
  const omr = omraade(tx, ty); if (omr !== S.omr) { S.omr = omr; if (!S.hintSett.has('omr-' + omr)) { S.hintSett.add('omr-' + omr); if (omr !== 'Trafohallen') banner(omr, '', 2.2); } }
  sjekkMaal(false);
  if (!S.ev.dobbel && tx >= 30 && tx <= 34 && ty >= 20 && ty <= 23) hint('vegg', 'For høyt å hoppe. Kanskje noe nede i kjelleren kan hjelpe?');
  if (!S.ev.dobbel && tx >= 25 && tx <= 27 && ty >= 27) hint('bue', 'Vent til lysbuen slukner før du går forbi.');
  if (S.ev.dobbel && !S.ev.hansker && tx >= 40 && tx <= 46 && ty <= 18) hint('stillas', 'Klatre opp stillaset. Noe glitrer helt på toppen.');
  if (!S.ev.stot && S.bossDone && tx >= 102 && tx <= 104) hint('sjakt', 'For langt å hoppe. Hent Strømstøtet i trafohallen.');
  if (S.ev.stot && tx >= 102 && tx <= 104) hint('sjakt2', 'Hopp, hopp igjen og bruk Strømstøt for å komme over.');
  // hovedtavla
  if (!S.ending && !S.ferdig && !B.aktiv && pcx > TAVLE.x * T - 6 && pcx < (TAVLE.x + 2) * T + 6 && pcy > (TAVLE.y - 1) * T) {
    S.ending = .001; lyd('slutt'); S.flash = 1; S.flashF = '255,245,220'; S.ferdig = true; lagre();
    SJEKK.forEach((c, i) => S.cpLit.add(i)); banner('Strømmen er tilbake', '', 3.5);
  }
  if (S.ending > 0) {
    S.ending += dt; S.power = clamp((S.ending - .4) / 2.5, 0, 1);
    if (!BG.midtLys) BG.midtLys = lagMidt(true);
    if (Math.random() < dt * 30) part(cam.x + Math.random() * cssW / skala, cam.y + cssH / skala + 10, (Math.random() - .5) * 20, -60 - Math.random() * 90, 3 + Math.random() * 2, 5 + Math.random() * 8, Math.random() < .5 ? 'w' : 'c', -5);
    if (S.ending > 4.4 && S.mode === 'spill') { S.mode = 'slutt'; S.ending = 0; S.power = 1; visSlutt(); }
  }
}
function oppdaterBoss(dt) {
  if (!B.aktiv) { if (!S.bossDone && P.x / T >= 75 && P.x / T <= 100 && P.y / T > 5 && P.y / T < 19) startBoss(); return; }
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  if (B.fase === 'intro') {
    B.introT -= dt; S.laas = .1;
    B.y += (7.4 * T - B.y) * Math.min(1, dt * 2.2); B.t += dt;
    if (Math.random() < .5) gnister(B.x + (Math.random() - .5) * 60, 5.5 * T, 2, 'p');
    if (B.introT <= 0) { B.fase = 'kamp'; S.laas = 0; hint(null, 'Slå av de tre sikringene for å stoppe Overspenningen!', 4.5); hud(); sjekkMaal(true); }
    return;
  }
  B.t += dt * (1 + (3 - B.hp) * .28);
  if (B.fase === 'dod') {
    B.dod -= dt; S.shake = Math.max(S.shake, .25); B.y += 20 * dt;
    if (Math.random() < .7) sprut(B.x + (Math.random() - .5) * 60, B.y + (Math.random() - .5) * 50, 3, Math.random() < .5 ? 'p' : 'c', 260);
    if (B.dod <= 0) { S.bossDone = true; B.aktiv = false; B.fase = ''; rect(73, 13, 73, 18, CUR); rect(101, 13, 101, 18, AIR); S.flash = 1; S.flashF = '230,210,255';
      sprut(B.x, B.y, 90, 'p', 420); sprut(B.x, B.y, 50, 'w', 300); ring(B.x, B.y, 30, 'h', 380); lyd('dor'); lagre(); hud();
      banner('Overspenningen er slått ut', 'Lyset i hallen er tilbake', 3); }
    return;
  }
  const raseri = 3 - B.hp;
  const mx = 87.5 * T + Math.sin(B.t * .6) * 9 * T, my = 7.4 * T + Math.sin(B.t * 1.3) * .6 * T + (B.stun > 0 ? Math.sin(B.stun * 10) * 6 + 18 : 0);
  B.x += (mx - B.x) * Math.min(1, dt * 3); B.y += (my - B.y) * Math.min(1, dt * 3);
  if (Math.hypot(pcx - B.x, pcy - B.y) < 32) skade(B.x, false);
  if (B.stun > 0) { B.stun -= dt; B.lad = 0; B.varsel = 0; return; }
  // ballskudd, med synlig og hørbar lading først
  B.skuddT -= dt; B.lad = B.skuddT < .55 ? 1 - B.skuddT / .55 : 0;
  if (B.skuddT < .55 && B.skuddT + dt >= .55) lyd('lad');
  if (B.skuddT <= 0) { const n = 2 + raseri, tf = 1.25; lyd('skudd');
    for (let i = 0; i < n; i++) { const dx = pcx - B.x, dy = pcy - B.y;
      prosj.push({ x: B.x, y: B.y + 20, vx: dx / tf + (i - (n - 1) / 2) * 90, vy: (dy - .5 * 700 * tf * tf) / tf, liv: 4 }); }
    B.skuddT = 2.8 - raseri * .45; }
  // bakkeslag (bølger langs gulvet)
  B.slagT -= dt; B.varsel = B.slagT < .9 ? 1 - B.slagT / .9 : 0;
  if (B.slagT <= 0) {
    const col = Math.floor(B.x / T); let row = Math.floor(B.y / T) + 1; while (row < MH && tile(col, row) !== SOL) row++;
    lyn = { x1: B.x, y1: B.y, x2: B.x, y2: row * T, t: .3 }; lyd('slag'); S.shake = .45;
    bolger.push({ x: B.x, dir: 1, row, liv: 4 }, { x: B.x, dir: -1, row, liv: 4 });
    B.slagT = 6.8 - raseri * 1.3; B.varsel = 0;
  }
  // nedslag fra taket (fra andre sikring)
  if (B.hp <= 2) { B.lynT -= dt;
    if (B.lynT <= 0) { const xs = B.hp === 1 ? [pcx, pcx - 3.5 * T, pcx + 3.5 * T] : [pcx + (Math.random() - .5) * T];
      xs.forEach(x => { if (x > 74.5 * T && x < 100.5 * T) striker.push({ x, varsel: .95, aktiv: 0 }); }); lyd('varsel'); B.lynT = B.hp === 1 ? 3.6 : 4.6; } }
}
function oppdaterProsj(dt) {
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  for (let i = prosj.length - 1; i >= 0; i--) { const q = prosj[i]; q.vy += 700 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.liv -= dt;
    if (Math.random() < .5) part(q.x, q.y, 0, 0, .3, 7, 'p', 0);
    const t = tile(Math.floor(q.x / T), Math.floor(q.y / T));
    if (t === SOL || t === DOOR || q.liv <= 0) { gnister(q.x, q.y, 8, 'p'); prosj.splice(i, 1); continue; }
    if (Math.abs(q.x - pcx) < 8 + P.w / 2 && Math.abs(q.y - pcy) < 8 + P.h / 2) { skade(q.x, false); gnister(q.x, q.y, 8, 'p'); prosj.splice(i, 1); } }
  for (let i = bolger.length - 1; i >= 0; i--) { const b = bolger[i]; b.x += b.dir * 290 * dt; b.liv -= dt;
    const col = Math.floor(b.x / T);
    if (tile(col, b.row) !== SOL || fast(col, b.row - 1) || b.liv <= 0) { gnister(b.x, b.row * T - 10, 6, 'p'); bolger.splice(i, 1); continue; }
    if (Math.random() < .7) part(b.x, b.row * T - 4, -b.dir * 30, -80 - Math.random() * 80, .3, 5, 'p', 0);
    if (P.y + P.h > b.row * T - 22 && P.y < b.row * T && Math.abs(b.x - pcx) < 10 + P.w / 2) skade(b.x, false); }
  for (let i = striker.length - 1; i >= 0; i--) { const s = striker[i];
    if (s.varsel > 0) { s.varsel -= dt; if (s.varsel <= 0) { s.aktiv = .28; lyd('nedslag'); S.shake = Math.max(S.shake, .25); gnister(s.x, 19 * T - 4, 12, 'p'); } }
    else { s.aktiv -= dt; if (Math.abs(s.x - pcx) < 13 + P.w / 2 && P.y + P.h > 6 * T) skade(s.x, false); if (s.aktiv <= 0) striker.splice(i, 1); } }
  if (lyn) { lyn.t -= dt; if (lyn.t <= 0) lyn = null; }
}
function oppdaterPartikler(dt) {
  for (let i = partikler.length - 1; i >= 0; i--) { const q = partikler[i]; q.liv -= dt; if (q.liv <= 0) { partikler.splice(i, 1); continue; }
    q.vy += q.grav * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= (1 - dt * 1.5); }
  for (let i = P.spor.length - 1; i >= 0; i--) { P.spor[i].t -= dt; if (P.spor[i].t <= 0) P.spor.splice(i, 1); }
  // gnisten følger montøren, med litt eget liv. Står du stille en stund, peker den mot neste mål.
  S.idle = (P.onGround && Math.abs(P.vx) < 10 && S.mode === 'spill') ? S.idle + dt : 0;
  let tx = P.x + P.w / 2 - P.face * 20 + Math.sin(S.t * 1.3) * 7 + Math.sin(S.t * 3.1) * 2, ty = P.y - 14 + Math.sin(S.t * 2.1) * 6;
  if (P.dashT > 0) { tx = P.x + P.w / 2 + P.face * 26; ty = P.y + 4; }
  const mp = maalPunkt();
  if (S.idle > 2.5 && mp) { const dx = mp[0] * T - (P.x + P.w / 2), dy = mp[1] * T - (P.y + P.h / 2), l = Math.hypot(dx, dy) || 1, k = Math.min(110, l) * (.6 + .4 * Math.sin(S.idle * 2.2));
    tx = P.x + P.w / 2 + dx / l * k; ty = P.y + 4 + dy / l * k;
    if (Math.random() < dt * 6) part(GN.x, GN.y, dx / l * 60, dy / l * 60, .8, 4, 'c', 0); }
  GN.vx += ((tx - GN.x) * 30 - GN.vx * 7) * dt; GN.vy += ((ty - GN.y) * 30 - GN.vy * 7) * dt;
  GN.x += GN.vx * dt; GN.y += GN.vy * dt; GN.flare = Math.max(0, GN.flare - dt * 1.5);
  if (Math.random() < dt * (10 + Math.hypot(GN.vx, GN.vy) * .05)) part(GN.x, GN.y, (Math.random() - .5) * 20 - GN.vx * .1, 10 + Math.random() * 20 - GN.vy * .1, .7, 4, 'c', 0);
  // gnister fra feller
  for (const [x, y] of hazListe) { if (!synlig(x * T, y * T, T)) continue;
    if (Math.random() < dt * 2.5) part(x * T + Math.random() * T, y * T + T - 8, (Math.random() - .5) * 120, -100 - Math.random() * 160, .4 + Math.random() * .3, 3 + Math.random() * 3, Math.random() < .5 ? 'o' : 'c', 600); }
}
function oppdaterKamera(dt, snap) {
  // zoom ut i trafohallen så hele kampen får plass
  const iHall = B.aktiv || (erHall(Math.floor((P.x + P.w / 2) / T), Math.floor((P.y + P.h / 2) / T)) && P.x / T > 74);
  const zMaal = iHall ? Math.min(1, cssW / ((erTouch && cssH > cssW ? 23 : 29) * T * grunnSkala), cssH / ((erTouch ? 19.5 : 15) * T * grunnSkala)) : 1;
  cam.zoom = snap ? zMaal : cam.zoom + (zMaal - cam.zoom) * Math.min(1, dt * 2.5);
  skala = grunnSkala * cam.zoom;
  const vw = cssW / skala, vh = cssH / skala;
  const fy = erTouch ? .48 : .55;
  cam.look += (clamp(P.vx / RUN, -1, 1) * vw * .1 + P.face * vw * .04 - cam.look) * Math.min(1, dt * 1.6);
  // vertikalt: følg når montøren står, er langt unna, eller faller fort
  if (P.onGround || snap || Math.abs(P.y - cam.anker) > 3 * T || P.vy > 450) cam.anker += (P.y - cam.anker) * (snap ? 1 : Math.min(1, dt * (P.onGround ? 8 : 4)));
  let tx = P.x + P.w / 2 - vw / 2 + cam.look, ty = cam.anker + P.h / 2 - vh * fy + (P.fallT > .35 ? Math.min(90, (P.fallT - .35) * 200) : 0);
  if (B.aktiv && B.fase === 'intro') { tx = 87.5 * T - vw / 2; ty = 12 * T - vh / 2; }
  else if (B.aktiv) { tx = lerp(tx, 87.5 * T - vw / 2, .65); ty = erTouch ? 19 * T - .72 * vh : Math.min(12.3 * T - vh / 2, 5.6 * T); }
  tx = clamp(tx, 0, MW * T - vw); ty = vh >= MH * T ? (MH * T - vh) / 2 : clamp(ty, 0, MH * T - vh);
  if (snap) { cam.x = tx; cam.y = ty; return; }
  cam.x += (tx - cam.x) * (1 - Math.exp(-dt * 6)); cam.y += (ty - cam.y) * (1 - Math.exp(-dt * 5));
}
