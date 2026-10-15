// Strømmen må på – verden: kart, områder, overganger og gjenstander på kartet.
'use strict';
// Fliser:
// , gress  . grus  o gulv  b betong  t takpapp  # vegg  w vindu  F gjerde  P paller  C container  T tre  D dør (åpen)
// k kabel  L kabel foran døra  N trapp ned  U trapp opp  V varebil  J bajamaja  R kabeltrommel  S stillas  ~ vannpytt
// Q trafokiosk  K kioskdør  H hovedtavle  E jordingsskinne  W skjult luke  X transformator  Y høyspentfelt  M lavspenttavle
// A ventilasjonsaggregat  e takkant  = kabelbro  Z åpen sjakt  O utgang
const SOLIDE = new Set(['#', 'w', 'F', 'P', 'C', 'T', 'V', 'H', 'J', 'R', 'S', 'Q', 'X', 'Y', 'M', 'A', 'e', '=']);

let kart = null;
const lagKart = (w, h, ch) => Array.from({ length: h }, () => new Array(w).fill(ch));
const fyllI = (k) => (x0, y0, x1, y1, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) k[y][x] = ch; };

function byggUte() {
  const k = lagKart(56, 40, ','), fyll = fyllI(k), W = 56, H = 40;
  fyll(0, 0, W - 1, 0, 'F'); fyll(0, H - 1, W - 1, H - 1, 'F'); fyll(0, 0, 0, H - 1, 'F'); fyll(W - 1, 0, W - 1, H - 1, 'F');
  // Brakkeriggen (start)
  fyll(1, 15, 12, 28, '.');
  fyll(2, 16, 10, 21, '#'); fyll(3, 17, 9, 20, 'o'); k[21][6] = 'D'; k[16][4] = 'w'; k[16][8] = 'w';
  fyll(1, 1, 12, 14, ','); [[3, 4], [7, 3], [10, 7], [4, 10], [8, 12], [2, 13], [11, 2]].forEach(([x, y]) => k[y][x] = 'T');
  [[2, 24], [11, 26], [3, 27]].forEach(([x, y]) => k[y][x] = 'T');
  // Gjerde med port
  fyll(13, 1, 13, 38, 'F'); k[23][13] = '.';
  // Containerplassen
  fyll(14, 14, 27, 28, '.');
  fyll(15, 16, 17, 17, 'C'); fyll(22, 15, 25, 16, 'C'); fyll(15, 22, 16, 25, 'C'); fyll(20, 20, 23, 21, 'C'); fyll(25, 23, 26, 26, 'C');
  fyll(18, 25, 19, 25, 'P');
  // Kabelfeltet
  fyll(14, 13, 27, 13, 'F'); fyll(14, 6, 17, 12, 'P'); fyll(22, 6, 27, 12, 'P'); fyll(18, 6, 21, 13, 'k');
  // Øverst
  fyll(14, 1, 27, 5, '.'); fyll(20, 2, 21, 3, 'C');
  // Gjerde mot bygg B, åpning øverst
  fyll(28, 1, 28, 28, 'F'); fyll(28, 2, 28, 4, '.');
  // Bygg B
  fyll(29, 1, 38, 28, '.');
  fyll(30, 8, 37, 19, '#'); fyll(31, 9, 36, 18, 'o'); k[19][33] = 'D'; fyll(32, 20, 34, 20, 'L'); k[8][32] = 'w'; k[8][35] = 'w';
  fyll(30, 7, 37, 7, 'S');
  fyll(31, 24, 32, 25, 'P'); fyll(35, 26, 36, 27, 'C');
  k[17][36] = 'N'; k[17][31] = 'U';
  fyll(35, 2, 37, 3, 'V');
  // Riggplassen øst for bygg B
  fyll(39, 1, 39, 28, 'F'); fyll(39, 12, 39, 14, '.');
  fyll(40, 1, 54, 28, '.');
  fyll(42, 2, 50, 7, '#'); fyll(43, 3, 49, 6, 'o'); k[7][46] = 'D'; k[7][49] = 'D'; k[2][44] = 'w'; k[2][48] = 'w';            // kantina
  fyll(51, 2, 54, 7, '#'); fyll(52, 3, 53, 6, 'o'); k[7][52] = 'D';                                           // garderoben
  fyll(41, 10, 49, 15, '#'); fyll(42, 11, 48, 14, 'o'); fyll(45, 11, 45, 14, '#'); k[12][45] = 'D';            // kontor og møterom
  k[15][43] = 'D'; k[15][47] = 'D'; k[10][43] = 'w'; k[10][47] = 'w';
  fyll(51, 10, 53, 10, 'J'); k[12][51] = '~';                                                                  // bajamajaer
  fyll(51, 14, 53, 15, 'P');
  fyll(42, 19, 45, 20, 'C'); fyll(50, 19, 53, 20, 'C'); fyll(40, 24, 41, 27, 'P');
  [[54, 27], [47, 27]].forEach(([x, y]) => k[y][x] = 'T');
  // Sørtomta
  fyll(0, 29, W - 1, 29, 'F'); fyll(33, 29, 34, 29, '.'); fyll(47, 29, 48, 29, '.');
  fyll(14, 30, 54, 38, '.');
  [[3, 31], [8, 33], [5, 36], [10, 37], [2, 34]].forEach(([x, y]) => k[y][x] = 'T');
  fyll(16, 31, 24, 36, '#'); fyll(17, 32, 23, 35, 'o'); k[34][24] = 'D'; k[31][19] = 'w'; k[31][22] = 'w'; // fagprøvebrakka
  [[27, 32], [29, 32], [27, 35], [29, 35], [31, 33]].forEach(([x, y]) => k[y][x] = 'R');                         // kabeltromler
  fyll(35, 31, 38, 32, 'C'); fyll(36, 36, 38, 37, 'P');
  fyll(44, 33, 50, 37, 'Q'); k[33][47] = 'K';                                                                  // trafokiosken
  return k;
}

