// Strømmen må på – spillmotoren: bevegelse, kollisjon, bosskamp, dag og natt, tyver, tegning og menyer.
'use strict';

let tilstand = 'meny', tid = 0;
let objekter = [], mynter = [], skjulte = [], gnister = [], boss = null, skudd = [], gnistRegn = [], tyver = [], maaker = [], flyt = [];
let kamX = 0, kamY = 0;

// ── Spilleren ───────────────────────────────────────────────────────
const sp = { x: 6 * TS + 3, y: 22 * TS + 6, w: 10, h: 8, retning: 'opp', steg: 0, gaar: false, liv: 6, usarbar: 0, kb: null, zap: 0 };
sp.liv = maksLiv();
function plasser(tx, ty, retning) { sp.x = tx * TS + 3; sp.y = ty * TS + 6; if (retning) sp.retning = retning; sp.kb = null; }
const spTx = () => Math.floor((sp.x + sp.w / 2) / TS), spTy = () => Math.floor((sp.y + sp.h / 2) / TS);

// s1 = byggestrømmen til bygg B (på = farlig kabel foran døra)
let s1Paa = !lagret.flagg.s1Av;
let kevin = { aktiv: false, timer: 0, fase: 0 };

// ── Dag og natt ─────────────────────────────────────────────────────
const minutt = () => Math.floor(lagret.klokke) % 1440;
const erNatt = () => minutt() >= 21 * 60 || minutt() < 7 * 60;
function nattFaktor() {
  const m = minutt();
  if (m >= 19 * 60 && m < 21 * 60) return (m - 19 * 60) / 120;
  if (m >= 21 * 60 || m < 6 * 60) return 1;
  if (m < 7 * 60) return 1 - (m - 6 * 60) / 60;
  return 0;
}
const synlig = (o) => !o.borte && !(o.dag && erNatt()) && !(o.natt && !erNatt());

// Flytende tekst over spilleren (+XP, +Cu, rykte)
function flyteTekst(tekst, farge = '#ffffff') {
  const i = flyt.filter((f) => f.t > 1.1).length;
  flyt.push({ tekst, farge, x: sp.x + sp.w / 2, y: sp.y - 14 - i * 8, t: 1.4 });
}

// ── Områder ─────────────────────────────────────────────────────────
const SKJULTE = { ute: [[15, 37], [53, 30], [42, 38], [2, 26]], kjeller: [[30, 1], [1, 20]], etg2: [[28, 1], [1, 18]], tak: [[24, 16], [1, 1]], trafo: [] };
function lagObjekter() {
  objekter = objekterFor(omr);
  for (const o of objekter) {
    o.px = o.tx * TS; o.py = o.ty * TS;
    if ((o.type === 'skrap' || o.type === 'funn') && lagret.aapnet[o.id]) o.borte = true;
    if (o.type === 'funn' && (lagret.ting[o.funn] || lagret.flagg['levert_' + o.funn])) o.borte = true;
    if (['skrap', 'funn', 'spor'].includes(o.type)) o.gjennom = true;
    if (o.vandre) o.vt = 1 + Math.random() * 3;
  }
}
function lagMynter() {
  const p = MYNT_PREFIKS[omr];
  mynter = (MYNTER[omr] || []).map(([x, y]) => ({ x: x * TS + 8, y: y * TS + 8, id: p + x + ',' + y })).filter((m) => !lagret.aapnet[m.id]);
  skjulte = (SKJULTE[omr] || []).map(([x, y]) => ({ x: x * TS + 8, y: y * TS + 8, id: 'skjult_' + omr + x + ',' + y })).filter((m) => !lagret.aapnet[m.id]);
}
function lagGnister() {
  const p = GNIST_PREFIKS[omr];
  gnister = (GNISTER[omr] || []).map(([x, y], i) => ({ x: x * TS + 4, y: y * TS + 4, w: 8, h: 8, vx: 0, vy: 0, t: 0, i, id: p + i })).filter((s) => !lagret.aapnet[s.id]);
  if (fagPraktisk && omr === 'ute') for (const s of fagPraktisk.gnister) if (!s.borte) gnister.push(s);
}
function lagBoss() {
  skudd = [];
  boss = omr === 'kjeller' && !lagret.flagg.bossBeseiret
    ? { x: 25 * TS + 5, y: 16 * TS, w: 22, h: 22, hp: 10, maks: 10, fase: 'sover', t: 0, treffT: 0, nr: 0, trinn: 1, mal: null } : null;
}
function lagMaaker() {
  maaker = omr === 'tak' ? [0, 1, 2].map((i) => ({ a: i * 2.1, r: 50 + i * 14, x: 0, y: 0, fase: 'sirkle', t: 3 + i * 2.5, mx: 0, my: 0, sx: 0, sy: 0 })) : [];
}
function byttOmr(id, tx, ty, retning, stille) {
  if (!OMR[id]) id = 'ute';
  omr = id; lagret.omr = id;
  kart = OMR[id].kart; MW = kart[0].length; MH = kart.length;
  lagObjekter(); lagMynter(); lagGnister(); lagBoss(); lagMaaker(); tyver = []; flyt = [];
  const s = OMR[id].start;
  plasser(tx ?? s[0], ty ?? s[1], retning ?? s[2]);
  lagret.pos = [spTx(), spTy(), sp.retning]; lagre();
  oppdaterKamera();
  if (!stille) visOmrNavn(OMR[id].navn.toUpperCase());
}

// ── Kollisjon ───────────────────────────────────────────────────────
function solidRute(tx, ty, unntak) {
  if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true;
  const ch = kart[ty][tx];
  if (SOLIDE.has(ch)) return true;
  if (ch === 'Z') return true;                                  // åpen sjakt: man stopper på kanten
  if (ch === 'W' && !lagret.flagg.snarveiApen) return true;
  if (ch === 'K' && !lagret.flagg.trafoApen) return true;
  if (porterStengt(tx, ty)) return true;
  return objekter.some((o) => o !== unntak && o.tx === tx && o.ty === ty && synlig(o) && !o.gjennom);
}
function kolliderer(o, unntak) {
  const x0 = Math.floor(o.x / TS), x1 = Math.floor((o.x + o.w - 0.01) / TS);
  const y0 = Math.floor(o.y / TS), y1 = Math.floor((o.y + o.h - 0.01) / TS);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (solidRute(x, y, unntak)) return true;
  return false;
}
function flytt(o, dx, dy) {
  let traff = false;
  o.x += dx; if (kolliderer(o)) { o.x -= dx; traff = true; }
  o.y += dy; if (kolliderer(o)) { o.y -= dy; traff = true; }
  return traff;
}

const RETN = { o: [0, -1], n: [0, 1], v: [-1, 0], h: [1, 0], opp: [0, -1], ned: [0, 1] };
function foran() {
  const [dx, dy] = RETN[sp.retning];
  return [Math.floor((sp.x + sp.w / 2 + dx * 12) / TS), Math.floor((sp.y + sp.h / 2 + dy * 12) / TS)];
}

// ── Skade og død ────────────────────────────────────────────────────
function skade(fraX, fraY, tekst, mengde = 1) {
  if (sp.usarbar > 0 || tilstand !== 'spill') return;
  if (mengde >= 2 && lagret.ting.visir) mengde = Math.ceil(mengde / 2);   // visiret halverer lysbueskade
  sp.liv -= mengde; sp.usarbar = 1.1; oppdaterHud(); LYD.au();
  if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {}
  const dx = sp.x + sp.w / 2 - fraX, dy = sp.y + sp.h / 2 - fraY, d = Math.hypot(dx, dy) || 1;
  sp.kb = { vx: dx / d * 160, vy: dy / d * 160, t: 0.18 };
  if (tekst) melding(tekst, 2.5);
  if (sp.liv <= 0) {
    sp.liv = maksLiv(); oppdaterHud();
    const s = OMR[omr].start; plasser(s[0], s[1], s[2]); sp.usarbar = 1.5;
    if (omr === 'kjeller') lagBoss();
    const hvor = { ute: 'Du ble sendt tilbake til brakka for å komme deg.', kjeller: 'Du måtte tilbake til trappa.', etg2: 'Du måtte tilbake til trappa.', tak: 'Du klatret ned til takluka igjen.', trafo: 'Du gikk ut av kiosken for å komme deg.' }[omr];
    snakk('', ['Au. ' + hvor, 'Husk: kontroller alltid spenningsløshet, og hold avstand til det som er spenningssatt.']);
  }
}

