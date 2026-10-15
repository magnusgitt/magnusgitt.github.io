// Strømmen må på – utstyr, butikk, verksted, nivåer, rykte og menyene for utstyr og oppdrag.
'use strict';

// ── Utstyr ──────────────────────────────────────────────────────────
// Hver gjenstand har en virkning i spillet. status() sier hva den gjør akkurat nå.
const TING = {
  hjelm: { navn: 'Hjelm og vernesko', ikon: 'hjelm', tekst: 'Påbudt på byggeplassen. Uten dette slipper ikke Hilde deg inn.', status: () => 'På deg' },
  tester: { navn: 'Spenningstester', ikon: 'tester', tekst: 'Viser om kabler er spenningssatt (rødt) eller spenningsløse (grønt). Avslører skjulte ledninger i vegger.', status: () => 'Viser spenning og skjulte ledninger' },
  stang: { navn: 'Jordingsstang', ikon: 'stang', tekst: 'Trykk A for å jorde og kortslutte gnister og elektriske anomalier foran deg.', status: () => lagret.ting.isostang ? 'Oppgradert til isolert' : 'Kort rekkevidde' },
  isostang: { navn: 'Isolert jordingsstang', ikon: 'isostang', tekst: 'Oppgradering: lengre rekkevidde og dobbel effekt mot Lysbuen.', status: () => 'Aktiv' },
  laas: { navn: 'Lås og skilt', ikon: 'laas', tekst: 'Sikrer en bryter mot innkobling. Brukes når du frakobler, så ingen slår på igjen.', status: () => 'Klar til bruk' },
  iso: { navn: 'Isolasjonstester', ikon: 'iso', tekst: 'Måler isolasjonsmotstand (500 V DC) på frakoblede kurser. Under 1 MΩ er for lavt.', status: () => 'Brukes ved fordelinger' },
  lykt: { navn: 'Hodelykt', ikon: 'lykt', tekst: 'Lyser opp mørke rom og natta. Uten den ser du bare rett rundt deg.', status: () => lagret.ting.lykt2 ? 'Oppgradert: stor lyskjegle' : 'Vanlig lyskjegle' },
  lykt2: { navn: 'Hodelykt+', ikon: 'lykt2', tekst: 'Oppgradering: mye større lyskjegle i mørket og om natta.', status: () => 'Aktiv' },
  visir: { navn: 'Lysbuevisir og -dress', ikon: 'visir', tekst: 'Påbudt i tavlerommet og trafokiosken. Halverer skade fra lysbuer og energibølger.', status: () => 'Tas på ved tavler' },
  sele: { navn: 'Fallsikringssele', ikon: 'sele', tekst: 'Gir adgang til taket gjennom takluka i 2. etasje.', status: () => 'Klar' },
  termo: { navn: 'Termokamera', ikon: 'termo', tekst: 'Viser varmgang i koblinger. Avslører den varme koblingen i tavler uten at du må gjette.', status: () => 'Viser varmgang' },
  kabelsoker: { navn: 'Kabelsøker', ikon: 'kabelsoker', tekst: 'Piper ved skjulte kabler og funn. Viser gjemt kobber som glimter.', status: () => 'Viser skjulte funn' },
  hjerte: { navn: 'Førstehjelpsskrin', ikon: 'hjerte', tekst: 'Ett hjerte mer å gå på.', status: () => '+1 hjerte' },
  hjerte2: { navn: 'Stort førstehjelpsskrin', ikon: 'hjerte', tekst: 'Enda ett hjerte mer.', status: () => '+1 hjerte' },
  nokkel: { navn: 'Nøkkel til trafokiosken', ikon: 'nokkel', tekst: 'Fra Bjørn. Låser opp kiosken på sørtomta.', status: () => 'Låser opp kiosken' },
  gullhjelm: { navn: 'Gullhjelm', ikon: 'gullhjelm', tekst: 'Helt unødvendig. Helt nødvendig.', kosmetisk: true },
  rosahjelm: { navn: 'Rosa hjelm', ikon: 'rosahjelm', tekst: 'Tore sier den er «modig». Han mener det ikke som et kompliment.', kosmetisk: true },
  // Oppdragsting
  trommel: { navn: 'Lilla kabeltrommel', ikon: 'trommel', tekst: 'Det står ROGER på den med tusj. Noen har prøvd å skrape det bort.', oppdrag: true },
  skrutrekker: { navn: 'Venstrehendt skrutrekker', ikon: 'skrutrekker', tekst: 'En helt vanlig skrutrekker. Noen har skrevet VENSTRE på skaftet.', oppdrag: true },
  multimeter: { navn: 'Multimeteret til Mats', ikon: 'iso', tekst: 'Står på «ohm». Har stått der siden 2014.', oppdrag: true },
  avbiter: { navn: 'Avbitertanga til Mats', ikon: 'stang', tekst: 'Navnet MATS er risset inn. Tre ganger.', oppdrag: true },
  vater: { navn: 'Vaterpasset til Mats', ikon: 'verktoy', tekst: 'Boblen står litt skjevt. Akkurat som bygget.', oppdrag: true },
  kniv: { navn: 'Kabelkniven til Mats', ikon: 'verktoy', tekst: 'Lå i kjøleskapet. Ved siden av en yoghurt.', oppdrag: true },
};
const TING_REKKEFOLGE = ['hjelm', 'tester', 'stang', 'isostang', 'laas', 'iso', 'lykt', 'lykt2', 'visir', 'sele', 'termo', 'kabelsoker', 'hjerte', 'hjerte2', 'nokkel', 'gullhjelm', 'rosahjelm'];
const OPPDRAGSTING = ['trommel', 'skrutrekker', 'multimeter', 'avbiter', 'vater', 'kniv'];