function byggKjeller() {
  const k = lagKart(32, 22, '#'), fyll = fyllI(k);
  fyll(1, 1, 8, 7, 'b'); k[1][2] = 'U';            // trapperommet
  fyll(9, 3, 20, 4, 'b');                           // gang øst
  fyll(21, 1, 30, 8, 'b'); fyll(23, 3, 24, 4, 'P'); fyll(27, 5, 28, 6, 'P'); // lager
  fyll(3, 8, 4, 14, 'b');                           // gang sør
  fyll(1, 15, 14, 20, 'b'); fyll(6, 15, 9, 20, 'k'); fyll(12, 19, 13, 19, 'P'); // kabelrommet
  fyll(15, 17, 20, 17, 'b');                        // gang til tavlerommet (døra står på 20,17)
  fyll(21, 12, 30, 20, 'b'); fyll(23, 11, 28, 11, 'H'); k[15][23] = '#'; k[15][28] = '#'; // tavlerommet
  k[13][22] = 'E'; k[19][29] = 'E'; k[17][25] = 'E';
  fyll(29, 9, 29, 11, 'W');                         // skjult luke mellom lageret og tavlerommet
  return k;
}

function byggEtg2() {
  const k = lagKart(30, 20, '#'), fyll = fyllI(k);
  fyll(1, 9, 28, 10, 'b'); k[10][1] = 'N';
  fyll(1, 1, 8, 7, 'o'); k[8][4] = 'D'; k[0][3] = 'w'; k[0][6] = 'w';          // leilighet 201
  fyll(10, 1, 16, 7, 'b'); k[8][13] = 'D';                                     // teknisk rom
  fyll(18, 1, 20, 7, 'Z'); k[8][19] = 'Z';                                     // sjakt
  fyll(22, 1, 28, 7, 'o'); k[8][25] = 'D'; k[0][24] = 'w'; k[0][27] = 'w';     // leilighet 202
  fyll(1, 12, 9, 18, 'o'); k[11][5] = 'D'; k[19][3] = 'w'; k[19][7] = 'w';     // leilighet 203
  fyll(11, 12, 15, 18, 'b'); k[11][13] = 'D'; k[16][13] = 'U';                 // stigerom med takluke
  fyll(17, 12, 28, 18, 'o'); k[11][22] = 'D'; k[19][20] = 'w'; k[19][25] = 'w'; // leilighet 204
  return k;
}