// ── Handling (A / mellomrom) ────────────────────────────────────────
function handling() {
  const [tx, ty] = foran();
  // Tyver: aldri slåss, bare snakk eller meld fra
  const tyv = tyver.find((t) => !t.borte && Math.hypot(t.x + 6 - (sp.x + sp.w / 2 + RETN[sp.retning][0] * 12), t.y + 10 - (sp.y + sp.h / 2 + RETN[sp.retning][1] * 12)) < 16);
  if (tyv) return tyvPrat(tyv);
  const o = objekter.find((ob) => ob.tx === tx && ob.ty === ty && synlig(ob))
    || objekter.find((ob) => ob.gjennom && ob.type === 'merke' && ob.tx === spTx() && ob.ty === spTy() && synlig(ob));   // noe man står oppå
  if (o) return samhandle(o);
  const f = lagret.flagg, rute = kart[ty] && kart[ty][tx];
  if (rute === 'H') return hovedtavle();
  if (rute === 'M') return lavspenttavle();
  if (rute === 'J') return bajamaja(tx);
  if (rute === 'V') { const gr = objekter.find((ob) => ob.id === 'grete'); return gr && synlig(gr) ? butikk(gr) : melding('Varebilen er låst. Grete kommer klokka 07.', 2.5); }
  if (rute === 'Z') return vernFeil('feil_sjakt');
  if (rute === '=' && omr === 'tak') return kabelbroTak();
  if (rute === 'W') return luke();
  if (rute === 'K') return kioskdor();
  const stengt = porterStengt(tx, ty); if (stengt) return melding(stengt, 3);
  if (lagret.ting.stang && zapMal()) return zap();
  const smaatt = smaaRute(rute, tx, ty); if (smaatt) return melding(smaatt, 2.5);
  if (lagret.ting.stang) zap();
}
function smaaRute(ch, x, y) {
  if (ch === 'C') return tilf(['En container. Det står «IKKE KAST GIPS HER». Den er full av gips.', 'En container. Noen har skrevet «KONTOR» på den. Det er ikke et kontor.']);
  if (ch === 'R') return lagret.teller['stjalet' + x + ',' + y] ? 'Her lå det en kabeltrommel. Nå ligger det bare et merke i grusen.' : 'En kabeltrommel. Mange meter kobber. Tyvene elsker dem.';
  if (ch === 'S') return 'Stillaset er godkjent. Det står på lappen. Lappen er fra 2019.';
  if (ch === 'P') return 'Paller. Ingen vet hvem som eier dem. Alle vet at de ikke skal stå der.';
  if (ch === 'A') return lagret.flagg.ventFikset ? 'Aggregatet durer. Tore har begynt å bruke øreklokker.' : 'Ventilasjonsaggregatet står stille. Arbeidsbryteren er like ved.';
  if (ch === 'X' || ch === 'Y') return 'Høyspent. Hold avstand. Her jobber bare nettselskapet.';
  if (ch === 'e') return 'Rekkverket holder. Du lener deg ikke ut for å sjekke.';
  if (ch === 'Q') return 'Trafokiosken. «Adgang forbudt for uvedkommende.» Du er nesten vedkommende.';
  return '';
}
function zapSone() {
  const iso = lagret.ting.isostang, [dx, dy] = RETN[sp.retning], rek = iso ? 18 : 14, st = iso ? 26 : 18;
  return { x: sp.x + sp.w / 2 + dx * rek - st / 2, y: sp.y + sp.h / 2 + dy * rek - st / 2, w: st, h: st };
}
function zapMal() {
  const sone = zapSone();
  return gnister.some((s) => !s.borte && treff(sone, s)) || skudd.some((s) => treff(sone, s)) || (boss && boss.fase !== 'sover' && treff(sone, boss))
    || maaker.some((m) => treff(sone, { x: m.x - 6, y: m.y - 6, w: 12, h: 12 }));
}
function zap() {
  const iso = lagret.ting.isostang, sone = zapSone();
  sp.zap = 0.25; LYD.zap();
  for (const s of gnister) if (!s.borte && treff(sone, s)) {
    s.borte = true; pip(300, 0.15, 'triangle');
    for (let i = 0; i < 6; i++) gnistRegn.push({ x: s.x + 4, y: s.y + 4, vx: Math.cos(i) * 40, vy: Math.sin(i) * 40, t: 0.4 });
    if (s.fag) continue;
    lagret.aapnet[s.id] = true; giCu(nivaa() >= 3 ? 300 : 150); giXp(5);
  }
  for (const s of skudd) if (treff(sone, s)) { s.borte = true; pip(500, 0.06, 'triangle'); }
  for (const m of maaker) if (treff(sone, { x: m.x - 6, y: m.y - 6, w: 12, h: 12 })) { m.fase = 'flykt'; m.t = 6; pip(900, 0.1, 'square', 0.03); melding('Måka skvetter. Den kommer tilbake. De kommer alltid tilbake.', 2); }
  if (boss && boss.fase !== 'sover' && treff(sone, boss)) {
    if (boss.fase === 'tom' && boss.treffT <= 0) {
      const paaSkinne = kart[spTy()][spTx()] === 'E';
      const n = (iso ? 2 : 1) * (paaSkinne ? 2 : 1);
      boss.hp -= n; boss.treffT = 0.4; pip(180, 0.25, 'square', 0.06);
      if (paaSkinne) flyteTekst('Godt jordet! x2', '#a7f070');
      const bx = boss.x + boss.w / 2 - (sp.x + sp.w / 2), by = boss.y + boss.h / 2 - (sp.y + sp.h / 2), d = Math.hypot(bx, by) || 1;
      flytt(boss, bx / d * 14, by / d * 14);
      if (boss.hp <= 0) bossBeseiret();
      else oppdaterBossTrinn();
    } else if (boss.fase !== 'tom') melding('Lysbuen er ladet! Vent til den blir grå.', 1.5);
  }
}

// Ting i kartet som ikke er egne objekter
function kabelbroTak() {
  const f = lagret.flagg;
  if (Q('kabelbro') === 'aktiv' && !f.broFunnet) {
    f.broFunnet = true; lagre(); giXp(25, true); LYD.riktig();
    return snakk('Kabelbro på taket', ['Der er den! Kabelbroen fra tegningen. Montert pent og vater. På taket.', 'Kabelen ligger riktig. Bare ikke der den skal.', 'Rapporter det til Bjørn.']);
  }
  melding(Q('kabelbro') === 'tak' ? 'Kabelbroen på taket. Den har blitt en del av utsikten.' : 'En kabelbro over taket. Den står ikke på noen tegning du har sett.', 2.5);
}
function luke() {
  const f = lagret.flagg;
  if (f.snarveiApen) return;
  if (!lagret.ting.tester) return melding('En betongvegg. Den høres litt hul ut.', 2);
  if (!f.bossBeseiret) return melding('Testeren viser en luke bak veggen. Den er skrudd fast fra tavlerommet.', 2.5);
  f.snarveiApen = true; lagre(); giXp(20, true); LYD.dor();
  snakk('Skjult luke', ['Du skrur løs luka. En snarvei mellom lageret og tavlerommet!', 'Noen har skrevet «KUN FOR NØDSTILFELLER OG LUNSJ» på innsiden.']);
}
function kioskdor() {
  const f = lagret.flagg, t = lagret.ting;
  if (f.trafoApen) return;
  if (!t.nokkel) return snakk('Trafokiosken', ['Låst. Det henger et skilt: «Nøkkel hos byggeleder. Kun for kvalifisert personell.»', f.rapport ? 'Bjørn har nøkkelen.' : 'Du har ikke noe her å gjøre ennå.']);
  if (Q('vernerunde') !== 'ferdig') return snakk('Trafokiosken', ['Du har nøkkelen, men vernerunden med Hilde er ikke fullført.', 'Ingen arbeid i kiosken før sikkerhetsoppgavene er gjort.']);
  if (!t.visir) return snakk('Trafokiosken', ['Påbudt verneutstyr: lysbuevisir og -dress.', 'Grete selger det ved varebilen.']);
  if (!t.laas || !t.tester || !t.stang) return snakk('Trafokiosken', ['Du trenger lås og skilt, spenningstester og jordingsstang for å jobbe sikkert her.']);
  f.trafoApen = true; lagre(); LYD.dor(); giXp(15, true);
  snakk('Trafokiosken', ['Du tar på lysbuevisiret, låser opp og går inn.', 'Skiltet med de fem sikkerhetsreglene henger på veggen. Følg dem i riktig rekkefølge.']);
}

// Bajamajaene: tilfeldige hendelser
function bajamaja(tx) {
  const f = lagret.flagg;
  if (f.kevinLurt && !f.kevinFunnet && tx === 53) {
    f.kevinFunnet = true; lagre();
    const k = objekter.find((ob) => ob.id === 'kevin'); if (k) k.borte = false;
    return snakk('Kevin (inne i bajamajaen)', ['Det er INGEN skrutrekker her!', 'Og det er ikke papir heller!!', '...', 'Jeg går tilbake til jobb nå. Ikke si det til noen.']);
  }
  f.doTeller = (f.doTeller || 0) + 1; lagre();
  if (f.doTeller === 1) { giCu(50); return snakk('Bajamaja', ['Du fant 50 g kobber på gulvet.', 'Du vil ikke vite hvordan det havnet der.']); }
  const hendelser = [
    () => snakk('Bajamaja', ['Du åpner døra. Du lukker døra. Noen ting skal man ikke se.']),
    () => snakk('Bajamaja', ['Noen har skrevet på veggen: «Rørleggerne var her.» Det er tydelig.']),
    () => snakk('Bajamaja', ['En lapp: «Ikke spis kebab fra bilen før lunsj.» Ingen har lest den.']),
    () => snakk('Roger (fra innsiden)', ['OPPTATT! Det tar den tiden det tar!']),
    () => snakk('Bajamaja', ['Noen har tegnet et koblingsskjema på veggen. Det er feil. Med vilje.']),
    () => snakk('Bajamaja', ['På innsiden av døra: «Dager siden siste ulykke: 3.» Noen har lagt til: «Her inne: 0.»']),
    () => { lagret.klokke += 15; oppdaterHud(); snakk('Bajamaja', ['Døra sitter fast. Etter et kvarter glir den opp.', 'Det var de lengste femten minuttene i livet ditt.']); },
    () => { lagret.teller.skrap = skrap() + 1; lagre(); snakk('Bajamaja', ['Bak tanken ligger en kabelstump. Skrapkobber! (' + skrap() + ' stk)', 'Du vasker hendene. To ganger.']); },
    () => snakk('Bajamaja', ['Dagens avis ligger her. Den er fra 2017. Fremdriftsplanen er visst også fra 2017.']),
  ];
  let i; do i = Math.floor(Math.random() * hendelser.length); while (i === f.doSist && hendelser.length > 1);
  f.doSist = i; lagre(); hendelser[i]();
}

