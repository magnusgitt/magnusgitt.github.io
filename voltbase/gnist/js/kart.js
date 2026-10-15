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
    [125, 19, 128, 19, LUKE],                              // luka ved hovedtavla åpnes når strømmen er tilbake
  ] },
  // ----- Område 2: Kabelkjelleren -----
  { navn: 'Kabelgangen', kart: [
    [123, 20, 130, 35, AIR],                               // sjakten ned fra luka, med hyller på sidene for veien opp igjen
    [129, 37, 130, 37, SOL], [123, 33, 124, 33, SOL], [129, 29, 130, 29, SOL], [123, 25, 124, 25, SOL], [129, 21, 130, 21, SOL],
    [98, 36, 135, 41, AIR],                                // selve kabelgangen
    [103, 38, 108, 38, ONE],                               // kabelbru
    [114, 42, 117, 43, AIR], [114, 43, 117, 43, VANN],     // vannfylt grop
    [98, 42, 101, 42, AIR],                                // åpning ned til pumpehallen
  ] },
  { navn: 'Pumpehallen', kart: [
    [72, 43, 101, 56, AIR],
    [77, 57, 96, 57, VANN],
    [92, 53, 94, 53, ONE], [87, 50, 89, 50, ONE], [82, 53, 84, 53, ONE], [79, 47, 80, 47, ONE],
  ] },
  { navn: 'Kanalen', kart: [
    [102, 47, 139, 56, AIR],
    [102, 57, 135, 57, VANN],
    [119, 53, 121, 57, SOL],                               // pilar å hvile på
  ] },
  { navn: 'Koblingsrommet', kart: [
    [140, 54, 140, 56, AIR],                               // døra inn (stenges når bossen våkner)
    [141, 43, 165, 56, AIR],
    [141, 57, 165, 57, BVANN],
    [141, 50, 142, 50, ONE], [164, 50, 165, 50, ONE],      // små hyller over vannet
    [166, 52, 166, 56, DOOR],                              // døra ut åpnes når Kortslutningen er slått
    [167, 30, 170, 56, AIR],                               // sjakt opp mot trafostasjonen
    [167, 52, 170, 52, ONE], [167, 48, 170, 48, ONE], [167, 44, 170, 44, ONE], [167, 40, 170, 40, ONE], [167, 36, 170, 36, ONE], [167, 32, 170, 32, ONE],
  ] },
  // ----- hemmeligheter i område 1 -----
  { navn: 'Takterrassen', kart: [
    [73, 0, 99, 2, AIR],                                   // åpen terrasse oppå trafohallen
    [73, 3, 79, 3, AIR], [73, 4, 79, 4, HAZ],              // grop med strømførende kabler: sving over den med kroken
  ] },
];
function byggKart() {
  map.fill(SOL);
  for (const o of OMRAADER) for (const [x0, y0, x1, y1, v] of o.kart) rect(x0, y0, x1, y1, v);
}
const iSkjult = (x, y) => x >= SKJULT.x0 && x <= SKJULT.x1 && y >= SKJULT.y0 && y <= SKJULT.y1;
// «Malt fast»: det som tegnes som stein. Det hemmelige rommet ser fast ut til det er funnet.
const erSol = (x, y) => { const t = tile(x, y); return t === SOL || t === BVANN || (!S.ev.hemmelig && iSkjult(x, y)); };
function beregnDyp() {
  const q = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const i = y * MW + x; if (!erSol(x, y)) { dyp[i] = 0; q.push(i); } else dyp[i] = 255; }
  let h = 0;
  while (h < q.length) { const i = q[h++], x = i % MW, y = (i / MW) | 0, d = dyp[i];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const j = ny * MW + nx; if (dyp[j] > d + 1) { dyp[j] = d + 1; q.push(j); } } }
}
const dypAt = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? 6 : Math.min(6, dyp[y * MW + x]);
const iKjeller2 = (x, y) => y >= 20 && x >= 70 && x <= 171 && !(y < 36 && (x < 123 || x > 130));
function inne(x, y) { return iKjeller2(x, y) || (y >= 24 && x <= 52) || (x >= 45 && x <= 48 && y >= 19) || (x >= 73 && x <= 101 && y >= 6 && y <= 18) || (x >= 105 && x <= 117 && y >= 19); }
const erHall = (x, y) => x >= 73 && x <= 101 && y >= 5 && y <= 19;
const erArena2 = (x, y) => x >= 140 && x <= 166 && y >= 42 && y <= 58;
function omraade(tx, ty) {
  if (iKjeller2(tx, ty)) {
    if (tx >= 167) return 'Stigesjakten';
    if (erArena2(tx, ty) && tx >= 141) return 'Koblingsrommet';
    if (ty >= 47 && tx >= 102) return 'Kanalen';
    if (ty >= 43) return 'Pumpehallen';
    return 'Kabelgangen';
  }
  if (erHall(tx, ty) && tx >= 74) return 'Trafohallen';
  if (tx >= 73 && tx <= 100 && ty <= 4) return 'Takterrassen';
  if (tx >= 102) return 'Sjakten';
  if (inne(tx, ty)) return 'Kjelleren';
  if (tx >= 39) return 'Stillaset';
  return 'Byggeplassen';
}

