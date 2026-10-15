'use strict';
// Gnist – HUD, paneler, lagring, løkke, input og oppstart.
// ---------- HUD og paneler ----------
let hintTid = 0, toastTid = 0, maalTid = 0, bannerTid = 0;
function hint(key, tekst, varighet) { if (key && S.hintSett.has(key)) return; if (key) S.hintSett.add(key); const h = $('#hint'); h.textContent = tekst; h.classList.toggle('lav', B.aktiv || B2.aktiv || B3.aktiv || B4.aktiv || $('#banner').classList.contains('vis')); h.classList.add('vis'); hintTid = varighet || 4.5; }
function banner(stor, liten, tid) { $('#bannerStor').textContent = stor; $('#bannerLiten').textContent = liten || ''; $('#banner').classList.add('vis'); $('#hint').classList.add('lav'); bannerTid = tid || 3; }
function toast(tekst) { const t = $('#toast'); t.textContent = tekst; t.classList.add('vis'); toastTid = 2.4; }
function pop(sel) { const e = $(sel); if (!e) return; e.classList.remove('pop'); void e.offsetWidth; e.classList.add('pop'); setTimeout(() => e.classList.remove('pop'), 250); }
function hud() {
  $('#liv').innerHTML = Array.from({ length: P.max }, (_, i) => `<i class="${i < P.hp ? '' : 'tom'}"></i>`).join('');
  $('#orbtall').textContent = '✦ ' + S.orbTatt.size + ' / ' + ORBER.length;
  const e = []; if (S.ev.dobbel) e.push(['dobbel', 'Stigesko']); if (S.ev.hansker) e.push(['hansker', 'Isolerte hansker']); if (S.ev.stot) e.push(['stot', 'Strømstøt']); if (S.ev.krok) e.push(['krok', 'Kabeltrommel']); if (S.ev.tester) e.push(['tester', 'Spenningstester']); if (S.ev.sliper) e.push(['sliper', 'Vinkelsliper']); if (S.ev.klatre) e.push(['klatre', 'Klatrejern']);
  $('#evner').innerHTML = e.map(([id, n]) => `<div class="ev" id="ev-${id}" title="${n}">${IKON[id]}</div>`).join('');
  sistKlar = null;
  $('#tStot').classList.toggle('skjult', !S.ev.stot);
  $('#tKrok').classList.toggle('skjult', !S.ev.krok);
  $('#bFag').textContent = `Fagkort: ${S.fag.size} av ${FAG.length}`;
  const b2 = B2.aktiv && B2.fase !== 'intro', b3 = B3.aktiv && B3.fase !== 'intro', b4 = B4.aktiv && B4.fase !== 'intro';
  $('#boss').classList.toggle('vis', (B.aktiv && B.fase === 'kamp') || b2 || b3 || b4);
  $('#bossNavn').textContent = b4 ? 'Generatoren' : b3 ? 'Trafokjempen' : b2 ? 'Kortslutningen' : 'Overspenningen'; $('#boss').classList.toggle('b2', b2 || b4); $('#boss').classList.toggle('b3', b3);
  const n = b4 ? 4 : b3 ? 6 : 3, hp = b4 ? B4.hp : b3 ? B3.hp : b2 ? B2.hp : B.hp;
  if ($('#bossSik').children.length !== n) $('#bossSik').innerHTML = '<i></i>'.repeat(n);
  [...$('#bossSik').children].forEach((el, i) => el.classList.toggle('av', i >= hp));
  $('#tidtaker').classList.toggle('vis', S.tidsmodus);
}
let sistKlar = null;
function hudEvneTilstand() {
  const klar = S.ev.stot && P.canDash && P.dashCd <= 0;
  if (klar === sistKlar) return; sistKlar = klar;
  const ev = $('#ev-stot'); if (ev) { ev.classList.toggle('klar', klar); ev.classList.toggle('brukt', !klar); }
  $('#tStot').classList.toggle('brukt', !klar);
}
let sistVerk = null;
function hudVerk() { const v = S.mode === 'spill' && S.verkNaer >= 0; if (v === sistVerk) return; sistVerk = v; $('#verkKnapp').classList.toggle('skjult', !v);
  if (v && !S.hintSett.has('verk')) hint('verk', erTouch ? 'Et verksted! Trykk på knappen for å bruke lysorbene.' : 'Et verksted! Trykk ↓ eller knappen for å bruke lysorbene.', 4); }
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
  if (!S.ev.tester) return ty <= 27 && tx >= 132 ? 'Finn et måleinstrument i trafostasjonen' : 'Klatre opp stigesjakten';
  if (!S.ev.sliper) return 'Klatre opp transformatortårnet';
  if (!S.boss3) return B3.aktiv ? 'Slå ut Trafokjempen' : 'Skjær deg gjennom muren til stasjonsgården';
  if (!S.boss4) { if (B4.aktiv) return 'Støt inn i kullbørsten som lyser';
    if (!iKraft(tx, ty)) return 'Noe brummer under kjelleren. Finn luka i gulvet';
    if (!S.ev.klatre) return 'Finn en vei opp den høye pipa';
    return 'Følg fallrøret ned til turbinhallen'; }
  if (!S.ev.liv5) return 'Ta livsgnisten i turbinhallen';
  return 'Finn alle lysorber, fagkort og gjemmesteder';
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
  if (!S.ev.tester) return ty <= 27 && tx >= 132 ? [178.5, 26.5] : [168.5, 28];
  if (!S.ev.sliper) return [193.5, 6.5];
  if (!S.boss3) return B3.aktiv ? null : [161, 23];
  if (!S.boss4) { if (B4.aktiv) return null; const tx = Math.floor((P.x + P.w / 2) / T), ty = Math.floor((P.y + P.h / 2) / T);
    if (!iKraft(tx, ty)) return [43, 32]; if (!S.ev.klatre) return [5.5, 44.5]; return [36.5, 58]; }
  if (!S.ev.liv5) return [36.5, 60.5];
  return null;
}
function sjekkMaal(tving) { const m = maalTekst(); if (m !== S.maal || tving) { S.maal = m; $('#maal').innerHTML = '<b>Mål:</b> ' + m; $('#maal').classList.add('vis'); maalTid = 5; } }
function visLag(id) { ['#lagMeny', '#lagEvne', '#lagPause', '#lagSlutt', '#lagSnu', '#lagKart', '#lagVerk', '#lagFag', '#lagRull'].forEach(s => $(s).classList.toggle('vis', s === id)); S.panelT = performance.now();
  if (id) { $('#verkKnapp').classList.add('skjult'); sistVerk = false; }
  $('#hud').classList.toggle('vis', id === null || id === '#lagPause' || id === '#lagEvne'); $('#touch').classList.toggle('vis', id === null);
  if (id && id !== '#lagEvne') { const k = $(id + ' .knapp'); if (k) setTimeout(() => k.focus({ preventScroll: true }), 50); } }