// ── Kobbertyvene (om natta, på sørtomta) ────────────────────────────
const TROMLER = [[27, 32], [29, 32], [27, 35], [29, 35], [31, 33]];
let tyvTimer = 8;
function oppdaterTyver(dt) {
  if (omr !== 'ute') return;
  if (!erNatt()) { for (const t of tyver) if (t.fase !== 'flykt') t.fase = 'flykt'; }
  else if (!tyver.length) {
    tyvTimer -= dt;
    const ledige = TROMLER.filter(([x, y]) => !lagret.teller['stjalet' + x + ',' + y]);
    if (tyvTimer <= 0 && ledige.length) {
      tyvTimer = 20 + Math.random() * 15;
      const [x, y] = tilf(ledige);
      tyver.push({ x: 33 * TS + 2, y: 38 * TS - 4, mx: x, my: y, fase: 'gaa', t: 0, retning: 'opp', steg: 0, tilbudt: false });
    }
  }
  const px = sp.x + sp.w / 2, py = sp.y + sp.h / 2;
  for (const t of tyver) {
    const d = Math.hypot(t.x + 6 - px, t.y + 10 - py);
    const flytt2 = (mx, my, v) => { const dx = mx - t.x, dy = my - t.y, l = Math.hypot(dx, dy) || 1; t.x += dx / l * Math.min(v * dt, l); t.y += dy / l * Math.min(v * dt, l);
      t.retning = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'h' : 'v') : (dy > 0 ? 'ned' : 'opp'); t.steg += dt * 8; return l < 2; };
    if (t.fase === 'gaa') {
      if (d < 56 && !t.tilbudt) { t.fase = 'tilbud'; t.t = 5; t.tilbudt = true; continue; }
      if (d < 40) { tyvFlykt(t, true); continue; }
      if (flytt2(t.mx * TS + 2, (t.my + 1) * TS - 4, 30)) { t.fase = 'stjel'; t.t = 8; }
    } else if (t.fase === 'stjel') {
      t.retning = 'opp'; t.t -= dt;
      if (d < 56 && !t.tilbudt) { t.fase = 'tilbud'; t.t = 5; t.tilbudt = true; continue; }
      if (d < 40 && !t.betalt) { tyvFlykt(t, true); continue; }
      if (t.t <= 0) {
        lagret.teller['stjalet' + t.mx + ',' + t.my] = 1; lagre(); t.fase = 'flykt';
        melding('Kobbertyvene tok en kabeltrommel! Meld fra til vekteren Vidar.', 3);
      }
    } else if (t.fase === 'tilbud') {
      t.t -= dt; t.retning = px > t.x + 6 ? 'h' : 'v';
      if (t.t <= 0) { if (d < 64) tyvFlykt(t, true); else t.fase = 'gaa'; }
    } else if (t.fase === 'flykt') {
      if (flytt2(33 * TS + 2, 39 * TS + 8, 70)) t.borte = true;
    }
  }
  tyver = tyver.filter((t) => !t.borte);
}
function tyvFlykt(t, slippSpor) {
  if (t.fase === 'flykt') return;
  t.fase = 'flykt'; pip(700, 0.08, 'square', 0.03);
  if (slippSpor && (lagret.teller.spor || 0) < 3) {
    let tx = Math.floor((t.x + 6) / TS), ty = Math.floor((t.y + 10) / TS);
    if (solidRute(tx, ty)) ty++;
    if (!objekter.some((o) => o.type === 'spor' && !o.borte)) objekter.push({ id: 'spor' + Date.now(), type: 'spor', tx, ty, px: tx * TS, py: ty * TS, gjennom: true });
    melding('Tyven løper! Han mistet noe i farten.', 2.5);
  } else melding('Tyven løper sin vei.', 2);
}
function tyvPrat(t) {
  if (t.fase === 'flykt') return;
  const fase = t.fase; t.fase = 'tilbud'; t.t = 99;
  snakk('Mann i mørke klær', ['Psst. Ikke se sånn på meg. Jeg er... fra grossisten.', { tekst: 'Vil du ha 300 g kobber for å se en annen vei?', valg: [
    ['Nei. Jeg melder fra til vekteren.', () => { endreRykte(1, 'Avviste kobbertyven'); tyvFlykt(t, true); }],
    ['Lys på ham og rop «VEKTER!»', () => { tyvFlykt(t, true); }],
    ['Ta imot og se en annen vei', () => { lagret.flagg.kjoptAvTyv = true; giCu(300); endreRykte(-3, 'Tok imot kobber fra tyvene'); t.betalt = true; t.fase = fase === 'tilbud' ? 'gaa' : fase; if (t.fase === 'stjel') t.t = 3;
      melding('Du ser en annen vei. Det kjennes ikke bra.', 3); }],
  ] }]);
}

// ── Lysbuen ─────────────────────────────────────────────────────────
// Faser: sover → (lader → skudd | strale → stråle | bolge → energibølge) → tom (sårbar) → ...
// Trinn 1: bare lading. Trinn 2: også sikte-stråle. Trinn 3: også energibølge (stå på en jordingsskinne).
function oppdaterBossTrinn() {
  const b = boss, ny = b.hp <= b.maks / 3 ? 3 : b.hp <= b.maks * 2 / 3 ? 2 : 1;
  if (ny > b.trinn) {
    b.trinn = ny; LYD.feil(); visOmrNavn('LYSBUEN · FASE ' + ny);
    melding(ny === 2 ? 'Lysbuen blir sint! Se etter den røde siktelinja, og gå til side.' : 'Lysbuen samler energibølger! Stå på en jordingsskinne når ringen lyser.', 4);
  }
}
function bossBeseiret() {
  lagret.flagg.bossBeseiret = true; lagre(); giCu(500, true); giXp(150); fanfare(); skudd = [];
  const b = boss; boss = null;
  for (let i = 0; i < 16; i++) gnistRegn.push({ x: b.x + 11, y: b.y + 11, vx: Math.cos(i * 0.39) * 70, vy: Math.sin(i * 0.39) * 70, t: 0.8 });
  snakk('', ['Lysbuen er jordet og slukket! +500 g Cu', 'Nå er det trygt å se på hovedtavla ved nordveggen.', 'Testeren piper ved østveggen. Det kan være en skjult luke der.']);
}
function oppdaterBoss(dt) {
  for (const s of skudd) {
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (kolliderer(s)) s.borte = true;
    else if (treff(sp, s)) { s.borte = true; skade(s.x + 3, s.y + 3, '', 2); }
  }
  skudd = skudd.filter((s) => !s.borte);
  if (!boss) return;
  const b = boss, px = sp.x + sp.w / 2, py = sp.y + sp.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
  if (b.treffT > 0) b.treffT -= dt;
  if (b.fase === 'sover') {
    if (px > 21 * TS && py > 12 * TS) {
      b.fase = 'lader'; b.t = 2.2; pip(90, 0.6, 'sawtooth', 0.06); visOmrNavn('LYSBUEN');
      melding('LYSBUEN våkner! Jord den når den er grå. Jordingsskinnene i gulvet gir dobbel effekt.', 4.5);
    }
    return;
  }
  b.t -= dt;
  const d = Math.hypot(px - bx, py - by) || 1;
  const fart2 = b.fase === 'lader' ? 14 + b.trinn * 6 : b.fase === 'tom' ? 7 : 0;
  if (fart2) flytt(b, (px - bx) / d * fart2 * dt, (py - by) / d * fart2 * dt);
  if (b.fase !== 'tom' && treff({ x: sp.x, y: sp.y - 4, w: sp.w, h: sp.h + 4 }, b)) skade(bx, by, 'Au! Hold avstand når lysbuen lyser!', 2);
  if (b.fase === 'lader') {
    if (Math.random() < dt * 6) pip(1800 + Math.random() * 900, 0.02, 'sawtooth', 0.012);
    if (b.t <= 0) {
      const n = b.trinn >= 2 ? 12 : 8, sigte = Math.atan2(py - by, px - bx);
      for (let i = 0; i < n; i++) { const a = sigte + i * Math.PI * 2 / n; skudd.push({ x: bx - 3, y: by - 3, w: 6, h: 6, vx: Math.cos(a) * 75, vy: Math.sin(a) * 75 }); }
      pip(140, 0.35, 'sawtooth', 0.07); b.fase = 'tom'; b.t = 2.6;
    }
  } else if (b.fase === 'strale') {
    if (b.t > 0.35) b.mal = b.mal || { x: px, y: py };
    if (b.t <= 0.35 && !b.fyrt) {
      b.fyrt = true; pip(200, 0.4, 'sawtooth', 0.07);
    }
    if (b.fyrt && b.t > 0) {
      // Avstand fra spilleren til stråla (forlenget forbi målet)
      const ux = b.mal.x - bx, uy = b.mal.y - by, l = Math.hypot(ux, uy) || 1, nx = ux / l, ny = uy / l;
      const proj = (px - bx) * nx + (py - by) * ny, avst = Math.abs((px - bx) * ny - (py - by) * nx);
      if (proj > 0 && avst < 9) skade(bx, by, 'Stråla traff! Gå til side når den røde linja vises.', 2);
    }
    if (b.t <= 0) { b.fase = 'tom'; b.t = 2.4; b.mal = null; b.fyrt = false; }
  } else if (b.fase === 'bolge') {
    // Varsel 1,4 s, så en ring som vokser utover
    if (b.t <= 0 && !b.ring) { b.ring = 0; pip(100, 0.5, 'sawtooth', 0.08); }
    if (b.ring !== undefined && b.ring !== null) {
      b.ring += dt * 200;
      const avst = Math.abs(d - b.ring);
      if (avst < 9 && kart[spTy()][spTx()] !== 'E') skade(bx, by, 'Energibølgen traff! Stå på en jordingsskinne.', 2);
      if (b.ring > 200) { b.ring = null; b.fase = 'tom'; b.t = 3; }
    }
  } else if (b.fase === 'tom' && b.t <= 0) {
    b.nr++;
    const valg = b.trinn === 1 ? ['lader'] : b.trinn === 2 ? ['lader', 'strale'] : ['lader', 'strale', 'bolge'];
    b.fase = valg[b.nr % valg.length];
    b.t = b.fase === 'lader' ? 1.6 + b.hp * 0.12 : b.fase === 'strale' ? 1.25 : 1.4;
    if (b.fase === 'bolge') { b.ring = null; melding('Energibølge! Stå på en jordingsskinne!', 1.6); }
    pip(90, 0.4, 'sawtooth', 0.05);
  }
}

// ── Måkene på taket ─────────────────────────────────────────────────
function oppdaterMaaker(dt) {
  const px = sp.x + sp.w / 2, py = sp.y + sp.h / 2, cx = 13 * TS, cy = 9 * TS;
  for (const m of maaker) {
    if (erNatt()) { m.x = 22 * TS + 8; m.y = 15 * TS + 2; m.fase = 'sover'; continue; }
    if (m.fase === 'sover') m.fase = 'sirkle';
    m.t -= dt;
    if (m.fase === 'sirkle' || m.fase === 'flykt') {
      m.a += dt * (m.fase === 'flykt' ? 1.6 : 0.7);
      const r2 = m.fase === 'flykt' ? m.r + 60 : m.r;
      m.x = cx + Math.cos(m.a) * r2 * 1.4; m.y = cy + Math.sin(m.a) * r2 * 0.7;
      if (m.t <= 0) { if (m.fase === 'flykt') { m.fase = 'sirkle'; m.t = 4; } else { m.fase = 'sikt'; m.t = 1; m.mx = px; m.my = py; m.sx = m.x; m.sy = m.y; } }
    } else if (m.fase === 'sikt') {
      if (m.t <= 0) { m.fase = 'stup'; m.t = 0.45; }
    } else if (m.fase === 'stup') {
      const k = 1 - Math.max(0, m.t) / 0.45;
      m.x = m.sx + (m.mx - m.sx) * k; m.y = m.sy + (m.my - m.sy) * k;
      if (m.t <= 0) {
        if (Math.hypot(px - m.mx, py - m.my) < 12 && sp.usarbar <= 0) {
          const tatt = Math.min(50, lagret.kobber); skade(m.mx, m.my - 8, ''); if (tatt) giCu(-tatt);
          melding(tilf(['Måka stjal kobber! Så det VAR måkene.', 'Måka tok ' + fmtCu(tatt) + '. Den ser ikke lei seg ut.']), 2.5);
        }
        m.fase = 'sirkle'; m.t = 4 + Math.random() * 4;
      }
    }
  }
}

