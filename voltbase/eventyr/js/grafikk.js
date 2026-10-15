// Strømmen må på – pikselgrafikk: figurer, ikoner, fliser og lys.
'use strict';
const r = (x, y, w, h, f) => { g.fillStyle = f; g.fillRect(x, y, w, h); };
function lyn(x1, y1, x2, y2, f, ctx = g) {
  ctx.fillStyle = f; const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) || 1; let j = 0;
  const loddrett = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  for (let i = 0; i <= n; i++) { if (i % 2 === 0) j = Math.round((Math.random() - 0.5) * 3); const t = i / n;
    ctx.fillRect(Math.round(x1 + (x2 - x1) * t + (loddrett ? j : 0)), Math.round(y1 + (y2 - y1) * t + (loddrett ? 0 : j)), 1, 1); }
}

// ── Figurer (12×16) ─────────────────────────────────────────────────
const PAL = { Y: '#ffcd3c', y: '#c98a1c', S: '#f4c39a', s: '#c98b62', K: '#1a1c2c', O: '#ef7d57', W: '#f4f4f4',
  B: '#3b5dc9', D: '#333c57', h: '#5d3a1a', T: '#94b0c2' };
const FIG = {
  ned: [
    '....YYYY....', '..YYYYYYYY..', '.yyyyyyyyyy.', '..SSSSSSSS..', '..SKSSSSKS..', '..SSSSSSSS..', '...SSssSS...',
    '..OOOOOOOO..', '.SOWWWWWWOS.', '.SOOOOOOOOS.', '..OOOOOOOO..', '..BBBBBBBB..'],
  opp: [
    '....YYYY....', '..YYYYYYYY..', '.yyyyyyyyyy.', '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..', '...hhhhhh...',
    '..OOOOOOOO..', '.SOWWWWWWOS.', '.SOOOOOOOOS.', '..OOOOOOOO..', '..BBBBBBBB..'],
  side: [
    '....YYYY....', '...YYYYYYY..', '..yyyyyyyyyy', '...hSSSSSS..', '...hSSSSKS..', '...hSSSSSS..', '....SSSSs...',
    '...OOOOOO...', '...OWWWWO...', '...OOOOOS...', '...OOOOOO...', '...BBBBBB...'],
  // Handling: armen strekkes fram (brukes kort når man trykker A)
  sideA: [
    '....YYYY....', '...YYYYYYY..', '..yyyyyyyyyy', '...hSSSSSS..', '...hSSSSKS..', '...hSSSSSS..', '....SSSSs...',
    '...OOOOOOSSS', '...OWWWWO...', '...OOOOOO...', '...OOOOOO...', '...BBBBBB...'],
};
const BEN = {
  ned: [['..BBB..BBB..', '..BBB..BBB..', '..DDD..DDD..', '............'], ['..BBB...BB..', '..DDD...BB..', '........DD..', '............'],
    ['..BB...BBB..', '..BB...DDD..', '..DD........', '............']],
  side: [['...BB..BB...', '..BB....BB..', '.DDD....DDD.', '............'], ['....BBBB....', '....BBBB....', '....DDDD....', '............'],
    ['...BB..BB...', '..BB....BB..', '.DDD....DDD.', '............']],
};
const KOSMETIKK = {
  gullhjelm: { Y: '#ffe680', y: '#e0a020' },
  rosahjelm: { Y: '#ff9ecb', y: '#d0608f' },
  hvithjelm: { Y: '#f4f4f4', y: '#94b0c2' },
};
const figCache = {};
function figur(retning, steg, pal = {}, nokkel = 'm', handling = false) {
  const side = retning === 'v' || retning === 'h';
  const k = nokkel + retning + steg + (handling ? 'A' : '');
  if (figCache[k]) return figCache[k];
  const topp = FIG[side ? (handling ? 'sideA' : 'side') : retning];
  const ben = BEN[side ? 'side' : 'ned'][steg % 3];
  const rader = [...topp, ...ben];
  const cv = document.createElement('canvas'); cv.width = 12; cv.height = 16;
  const x = cv.getContext('2d');
  rader.forEach((rad, j) => [...rad].forEach((ch, i) => { const f = pal[ch] || PAL[ch]; if (ch !== '.' && f) { x.fillStyle = f; x.fillRect(i, j, 1, 1); } }));
  return (figCache[k] = cv);
}
const spillerPal = () => KOSMETIKK[lagret.kosmetikk] || {};