function primar() { if (performance.now() - S.panelT < 350) return; const l = document.querySelector('.lag.vis'); if (!l) return;
  if (l.id === 'lagEvne') { lukkEvne(); return; }
  const f = document.activeElement && l.contains(document.activeElement) && document.activeElement.classList.contains('knapp') ? document.activeElement : [...l.querySelectorAll('.knapp')].find(b => b.offsetParent);
  if (f) f.click(); }

// ---------- lagring ----------
// Formatet er bakoverkompatibelt: felt som mangler i gamle lagringer får standardverdi.
// besøkte kartruter lagres som en kort heksadesimal streng (4 ruter per tegn)
function settTilHex(a) { let h = ''; for (let i = 0; i < a.length; i += 4) h += ((a[i] | 0) | (a[i + 1] | 0) << 1 | (a[i + 2] | 0) << 2 | (a[i + 3] | 0) << 3).toString(16); return h; }
function hexTilSett(h) { const a = new Uint8Array(KW * KH); if (typeof h !== 'string') return a;
  for (let j = 0; j < h.length && j * 4 < a.length; j++) { const n = parseInt(h[j], 16) || 0; for (let b = 0; b < 4; b++) if (j * 4 + b < a.length) a[j * 4 + b] = (n >> b) & 1; } return a; }
