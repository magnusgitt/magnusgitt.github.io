// Strømmen må på – hovedhistorien, sideoppdrag og alt folk sier.
'use strict';

// ── Oppdragsoversikt ────────────────────────────────────────────────
// lagret.oppdrag[id] = 'aktiv', 'ferdig' eller en egen slutt (f.eks. 'lurt'). lagret.valg[id] = hva spilleren valgte.
const F = () => lagret.flagg, T = () => lagret.ting, Q = (id) => lagret.oppdrag[id];
const OPPDRAG = {
  skrutrekker: { navn: 'Den venstrehendte skrutrekkeren', giver: 'Kevin', lonn: 'Opptil 300 g Cu og 60 XP',
    tekst: { aktiv: 'Kevin trenger en venstrehendt skrutrekker til et «spesialprosjekt». Finnes den i det hele tatt?',
      ferdig: 'Kevin vet nå litt mer om livet på byggeplassen.', lurt: 'Du sendte Kevin til bajamajaen. Han glemmer det aldri.',
      funnet: 'Du fant en skrutrekker med VENSTRE skrevet på. Kevin har rammet den inn.' },
    maal: () => 'Finn skrutrekkeren (kanskje i et skap?) eller si sannheten til Kevin' },
  skrue: { navn: 'Skruen bak gipsen', giver: 'Bjørn', lonn: 'Opptil 300 g Cu og 60 XP',
    tekst: { aktiv: 'Noen skrudde gjennom kabelen i bygg B. Undersøk veggen, snakk med vitner og finn ut hva som skjedde.',
      ferdig: 'Saken med Tore er avgjort og dokumentert.', skjult: 'Du sparklet over hullet. Ingen papirer. Hilde lurer.' },
    maal: () => !F().sporGips ? 'Undersøk den nye gipsveggen inne i bygg B' : !(F().vitneRoger || F().vitneKevin) ? 'Spør Roger eller Kevin om de så noe' : 'Konfronter Tore på riggplassen med bevisene' },
  trommel: { navn: 'Den lilla kabeltrommelen', giver: 'Roger', lonn: 'Finnerlønn',
    tekst: { aktiv: 'Roger har mistet en lilla kabeltrommel. Flere hevder at den er deres.',
      ferdig: 'Roger fikk trommelen sin igjen.', solgt: 'Du solgte trommelen til Grete. Roger vet det.', tore: 'Du ga trommelen til Tore. Den er et bord nå.' },
    maal: () => !T().trommel ? 'Let etter trommelen. Kanskje noen har kastet den?' : 'Finn ut hvem den egentlig tilhører, og gi den til riktig person' },
  verktoy: { navn: 'Montøren uten verktøy', giver: 'Mats', lonn: 'Kabelsøker, 400 g Cu og 70 XP',
    tekst: { aktiv: 'Mats har lagt fra seg alt verktøyet sitt rundt omkring på plassen.', ferdig: 'Mats har alt verktøyet sitt igjen. Han har allerede glemt hvor han la kaffen.' },
    maal: () => 'Finn multimeter, avbitertang, vaterpass og kabelkniv (' + verktoyFunnet() + ' av 4)' },
  kabelbro: { navn: 'Kabelbroen som ikke finnes', giver: 'Tegningen på møterommet', lonn: '300 g Cu og 70 XP',
    tekst: { aktiv: 'Ifølge tegningen er kabelbroen i korridoren i 2. etasje ferdig.', ferdig: 'Tegningen er oppdatert og avviket skrevet.',
      tak: 'Kabelen ligger riktig. Bare ikke der den skal.' },
    maal: () => !F().broSjekket ? 'Sjekk korridoren i 2. etasje' : !F().broFunnet ? 'Finn ut hvor kabelbroen ble av (spør rundt, eller se høyere opp)' : 'Rapporter til Bjørn i brakka' },
  fremdrift: { navn: 'Fremdriftsplanen', giver: 'Bjørn', lonn: '60 XP',
    tekst: { aktiv: 'Bjørn sier planen er oppdatert. Planen sier noe annet.', ferdig: 'Planen viser hvordan det faktisk går.', pynt: 'Fremdriftsplanen er oppdatert. Ingen vet med hva.' },
    maal: () => fremdriftSpurt() < 3 ? 'Spør Tore, Roger og Mats hvordan det egentlig går (' + fremdriftSpurt() + ' av 3)' : 'Gå tilbake til Bjørn' },
  cirka: { navn: 'Cirka en del', giver: 'Grete', lonn: '400 g Cu og 60 XP',
    tekst: { aktiv: 'Bestillingen sier «cirka en del stikkontakter». Grete kan ikke sende «cirka».', ferdig: 'Grete fikk et ekte tall.', cirka: 'Grete sender cirka. Ingen vet hvor mye.' },
    maal: () => 'Tell manglende stikkontakter i 2. etasje (' + stikkTalt() + ' funnet), og si tallet til Grete' },
  vernerunde: { navn: 'Vernerunden', giver: 'Hilde', lonn: 'Fallsikringssele, 300 g Cu og 80 XP',
    tekst: { aktiv: 'Finn fem feil og mangler på plassen og i bygg B.', ferdig: 'Alle feilene er rapportert og rettet. Hilde smilte nesten.' },
    maal: () => vernFunnet() < 5 ? 'Finn feil og mangler (' + vernFunnet() + ' av 5). Se etter vann, stiger, nødutganger, grøfter og sjakter' : 'Gå tilbake til Hilde' },
  sondre: { navn: 'Den smarte løsningen', giver: 'Sondre', lonn: '300 g Cu og 70 XP',
    tekst: { aktiv: 'Sondre har laget et relésystem med 14 releer for å tenne én lampe. Den tennes ikke.',
      enkel: 'Lampa styres nå av en vanlig bryter. Sondre er skuffet, men lampa lyser.', skjema: 'Systemet ble beholdt, men nå finnes det et skjema.',
      bluetooth: 'Lampa kan nå styres fra Oslo. Ingen vet hvorfor.' },
    maal: () => !F().lampe201 ? 'Få lampa til å lyse (se på relépanelet i leilighet 201)' : 'Snakk med Sondre' },
  tyver: { navn: 'Kobbertyvene', giver: 'Vidar (vekter)', lonn: '800 g Cu og 90 XP',
    tekst: { aktiv: 'Kobbertyver kommer om natta. Ikke ta dem selv: finn spor og meld fra til Vidar.', ferdig: 'Politiet har sporene. Kabeltromlene er trygge.' },
    maal: () => (lagret.teller.spor || 0) < 3 ? 'Skrem bort tyvene om natta og finn spor (' + (lagret.teller.spor || 0) + ' av 3). Tyvene går etter kabeltromlene på sørtomta' : 'Gi sporene til Vidar (om natta)' },
  vifte: { navn: 'Viften på taket', giver: 'Arbeidsbryteren', lonn: '50 XP',
    tekst: { aktiv: 'Ventilasjonsaggregatet står stille.', ferdig: 'Viften går, og ingen sto inni den.', cowboy: 'Viften går. Roger sto inni den. Han har det fint. Nesten.' },
    maal: () => 'Finn ut hvorfor aggregatet står' },
};
const verktoyFunnet = () => ['multimeter', 'avbiter', 'vater', 'kniv'].filter((id) => T()[id] || F()['levert_' + id]).length;
const fremdriftSpurt = () => ['fs_tore', 'fs_roger', 'fs_mats'].filter((k) => F()[k]).length;
const stikkTalt = () => ['stikk1', 'stikk2', 'stikk3', 'stikk4', 'stikk5'].filter((k) => lagret.aapnet[k]).length;
const VERN = ['feil_skjote', 'feil_stige', 'feil_nodutgang', 'feil_grofta', 'feil_sjakt'];
const vernFunnet = () => VERN.filter((k) => F()['vern_' + k]).length;

function startOppdrag(id) {
  if (lagret.oppdrag[id]) return;
  lagret.oppdrag[id] = 'aktiv'; lagre(); LYD.oppdrag();
  melding('Nytt oppdrag: ' + OPPDRAG[id].navn + '. Se oppdragsloggen.', 3.5);
}
function fullforOppdrag(id, status = 'ferdig', valgTekst) {
  lagret.oppdrag[id] = status; if (valgTekst) lagret.valg[id] = valgTekst; lagre();
  setTimeout(() => { LYD.oppdrag(); melding('Oppdrag fullført: ' + OPPDRAG[id].navn, 3); }, 250);
}

function oppdragsListe() {
  const f = F(), rader = [];
  const hoved = (navn, ferdig, tekst, maal, lonn) => rader.push({ navn, ferdig, tekst, maal, lonn, hoved: true });
  hoved('Strøm i bygg B', !!f.ferdig, f.ferdig ? 'Isolasjonsfeilen på kurs 2 ble funnet og rettet.' : 'Bygg B har mistet strømmen, og det er innflytting i morgen.', nesteMaal().tekst, '1 kg Cu og 100 XP');
  if (f.ferdig) hoved('Lysbuen i kjelleren', !!f.ferdig2, f.ferdig2 ? 'Lysbuen er slukket. Årsaken var en løs forbindelse med varmgang.' : 'Noe smeller i hovedtavla, og lyset i kjelleren er borte.', nesteMaal().tekst, '1,5 kg Cu og 250 XP');
  if (f.ferdig2) hoved('Rapport til byggelederen', !!f.rapport, f.rapport ? 'Rapporten er levert.' : 'Bjørn vil ha en rapport om hva som skjedde.', nesteMaal().tekst, '1 kg Cu og XP');
  if (f.rapport) hoved('Trafokiosken', !!f.trafoFerdig, f.trafoFerdig ? 'Forsyningen til riggplassen er stabil igjen.' : 'Strømmen til riggplassen faller ut. Feilen er i trafokiosken på sørtomta.', nesteMaal().tekst, '2 kg Cu og 150 XP');
  if (f.trafoFerdig) hoved('Fagprøven', !!f.fagBestatt, f.fagBestatt ? 'Bestått! Sensor Solveig nikket. Det skjer aldri.' : 'Den siste prøven. Sikkerhet, feilsøking, verktøy, praksis og problemløsning.', nesteMaal().tekst, '3 kg Cu og 250 XP');
  for (const [id, st] of Object.entries(lagret.oppdrag)) {
    const o = OPPDRAG[id]; if (!o) continue;
    rader.push({ navn: o.navn, ferdig: st !== 'aktiv', tekst: (o.tekst[st] || o.tekst.ferdig) + ' (Fra ' + o.giver + ')', maal: st === 'aktiv' ? o.maal() : '', lonn: o.lonn, valg: lagret.valg[id] });
  }
  return rader;
}

