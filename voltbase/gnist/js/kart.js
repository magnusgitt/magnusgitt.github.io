'use strict';
// Gnist – kartet, objektene i verden og kollisjon.
// ---------- kartet ----------
const map = new Uint8Array(MW * MH);
const dyp = new Uint8Array(MW * MH);
function tile(x, y) { if (x < 0 || y < 0 || x >= MW || y >= MH) return SOL; return map[y * MW + x]; }
function setT(x, y, v) { if (x >= 0 && y >= 0 && x < MW && y < MH) map[y * MW + x] = v; }
function rect(x0, y0, x1, y1, v) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setT(x, y, v); }
const SKJULT = { x0: 3, x1: 9, y0: 28, y1: 31 };   // hemmelig rom bak kjellerveggen
// Kartet beskrives som data: hvert område er en liste med rektangler [x0, y0, x1, y1, flis] som legges oppå fjell (SOL).
const OMRAADER = [
  { navn: 'Byggeplassen', kart: [
    [1, 0, 34, 23, AIR], [35, 0, 38, 18, AIR],
    [18, 21, 21, 21, ONE],
    [12, 24, 14, 26, AIR],                                 // hull ned i kjelleren
    [10, 27, 48, 31, AIR],
    [22, 31, 24, 31, HAZ], [32, 31, 34, 31, HAZ],
    [SKJULT.x0, SKJULT.y0, SKJULT.x1, SKJULT.y1, AIR],     // hemmelig rom (ser fast ut til det er funnet)
    [45, 19, 48, 26, AIR],                                 // sjakt opp fra kjelleren (krever dobbelhopp)
    [47, 27, 48, 27, SOL], [45, 23, 46, 23, SOL],
  ] },
  { navn: 'Stillaset', kart: [
    [39, 0, 72, 18, AIR],
    [49, 15, 53, 15, ONE], [55, 11, 59, 11, ONE], [49, 7, 53, 7, ONE],
    [57, 3, 64, 4, SOL],
    [71, 5, 72, 5, SOL],                                   // liten hylle som kranlasten fører til
  ] },
  { navn: 'Trafohallen', kart: [
    [73, 13, 73, 18, CUR],                                 // strømførende sperre
    [74, 6, 100, 18, AIR],
    [77, 15, 79, 18, SOL], [95, 15, 97, 18, SOL],
    [81, 13, 83, 13, ONE], [91, 13, 93, 13, ONE], [85, 10, 89, 10, ONE],
    [101, 13, 101, 18, DOOR],
  ] },
  { navn: 'Sjakten', kart: [
    [102, 0, 128, 18, AIR],
    [105, 19, 117, 30, AIR], [105, 30, 117, 30, HAZ],
  ] },
];
function byggKart() {
  map.fill(SOL);
  for (const o of OMRAADER) for (const [x0, y0, x1, y1, v] of o.kart) rect(x0, y0, x1, y1, v);
}
const iSkjult = (x, y) => x >= SKJULT.x0 && x <= SKJULT.x1 && y >= SKJULT.y0 && y <= SKJULT.y1;
// «Malt fast»: det som tegnes som stein. Det hemmelige rommet ser fast ut til det er funnet.
const erSol = (x, y) => tile(x, y) === SOL || (!S.ev.hemmelig && iSkjult(x, y));
function beregnDyp() {
  const q = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const i = y * MW + x; if (!erSol(x, y)) { dyp[i] = 0; q.push(i); } else dyp[i] = 255; }
  let h = 0;
  while (h < q.length) { const i = q[h++], x = i % MW, y = (i / MW) | 0, d = dyp[i];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const j = ny * MW + nx; if (dyp[j] > d + 1) { dyp[j] = d + 1; q.push(j); } } }
}
const dypAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? 6 : Math.min(6, dyp[y * MW + x]);
function inne(x, y) { return (y >= 24 && x <= 52) || (x >= 45 && x <= 48 && y >= 19) || (x >= 73 && x <= 101 && y >= 6 && y <= 18) || (x >= 105 && x <= 117 && y >= 19); }
const erHall = (x, y) => x >= 73 && x <= 101 && y >= 5 && y <= 19;
function omraade(tx, ty) {
  if (erHall(tx, ty) && tx >= 74) return 'Trafohallen';
  if (tx >= 102) return 'Sjakten';
  if (inne(tx, ty)) return 'Kjelleren';
  if (tx >= 39) return 'Stillaset';
  return 'Byggeplassen';
}

// ---------- objekter ----------
const SJEKK = [{ x: 4, y: 23 }, { x: 40, y: 31 }, { x: 69, y: 18 }, { x: 103, y: 18 }];
// De 21 første ligger i samme rekkefølge som i første versjon, så lagrede lysorber stemmer fortsatt.
const ORBER = [[8,22],[19,19],[27,22],[31,21],[17,29],[23,28],[33,28],[38,30],[46,25],[47,21],[43,16],[51,13],[57,9],[51,5],[60,1],[66,10],[70,16],[87,7],[110,12],[114,10],[124,9],
  [10,30],[4,29],[7,29],[67,6],[71,4]];