// ── NPC-er som går, snakker og reagerer ─────────────────────────────
let boble = null, bobleTimer = 4;
function oppdaterNpc(dt) {
  const px = sp.x + sp.w / 2, py = sp.y + sp.h / 2;
  for (const o of objekter) {
    if (o.type !== 'npc' && o.type !== 'spor') continue;
    // myk bevegelse mot ruta
    const mx = o.tx * TS, my = o.ty * TS;
    o.px += Math.sign(mx - o.px) * Math.min(Math.abs(mx - o.px), 48 * dt); o.py += Math.sign(my - o.py) * Math.min(Math.abs(my - o.py), 48 * dt);
    if (o.type !== 'npc' || !synlig(o)) continue;
    const d = Math.hypot(o.tx * TS + 8 - px, o.ty * TS + 8 - py);
    if (d < 36 && !(o.id === 'kevin' && kevin.aktiv)) {     // snur seg mot spilleren
      const dx = px - (o.tx * TS + 8), dy = py - (o.ty * TS + 8);
      o.retning = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'h' : 'v') : (dy > 0 ? 'ned' : 'opp');
      continue;
    }
    if (o.vandre && !iDialog) {
      o.vt -= dt;
      if (o.vt <= 0) {
        o.vt = 2 + Math.random() * 3;
        const [dx, dy] = tilf([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = o.tx + dx, ny = o.ty + dy, [x0, y0, x1, y1] = o.vandre;
        const rute = { x: nx * TS, y: ny * TS, w: TS, h: TS };
        if (nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1 && !solidRute(nx, ny, o) && !treff(rute, sp)) {
          o.tx = nx; o.ty = ny; o.retning = dx > 0 ? 'h' : dx < 0 ? 'v' : dy > 0 ? 'ned' : 'opp';
        }
      }
    }
  }
  // Snakkebobler
  if (boble) { boble.t -= dt; if (boble.t <= 0 || !synlig(boble.o)) boble = null; }
  bobleTimer -= dt;
  if (!boble && bobleTimer <= 0) {
    bobleTimer = 5 + Math.random() * 5;
    const naer = objekter.filter((o) => o.type === 'npc' && synlig(o) && PRAT[o.id] && Math.hypot(o.tx * TS - px, o.ty * TS - py) < 110);
    if (naer.length) { const o = tilf(naer); boble = { o, tekst: tilf(PRAT[o.id]()), t: 3.2 }; }
  }
}
function harNoe(o) {
  const f = lagret.flagg, t = lagret.ting, q = Q;
  switch (o.id) {
    case 'byggeleder': return !f.oppdrag || (f.ferdig2 && !f.rapport) || (f.rapport && !t.nokkel && q('vernerunde') === 'ferdig' && !(erCowboy() && !f.ekstraKontroll)) || (q('kabelbro') === 'aktiv' && f.broFunnet) || (q('fremdrift') === 'aktiv' && fremdriftSpurt() >= 3);
    case 'hilde': return (t.hjelm && !f.hildeFlyttet) || (f.ferdig && !q('vernerunde')) || (q('vernerunde') === 'aktiv' && vernFunnet() >= 5) || (f.trengerKontroll && !f.ekstraKontroll);
    case 'kevin': return !q('skrutrekker') || (q('skrutrekker') === 'aktiv' && t.skrutrekker) || (q('skrue') === 'aktiv' && !f.vitneKevin);
    case 'roger': return !q('trommel') || (q('trommel') === 'aktiv' && t.trommel) || (q('skrue') === 'aktiv' && !f.vitneRoger) || (q('fremdrift') === 'aktiv' && !f.fs_roger);
    case 'tore': return (q('skrue') === 'aktiv' && f.sporGips && (f.vitneRoger || f.vitneKevin)) || (q('fremdrift') === 'aktiv' && !f.fs_tore);
    case 'mats': return !q('verktoy') || (q('verktoy') === 'aktiv' && ['multimeter', 'avbiter', 'vater', 'kniv'].some((id) => t[id])) || (q('fremdrift') === 'aktiv' && !f.fs_mats);
    case 'grete': return (f.ferdig && !t.visir) || (f.ferdig && !q('cirka'));
    case 'sondre': return !q('sondre') || (q('sondre') === 'aktiv' && f.lampe201);
    case 'vidar': return !q('tyver') || (q('tyver') === 'aktiv' && (lagret.teller.spor || 0) >= 3);
    case 'sensor': return f.trafoFerdig && !f.fagBestatt && nivaa() >= 2;
  }
  return false;
}

// Kevin slår på byggestrømmen igjen hvis bryteren ikke er låst
function oppdaterKevin(dt) {
  const k = objekter.find((o) => o.id === 'kevin');
  if (kevin.aktiv && (!k || k.borte)) kevin.aktiv = false;
  if (!kevin.aktiv) return;
  kevin.timer -= dt;
  if (kevin.fase === 0 && kevin.timer <= 0) { kevin.fase = 1; melding('Kevin: «Hvem slo av byggestrømmen? Kappsagen stoppet!»', 3); }
  if (kevin.fase === 1) {
    const mal = 36; k.retning = 'h';
    if (k.tx !== mal && kevin.timer < -0.25 * (Math.abs(k.tx - 31) + 1)) k.tx += Math.sign(mal - k.tx);
    if (k.tx === mal && k.ty === 23) k.ty = 22;
    if (k.tx === mal && k.ty === 22) {
      kevin.fase = 2; s1Paa = true; lagret.flagg.s1Av = false; lagre(); pip(300, 0.2, 'square');
      melding('Kevin slo på strømmen igjen! Du må sikre bryteren mot innkobling med lås og skilt.', 4);
      kevin.timer = 2;
    }
  }
  if (kevin.fase === 2 && kevin.timer <= 0) { k.tx = 31; k.ty = 23; k.retning = 'ned'; kevin.aktiv = false; }
}

// ── Hovedoppdatering ────────────────────────────────────────────────
let lagreTimer = 0, sokTimer = 0, sperreMelding = 0, sistSteg = 0, varNatt = null, maalTimer = 0;
function oppdater(dt) {
  tid += dt;
  if (meldingTimer > 0) { meldingTimer -= dt; if (meldingTimer <= 0) $('melding').style.display = 'none'; }
  if (omrNavnTimer > 0) { omrNavnTimer -= dt; if (omrNavnTimer <= 0) $('omrNavn').classList.remove('vis'); }
  for (const f of flyt) { f.t -= dt; f.y -= dt * 14; }
  flyt = flyt.filter((f) => f.t > 0);
  for (const p of gnistRegn) { p.x += p.vx * dt; p.y += p.vy * dt; p.t -= dt; }
  gnistRegn = gnistRegn.filter((p) => p.t > 0);
  maalTimer -= dt; if (maalTimer <= 0) { maalTimer = 0.5; oppdaterMaal(); }
  if (iDialog) { if (aTrykk) { aTrykk = false; nesteSide(); } return; }
  if (aTrykk) { aTrykk = false; handling(); if (iDialog || tilstand !== 'spill') return; }

  // Klokka: 1,5 spillminutter per sekund
  const foer = minutt();
  lagret.klokke += dt * 1.5; lagret.spilletid += dt;
  if (minutt() < foer) lagret.dag++;
  const natt = erNatt();
  if (varNatt !== null && natt !== varNatt) melding(natt ? 'Det blir kveld. Lyskasterne slås på, og Grete har dratt for dagen.' : 'God morgen! Dag ' + lagret.dag + '. Grete er tilbake ved varebilen.', 3.5);
  varNatt = natt;

  // Bevegelse
  let mx = (tast.h ? 1 : 0) - (tast.v ? 1 : 0), my = (tast.n ? 1 : 0) - (tast.o ? 1 : 0);
  if (sp.kb) { flytt(sp, sp.kb.vx * dt, sp.kb.vy * dt); sp.kb.t -= dt; if (sp.kb.t <= 0) sp.kb = null; mx = my = 0; }
  sp.gaar = !!(mx || my);
  if (sp.gaar) {
    if (mx && my) { mx *= 0.707; my *= 0.707; }
    if (Math.abs(mx) > Math.abs(my)) sp.retning = mx > 0 ? 'h' : 'v'; else if (my) sp.retning = my > 0 ? 'ned' : 'opp';
    const v = fart();
    if (flytt(sp, mx * v * dt, my * v * dt)) {
      const [fx, fy] = foran(), st = porterStengt(fx, fy);
      if (st && sperreMelding <= 0) { melding(st, 3); sperreMelding = 3; }
    }
    sp.steg += dt * 8;
    if (Math.floor(sp.steg / 2) !== sistSteg) { sistSteg = Math.floor(sp.steg / 2); LYD.steg(); }
  }
  if (sperreMelding > 0) sperreMelding -= dt;
  if (sp.usarbar > 0) sp.usarbar -= dt;
  if (sp.zap > 0) sp.zap -= dt;

  // Spenningssatte kabler
  const cx = spTx(), cy = spTy(), rute = kart[cy] && kart[cy][cx];
  if (levende(cx, cy)) skade(cx * TS + 8, cy * TS + 8, lagret.ting.tester ? 'Au! Den kabelen var rød på testeren!' : 'Au! Kabelen var spenningssatt. Finn en spenningstester!');
  if (rute === 'L' && s1Paa) skade(cx * TS + 8, cy * TS + 2, 'Kabelen foran døra er spenningssatt. Frakoble i byggestrømskapet!');

  // Overganger
  const port = portPaa(cx, cy);
  if (port && !(port.stengt && port.stengt())) {
    LYD.trapp(port.ret === 'opp' || port.til === 'ute');
    const forste = !lagret.flagg['vaert_' + port.til];
    lagret.flagg['vaert_' + port.til] = true;
    byttOmr(port.til, port.tx, port.ty, port.ret);
    if (forste && port.til === 'kjeller') melding(lagret.ting.lykt ? 'Kjelleren.' : 'Bekmørkt! Hodelykta skal visst ligge på lageret i øst.', 3.5);
    if (forste && port.til === 'tak') melding('Taket. Selen er festet. Måkene ser på deg.', 3);
    return;
  }

  // Kobber, skjulte funn og ting på bakken
  const spm = { x: sp.x + sp.w / 2, y: sp.y + sp.h / 2 };
  for (const m of mynter) if (!m.tatt && Math.hypot(spm.x - m.x, spm.y - m.y) < 10) { m.tatt = true; lagret.aapnet[m.id] = true; giCu(50, true); LYD.mynt(); flyteTekst('+50 g', '#e08a4c'); }
  if (lagret.ting.kabelsoker) {
    let naermest = 999;
    for (const m of skjulte) if (!m.tatt) {
      const d = Math.hypot(spm.x - m.x, spm.y - m.y); naermest = Math.min(naermest, d);
      if (d < 10) { m.tatt = true; lagret.aapnet[m.id] = true; giCu(250); giXp(10, true); LYD.mynt(); melding('Kabelsøkeren fant et skjult funn! +250 g Cu', 2.5); }
    }
    sokTimer -= dt;
    if (naermest < 70 && sokTimer <= 0) { sokTimer = 0.25 + naermest / 90; pip(1500 - naermest * 8, 0.03, 'sine', 0.02); }
  }
  for (const o of objekter) if (synlig(o) && (o.type === 'skrap' || o.type === 'funn' || o.type === 'spor') && Math.hypot(spm.x - (o.tx * TS + 8), spm.y - (o.ty * TS + 8)) < 10) { samhandle(o); break; }
  if (iDialog) return;

  oppdaterBoss(dt);
  oppdaterMaaker(dt);
  oppdaterTyver(dt);
  oppdaterNpc(dt);
  if (omr === 'ute') oppdaterKevin(dt);

  // Gnister
  for (const s of gnister) {
    if (s.borte) continue;
    s.t -= dt;
    if (s.t <= 0) { const a = Math.floor(Math.random() * 4); s.vx = [30, -30, 0, 0][a]; s.vy = [0, 0, 30, -30][a]; s.t = 0.8 + Math.random() * 1.2; }
    if (flytt(s, s.vx * dt, s.vy * dt)) { s.vx *= -1; s.vy *= -1; }
    if (treff({ x: sp.x + 1, y: sp.y - 4, w: sp.w - 2, h: sp.h + 4 }, s)) skade(s.x + 4, s.y + 4, lagret.ting.stang ? '' : 'En gnist! Med en jordingsstang kan du jorde den.');
  }
  praktiskSjekk();

  // Lagre posisjon og tid av og til
  lagreTimer -= dt;
  if (lagreTimer <= 0) { lagreTimer = 2; lagret.pos = [cx, cy, sp.retning]; lagret.omr = omr; lagre(); oppdaterHud(); }
  oppdaterKamera();
}
function oppdaterKamera() {
  const bw = MW * TS, bh = MH * TS;
  kamX = bw <= VW ? (bw - VW) / 2 : Math.max(0, Math.min(bw - VW, sp.x + sp.w / 2 - VW / 2));
  kamY = bh <= VH ? (bh - VH) / 2 : Math.max(0, Math.min(bh - VH, sp.y - VH / 2));
}

// ── Neste mål: tekst øverst og pil i spillet ────────────────────────
let maal = null;
function oppdaterMaal() {
  maal = nesteMaal();
  const tekst = '▶ ' + maal.tekst;
  if ($('hudMaal').textContent !== tekst) $('hudMaal').textContent = tekst;
}
function maalPunkt() {
  if (!maal || !maal.omr) return null;
  if (maal.omr === omr) return { x: maal.x * TS + 8, y: maal.y * TS + 8, her: true };
  const p = (PORTER[omr] || []).find((q) => q.til === maal.omr) || (PORTER[omr] || []).find((q) => q.til === 'ute') || (PORTER[omr] || [])[0];
  return p ? { x: p.x * TS + 8, y: p.y * TS + 8, her: false } : null;
}

// ── Tegning ─────────────────────────────────────────────────────────
function tegnObjekt(o) {
  const kx = Math.round(kamX), ky = Math.round(kamY);
  const X = Math.round((o.px ?? o.tx * TS)) - kx, Y = Math.round((o.py ?? o.ty * TS)) - ky;
  const f = lagret.flagg, t = lagret.ting;
  if (o.type === 'npc') {
    const gar = Math.abs(o.px - o.tx * TS) + Math.abs(o.py - o.ty * TS) > 0.5;
    const fig = figur(o.retning, gar ? [1, 0, 2, 0][Math.floor(tid * 8) % 4] : 0, NPC_PAL[o.id], o.id);
    r(X + 3, Y + 14, 10, 2, '#00000044');
    g.save(); if (o.retning === 'v') { g.translate(X + 14, Y); g.scale(-1, 1); g.drawImage(fig, 0, 0); } else g.drawImage(fig, X + 2, Y); g.restore();
    if (o.id === 'vidar') { r(X + (o.retning === 'v' ? 0 : 12), Y + 8, 3, 2, '#ffcd3c'); }
    if (o.id === 'grete' || o.id === 'sensor') { r(X + 11, Y + 8, 3, 4, '#f4f4f4'); r(X + 11, Y + 8, 3, 1, '#94b0c2'); }
    if (harNoe(o) && Math.floor(tid * 2) % 2) { r(X + 7, Y - 8, 2, 5, '#ffcd3c'); r(X + 7, Y - 2, 2, 2, '#ffcd3c'); r(X + 6, Y - 9, 4, 1, '#1a1c2c'); }
    return;
  }
  switch (o.type) {
    case 'kiste': {
      const aapen = lagret.aapnet[o.id];
      r(X + 2, Y + 5, 12, 10, '#8b5a2b'); r(X + 2, Y + 5, 12, 2, aapen ? '#3a240f' : '#c98b62'); r(X + 2, Y + 9, 12, 1, '#5d3a1a');
      r(X + 7, Y + 8, 2, 3, aapen ? '#566c86' : '#ffcd3c');
      if (!aapen && Math.floor(tid * 3 + o.tx) % 6 === 0) r(X + 12, Y + 4, 1, 1, '#ffffff');
      break;
    }
    case 'skap': {
      r(X + 1, Y, 14, 16, '#c2c3c7'); r(X + 2, Y + 1, 12, 14, '#8b9bb4');
      for (let i = 0; i < 4; i++) r(X + 3 + i * 3, Y + 4, 2, 4, '#1a1c2c');
      const paa = o.id === 's1' ? s1Paa : o.id === 's2' ? !f.ferdig : false;
      r(X + 6, Y + 11, 4, 2, paa ? '#ff4d6d' : '#38b764');
      if (o.id === 's1' && f.s1Laast) { r(X + 10, Y + 9, 4, 4, '#ffcd3c'); r(X + 11, Y + 7, 2, 2, '#c2c3c7'); r(X + 2, Y + 12, 5, 3, '#ff4d6d'); }
      break;
    }
    case 'kaffe':
      r(X + 3, Y + 2, 10, 13, '#333c57'); r(X + 4, Y + 3, 8, 3, '#b13e53'); r(X + 6, Y + 9, 4, 4, '#f4f4f4'); r(X + 7, Y + 10, 2, 2, '#5d3a1a');
      if (Math.floor(tid * 2) % 2) r(X + 7, Y + 6, 1, 2, '#f4f4f4');
      break;
    case 'dor':
      r(X, Y, 16, 16, '#566c86'); r(X + 2, Y + 1, 12, 15, '#8b9bb4'); r(X + 2, Y + 1, 12, 1, '#c2c3c7');
      r(X + 4, Y + 3, 8, 6, '#ffcd3c'); r(X + 7, Y + 4, 2, 3, '#1a1c2c'); r(X + 7, Y + 8, 2, 1, '#1a1c2c'); r(X + 11, Y + 10, 2, 2, '#1a1c2c');
      break;
    case 'skilt':
      r(X + 7, Y + 8, 2, 8, '#5d3a1a'); r(X + 2, Y + 2, 12, 8, '#ffcd3c'); r(X + 2, Y + 2, 12, 1, '#fff1a8');
      r(X + 4, Y + 4, 8, 1, '#1a1c2c'); r(X + 4, Y + 6, 6, 1, '#1a1c2c');
      break;
    case 'funn': case 'skrap': case 'spor': {
      const b = Math.round(Math.sin(tid * 4 + o.tx) * 1.5);
      r(X + 4, Y + 13, 8, 2, '#00000044');
      g.drawImage(ikon(o.type === 'funn' ? TING[o.funn].ikon : o.type), X + 3, Y + 2 + b);
      if (Math.floor(tid * 3 + o.tx) % 5 === 0) r(X + 12, Y + 2 + b, 1, 1, '#ffffff');
      break;
    }
    case 'lampe': {
      const paa = nattFaktor() > 0.3;
      r(X + 4, Y + 13, 8, 3, '#333c57'); r(X + 7, Y - 6, 2, 19, '#566c86');
      r(X + 3, Y - 10, 10, 5, '#333c57'); r(X + 4, Y - 7, 8, 2, paa ? '#fff1a8' : '#8b9bb4');
      break;
    }
    case 'benk':
      r(X, Y + 5, 16, 4, '#8b5a2b'); r(X, Y + 5, 16, 1, '#c98b62'); r(X + 1, Y + 9, 2, 6, '#5d3a1a'); r(X + 13, Y + 9, 2, 6, '#5d3a1a');
      r(X + 3, Y + 2, 4, 3, '#94b0c2'); r(X + 9, Y + 3, 5, 2, '#b13e53');
      break;
    case 'gjenvinning':
      r(X + 2, Y + 3, 12, 12, '#38b764'); r(X + 1, Y + 2, 14, 2, '#257179'); r(X + 5, Y + 7, 6, 1, '#f4f4f4'); r(X + 5, Y + 7, 1, 4, '#f4f4f4'); r(X + 10, Y + 7, 1, 4, '#f4f4f4'); r(X + 5, Y + 11, 6, 1, '#f4f4f4');
      g.drawImage(ikon('kobber'), X + 3, Y - 5);
      break;
    case 'merke': tegnMerke(o, X, Y); break;
  }
}
function tegnMerke(o, X, Y) {
  const f = lagret.flagg, t = lagret.ting, k = o.merke;
  const notert = k.startsWith('feil_') && f['vern_' + k];
  switch (k) {
    case 'gipsvegg':
      r(X + 1, Y, 14, 16, '#e6e2d8'); r(X + 1, Y, 14, 1, '#ffffff'); r(X + 8, Y, 1, 16, '#c2bdb0');
      for (let j = 3; j < 16; j += 4) { r(X + 3, Y + j, 1, 1, '#566c86'); r(X + 12, Y + j, 1, 1, '#566c86'); }
      r(X + 6, Y + 8, 2, 2, '#1a1c2c');
      if (t.tester) r(X + 1, Y + 9, 14, 1, Q('skrue') === 'skjult' ? '#ffcd3c' : '#ff4d6d');
      if (f.sporGips) { r(X + 4, Y + 14, 6, 1, '#c98b62'); r(X + 9, Y + 13, 4, 1, '#ffcd3c'); }
      break;
    case 'plan':
      r(X, Y + 1, 16, 12, '#f4f4f4'); r(X, Y + 1, 16, 1, '#c2c3c7');
      for (let i = 0; i < 4; i++) r(X + 2, Y + 3 + i * 2, 4 + (i * 3) % 9, 1, Q('fremdrift') === 'ferdig' && i % 2 ? '#ff4d6d' : '#38b764');
      r(X + 11, Y + 9, 3, 2, '#1a1c2c'); r(X + 7, Y + 13, 2, 3, '#5d3a1a');
      break;
    case 'tavle':
      r(X, Y + 1, 16, 12, '#f4f4f4'); r(X, Y + 12, 16, 1, '#94b0c2'); r(X + 2, Y + 3, 8, 1, '#3b5dc9'); r(X + 2, Y + 5, 11, 1, '#3b5dc9'); r(X + 2, Y + 8, 5, 1, '#b13e53');
      r(X + 3, Y + 13, 1, 3, '#566c86'); r(X + 12, Y + 13, 1, 3, '#566c86');
      break;
    case 'sofa':
      r(X, Y + 5, 16, 9, '#8b4f3a'); r(X, Y + 3, 16, 4, '#a0603f'); r(X, Y + 5, 2, 9, '#6e3a28'); r(X + 14, Y + 5, 2, 9, '#6e3a28'); r(X + 5, Y + 8, 3, 2, '#5d3a1a');
      break;
    case 'garderobeskap':
      r(X + 1, Y, 14, 16, '#94b0c2'); r(X + 8, Y, 1, 16, '#566c86'); for (let j = 2; j < 6; j += 2) { r(X + 3, Y + j, 3, 1, '#566c86'); r(X + 10, Y + j, 3, 1, '#566c86'); }
      r(X + 6, Y + 8, 1, 2, '#1a1c2c'); r(X + 10, Y + 8, 1, 2, '#1a1c2c');
      break;
    case 'kjoleskap':
      r(X + 2, Y, 12, 16, '#f4f4f4'); r(X + 2, Y + 6, 12, 1, '#c2c3c7'); r(X + 11, Y + 2, 1, 3, '#94b0c2'); r(X + 11, Y + 8, 1, 5, '#94b0c2');
      r(X + 4, Y + 9, 4, 3, '#ffcd3c');
      break;
    case 'feil_skjote':
      r(X + 2, Y + 6, 12, 8, '#3b5dc9'); r(X + 4, Y + 7, 9, 1, '#9fe8ff');
      r(X, Y + 9, 10, 2, '#ef7d57'); r(X + 9, Y + 8, 4, 4, '#1a1c2c'); r(X + 9, Y + 9, 4, 1, '#94b0c2');
      break;
    case 'feil_stige':
      r(X + 3, Y - 6, 2, 22, '#c2c3c7'); r(X + 11, Y - 6, 2, 22, '#c2c3c7'); for (let j = -4; j < 16; j += 4) r(X + 3, Y + j, 10, 1, '#94b0c2');
      if (f.vernerunde || Q('vernerunde') === 'ferdig') r(X + 2, Y + 14, 12, 2, '#ffcd3c');
      break;
    case 'feil_nodutgang':
      if (Q('vernerunde') === 'ferdig') { r(X + 3, Y + 2, 10, 5, '#38b764'); r(X + 5, Y + 3, 6, 3, '#f4f4f4'); break; }
      r(X + 1, Y + 3, 14, 12, '#8b5a2b'); for (let j = 4; j < 15; j += 3) r(X + 1, Y + j, 14, 1, '#5d3a1a'); r(X + 4, Y, 8, 3, '#38b764');
      break;
    case 'feil_grofta':
      r(X, Y + 3, 16, 10, '#3a240f'); r(X, Y + 3, 16, 1, '#8b5a2b'); r(X + 2, Y + 7, 12, 1, '#ef7d57');
      if (Q('vernerunde') === 'ferdig') { for (let i = 0; i < 16; i += 4) r(X + i, Y + 1, 2, 2, i % 8 ? '#f4f4f4' : '#ff4d6d'); r(X, Y + 1, 16, 1, '#ff4d6d'); }
      else { r(X + 10, Y + 8, 3, 3, '#ef7d57'); r(X + 11, Y + 7, 1, 1, '#f4f4f4'); }
      break;
    case 'relepanel':
      r(X + 1, Y + 1, 14, 14, '#c2c3c7'); r(X + 2, Y + 2, 12, 12, '#333c57');
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { r(X + 3 + i * 4, Y + 3 + j * 4, 3, 3, '#1a1c2c'); r(X + 4 + i * 4, Y + 4 + j * 4, 1, 1, f.lampe201 || Math.floor(tid * 4 + i + j) % 3 === 0 ? '#38b764' : '#ff4d6d'); }
      break;
    case 'lampe201':
      r(X + 7, Y, 2, 6, '#566c86'); r(X + 3, Y + 6, 10, 5, '#f4f4f4'); r(X + 4, Y + 11, 8, 1, f.lampe201 ? '#fff1a8' : '#8b9bb4');
      break;
    case 'skjultboks':
      r(X + 2, Y + 1, 12, 14, '#c98b62'); r(X + 2, Y + 1, 12, 1, '#e6cfa0'); r(X + 4, Y + 3, 1, 1, '#5d3a1a'); r(X + 11, Y + 12, 1, 1, '#5d3a1a');
      if ((t.tester || t.kabelsoker) && !lagret.aapnet.skjultboks && Math.floor(tid * 3) % 2) r(X + 7, Y + 7, 2, 2, '#ff4d6d');
      break;
    case 'kabelbro_tom':
      r(X + 2, Y + 7, 2, 2, '#c2c3c7'); r(X + 12, Y + 7, 2, 2, '#c2c3c7');
      if (Q('kabelbro') !== 'ferdig') for (let i = 4; i < 12; i += 3) r(X + i, Y + 8, 2, 1, '#ffcd3c55');
      break;
    case 'stikk':
      r(X + 5, Y + 5, 6, 6, '#f4f4f4'); r(X + 6, Y + 6, 4, 4, '#566c86'); r(X + 7, Y + 7, 2, 2, '#1a1c2c');
      if (lagret.aapnet[o.id]) r(X + 11, Y + 4, 2, 2, '#38b764');
      break;
    case 'arbeidsbryter':
      r(X + 3, Y + 2, 10, 12, '#c2c3c7'); r(X + 4, Y + 3, 8, 10, '#ffcd3c'); r(X + 6, Y + 5, 4, 6, '#b13e53');
      r(X + 7, f.ventFikset ? Y + 4 : Y + 9, 2, 2, '#1a1c2c'); r(X + 7, Y + 14, 2, 2, '#566c86');
      break;
    case 'maakereir':
      r(X + 2, Y + 7, 12, 6, '#8b5a2b'); r(X + 3, Y + 6, 10, 2, '#c98b62'); r(X + 4, Y + 8, 8, 3, '#5d3a1a');
      if (!lagret.aapnet.maakereir) { r(X + 5, Y + 8, 2, 1, '#e08a4c'); r(X + 9, Y + 9, 2, 1, '#ffcd3c'); if (Math.floor(tid * 3) % 4 === 0) r(X + 10, Y + 8, 1, 1, '#ffffff'); }
      break;
    default:
      if (k.startsWith('tr')) {
        const n = Number(k.slice(2)), gjort = n <= (lagret.teller.trafoSteg || 0);
        r(X + 1, Y + 1, 14, 14, '#333c57'); r(X + 2, Y + 2, 12, 12, '#566c86');
        if (n === 1) { r(X + 6, Y + 3, 4, 10, '#1a1c2c'); r(X + 5, gjort ? Y + 9 : Y + 3, 6, 3, '#b13e53'); }
        if (n === 2) { r(X + 5, Y + 6, 6, 6, gjort ? '#ff4d6d' : '#1a1c2c'); r(X + 6, Y + 3, 4, 3, '#c2c3c7'); }
        if (n === 3) { r(X + 4, Y + 5, 3, 3, '#ff4d6d'); r(X + 9, Y + 5, 3, 3, '#1a1c2c'); r(X + 4, Y + 10, 8, 2, '#c2c3c7'); }
        if (n === 4) { r(X + 3, Y + 7, 10, 3, '#38b764'); r(X + 3, Y + 8, 10, 1, '#ffcd3c'); }
        if (n === 5) { r(X + 2, Y + 2, 12, 12, gjort ? '#ef7d57' : '#566c86'); r(X + 4, Y + 4, 8, 1, '#1a1c2c'); r(X + 4, Y + 11, 8, 1, '#1a1c2c'); }
        if (gjort) { r(X + 11, Y, 5, 5, '#38b764'); r(X + 12, Y + 2, 1, 1, '#f4f4f4'); r(X + 13, Y + 3, 2, 1, '#f4f4f4'); }
      }
  }
  if (notert) { r(X + 12, Y - 1, 4, 4, '#38b764'); r(X + 13, Y, 2, 2, '#f4f4f4'); }
}

function tegnSpiller() {
  if (sp.usarbar > 0 && Math.floor(sp.usarbar * 14) % 2) return;
  const X = Math.round(sp.x - kamX) - 1, Y = Math.round(sp.y - kamY) - 8;
  r(X + 1, Y + 14, 10, 2, '#00000044');
  const steg = sp.gaar ? [1, 0, 2, 0][Math.floor(sp.steg) % 4] : 0;
  const fig = figur(sp.retning, steg, spillerPal(), 'p' + (lagret.kosmetikk || ''), sp.zap > 0);
  g.save(); if (sp.retning === 'v') { g.translate(X + 12, Y); g.scale(-1, 1); g.drawImage(fig, 0, 0); } else g.drawImage(fig, X, Y); g.restore();
  if (sp.zap > 0 && lagret.ting.stang) {
    const [dx, dy] = RETN[sp.retning], rek = lagret.ting.isostang ? 18 : 14, cx = X + 6 + dx * rek, cy = Y + 10 + dy * rek;
    r(X + 6 + Math.min(0, dx * rek), Y + 10 + Math.min(0, dy * rek), dx ? Math.abs(dx * rek) : 1, dy ? Math.abs(dy * rek) : 1, lagret.ting.isostang ? '#ef7d57' : '#94b0c2');
    for (let i = 0; i < 3; i++) lyn(cx, cy, cx + (Math.random() - 0.5) * 14, cy + (Math.random() - 0.5) * 14, i ? '#9fe8ff' : '#ffffff');
  }
}
function tegnTyv(t) {
  const X = Math.round(t.x - kamX), Y = Math.round(t.y - kamY);
  r(X + 1, Y + 14, 10, 2, '#00000044');
  const fig = figur(t.retning, t.fase === 'gaa' || t.fase === 'flykt' ? [1, 0, 2, 0][Math.floor(t.steg) % 4] : 0, NPC_PAL.tyv, 'tyv');
  g.save(); if (t.retning === 'v') { g.translate(X + 12, Y); g.scale(-1, 1); g.drawImage(fig, 0, 0); } else g.drawImage(fig, X, Y); g.restore();
  if (t.fase === 'stjel') { r(X + 2, Y + 9, 8, 3, '#e08a4c'); }
}
function tegnBoss() {
  const b = boss, X = Math.round(b.x - kamX), Y = Math.round(b.y - kamY) + Math.round(Math.sin(tid * 4) * 2);
  const aktiv = b.fase === 'lader' || b.fase === 'strale' || b.fase === 'bolge', blink = b.treffT > 0 && Math.floor(b.treffT * 20) % 2;
  r(X + 3, Y + 22, 16, 3, '#00000055');
  const sint = b.trinn >= 3 ? '#ff4d6d' : b.trinn === 2 ? '#c08ae0' : '#41a6f6';
  const ytre = blink ? '#ffffff' : aktiv ? sint : '#566c86', midt = aktiv ? '#9fe8ff' : '#8b9bb4', kjerne = aktiv ? '#ffffff' : '#c2c3c7';
  r(X + 4, Y, 14, 22, ytre); r(X, Y + 4, 22, 14, ytre); r(X + 2, Y + 2, 18, 18, ytre);
  r(X + 4, Y + 4, 14, 14, midt); r(X + 7, Y + 7, 8, 8, kjerne);
  r(X + 6, Y + 8, 3, 3, '#1a1c2c'); r(X + 13, Y + 8, 3, 3, '#1a1c2c'); r(X + 5, Y + 7, 4, 1, '#1a1c2c'); r(X + 13, Y + 7, 4, 1, '#1a1c2c');
  r(X + 8, Y + 14, 6, 2, '#1a1c2c');
  if (aktiv) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.3; lyn(X + 11, Y + 11, X + 11 + Math.round(Math.cos(a) * 18), Y + 11 + Math.round(Math.sin(a) * 18), i % 2 ? '#9fe8ff' : '#ffffff'); }
  // Varsler: ladering, siktelinje og bølgevarsel
  const cx = X + 11, cy = Y + 11;
  if (b.fase === 'lader' && b.t < 0.9) { g.strokeStyle = Math.floor(tid * 12) % 2 ? '#ff4d6d' : '#ffffff'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 12 + b.t * 20, 0, 7); g.stroke(); }
  if (b.fase === 'strale' && b.mal) {
    const ux = b.mal.x - kamX - cx, uy = b.mal.y - kamY - cy, l = Math.hypot(ux, uy) || 1, ex = cx + ux / l * 400, ey = cy + uy / l * 400;
    if (!b.fyrt) { g.strokeStyle = Math.floor(tid * 10) % 2 ? '#ff4d6d' : '#ff4d6d55'; g.setLineDash([3, 3]); g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]); }
    else { g.strokeStyle = '#9fe8ff'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke(); g.lineWidth = 1; }
  }
  if (b.fase === 'bolge') {
    if (b.ring === null || b.ring === undefined) {
      g.strokeStyle = Math.floor(tid * 8) % 2 ? '#ffcd3c' : '#ff4d6d'; g.beginPath(); g.arc(cx, cy, 16 + Math.sin(tid * 20) * 2, 0, 7); g.stroke();
    } else { g.strokeStyle = '#9fe8ff'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, b.ring, 0, 7); g.stroke(); g.lineWidth = 1; }
  }
  if (b.fase !== 'sover') { r(X - 4, Y - 7, 30, 4, '#1a1c2c'); r(X - 3, Y - 6, Math.round(28 * Math.max(0, b.hp) / b.maks), 2, '#ff4d6d'); }
  else if (Math.floor(tid * 1.5) % 2) { r(X + 20, Y - 4, 3, 1, '#c2c3c7'); r(X + 22, Y - 7, 3, 1, '#c2c3c7'); }
}
function tegnGnist(s) {
  const X = Math.round(s.x - kamX), Y = Math.round(s.y - kamY) + Math.round(Math.sin(tid * 8 + s.i));
  r(X, Y, 8, 8, '#41a6f6'); r(X + 1, Y + 1, 6, 6, '#9fe8ff'); r(X + 2, Y + 2, 4, 4, '#ffffff');
  r(X + 2, Y + 3, 1, 1, '#1a1c2c'); r(X + 5, Y + 3, 1, 1, '#1a1c2c');
  for (let i = 0; i < 2; i++) { const a = Math.random() * 6.3; lyn(X + 4, Y + 4, X + 4 + Math.round(Math.cos(a) * 7), Y + 4 + Math.round(Math.sin(a) * 7), '#ffffff'); }
}
function tegnMaake(m) {
  const X = Math.round(m.x - kamX), Y = Math.round(m.y - kamY), vinge = Math.floor(tid * 8 + m.a) % 2;
  if (m.fase === 'sikt') { const sx = Math.round(m.mx - kamX), sy = Math.round(m.my - kamY), k = 1 - m.t; g.fillStyle = 'rgba(0,0,0,' + (0.2 + k * 0.3) + ')'; g.beginPath(); g.ellipse(sx, sy, 4 + k * 5, 2 + k * 2, 0, 0, 7); g.fill(); }
  if (m.fase === 'sover') { r(X - 3, Y - 1, 6, 3, '#f4f4f4'); r(X + 2, Y - 2, 2, 2, '#f4f4f4'); r(X + 4, Y - 1, 1, 1, '#ffcd3c'); return; }
  r(X - 2, Y - 1, 5, 3, '#f4f4f4'); r(X + 3, Y - 1, 2, 1, '#ffcd3c'); r(X + 1, Y - 2, 1, 1, '#1a1c2c');
  if (vinge) { r(X - 6, Y - 3, 4, 1, '#c2c3c7'); r(X + 3, Y - 3, 4, 1, '#c2c3c7'); r(X - 3, Y - 2, 2, 1, '#c2c3c7'); r(X + 2, Y - 2, 2, 1, '#c2c3c7'); }
  else { r(X - 6, Y + 1, 4, 1, '#c2c3c7'); r(X + 3, Y + 1, 4, 1, '#c2c3c7'); }
}