function byggTak() {
  const k = lagKart(26, 18, 't'), fyll = fyllI(k);
  fyll(0, 0, 25, 0, 'e'); fyll(0, 17, 25, 17, 'e'); fyll(0, 0, 0, 17, 'e'); fyll(25, 0, 25, 17, 'e');
  k[2][2] = 'N';
  fyll(8, 3, 11, 5, 'A'); fyll(17, 11, 19, 13, 'A');
  fyll(3, 9, 22, 9, '='); k[9][6] = 't'; k[9][15] = 't';
  return k;
}

function byggTrafo() {
  const k = lagKart(20, 13, '#'), fyll = fyllI(k);
  fyll(1, 1, 18, 11, 'b');
  fyll(1, 1, 6, 3, 'Y'); fyll(8, 1, 11, 3, 'X'); fyll(13, 1, 18, 2, 'M');
  k[12][9] = 'O';
  return k;
}

// ── Områder ─────────────────────────────────────────────────────────
const OMR = {
  ute: { navn: 'Byggeplassen', kart: byggUte(), tema: 'ute', start: [6, 22, 'opp'], natt: true },
  kjeller: { navn: 'Kjelleren, bygg B', kart: byggKjeller(), tema: 'kjeller', start: [2, 2, 'ned'], mork: () => !lagret.flagg.ferdig2 },
  etg2: { navn: 'Bygg B, 2. etasje', kart: byggEtg2(), tema: 'bolig', start: [2, 10, 'h'] },
  tak: { navn: 'Taket på bygg B', kart: byggTak(), tema: 'tak', start: [3, 2, 'ned'], natt: true },
  trafo: { navn: 'Trafokiosken', kart: byggTrafo(), tema: 'trafo', start: [9, 11, 'opp'], mork: () => !lagret.flagg.trafoFerdig, morkStyrke: 0.75 },
};
// Overganger: står man på ruta, havner man i et annet område. stengt() gir en melding når veien er stengt.
const PORTER = {
  ute: [
    { x: 36, y: 17, til: 'kjeller', tx: 2, ty: 2, ret: 'ned', stengt: () => !lagret.flagg.ferdig && 'Trappa til kjelleren. Stengt til strømmen i bygg B er fikset.' },
    { x: 31, y: 17, til: 'etg2', tx: 2, ty: 10, ret: 'h' },
    { x: 47, y: 33, til: 'trafo', tx: 9, ty: 11, ret: 'opp', stengt: () => !lagret.flagg.trafoApen && 'Trafokiosken er låst. Byggelederen har nøkkelen.' },
  ],
  kjeller: [{ x: 2, y: 1, til: 'ute', tx: 36, ty: 16, ret: 'opp' }],
  etg2: [
    { x: 1, y: 10, til: 'ute', tx: 32, ty: 17, ret: 'h' },
    { x: 13, y: 16, til: 'tak', tx: 3, ty: 3, ret: 'ned', stengt: () => !lagret.ting.sele && 'Takluka. Uten fallsikringssele kommer du ikke opp. Hilde eller Grete kan hjelpe.' },
  ],
  tak: [{ x: 2, y: 2, til: 'etg2', tx: 13, ty: 15, ret: 'opp' }],
  trafo: [{ x: 9, y: 12, til: 'ute', tx: 47, ty: 32, ret: 'opp' }],
};
const porterStengt = (x, y) => { const p = (PORTER[omr] || []).find((q) => q.x === x && q.y === y); return p && p.stengt ? p.stengt() : false; };
const portPaa = (x, y) => (PORTER[omr] || []).find((q) => q.x === x && q.y === y);

let omr = 'ute';
let MW = 56, MH = 40;

// Spenningssatte kabler (stien gjennom er trygg)
const TRYGG = new Set(['19,13', '19,12', '19,11', '20,11', '21,11', '21,10', '21,9', '20,9', '19,9', '18,9', '18,8', '18,7', '19,7', '19,6']);
const TRYGG_K = new Set(['6,16', '7,16', '7,17', '7,18', '8,18', '9,18']);
const levende = (x, y) => kart[y][x] === 'k' && (omr === 'kjeller' ? !TRYGG_K.has(x + ',' + y)
  : !TRYGG.has(x + ',' + y) && ((x * 7 + y * 13) % 5 !== 0));