const IKON = {
  dobbel: '<svg viewBox="0 0 24 24"><path d="M6 2h5v10l8 2c1.7.4 3 1.9 3 3.7V20H2v-3l4-1z"/></svg>',
  hansker: '<svg viewBox="0 0 24 24"><path d="M7 22v-5L4 12c-.8-1.2.9-2.6 2-1.6L8 12V4a1.4 1.4 0 012.8 0V10h.4V2.6a1.4 1.4 0 012.8 0V10h.4V3.6a1.4 1.4 0 012.8 0V11h.4V6a1.4 1.4 0 012.8 0v9c0 3-2 5-3 7z"/></svg>',
  stot: '<svg viewBox="0 0 24 24"><path d="M14 1L4 14h7l-2 9 11-14h-7z"/></svg>',
};
const FUNN = [
  { id: 'dobbel', x: 44, y: 31, navn: 'Stigesko', tekst: 'Du kan hoppe en gang til i lufta.', pc: 'Trykk <b>Mellomrom</b> igjen i lufta', mob: 'Trykk <b>Hopp</b> igjen i lufta' },
  { id: 'hansker', x: 61, y: 2, navn: 'Isolerte hansker', tekst: 'Du tåler strømførende sperrer.', pc: 'Gå rett gjennom den blå sperren', mob: 'Gå rett gjennom den blå sperren' },
  { id: 'stot', x: 87, y: 18, boss: true, navn: 'Strømstøt', tekst: 'Kast deg fremover med et lyn. Ett støt per hopp.', pc: 'Trykk <b>Shift</b> eller <b>X</b>', mob: 'Trykk <b>Støt</b>' },
  { id: 'liv', x: 5, y: 31, navn: 'Livsgnist', liten: true },
];
const BRYTERE = [{ x: 78, y: 14, av: false }, { x: 87, y: 9, av: false }, { x: 96, y: 14, av: false }];
const TAVLE = { x: 123, y: 17 };
const FIENDE_DEF = [{ x0: 22, x1: 31, y: 23 }, { x0: 36, x1: 43, y: 31 }, { x0: 55, x1: 67, y: 18 }];
const LYSBUE = { x: 28, y0: 27, y1: 31, per: 3.2 };   // tidsstyrt lysbue i kjelleren
const KRAN = { x0: 65 * T, x1: 69 * T, y: 8 * T, w: 3 * T, x: 65 * T, dx: 0, t: 0 };
const hazListe = [];
const KJELLERLYS = [[16, 27], [29, 27], [40, 27], [6, 28]];   // svake taklamper i kjelleren

// ---------- kollisjon ----------
function fast(tx, ty) { const t = tile(tx, ty); return t === SOL || t === DOOR || (t === CUR && !S.ev.hansker); }
function overlapp(x, y, w, h) {
  const x0 = Math.floor(x / T), x1 = Math.floor((x + w - .01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - .01) / T);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (fast(tx, ty)) return true; return false;
}
function flyttX(p, dx) {
  if (dx === 0) return;
  p.x += dx;
  const y0 = Math.floor(p.y / T), y1 = Math.floor((p.y + p.h - .01) / T);
  const tx = dx > 0 ? Math.floor((p.x + p.w) / T) : Math.floor(p.x / T);
  for (let y = y0; y <= y1; y++) if (fast(tx, y)) {
    // kanthjelp: treffer du så vidt toppen av en kant med føttene, løftes du opp på den
    const topp = y * T;
    if (y === y1 && p.y + p.h - topp < 9 && p.vy > -120 && !overlapp(p.x, topp - p.h - .01, p.w, p.h)) { p.y = topp - p.h - .01; if (p.vy > 0) p.vy = 0; return; }
    p.x = dx > 0 ? tx * T - p.w - .001 : (tx + 1) * T + .001; p.vx = 0; traffVegg(tx, y, dx > 0 ? -1 : 1); return;
  }
}
function flyttY(p, dy) {
  const forrigeBunn = p.y + p.h; p.y += dy;
  const x0 = Math.floor(p.x / T), x1 = Math.floor((p.x + p.w - .01) / T);
  if (dy > 0) { const ty = Math.floor((p.y + p.h) / T);
    for (let x = x0; x <= x1; x++) { const t = tile(x, ty);
      if (fast(x, ty) || (t === ONE && forrigeBunn <= ty * T + .5 && !I.down)) { p.y = ty * T - p.h; p.vy = 0; return 1; } }
    // kranlasten
    if (!I.down && forrigeBunn <= KRAN.y + .5 && p.y + p.h >= KRAN.y && p.x + p.w > KRAN.x + 2 && p.x < KRAN.x + KRAN.w - 2) { p.y = KRAN.y - p.h; p.vy = 0; p.paKran = true; return 1; }
  }
  else if (dy < 0) { const ty = Math.floor(p.y / T); let traff = false; for (let x = x0; x <= x1; x++) if (fast(x, ty)) traff = true;
    if (traff) {
      // hjørnekorrigering: glipper du et takhjørne med noen få piksler, skyves du forbi i stedet for å stoppe
      for (const n of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7]) if (!overlapp(p.x + n, p.y, p.w, p.h)) { p.x += n; return 0; }
      p.y = (ty + 1) * T; p.vy = 0; return -1; } }
  return 0;
}
function traffVegg(tx, ty, retning) {
  const t = tile(tx, ty);
  if (t === CUR && !S.ev.hansker) {
    hint('sperre', 'Strømførende sperre! Du trenger isolerte hansker.');
    gnister(tx * T + T / 2, P.y + P.h / 2, 5, 'c'); if (Math.random() < .3) lyd('bue');
    P.vx = retning * 220; P.vy = Math.min(P.vy, -140);
  }
}