function tegn() {
  r(0, 0, VW, VH, '#0e0f18');
  const kx = Math.round(kamX), ky = Math.round(kamY);
  const x0 = Math.max(0, Math.floor(kx / TS)), y0 = Math.max(0, Math.floor(ky / TS));
  for (let y = y0; y <= y0 + VH / TS + 1 && y < MH; y++) for (let x = x0; x <= x0 + VW / TS + 1 && x < MW; x++) tegnRute(x, y, x * TS - kx, y * TS - ky);

  for (const m of mynter) if (!m.tatt) {
    const X = m.x - kx, Y = m.y - ky + (Math.floor(tid * 3 + m.x) % 2), f = Math.floor(tid * 6 + m.x) % 4, w = [4, 3, 1, 3][f];
    r(X - w / 2, Y - 3, w, 6, '#e08a4c'); r(X - w / 2, Y - 3, 1, 3, '#ffd9a8');
  }
  if (lagret.ting.kabelsoker) for (const m of skjulte) if (!m.tatt && Math.floor(tid * 4 + m.x) % 3 === 0) { r(m.x - kx - 1, m.y - ky - 1, 2, 2, '#ffd9a8'); r(m.x - kx - 3, m.y - ky, 1, 1, '#e08a4c'); r(m.x - kx + 2, m.y - ky, 1, 1, '#e08a4c'); }

  // Objekter og figurer sortert etter y
  const liste = objekter.filter(synlig).map((o) => ({ y: (o.py ?? o.ty * TS) + (o.gjennom ? 0 : 15), f: () => tegnObjekt(o) }));
  liste.push({ y: sp.y + sp.h, f: tegnSpiller });
  for (const s of gnister) if (!s.borte) liste.push({ y: s.y + 8, f: () => tegnGnist(s) });
  for (const t of tyver) liste.push({ y: t.y + 16, f: () => tegnTyv(t) });
  if (boss) liste.push({ y: boss.y + boss.h, f: tegnBoss });
  liste.sort((a, b) => a.y - b.y).forEach((e) => e.f());
  for (const s of skudd) { const X = Math.round(s.x - kx), Y = Math.round(s.y - ky); r(X, Y, 6, 6, '#9fe8ff'); r(X + 1, Y + 1, 4, 4, '#ffffff'); }
  for (const p of gnistRegn) r(Math.round(p.x - kx), Math.round(p.y - ky), 2, 2, Math.random() < 0.5 ? '#ffffff' : '#ffcd3c');
  for (const m of maaker) tegnMaake(m);

  tegnLys(kx, ky);

  // Gløder oppå mørket
  if (boss && boss.fase !== 'sover') glod(boss.x + 11 - kx, boss.y + 11 - ky, 50, 'rgb(65,166,246)', 0.3);
  for (const s of gnister) if (!s.borte) glod(s.x + 4 - kx, s.y + 4 - ky, 14, 'rgb(159,232,255)', 0.25);

  // Snakkebobler, flytende tekst og målpil
  if (boble && !iDialog) tekstBoble(boble.tekst, (boble.o.px ?? boble.o.tx * TS) + 8 - kx, (boble.o.py ?? boble.o.ty * TS) - ky - 2);
  for (const t of tyver) if (t.fase === 'tilbud') tekstBoble('Psst! Billig kobber?', t.x + 6 - kx, t.y - ky);
  else if (t.fase === 'stjel') tekstBoble('...', t.x + 6 - kx, t.y - ky);
  g.font = '6px "Press Start 2P", monospace'; g.textBaseline = 'top';
  for (const f of flyt) { const w = g.measureText(f.tekst).width, X = Math.round(f.x - kx - w / 2), Y = Math.round(f.y - ky);
    g.globalAlpha = Math.min(1, f.t * 2); g.fillStyle = '#1a1c2c'; g.fillText(f.tekst, X + 1, Y + 1); g.fillStyle = f.farge; g.fillText(f.tekst, X, Y); g.globalAlpha = 1; }
  if (tilstand === 'spill' && !iDialog) tegnMaalPil(kx, ky);
}

