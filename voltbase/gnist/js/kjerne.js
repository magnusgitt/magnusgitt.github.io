'use strict';
// Gnist – kjerne: konstanter, hjelpere, tilstand og innstillinger.
// =============================================================
//  Gnist – et lite metroidvania-spill for Voltbase.
//  All grafikk og lyd lages med kode (canvas og Web Audio).
// =============================================================
const $ = s => document.querySelector(s);
const cv = $('#c'), ctx = cv.getContext('2d');
const T = 32, MW = 130, MH = 34;
const AIR = 0, SOL = 1, ONE = 2, HAZ = 3, CUR = 4, DOOR = 5;
const NOKKEL = 'voltbase-gnist-v1';   // samme nøkkel som før, så gammel fremgang leses videre
const LAGRE_VERSJON = 2;

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
const S = { mode: 'meny', t: 0, ev: { dobbel: false, hansker: false, stot: false, liv: false, hemmelig: false }, cp: 0, cpLit: new Set([0]), orbTatt: new Set(),
  bossDone: false, tid: 0, ferdig: false, dodsfall: 0, shake: 0, flash: 0, flashF: '255,255,255', dod: 0, ending: 0, power: 0,
  hintSett: new Set(), mork: .55, frame: 0, panelT: 0, slow: 0, evneVent: 0, omr: '', hallLys: 0, hallFlimmer: 0, maal: '', idle: 0, laas: 0 };
const P = { x: 0, y: 0, w: 18, h: 30, vx: 0, vy: 0, face: 1, onGround: false, coyote: 0, buf: 0, air: 0, dashT: 0, dashCd: 0,
  canDash: true, inv: 0, hp: 4, max: 4, sx: 1, sy: 1, anim: 0, safeX: 0, safeY: 0, paKran: false, lean: 0, landT: 0, spor: [], sporT: 0, fallT: 0 };
const GN = { x: 0, y: 0, vx: 0, vy: 0, flare: 0 };
const B = { aktiv: false, fase: '', introT: 0, hp: 3, x: 87.5 * T, y: 7.4 * T, t: 0, stun: 0, skuddT: 2, slagT: 6, lynT: 4, dod: 0, varsel: 0, lad: 0 };
const prosj = [], bolger = [], striker = [], partikler = [], lys = [], fiender = [];
let lyn = null;
const cam = { x: 0, y: 0, look: 0, anker: 0, zoom: 1 };
const I = { left: false, right: false, down: false, jumpHeld: false, jumpP: false, dashP: false };
const K = {}, TS = { left: false, right: false, jump: false, dash: false };

// ---------- innstillinger (egen nøkkel, påvirker ikke lagret fremgang) ----------
const INNST = { vib: true, rist: true };
try { const d = JSON.parse(localStorage.getItem(NOKKEL + '-innst') || 'null'); if (d && typeof d === 'object') { if (typeof d.vib === 'boolean') INNST.vib = d.vib; if (typeof d.rist === 'boolean') INNST.rist = d.rist; } } catch (e) {}
function lagreInnst() { try { localStorage.setItem(NOKKEL + '-innst', JSON.stringify(INNST)); } catch (e) {} visInnst(); }
function visInnst() { $('#bVib').textContent = 'Vibrasjon: ' + (INNST.vib ? 'på' : 'av'); $('#bRist').textContent = 'Risting: ' + (INNST.rist ? 'full' : 'redusert'); }
// kort vibrasjon på mobil (støttes ikke på alle telefoner, f.eks. iPhone)
function vib(m) { if (!INNST.vib || !erTouch || !navigator.vibrate) return; try { navigator.vibrate(m); } catch (e) {} }