function lagre() { if (S.tidsmodus) return; try { localStorage.setItem(NOKKEL, JSON.stringify({ v: LAGRE_VERSJON, ev: S.ev, cp: S.cp, cpLit: [...S.cpLit], orb: [...S.orbTatt],
  fag: [...S.fag], sett: settTilHex(S.sett), brukt: S.brukt, kjop: S.kjop, knust: [...S.knust], boss3: S.boss3, boss4: S.boss4, helt: S.helt,
  boss: S.bossDone, boss2: S.boss2, tid: Math.round(S.tid), ferdig: S.ferdig, dod: S.dodsfall })); } catch (e) {} }
function hentLagret() {
  try { const d = JSON.parse(localStorage.getItem(NOKKEL) || 'null'); if (!d || typeof d !== 'object' || !d.ev || typeof d.ev !== 'object') return null;
    const ev = {}; for (const k of EVNER) ev[k] = d.ev[k] === true;
    const heltall = (a, max) => Array.isArray(a) ? a.filter(n => Number.isInteger(n) && n >= 0 && n < max) : [];
    return { ev, cp: Number.isInteger(d.cp) && d.cp >= 0 && d.cp < SJEKK.length ? d.cp : 0, cpLit: heltall(d.cpLit, SJEKK.length), orb: heltall(d.orb, ORBER.length),
      fag: heltall(d.fag, FAG.length), sett: hexTilSett(d.sett), brukt: Number.isInteger(d.brukt) && d.brukt >= 0 ? d.brukt : 0,
      kjop: Object.fromEntries(OPPGRADERINGER.map(o => [o.id, !!(d.kjop && d.kjop[o.id] === true)])),
      knust: heltall(d.knust, SVAKE.length), boss3: d.boss3 === true, boss4: d.boss4 === true, helt: d.helt === true,
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
    hudVerk(); oppdaterMusikk();
    if (S.tidsmodus && S.mode === 'spill') { const m = Math.floor(S.tid / 60), sk = S.tid % 60; $('#tidtaker').textContent = `${m}:${sk < 10 ? '0' : ''}${sk.toFixed(1)}`; }
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
  let v = clamp(1 - d / 260, 0, 1) * .05; if (B.aktiv || B2.aktiv || B3.aktiv) v = Math.max(v, B2.golv === 2 || B3.golv === 2 ? .06 : .03);
  if (S.mode !== 'spill') v = 0;
  try { A.surr.gain.setTargetAtTime(v, A.c.currentTime, .15); } catch (e) {}
}
function visSlutt() {
  const m = Math.floor(S.tid / 60), s = Math.floor(S.tid % 60);
  $('#sluttStat').innerHTML = `<div><b>${m}:${String(s).padStart(2, '0')}</b>Tid</div><div><b>${S.orbTatt.size}/${ORBER.length}</b>Lysorber</div><div><b>${S.ev.hemmelig ? 1 : 0}/1</b>Hemmelig rom</div><div><b>${S.dodsfall}</b>Ganger slått ut</div>`;
  visLag('#lagSlutt');
}

const tidTekst = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
function hentRekord() { try { const r = parseFloat(localStorage.getItem(NOKKEL + '-rekord')); return r > 0 ? r : 0; } catch (e) { return 0; } }
function visRulle() {
  const rek = hentRekord();
  $('#rulleStat').innerHTML = `<div><b>${tidTekst(S.tid)}</b>Tid</div><div><b>${S.orbTatt.size}/${ORBER.length}</b>Lysorber</div><div><b>${S.fag.size}/${FAG.length}</b>Fagkort</div><div><b>${S.dodsfall}</b>Ganger slått ut</div>`;
  $('#rulleRekord').textContent = S.tidsmodus ? (S.nyRekord ? 'Ny rekord i tidsmodus!' : `Rekord i tidsmodus: ${tidTekst(rek)}`) : rek ? `Rekord i tidsmodus: ${tidTekst(rek)}` : 'Tidsmodus er låst opp: spill hele eventyret på tid.';
  $('#bRulleVidere').style.display = S.tidsmodus ? 'none' : '';
  visLag('#lagRull'); const r = $('#rulle'); r.classList.remove('kjor'); void r.offsetWidth; r.classList.add('kjor');
}
function startTidsmodus() { lydInit(); S.tidsmodus = true; nyttSpill(null); S.mode = 'spill'; sist = performance.now(); visLag(null); hud();
  banner('Tidsmodus', 'Klokka går!', 2.2); S.hintSett.add('omr-Byggeplassen'); setTimeout(() => sjekkMaal(true), 1500); }

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
  if (c === 'Escape' || c === 'KeyP') { if (!e.repeat) { if (S.mode === 'tilpass') sluttTilpass(); else if (S.mode === 'evne') lukkEvne(); else if (S.mode === 'kart' || S.mode === 'verk') lukkPanel();
    else if ($('#lagFag').classList.contains('vis')) visLag('#lagPause'); else pauseBytt(); } return; }
  if (c === 'KeyM' && !e.repeat) { settLyd(!lydPa); return; }
  if ((c === 'Tab' || c === 'KeyQ')) { e.preventDefault(); if (!e.repeat) { if (S.mode === 'kart') lukkPanel(); else if (S.mode === 'spill') visKart(); } return; }
  if (S.mode === 'kart' || S.mode === 'verk') { if ((c === 'Escape' || c === 'KeyP') && !e.repeat) lukkPanel(); else if ((c === 'Enter' || c === 'Space') && !e.repeat) { e.preventDefault(); primar(); } return; }
  if (S.mode !== 'spill') { if ((c === 'Enter' || c === 'Space' || (S.mode === 'evne' && (HOPP.includes(c) || STOT.includes(c)))) && !e.repeat) { e.preventDefault(); primar(); } return; }
  if (e.repeat) return;
  K[c] = true; oppdaterTaster();
  if (HOPP.includes(c)) I.jumpP = true;
  if ((c === 'ArrowDown' || c === 'KeyS') && S.verkNaer >= 0 && P.onGround) visVerk();
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

// ---------- kart, verksted og fagkort ----------
let kartBilde = null, kartUtsnitt = null;
function lagKartBilde() { const c = nyC(MW, MH), g = c.getContext('2d'), id = g.createImageData(MW, MH);
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const t = tile(x, y), i = (y * MW + x) * 4;
    let f = erSol(x, y) ? [24, 32, 46] : t === ONE ? [150, 112, 70] : t === HAZ ? [240, 190, 60] : t === VANN ? [70, 180, 230] : t === DOOR ? [220, 110, 60] : inne(x, y) ? [52, 66, 86] : [44, 66, 104];
    if (erSol(x, y) && dypAt(x, y) <= 1) f = [70, 84, 110];
    id.data[i] = f[0]; id.data[i + 1] = f[1]; id.data[i + 2] = f[2]; id.data[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c; }
function visKart() { if (S.mode !== 'spill') return; S.mode = 'kart'; nullInput(); kartBilde = lagKartBilde(); visLag('#lagKart'); tegnKart();
  $('#kartTekst').textContent = (B.aktiv || B2.aktiv) ? 'Du kan ikke reise mens en boss er våken.' : 'Trykk på en tent lampe for å reise dit.'; }
function tegnKart() {
  const kc = $('#kartC'), w = kc.clientWidth || 600;
  // vis bare området rundt det som er utforsket
  let x0 = KW, x1 = 0, y0 = KH, y1 = 0; for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) if (S.sett[y * KW + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  if (x0 > x1) { x0 = 0; x1 = KW - 1; y0 = 0; y1 = KH - 1; }
  const tx0 = Math.max(0, x0 * KC - 4), ty0 = Math.max(0, y0 * KC - 4), tx1 = Math.min(MW, (x1 + 1) * KC + 4), ty1 = Math.min(MH, (y1 + 1) * KC + 4);
  const maksH = Math.max(110, Math.min(innerHeight * .6, innerHeight - 200)), sk = Math.min(w / (tx1 - tx0), maksH / (ty1 - ty0));
  const cw = Math.round((tx1 - tx0) * sk), ch = Math.round((ty1 - ty0) * sk), d = Math.min(window.devicePixelRatio || 1, 2);
  kc.width = cw * d; kc.height = ch * d; kc.style.width = cw + 'px'; kc.style.height = ch + 'px'; kc.style.margin = '8px auto 0';
  kartUtsnitt = { tx0, ty0, sk };
  const g = kc.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#060b18'; g.fillRect(0, 0, cw, ch);
  g.save(); g.beginPath(); for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) if (S.sett[y * KW + x]) g.rect((x * KC - tx0) * sk, (y * KC - ty0) * sk, KC * sk + .5, KC * sk + .5);
  g.clip(); g.drawImage(kartBilde, tx0, ty0, tx1 - tx0, ty1 - ty0, 0, 0, cw, ch); g.restore();
  const pkt = (x, y) => [(x - tx0) * sk, (y - ty0) * sk];
  SJEKK.forEach((c, i) => { if (!S.sett[Math.floor(c.y / KC) * KW + Math.floor(c.x / KC)]) return; const [px, py] = pkt(c.x + .5, c.y + .3), lit = S.cpLit.has(i);
    g.fillStyle = lit ? '#ffe9a8' : '#59627a'; g.beginPath(); g.arc(px, py, Math.max(4, sk * 1.1), 0, 7); g.fill();
    if (lit) { g.strokeStyle = 'rgba(255,233,168,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(px, py, Math.max(7, sk * 1.8), 0, 7); g.stroke(); }
    if (VERKSTED.includes(i)) { g.fillStyle = '#ffc56b'; g.font = `bold ${Math.max(10, sk * 2.2) | 0}px system-ui`; g.textAlign = 'center'; g.fillText('⚒', px, py - Math.max(8, sk * 2)); } });
  const [mx, my] = pkt((P.x + P.w / 2) / T, (P.y + P.h / 2) / T);
  g.fillStyle = '#8fe3ff'; g.shadowColor = '#8fe3ff'; g.shadowBlur = 10; g.beginPath(); g.arc(mx, my, Math.max(4, sk * 1.2), 0, 7); g.fill(); g.shadowBlur = 0;
}
$('#kartC').addEventListener('pointerdown', e => { if (S.mode !== 'kart' || !kartUtsnitt) return; e.preventDefault();
  const r = $('#kartC').getBoundingClientRect(), u = kartUtsnitt, tx = (e.clientX - r.left) / u.sk + u.tx0, ty = (e.clientY - r.top) / u.sk + u.ty0;
  let best = -1, bd = Math.max(3, 14 / u.sk); SJEKK.forEach((c, i) => { const dd = Math.hypot(c.x + .5 - tx, c.y + .3 - ty); if (dd < bd && S.cpLit.has(i)) { bd = dd; best = i; } });
  if (best >= 0) { if (reiseTil(best)) lukkPanel(); else $('#kartTekst').textContent = 'Du kan ikke reise mens en boss er våken.'; } });
function lukkPanel() { if (S.mode !== 'kart' && S.mode !== 'verk') return; S.mode = 'spill'; sist = performance.now(); nullInput(); visLag(null); sistVerk = null; }
function visVerk() { if (S.mode !== 'spill' || S.verkNaer < 0) return; S.mode = 'verk'; nullInput(); visLag('#lagVerk'); tegnVerk(); }
function tegnVerk() {
  $('#verkOrb').textContent = `✦ ${orbIgjen()} lysorber å bruke`;
  $('#verkListe').innerHTML = OPPGRADERINGER.map(o => { const har = !!S.kjop[o.id], kan = !har && orbIgjen() >= o.pris;
    return `<div class="oppg${har ? ' kjopt' : ''}"><div><b>${o.navn}</b><span>${o.tekst}</span></div><button data-id="${o.id}"${kan ? '' : ' disabled'}>${har ? 'Kjøpt' : '✦ ' + o.pris}</button></div>`; }).join('');
}
$('#verkListe').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b && kjop(b.dataset.id)) { tegnVerk(); toast('Oppgradert!'); } });
function visFag() {
  $('#fagListe').innerHTML = FAG.map((f, i) => S.fag.has(i) ? `<div class="fagKort"><b>${f.tittel}</b><span>${f.tekst}</span></div>` : `<div class="fagKort mangler">Ikke funnet ennå</div>`).join('');
  visLag('#lagFag'); }
$('#kartKnapp').addEventListener('click', () => { lydInit(); if (S.mode === 'kart') lukkPanel(); else visKart(); });
$('#bKartLukk').addEventListener('click', lukkPanel);
$('#verkKnapp').addEventListener('click', () => { lydInit(); visVerk(); });
$('#bVerkLukk').addEventListener('click', lukkPanel);
$('#bFag').addEventListener('click', visFag);
$('#bFagLukk').addEventListener('click', () => visLag('#lagPause'));
$('#bMus').addEventListener('click', () => { INNST.mus = !INNST.mus; lagreInnst(); });

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
  if (S.tidsmodus) { BG.midtLys = null; startTidsmodus(); return; }
  try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null);
});
$('#lagEvne').addEventListener('pointerdown', e => { e.preventDefault(); primar(); });
$('#bSnuOk').addEventListener('click', lukkSnu);
$('#bVib').addEventListener('click', () => { INNST.vib = !INNST.vib; lagreInnst(); vib(30); });
$('#bRist').addEventListener('click', () => { INNST.rist = !INNST.rist; lagreInnst(); });
settLyd(lydPa); visInnst();