// ── Nivåer og ferdigheter (spill-titler, ikke ekte autorisasjoner) ──
const NIVAA = [
  { xp: 0, navn: 'Lærling', ferdighet: 'Du kan bære en kabeltrommel. Nesten.' },
  { xp: 120, navn: 'Elektriker', ferdighet: '+1 hjerte' },
  { xp: 300, navn: 'Selvstendig montør', ferdighet: 'Raskere gange (du vet hvor du skal)' },
  { xp: 550, navn: 'Bas', ferdighet: '15 % rabatt hos Grete, og gnister gir dobbelt kobber' },
  { xp: 850, navn: 'Elektroinstallatør', ferdighet: '+1 hjerte, og alle hilser når du kommer' },
];
function nivaa() { let n = 0; NIVAA.forEach((l, i) => { if (lagret.xp >= l.xp) n = i; }); return n; }
const maksLiv = () => 6 + (lagret.ting.hjerte ? 2 : 0) + (lagret.ting.hjerte2 ? 2 : 0) + (nivaa() >= 1 ? 2 : 0) + (nivaa() >= 4 ? 2 : 0);
const fart = () => (nivaa() >= 2 ? 76 : 64);

function giXp(n, grunn) {
  const foer = nivaa(); lagret.xp += n; lagre();
  if (nivaa() > foer) {
    sp.liv = maksLiv(); setTimeout(fanfare, 300);
    const l = NIVAA[nivaa()];
    melding('NYTT NIVÅ: ' + l.navn.toUpperCase() + '! ' + l.ferdighet + '.', 4.5);
  } else if (grunn) flyteTekst('+' + n + ' XP', '#a7f070');
  oppdaterHud();
}
function giCu(gram, stille) {
  lagret.kobber = Math.max(0, lagret.kobber + gram); lagre(); oppdaterHud();
  if (!stille && gram) flyteTekst((gram > 0 ? '+' : '') + fmtCu(gram) + ' Cu', '#e08a4c');
}