function tegnLys(kx, ky) {
  const t = lagret.ting, def = OMR[omr], px = sp.x + sp.w / 2 - kx, py = sp.y - ky;
  const lykt = t.lykt2 ? 115 : t.lykt ? 78 : 30, flimmer = Math.sin(tid * 9) * 1.5;
  if (def.mork && def.mork()) {
    startMorke('rgba(4,4,12,' + (def.morkStyrke || 0.96) + ')');
    lys(px, py, lykt + flimmer);
    if (omr === 'kjeller') {
      lys(2 * TS + 8 - kx, 1 * TS + 8 - ky, 40, 0.8);
      if (boss) lys(boss.x + 11 - kx, boss.y + 11 - ky, boss.fase === 'lader' ? 70 + Math.random() * 10 : boss.fase === 'sover' ? 24 : 40, boss.fase === 'sover' ? 0.5 : 1);
      if (!lagret.flagg.ferdig2) lys(25 * TS + 8 - kx, 11 * TS + 14 - ky, 18 + Math.random() * 8, 0.7);
      for (const x of [22, 25, 29]) { const y = x === 22 ? 13 : x === 25 ? 17 : 19; lys(x * TS + 8 - kx, y * TS + 8 - ky, 14, 0.4); }
    }
    if (omr === 'trafo') { lys(9 * TS + 8 - kx, 12 * TS + 8 - ky, 40, 0.8); lys(15 * TS + 8 - kx, 2 * TS - ky, 26 + Math.random() * 4, 0.6); }
    for (const s of skudd) lys(s.x + 3 - kx, s.y + 3 - ky, 16, 0.9);
    for (const s of gnister) if (!s.borte) lys(s.x + 4 - kx, s.y + 4 - ky, 18, 0.8);
    sluttMorke();
    return;
  }
  const nf = def.natt ? nattFaktor() : 0;
  if (nf <= 0) return;
  startMorke('rgba(8,10,34,' + (0.82 * nf) + ')');
  lys(px, py, (t.lykt ? lykt : 44) + flimmer);
  const lamper = objekter.filter((o) => o.type === 'lampe');
  for (const o of lamper) lys(o.tx * TS + 8 - kx, o.ty * TS - ky, 70, 1);
  const x0 = Math.max(0, Math.floor(kx / TS) - 1), y0 = Math.max(0, Math.floor(ky / TS) - 1);
  for (let y = y0; y <= y0 + VH / TS + 2 && y < MH; y++) for (let x = x0; x <= x0 + VW / TS + 2 && x < MW; x++) {
    const ch = kart[y][x];
    if (ch === 'w') lys(x * TS + 8 - kx, y * TS + 10 - ky, 22, 0.8);
    if (ch === 'Q' && x === 45 && y === 33 && lagret.flagg.trafoFerdig) lys(x * TS + 8 - kx, y * TS + 8 - ky, 20, 0.6);
  }
  for (const o of objekter) if (o.id === 'vidar' && synlig(o)) lys(o.px + 8 - kx + (o.retning === 'v' ? -16 : 16), o.py + 10 - ky, 34, 0.8);
  sluttMorke();
  for (const o of lamper) glod(o.tx * TS + 8 - kx, o.ty * TS - 6 - ky, 34, 'rgb(255,241,168)', 0.22 * nf);
}