const NPC_PAL = {
  byggeleder: { Y: '#f4f4f4', y: '#94b0c2', O: '#3b5dc9', W: '#ffcd3c', h: '#94b0c2' },
  hilde: { Y: '#f4f4f4', y: '#94b0c2', O: '#38b764', W: '#f4f4f4', h: '#b13e53' },
  kevin: { Y: '#ffcd3c', O: '#ffcd3c', W: '#ef7d57', h: '#ef7d57', B: '#5d275d' },
  tore: { Y: '#f4f4f4', y: '#94b0c2', O: '#257179', W: '#ffcd3c', h: '#8b5a2b', B: '#5d3a1a' },
  roger: { Y: '#ef7d57', y: '#b13e53', O: '#3b5dc9', W: '#3b5dc9', h: '#1a1c2c', B: '#29366f', S: '#e0a07a' },
  grete: { Y: '#41a6f6', y: '#29366f', O: '#29366f', W: '#41a6f6', h: '#1a1c2c', B: '#333c57' },
  mats: { Y: '#ffcd3c', y: '#c98a1c', O: '#5d275d', W: '#ffcd3c', h: '#c2c3c7', B: '#1a1c2c', S: '#d9a27a' },
  sondre: { Y: '#ffcd3c', y: '#c98a1c', O: '#41a6f6', W: '#f4f4f4', h: '#ffcd3c', B: '#29366f' },
  vidar: { Y: '#1a1c2c', y: '#333c57', O: '#1a1c2c', W: '#ffcd3c', h: '#566c86', B: '#1a1c2c' },
  sensor: { Y: '#f4f4f4', y: '#c2c3c7', O: '#b13e53', W: '#f4f4f4', h: '#c2c3c7', B: '#333c57' },
  tyv: { Y: '#1a1c2c', y: '#262b44', O: '#262b44', W: '#333c57', h: '#1a1c2c', B: '#1a1c2c', S: '#8b6b55', s: '#5d3a1a' },
};
const NAVN_ID = { 'Byggeleder Bjørn': 'byggeleder', 'Hilde (HMS)': 'hilde', 'Kevin (lærling)': 'kevin', 'Tore (tømrer)': 'tore',
  'Roger (rørlegger)': 'roger', 'Grete (grossist)': 'grete', 'Mats (montør)': 'mats', 'Sondre (lærling)': 'sondre',
  'Vidar (vekter)': 'vidar', 'Sensor Solveig': 'sensor' };
function portrettFor(navn) {
  if (!navn) return null;
  const n = String(navn), nokkel = Object.keys(NAVN_ID).find((k) => n === k || n.startsWith(k.split(' (')[0]));
  const id = nokkel && NAVN_ID[nokkel];
  return id ? figur('ned', 0, NPC_PAL[id], id) : null;
}

// ── Ikoner (10×10) ──────────────────────────────────────────────────
const IPAL = { k: '#1a1c2c', w: '#f4f4f4', g: '#94b0c2', G: '#566c86', y: '#ffcd3c', Y: '#fff1a8', o: '#ef7d57', r: '#b13e53', R: '#ff4d6d',
  b: '#3b5dc9', c: '#41a6f6', C: '#9fe8ff', n: '#8b5a2b', N: '#5d3a1a', l: '#38b764', L: '#a7f070', p: '#8b4fc9', P: '#c08ae0', u: '#e08a4c', U: '#ffd9a8', s: '#f4c39a' };