// ── Rykte ───────────────────────────────────────────────────────────
// Positivt = den ryddige montøren, negativt = cowboyen. Bare for moro i spillets verden.
function endreRykte(n, hva) {
  lagret.rykte = Math.max(-10, Math.min(10, lagret.rykte + n));
  lagret.hendelser = lagret.hendelser || [];
  if (hva) { lagret.hendelser.unshift({ tekst: hva, n }); lagret.hendelser.length = Math.min(lagret.hendelser.length, 14); }
  lagre();
  if (n) flyteTekst(n > 0 ? 'Ryddig +' + n : 'Cowboy ' + (-n), n > 0 ? '#38b764' : '#ef7d57');
}
const erRyddig = () => lagret.rykte >= 4, erCowboy = () => lagret.rykte <= -4;
const rykteNavn = () => erRyddig() ? 'Den ryddige montøren' : erCowboy() ? 'Cowboyen' : 'Uskrevet blad';
const rykteTekst = () => erRyddig() ? 'Folk stoler på deg. Grete selger deg spesialutstyr, og Bjørn gir deg viktigere oppdrag.'
  : erCowboy() ? 'Kollegaene himler med øynene. Grete tar cowboytillegg, og Hilde vil ha ekstra kontroller.'
  : 'Ingen vet helt hva de skal tro om deg ennå. Valgene dine bestemmer det.';

// ── Butikken til Grete ──────────────────────────────────────────────
const BUTIKK = [
  { id: 'visir', pris: 1000, effekt: 'Påbudt i tavlerommet og trafokiosken. Halverer skade fra lysbuer.' },
  { id: 'isostang', pris: 800, effekt: 'Jordingsstangen får lengre rekkevidde og dobbel effekt.', krav: () => !lagret.ting.stang && 'Krever jordingsstang' },
  { id: 'lykt2', pris: 700, effekt: 'Hodelykta får mye større lyskjegle.', krav: () => !lagret.ting.lykt && 'Krever hodelykt' },
  { id: 'sele', pris: 1200, effekt: 'Gir adgang til taket. (Hilde gir deg en gratis hvis du går vernerunden.)' },
  { id: 'kabelsoker', pris: 500, effekt: 'Viser skjulte kabler og gjemt kobber.' },
  { id: 'hjerte', pris: 600, effekt: '+1 hjerte.' },
  { id: 'hjerte2', pris: 900, effekt: '+1 hjerte til.', krav: () => !lagret.ting.hjerte && 'Kjøp det lille skrinet først' },
  { id: 'termo', pris: 1500, effekt: 'Viser varmgang i tavler. Gjør feilsøking i trafokiosken mye enklere.', krav: () => !erRyddig() && 'Selges bare til ryddige montører' },
  { id: 'rosahjelm', pris: 300, effekt: 'Kosmetisk. Ingen virkning, bortsett fra på Tore.' },
  { id: 'gullhjelm', pris: 2500, effekt: 'Kosmetisk. Glinser i sola.' },
];
function prisFor(v) {
  let p = v.pris;
  if (nivaa() >= 3) p *= 0.85;
  if (erCowboy()) p *= 1.2;
  return Math.round(p / 10) * 10;
}

// ── Verkstedbenken ──────────────────────────────────────────────────
const OPPSKRIFTER = [
  { id: 'lykt2', skrap: 2, cu: 300, krav: () => !lagret.ting.lykt && 'Krever hodelykt' },
  { id: 'isostang', skrap: 3, cu: 400, krav: () => !lagret.ting.stang && 'Krever jordingsstang' },
  { id: 'kabelsoker', skrap: 2, cu: 200 },
  { id: 'hjerte', skrap: 4, cu: 300 },
  { id: 'hjerte2', skrap: 5, cu: 400, krav: () => !lagret.ting.hjerte && 'Lag det lille skrinet først' },
];
const skrap = () => lagret.teller.skrap || 0;

function faaTing(id, stille) {
  lagret.ting[id] = true; lagre(); oppdaterHud();
  if (!stille) fanfare();
  if (id === 'hjerte' || id === 'hjerte2') { sp.liv = maksLiv(); oppdaterHud(); }
}
function mistTing(id) { delete lagret.ting[id]; lagre(); oppdaterHud(); }

// ── HUD ─────────────────────────────────────────────────────────────
$('utstyrKnapp').appendChild(ikonCanvas('sekk'));
$('loggKnapp').appendChild(ikonCanvas('logg'));
function oppdaterHud() {
  let l = '';
  for (let i = 0; i < maksLiv() / 2; i++) l += sp.liv >= (i + 1) * 2 ? '♥' : sp.liv === i * 2 + 1 ? '♥' : '♡';
  $('hudLiv').textContent = l;
  $('hudKobber').textContent = fmtCu(lagret.kobber) + ' Cu';
  $('hudNivaa').textContent = 'Nv' + (nivaa() + 1);
  $('hudKlokke').textContent = klokkeTekst();
}
const klokkeTekst = () => { const m = Math.floor(lagret.klokke) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };

// ── Utstyrsmenyen ───────────────────────────────────────────────────
function visUtstyr() {
  const t = lagret.ting;
  const kort = (id, mangler) => {
    const d = TING[id];
    const status = mangler ? 'Ikke funnet ennå' : d.kosmetisk ? (lagret.kosmetikk === id ? 'Har den på (trykk for å ta av)' : 'Trykk for å ta på') : d.status ? d.status() : '';
    return '<div class="gjenstand' + (mangler ? ' mangler' : '') + '" data-id="' + id + '"><canvas width="10" height="10" data-ikon="' + d.ikon + '"></canvas><div><b>' +
      (mangler ? '???' : esc(d.navn)) + '</b>' + (mangler ? '' : esc(d.tekst)) + '<span class="status">' + esc(status) + '</span></div></div>';
  };
  let h = '<div class="rutenett">' + TING_REKKEFOLGE.filter((id) => t[id] || !TING[id].kosmetisk).map((id) => kort(id, !t[id])).join('') + '</div>';
  const ot = OPPDRAGSTING.filter((id) => t[id]);
  h += '<h2>Ting til oppdrag</h2>' + (ot.length ? '<div class="rutenett">' + ot.map((id) => kort(id, false)).join('') + '</div>' : '<p>Ingen ting akkurat nå.</p>');
  h += '<h2>Materialer</h2><div class="rutenett">' +
    '<div class="gjenstand"><canvas width="10" height="10" data-ikon="kobber"></canvas><div><b>Kobber: ' + fmtCu(lagret.kobber) + '</b>Valuta. 1 kg = 1000 g, 1 t = 1000 kg.<span class="status">Brukes hos Grete og på verkstedbenken</span></div></div>' +
    '<div class="gjenstand"><canvas width="10" height="10" data-ikon="skrap"></canvas><div><b>Skrapkobber: ' + skrap() + ' stk</b>Overskuddsmateriell fra plassen.<span class="status">Lever til gjenvinning (150 g) eller bruk på verkstedbenken</span></div></div>' +
    ((lagret.teller.spor || 0) ? '<div class="gjenstand"><canvas width="10" height="10" data-ikon="spor"></canvas><div><b>Ledetråder: ' + lagret.teller.spor + ' av 3</b>Etter kobbertyvene.<span class="status">Vis dem til vekteren</span></div></div>' : '') +
    '</div>';
  $('utstyrInnhold').innerHTML = h;
  $('utstyrInnhold').querySelectorAll('canvas[data-ikon]').forEach((cv) => cv.getContext('2d').drawImage(ikon(cv.dataset.ikon), 0, 0));
  $('utstyrInnhold').querySelectorAll('.gjenstand[data-id]').forEach((el) => {
    const id = el.dataset.id;
    if (TING[id].kosmetisk && t[id]) el.style.cursor = 'pointer', el.onclick = () => { lagret.kosmetikk = lagret.kosmetikk === id ? null : id; lagre(); visUtstyr(); };
  });
  $('lagUtstyr').classList.add('vis'); if (tilstand === 'spill') tilstand = 'meny2';
}
function lukkUtstyr() { $('lagUtstyr').classList.remove('vis'); if (tilstand === 'meny2') tilstand = 'spill'; }
$('utstyrKnapp').onclick = () => { if (!iDialog && tilstand === 'spill') visUtstyr(); };
$('utstyrLukk').onclick = lukkUtstyr;