function tegnMaalPil(kx, ky) {
  const p = maalPunkt(); if (!p) return;
  const X = p.x - kx, Y = p.y - ky, b = Math.round(Math.sin(tid * 5) * 2);
  if (X > 4 && X < VW - 4 && Y > 4 && Y < VH - 4) {
    if (Math.hypot(X - (sp.x + sp.w / 2 - kx), Y - (sp.y - ky)) < 18) return;
    r(X - 3, Y - 18 + b, 7, 2, '#ffcd3c'); r(X - 2, Y - 16 + b, 5, 2, '#ffcd3c'); r(X - 1, Y - 14 + b, 3, 2, '#ffcd3c'); r(X - 3, Y - 19 + b, 7, 1, '#1a1c2c');
    return;
  }
  const cx = VW / 2, cy = VH / 2, a = Math.atan2(Y - cy, X - cx);
  const kant = Math.min((VW / 2 - 14) / Math.abs(Math.cos(a) || 1e-6), (VH / 2 - 14) / Math.abs(Math.sin(a) || 1e-6));
  const ax = cx + Math.cos(a) * kant, ay = cy + Math.sin(a) * kant;
  g.save(); g.translate(Math.round(ax), Math.round(ay)); g.rotate(a);
  g.fillStyle = '#1a1c2c'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-5, -6); g.lineTo(-5, 6); g.closePath(); g.fill();
  g.fillStyle = Math.floor(tid * 3) % 2 ? '#ffcd3c' : '#fff1a8'; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -4); g.lineTo(-4, 4); g.closePath(); g.fill();
  g.restore();
}

