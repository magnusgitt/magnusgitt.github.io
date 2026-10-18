'use strict';
// Gnist – kjerne: konstanter, hjelpere, tilstand og innstillinger.
// =============================================================
//  Gnist – et lite metroidvania-spill for Voltbase.
//  All grafikk og lyd lages med kode (canvas og Web Audio).
// =============================================================
const $ = s => document.querySelector(s);
const cv = $('#c'), hovedCtx = cv.getContext('2d');
let ctx = hovedCtx;   // byttes kort mot et eget lerret når montøren tegnes med kantlys
const T = 32, MW = 200, MH = 320;  // verden vokser nedover: hver sone har sine egne rader. Bredden må aldri endres (kartrutene i lagringen)
// flistyper: VANN = strømførende vann, BVANN = vannet i koblingsrommet (farlig bare når bossen setter strøm på), LUKE = luka ved hovedtavla
// GHO = spøkelsesplattform (fast bare med spenningstesteren), SVAK = svak vegg som vinkelsliperen skjærer gjennom
const AIR = 0, SOL = 1, ONE = 2, HAZ = 3, CUR = 4, DOOR = 5, VANN = 6, BVANN = 7, LUKE = 8, GHO = 9, SVAK = 10;
const NOKKEL = 'voltbase-gnist-v1';   // samme nøkkel som før, så gammel fremgang leses videre
const LAGRE_VERSJON = 4;