// ── Neste mål (vises øverst og som pil) ─────────────────────────────
function nesteMaal() {
  const f = F(), t = T(), m = (tekst, o, x, y) => ({ tekst, omr: o, x, y });
  if (!f.oppdrag) return m('Snakk med byggeleder Bjørn i brakka', 'ute', 5, 18);
  if (!t.hjelm) return m('Hent hjelm og vernesko i kista i brakka', 'ute', 3, 17);
  if (!f.hildeFlyttet) return m('Vis Hilde ved porten at du har verneutstyr', 'ute', 13, 23);
  if (!t.tester) return m('Finn spenningstesteren ved containerne', 'ute', 26, 27);
  if (!t.iso) {
    if (s1Paa) return m('Frakoble byggestrømmen til bygg B i skapet ved inngangen', 'ute', 37, 22);
    if (!f.s1Laast && !t.laas) return m('Finn lås og skilt nord for kabelfeltet, så ingen kobler inn igjen', 'ute', 26, 2);
    if (!f.s1Laast) return m('Lås og merk bryteren i byggestrømskapet', 'ute', 37, 22);
    return m('Hent isolasjonstesteren inne i bygg B', 'ute', 31, 10);
  }
  if (!f.ferdig) return m('Mål kursene i fordelingen i bygg B og finn feilen', 'ute', 35, 9);
  if (!t.visir) return erNatt() ? m('Kjøp lysbuevisir hos Grete. Hun kommer kl. 07 (hvil på sofaen i garderoben)', 'ute', 53, 6) : m('Kjøp lysbuevisir hos Grete ved varebilen', 'ute', 34, 3);
  if (!t.lykt) return m('Finn hodelykta på lageret i kjelleren (trappa er i bygg B)', 'kjeller', 29, 2);
  if (!f.bossBeseiret) return m('Slukk Lysbuen i tavlerommet i kjelleren', 'kjeller', 20, 17);
  if (!f.ferdig2) return m('Finn årsaken i hovedtavla', 'kjeller', 25, 12);
  if (!f.rapport) return m('Lever rapport til Bjørn i brakka', 'ute', 5, 18);
  if (Q('vernerunde') !== 'ferdig') return Q('vernerunde') === 'aktiv' ? m(OPPDRAG.vernerunde.maal(), 'ute', 12, 24) : m('Hilde skal gå vernerunde. Snakk med henne ved porten', 'ute', 12, 24);
  if (!t.nokkel) return erCowboy() && !f.ekstraKontroll ? m('Ta den ekstra kontrollen hos Hilde', 'ute', 12, 24) : m('Hent nøkkelen til trafokiosken hos Bjørn', 'ute', 5, 18);
  if (!f.trafoApen) return m('Lås opp trafokiosken på sørtomta', 'ute', 47, 32);
  if (!f.trafoFerdig) return (lagret.teller.trafoSteg || 0) < 5 ? m('Sikre anlegget i kiosken med de fem sikkerhetsreglene', 'trafo', 4, 5) : m('Finn feilen i lavspenttavla', 'trafo', 15, 2);
  if (!f.fagBestatt) return nivaa() < 2 ? m('Bli selvstendig montør (nivå 3) før fagprøven. Gjør sideoppdrag!', 'ute', 20, 33) : m('Ta fagprøven i brakka på sørtomta', 'ute', 20, 33);
  const aktiv = Object.keys(lagret.oppdrag).find((id) => lagret.oppdrag[id] === 'aktiv');
  if (aktiv) return m(OPPDRAG[aktiv].navn + ': ' + OPPDRAG[aktiv].maal(), null);
  return m('Alt er gjort! Utforsk, finn skjulte funn og samle kobber.', null);
}

// ── Småprat i snakkebobler ──────────────────────────────────────────
const PRAT = {
  byggeleder: () => ['Fremdriftsplanen er oppdatert.', 'Innflytting i morgen. Eller neste uke.', erCowboy() ? 'Du er rask, men papirene...' : 'Hvor er kaffen min?'],
  hilde: () => ['Hjelm på!', 'Avviket er lukket. Problemet består.', erCowboy() ? 'Jeg følger med på deg.' : erRyddig() ? 'Endelig noen som dokumenterer.' : 'Har noen sett yoghurten min?'],
  kevin: () => ['Er ohm-meteret ladet?', 'Hvor er kabelstrekk-olja?', lagret.oppdrag.skrutrekker === 'lurt' ? 'Jeg glemmer ikke...' : 'Tore! Har du drillen min?'],
  tore: () => ['Vater? Øyemål holder.', 'Roger! Hvem tok brødskiva?', erCowboy() ? 'Endelig en elektriker som meg!' : 'Strøm er bare moter.'],
  roger: () => ['Det var måkene.', 'Rørene er levert. I emballasje.', lagret.oppdrag.trommel === 'solgt' ? 'Jeg vet hva du gjorde.' : 'Lilla er en fin farge.'],
  grete: () => ['Kobber, kom hit med kobber!', 'Ingen «cirka» i ordre!', 'Jeg spør ikke hvor det kommer fra.'],
  mats: () => ['Hvor la jeg kaffen?', 'Har noen sett vaterpasset?', 'Kabelen ligger riktig. Bare ikke der den skal.'],
  sondre: () => ['14 releer er ikke for mye!', 'Har du hørt om PLS?', 'Lyset kan styres fra Oslo.'],
  vidar: () => ['Stille natt. For stille.', 'Lommelykta er ladet.', 'Så du noe ved tromlene?'],
  sensor: () => ['Kandidat?', 'Jeg har sett alt.', 'Rekkefølgen er alt.'],
};

// ── Samhandling ─────────────────────────────────────────────────────
function samhandle(o) {
  const f = F(), t = T();
  if (o.type === 'kiste') {
    if (lagret.aapnet[o.id]) return melding('Kista er tom.', 1.5);
    lagret.aapnet[o.id] = true; faaTing(o.ting); giXp(10);
    const tekster = {
      hjelm: ['Du fant HJELM OG VERNESKO!', 'Nå slipper Hilde deg inn på byggeplassen.'],
      tester: ['Du fant en SPENNINGSTESTER!', 'Nå ser du hvilke kabler som er spenningssatt. Rødt: hold deg unna. Grønt: spenningsløst.', 'Den avslører også skjulte ledninger i vegger. Husk å teste den mot kjent spenning før og etter bruk.'],
      stang: ['Du fant en JORDINGSSTANG!', 'Trykk A for å jorde og kortslutte gnister foran deg.'],
      laas: ['Du fant LÅS OG SKILT!', 'Når du frakobler noe, låser og merker du bryteren så ingen kobler inn igjen.'],
      iso: ['Du fant en ISOLASJONSTESTER!', 'Med den kan du måle isolasjonen på frakoblede kurser.'],
      lykt: ['Du fant en HODELYKT!', 'Nå ser du mye lenger i mørket. Også om natta.'],
      trommel: ['Du fant en LILLA KABELTROMMEL i søpla!', 'Det står ROGER på den med tusj. Noen har prøvd å skrape det bort.'],
    };
    if (o.ting === 'trommel' && !Q('trommel')) setTimeout(() => startOppdrag('trommel'), 50);
    return snakk('', tekster[o.ting]);
  }
  if (o.type === 'funn') return finnVerktoy(o);
  if (o.type === 'skrap') {
    o.borte = true; lagret.aapnet[o.id] = true; lagret.teller.skrap = skrap() + 1; lagre(); LYD.mynt();
    return melding('Skrapkobber! (' + skrap() + ' stk). Lever til gjenvinning eller bruk på verkstedbenken.', 3);
  }
  if (o.type === 'spor') {
    o.borte = true; lagret.teller.spor = (lagret.teller.spor || 0) + 1; lagre(); giXp(15, true);
    const spor = ['En kvittering fra et skraphandleri. Datert i natt.', 'Et bilnummer skrevet på et sjokoladepapir.', 'En arbeidshanske med navnelapp: «IKKE MIN».'];
    return snakk('Ledetråd', [spor[(lagret.teller.spor - 1) % 3], 'Ledetråder: ' + lagret.teller.spor + ' av 3. Vis dem til Vidar.']);
  }
  if (o.type === 'kaffe') {
    sp.liv = maksLiv(); oppdaterHud(); pip(500, 0.2, 'triangle');
    const linjer = { kaffe: 'Du tar en kopp kaffe. Den er kald. Den har vært kald siden 2019.', kaffe2: 'Noen har glemt en termos med kaffe her nede.',
      kaffe3: 'Kantinekaffe. Sterk nok til å stå av seg selv.', kaffe4: 'En termos i 204. Det står MATS på den. Du tar bare litt.' };
    return snakk('', [linjer[o.id] || 'Kaffe!', 'Livet er fylt opp igjen.']);
  }
  if (o.type === 'skilt') return snakk(o.tekst[0], o.tekst.slice(1));
  if (o.type === 'benk') return verksted();
  if (o.type === 'gjenvinning') return gjenvinning();
  if (o.type === 'lampe') return melding(erNatt() ? 'Lyskasteren lyser opp plassen.' : 'En lyskaster. Den slås på når det blir mørkt.', 2);
  if (o.type === 'merke') return undersok(o);
  if (o.type === 'tyv') return;
  if (o.id === 'grete') return butikk(o);
  if (o.id === 'tavledor') return tavledor(o);
  if (o.id === 'fagdor') return fagdor(o);
  if (o.id === 'byggeleder') return bjorn(o);
  if (o.id === 'hilde') return hilde(o);
  if (o.id === 'kevin') return kevinPrat(o);
  if (o.id === 'tore') return torePrat(o);
  if (o.id === 'roger') return rogerPrat(o);
  if (o.id === 'mats') return matsPrat(o);
  if (o.id === 'sondre') return sondrePrat(o);
  if (o.id === 'vidar') return vidarPrat(o);
  if (o.id === 'sensor') return fagprove(o);
  if (o.id === 's1') return byggestrom(o);
  if (o.id === 's2') return fordelingB(o);
  if (o.id === 'f2') return snakk(o.navn, ['Fordelingen for 2. etasje. Alt er merket. Med blyant. Som har bleknet.',
    t.tester ? 'Spenningstesteren viser en kabel som går fra skapet og inn i veggen mot øst. Den står ikke på tegningen.' : 'Det ser ut som det går en kabel inn i veggen her.']);
}

// Ting på bakken (tavler, vegger, feil på vernerunden, osv.)
function undersok(o) {
  const f = F(), t = T(), k = o.merke;
  if (k.startsWith('feil_')) return vernFeil(k);
  if (k.startsWith('tr')) return trafoSteg(Number(k.slice(2)), o);
  if (k === 'gipsvegg') {
    if (Q('skrue') !== 'aktiv') return snakk('Gipsvegg', ['En ny gipsvegg. Noen har skrudd i den. Mange ganger.']);
    if (f.sporGips) return snakk('Gipsvegg', ['Skruehullet, sagflisa og blyanten med TORE på. Ganske tydelig.']);
    f.sporGips = true; lagre(); giXp(15, true);
    return snakk('Gipsvegg', ['Du undersøker veggen. Et skruehull rett der kabelen går.', 'Sagflis på gulvet. En tømmermannsblyant med TORE skrevet på.',
      t.tester ? 'Spenningstesteren viser at kabelen bak går rett under hullet. Saken er klar. Nesten.' : 'Nå trenger du et vitne eller to.']);
  }
  if (k === 'plan') {
    startOppdrag('fremdrift');
    return snakk('Fremdriftsplan, bygg B', ['Sist oppdatert: for fjorten måneder siden.', 'Alle aktiviteter: «I RUTE». Med grønn tusj.', 'Noen har skrevet «haha» i margen.']);
  }
  if (k === 'tavle') {
    if (!Q('kabelbro')) startOppdrag('kabelbro');
    return snakk('Tavla på møterommet', ['Tegning K-201: «Kabelbro i korridoren, 2. etasje. Status: FERDIG.» Signert Bjørn.',
      'Under står det: «Neste møte: Hvorfor er vi forsinket?» Møtet varte i fire timer.']);
  }
  if (k === 'kabelbro_tom') {
    if (Q('kabelbro') !== 'aktiv') return melding('Et tomt felt i taket. Noen skruer, ingen kabelbro.', 2.5);
    if (!f.broSjekket) { f.broSjekket = true; lagre(); giXp(15, true); }
    return snakk('Korridoren', ['Her skal kabelbroen være ifølge tegningen.', 'Det er ingenting her. Bare to skruer og et håp.', f.broFunnet ? 'Du vet jo hvor den er nå.' : 'Den må jo være et sted...']);
  }
  if (k === 'stikk') {
    if (!lagret.aapnet[o.id]) { lagret.aapnet[o.id] = true; lagre(); }
    return melding('En boks uten stikkontakt. (' + stikkTalt() + ' av dem funnet)', 2.5);
  }
  if (k === 'relepanel') return relepanel();
  if (k === 'lampe201') return melding(f.lampe201 ? 'Lampa lyser. Det tok fjorten releer og en lærling.' : 'Taklampa i stua. Den har aldri lyst.', 2.5);
  if (k === 'skjultboks') {
    if (!t.tester && !t.kabelsoker) return melding('En helt vanlig vegg.', 1.5);
    if (lagret.aapnet.skjultboks) return melding('Den skjulte koblingsboksen. Tom nå.', 2);
    lagret.aapnet.skjultboks = true; giCu(400); giXp(30, true);
    return snakk('Skjult funn!', ['Testeren piper langs veggen. Bak en løs plate finner du en skjult koblingsboks.', 'Noen har gjemt 400 g kobber her. Og en lapp: «Ikke si det til Bjørn.»']);
  }
  if (k === 'arbeidsbryter') return arbeidsbryter();
  if (k === 'maakereir') {
    if (lagret.aapnet.maakereir) return melding('Måkene ser stygt på deg.', 2);
    lagret.aapnet.maakereir = true; giCu(500); giXp(20, true);
    return snakk('Skjult funn!', ['Et måkereir fullt av blanke ting: kobberbiter, en ring og halve brødskiva til Tore.', 'Så det VAR måkene. Roger er frikjent. Delvis. +500 g Cu']);
  }
  if (k === 'sofa') return sofa();
  if (k === 'garderobeskap') return garderobeskap();
  if (k === 'kjoleskap') return kjoleskap();
}