// ── Menyer ──────────────────────────────────────────────────────────
function harFremdrift() { return !!(lagret.flagg.oppdrag || lagret.xp || lagret.kobber || Object.keys(lagret.ting).length); }
function visStart() {
  const iGang = harLagring() && harFremdrift();
  $('startKnapp').textContent = iGang ? 'Fortsett' : 'Start';
  $('nyttKnapp').style.display = iGang ? 'block' : 'none';
  let info = '';
  if (lagringsFeil) info += '<p class="feil">' + esc(lagringsFeil) + '</p>';
  if (iGang) info += '<p><b>Lagret spill:</b> ' + esc(NIVAA[nivaa()].navn) + ' · ' + fmtCu(lagret.kobber) + ' Cu · ' + esc((OMR[lagret.omr] || OMR.ute).navn) +
    ' · dag ' + lagret.dag + ', kl. ' + klokkeTekst() + ' · ' + Math.round(lagret.spilletid / 60) + ' min spilt</p>';
  $('startLagring').innerHTML = info;
  $('lagStart').classList.add('vis');
}
function startSpill() {
  $('lagStart').classList.remove('vis'); tilstand = 'spill'; aTrykk = false; oppdaterHud(); oppdaterMaal();
  pip(1, 0.01, 'sine', 0.0001);   // låser opp lyd på mobil
  if (!lagret.flagg.oppdrag) setTimeout(() => melding('Snakk med byggeleder Bjørn i brakka (A / mellomrom). Den gule pila viser veien.', 4.5), 300);
}
function nullstill() {
  lagret = START(); lagringsFeil = ''; lagre(); s1Paa = true; kevin = { aktiv: false, timer: 0, fase: 0 }; gnistRegn = []; fagPraktisk = null; boble = null; varNatt = null;
  byttOmr('ute', undefined, undefined, undefined, true); sp.liv = maksLiv(); oppdaterHud();
}
$('startKnapp').onclick = startSpill;
$('nyttKnapp').onclick = () => { $('lagBekreft').classList.add('vis'); };
$('bekreftNei').onclick = () => { $('lagBekreft').classList.remove('vis'); };
$('bekreftJa').onclick = () => { $('lagBekreft').classList.remove('vis'); nullstill(); startSpill(); };
$('menyKnapp').onclick = () => {
  if (iDialog || (tilstand !== 'spill' && tilstand !== 'meny2')) return;
  lukkLogg(); lukkUtstyr(); lagret.pos = [spTx(), spTy(), sp.retning]; lagre(); tilstand = 'meny'; visStart();
};
const lagreNaa = () => { if (tilstand === 'spill' || tilstand === 'meny2') { lagret.pos = [spTx(), spTy(), sp.retning]; lagret.omr = omr; } lagre(); };
addEventListener('pagehide', lagreNaa);
document.addEventListener('visibilitychange', () => { if (document.hidden) lagreNaa(); });

// ── Oppstart ────────────────────────────────────────────────────────
(function init() {
  const p = Array.isArray(lagret.pos) ? lagret.pos : null;
  byttOmr(lagret.omr || 'ute', p ? p[0] : undefined, p ? p[1] : undefined, p ? p[2] : undefined, true);
  if (kolliderer(sp) || portPaa(spTx(), spTy())) { const s = OMR[omr].start; plasser(s[0], s[1], s[2]); }
  sp.liv = maksLiv(); oppdaterHud(); oppdaterMaal(); visStart();
})();

let sist = performance.now();
function lokke(n) {
  const dt = Math.min(0.05, Math.max(0, (n - sist) / 1000)); sist = n;
  if (tilstand === 'spill') oppdater(dt); else { tid += dt; aTrykk = false; }
  tegn();
  requestAnimationFrame(lokke);
}
requestAnimationFrame(lokke);

// Til testing
window.__eventyr = { sp, get tilstand() { return tilstand; }, lagret: () => lagret, objekter: () => objekter, get iDialog() { return iDialog; },
  get omr() { return omr; }, get boss() { return boss; }, get tyver() { return tyver; }, get gnister() { return gnister; }, get maaker() { return maaker; },
  byttOmr, plasser, handling, nesteMaal, settKlokke: (m) => { lagret.klokke = m; }, samhandle, oppdater };