// ---------- hjelpere ----------
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hs(x, y, k) { let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(k | 0, 982451653)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
function nyC(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
function mot(v, m, d) { return v < m ? Math.min(v + d, m) : Math.max(v - d, m); }
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---------- tilstand ----------
const EVNER = ['dobbel', 'hansker', 'stot', 'liv', 'hemmelig', 'krok', 'liv2', 'tester', 'sliper', 'liv4', 'klatre', 'liv5', 'glid', 'liv6', 'jord', 'liv7', 'stovler', 'liv8', 'fiber', 'liv9', 'lynglid'];
function nyeEvner() { const e = {}; for (const k of EVNER) e[k] = false; return e; }
// kartet deles i ruter på 4×4 fliser som fylles inn etter hvert som montøren har vært der
const KC = 4, KW = Math.ceil(MW / KC), KH = Math.ceil(MH / KC);
const S = { mode: 'meny', t: 0, ev: nyeEvner(), fag: new Set(), sett: new Uint8Array(KW * KH), brukt: 0, kjop: {}, knust: new Set(), boss3: false, boss4: false, boss5: false, boss6: false, boss7: false, boss8: false, boss9: false, ngPluss: false, oppdrag: {}, helt: false, tidsmodus: false, cp: 0, cpLit: new Set([0]), orbTatt: new Set(),
  bossDone: false, boss2: false, tid: 0, ferdig: false, dodsfall: 0, shake: 0, flash: 0, flashF: '255,255,255', dod: 0, ending: 0, power: 0,
  hintSett: new Set(), mork: .55, frame: 0, panelT: 0, slow: 0, evneVent: 0, omr: '', hallLys: 0, hallFlimmer: 0, maal: '', idle: 0, laas: 0 };
const P = { x: 0, y: 0, w: 18, h: 30, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buf: 0, air: 0, dashT: 0, dashCd: 0,
  canDash: true, inv: 0, hp: 4, max: 4, sx: 1, sy: 1, anim: 0, safeX: 0, safeY: 0, paKran: false, lean: 0, landT: 0, spor: [], sporT: 0, fallT: 0,
  krok: null, krokCd: 0, sistKrok: null, sistKrokT: 0, vegg: 0, veggT: 0, sistVegg: 0, veggKoy: 0, piskT: 0, piskCd: 0 };
const GN = { x: 0, y: 0, vx: 0, vy: 0, flare: 0 };
const B = { aktiv: false, fase: '', introT: 0, hp: 3, x: 87.5 * T, y: 7.4 * T, t: 0, stun: 0, skuddT: 2, slagT: 6, lynT: 4, dod: 0, varsel: 0, lad: 0 };
// Kortslutningen: bossen i koblingsrommet
const B2 = { aktiv: false, fase: '', introT: 0, hp: 3, x: 153 * T, y: 45 * T, t: 0, stun: 0, dod: 0, golv: 0, golvT: 0, skuddT: 2, sveipT: 0, ned: 0, nedX: 153 * T, vx: 1 };
// Trafokjempen: sluttbossen i stasjonsgården
const B3 = { aktiv: false, fase: '', introT: 0, hp: 6, x: 146.5 * T, y: 27 * T, t: 0, stun: 0, dod: 0, sar: 0, slagT: 3, slag: 0, varsel: 0, golv: 0, golvT: 3, skuddT: 2.5, sveipT: 4, ned: 0, kjerneT: 4, hev: 0 };
// Generatoren: bossen i turbinhallen under kjelleren (etter at spillet er fullført)
const B4 = { aktiv: false, fase: '', introT: 0, hp: 4, t: 0, stun: 0, dod: 0, vinkel: 0, R: 0, borste: -1, borsteT: 0, forrige: -1, skuddT: 3, golv: 0, golvT: 4 };
// Lynfuglen: bossen i stormen på toppen av høyspentlinja
const B5 = { aktiv: false, fase: '', introT: 0, hp: 5, x: 0, y: 0, t: 0, stun: 0, dod: 0, tilstand: '', tT: 0, mx: 0, my: 0, vx: 0, vy: 0, lynT: 3, vindT: 5 };
// Spenningsålen: bossen i magasinet ved vannkraftdammen
const B6 = { aktiv: false, fase: '', introT: 0, hp: 3, t: 0, x: 0, y: 0, dir: 1, syklus: '', sT: 0, niva: 146, strom: '', stromT: 0, skuddT: 2, dod: 0 };
// krokpunkter for nye områder: hver sone og hvert system legger seg til her i stedet for å endre spill.js
const OPPDATER = [], TEGN_BAK = [], TEGN_VERDEN = [], TEGN_OVER = [], TEGN_FORAN = [], TEGN_GLOD = [], LYSKILDER = [], TILBAKESTILL = [], BOSSER = [], ETTER_DRAP = [];
const prosj = [], bolger = [], striker = [], partikler = [], lys = [], fiender = [], bolter = [], sveip = [];
let lyn = null;
const cam = { x: 0, y: 0, look: 0, anker: 0, zoom: 1 };
const I = { left: false, right: false, down: false, jumpHeld: false, jumpP: false, dashP: false, krokHeld: false, piskP: false };
const K = {}, TS = { left: false, right: false, jump: false, dash: false, krok: false, down: false };

// ---------- innstillinger (egen nøkkel, påvirker ikke lagret fremgang) ----------
const INNST = { vib: true, rist: true, mus: true, tips: true, grafikk: 'auto', knapper: {} };
try { const d = JSON.parse(localStorage.getItem(NOKKEL + '-innst') || 'null'); if (d && typeof d === 'object') for (const k of ['vib', 'rist', 'mus', 'tips']) if (typeof d[k] === 'boolean') INNST[k] = d[k];
  if (d && (d.grafikk === 'auto' || [0, 1, 2].includes(d.grafikk))) INNST.grafikk = d.grafikk;
  // egne knappeplasseringer per retning: { ligg|staa: { id: { x, y, s } } }
  if (d && d.knapper && typeof d.knapper === 'object') for (const r of ['ligg', 'staa']) { const o = d.knapper[r]; if (!o || typeof o !== 'object') continue; INNST.knapper[r] = {};
    for (const id of ['pad', 'tHopp', 'tStot', 'tKrok', 'tPisk', 'tSpiker']) { const v = o[id]; if (v && isFinite(v.x) && isFinite(v.y) && isFinite(v.s)) INNST.knapper[r][id] = { x: +v.x, y: +v.y, s: Math.min(1.6, Math.max(.6, +v.s)) }; } } } catch (e) {}
function lagreInnst() { try { localStorage.setItem(NOKKEL + '-innst', JSON.stringify(INNST)); } catch (e) {} visInnst(); }
function visInnst() { $('#bVib').textContent = 'Vibrasjon: ' + (INNST.vib ? 'på' : 'av'); $('#bRist').textContent = 'Risting: ' + (INNST.rist ? 'full' : 'redusert');
  $('#bMus').textContent = 'Musikk: ' + (INNST.mus ? 'på' : 'av'); $('#bTips').textContent = 'Hjelpetekst: ' + (INNST.tips ? 'på' : 'av');
  $('#bGrafikk').textContent = 'Grafikk: ' + { auto: 'automatisk', 2: 'høy', 1: 'middels', 0: 'lav' }[INNST.grafikk]; }
// kort vibrasjon på mobil (støttes ikke på alle telefoner, f.eks. iPhone)
function vib(m) { if (!INNST.vib || !erTouch || !navigator.vibrate) return; try { navigator.vibrate(m); } catch (e) {} }
