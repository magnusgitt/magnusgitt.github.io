'use strict';
// Gnist – HUD, paneler, lagring, løkke, input og oppstart.
// ---------- HUD og paneler ----------
let hintTid = 0, toastTid = 0, maalTid = 0, bannerTid = 0;
function hint(key, tekst, varighet) { if (key && S.hintSett.has(key)) return; if (key) S.hintSett.add(key); const h = $('#hint'); h.textContent = tekst; h.classList.toggle('lav', B.aktiv || B2.aktiv || $('#banner').classList.contains('vis')); h.classList.add('vis'); hintTid = varighet || 4.5; }
function banner(stor, liten, tid) { $('#bannerStor').textContent = stor; $('#bannerLiten').textContent = liten || ''; $('#banner').classList.add('vis'); $('#hint').classList.add('lav'); bannerTid = tid || 3; }
function toast(tekst) { const t = $('#toast'); t.textContent = tekst; t.classList.add('vis'); toastTid = 2.4; }
function pop(sel) { const e = $(sel); if (!e) return; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); setTimeout(() => e.classList.remove('pop'), 250); }
function hud() {
  $('#liv').innerHTML = Array.from({ length: P.max }, (_, i) => `<i class="${i < P.hp ? '' : 'tom'}"></i>`).join('');
  $('#orbtall').textContent = '✦ ' + S.orbTatt.size + ' / ' + ORBER.length;
  const e = []; if (S.ev.dobbel) e.push(['dobbel', 'Stigesko']); if (S.ev.hansker) e.push(['hansker', 'Isolerte hansker']); if (S.ev.stot) e.push(['stot', 'Strømstøt']); if (S.ev.krok) e.push(['krok', 'Kabeltrommel']);
  $('#evner').innerHTML = e.map(([id, n]) => `<div class="ev" id="ev-${id}" title="${n}">${IKON[id]}</div>`).join('');
  sistKlar = null;
  $('#tStot').classList.toggle('skjult', !S.ev.stot);
  $('#tKrok').classList.toggle('skjult', !S.ev.krok);
  const b2 = B2.aktiv && B2.fase !== 'intro';
  $('#boss').classList.toggle('vis', (B.aktiv && B.fase === 'kamp') || b2);
  $('#bossNavn').textContent = b2 ? 'Kortslutningen' : 'Overspenningen'; $('#boss').classList.toggle('b2', b2);
  [...$('#bossSik').children].forEach((el, i) => el.classList.toggle('av', i >= (b2 ? B2.hp : B.hp)));
}
let sistKlar = null;
function hudEvneTilstand() {
  const klar = S.ev.stot && P.canDash && P.dashCd <= 0;
  if (klar === sistKlar) return; sistKlar = klar;
  const ev = $('#ev-stot'); if (ev) { ev.classList.toggle('klar', klar); ev.classList.toggle('brukt', !klar); }
  $('#tStot').classList.toggle('brukt', !klar);
}
let sistKrokKlar = null;
function hudKrok() { const k = !!(S.krokMaal || P.krok); if (k === sistKrokKlar) return; sistKrokKlar = k; $('#tKrok').classList.toggle('klar', k); }
function maalTekst() {
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (!S.ev.dobbel) return inne(tx, ty) ? 'Utforsk kjelleren' : 'Finn en vei forbi den høye veggen';
  if (!S.ev.hansker) return 'Klatre helt opp stillaset';
  if (!S.bossDone) return B.aktiv ? 'Slå av de tre sikringene' : 'Gå gjennom sperren til trafohallen';
  if (!S.ev.stot) return 'Hent Strømstøtet i trafohallen';
  if (!S.ferdig) return 'Kom deg over sjakten til hovedtavla';
  if (!S.ev.krok) return iKjeller2(tx, ty) ? 'Finn noe som kan få deg over kanalen' : 'Hopp ned gjennom luka ved hovedtavla';
  if (!S.boss2) return B2.aktiv ? 'Vent til Kortslutningen er utmattet, og slå til' : 'Sving deg over kanalen til koblingsrommet';
  if (!S.ev.liv2) return 'Ta livsgnisten i koblingsrommet';
  return 'Klatre opp stigesjakten';
}
function maalPunkt() {
  if (!S.ev.dobbel) return [44.5, 31.5];
  if (!S.ev.hansker) return [61.5, 2.5];
  if (!S.bossDone) return B.aktiv ? null : [73.5, 16];
  if (!S.ev.stot) return [87.5, 18.5];
  if (!S.ferdig) return [124, 17.5];
  const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
  if (!S.ev.krok) return iKjeller2(tx, ty) ? [74.5, 55.5] : [126.5, 19];
  if (!S.boss2) return B2.aktiv ? null : [150, 54];
  if (!S.ev.liv2) return [153.5, 55.5];
  return [168.5, 31];
}
function sjekkMaal(tving) { const m = maalTekst(); if (m !== S.maal || tving) { S.maal = m; $('#maal').innerHTML = '<b>Mål:</b> ' + m; $('#maal').classList.add('vis'); maalTid = 5; } }
function visLag(id) { ['#lagMeny', '#lagEvne', '#lagPause', '#lagSlutt', '#lagSnu'].forEach(s => $(s).classList.toggle('vis', s === id)); S.panelT = performance.now();
  $('#hud').classList.toggle('vis', id === null || id === '#lagPause' || id === '#lagEvne'); $('#touch').classList.toggle('vis', id === null);
  if (id && id !== '#lagEvne') { const k = $(id + ' .knapp'); if (k) setTimeout(() => k.focus({ preventScroll: true }), 50); } }