const IKON = {
  hjelm: ['..........', '...yyyy...', '..yyYyyy..', '.yyYyyyyy.', '.yyyyyyyy.', 'yyyyyyyyyy', '..........', '.NNN..NNN.', '.nnn..nnn.', 'kkkk..kkkk'],
  tester: ['....k.....', '....k.....', '...yyy....', '..yykyy...', '..yRkLy...', '..yykyy...', '..yyyyy...', '..ykkky...', '...yyy....', '....k.....'],
  stang: ['.......gw.', '......g.g.', '.....gg...', '....yy....', '...yk.....', '..yy......', '.yk.......', 'rr........', 'r.........', '..........'],
  isostang: ['.......CwC', '......o.C.', '.....oo...', '....oo....', '...ok.....', '..oo......', '.ok.......', 'rr........', 'r.........', '..........'],
  laas: ['...ggg....', '..g...g...', '..g...g...', '.rrrrrrr..', '.rRrkrrr..', '.rrrkrrr..', '.rrrrrrr..', '.....g....', '....www...', '....wRw...'],
  iso: ['.yyyyyyyy.', '.ykkkkkky.', '.ykLLLLky.', '.ykkkkkky.', '.yyyyyyyy.', '.ykRyykby.', '.yyyyyyyy.', '.yyyyyyyy.', '..k....k..', '..R....k..'],
  lykt: ['..........', '..........', '.kkkkkkkk.', '.k......k.', '.k.gggg.k.', '.kkgYYgkk.', '...gggg...', '..........', '..........', '..........'],
  lykt2: ['......C...', '.....C.C..', '.kkkkkkkk.', '.k......k.', '.k.cccc.k.', '.kkcwwckk.', '...cccc...', '...C..C...', '..C....C..', '..........'],
  visir: ['..yyyyyy..', '.yyyyyyyy.', '.gCCCCCCg.', '.gCwCCCCg.', '.gCCwCCCg.', '.gCCCCCCg.', '..gCCCCg..', '...gggg...', '..........', '..........'],
  hjerte: ['..........', '.RR...RR..', 'RwRR.RRRR.', 'RRRRRRRRR.', 'RRRRRRRRR.', '.RRRRRRR..', '..RRRRR...', '...RRR....', '....R.....', '..........'],
  sele: ['.o......o.', '.o......o.', '..o....o..', '...oooo...', '...o..o...', '..ogyygo..', '..o....o..', '.o......o.', '.o......o.', '..........'],
  termo: ['..........', '.gggggg...', '.gRyyog.k.', '.gyoRyggk.', '.goyyRg.k.', '.gggggg...', '...gg.....', '...gg.....', '...GG.....', '..........'],
  kabelsoker: ['....C.....', '...C.C....', '..........', '..gggg....', '..gLLg....', '..gggg....', '..gyyg....', '..gyyg....', '..gGGg....', '...GG.....'],
  trommel: ['..pppppp..', '.pPPPPPPp.', 'pPkkkkkkPp', 'pPkpppkkPp', 'pPkkkkkkPp', 'pPkkkkkkPp', '.pPPPPPPp.', '..pppppp..', '..........', '..........'],
  skrutrekker: ['........g.', '.......g..', '......g...', '.....g....', '....rr....', '...rRr....', '..rRr.....', '.rrr......', '..........', '..........'],
  verktoy: ['..........', '...rrrr...', '..r....r..', 'rrrrrrrrrr', 'rRRRyyRRRr', 'rrrrkkrrrr', 'rRRRRRRRRr', 'rrrrrrrrrr', '..........', '..........'],
  skrap: ['..........', '....u.....', '..uuU..u..', '.uUuu.uu..', '..u.uuUu..', '.uu..uu...', '..uUu.uuu.', '...uu..u..', '..........', '..........'],
  nokkel: ['..........', '.yyy......', 'y...y.....', 'y...yyyyyy', 'y...y..y.y', '.yyy......', '..........', '..........', '..........', '..........'],
  spor: ['.wwwwww...', '.wkkkkw...', '.wwwwww...', '.wkkkww...', '.wwwwww...', '.wkkkkw...', '.wwwwwwG..', '.....GG...', '....GG....', '..........'],
  gullhjelm: ['..........', '...yyyy...', '..yYYyyy..', '.yYwYyyyy.', '.yyYyyyyy.', 'yyyyyyyyyy', '..Y....Y..', '...Y..Y...', '..........', '..........'],
  rosahjelm: ['..........', '...PPPP...', '..PPwPPP..', '.PPwPPPPP.', '.PPPPPPPP.', 'PPPPPPPPPP', '..........', '..........', '..........', '..........'],
  sekk: ['..........', '...nnnn...', '..n....n..', '.nnnnnnnn.', '.nNNyyNNn.', '.nnnnnnnn.', '.nNNNNNNn.', '.nnnnnnnn.', '..........', '..........'],
  logg: ['..........', '.wwwwwwww.', '.w......w.', '.wkkkk..w.', '.w......w.', '.wkkkkk.w.', '.w......w.', '.wkkk...w.', '.wwwwwwww.', '..........'],
  kobber: ['..........', '...uuuu...', '..uUUuuu..', '.uUuuuuuu.', '.uuuuuuuu.', '.uuuuuuuu.', '..uuuuuu..', '...uuuu...', '..........', '..........'],
};
const ikonCache = {};
function ikon(id) {
  if (ikonCache[id]) return ikonCache[id];
  const cv = document.createElement('canvas'); cv.width = 10; cv.height = 10;
  const x = cv.getContext('2d');
  (IKON[id] || IKON.spor).forEach((rad, j) => [...rad].forEach((ch, i) => { if (IPAL[ch]) { x.fillStyle = IPAL[ch]; x.fillRect(i, j, 1, 1); } }));
  return (ikonCache[id] = cv);
}
function ikonCanvas(id) { const cv = document.createElement('canvas'); cv.width = 10; cv.height = 10; cv.getContext('2d').drawImage(ikon(id), 0, 0); return cv; }