// ── Gjenstander og personer per område ─────────────────────────────
// type: npc, kiste, skap, kaffe, skilt, dor, funn (oppdragsting), merke (noe å undersøke), lampe, benk, gjenvinning, skrap
// gjennom: true gjør at man kan gå over den.
function objekterFor(id) {
  const f = lagret.flagg;
  if (id === 'kjeller') return [
    { id: 'k_lykt', type: 'kiste', tx: 29, ty: 2, ting: 'lykt' },
    { id: 'kaffe2', type: 'kaffe', tx: 8, ty: 1 },
    { id: 'tavledor', type: 'dor', tx: 20, ty: 17, borte: !!f.dorAapen },
    { id: 'skilt4', type: 'skilt', tx: 5, ty: 2, tekst: ['Kjeller', 'Lyset er gått. Hodelykta ligger visst på lageret øst for gangen.'] },
    { id: 'skilt5', type: 'skilt', tx: 2, ty: 14, tekst: ['⚠ Kabelrom', 'Kablene på gulvet er spenningssatt. Bruk spenningstesteren!'] },
    { id: 'f_multimeter', type: 'funn', tx: 22, ty: 2, funn: 'multimeter' },
    { id: 'skrap_k1', type: 'skrap', tx: 12, ty: 15 },
    { id: 'skrap_k2', type: 'skrap', tx: 26, ty: 8 },
  ];
  if (id === 'etg2') return [
    { id: 'sondre', type: 'npc', tx: 5, ty: 4, navn: 'Sondre (lærling)', retning: 'ned' },
    { id: 'relepanel', type: 'merke', tx: 2, ty: 1, merke: 'relepanel', gjennom: false },
    { id: 'lampe201', type: 'merke', tx: 7, ty: 2, merke: 'lampe201', gjennom: false },
    { id: 'f2', type: 'skap', tx: 13, ty: 1, navn: 'Fordeling 2. etasje' },
    { id: 'skjultboks', type: 'merke', tx: 16, ty: 4, merke: 'skjultboks', gjennom: false },
    { id: 'kabelbro_tom', type: 'merke', tx: 14, ty: 9, merke: 'kabelbro_tom', gjennom: true },
    { id: 'stikk1', type: 'merke', tx: 3, ty: 12, merke: 'stikk', gjennom: true },
    { id: 'stikk2', type: 'merke', tx: 8, ty: 17, merke: 'stikk', gjennom: true },
    { id: 'stikk3', type: 'merke', tx: 18, ty: 12, merke: 'stikk', gjennom: true },
    { id: 'stikk4', type: 'merke', tx: 27, ty: 15, merke: 'stikk', gjennom: true },
    { id: 'stikk5', type: 'merke', tx: 24, ty: 18, merke: 'stikk', gjennom: true },
    { id: 'f_avbiter', type: 'funn', tx: 27, ty: 2, funn: 'avbiter' },
    { id: 'kaffe4', type: 'kaffe', tx: 28, ty: 17 },
    { id: 'skilt7', type: 'skilt', tx: 3, ty: 9, tekst: ['2. etasje', 'Leilighet 201 til 204. Takluka er i stigerommet. Fallsikring påbudt.', '«Ferdigstillelse fredag.» Hvilken fredag er ikke spesifisert.'] },
    { id: 'skrap_e1', type: 'skrap', tx: 11, ty: 6 },
  ];
  if (id === 'tak') return [
    { id: 'arbeidsbryter', type: 'merke', tx: 12, ty: 4, merke: 'arbeidsbryter', gjennom: false },
    { id: 'maakereir', type: 'merke', tx: 22, ty: 15, merke: 'maakereir', gjennom: false },
    { id: 'f_vater', type: 'funn', tx: 23, ty: 3, funn: 'vater' },
    { id: 'skilt8', type: 'skilt', tx: 4, ty: 3, tekst: ['Tak', 'Bruk sele. Ikke mat måkene. De vet hvor du bor.'] },
    { id: 'skrap_t1', type: 'skrap', tx: 20, ty: 6 },
  ];
  if (id === 'trafo') return [
    { id: 'tr_bryter', type: 'merke', tx: 4, ty: 5, merke: 'tr1', gjennom: false },
    { id: 'tr_laas', type: 'merke', tx: 6, ty: 5, merke: 'tr2', gjennom: false },
    { id: 'tr_maal', type: 'merke', tx: 10, ty: 5, merke: 'tr3', gjennom: false },
    { id: 'tr_jord', type: 'merke', tx: 12, ty: 5, merke: 'tr4', gjennom: false },
    { id: 'tr_skjerm', type: 'merke', tx: 3, ty: 8, merke: 'tr5', gjennom: false },
    { id: 'skilt9', type: 'skilt', tx: 16, ty: 9, tekst: ['De fem sikkerhetsreglene', '1. Frakoble. 2. Sikre mot innkobling. 3. Kontrollere spenningsløshet.', '4. Jorde og kortslutte. 5. Beskytte mot nærliggende spenningssatte deler.', 'Følg dem i riktig rekkefølge. Hver gang.'] },
  ];
  // Ute
  const liste = [
    { id: 'byggeleder', type: 'npc', tx: 5, ty: 18, navn: 'Byggeleder Bjørn', retning: 'ned' },
    { id: 'hilde', type: 'npc', tx: 13, ty: 23, navn: 'Hilde (HMS)', retning: 'v' },
    { id: 'kevin', type: 'npc', tx: 31, ty: 23, navn: 'Kevin (lærling)', retning: 'ned' },
    { id: 'kaffe', type: 'kaffe', tx: 9, ty: 17 },
    { id: 'k_hjelm', type: 'kiste', tx: 3, ty: 17, ting: 'hjelm' },
    { id: 'k_tester', type: 'kiste', tx: 26, ty: 27, ting: 'tester' },
    { id: 'k_stang', type: 'kiste', tx: 15, ty: 2, ting: 'stang' },
    { id: 'k_laas', type: 'kiste', tx: 26, ty: 2, ting: 'laas' },
    { id: 'k_iso', type: 'kiste', tx: 31, ty: 10, ting: 'iso' },
    { id: 's1', type: 'skap', tx: 37, ty: 22, navn: 'Byggestrømskap' },
    { id: 's2', type: 'skap', tx: 35, ty: 9, navn: 'Fordeling bygg B' },
    { id: 'gipsvegg', type: 'merke', tx: 36, ty: 12, merke: 'gipsvegg', gjennom: false },
    { id: 'skilt1', type: 'skilt', tx: 18, ty: 14, tekst: ['⚠ FARE', 'Kablene i feltet kan være spenningssatt. Kontroller spenningsløshet før du går over!'] },
    { id: 'skilt2', type: 'skilt', tx: 12, ty: 22, tekst: ['Byggeplass', 'Ingen adgang uten hjelm og vernesko.', 'DAGER SIDEN SISTE ULYKKE: 3. Rekorden er 4.'] },
    { id: 'skilt3', type: 'skilt', tx: 29, ty: 21, tekst: ['Bygg B', 'Kabel foran døra. Frakoble i byggestrømskapet først.', 'Kevin har ansvar for byggestrømmen. Dette er registrert som en risiko.'] },
    { id: 'grete', type: 'npc', tx: 34, ty: 3, navn: 'Grete (grossist)', retning: 'ned', dag: true },
    { id: 'tore', type: 'npc', tx: 48, ty: 17, navn: 'Tore (tømrer)', retning: 'v', vandre: [46, 16, 49, 18] },
    { id: 'roger', type: 'npc', tx: 44, ty: 4, navn: 'Roger (rørlegger)', retning: 'ned', vandre: [43, 3, 47, 5] },
    { id: 'mats', type: 'npc', tx: 45, ty: 25, navn: 'Mats (montør)', retning: 'ned', vandre: [43, 23, 48, 26] },
    { id: 'vidar', type: 'npc', tx: 46, ty: 30, navn: 'Vidar (vekter)', retning: 'ned', natt: true },
    { id: 'sensor', type: 'npc', tx: 20, ty: 33, navn: 'Sensor Solveig', retning: 'h' },
    { id: 'fagdor', type: 'dor', tx: 24, ty: 34, borte: !!f.fagApen },
    { id: 'kaffe3', type: 'kaffe', tx: 48, ty: 3 },
    { id: 'k_trommel', type: 'kiste', tx: 43, ty: 21, ting: 'trommel' },
    { id: 'oppslag', type: 'skilt', tx: 46, ty: 3, tekst: ['Oppslagstavla', 'DAGER SIDEN SISTE ULYKKE: 3. Rekorden er 4.',
      'Kurset i førstehjelp er utsatt. Instruktøren fikk støt.', 'Avviket er lukket. Problemet består.',
      'Til den som tok yoghurten min: Jeg vet hvem du er. Hilsen Hilde (HMS).',
      'Husk å sortere avfallet! Hilsen ledelsen. (Alt havner i samme container uansett.)'] },
    { id: 'skilt6', type: 'skilt', tx: 40, ty: 11, tekst: ['Riggplassen', 'Kantine, garderobe, kontor og bajamajaer. Du kjenner lukta av alle fire.'] },
    { id: 'plan', type: 'merke', tx: 42, ty: 11, merke: 'plan', gjennom: false },
    { id: 'tavle', type: 'merke', tx: 48, ty: 11, merke: 'tavle', gjennom: false },
    { id: 'sofa', type: 'merke', tx: 53, ty: 6, merke: 'sofa', gjennom: false },
    { id: 'skap_g', type: 'merke', tx: 52, ty: 3, merke: 'garderobeskap', gjennom: false },
    { id: 'kjoleskap', type: 'merke', tx: 49, ty: 4, merke: 'kjoleskap', gjennom: false },
    { id: 'benk', type: 'benk', tx: 51, ty: 21 },
    { id: 'gjenvinning', type: 'gjenvinning', tx: 47, ty: 20 },
    { id: 'skjote', type: 'merke', tx: 50, ty: 12, merke: 'feil_skjote', gjennom: false },
    { id: 'stige', type: 'merke', tx: 38, ty: 10, merke: 'feil_stige', gjennom: false },
    { id: 'pallut', type: 'merke', tx: 49, ty: 8, merke: 'feil_nodutgang', gjennom: false },
    { id: 'grofta', type: 'merke', tx: 40, ty: 35, merke: 'feil_grofta', gjennom: false },
    { id: 'skrap_u1', type: 'skrap', tx: 16, ty: 27 }, { id: 'skrap_u2', type: 'skrap', tx: 44, ty: 22 },
    { id: 'skrap_u3', type: 'skrap', tx: 30, ty: 37 }, { id: 'skrap_u4', type: 'skrap', tx: 53, ty: 26 },
    { id: 'skrap_u5', type: 'skrap', tx: 22, ty: 4 },
    ...[[12, 25], [27, 14], [38, 21], [29, 5], [40, 8], [54, 9], [32, 30], [43, 30], [25, 38], [14, 33]].map(([x, y], i) => ({ id: 'lampe' + i, type: 'lampe', tx: x, ty: y })),
  ];
  if (f.kevinLurt && !f.kevinFunnet) liste.find((o) => o.id === 'kevin').borte = true;
  if (f.hildeFlyttet) { const h = liste.find((o) => o.id === 'hilde'); h.tx = 12; h.ty = 24; h.retning = 'h'; }
  return liste;
}