function primar() { if (performance.now() - S.panelT < 350) return; const l = document.querySelector('.lag.vis'); if (!l) return;
  if (l.id === 'lagEvne') { lukkEvne(); return; }
  const f = document.activeElement && l.contains(document.activeElement) && document.activeElement.classList.contains('knapp') ? document.activeElement : [...l.querySelectorAll('.knapp')].find(b => b.offsetParent);
  if (f) f.click(); }

// ---------- lagring ----------
// Formatet er bakoverkompatibelt: felt som mangler i gamle lagringer får standardverdi.
function lagre() { try { localStorage.setItem(NOKKEL, JSON.stringify({ v: LAGRE_VERSJON, ev: S.ev, cp: S.cp, cpLit: [...S.cpLit], orb: [...S.orbTatt],
  boss: S.bossDone, boss2: S.boss2, tid: Math.round(S.tid), ferdig: S.ferdig, dod: S.dodsfall })); } catch (e) {} }
function hentLagret() {
  try { const d = JSON.parse(localStorage.getItem(NOKKEL) || 'null'); if (!d || typeof d !== 'object' || !d.ev || typeof d.ev !== 'object') return null;
    const ev = {}; for (const k of EVNER) ev[k] = d.ev[k] === true;
    const heltall = (a, max) => Array.isArray(a) ? a.filter(n => Number.isInteger(n) && n >= 0 && n < max) : [];
    return { ev, cp: Number.isInteger(d.cp) && d.cp >= 0 && d.cp < SJEKK.length ? d.cp : 0, cpLit: heltall(d.cpLit, SJEKK.length), orb: heltall(d.orb, ORBER.length),
      boss: d.boss === true, boss2: d.boss2 === true, tid: typeof d.tid === 'number' && d.tid > 0 ? d.tid : 0, ferdig: d.ferdig === true, dod: Number.isInteger(d.dod) ? d.dod : 0 };
  } catch (e) { return null; }
}