// ── Fliser ──────────────────────────────────────────────────────────
// Tegnes etter tegn i kartet. Noen tegn ser ulike ut i ulike områder (vegg i kjelleren er betong).
function tegnRute(x, y, X, Y) {
  const ch = kart[y][x], h = hash(x, y), tema = OMR[omr].tema;
  const gress = () => { r(X, Y, 16, 16, '#38b764'); r(X + h % 14, Y + (h >> 4) % 14, 1, 2, '#257179'); r(X + (h >> 8) % 14, Y + (h >> 12) % 14, 1, 2, '#a7f070'); if (h % 7 === 0) r(X + (h >> 3) % 13, Y + (h >> 9) % 13, 2, 1, '#ffcd3c'); };
  const grus = () => { r(X, Y, 16, 16, '#c2a77a'); r(X + h % 15, Y + (h >> 4) % 15, 1, 1, '#8b6b45'); r(X + (h >> 8) % 15, Y + (h >> 12) % 15, 2, 1, '#e6cfa0'); r(X + (h >> 6) % 15, Y + (h >> 10) % 15, 1, 1, '#8b6b45'); };
  const betong = () => { r(X, Y, 16, 16, '#5a5e6e'); r(X + h % 15, Y + (h >> 4) % 15, 1, 1, '#454857'); r(X + (h >> 8) % 15, Y + (h >> 12) % 15, 2, 1, '#6e7385'); if (!(x % 4) && !(y % 3)) r(X, Y, 1, 16, '#4b4f5d'); };
  const takpapp = () => { r(X, Y, 16, 16, '#3e4354'); r(X, Y + (y % 2 ? 0 : 8), 16, 1, '#333847'); r(X + h % 15, Y + (h >> 4) % 15, 1, 1, '#4f5568'); r(X + (h >> 8) % 14, Y + (h >> 12) % 14, 2, 2, '#5a6075'); };
  const gulv = () => { if (tema === 'bolig') { r(X, Y, 16, 16, (x % 2) ? '#a0703c' : '#b07c44'); r(X, Y + (x * 5 + y * 3) % 16, 16, 1, '#8b5a2b'); r(X + 15, Y, 1, 16, '#8b5a2b'); }
    else { r(X, Y, 16, 16, (x + y) % 2 ? '#94b0c2' : '#8aa4b8'); r(X, Y, 16, 1, '#a9c1d1'); } };
  const bunn = () => (tema === 'kjeller' || tema === 'trafo' ? betong() : tema === 'tak' ? takpapp() : tema === 'ute' ? grus() : gulv());
  switch (ch) {
    case ',': gress(); break;
    case '.': grus(); break;
    case 'o': gulv(); break;
    case 'b': betong(); break;
    case 't': takpapp(); break;
    case '~': grus(); r(X + 2, Y + 4, 12, 8, '#3b5dc9'); r(X + 1, Y + 6, 14, 4, '#3b5dc9'); r(X + 3 + Math.round(Math.sin(tid * 2 + x) * 2), Y + 6, 5, 1, '#9fe8ff'); break;
    case 'U': case 'N': {
      const opp = ch === 'U';
      r(X, Y, 16, 16, opp ? '#2b2f3d' : '#1a1c2c');
      for (let i = 0; i < 4; i++) r(X + 1, Y + 1 + i * 4, 14, 2, opp ? ['#c2c3c7', '#94b0c2', '#8b9bb4', '#566c86'][i] : ['#566c86', '#454857', '#333c57', '#262b44'][i]);
      r(X, Y, 1, 16, '#ffcd3c'); r(X + 15, Y, 1, 16, '#ffcd3c');
      if (porterStengt(x, y)) for (let i = 0; i < 16; i += 4) { r(X + i, Y + 6, 2, 3, i % 8 ? '#1a1c2c' : '#ffcd3c'); r(X + i + 2, Y + 6, 2, 3, i % 8 ? '#ffcd3c' : '#1a1c2c'); }
      break;
    }
    case 'V': {
      grus(); const v = x - 35, top = y === 2;
      r(X, Y + (top ? 3 : 0), 16, top ? 13 : 12, '#f4f4f4');
      if (top) { r(X, Y + 3, 16, 1, '#c2c3c7'); if (v === 0) r(X + 1, Y + 5, 9, 6, nattFaktor() > 0.5 ? '#ffcd3c' : '#41a6f6'); }
      else { r(X, Y + 2, 16, 3, '#3b5dc9'); r(X, Y + 11, 16, 1, '#94b0c2'); if (v !== 1) { r(X + 4, Y + 10, 8, 6, '#1a1c2c'); r(X + 6, Y + 12, 4, 2, '#566c86'); }
        if (v === 1) { r(X + 3, Y + 6, 10, 3, '#e08a4c'); r(X + 4, Y + 7, 8, 1, '#ffd9a8'); } }
      break;
    }
    case 'J': {
      grus(); const farge = ['#38b764', '#41a6f6', '#38b764'][(x - 51) % 3];
      r(X + 1, Y, 14, 16, farge); r(X + 1, Y, 14, 3, '#f4f4f4'); r(X + 3, Y + 4, 10, 11, '#00000033'); r(X + 4, Y + 5, 8, 10, farge);
      r(X + 6, Y + 6, 4, 1, '#1a1c2c'); r(X + 10, Y + 10, 2, 2, '#f4f4f4');
      if (lagret.flagg.kevinLurt && !lagret.flagg.kevinFunnet && x === 53 && Math.floor(tid * 3) % 3 === 0) r(X + 3, Y - 1, 10, 1, '#ffcd3c');
      break;
    }
    case 'H': {
      r(X, Y, 16, 16, '#2b2f3d'); r(X + 1, Y + 1, 14, 15, '#8b9bb4'); r(X + 2, Y + 2, 12, 13, '#566c86');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) r(X + 3 + i * 4, Y + 4 + j * 5, 2, 3, '#1a1c2c');
      if (!lagret.flagg.ferdig2 && x === 25) { r(X + 4, Y + 13, 8, 2, '#1a1c2c'); if (Math.random() < 0.3) lyn(X + 8, Y + 12, X + Math.random() * 16, Y + 16 + Math.random() * 8, '#9fe8ff'); }
      else r(X + 7, Y + 13, 2, 1, lagret.flagg.ferdig2 ? '#38b764' : '#ff4d6d');
      break;
    }
    case 'M': { // lavspenttavle
      r(X, Y, 16, 16, '#2b2f3d'); r(X + 1, Y + 1, 14, 15, '#c2c3c7'); r(X + 2, Y + 2, 12, 13, '#8b9bb4');
      for (let i = 0; i < 4; i++) r(X + 3 + i * 3, Y + 4, 2, 5, '#1a1c2c');
      r(X + 3, Y + 11, 10, 2, lagret.flagg.trafoFerdig ? '#38b764' : (Math.floor(tid * 2) % 2 ? '#ff4d6d' : '#5d275d'));
      break;
    }
    case 'X': { // transformator
      betong(); r(X + 1, Y + 1, 14, 15, '#566c86'); for (let i = 2; i < 15; i += 3) r(X + i, Y + 2, 1, 13, '#333c57');
      r(X + 1, Y + 1, 14, 1, '#94b0c2'); if ((x + y) % 2 === 0) { r(X + 5, Y - 2, 2, 4, '#c2c3c7'); r(X + 4, Y - 3, 4, 1, '#f4f4f4'); }
      break;
    }
    case 'Y': { // høyspentfelt bak gitter
      betong(); r(X, Y, 16, 16, '#333c57'); for (let i = 0; i < 16; i += 3) r(X + i, Y, 1, 16, '#566c86'); for (let j = 0; j < 16; j += 3) r(X, Y + j, 16, 1, '#566c86');
      r(X + 5, Y + 5, 6, 6, '#ffcd3c'); r(X + 7, Y + 6, 2, 3, '#1a1c2c'); r(X + 7, Y + 10, 2, 1, '#1a1c2c');
      break;
    }
    case 'E': { // jordingsskinne i gulvet
      betong(); r(X + 1, Y + 6, 14, 4, '#38b764'); r(X + 1, Y + 7, 14, 2, '#ffcd3c'); for (let i = 2; i < 15; i += 4) r(X + i, Y + 6, 1, 4, '#1a1c2c');
      break;
    }
    case 'W': // skjult luke i veggen – ser ut som vegg til den er åpnet
      if (lagret.flagg.snarveiApen) { betong(); r(X, Y, 16, 2, '#2b2f3d'); break; }
      r(X, Y, 16, 16, '#2b2f3d'); r(X, Y, 16, 2, '#3e4354');
      if (lagret.ting.tester && omr === 'kjeller') { r(X + 2, Y + 6, 12, 1, '#ff4d6d'); r(X + 7, Y + 6, 1, 6, '#ff4d6d'); r(X + 4, Y + 11, 8, 4, '#454857'); r(X + 4, Y + 11, 8, 1, '#ffcd3c'); }
      break;
    case '#': case 'w':
      if (tema === 'kjeller' || tema === 'trafo') { r(X, Y, 16, 16, '#2b2f3d'); r(X, Y, 16, 2, '#3e4354'); r(X + (h % 12), Y + 6 + (h >> 5) % 8, 3, 1, '#23262f'); break; }
      if (tema === 'bolig') { r(X, Y, 16, 16, '#d9d4c7'); r(X, Y, 16, 3, '#f4f4f4'); r(X, Y + 13, 16, 3, '#a8a195');
        if (ch === 'w') { r(X + 3, Y + 4, 10, 7, '#9fe8ff'); r(X + 3, Y + 7, 10, 1, '#f4f4f4'); r(X + 7, Y + 4, 1, 7, '#f4f4f4'); } break; }
      r(X, Y, 16, 16, '#566c86'); r(X, Y, 16, 3, '#94b0c2'); r(X + (y % 2) * 8, Y + 8, 1, 8, '#333c57'); r(X, Y + 8, 16, 1, '#333c57');
      if (ch === 'w') { r(X + 3, Y + 4, 10, 6, nattFaktor() > 0.5 ? '#ffcd3c' : '#41a6f6'); r(X + 7, Y + 4, 1, 6, '#94b0c2'); }
      break;
    case 'D': r(X, Y, 16, 16, '#5d3a1a'); r(X + 2, Y, 12, 16, '#3a240f'); r(X + 11, Y + 8, 2, 2, '#ffcd3c'); break;
    case 'T': gress(); r(X + 7, Y + 10, 3, 6, '#5d3a1a'); r(X + 2, Y + 1, 12, 10, '#257179'); r(X + 3, Y + 2, 7, 5, '#38b764'); r(X + 4, Y + 3, 2, 2, '#a7f070'); break;
    case 'F': grus(); r(X, Y + 2, 16, 11, '#c2c3c7aa'); for (let i = 0; i < 16; i += 3) r(X + i, Y + 2, 1, 11, '#566c86'); for (let j = 2; j < 13; j += 3) r(X, Y + j, 16, 1, '#566c86'); r(X, Y + 1, 16, 1, '#333c57'); r(X + 1, Y + 1, 2, 14, '#333c57'); r(X, Y + 14, 4, 2, '#b13e53'); break;
    case 'P': bunn(); r(X + 1, Y + 3, 14, 12, '#8b5a2b'); for (let j = 4; j < 15; j += 4) r(X + 1, Y + j, 14, 1, '#5d3a1a'); r(X + 1, Y + 3, 14, 1, '#c98b62'); r(X + 1, Y + 14, 14, 1, '#00000044'); break;
    case 'C': { const blaa = Math.floor(x / 3 + y / 2) % 2; r(X, Y, 16, 16, blaa ? '#3b5dc9' : '#b13e53'); for (let i = 1; i < 16; i += 3) r(X + i, Y, 1, 16, blaa ? '#29366f' : '#5d275d'); r(X, Y, 16, 1, '#ffffff44'); break; }
    case 'R': { // kabeltrommel
      grus(); r(X + 1, Y + 2, 14, 13, '#8b5a2b'); r(X + 2, Y + 3, 12, 11, '#c98b62'); r(X + 4, Y + 5, 8, 7, '#1a1c2c'); r(X + 5, Y + 6, 6, 5, (x + y) % 3 ? '#e08a4c' : '#333c57'); r(X + 7, Y + 8, 2, 1, '#5d3a1a');
      if (lagret.teller['stjalet' + x + ',' + y]) { grus(); r(X + 4, Y + 10, 8, 3, '#8b5a2b'); r(X + 2, Y + 12, 3, 1, '#5d3a1a'); }
      break;
    }
    case 'S': { // stillas
      bunn(); r(X + 1, Y, 2, 16, '#c2c3c7'); r(X + 13, Y, 2, 16, '#c2c3c7'); r(X, Y + 3, 16, 2, '#94b0c2'); r(X, Y + 11, 16, 2, '#94b0c2');
      r(X + 3, Y + 5, 10, 1, '#8b5a2b'); r(X + 3, Y + 4, 10, 1, '#c98b62');
      break;
    }
    case 'Q': // kioskvegg
      r(X, Y, 16, 16, '#7a7f8f'); r(X, Y, 16, 2, '#9aa0b0'); for (let i = 0; i < 16; i += 4) r(X + i, Y + 2, 1, 14, '#6a6f7f');
      if (x === 45 && y === 33) { r(X + 3, Y + 4, 10, 9, '#ffcd3c'); r(X + 7, Y + 5, 2, 4, '#1a1c2c'); r(X + 7, Y + 10, 2, 1, '#1a1c2c'); }
      break;
    case 'K': // kioskdør
      r(X, Y, 16, 16, '#7a7f8f'); r(X + 2, Y + 1, 12, 15, lagret.flagg.trafoApen ? '#1a1c2c' : '#566c86'); r(X + 2, Y + 1, 12, 1, '#c2c3c7');
      if (!lagret.flagg.trafoApen) { r(X + 10, Y + 8, 2, 3, '#ffcd3c'); r(X + 4, Y + 4, 5, 4, '#ffcd3c'); r(X + 6, Y + 5, 1, 2, '#1a1c2c'); }
      break;
    case 'A': { // ventilasjonsaggregat
      takpapp(); r(X, Y + 1, 16, 15, '#94b0c2'); r(X, Y + 1, 16, 2, '#c2c3c7'); r(X + 1, Y + 14, 14, 2, '#566c86');
      for (let i = 3; i < 13; i += 3) r(X + 2, Y + i + 1, 12, 1, '#566c86');
      if ((x + y) % 2 === 0) { const a = lagret.flagg.ventFikset ? tid * 12 : 0; r(X + 6 + Math.round(Math.cos(a) * 3), Y + 7 + Math.round(Math.sin(a) * 3), 2, 2, '#1a1c2c'); }
      break;
    }
    case 'e': // takkant med rekkverk
      takpapp(); r(X, Y, 16, 16, '#262b44'); r(X, Y + 3, 16, 2, '#c2c3c7'); for (let i = 1; i < 16; i += 5) r(X + i, Y + 3, 1, 10, '#c2c3c7');
      break;
    case '=': // kabelbro
      bunn(); r(X, Y + 4, 16, 8, '#566c86'); r(X, Y + 4, 16, 1, '#c2c3c7'); r(X, Y + 11, 16, 1, '#c2c3c7');
      for (let i = 1; i < 16; i += 4) r(X + i, Y + 5, 1, 6, '#333c57');
      r(X, Y + 6, 16, 1, '#1a1c2c'); r(X, Y + 8, 16, 1, '#ef7d57'); r(X, Y + 9, 16, 1, '#1a1c2c');
      break;
    case 'Z': // åpen sjakt
      r(X, Y, 16, 16, '#0e0f18'); r(X, Y, 16, 1, '#566c86'); r(X + 2, Y + 4, 12, 1, '#1a1c2c');
      if (lagret.flagg.sjaktSperret) { r(X, Y + 2, 16, 2, '#ff4d6d'); r(X, Y + 2, 4, 2, '#f4f4f4'); r(X + 8, Y + 2, 4, 2, '#f4f4f4'); }
      break;
    case 'k': case 'L': {
      bunn();
      const paa = ch === 'L' ? s1Paa : levende(x, y);
      const vis = ch === 'L' || lagret.ting.tester;
      r(X, Y + 7, 16, 3, '#1a1c2c'); r(X + ((h >> 3) % 10) + 2, Y + 6, 3, 5, '#1a1c2c');
      if (vis && paa) { r(X, Y + 8, 16, 1, '#ff4d6d'); if (Math.random() < 0.5) lyn(X + Math.random() * 16, Y + 8, X + Math.random() * 16, Y + 2 + Math.random() * 4, '#9fe8ff'); }
      else if (vis && lagret.ting.tester) r(X, Y + 8, 16, 1, '#38b764');
      break;
    }
    default: bunn();
  }
}