// ── Hovedhistorien ──────────────────────────────────────────────────
function bjorn(o) {
  const f = F(), t = T();
  if (f.oppdrag && Q('kabelbro') === 'aktiv' && f.broFunnet) return kabelbroRapport(o);
  if (f.oppdrag && Q('fremdrift') === 'aktiv' && fremdriftSpurt() >= 3) return fremdriftRapport(o);
  if (f.fagBestatt) return snakk(o.navn, ['Bestått fagprøve! Jeg visste det. Det sa jeg ikke, men jeg visste det.', 'Innflyttingen er utsatt til neste uke. Igjen. Men det er ikke din skyld.']);
  if (f.trafoFerdig) return snakk(o.navn, ['Riggplassen har stabil strøm. Kaffemaskinen virker. Moralen er tilbake.',
    nivaa() < 2 ? 'Sensor Solveig sier du må være minst selvstendig montør før fagprøven. Ta noen sideoppdrag!' : 'Sensor Solveig venter i brakka på sørtomta. Lykke til på fagprøven.']);
  if (f.rapport) {
    if (!t.nokkel) {
      if (Q('vernerunde') !== 'ferdig') return snakk(o.navn, ['Jeg gir deg nøkkelen til trafokiosken når Hilde har gått vernerunden med deg.', 'Hun er streng. Det er bra. Ikke si at jeg sa det.']);
      if (erCowboy() && !f.ekstraKontroll) { f.trengerKontroll = true; lagre(); return snakk(o.navn, ['Hør her, cowboy. Folk snakker.', 'Før du får nøkkelen til en trafokiosk, vil Hilde ha en ekstra kontroll med deg.']); }
      faaTing('nokkel'); giXp(20, true);
      return snakk(o.navn, [erRyddig() ? 'Du er den ryddigste montøren jeg har hatt. Her er nøkkelen til trafokiosken.' : 'Her er nøkkelen til trafokiosken på sørtomta.',
        'Strømmen til riggplassen faller ut hele tiden. Kaffemaskinen har mistet troen.', 'Husk de fem sikkerhetsreglene. Skiltet henger inne i kiosken.']);
    }
    return snakk(o.navn, ['Trafokiosken er på sørtomta. Gjennom porten sør for riggplassen.', 'Husk lysbuevisir. Og vett.']);
  }
  if (f.ferdig2) return rapport(o);
  if (f.ferdig) {
    startOppdrag('skrue');
    const linjer = ['Strålende jobba med bygg B!', 'Men noe smeller fortsatt i hovedtavla i kjelleren. Trappa ned er i hjørnet inne i bygg B.',
      t.visir ? 'Hold avstand til lysbuen når den lyser. Jord den når den er grå. Og bruk jordingsskinnene i gulvet.' : 'Husk lysbuevisir. Grete ved varebilen selger det.'];
    if (Q('skrue') === 'aktiv') linjer.push('Og finn ut hvem som skrudde gjennom kabelen. Se på veggen, og snakk med folk.');
    if (Q('kabelbro') === 'aktiv' && f.broFunnet) return kabelbroRapport(o);
    if (Q('fremdrift') === 'aktiv' && fremdriftSpurt() >= 3) return fremdriftRapport(o);
    if (!Q('fremdrift')) linjer.push('Fremdriftsplanen er forresten oppdatert. Den henger på kontoret. Den er helt oppdatert.');
    return snakk(o.navn, linjer);
  }
  if (!f.oppdrag) {
    f.oppdrag = true; lagre();
    return snakk(o.navn, [
      'Der er du! Bygg B har mistet strømmen, og vi har innflytting i morgen.',
      'Den forrige elektrikeren sa han skulle komme i går. Det sa han i fjor også.',
      'Jeg tror det er en isolasjonsfeil på en av kursene i fordelingen der borte.',
      'Hent hjelm og vernesko i kista her i brakka først. Hilde slipper ingen inn uten.',
      'Og vær forsiktig i kabelfeltet bak containerne. Noen av kablene der er spenningssatt.',
    ]);
  }
  if (Q('kabelbro') === 'aktiv' && f.broFunnet) return kabelbroRapport(o);
  if (!t.hjelm) return snakk(o.navn, ['Kista med hjelm og vernesko står i hjørnet her.']);
  if (!t.tester) return snakk(o.navn, ['Det ligger en spenningstester i en kiste borte ved containerne. Hent den før kabelfeltet!']);
  if (!t.iso) return snakk(o.navn, ['Isolasjonstesteren ligger inne i bygg B. Kabelen foran døra må frakobles først. Og lås skapet, Kevin er i nærheten.']);
  return snakk(o.navn, ['Mål kursene i fordelingen i bygg B og finn den som har feil.']);
}

function kabelbroRapport(o) {
  return snakk(o.navn, ['Kabelbroen i korridoren? Den er ferdig. Det står på tegningen.', 'Den er på TAKET? Hvem monterer en kabelbro på taket?', { tekst: 'Hva gjør dere med saken?', valg: [
    ['Skriv avvik og oppdater tegningen', () => { fullforOppdrag('kabelbro', 'ferdig', 'Skrev avvik og oppdaterte tegningen'); giCu(300, true); giXp(70); endreRykte(1, 'Fikk tegningen til å stemme med virkeligheten');
      snakk(o.navn, ['Et avvik med bilde og ny tegning. Montøren flytter broen i morgen. Eller neste uke. +300 g Cu']); }],
    ['«Kabelen ligger riktig. Bare ikke der den skal.»', () => { fullforOppdrag('kabelbro', 'tak', 'Lot broen ligge på taket'); giXp(30); endreRykte(-1, 'Lot kabelbroen ligge på taket');
      snakk(o.navn, ['Det skriver jeg i referatet. Ordrett.', 'Avviket er lukket. Problemet består.']); }],
  ] }]);
}
function fremdriftRapport(o) {
  return snakk(o.navn, ['Så, hva sier folk om fremdriften?', 'Tak 80 % uten tak. Rør levert i emballasje. Elektro i rute, men ingen vet hvilken.', { tekst: 'Hva gjør du med planen?', valg: [
    ['Oppdater planen med de ekte tallene', () => { fullforOppdrag('fremdrift', 'ferdig', 'Ærlig plan'); giXp(60); endreRykte(1, 'Lagde en ærlig fremdriftsplan');
      snakk(o.navn, ['Rødt. Mye rødt. Men det stemmer.', 'Ferdigstillelse fredag. Hvilken fredag er ikke spesifisert. Nå står det i hvert fall riktig uke.']); }],
    ['Mal alt grønt igjen', () => { fullforOppdrag('fremdrift', 'pynt', 'Malte alt grønt'); giXp(30); endreRykte(-1, 'Pyntet på fremdriftsplanen');
      snakk(o.navn, ['Fremdriftsplanen er oppdatert. Ingen vet med hva.', 'Perfekt. Den henger jeg opp før møtet.']); }],
  ] }]);
}

function byggestrom(o) {
  const f = F(), t = T();
  if (f.s1Laast) return snakk(o.navn, ['Bryteren er av, låst og merket med navnet ditt.']);
  if (!s1Paa) {
    if (t.laas) return laasS1();
    return snakk(o.navn, ['Bryteren er av, men ikke låst. Hvem som helst kan slå den på igjen.', 'Lås og skilt ligger i en kiste nord for kabelfeltet.']);
  }
  return snakk(o.navn, [{
    tekst: 'Byggestrømskapet. Kursen «Bygg B, inngang» er på.',
    valg: [['Frakoble kursen', () => {
      s1Paa = false; f.s1Av = true; lagre(); pip(200, 0.2, 'square');
      if (t.laas) laasS1();
      else { melding('Kursen er frakoblet. Kabelen foran døra er spenningsløs.', 3); kevin.aktiv = true; kevin.timer = 3.5; kevin.fase = 0; }
    }], ['La være', () => {}]],
  }]);
}
function laasS1() {
  const f = F();
  f.s1Av = true; f.s1Laast = true; s1Paa = false; kevin.aktiv = false; lagre(); fanfare(); giXp(20, true);
  endreRykte(1, 'Låste og merket byggestrømmen');
  snakk('', ['Du låser bryteren og henger på skilt med navnet ditt.', 'Sikret mot innkobling! Nå kan ingen slå den på mens du jobber.']);
}

function fordelingB(o) {
  const f = F(), t = T();
  if (f.ferdig) return snakk(o.navn, ['Alt er i orden. Kurs 2 er reparert.']);
  if (!t.iso) return snakk(o.navn, ['Du trenger en isolasjonstester for å finne feilen.']);
  const maal = { 1: 'Kurs 1 Lys: over 500 MΩ. Helt fint.', 2: 'Kurs 2 Stikk: 0,05 MΩ! Langt under kravet på 1 MΩ.', 3: 'Kurs 3 Varme: 230 MΩ. Helt fint.' };
  lagret.teller.maalt = lagret.teller.maalt || {};
  const valgMeny = () => snakk(o.navn, [{
    tekst: 'Kursene er frakoblet og spenningsløse. Hvilken kurs vil du isolasjonsmåle (500 V DC)?',
    valg: [
      ['Mål kurs 1 (lys)', () => { lagret.teller.maalt[1] = 1; snakk(o.navn, [maal[1]], valgMeny); }],
      ['Mål kurs 2 (stikk)', () => { lagret.teller.maalt[2] = 1; snakk(o.navn, [maal[2]], valgMeny); }],
      ['Mål kurs 3 (varme)', () => { lagret.teller.maalt[3] = 1; snakk(o.navn, [maal[3]], valgMeny); }],
      ['Jeg vet hvilken som har feil', () => snakk(o.navn, [{
        tekst: 'Hvilken kurs har isolasjonsfeilen?',
        valg: [1, 2, 3].map((n) => ['Kurs ' + n, () => {
          if (n === 2) { if (Object.keys(lagret.teller.maalt).length === 3) endreRykte(1, 'Målte alle kursene før konklusjon'); ferdig(); }
          else { LYD.feil(); snakk(o.navn, ['Hmm, det stemmer ikke med målingene. Mål igjen.'], valgMeny); }
        }]),
      }])],
    ],
  }]);
  return valgMeny();
}

function ferdig() {
  lagret.flagg.ferdig = true; giCu(1000, true); giXp(100); startOppdrag('skrue'); fanfare();
  snakk('Byggeleder Bjørn (på radio)', [
    'Kurs 2 hadde isolasjonsfeil. En skrue gjennom kabelen bak gipsen!',
    'Feilen er rettet, og strømmen er på i bygg B igjen. +1 kg Cu',
    'Men vent... Nå smeller det i hovedtavla nede i kjelleren, og lyset der nede er borte.',
    'Folk sier en LYSBUE har tatt bolig i tavlerommet! Trappa ned er i hjørnet her inne.',
    'Tavlerommet krever lysbuevisir. Grete står med varebilen nord for bygg B og selger utstyr for kobber.',
    'Og finn ut hvem som skrudde gjennom kabelen. Det må dokumenteres.',
  ], () => melding('Nytt område: kjelleren! Trappa ned er i hjørnet nede til høyre i bygg B.', 4));
}