// egne knappeplasseringer: flyttes med translate/scale, så treffområdet følger knappen
const KNAPPER = ['pad', 'tHopp', 'tStot', 'tKrok'];
function knappRetning() { return innerWidth > innerHeight ? 'ligg' : 'staa'; }
function knappOppsett() { const r = knappRetning(); return INNST.knapper[r] || (INNST.knapper[r] = {}); }
function brukKnapper() {
  const o = INNST.knapper[knappRetning()] || {};
  for (const id of KNAPPER) { const el = $('#' + id), v = o[id] || { x: 0, y: 0, s: 1 }; el.style.translate = v.x + 'px ' + v.y + 'px'; el.style.scale = v.s; }
}
function holdInne(id) {
  // knappen skal alltid være innenfor skjermen
  const el = $('#' + id), r = el.getBoundingClientRect(); if (!r.width) return;
  const v = knappOppsett()[id]; if (!v) return;
  let dx = 0, dy = 0;
  if (r.left < 4) dx = 4 - r.left; else if (r.right > innerWidth - 4) dx = innerWidth - 4 - r.right;
  if (r.top < 4) dy = 4 - r.top; else if (r.bottom > innerHeight - 4) dy = innerHeight - 4 - r.bottom;
  if (dx || dy) { v.x += dx; v.y += dy; brukKnapper(); }
}
let tilpassValgt = 'tHopp', tilpassDra = null;
function velgKnapp(id) { tilpassValgt = id; KNAPPER.forEach(k => $('#' + k).classList.toggle('valgt', k === id)); }
function startTilpass() { if (S.mode !== 'pause') return; S.mode = 'tilpass'; document.documentElement.classList.add('tilpasser'); visLag(null); velgKnapp(tilpassValgt); }
function sluttTilpass() { if (S.mode !== 'tilpass') return; tilpassDra = null; document.documentElement.classList.remove('tilpasser'); KNAPPER.forEach(k => $('#' + k).classList.remove('valgt', 'trykk'));
  lagreInnst(); S.mode = 'pause'; visLag('#lagPause'); hud(); }