// ── Oppdragsloggen ──────────────────────────────────────────────────
function visLogg() {
  const n = nivaa(), neste = NIVAA[n + 1];
  const pst = neste ? Math.round((lagret.xp - NIVAA[n].xp) / (neste.xp - NIVAA[n].xp) * 100) : 100;
  let h = '<p><b style="color:#a7f070">' + NIVAA[n].navn + '</b> · ' + lagret.xp + ' XP' + (neste ? ' (neste: ' + neste.navn + ' ved ' + neste.xp + ')' : '') + '</p>' +
    '<div class="xpbar"><div style="width:' + pst + '%"></div></div>';
  const m = nesteMaal();
  h += '<div class="oppd aktiv"><b>Neste mål</b><span class="maal">' + esc(m.tekst) + '</span></div>';
  h += '<h2>Rykte: ' + rykteNavn() + '</h2><div class="rykte"><i style="left:' + ((lagret.rykte + 10) * 5) + '%"></i></div>' +
    '<div class="rykteskala"><span>Cowboy</span><span>Ryddig</span></div><p class="smaa">' + rykteTekst() + '</p>';
  const rader = oppdragsListe();
  const aktive = rader.filter((q) => !q.ferdig), ferdige = rader.filter((q) => q.ferdig);
  const rad = (q) => '<div class="oppd ' + (q.ferdig ? 'ferdig' : 'aktiv') + '"><b>' + (q.ferdig ? '✓ ' : '○ ') + esc(q.navn) + (q.hoved ? ' (hovedoppdrag)' : '') + '</b><br>' + esc(q.tekst) +
    (!q.ferdig && q.maal ? '<span class="maal">Mål: ' + esc(q.maal) + '</span>' : '') +
    (q.lonn ? '<span class="lonn">' + (q.ferdig ? 'Fikk: ' : 'Belønning: ') + esc(q.lonn) + '</span>' : '') +
    (q.valg ? '<span class="valgt">Ditt valg: ' + esc(q.valg) + '</span>' : '') + '</div>';
  h += '<h2>Aktive oppdrag (' + aktive.length + ')</h2>' + (aktive.map(rad).join('') || '<p>Ingen aktive akkurat nå. Snakk med folk på plassen!</p>');
  if (ferdige.length) h += '<h2>Fullført (' + ferdige.length + ')</h2>' + ferdige.map(rad).join('');
  const uoppdaget = Object.keys(OPPDRAG).filter((id) => !OPPDRAG[id].hoved && !lagret.oppdrag[id]).length;
  if (uoppdaget) h += '<p class="smaa">' + uoppdaget + ' sideoppdrag er ikke oppdaget ennå. Prat med folk og undersøk ting.</p>';
  h += '<h2>Ferdigheter</h2>' + NIVAA.slice(1).map((l, i) => '<div class="ferdighet' + (n >= i + 1 ? '' : ' laast') + '">' + (n >= i + 1 ? '✓ ' : '🔒 ') + l.navn + ': ' + l.ferdighet + '</div>').join('');
  if ((lagret.hendelser || []).length) h += '<h2>Valg og konsekvenser</h2>' + lagret.hendelser.map((e) => '<div class="ferdighet">' + (e.n > 0 ? '▲ ' : e.n < 0 ? '▼ ' : '• ') + esc(e.tekst) + '</div>').join('');
  $('loggInnhold').innerHTML = h;
  $('lagLogg').classList.add('vis'); if (tilstand === 'spill') tilstand = 'meny2';
}
function lukkLogg() { $('lagLogg').classList.remove('vis'); if (tilstand === 'meny2') tilstand = 'spill'; }
$('loggKnapp').onclick = () => { if (!iDialog && tilstand === 'spill') visLogg(); };
$('loggLukk').onclick = lukkLogg;
tastLyttere.push((e) => {
  if (e.repeat) return false;
  if (e.code === 'KeyQ' && !iDialog) { if ($('lagLogg').classList.contains('vis')) lukkLogg(); else if (tilstand === 'spill') visLogg(); return true; }
  if (e.code === 'KeyI' && !iDialog) { if ($('lagUtstyr').classList.contains('vis')) lukkUtstyr(); else if (tilstand === 'spill') visUtstyr(); return true; }
  if (e.code === 'Escape') {
    if ($('lagLogg').classList.contains('vis')) lukkLogg(); else if ($('lagUtstyr').classList.contains('vis')) lukkUtstyr();
    else if (tilstand === 'spill' && !iDialog) $('menyKnapp').onclick();
    return true;
  }
  return false;
});