// ---------- objekter ----------
// nye sjekkpunkt legges alltid til bakerst, så indeksene i gamle lagringer stemmer
const SJEKK = [{ x: 4, y: 23 }, { x: 40, y: 31 }, { x: 69, y: 18 }, { x: 103, y: 18 },
  { x: 132, y: 41 }, { x: 99, y: 56 }, { x: 137, y: 56 }, { x: 168, y: 56 }];
// De 21 første ligger i samme rekkefølge som i første versjon, så lagrede lysorber stemmer fortsatt.
const ORBER = [[8,22],[19,19],[27,22],[31,21],[17,29],[23,28],[33,28],[38,30],[46,25],[47,21],[43,16],[51,13],[57,9],[51,5],[60,1],[66,10],[70,16],[87,7],[110,12],[114,10],[124,9],
  [10,30],[4,29],[7,29],[67,6],[71,4],
  // område 2: kabelkjelleren
  [106,37],[121,40],[100,39],[116,41],[93,52],[88,48],[83,52],[75,46],[107,52],[117,50],[120,51],[128,50],[133,52],[153,53],[168,46],[168,38],
  // takterrassen
  [84,1],[92,1],[98,1]];
const IKON = {
  dobbel: '<svg viewBox="0 0 24 24"><path d="M6 2h5v10l8 2c1.7.4 3 1.9 3 3.7V20H2v-3l4-1z"/></svg>',
  hansker: '<svg viewBox="0 0 24 24"><path d="M7 22v-5L4 12c-.8-1.2.9-2.6 2-1.6L8 12V4a1.4 1.4 0 012.8 0V10h.4V2.6a1.4 1.4 0 012.8 0V10h.4V3.6a1.4 1.4 0 012.8 0V11h.4V6a1.4 1.4 0 012.8 0v9c0 3-2 5-3 7z"/></svg>',
  stot: '<svg viewBox="0 0 24 24"><path d="M14 1L4 14h7l-2 9 11-14h-7z"/></svg>',
  krok: '<svg viewBox="0 0 24 24"><path d="M12 1a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V14a5 5 0 01-10 0v-2h3v2a2 2 0 004 0V8.5A4 4 0 0112 1zm0 2.6a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8zM19 9h3v13h-3z"/></svg>',
};
const FUNN = [
  { id: 'dobbel', x: 44, y: 31, navn: 'Stigesko', tekst: 'Du kan hoppe en gang til i lufta.', pc: 'Trykk <b>Mellomrom</b> igjen i lufta', mob: 'Trykk <b>Hopp</b> igjen i lufta' },
  { id: 'hansker', x: 61, y: 2, navn: 'Isolerte hansker', tekst: 'Du tåler strømførende sperrer.', pc: 'Gå rett gjennom den blå sperren', mob: 'Gå rett gjennom den blå sperren' },
  { id: 'stot', x: 87, y: 18, boss: true, navn: 'Strømstøt', tekst: 'Kast deg fremover med et lyn. Ett støt per hopp.', pc: 'Trykk <b>Shift</b> eller <b>X</b>', mob: 'Trykk <b>Støt</b>' },
  { id: 'liv', x: 5, y: 31, navn: 'Livsgnist', liten: true },
  { id: 'krok', x: 74, y: 55, navn: 'Kabeltrommel', tekst: 'Kast kabelen opp i en krok og sving deg over vann og avgrunner.',
    pc: 'Hold <b>C</b> (eller <b>E</b>) nær en krok, slipp for å fly', mob: 'Hold <b>Krok</b> nær en krok, slipp for å fly' },
  { id: 'liv2', x: 153, y: 55, boss2: true, navn: 'Livsgnist', liten: true },
];
// krokene du kan svinge deg i med kabeltrommelen (rutekoordinater; kroken henger i overkanten av ruta)
const KROKER = [[105, 47], [110, 47], [115, 47], [120, 47], [125, 47], [130, 47], [134, 47],
  [147, 46], [153, 46], [159, 46],
  [76, 0]];                                                // over gropa på takterrassen