const MYNTER = {
  ute: [[20, 18], [24, 18], [14, 27], [17, 3], [23, 4], [30, 3], [36, 5], [32, 27], [5, 26], [9, 24],
    [40, 13], [47, 11], [52, 5], [42, 26], [50, 25], [53, 22], [45, 17], [15, 31], [26, 37], [40, 31], [52, 36], [18, 38]],
  kjeller: [[6, 3], [12, 4], [18, 3], [22, 7], [26, 2], [30, 8], [3, 11], [2, 19], [12, 15], [13, 20], [17, 17], [29, 19]],
  etg2: [[6, 6], [12, 3], [24, 4], [8, 10], [20, 9], [3, 15], [15, 13], [25, 13], [20, 17]],
  tak: [[5, 6], [14, 3], [21, 4], [4, 14], [12, 12], [22, 11], [15, 15]],
  trafo: [[2, 10], [17, 10], [15, 7]],
};
const MYNT_PREFIKS = { ute: 'm', kjeller: 'km', etg2: 'em', tak: 'tm', trafo: 'rm' };
const GNISTER = {
  ute: [[19, 18], [24, 19], [17, 27], [23, 2], [24, 4], [25, 3], [33, 4], [36, 24], [46, 18], [51, 22], [47, 25], [20, 37], [34, 35], [52, 31]],
  kjeller: [[15, 4], [25, 7], [28, 2], [11, 18], [3, 12]],
  etg2: [[20, 10], [25, 15]],
  tak: [],
  trafo: [],
};
const GNIST_PREFIKS = { ute: 'g', kjeller: 'kg', etg2: 'eg', tak: 'tg', trafo: 'rg' };