function tavledor(o) {
  const f = F(), t = T();
  if (!t.visir || !t.stang) return snakk('⚠ LYSBUEFARE', ['Tavlerom. Adgang kun med lysbuevisir og -dress.',
    t.visir ? 'Du trenger også en jordingsstang. Den ligger i en kiste nord på byggeplassen.' : 'Grete ved varebilen selger lysbuevisir. Betal med kobberet ditt.']);
  return snakk('Tavlerom', ['Du tar på lysbuevisiret og -dressen og åpner døra.', 'Det knitrer og freser der inne...'], () => {
    f.dorAapen = true; o.borte = true; lagre(); LYD.dor();
  });
}

function hovedtavle() {
  const f = F(), t = T();
  if (f.ferdig2) return snakk('Hovedtavle', ['Alt er i orden. Lyset og strømmen er tilbake i hele bygg B.']);
  if (!f.bossBeseiret) return snakk('Hovedtavle', ['Det freser og smeller i tavla. Lysbuen må slukkes først!']);
  const sider = ['Tavla er frakoblet og sikret nå. Du ser en svidd kobling på samleskinna.'];
  if (t.termo) sider.push('Termokameraet viser at koblingen fortsatt er varm. Mye varmere enn naboene.');
  sider.push({ tekst: 'Hva var årsaken til lysbuen?', valg: [
    ['Hodelykta mi blendet', () => feilSvar()],
    ['Løs forbindelse som ga varmgang', () => ferdig2()],
    ['Jordfeilbryteren var for følsom', () => feilSvar()],
    ['Kevin', () => { LYD.feil(); snakk('Hovedtavle', ['Fristende. Men nei. Kevin har ikke vært her nede. Han finner ikke trappa.']); }],
  ] });
  return snakk('Hovedtavle', sider);
}
function feilSvar() { LYD.feil(); snakk('Hovedtavle', ['Nei, det stemmer ikke. Se på den svidde koblingen igjen.']); }
function ferdig2() {
  lagret.flagg.ferdig2 = true; giCu(1000, true); giXp(100); fanfare();
  snakk('Hovedtavle', [
    'Riktig! Koblingen var ikke trukket til. Den ble varm, og til slutt slo det en lysbue.',
    'Du rengjør skinna, bytter skadde deler og trekker til med momentnøkkel. +1 kg Cu',
    'Lyset kommer tilbake i hele kjelleren! Nå må Bjørn få en rapport.',
  ]);
}

function rapport(o) {
  const f = F();
  return snakk(o.navn, ['Lyset er tilbake i kjelleren! Fortell. Hva var det?', { tekst: 'Hva skriver du i rapporten?', valg: [
    ['Full rapport: målinger, årsak, tiltak og bilder', () => { f.rapport = true; lagret.valg.rapport = 'Full rapport'; giCu(1000, true); giXp(80); endreRykte(2, 'Skrev full rapport med målinger og tiltak');
      snakk(o.navn, ['Målinger... årsak: løs forbindelse med varmgang... tiltak: tiltrekking med moment... BILDER?!', 'Dette er den beste rapporten jeg har fått. Jeg skal ramme den inn. +1 kg Cu', 'Nå har jeg et nytt problem: strømmen til riggplassen faller ut. Det handler om trafokiosken. Men først vil Hilde gå vernerunde.']); }],
    ['En kort rapport med det viktigste', () => { f.rapport = true; lagret.valg.rapport = 'Kort rapport'; giCu(1000, true); giXp(60);
      snakk(o.navn, ['Kort og greit. Løs forbindelse, varmgang, fikset. Det holder. +1 kg Cu', 'Nytt problem: strømmen til riggplassen faller ut. Trafokiosken. Men Hilde vil gå vernerunde først.']); }],
    ['«Det virker nå.»', () => { f.rapport = true; lagret.valg.rapport = '«Det virker nå»'; giCu(1000, true); giXp(30); endreRykte(-2, 'Leverte rapporten «Det virker nå»');
      snakk(o.navn, ['«Det virker nå.» Det er hele rapporten?', 'Jeg limer den inn i KS-systemet. Avviket er lukket. Problemet består. +1 kg Cu', 'Nytt problem: trafokiosken. Men Hilde vil gå vernerunde med deg først. Ekstra grundig, tror jeg.']); }],
  ] }]);
}

// ── Personene ───────────────────────────────────────────────────────
function hilde(o) {
  const f = F(), t = T();
  if (!f.hildeFlyttet) {
    if (!t.hjelm) return snakk(o.navn, ['Stopp! Ingen kommer inn på byggeplassen uten hjelm og vernesko.', 'Utstyret ligger i brakka.']);
    return snakk(o.navn, ['Hjelm og vernesko, flott. Da kan du gå inn.'], () => {
      f.hildeFlyttet = true; lagre(); o.tx = 12; o.ty = 24; o.retning = 'h'; giXp(10, true);
      if (kolliderer(sp)) { sp.x = 11 * TS + 3; sp.y = 22 * TS + 4; }
    });
  }
  if (f.trengerKontroll && !f.ekstraKontroll) return ekstraKontroll(o);
  const v = Q('vernerunde');
  if (f.ferdig && !v) {
    return snakk(o.navn, ['Du! Jeg skal gå vernerunde, og jeg trenger et par ekstra øyne.', 'Finn fem feil og mangler på plassen og i bygg B. Undersøk dem, så noterer jeg.',
      'Tips: vann og strøm, stiger, nødutganger, grøfter og sjakter. Vi har alt. Vi er veldig flinke.'], () => startOppdrag('vernerunde'));
  }
  if (v === 'aktiv') {
    if (vernFunnet() < 5) return snakk(o.navn, ['Du har funnet ' + vernFunnet() + ' av 5. Fortsett!', vernHint()]);
    fullforOppdrag('vernerunde', 'ferdig', 'Fant alle fem'); f.sjaktSperret = true; faaTing('sele'); giCu(300, true); giXp(80); endreRykte(2, 'Fullførte vernerunden');
    return snakk(o.navn, ['Fem av fem! Jeg har sperret sjakta, flyttet pallene, tørket pytten, sikret stigen og satt opp sperring ved grøfta.',
      'Her er en fallsikringssele. Nå kan du gå opp på taket fra stigerommet i 2. etasje. +300 g Cu', 'Dager siden siste ulykke: 3. Kanskje vi slår rekorden nå.']);
  }
  const linjer = ['Fint at du bruker verneutstyret. Lykke til!', 'Vi har hatt null ulykker denne uka. Det er tirsdag.',
    'Verneutstyr er som undertøy. Alle merker det når du har glemt det.',
    'Den forrige elektrikeren her tok på uten å måle først. Nå kaller vi ham «Krølle».',
    'Risikovurdering? Ja, vi vurderte risikoen. Den var høy. Så gikk vi videre.',
    erCowboy() ? 'Jeg har skrevet tre avvik om deg i dag. Det er en ny rekord.' : erRyddig() ? 'Du dokumenterer! Jeg kunne grått. Jeg gjør det ikke, men jeg kunne.' : 'Har noen sett yoghurten min?'];
  if (lagret.oppdrag.skrue === 'skjult') linjer.push('Noen har sparklet over et skruehull i bygg B. Rett over en kabel. Noen som vet noe?');
  f.hTeller = ((f.hTeller || 0) + 1) % linjer.length; lagre();
  return snakk(o.navn, [linjer[f.hTeller]]);
}
function vernHint() {
  const f = F(), mangler = VERN.filter((k) => !f['vern_' + k]);
  const hint = { feil_skjote: 'Sjekk ved bajamajaene. Der er det vann.', feil_stige: 'Se på stigen ved bygg B.', feil_nodutgang: 'Hva står foran nødutgangen i kantina?',
    feil_grofta: 'Det er en grøft på sørtomta.', feil_sjakt: 'Sjakta i 2. etasje har ikke rekkverk.' };
  return mangler.length ? 'Tips: ' + hint[mangler[0]] : '';
}
function vernFeil(k) {
  const f = F();
  const tekst = {
    feil_skjote: 'En skjøteledning ligger rett i en vannpytt. Kontakten er teipet med gaffateip. Og håp.',
    feil_stige: 'En stige står mot bygg B uten sikring. Noen har skrevet «STØ NOK» på den.',
    feil_nodutgang: 'Nødutgangen fra kantina er sperret med paller. Det står «NØDUTGANG» bak dem. Antar vi.',
    feil_grofta: 'En åpen kabelgrøft uten sperring. Den er merket. Med én kjegle. Som ligger nede i grøfta.',
    feil_sjakt: 'En åpen sjakt uten rekkverk. Den går helt ned i kjelleren. Raskeste vei ned, men bare én gang.',
  }[k];
  if (Q('vernerunde') !== 'aktiv' || f['vern_' + k]) return snakk('', [tekst, f['vern_' + k] ? '(Allerede notert til vernerunden.)' : f.ferdig ? '(Dette burde Hilde få vite om.)' : '']);
  f['vern_' + k] = true; lagre(); giXp(10, true); LYD.riktig();
  return snakk('Vernerunde', [tekst, 'Notert! (' + vernFunnet() + ' av 5)' + (vernFunnet() === 5 ? ' Gå tilbake til Hilde.' : '')]);
}
function ekstraKontroll(o) {
  const sporsmal = [
    ['Hva gjør du FØR du tar på en kabel?', ['Kontrollerer spenningsløshet med spenningstester', 'Ser om den ser farlig ut', 'Spør Kevin']],
    ['Du har frakoblet en kurs. Hva nå?', ['Låser og merker bryteren', 'Ber Kevin passe på', 'Teiper over bryteren']],
    ['Det står vann på gulvet ved en tavle.', ['Stopper, melder fra og sikrer før jobb', 'Jobber fort', 'Står på en pall']],
  ];
  const still = (i) => {
    if (i >= sporsmal.length) {
      F().ekstraKontroll = true; lagre(); endreRykte(1, 'Bestod den ekstra kontrollen'); giXp(30);
      return snakk(o.navn, ['Bestått. Jeg er nesten imponert. Gå til Bjørn og hent nøkkelen.']);
    }
    const [sp1, svar] = sporsmal[i], blandet = svar.map((s, j) => [s, j]).sort(() => Math.random() - 0.5);
    snakk(o.navn, [{ tekst: 'Ekstra kontroll ' + (i + 1) + '/3: ' + sp1, valg: blandet.map(([s, j]) => [s, () => {
      if (j === 0) { LYD.riktig(); still(i + 1); } else { LYD.feil(); snakk(o.navn, ['Feil. Vi begynner på nytt. Jeg har god tid. Jeg har alltid god tid.'], () => still(0)); }
    }]) }]);
  };
  return snakk(o.navn, ['Bjørn sier du skal ha en ekstra kontroll. Cowboyer får det.', 'Tre spørsmål. Alle må være riktige.'], () => still(0));
}