// ---------- løkke ----------
let sist = performance.now();
function loop(n) {
  const rdt = Math.min(.05, Math.max(0, (n - sist) / 1000)); sist = n;
  if (S.mode !== 'pause') {
    // sakte film ved viktige øyeblikk
    const dt = rdt * (S.slow > 0 ? .3 : 1); S.slow = Math.max(0, S.slow - rdt);
    S.t += dt;
    if (S.evneVent > 0) { S.evneVent -= rdt; if (S.evneVent <= 0 && S.mode === 'spill') { S.mode = 'evne'; visLag('#lagEvne'); } }
    if (S.mode === 'spill' && S.evneVent <= 0) { S.tid += dt; if (S.laas > 0) S.laas -= dt;
      velgKrok(); const steg = Math.ceil(dt / (1 / 120)), h = dt / steg; for (let i = 0; i < steg; i++) oppdaterSpiller(h);
      oppdaterVerden(dt); oppdaterProsj(dt); hudEvneTilstand(); hudKrok(); }
    else if (S.mode === 'slutt' || S.mode === 'meny') { KRAN.t += dt; KRAN.x = KRAN.x0 + (.5 - .5 * Math.cos(KRAN.t * .55)) * (KRAN.x1 - KRAN.x0); }
    oppdaterPartikler(dt); oppdaterKamera(rdt);
    S.shake = Math.max(0, S.shake - rdt); S.flash = Math.max(0, S.flash - rdt * 1.4);
    if (S.hallFlimmer > 0) S.hallFlimmer -= rdt;
    if (S.bossDone && S.hallLys < 1) S.hallLys = Math.min(1, S.hallLys + rdt * .5);
    const ptx = Math.floor((P.x + P.w / 2) / T), pty = Math.floor((P.y + P.h / 2) / T);
    let mal = iKjeller2(ptx, pty) ? .62 : inne(ptx, pty) ? .58 : .5; if (erHall(ptx, pty)) mal = lerp(.7, .4, S.hallLys) + (S.hallFlimmer > 0 && Math.sin(S.t * 50) > 0 ? .15 : 0);
    S.mork += (mal - S.mork) * Math.min(1, rdt * 2);
    if (hintTid > 0) { hintTid -= rdt; if (hintTid <= 0) $('#hint').classList.remove('vis'); }
    if (bannerTid > 0) { bannerTid -= rdt; if (bannerTid <= 0) $('#banner').classList.remove('vis'); }
    if (toastTid > 0) { toastTid -= rdt; if (toastTid <= 0) $('#toast').classList.remove('vis'); }
    if (maalTid > 0) { maalTid -= rdt; if (maalTid <= 0) $('#maal').classList.remove('vis'); }
    oppdaterSurr();
  }
  tegn();
  requestAnimationFrame(loop);
}
// elektrisk surr blir sterkere nær feller, sperrer og bossen
function oppdaterSurr() {
  if (!A.surr || !A.c) return;
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2; let d = 1e9;
  for (const [x, y] of hazListe) d = Math.min(d, Math.hypot(x * T + T / 2 - pcx, y * T + T - pcy));
  if (tile(73, 13) === CUR) d = Math.min(d, Math.hypot(73.5 * T - pcx, 16 * T - pcy));
  if (lysbueFase() === 2) d = Math.min(d, Math.hypot((LYSBUE.x + .5) * T - pcx, 29.5 * T - pcy) * .7);
  for (const [x, y] of vannListe) if (tile(x, y) === VANN && Math.abs(x * T - pcx) < 300) d = Math.min(d, Math.hypot(x * T + T / 2 - pcx, y * T + 8 - pcy) * 1.4);
  let v = clamp(1 - d / 260, 0, 1) * .05; if (B.aktiv || B2.aktiv) v = Math.max(v, B2.golv === 2 ? .06 : .03);
  if (S.mode !== 'spill') v = 0;
  try { A.surr.gain.setTargetAtTime(v, A.c.currentTime, .15); } catch (e) {}
}
function visSlutt() {
  const m = Math.floor(S.tid / 60), s = Math.floor(S.tid % 60);
  $('#sluttStat').innerHTML = `<div><b>${m}:${String(s).padStart(2, '0')}</b>Tid</div><div><b>${S.orbTatt.size}/${ORBER.length}</b>Lysorber</div><div><b>${S.ev.hemmelig ? 1 : 0}/1</b>Hemmelig rom</div><div><b>${S.dodsfall}</b>Ganger slått ut</div>`;
  visLag('#lagSlutt');
}