function endreStr(d) { const o = knappOppsett(), v = o[tilpassValgt] || (o[tilpassValgt] = { x: 0, y: 0, s: 1 });
  v.s = Math.round(Math.min(1.6, Math.max(.6, v.s + d)) * 10) / 10; brukKnapper(); holdInne(tilpassValgt); }
$('#touch').addEventListener('pointerdown', e => {
  if (S.mode !== 'tilpass') return;
  e.stopPropagation(); e.preventDefault();
  const el = e.target.closest('#pad, .rund'); if (!el) return;
  velgKnapp(el.id); const o = knappOppsett(), v = o[el.id] || (o[el.id] = { x: 0, y: 0, s: 1 });
  tilpassDra = { id: el.id, px: e.clientX, py: e.clientY, x: v.x, y: v.y, pid: e.pointerId };
}, { capture: true });
addEventListener('pointermove', e => { if (!tilpassDra || e.pointerId !== tilpassDra.pid) return; const v = knappOppsett()[tilpassDra.id];
  v.x = Math.round(tilpassDra.x + e.clientX - tilpassDra.px); v.y = Math.round(tilpassDra.y + e.clientY - tilpassDra.py); brukKnapper(); });
addEventListener('pointerup', e => { if (!tilpassDra || e.pointerId !== tilpassDra.pid) return; holdInne(tilpassDra.id); tilpassDra = null; });
addEventListener('pointercancel', () => { tilpassDra = null; });
$('#bTilpass').addEventListener('click', startTilpass);
$('#bFerdig').addEventListener('click', sluttTilpass);
$('#bMindre').addEventListener('click', () => endreStr(-.1));
$('#bStorre').addEventListener('click', () => endreStr(.1));
$('#bTilbake').addEventListener('click', () => { delete INNST.knapper[knappRetning()]; brukKnapper(); });
addEventListener('resize', () => requestAnimationFrame(() => { brukKnapper(); if (INNST.knapper[knappRetning()]) KNAPPER.forEach(holdInne); }));
brukKnapper();
let snuVist = false;
function lukkSnu() { if (S.mode !== 'snu') return; S.mode = 'spill'; sist = performance.now(); visLag(null); }
function start(lagret) { lydInit(); S.tidsmodus = false; nyttSpill(lagret); S.mode = 'spill'; sist = performance.now(); visLag(null); setTimeout(() => sjekkMaal(true), 1500);
  if (erTouch && cssH > cssW && !snuVist) { snuVist = true; S.mode = 'snu'; visLag('#lagSnu'); }
  if (!lagret) { banner('Gnist', 'Byggeplassen'); S.hintSett.add('omr-Byggeplassen'); setTimeout(() => hint(null, erTouch ? 'Gå med venstre tommel. Hopp med høyre. Hold inne for høyere hopp.' : 'Gå med piltastene. Hopp med mellomrom. Hold inne for høyere hopp.', 5), 2600); }
  else S.hintSett.add('omr-' + omraade(Math.floor((P.x + P.w / 2) / T), Math.floor((P.y + P.h / 2) / T))); }