// verksteder ved noen sjekkpunkt (indekser i SJEKK): bruk lysorbene på oppgraderinger
const VERKSTED = [0, 4];
const OPPGRADERINGER = [
  { id: 'stot2', navn: 'Lengre strømstøt', tekst: 'Støtet tar deg en god del lenger.', pris: 6 },
  { id: 'liv3', navn: 'Ekstra livsgnist', tekst: 'Du tåler ett treff mer.', pris: 8 },
  { id: 'lykt', navn: 'Sterkere hodelykt', tekst: 'Lyser opp mer av mørket rundt deg.', pris: 5 },
  { id: 'kabel', navn: 'Lengre kabel', tekst: 'Kabeltrommelen når kroker lenger unna.', pris: 6 },
];
// fagkort: korte fakta fra elfaget, gjemt rundt på kartet. Nye legges alltid til bakerst.
const FAG = [
  { x: 25, y: 20, tittel: 'De fem sikkerhetsreglene', tekst: 'Før arbeid på et anlegg: 1) koble fra, 2) sikre mot innkobling, 3) kontroller at det er spenningsløst, 4) jord og kortslutt, 5) beskytt mot spenningsførende deler i nærheten.' },
  { x: 12, y: 29, tittel: 'Jordfeilbryter', tekst: 'Stikkontakter til og med 32 A skal ha jordfeilvern på høyst 30 mA. Det bryter strømmen før en feilstrøm gjennom kroppen blir livsfarlig.' },
  { x: 62, y: 15, tittel: 'Test spenningstesteren', tekst: 'Kontroller at spenningstesteren virker på en kjent spenningskilde, både før og etter at du måler. Ellers kan en død tester lure deg.' },
  { x: 90, y: 1, tittel: 'Lysbue', tekst: 'En lysbue kan bli flere tusen grader varm og sende ut smeltet metall og trykkbølge. Riktig verneutstyr og avstand redder liv.' },
  { x: 82, y: 11, tittel: 'Fargene i kabelen', tekst: 'Grønn/gul er alltid beskyttelsesleder (jord). Blå brukes til nøytralleder. Fasene er brun, svart og grå.' },
  { x: 127, y: 16, tittel: 'Kursfortegnelse', tekst: 'Hver kurs i sikringsskapet skal merkes, så alle kan se hva den forsyner. Da går det raskt og trygt å koble ut riktig kurs.' },
  { x: 3, y: 30, tittel: 'IT-nett', tekst: 'Mange norske boliger har IT-nett med 230 V mellom fasene. Ved første jordfeil går strømmen ofte ikke, så feilen må finnes og rettes.' },
  { x: 126, y: 27, tittel: 'Isolasjonsmåling', tekst: 'For vanlige kurser måles isolasjonen med 500 V likespenning. Resultatet skal være minst 1 MΩ.' },
  { x: 125, y: 39, tittel: 'Kontinuitet i jordlederen', tekst: 'Mål at beskyttelseslederen henger sammen hele veien fra tavla til hvert punkt. En brutt jord gir ingen beskyttelse.' },
  { x: 93, y: 49, tittel: 'Våtrom', tekst: 'Baderom deles i sone 0, 1 og 2 etter avstand fra badekar og dusj. Jo nærmere vannet, jo strengere krav til utstyret.' },
  { x: 127, y: 51, tittel: 'Arbeid under spenning', tekst: 'Arbeid under spenning (AUS) krever egen opplæring, egne rutiner og riktig utstyr. Ellers skal anlegget gjøres spenningsløst.' },
  { x: 168, y: 34, tittel: 'Strøm i vann', tekst: 'Vann og fukt leder strøm og gjør feil farligere. Derfor har utstyr i fuktige rom høyere kapslingsgrad (IP-klasse).' },
];
const BRYTERE = [{ x: 78, y: 14, av: false }, { x: 87, y: 9, av: false }, { x: 96, y: 14, av: false }];
const TAVLE = { x: 123, y: 17 };
// fiender: gnistlus går fram og tilbake, svevegnist flyr i en bue, releet skyter gnister når du er nær
const FIENDE_DEF = [{ x0: 22, x1: 31, y: 23 }, { x0: 36, x1: 43, y: 31 }, { x0: 55, x1: 67, y: 18 },
  { x0: 119, x1: 129, y: 41 }, { type: 'sveve', x: 109, y: 38.5, ax: 3, ay: 1 }, { type: 'sveve', x: 86, y: 46, ax: 4, ay: 1.2 },
  { type: 'rele', x: 72, y: 56 }];
const LYSBUE = { x: 28, y0: 27, y1: 31, per: 3.2 };   // tidsstyrt lysbue i kjelleren
const KRAN = { x0: 65 * T, x1: 69 * T, y: 8 * T, w: 3 * T, x: 65 * T, dx: 0, t: 0 };
const hazListe = [];
const KJELLERLYS = [[16, 27], [29, 27], [40, 27], [6, 28],   // svake taklamper i kjelleren
  [104, 36], [112, 36], [120, 36], [131, 36], [76, 43], [85, 43], [94, 43], [108, 47], [124, 47], [137, 47], [168, 31]];
const vannListe = [];

// ---------- kollisjon ----------
function fast(tx, ty) { const t = tile(tx, ty); return t === SOL || t === DOOR || t === LUKE || t === BVANN || (t === CUR && !S.ev.hansker); }
const erVann = t => t === VANN || t === BVANN;
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