function kevinPrat(o) {
  const f = F(), q = Q('skrutrekker');
  const intro = f.s1Laast ? ['Jeg så skiltet ditt på skapet. Da lar jeg det være!'] : ['Hei! Jeg kapper takrenner. Ikke slå av byggestrømmen, da!'];
  if (Q('skrue') === 'aktiv' && !f.vitneKevin) { f.vitneKevin = true; lagre(); intro.push('Forresten: Tore lånte drillen min i går. Han skulle «bare henge opp et bilde». I bygg B. Der det ikke er noen bilder.'); }
  if (!q) {
    startOppdrag('skrutrekker');
    return snakk(o.navn, [...intro,
      'Formannen sendte meg etter en VENSTREHENDT SKRUTREKKER til et spesialprosjekt. Jeg har lett i to timer.',
      { tekst: 'Har du sett en?', valg: [
        ['«Det finnes ikke. Du blir lurt.»', () => { fullforOppdrag('skrutrekker', 'ferdig', 'Fortalte sannheten'); giCu(100, true); giXp(40); endreRykte(1, 'Var ærlig med Kevin');
          snakk(o.navn, ['Hæ?! Men han sa også at jeg skulle hente kabelstrekk-olje...', 'Og at ohm-meteret må lades over natta.', 'Takk. Ta noen kaffepenger. +100 g Cu']); }],
        ['«Sjekk bajamajaen helt til høyre»', () => { fullforOppdrag('skrutrekker', 'lurt', 'Sendte ham til bajamajaen'); f.kevinLurt = true; giXp(20); endreRykte(-2, 'Sendte Kevin til bajamajaen');
          snakk(o.navn, ['Takk! Der har jeg ikke sett!'], () => { o.borte = true; lagre(); melding('Kevin løper mot riggplassen...', 3); }); }],
        ['«Ta min. Den er venstrehendt nå.»', () => { fullforOppdrag('skrutrekker', 'ferdig', 'Ga ham din egen'); giXp(30); endreRykte(1, 'Ga Kevin din egen skrutrekker');
          snakk(o.navn, ['Wow, takk! Du er den første som har vært snill mot meg her.', 'Men hvis jeg snur den, blir den høyrehendt da?']); }],
        ['«Jeg skal se etter den»', () => snakk(o.navn, ['Takk! Formannen sa den ligger «i et skap». Det er mange skap her.'])],
      ] }]);
  }
  if (q === 'aktiv' && T().skrutrekker) {
    mistTing('skrutrekker'); fullforOppdrag('skrutrekker', 'funnet', 'Fant en skrutrekker med VENSTRE på'); giCu(300, true); giXp(60); endreRykte(1, 'Hjalp Kevin');
    return snakk(o.navn, ['DET STÅR VENSTRE PÅ DEN! Den finnes!', 'Jeg skal vise den til formannen. Han kommer til å bli så... stille.', 'Her, ta litt kobber. +300 g Cu']);
  }
  if (q === 'aktiv') return snakk(o.navn, [...intro, 'Har du funnet skrutrekkeren? Formannen sa den ligger «i et skap».']);
  if (q === 'lurt') return snakk(o.navn, ['Jeg satt førti minutter i den bajamajaen. Det var ikke papir der heller.', 'Jeg kommer til å hevne meg. Sov med ett øye åpent.']);
  if (q === 'funnet') return snakk(o.navn, [...intro, 'Formannen så skrutrekkeren og gikk rett hjem. Jeg har ramma den inn.']);
  return snakk(o.navn, [...intro, 'Jeg spurte formannen om kabelstrekk-olje. Han lo i ti minutter. Så sendte han meg etter en spenningsbøtte.']);
}

function torePrat(o) {
  const f = F(), t = T(), q = Q('skrue');
  const fs = !f.fs_tore && Q('fremdrift') === 'aktiv';
  if (fs) { f.fs_tore = true; lagre(); }
  const fremdriftLinje = fs ? ['Fremdrift? Takarbeidet er 80 % ferdig. Vi mangler bare taket.'] : [];
  if (t.trommel && Q('trommel') === 'aktiv') {
    f.toreKrav = true; lagre();
    return snakk(o.navn, [...fremdriftLinje, 'Hei, den lilla trommelen! Den er min. Jeg har brukt den som bord i tre år.', { tekst: 'Gi trommelen til Tore?', valg: [
      ['Gi den til Tore', () => { mistTing('trommel'); fullforOppdrag('trommel', 'tore', 'Ga den til Tore'); giXp(10); endreRykte(-2, 'Ga Rogers trommel til Tore');
        snakk(o.navn, ['Takk! Endelig har jeg bordet mitt igjen.', '(Et sted på riggplassen hører du Roger skrike.)']); }],
      ['«Det står ROGER på den»', () => snakk(o.navn, ['...Ja vel. Det står ROGER på mye her. Ta den, da.'])],
    ] }]);
  }
  if (!f.ferdig || !q) return snakk(o.navn, [...fremdriftLinje, ...(fremdriftLinje.length ? [] : [tilf(['Jeg har bygd hus i tretti år. Strøm er bare noe dere elektrikere har funnet på.',
    'Vater? Jeg bruker øyemål. Huset heller litt, men det gjør jeg også.', erCowboy() ? 'Du er min type elektriker. Litt sånn «det ordner seg».' : 'Elektrikere. Alltid så nøye.'])])]);
  if (q !== 'aktiv') {
    const v = lagret.valg.skrue || '';
    return snakk(o.navn, [...fremdriftLinje, ...(fremdriftLinje.length ? [] : v.includes('kabelsøker') ? ['Kabelsøkeren piper hele tiden. Jeg tror det bor spøkelser i veggene.', 'Eller så er det bare kabler. Overalt. Hvem har lagt alle de kablene?']
      : v.includes('Sparklet') ? ['Vi snakker ikke om veggen. Vi har aldri snakket om veggen.'] : ['Jeg skrur fortsatt der jeg vil. Men nå ber jeg først.', 'Til meg selv. Inni hodet. Det teller.'])]);
  }
  if (!f.sporGips || !(f.vitneRoger || f.vitneKevin)) return snakk(o.navn, [...fremdriftLinje, 'Kabel? Hvilken kabel? Jeg har ikke vært i bygg B på flere uker.', '(Undersøk veggen i bygg B og finn et vitne. Da blir det vanskeligere for Tore å nekte.)']);
  return snakk(o.navn, [...fremdriftLinje, 'Du har vært og sett på veggen, ser jeg. Og noen har sladret.', '...Ok. Kabelen lå akkurat der jeg skulle skru. Hvem legger kabel der?', { tekst: 'Hvordan dokumenteres hendelsen?', valg: [
    ['Skriv avvik med bilder og forslag til tiltak', () => { fullforOppdrag('skrue', 'ferdig', 'Skrev avvik med tiltak'); giXp(60); endreRykte(2, 'Dokumenterte skruen i kabelen');
      snakk(o.navn, ['Avvik? Nå blir det møte. Med kake. Og ingen får kake.', 'Greit, greit. Tiltaket er at jeg sjekker før jeg skrur. Neste gang.']); }],
    ['Lær ham å bruke kabelsøker', () => { fullforOppdrag('skrue', 'ferdig', 'Lærte Tore å bruke kabelsøker'); giCu(300, true); giXp(60); endreRykte(1, 'Lærte Tore å bruke kabelsøker');
      snakk(o.navn, ['Så den piper når det er kabel bak? Hvorfor har ingen sagt det før?', 'Her, ta litt kobber jeg har... funnet. +300 g Cu']); }],
    ['Kjeft ham huden full', () => { fullforOppdrag('skrue', 'ferdig', 'Kjeftet'); giXp(20); endreRykte(-1, 'Kjeftet på Tore');
      snakk(o.navn, ['Hør her. Jeg har overlevd tre elektrikere på denne plassen.', 'To av dem gikk med på jobb. Den tredje ble rørlegger. Det er verre.']); }],
    ['Sparkle over og si ingenting', () => { fullforOppdrag('skrue', 'skjult', 'Sparklet over'); giXp(10); endreRykte(-3, 'Sparklet over et skruehull i en kabel');
      snakk(o.navn, ['Du er min type elektriker.', 'Ingen papirer, ingen problemer. Til noen finner problemene.']); }],
  ] }]);
}

function rogerPrat(o) {
  const f = F(), t = T(), q = Q('trommel');
  const linjer = [];
  if (Q('skrue') === 'aktiv' && !f.vitneRoger) { f.vitneRoger = true; lagre(); linjer.push('Tore? Jeg hørte drillen hans i bygg B rett før lyset gikk. Han sa «oi». Tore sier aldri «oi».'); }
  if (Q('fremdrift') === 'aktiv' && !f.fs_roger) { f.fs_roger = true; lagre(); linjer.push('Fremdrift? Rørene er ferdige! Altså, de er levert. På plassen. I emballasje.'); }
  if (!q) {
    startOppdrag('trommel');
    return snakk(o.navn, [...linjer, 'Hva glaner du på? Ja, jeg spiste brødskiva til Tore. Han får skylde på måkene.',
      'Noen har tatt kabeltrommelen min. Den er LILLA. Hvem stjeler en lilla kabeltrommel?', 'Finner du den, får du finnerlønn.']);
  }
  if (q === 'aktiv' && t.trommel) return snakk(o.navn, [...linjer, { tekst: 'Er det... MIN TROMMEL?!', valg: [
    ['Gi den tilbake', () => { mistTing('trommel'); fullforOppdrag('trommel', 'ferdig', 'Ga den tilbake til Roger'); giCu(400, true); giXp(50); endreRykte(1, 'Ga trommelen tilbake til eieren');
      snakk(o.navn, ['Min lilla venn! Hvor var den?', 'I avfallscontaineren? Det var sikkert Tore. Her er finnerlønn. +400 g Cu',
        f.leieliste ? 'Og ja, jeg leverer den til Grete når leieperioden er over. Kanskje.' : 'Den er leid, forresten. Ikke si det til Grete.']); }],
    ['«Hva er den verdt for deg?»', () => { mistTing('trommel'); fullforOppdrag('trommel', 'ferdig', 'Tok seg godt betalt'); giCu(600, true); giXp(20); endreRykte(-1, 'Tok seg godt betalt av Roger');
      snakk(o.navn, ['600 gram?! Det er ran midt på lyse dagen.', 'Greit. Men rørleggere glemmer aldri. +600 g Cu']); }],
    ['«Nei, jeg liker bare lilla»', () => {}],
  ] }]);
  if (q === 'aktiv') return snakk(o.navn, [...linjer, 'Har du sett trommelen min? Den er lilla. Du kan ikke ta feil.']);
  if (q === 'solgt') return snakk(o.navn, [...linjer, 'Jeg så trommelen min på bilen til grossisten. Med prislapp.', 'Jeg vet hva du gjorde. Jeg har rørtang, og jeg vet hvor brakka di er.']);
  if (q === 'tore') return snakk(o.navn, [...linjer, 'Tore spiser lunsj på trommelen min. MIN trommel. Som bord.', 'Jeg skal finne ut hvem som ga den til ham.']);
  return snakk(o.navn, [...linjer, ...(linjer.length ? [] : ['Trommelen og jeg har det fint igjen. Takk.', 'Hvis du ser Tore, si at det var måkene.'])]);
}

function matsPrat(o) {
  const f = F(), t = T(), q = Q('verktoy');
  const linjer = [];
  if (Q('fremdrift') === 'aktiv' && !f.fs_mats) { f.fs_mats = true; lagre(); linjer.push('Fremdrift? Elektro i 2. etasje er i rute. Hvilken rute, vet jeg ikke.'); }
  if (!q) {
    startOppdrag('verktoy');
    return snakk(o.navn, [...linjer, 'Hei. Jeg har lagt fra meg alt verktøyet mitt. Multimeteret, avbitertanga, vaterpasset og kabelkniven.',
      'Jeg husker ikke hvor. Jeg husker ikke hva jeg spiste til frokost heller.', 'Jeg var visst i kjelleren, i 2. etasje, på taket og i kantina i går. Lykke til.']);
  }
  if (q === 'aktiv') {
    const har = ['multimeter', 'avbiter', 'vater', 'kniv'].filter((id) => t[id]);
    har.forEach((id) => { mistTing(id); f['levert_' + id] = true; });
    lagre();
    if (verktoyFunnet() >= 4) {
      fullforOppdrag('verktoy', 'ferdig', 'Fant alt'); faaTing('kabelsoker'); giCu(400, true); giXp(70); endreRykte(1, 'Hjalp Mats med verktøyet');
      return snakk(o.navn, [...linjer, 'Alt sammen! Du er en helt.', 'Ta kabelsøkeren min. Den finner skjulte kabler og gjemt kobber. Jeg finner den aldri uansett. +400 g Cu']);
    }
    return snakk(o.navn, [...linjer, har.length ? 'Takk! Det er ' + verktoyFunnet() + ' av 4. Resten ligger et sted. Kanskje.' : 'Har du funnet noe? Jeg har ' + verktoyFunnet() + ' av 4.']);
  }
  return snakk(o.navn, [...linjer, ...(linjer.length ? [] : ['Takk for hjelpen. Nå har jeg bare mistet kaffen.', 'Og bilnøklene. Og bilen.'])]);
}
function finnVerktoy(o) {
  o.borte = true; lagret.aapnet[o.id] = true; faaTing(o.funn); giXp(10, true);
  if (!Q('verktoy')) setTimeout(() => startOppdrag('verktoy'), 50);
  return snakk('', ['Du fant ' + TING[o.funn].navn.toUpperCase() + '!', TING[o.funn].tekst]);
}