// ── Lys og mørke ────────────────────────────────────────────────────
const morkCv = document.createElement('canvas'), mg = morkCv.getContext('2d');
function lys(x, y, rad, styrke = 1) {
  if (x < -rad || y < -rad || x > VW + rad || y > VH + rad) return;
  const gr = mg.createRadialGradient(x, y, rad * 0.3, x, y, rad);
  gr.addColorStop(0, 'rgba(0,0,0,' + styrke + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  mg.fillStyle = gr; mg.beginPath(); mg.arc(x, y, rad, 0, 7); mg.fill();
}
// Fargeglød oppå (lampelys, gnister)
function glod(x, y, rad, farge, styrke = 0.35) {
  if (x < -rad || y < -rad || x > VW + rad || y > VH + rad) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, farge.replace(')', ',' + styrke + ')').replace('rgb', 'rgba')); gr.addColorStop(1, farge.replace(')', ',0)').replace('rgb', 'rgba'));
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); g.restore();
}
function startMorke(farge) {
  if (morkCv.width !== VW || morkCv.height !== VH) { morkCv.width = VW; morkCv.height = VH; }
  mg.globalCompositeOperation = 'source-over'; mg.clearRect(0, 0, VW, VH);
  mg.fillStyle = farge; mg.fillRect(0, 0, VW, VH);
  mg.globalCompositeOperation = 'destination-out';
}
function sluttMorke() { g.drawImage(morkCv, 0, 0); }