// ---------- input ----------
let erTouch = matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
document.documentElement.classList.toggle('touch', erTouch);
const HOPP = ['ArrowUp', 'KeyW', 'Space', 'KeyZ', 'KeyK'], STOT = ['ShiftLeft', 'ShiftRight', 'KeyX', 'KeyJ', 'KeyL'], KROK = ['KeyC', 'KeyE'];
function oppdaterTaster() {
  I.left = !!(K.ArrowLeft || K.KeyA || TS.left); I.right = !!(K.ArrowRight || K.KeyD || TS.right); I.down = !!(K.ArrowDown || K.KeyS);
  I.jumpHeld = HOPP.some(k => K[k]) || TS.jump;
  I.krokHeld = KROK.some(k => K[k]) || TS.krok;
}
addEventListener('keydown', e => {
  const c = e.code;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(c)) e.preventDefault();
  lydInit();
  if (c === 'Escape' || c === 'KeyP') { if (!e.repeat) { if (S.mode === 'evne') lukkEvne(); else pauseBytt(); } return; }
  if (c === 'KeyM' && !e.repeat) { settLyd(!lydPa); return; }
  if (S.mode !== 'spill') { if ((c === 'Enter' || c === 'Space' || (S.mode === 'evne' && (HOPP.includes(c) || STOT.includes(c)))) && !e.repeat) { e.preventDefault(); primar(); } return; }
  if (e.repeat) return;
  K[c] = true; oppdaterTaster();
  if (HOPP.includes(c)) I.jumpP = true;
  if (STOT.includes(c)) I.dashP = true;
});
addEventListener('keyup', e => { K[e.code] = false; oppdaterTaster(); });
addEventListener('blur', () => { nullInput(); if (S.mode === 'spill') pauseBytt(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'spill') pauseBytt(); });
addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !erTouch) { erTouch = true; document.documentElement.classList.add('touch'); resize(); } }, { capture: true });
document.addEventListener('touchmove', e => { if (S.mode === 'spill' || S.mode === 'evne') e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
const pad = $('#pad'); let padId = null;
function padSett(e) { const r = pad.getBoundingClientRect(), v = e.clientX - r.left < r.width / 2; TS.left = v; TS.right = !v; pad.dataset.dir = v ? 'v' : 'h'; oppdaterTaster(); }
pad.addEventListener('pointerdown', e => { e.preventDefault(); padId = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch (x) {} lydInit(); padSett(e); });
pad.addEventListener('pointermove', e => { if (e.pointerId === padId) padSett(e); });
const slippPad = e => { if (e.pointerId !== padId) return; padId = null; TS.left = TS.right = false; pad.dataset.dir = ''; oppdaterTaster(); };
pad.addEventListener('pointerup', slippPad); pad.addEventListener('pointercancel', slippPad); pad.addEventListener('lostpointercapture', slippPad);
function trykkKnapp(el, ned, opp) {
  el.addEventListener('pointerdown', e => { e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (x) {} el.classList.add('trykk'); lydInit(); ned(); });
  const slipp = () => { el.classList.remove('trykk'); opp(); };
  el.addEventListener('pointerup', slipp); el.addEventListener('pointercancel', slipp); el.addEventListener('lostpointercapture', slipp);
}
trykkKnapp($('#tHopp'), () => { if (S.mode === 'evne') { primar(); return; } TS.jump = true; I.jumpP = true; oppdaterTaster(); }, () => { TS.jump = false; oppdaterTaster(); });
trykkKnapp($('#tStot'), () => { I.dashP = true; }, () => {});
trykkKnapp($('#tKrok'), () => { TS.krok = true; oppdaterTaster(); }, () => { TS.krok = false; oppdaterTaster(); });
addEventListener('contextmenu', e => e.preventDefault());

let bekreftOmstart = 0;
function pauseBytt() {
  if (S.mode === 'spill') { S.mode = 'pause'; nullInput(); $('#pauseMaal').innerHTML = '<b>Mål:</b> ' + maalTekst(); bekreftOmstart = 0; $('#bOmstart').textContent = 'Start helt på nytt'; visLag('#lagPause'); }
  else if (S.mode === 'pause') { S.mode = 'spill'; sist = performance.now(); visLag(null); }
}
$('#menyKnapp').addEventListener('click', pauseBytt);
$('#lydKnapp').addEventListener('click', () => settLyd(!lydPa));
$('#bPauseFortsett').addEventListener('click', pauseBytt);
$('#bLyd').addEventListener('click', () => settLyd(!lydPa));
$('#bSjekk').addEventListener('click', () => { S.mode = 'spill'; sist = performance.now(); visLag(null); respawn(); });
$('#bOmstart').addEventListener('click', () => {
  if (performance.now() - bekreftOmstart > 3000) { bekreftOmstart = performance.now(); $('#bOmstart').textContent = 'Trykk igjen for å slette fremgangen'; return; }
  try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null);
});
$('#lagEvne').addEventListener('pointerdown', e => { e.preventDefault(); primar(); });
$('#bSnuOk').addEventListener('click', lukkSnu);
$('#bVib').addEventListener('click', () => { INNST.vib = !INNST.vib; lagreInnst(); vib(30); });
$('#bRist').addEventListener('click', () => { INNST.rist = !INNST.rist; lagreInnst(); });
settLyd(lydPa); visInnst();
let snuVist = false;
function lukkSnu() { if (S.mode !== 'snu') return; S.mode = 'spill'; sist = performance.now(); visLag(null); }
function start(lagret) { lydInit(); nyttSpill(lagret); S.mode = 'spill'; sist = performance.now(); visLag(null); setTimeout(() => sjekkMaal(true), 1500);
  if (erTouch && cssH > cssW && !snuVist) { snuVist = true; S.mode = 'snu'; visLag('#lagSnu'); }
  if (!lagret) { banner('Gnist', 'Byggeplassen'); S.hintSett.add('omr-Byggeplassen'); setTimeout(() => hint(null, erTouch ? 'Gå med venstre tommel. Hopp med høyre. Hold inne for høyere hopp.' : 'Gå med piltastene. Hopp med mellomrom. Hold inne for høyere hopp.', 5), 2600); }
  else S.hintSett.add('omr-' + omraade(Math.floor((P.x + P.w / 2) / T), Math.floor((P.y + P.h / 2) / T))); }
$('#bNy').addEventListener('click', () => {
  if (hentLagret() && $('#bNy').dataset.bekreft !== '1') { $('#bNy').dataset.bekreft = '1'; $('#bNy').textContent = 'Trykk igjen: slett fremgangen og start på nytt'; return; }
  try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null); });
$('#bFortsett').addEventListener('click', () => start(hentLagret()));
$('#bIgjen').addEventListener('click', () => { try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null); });
$('#bVidere').addEventListener('click', () => { S.mode = 'spill'; sist = performance.now(); visLag(null); sjekkMaal(true); });

// ---------- oppstart ----------
lagBakgrunn();
byggKart();
for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const t = tile(x, y); if (t === HAZ) hazListe.push([x, y]); else if (t === VANN || t === BVANN) vannListe.push([x, y]); }
if (hentLagret()) { $('#bFortsett').style.display = ''; $('#bNy').textContent = 'Nytt spill'; $('#bNy').classList.add('sek'); }
nyttSpill(null);
resize(); addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 150));
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
visLag('#lagMeny');
requestAnimationFrame(loop);
window.__gnist = { S, P, B, B2, tile, rect, faaEvne, FUNN, respawn, SJEKK, fiender, lagre, hentLagret, KRAN, I, KROKER, ORBER, TS, bolter, sveip, prosj, nyttSpill };