function sondrePrat(o) {
  const f = F(), q = Q('sondre');
  if (!q) {
    startOppdrag('sondre');
    return snakk(o.navn, ['Se her! Jeg har laget en smart løsning for lyset i stua.', '14 releer, en PLS, en Raspberry Pi og en app. Lampa skal tennes når man klapper tre ganger og sier «lys».',
      'Men den tennes ikke. Relépanelet henger på veggen der borte. Notatene mine også.']);
  }
  if (q === 'aktiv' && !f.lampe201) return snakk(o.navn, ['Har du sett på relépanelet? Notatet mitt sier i hvilken rekkefølge releene må trekke.']);
  if (q === 'aktiv') return snakk(o.navn, ['DEN LYSER! Du fikk den til!', { tekst: 'Hva gjør vi med systemet nå?', valg: [
    ['Erstatt alt med en vanlig lysbryter', () => { fullforOppdrag('sondre', 'enkel', 'Vanlig lysbryter'); giCu(300, true); giXp(70); endreRykte(2, 'Valgte den enkle løsningen');
      snakk(o.navn, ['En... vanlig bryter? Men det virker jo. Hver gang. Det er så kjedelig.', 'Ok. Jeg lærte noe i dag. Jeg liker det ikke, men jeg lærte det. +300 g Cu']); }],
    ['Behold det, men tegn et skjema', () => { fullforOppdrag('sondre', 'skjema', 'Beholdt systemet med skjema'); giCu(200, true); giXp(50); endreRykte(1, 'Krevde skjema og dokumentasjon');
      snakk(o.navn, ['Et skjema! Med 14 releer! Det blir et kunstverk.', 'Neste elektriker kommer til å takke oss. Eller gråte. +200 g Cu']); }],
    ['Foreslå Bluetooth og stemmestyring', () => { fullforOppdrag('sondre', 'bluetooth', 'La til Bluetooth'); giXp(20); endreRykte(-1, 'Gjorde det enda mer komplisert');
      snakk(o.navn, ['JA! Nå kan lyset styres fra Oslo!', 'Jeg bor ikke i Oslo. Men tenk om jeg gjorde det.']); }],
  ] }]);
  const v = lagret.valg.sondre || '';
  return snakk(o.navn, [v.includes('vanlig') ? 'Jeg har begynt å like vanlige brytere. Ikke si det til noen.' : v.includes('Bluetooth') ? 'Lampa ble skrudd på av noen i Bergen i natt. Det er bra, ikke sant?' : 'Skjemaet er 11 sider. Jeg har laminert det.']);
}
function relepanel() {
  const f = F();
  if (f.lampe201) return melding('Releene klikker fornøyd. Lampa lyser.', 2);
  if (Q('sondre') !== 'aktiv') return snakk('Relépanel', ['Fjorten releer, en PLS og en lapp: «IKKE RØR». Du rører ikke.']);
  const rekke = [];
  const steg = () => snakk('Relépanel', [{ tekst: rekke.length ? 'Trukket: ' + rekke.join(', ') + '. Hvilket rele nå?' : 'Notatet til Sondre: «K2 må trekke før K1. K3 sist. Ikke spør hvorfor.» Hvilket rele trekker du først?',
    valg: ['K1', 'K2', 'K3'].filter((k) => !rekke.includes(k)).map((k) => [k, () => {
      rekke.push(k); pip(400 + rekke.length * 120, 0.05, 'square', 0.03);
      if (rekke.length < 3) return steg();
      if (rekke.join() === 'K2,K1,K3') { f.lampe201 = true; lagre(); LYD.riktig(); giXp(25, true); snakk('Relépanel', ['Klikk, klakk, KLONK. Lampa i taket lyser!', 'Snakk med Sondre.']); }
      else { LYD.feil(); snakk('Relépanel', ['Klikk-klakk-klikk. Ingenting skjer. En vifte starter et sted i bygget.', 'Les notatet igjen og prøv på nytt.']); }
    }]) }]);
  steg();
}

function vidarPrat(o) {
  const q = Q('tyver'), spor = lagret.teller.spor || 0;
  if (!q) {
    return snakk(o.navn, ['God kveld. Vidar, vekter. Kobbertyver har vært her de siste nettene.', 'De går etter kabeltromlene på sørtomta. IKKE prøv å ta dem selv!',
      'Skrem dem bort med lys og lyd, og finn spor etter dem. Tre spor, så har politiet nok.'], () => startOppdrag('tyver'));
  }
  if (q === 'aktiv' && spor >= 3) {
    fullforOppdrag('tyver', 'ferdig', 'Meldte fra til vekteren'); giCu(800, true); giXp(90); endreRykte(2, 'Meldte fra om kobbertyvene til riktig person');
    return snakk(o.navn, ['Kvittering fra skraphandleriet, bilnummer og en hanske med «IKKE MIN». Perfekt.', 'Jeg ringer politiet. Du gjorde det riktig: du fant sporene og meldte fra. +800 g Cu',
      F().kjoptAvTyv ? 'Forresten... hvorfor står det at DU har kjøpt kobber billig av dem? Vi tar den praten en annen gang.' : 'Nå kan jeg drikke kaffen min i fred.']);
  }
  if (q === 'aktiv') return snakk(o.navn, ['Du har ' + spor + ' av 3 spor. Tyvene kommer fra sør, ved kabeltromlene.', 'Hold avstand. Lys på dem, så løper de.']);
  return snakk(o.navn, ['Stille natt. Takket være deg.', 'Hvis du ser en lilla kabeltrommel, er den ikke stjålet. Den er bare lilla.']);
}

// ── Grete, butikk, verksted og gjenvinning ─────────────────────────
function butikk(o) {
  const t = T(), f = F();
  if (!f.moettGrete) {
    f.moettGrete = true; lagre();
    return snakk(o.navn, ['Hei! Jeg er Grete fra grossisten. Hos meg betaler du med kobber.', 'Alt kobber du samler på plassen kan brukes her. Og nei, jeg spør ikke hvor det kommer fra.'], () => butikk(o));
  }
  const varer = BUTIKK.filter((v) => !t[v.id]);
  const ekstra = [];
  if (t.trommel && Q('trommel') === 'aktiv') {
    ekstra.push(['Spør om den lilla trommelen', () => { f.leieliste = true; lagre(); snakk(o.navn, ['Den lilla? Den er utleid fra meg. Leielista sier: «Lilla trommel – R. Rørlegger.»',
      'Så den tilhører egentlig meg, men Roger har leid den. Jeg kan kjøpe den av deg. Jeg spør ikke hvordan du fikk den.'], () => butikk(o)); }]);
    ekstra.push(['Selg lilla kabeltrommel: +700 g', () => {
      mistTing('trommel'); giCu(700, true); fullforOppdrag('trommel', 'solgt', 'Solgte den til Grete'); giXp(10); endreRykte(-2, 'Solgte Rogers trommel');
      snakk(o.navn, ['Lilla, ja. Den får jeg solgt. Til Roger, kanskje.'], () => butikk(o));
    }]);
  }
  if (f.ferdig && Q('cirka') !== 'ferdig' && Q('cirka') !== 'cirka') ekstra.push([Q('cirka') ? 'Svar på bestillingen' : 'Spør om bestillingen', () => cirka(o)]);
  const kjop = (v) => {
    const pris = prisFor(v), krav = v.krav && v.krav();
    if (krav) { LYD.feil(); return snakk(o.navn, [krav + '.'], () => butikk(o)); }
    if (lagret.kobber < pris) { LYD.feil(); return snakk(o.navn, ['Det koster ' + fmtCu(pris) + '. Du har ' + fmtCu(lagret.kobber) + '.', 'Samle mer kobber og kom tilbake! Gjenvinning gir også kobber.'], () => butikk(o)); }
    snakk(o.navn, [{ tekst: 'Kjøpe ' + TING[v.id].navn.toUpperCase() + ' for ' + fmtCu(pris) + '? ' + v.effekt, valg: [
      ['Ja, kjøp', () => {
        giCu(-pris, true); faaTing(v.id); giXp(5, true);
        if (TING[v.id].kosmetisk) { lagret.kosmetikk = v.id; lagre(); }
        snakk(o.navn, ['Du kjøpte ' + TING[v.id].navn.toUpperCase() + '! Du har ' + fmtCu(lagret.kobber) + ' igjen.', v.effekt], () => butikk(o));
      }], ['Nei', () => butikk(o)]] }]);
  };
  const natt = erNatt() ? ' (Jeg har egentlig stengt.)' : '';
  snakk(o.navn, [{
    tekst: (varer.length ? 'Du har ' + fmtCu(lagret.kobber) + ' kobber. Hva vil du ha?' : 'Du har kjøpt alt jeg har!') + (erCowboy() ? ' Cowboytillegg: 20 %.' : nivaa() >= 3 ? ' Bas-rabatt: 15 %.' : '') + natt,
    valg: [...varer.map((v) => [TING[v.id].navn + ': ' + fmtCu(prisFor(v)) + (v.krav && v.krav() ? ' (' + v.krav() + ')' : ''), () => kjop(v), !!(v.krav && v.krav()) || lagret.kobber < prisFor(v)]),
      ...ekstra, ['Ha det', () => {}]],
  }]);
}
function cirka(o) {
  if (!Q('cirka')) {
    startOppdrag('cirka');
    return snakk(o.navn, ['Bjørn har bestilt stikkontakter. Det står: «Cirka en del. Cirka mange.»', 'Jeg kan ikke sende «cirka». Kan du telle hvor mange som mangler i 2. etasje?']);
  }
  const n = stikkTalt();
  return snakk(o.navn, ['Så, hvor mange stikkontakter mangler i 2. etasje?' + (n < 5 ? ' (Du har funnet ' + n + '. Er du sikker på at du har sett alle?)' : ''), { tekst: 'Ditt svar:', valg: [
    ...[3, 5, 8].map((tall) => [String(tall), () => {
      if (tall === 5 && n >= 5) { fullforOppdrag('cirka', 'ferdig', 'Telte nøyaktig: 5'); giCu(400, true); giXp(60); endreRykte(1, 'Ga Grete et ekte tall');
        snakk(o.navn, ['Fem! Et tall! Et ekte tall!', 'Jeg skal ramme inn denne ordren ved siden av Bjørns rapport. +400 g Cu']); }
      else { LYD.feil(); snakk(o.navn, ['Hm. Bjørn sa «cirka», men det tallet stemmer ikke med noe. Tell en gang til i alle leilighetene.']); }
    }]),
    ['«En del»', () => { fullforOppdrag('cirka', 'cirka', 'Svarte «en del»'); giXp(10); endreRykte(-1, 'Svarte «en del» på en bestilling');
      snakk(o.navn, ['Fint. Da sender jeg cirka.', 'Det kommer en lastebil. Cirka i morgen.']); }],
  ] }]);
}
function verksted() {
  const meny = () => snakk('Verkstedbenk', [{
    tekst: 'Du har ' + skrap() + ' skrapkobber og ' + fmtCu(lagret.kobber) + '. Hva vil du lage?',
    valg: [...OPPSKRIFTER.filter((op) => !T()[op.id]).map((op) => {
      const krav = op.krav && op.krav(), kan = !krav && skrap() >= op.skrap && lagret.kobber >= op.cu;
      return [TING[op.id].navn + ': ' + op.skrap + ' skrap + ' + fmtCu(op.cu) + (krav ? ' (' + krav + ')' : ''), () => {
        if (!kan) { LYD.feil(); return snakk('Verkstedbenk', [krav ? krav + '.' : 'Du har ikke nok. Trenger ' + op.skrap + ' skrap og ' + fmtCu(op.cu) + '.'], meny); }
        lagret.teller.skrap -= op.skrap; giCu(-op.cu, true); faaTing(op.id); giXp(20); endreRykte(0);
        snakk('Verkstedbenk', ['Du lodder, skrur og tester. Du har laget ' + TING[op.id].navn.toUpperCase() + '!', TING[op.id].tekst], meny);
      }, !kan];
    }), ['Ferdig', () => {}]],
  }]);
  meny();
}
function gjenvinning() {
  const n = skrap();
  if (!n) return snakk('Gjenvinning', ['Gjenvinningsbeholder for kobber. Du har ikke noe skrap.', 'Skrap ligger rundt på plassen og i byggene. Det glinser.']);
  return snakk('Gjenvinning', [{ tekst: 'Du har ' + n + ' skrapkobber. Lever til gjenvinning for 150 g Cu hver?', valg: [
    ['Lever alt (+' + fmtCu(n * 150) + ')', () => { lagret.teller.skrap = 0; giCu(n * 150); giXp(n * 3, true); endreRykte(n >= 3 ? 1 : 0, n >= 3 ? 'Sorterte avfallet riktig' : '');
      snakk('Gjenvinning', ['Kling, klang. Kobberet er sortert riktig. Som det eneste på denne plassen.']); }],
    ['Lever ett (+150 g)', () => { lagret.teller.skrap = n - 1; giCu(150); lagre(); }],
    ['Behold det til verkstedet', () => {}],
  ] }]);
}