// Liten tekst på lerretet (snakkebobler)
function tekstBoble(tekst, cx, bunnY) {
  g.font = '6px "Press Start 2P", monospace';
  const ord = tekst.split(' '), linjer = []; let l = '';
  for (const o of ord) { const t = l ? l + ' ' + o : o; if (g.measureText(t).width > 96 && l) { linjer.push(l); l = o; } else l = t; }
  if (l) linjer.push(l);
  const w = Math.min(104, Math.max(...linjer.map((x) => g.measureText(x).width)) + 8), hgt = linjer.length * 9 + 5;
  let x = Math.round(cx - w / 2); x = Math.max(2, Math.min(VW - w - 2, x));
  const y = Math.round(bunnY - hgt - 4);
  r(x, y, w, hgt, '#f4f4f4'); r(x + 1, y + 1, w - 2, hgt - 2, '#ffffff'); r(x, y, w, 1, '#1a1c2c'); r(x, y + hgt - 1, w, 1, '#1a1c2c'); r(x, y, 1, hgt, '#1a1c2c'); r(x + w - 1, y, 1, hgt, '#1a1c2c');
  r(Math.round(cx) - 1, y + hgt, 3, 2, '#ffffff'); r(Math.round(cx), y + hgt + 2, 1, 2, '#1a1c2c');
  g.fillStyle = '#1a1c2c'; g.textBaseline = 'top';
  linjer.forEach((t, i) => g.fillText(t, x + 4, y + 4 + i * 9));
}