$('#bNy').addEventListener('click', () => {
  if (hentLagret() && $('#bNy').dataset.bekreft !== '1') { $('#bNy').dataset.bekreft = '1'; $('#bNy').textContent = 'Trykk igjen: slett fremgangen og start på nytt'; return; }
  try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null); });
$('#bFortsett').addEventListener('click', () => start(hentLagret()));
$('#bIgjen').addEventListener('click', () => { try { localStorage.removeItem(NOKKEL); } catch (e) {} BG.midtLys = null; start(null); });
$('#bTid').addEventListener('click', startTidsmodus);
$('#bRulleTid').addEventListener('click', startTidsmodus);
$('#bRulleVidere').addEventListener('click', () => { S.mode = 'spill'; sist = performance.now(); visLag(null); sjekkMaal(true); });
$('#bVidere').addEventListener('click', () => { S.mode = 'spill'; sist = performance.now(); visLag(null); sjekkMaal(true); });

// ---------- oppstart ----------
lagBakgrunn();
byggKart();
for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const t = tile(x, y); if (t === HAZ) hazListe.push([x, y]); else if (t === VANN || t === BVANN) vannListe.push([x, y]); else if (t === GHO) ghoListe.push([x, y]); }
{ const l = hentLagret(); if ((l && l.helt) || hentRekord()) $('#bTid').style.display = ''; }
if (hentLagret()) { $('#bFortsett').style.display = ''; $('#bNy').textContent = 'Nytt spill'; $('#bNy').classList.add('sek'); }
nyttSpill(null);
resize(); addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 150));
if (window.visualViewport) visualViewport.addEventListener('resize', resize);
visLag('#lagMeny');
requestAnimationFrame(loop);
window.__gnist = { B4, TURBIN, BORSTER, borstePos, INNST, brukKnapper, startTilpass, sluttTilpass, S, P, B, B2, B3, SVAKE, knusVegg, startTidsmodus, FAG, reiseTil, kjop, orbIgjen, visKart, lukkPanel, visVerk, tile, rect, faaEvne, FUNN, respawn, SJEKK, fiender, lagre, hentLagret, KRAN, I, KROKER, ORBER, TS, bolter, sveip, prosj, nyttSpill };