// ── Små ting rundt omkring ──────────────────────────────────────────
function sofa() {
  return snakk('Sofa i garderoben', ['En sofa med tydelige merker etter mange lunsjpauser.', { tekst: 'Klokka er ' + klokkeTekst() + '. Ta en hvil?', valg: [
    ['Hvil til kveld (21:00)', () => hvil(21 * 60)], ['Hvil til morgen (07:00)', () => hvil(7 * 60)], ['Nei', () => {}]] }]);
}
function hvil(til) {
  if (til <= lagret.klokke % 1440) lagret.dag++;
  lagret.klokke = til; sp.liv = maksLiv(); lagre(); oppdaterHud();
  melding(til < 12 * 60 ? 'God morgen! Dag ' + lagret.dag + '.' : 'Det er kveld. Lyskasterne er på.', 3);
}
function garderobeskap() {
  const f = F();
  if (Q('skrutrekker') === 'aktiv' && !lagret.aapnet.skapSkrut) {
    lagret.aapnet.skapSkrut = true; faaTing('skrutrekker'); giXp(15, true);
    return snakk('Garderobeskap', ['Bak en arbeidsbukse som står av seg selv, finner du en skrutrekker.', 'Noen har skrevet VENSTRE på skaftet med tusj. Perfekt.']);
  }
  if (!lagret.aapnet.skapCu) { lagret.aapnet.skapCu = true; giCu(150); return snakk('Garderobeskap', ['Skapet til Tore. Det lukter sagflis og leverpostei.', 'I lomma på en jakke ligger det 150 g kobber. Finnerlønn.']); }
  return snakk('Garderobeskap', [tilf(['Skapet til Tore. Leverpostei. Mye leverpostei.', 'Skapet til Hilde. Alt er merket. Til og med merkelappene er merket.', 'Skapet til Kevin. Det er tomt, bortsett fra en lapp: «Hent ohm-olje».'])]);
}
function kjoleskap() {
  const f = F();
  if (!lagret.aapnet.kniv) {
    lagret.aapnet.kniv = true; faaTing('kniv'); giXp(10, true);
    if (!Q('verktoy')) setTimeout(() => startOppdrag('verktoy'), 50);
    return snakk('Kjøleskap', ['Kantinekjøleskapet. Det er kaldt. Det er det eneste som er kaldt på denne plassen.', 'Ved siden av melka ligger en kabelkniv. Det står MATS på den.']);
  }
  if (f.yoghurt) return melding('Det står en ny yoghurt der. Det står HILDE på den. Med store bokstaver.', 3);
  return snakk('Kjøleskap', ['En yoghurt med HILDE skrevet på lokket.', { tekst: 'Hva gjør du?', valg: [
    ['La den stå', () => { endreRykte(1, 'Lot Hildes yoghurt stå'); f.yoghurt = true; lagre(); melding('Klokt.', 2); }],
    ['Spis den', () => { f.yoghurt = true; sp.liv = Math.min(maksLiv(), sp.liv + 2); endreRykte(-2, 'Spiste Hildes yoghurt'); lagre(); oppdaterHud();
      snakk('', ['Jordbær. Den smakte av skyld.', 'Et sted på plassen sier Hilde: «Jeg vet hvem du er.»']); }],
  ] }]);
}
function arbeidsbryter() {
  const f = F();
  if (f.ventFikset) return melding('Viften går. Arbeidsbryteren står i PÅ.', 2);
  if (!Q('vifte')) startOppdrag('vifte');
  return snakk('Arbeidsbryter, aggregat', ['Arbeidsbryteren for ventilasjonsaggregatet står i AV.', 'Det henger en lapp: «Skrudd av pga. støy. Mvh Tore.»', { tekst: 'Aggregatet skal være i drift. Hva gjør du?', valg: [
    ['Sjekk at ingen jobber på aggregatet, så slå på', () => { f.ventFikset = true; fullforOppdrag('vifte', 'ferdig', 'Sjekket først'); giXp(50); endreRykte(1, 'Sjekket aggregatet før innkobling');
      snakk('', ['Du åpner inspeksjonsluka og ser etter. Ingen der. Ingen verktøy igjen.', 'Du slår på. Viften går. Tore kommer til å klage.']); }],
    ['Bare slå på', () => { f.ventFikset = true; fullforOppdrag('vifte', 'cowboy', 'Slo bare på'); giXp(20); endreRykte(-2, 'Slo på aggregatet uten å sjekke');
      snakk('', ['Du slår på. Et hyl fra inni aggregatet: «HEI! Jeg står inni her!»', 'Det er Roger. Han rengjorde filteret. Han har det fint. Han har det nesten fint.']); }],
  ] }]);
}

// ── Trafokiosken: de fem sikkerhetsreglene ──────────────────────────
const REGLER = ['Frakoble', 'Sikre mot innkobling', 'Kontrollere spenningsløshet', 'Jorde og kortslutte', 'Beskytte mot nærliggende spenningssatte deler'];
function trafoSteg(n, o) {
  const t = T(), steg = lagret.teller.trafoSteg || 0;
  const navn = ['', 'Lastskillebryter', 'Låsepunkt', 'Målepunkt', 'Jordingspunkt', 'Isolerende skjerm'][n];
  if (n <= steg) return melding(navn + ': ' + REGLER[n - 1].toLowerCase() + ' er gjort.', 2);
  if (n !== steg + 1) {
    LYD.feil();
    if (n === 4 && steg < 3) { skade(o.tx * TS + 8, o.ty * TS + 8, '', 2); }
    lagret.teller.trafoSteg = 0; lagre(); endreRykte(-1, 'Fulgte ikke sikkerhetsreglene i rekkefølge');
    return snakk('Hilde (på radio)', ['STOPP! Feil rekkefølge. Neste regel var: «' + REGLER[steg] + '».', 'Alt tilbakestilles. Begynn på regel 1. Hver gang. Ingen snarveier.']);
  }
  const krav = { 2: t.laas ? null : 'Du trenger lås og skilt.', 3: t.tester ? null : 'Du trenger spenningstesteren.', 4: t.stang ? null : 'Du trenger jordingsstangen.' }[n];
  if (krav) return snakk(navn, [krav]);
  const tekst = {
    1: 'Du slår av lastskillebryteren. Avgangen er frakoblet.',
    2: 'Du låser bryteren og henger på skilt med navnet ditt.',
    3: 'Du tester spenningstesteren mot kjent spenning, måler, og tester igjen. Spenningsløst!',
    4: 'Du kobler på jording og kortslutning. Nå er anlegget jordet.',
    5: 'Du setter opp en isolerende skjerm foran høyspentfeltet som fortsatt er spenningssatt.',
  }[n];
  lagret.teller.trafoSteg = n; lagre(); LYD.riktig(); giXp(10, true);
  return snakk(navn, [tekst, 'Regel ' + n + ' av 5: ' + REGLER[n - 1] + '.' + (n === 5 ? ' Anlegget er sikret. Nå kan du se på lavspenttavla.' : '')]);
}
function lavspenttavle() {
  const f = F(), t = T();
  if (f.trafoFerdig) return snakk('Lavspenttavle', ['Alle avganger er i orden. Riggplassen har stabil strøm.']);
  if ((lagret.teller.trafoSteg || 0) < 5) return snakk('Lavspenttavle', ['Tavla er spenningssatt. Følg de fem sikkerhetsreglene før du jobber her!', 'Skiltet på veggen viser rekkefølgen.']);
  const fiks = () => snakk('Lavspenttavle', [{ tekst: 'Avgang 3 har en løs kabelsko med varmgang. Hva gjør du?', valg: [
    ['Bytt kabelsko, trekk til med riktig moment og dokumenter', () => trafoFerdig(2, 'Riktig moment og dokumentasjon')],
    ['Trekk til ekstra hardt og håp', () => trafoFerdig(-2, 'Trakk til ekstra hardt')],
  ] }]);
  if (t.termo) return snakk('Lavspenttavle', ['Termokameraet viser det med en gang: kabelskoen på avgang 3 (riggplassen) lyser gult og rødt.'], fiks);
  const maal = { 1: 'Avgang 1 (bygg B): fin og kald.', 2: 'Avgang 2 (gatelys): fin og kald.', 3: 'Avgang 3 (riggplassen): misfarget isolasjon og sotmerker ved kabelskoen!', 4: 'Avgang 4 (reserve): ikke i bruk. Støvete.' };
  const meny = () => snakk('Lavspenttavle', [{ tekst: 'Du har ikke termokamera, så du må undersøke avgangene én og én. Hvilken?', valg: [
    ...[1, 2, 3, 4].map((n) => ['Undersøk avgang ' + n, () => snakk('Lavspenttavle', [maal[n]], n === 3 ? fiks : meny)]), ['Gå bort', () => {}]] }]);
  meny();
}
function trafoFerdig(rykte, valgTekst) {
  const f = F();
  f.trafoFerdig = true; lagret.valg.trafo = valgTekst; giCu(2000, true); giXp(150); endreRykte(rykte, rykte > 0 ? 'Fikset trafokiosken etter boka' : 'Fikset trafokiosken med «ekstra hardt»');
  fanfare();
  snakk('Trafokiosken', ['Feilen er rettet! Du fjerner sikringen i omvendt rekkefølge og kobler inn igjen.', 'Lyset i kiosken kommer på. På riggplassen jubler kaffemaskinen. +2 kg Cu',
    rykte < 0 ? '(Hilde på radio: «Ekstra hardt? Jeg skriver et avvik. Igjen.»)' : 'Hilde på radio: «Etter boka. Jeg er stolt. Jeg sier det bare én gang.»',
    'Nå venter bare fagprøven. Sensor Solveig er i brakka på sørtomta.']);
}

// ── Fagprøven: spillets siste sjef ──────────────────────────────────
function fagdor(o) {
  const f = F();
  if (!f.trafoFerdig) return snakk('Fagprøvebrakka', ['Låst. Et skilt: «Prøven avholdes når kandidaten er klar. Kandidaten er ikke klar.»']);
  if (nivaa() < 2) return snakk('Sensor Solveig (gjennom døra)', ['Du må være minst selvstendig montør (nivå 3) for å gå opp. Du er ' + NIVAA[nivaa()].navn.toLowerCase() + '.', 'Gjør flere oppdrag og kom tilbake.']);
  return snakk('Fagprøvebrakka', ['Døra glir opp. Det lukter kaffe, papir og nerver.'], () => { f.fagApen = true; o.borte = true; lagre(); LYD.dor(); visOmrNavn('FAGPRØVEN'); });
}
let fagPraktisk = null;
function fagprove(o) {
  const f = F(), tl = lagret.teller;
  if (f.fagBestatt) return snakk(o.navn, ['Gratulerer igjen. Jeg smilte nesten da du besto. Ikke si det til noen.']);
  tl.fagDel = tl.fagDel || 0; tl.fagFeil = tl.fagFeil || 0;
  const nerve = () => '♥'.repeat(3 - tl.fagFeil) + '♡'.repeat(tl.fagFeil);
  const feil = (igjen) => {
    tl.fagFeil++; lagre(); LYD.feil();
    if (tl.fagFeil >= 3) { tl.fagDel = 0; tl.fagFeil = 0; fagPraktisk = null; lagre();
      return snakk(o.navn, ['Tre feil. Strøket denne gangen.', 'Ta en kaffe, gjør noen oppdrag og kom tilbake. Prøven begynner da fra start.']); }
    snakk(o.navn, ['Feil. Nerver: ' + nerve()], igjen);
  };
  const neste = () => { tl.fagDel++; lagre(); LYD.riktig(); fagprove(o); };
  if (tl.fagDel === 0) return snakk(o.navn, ['Velkommen. Jeg er sensor Solveig. Jeg har sett alt. To ganger.', 'Fagprøven har fem deler: sikkerhet, feilsøking, verktøyvalg, praksis og problemløsning.',
    'Du har tre nerver. Tre feil, og vi tar en kaffe og prøver en annen dag.', { tekst: 'Er du klar?', valg: [['Klar', neste], ['Ikke ennå', () => {}]] }]);
  if (tl.fagDel === 1) {
    const valgt = [];
    const steg = () => {
      if (valgt.length === 5) return snakk(o.navn, ['Alle fem, i riktig rekkefølge. Bra.'], neste);
      const igjen = REGLER.filter((x) => !valgt.includes(x)).sort(() => Math.random() - 0.5);
      snakk(o.navn, [{ tekst: 'Del 1, sikkerhet. Nerver: ' + nerve() + '. Hva er regel nummer ' + (valgt.length + 1) + ' av de fem sikkerhetsreglene?',
        valg: igjen.map((x) => [x, () => { if (x === REGLER[valgt.length]) { valgt.push(x); pip(700, 0.05); steg(); } else feil(steg); }]) }]);
    };
    return steg();
  }
  if (tl.fagDel === 2) {
    const meny = () => snakk(o.navn, [{ tekst: 'Del 2, feilsøking. Jordfeilbryteren i kantina løser ut hver gang kaffetrakteren slås på. Hva vil du måle?', valg: [
      ['Isolasjonsmål kursen med trakteren frakoblet', () => snakk(o.navn, ['Kursen: 250 MΩ. Helt fin.'], meny)],
      ['Isolasjonsmål kaffetrakteren', () => snakk(o.navn, ['Trakteren: 0,2 MΩ mellom fase og jord. Det er lavt.'], meny)],
      ['Mål spenningen i stikkontakten', () => snakk(o.navn, ['230 V. Normalt. Men det sier ikke noe om jordfeilen.'], meny)],
      ['Jeg har funnet feilen', () => snakk(o.navn, [{ tekst: 'Hvor er feilen?', valg: [
        ['Kursen', () => feil(meny)], ['Kaffetrakteren', neste], ['Jordfeilbryteren er defekt', () => feil(meny)], ['Kevin', () => feil(meny)]] }])],
    ] }]);
    return meny();
  }
  if (tl.fagDel === 3) {
    const sp3 = [
      ['Du skal kontrollere at en kurs er spenningsløs.', 'Spenningstester', ['Spenningstester', 'Isolasjonstester', 'Kabelsøker']],
      ['Du skal finne en kabel bak gipsen før noen skrur.', 'Kabelsøker', ['Termokamera', 'Kabelsøker', 'Jordingsstang']],
      ['Du vil se om en kobling har varmgang mens tavla er i drift, på trygg avstand.', 'Termokamera', ['Termokamera', 'Multimeter', 'Hodelykt']],
    ];
    const still = (i) => {
      if (i >= sp3.length) return snakk(o.navn, ['Riktig verktøy til riktig jobb. Det er halve faget.'], neste);
      const [tekst, riktig, valgL] = sp3[i];
      snakk(o.navn, [{ tekst: 'Del 3, verktøyvalg (' + (i + 1) + '/3). Nerver: ' + nerve() + '. ' + tekst, valg: valgL.map((v) => [v, () => (v === riktig ? (pip(700, 0.05), still(i + 1)) : feil(() => still(i)))]) }]);
    };
    return still(0);
  }
  if (tl.fagDel === 4) {
    if (fagPraktisk && fagPraktisk.ferdig) { fagPraktisk = null; return neste(); }
    if (fagPraktisk) return snakk(o.navn, ['Jord alle gnistene i prøverommet. Du kan ikke miste mer enn to hjerter.']);
    return snakk(o.navn, ['Del 4, praksis. Jeg slipper løs fire gnister i prøverommet.', 'Jord dem alle med stangen. Du kan ikke miste mer enn to hjerter. Klar?'], () => {
      sp.liv = maksLiv(); oppdaterHud();
      fagPraktisk = { start: sp.liv, gnister: [[18, 32], [22, 32], [18, 35], [22, 35]].map(([x, y], i) => ({ x: x * TS + 4, y: y * TS + 4, w: 8, h: 8, vx: 0, vy: 0, t: 0, i: 90 + i, id: 'fag' + i, fag: true })) };
      for (const s of fagPraktisk.gnister) gnister.push(s);
    });
  }
  if (tl.fagDel === 5) {
    return snakk(o.navn, ['Del 5, problemløsning. Døra går opp, og Bjørn kommer inn.', 'Bjørn: «Kunden vil ha seks ekstra stikkontakter. I dag. Uten endringsmelding. Det går fint, ikke sant?»',
      { tekst: 'Hva svarer du? Nerver: ' + nerve(), valg: [
        ['«Jeg skriver en endringsmelding, så avklarer vi pris og tid før jeg starter.»', () => { endreRykte(1, 'Krevde endringsmelding på fagprøven'); bestatt(o); }],
        ['«Klart! Vi tar papirene senere.»', () => { endreRykte(-1, 'Ville ta papirene senere'); feil(() => fagprove(o)); }],
        ['«Det er umulig.»', () => feil(() => fagprove(o))],
      ] }]);
  }
}
function bestatt(o) {
  const f = F();
  f.fagBestatt = true; lagret.teller.fagDel = 6; giCu(3000, true); giXp(250); fanfare();
  setTimeout(fanfare, 600);
  snakk(o.navn, ['Bestått.', 'Sikkerhet, feilsøking, verktøy, praksis og problemløsning. Alt sitter.', 'Gratulerer. +3 kg Cu'], () => visAvslutning());
}
function praktiskSjekk() {
  if (!fagPraktisk || fagPraktisk.ferdig) return;
  if (fagPraktisk.start - sp.liv > 4) {
    gnister = gnister.filter((s) => !s.fag); fagPraktisk = null; lagret.teller.fagFeil = (lagret.teller.fagFeil || 0) + 1; lagre(); LYD.feil();
    if (lagret.teller.fagFeil >= 3) { lagret.teller.fagDel = 0; lagret.teller.fagFeil = 0; lagre(); return snakk('Sensor Solveig', ['Du mistet for mange hjerter, og det var tredje feil. Strøket denne gangen.', 'Kom tilbake når du er klar. Vi begynner fra start.']); }
    return snakk('Sensor Solveig', ['Du mistet mer enn to hjerter. Det teller som en feil.', 'Snakk med meg for å prøve praksisdelen igjen.']);
  }
  if (fagPraktisk.gnister.every((s) => s.borte)) { fagPraktisk.ferdig = true; LYD.riktig(); melding('Alle gnistene er jordet! Snakk med sensoren.', 3); }
}

// ── Avslutning ──────────────────────────────────────────────────────
function visAvslutning() {
  const f = F(), fullfort = Object.values(lagret.oppdrag).filter((s) => s !== 'aktiv').length, totalt = Object.keys(OPPDRAG).length;
  const tittel = erRyddig() ? 'Den ryddige montøren' : erCowboy() ? 'Cowboyen med fagbrev' : 'Strømmen er på!';
  const tekst = erRyddig()
    ? ['Du besto fagprøven med dokumentasjon, målinger og ryddige valg hele veien.', 'Bjørn tilbyr deg jobben som bas. Hilde har hengt opp rapporten din på oppslagstavla, ved siden av «Dager siden siste ulykke: 4». Ny rekord!']
    : erCowboy()
      ? ['Du besto fagprøven. Ingen helt vet hvordan.', 'Bjørn gir deg et nytt prosjekt. Hilde gir deg en ny perm: «Avvik – deg». Den er allerede full. Kevin ser opp til deg. Det er bekymringsfullt.']
      : ['Du besto fagprøven og fikk strømmen på overalt.', 'Bjørn utsetter innflyttingen enda en uke, men denne gangen er det ikke din skyld. Hilde nikker til deg. Det er mye, fra Hilde.'];
  const epilog = [];
  if (lagret.oppdrag.skrutrekker === 'lurt') epilog.push('Kevin fant aldri skrutrekkeren. Han fant bajamajaen. Han husker deg.');
  if (lagret.oppdrag.skrutrekker === 'funnet') epilog.push('Den venstrehendte skrutrekkeren henger innrammet i brakka.');
  if (lagret.oppdrag.trommel === 'solgt') epilog.push('Roger leier nå sin egen lilla trommel tilbake fra Grete. Til dobbel pris.');
  if (lagret.oppdrag.trommel === 'tore') epilog.push('Tore spiser lunsj ved en lilla trommel. Roger spiser lunsj alene.');
  if (lagret.oppdrag.sondre === 'bluetooth') epilog.push('Lampa i leilighet 201 skrus av og på fra et sted i Bergen.');
  if (lagret.oppdrag.kabelbro === 'tak') epilog.push('Kabelbroen er fortsatt på taket. Kabelen ligger riktig. Bare ikke der den skal.');
  if (lagret.oppdrag.tyver === 'ferdig') epilog.push('Kobbertyvene ble tatt. Vidar fikk drikke kaffen sin i fred.');
  if (f.yoghurt && lagret.hendelser && lagret.hendelser.some((e) => e.tekst.includes('Spiste'))) epilog.push('Hilde vet fortsatt hvem som tok yoghurten.');
  const min = Math.round(lagret.spilletid / 60);
  $('ferdigTittel').textContent = tittel;
  $('ferdigTekst').innerHTML = tekst.map((x) => '<p>' + esc(x) + '</p>').join('') + epilog.map((x) => '<p class="smaa">• ' + esc(x) + '</p>').join('') +
    '<div class="stat"><span>Nivå</span><b>' + NIVAA[nivaa()].navn + ' (' + lagret.xp + ' XP)</b></div>' +
    '<div class="stat"><span>Rykte</span><b>' + rykteNavn() + '</b></div>' +
    '<div class="stat"><span>Kobber</span><b>' + fmtCu(lagret.kobber) + '</b></div>' +
    '<div class="stat"><span>Sideoppdrag fullført</span><b>' + fullfort + ' av ' + totalt + '</b></div>' +
    '<div class="stat"><span>Spilletid</span><b>' + min + ' min</b></div>' +
    '<p class="smaa">Du kan fortsette å utforske, finne skjulte funn og fullføre sideoppdrag.</p>';
  $('lagFerdig').classList.add('vis'); tilstand = 'ferdig';
}
$('fortsettEtter').onclick = () => { $('lagFerdig').classList.remove('vis'); tilstand = 'spill'; };
