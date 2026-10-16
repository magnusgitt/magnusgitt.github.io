// Automatiske tester for Gnist (Playwright, Chromium).
// Kjør:  node voltbase/gnist/test/rute.js
// Miljøvariabler (valgfrie): PW = sti til playwright-modulen, CHROME = sti til chromium.
'use strict';
const path = require('path');
const { chromium, devices } = require(process.env.PW || 'playwright');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const KEY = 'voltbase-gnist-v1';

let feil = 0, ok = 0;
function sjekk(navn, betingelse, info) {
  if (betingelse) { ok++; console.log('  ok   ' + navn); }
  else { feil++; console.log('  FEIL ' + navn + (info !== undefined ? '  → ' + JSON.stringify(info) : '')); }
}
const vent = (page, ms) => page.waitForTimeout(ms);

async function nySide(b, opts, sok) {
  const ctx = await b.newContext(opts); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL + (sok || '')); await vent(page, 400);
  return { ctx, page, errs };
}
// flytter montøren til en rute (fot på toppen av raden under)
const pos = (page, x, y) => page.evaluate(([x, y]) => { const P = __gnist.P; P.x = x * 32 + 7; P.y = (y + 1) * 32 - P.h; P.vx = P.vy = 0; }, [x, y]);
const tilstand = page => page.evaluate(() => { const g = __gnist; return { x: g.P.x / 32, y: (g.P.y + g.P.h) / 32, mode: g.S.mode, ev: { ...g.S.ev }, hp: g.P.hp, cp: g.S.cp, fase: g.B.fase, bossDone: g.S.bossDone, ferdig: g.S.ferdig }; });
async function dobbelhopp(page, dir, ms) {
  if (dir) await page.keyboard.down(dir); const t0 = Date.now();
  await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space');
  await vent(page, 60); await page.keyboard.down('Space'); await vent(page, 220); await page.keyboard.up('Space');
  if (dir) { await vent(page, Math.max(0, ms - (Date.now() - t0))); await page.keyboard.up(dir); }
  await vent(page, 900);
}
// et hopp med ekte tastetrykk kan bomme på grunn av timing i hodeløs nettleser; prøv opptil tre ganger
async function hoppTil(page, fra, dir, ms, ok) {
  for (let i = 0; i < 3; i++) { await pos(page, fra[0], fra[1]); await vent(page, 400); await dobbelhopp(page, dir, ms); const t = await tilstand(page); if (ok(t)) return t; }
  return null;
}
async function lukkKort(page) {
  await page.waitForFunction(() => __gnist.S.mode === 'evne', null, { timeout: 4000 }).catch(() => {}); await vent(page, 450);
  await page.keyboard.press('Enter'); await page.waitForFunction(() => __gnist.S.mode === 'spill', null, { timeout: 2000 }).catch(() => {}); await vent(page, 200); }

async function pcRute(b) {
  console.log('PC: hele område 1 med tastatur');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.removeItem(k), KEY); await page.reload(); await vent(page, 400);
  await page.click('#bNy'); await page.evaluate(() => { if (S.mode === 'intro') sluttIntro(); }); await vent(page, 700);
  await pos(page, 32, 23); await vent(page, 300); await dobbelhopp(page, 'ArrowRight', 900);
  sjekk('veggen stopper uten stigesko', (await tilstand(page)).x < 35);
  await pos(page, 41, 31); await vent(page, 300); await page.keyboard.down('ArrowRight');
  await page.waitForFunction(() => __gnist.S.ev.dobbel, null, { timeout: 3000 }).catch(() => {}); await page.keyboard.up('ArrowRight');
  sjekk('stigesko plukket opp', (await tilstand(page)).ev.dobbel); await lukkKort(page);
  sjekk('sjakt: første hylle', await hoppTil(page, [44, 31], 'ArrowRight', 750, t => Math.abs(t.y - 27) < .1));
  sjekk('over veggen med dobbelhopp', await hoppTil(page, [32, 23], 'ArrowRight', 900, t => t.y <= 19.1));
  await page.evaluate(() => { __gnist.fiender.length = 0; });
  sjekk('stillas: planke 11', await hoppTil(page, [51, 14], 'ArrowRight', 650, t => Math.abs(t.y - 11) < .1));
  sjekk('stillas: planke 7', await hoppTil(page, [57, 10], 'ArrowLeft', 650, t => Math.abs(t.y - 7) < .1));
  sjekk('stillas: øya', await hoppTil(page, [51, 6], 'ArrowRight', 900, t => Math.abs(t.y - 3) < .1));
  await pos(page, 58, 2); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 700); await page.keyboard.up('ArrowRight');
  sjekk('hansker plukket opp', (await tilstand(page)).ev.hansker); await lukkKort(page);
  await pos(page, 70, 18); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 900); await page.keyboard.up('ArrowRight');
  await vent(page, 600); sjekk('bossintro starter', (await tilstand(page)).fase === 'intro');
  await vent(page, 2800); sjekk('bosskamp', (await tilstand(page)).fase === 'kamp');
  await page.evaluate(() => { __gnist.P.inv = 999; });
  for (const [x, y] of [[78, 14], [87, 9], [96, 14]]) { await pos(page, x, y); await vent(page, 2300); }
  await vent(page, 2800); const etterBoss = await tilstand(page);
  sjekk('boss slått', etterBoss.bossDone && etterBoss.fase === '', etterBoss);
  await page.evaluate(() => { __gnist.P.inv = 0; });
  await pos(page, 87, 18); await vent(page, 600); sjekk('strømstøt plukket opp', (await tilstand(page)).ev.stot); await lukkKort(page);
  let overSjakt = false;
  for (let i = 0; i < 3 && !overSjakt; i++) { await pos(page, 104, 18); await vent(page, 400);
    // hopp, hopp igjen når montøren begynner å falle, og støt på toppen av det andre hoppet
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space'); await vent(page, 300); await page.keyboard.up('Space');
    await page.waitForFunction(() => __gnist.P.vy > 150, null, { timeout: 2000 }).catch(() => {});
    await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space');
    await page.waitForFunction(() => __gnist.P.vy >= 0, null, { timeout: 2000 }).catch(() => {});
    await page.keyboard.press('ShiftLeft'); await vent(page, 900); await page.keyboard.up('ArrowRight');
    const t = await tilstand(page); overSjakt = t.x > 117 && t.y < 19.5; if (!overSjakt) await vent(page, 2000); }
  sjekk('over sjakten med støt', overSjakt, await page.evaluate(() => ({ mode: __gnist.S.mode, laas: __gnist.S.laas, ending: __gnist.S.ending, x: __gnist.P.x / 32, hp: __gnist.P.hp, evne: document.querySelector('.lag.vis') && document.querySelector('.lag.vis').id })));
  await page.keyboard.down('ArrowRight'); await vent(page, 800); await page.keyboard.up('ArrowRight');
  await vent(page, 5500); const slutt = await tilstand(page);
  sjekk('hovedtavla: strømmen tilbake', slutt.ferdig, slutt);
  sjekk('ingen JS-feil (PC)', errs.length === 0, errs);
  await ctx.close();
}

async function lagring(b) {
  console.log('Lagring');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  // gammel v1-lagring (uten nye felt)
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 1, ev: { dobbel: true, hansker: true, stot: false }, cp: 2, cpLit: [0, 1, 2], orb: [0, 1, 2, 20], boss: false, tid: 120 })), KEY);
  await page.reload(); await vent(page, 500);
  sjekk('fortsett-knapp vises', await page.locator('#bFortsett').isVisible());
  await page.click('#bFortsett'); await vent(page, 600);
  const t = await tilstand(page);
  sjekk('gammel lagring lastes', t.ev.dobbel && t.ev.hansker && t.cp === 2, t);
  sjekk('lysorber fra gammel lagring', (await page.evaluate(() => [...__gnist.S.orbTatt].join(','))) === '0,1,2,20');
  // død og gjenoppstå
  await page.evaluate(() => { __gnist.P.hp = 1; __gnist.P.inv = 0; }); await pos(page, 23, 29); await vent(page, 2400);
  const d = await tilstand(page); sjekk('død → tilbake på sjekkpunkt', d.cp === 2 && d.hp === d.hp && Math.abs(d.x - 69) < 1.5, d);
  // ødelagt lagring
  await page.evaluate(k => localStorage.setItem(k, '{tull'), KEY); await page.reload(); await vent(page, 500);
  sjekk('ødelagt lagring ignoreres', !(await page.locator('#bFortsett').isVisible()));
  sjekk('ingen JS-feil (lagring)', errs.length === 0, errs);
  await ctx.close();
}

async function omraade2(b) {
  console.log('Område 2: kabelkjelleren');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 2, ev: { dobbel: true, hansker: true, stot: true }, cp: 3, cpLit: [0, 1, 2, 3], orb: [], boss: true, ferdig: true, tid: 300 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  sjekk('luka er åpen etter kapittel 1', await page.evaluate(() => __gnist.tile(126, 19) === 0));
  await pos(page, 126, 18); await vent(page, 1200);
  // fagkortet i sjakten tas i fallet
  if (await page.evaluate(() => __gnist.S.mode === 'evne' || __gnist.S.evneVent > 0)) await lukkKort(page);
  await vent(page, 1500);
  const t1 = await tilstand(page); sjekk('faller ned i kabelgangen', t1.y > 36 && t1.y <= 42.1, t1);
  // kabeltrommelen ligger innerst i pumpehallen
  await page.evaluate(() => { __gnist.fiender.length = 0; }); await pos(page, 74, 55); await vent(page, 600);
  sjekk('kabeltrommel plukket opp', (await tilstand(page)).ev.krok); await lukkKort(page);
  sjekk('krok-knapp i HUD', await page.evaluate(() => !!document.querySelector('#ev-krok')));
  // over kanalen med ekte tastetrykk: hold C, slipp når montøren svinger fremover
  const st = () => page.evaluate(() => { const P = __gnist.P; return { x: P.x / 32, vy: P.vy, k: P.krok && P.krok.k[0], g: P.onGround, dod: __gnist.S.dod }; });
  let over = false, festet = false;
  for (let forsok = 0; forsok < 3 && !over; forsok++) {
    await pos(page, 100, 56); await vent(page, 400);
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('KeyC'); await vent(page, 150);
    await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space');
    let c = true; const t0 = Date.now();
    while (Date.now() - t0 < 10000) { const s = await st(); if (s.k) festet = true;
      if (s.k && c && s.x > s.k + 1.2 && s.vy < 0) { await page.keyboard.up('KeyC'); c = false; }
      else if (!c && !s.k) { await vent(page, 120); await page.keyboard.down('KeyC'); c = true; }
      if (s.x > 136 && s.g) { over = true; break; } if (s.dod > 0) break; await vent(page, 25); }
    await page.keyboard.up('ArrowRight'); await page.keyboard.up('KeyC'); await vent(page, 1500);
  }
  sjekk('kroken fester seg', festet);
  sjekk('over kanalen med kabeltrommelen', over);
  // slipp ved en treg sving gir likevel fart fremover og litt opp
  { const r = await page.evaluate(() => { const P = __gnist.P; P.krok = { k: [110, 47], x: 110.5 * 32, y: 47 * 32, len: 3 * 32 }; P.vx = 120; P.vy = 40; slippKrok(false); return { vx: P.vx, vy: P.vy }; });
    sjekk('tilgivende slipp av kroken', r.vx >= 380 && r.vy <= -280, r); }
  // bossen i koblingsrommet
  await page.evaluate(() => { __gnist.P.inv = 999; }); await pos(page, 146, 56); await vent(page, 500);
  sjekk('Kortslutningen våkner', await page.evaluate(() => __gnist.B2.aktiv && __gnist.B2.fase === 'intro'));
  sjekk('døra bak stenges', await page.evaluate(() => __gnist.tile(140, 55) === 5));
  sjekk('kamp mot Kortslutningen', await page.waitForFunction(() => __gnist.B2.fase === 'kamp', null, { timeout: 8000 }).then(() => true, () => false));
  sjekk('bossnavn i HUD', (await page.textContent('#bossNavn')) === 'Kortslutningen');
  let golvSett = false, treffMedStot = false;
  const tBoss = Date.now();
  while (Date.now() - tBoss < 60000) {
    const b2 = await page.evaluate(() => ({ hp: __gnist.B2.hp, ned: __gnist.B2.ned, y: __gnist.B2.y / 32, x: __gnist.B2.x / 32, golv: __gnist.B2.golv, fase: __gnist.B2.fase }));
    if (b2.golv === 2) golvSett = true;
    if (b2.fase !== 'kamp') break;
    if (b2.ned > 0 && b2.ned < 2.1 && b2.y > 54.5) {
      // første treff: ekte strømstøt fra gulvet. Resten: hopp ned på den.
      if (!treffMedStot) { const hp0 = b2.hp; await pos(page, Math.round(b2.x) - 4, 56); await vent(page, 80); await page.keyboard.press('ShiftLeft'); await vent(page, 400);
        treffMedStot = (await page.evaluate(() => __gnist.B2.hp)) < hp0; continue; }
      await page.evaluate(([x, y]) => { const P = __gnist.P; P.x = x * 32 - P.w / 2; P.y = (y - 2) * 32; P.vy = 200; P.vx = 0; }, [b2.x, b2.y]); await vent(page, 400); continue; }
    await vent(page, 50);
  }
  sjekk('gulvet får strøm', golvSett);
  sjekk('treff med strømstøt fra gulvet', treffMedStot);
  await vent(page, 3000);
  const ferdig2 = await page.evaluate(() => ({ boss2: __gnist.S.boss2, dor: __gnist.tile(166, 54), inn: __gnist.tile(140, 55) }));
  sjekk('Kortslutningen slått, dørene åpne', ferdig2.boss2 && ferdig2.dor === 0 && ferdig2.inn === 0, ferdig2);
  await page.evaluate(() => { __gnist.P.inv = 0; }); await pos(page, 153, 55); await vent(page, 800);
  sjekk('livsgnist 2 plukket opp', await page.evaluate(() => __gnist.S.ev.liv2 && __gnist.P.max === 5));
  // lagring v3 overlever ny innlasting
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  sjekk('v3-lagring: krok, boss 2 og liv', await page.evaluate(() => __gnist.S.ev.krok && __gnist.S.boss2 && __gnist.S.ev.liv2 && __gnist.tile(166, 54) === 0));
  if (process.env.SKJERM) await page.screenshot({ path: path.join(process.env.SKJERM, 'omr2.png') });
  sjekk('ingen JS-feil (område 2)', errs.length === 0, errs);
  await ctx.close();
}

async function fase4(b) {
  console.log('Kart, hurtigreise, verksted, fagkort og musikk');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 3, ev: { dobbel: true, hansker: true, stot: true, krok: true }, cp: 3, cpLit: [0, 1, 2, 3, 4], orb: [...Array(20).keys()], boss: true, ferdig: true, tid: 600 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  for (const [x, y] of [[126, 18], [128, 30], [130, 41]]) { await pos(page, x, y); await vent(page, 250); }
  await page.keyboard.press('Tab'); await vent(page, 300);
  sjekk('Tab åpner kartet', await page.evaluate(() => __gnist.S.mode === 'kart' && document.querySelector('#lagKart').classList.contains('vis')));
  const kartOk = await page.evaluate(() => { const c = document.querySelector('#kartC'); return c.width > 50 && c.height > 30; }); sjekk('kartet tegnes', kartOk);
  // klikk på lampe 0 (start) er ikke besøkt; klikk på lampe 4
  const r = await page.locator('#kartC').boundingBox(), u = await page.evaluate(() => kartUtsnitt), c4 = await page.evaluate(() => __gnist.SJEKK[4]);
  await page.mouse.click(r.x + (c4.x + .5 - u.tx0) * u.sk, r.y + (c4.y + .3 - u.ty0) * u.sk); await vent(page, 400);
  const t = await tilstand(page); sjekk('hurtigreise til tent lampe', t.mode === 'spill' && t.cp === 4 && Math.abs(t.x - 132.5) < 1.5, t);
  await page.keyboard.press('KeyQ'); await vent(page, 200); await page.keyboard.press('KeyQ'); await vent(page, 200);
  sjekk('Q åpner og lukker kartet', await page.evaluate(() => __gnist.S.mode === 'spill'));
  // verkstedet ved lampe 4
  await vent(page, 300); sjekk('verkstedknapp vises', await page.locator('#verkKnapp').isVisible());
  await page.keyboard.press('ArrowDown'); await vent(page, 300);
  sjekk('↓ åpner verkstedet', await page.evaluate(() => __gnist.S.mode === 'verk'));
  await page.click('#verkListe button[data-id="kabel"]'); await vent(page, 200);
  sjekk('kjøp: lengre kabel', await page.evaluate(() => __gnist.S.kjop.kabel && __gnist.orbIgjen() === 14));
  await page.click('#verkListe button[data-id="liv3"]'); await vent(page, 200);
  sjekk('kjøp: ekstra liv', await page.evaluate(() => __gnist.S.kjop.liv3 && __gnist.P.max === 5 && __gnist.orbIgjen() === 6));
  await page.click('#verkListe button[data-id="stot2"]'); await vent(page, 200);
  sjekk('for dyrt er sperret', await page.evaluate(() => __gnist.orbIgjen() === 0 && document.querySelector('#verkListe button[data-id="lykt"]').disabled));
  await page.click('#bVerkLukk'); await vent(page, 200);
  // fagkort
  await pos(page, 125, 39); await vent(page, 300);
  await page.waitForFunction(() => __gnist.S.mode === 'evne', null, { timeout: 4000 }).catch(() => {});
  sjekk('fagkort plukket opp', await page.evaluate(() => __gnist.S.fag.has(8) && document.querySelector('#evneUnder').textContent === 'Fagkort'));
  await lukkKort(page);
  await page.keyboard.press('Escape'); await vent(page, 200); await page.click('#bFag'); await vent(page, 200);
  sjekk('fagkortlista viser kortet', (await page.locator('#fagListe .fagKort:not(.mangler)').count()) === 1);
  await page.click('#bFagLukk'); await page.click('#bMus'); await vent(page, 100);
  sjekk('musikkbryter', (await page.textContent('#bMus')) === 'Musikk: av'); await page.click('#bMus');
  await page.click('#bPauseFortsett'); await vent(page, 800);
  sjekk('musikken spiller', await page.evaluate(() => !A.c || (MUS.gain && MUS.tema !== null)));
  await page.reload(); await vent(page, 400);
  const l = await page.evaluate(() => { const l = hentLagret(); return { fag: l.fag, kabel: l.kjop.kabel, brukt: l.brukt, sett: [...l.sett].filter(x => x).length }; });
  sjekk('lagring: fagkort, kjøp og kart', l.fag.includes(8) && l.kabel && l.brukt === 20 && l.sett > 5, l);
  sjekk('ingen JS-feil (fase 4)', errs.length === 0, errs);
  await ctx.close();
}

async function fase5(b) {
  console.log('Område 3: trafostasjonen, sluttboss og tidsmodus');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 3, ev: { dobbel: true, hansker: true, stot: true, krok: true, liv2: true }, cp: 7, cpLit: [0, 1, 2, 3, 4, 5, 6, 7], orb: [], boss: true, boss2: true, ferdig: true, tid: 600 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 800);
  // opp av stigesjakten med ekte tastetrykk
  let oppe = false;
  for (let i = 0; i < 3 && !oppe; i++) { await pos(page, 168, 31); await vent(page, 400);
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space');
    await page.waitForFunction(() => __gnist.P.vy > 100, null, { timeout: 2000 }).catch(() => {});
    await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space'); await vent(page, 800); await page.keyboard.up('ArrowRight');
    const t = await tilstand(page); oppe = t.y <= 27.1 && t.x > 170; }
  sjekk('opp av stigesjakten til stasjonen', oppe);
  sjekk('spøkelsesplattform er luft uten tester', await page.evaluate(() => !fast(190, 23)));
  await pos(page, 178, 26); await vent(page, 600); sjekk('spenningstester plukket opp', (await tilstand(page)).ev.tester); await lukkKort(page);
  sjekk('spøkelsesplattform er fast med tester', await page.evaluate(() => fast(190, 23)));
  await pos(page, 190, 22); await vent(page, 600); sjekk('kan stå på spøkelsesplattform', Math.abs((await tilstand(page)).y - 23) < .1);
  await pos(page, 193, 6); await vent(page, 600); sjekk('vinkelsliper plukket opp', (await tilstand(page)).ev.sliper); await lukkKort(page);
  // skjær opp muren med et ekte strømstøt
  let knust = false;
  for (let i = 0; i < 3 && !knust; i++) { await pos(page, 163, 26); await vent(page, 300); await page.keyboard.down('ArrowLeft'); await vent(page, 60); await page.keyboard.press('ShiftLeft'); await vent(page, 500); await page.keyboard.up('ArrowLeft');
    knust = await page.evaluate(() => __gnist.S.knust.has(0) && __gnist.tile(160, 24) === 0); }
  sjekk('vinkelsliperen skjærer opp muren', knust);
  // sluttbossen
  await page.evaluate(() => { __gnist.P.inv = 9999; }); await pos(page, 152, 26); await vent(page, 500);
  sjekk('Trafokjempen våkner', await page.evaluate(() => __gnist.B3.aktiv));
  sjekk('gården stenges', await page.evaluate(() => __gnist.tile(161, 22) === 5));
  sjekk('kamp mot Trafokjempen', await page.waitForFunction(() => __gnist.B3.fase === 'kamp', null, { timeout: 8000 }).then(() => true, () => false));
  const faser = new Set(); let golv3 = false, stotTreff = false; const tB = Date.now();
  while (Date.now() - tB < 120000) {
    const s = await page.evaluate(() => { const B3 = __gnist.B3, f = B3.hp > 4 ? 1 : B3.hp > 2 ? 2 : 3; return { f, hp: B3.hp, fase: B3.fase, aapen: (f === 1 && B3.sar > 0) || (f === 2 && B3.ned > 0) || (f === 3 && B3.sar > 0), stun: B3.stun, k: b3Kjerne(), golv: B3.golv }; });
    if (s.fase !== 'kamp') break; faser.add(s.f); if (s.golv === 2) golv3 = true;
    if (s.aapen && s.stun <= 0) {
      if (s.f === 1) { const hp0 = s.hp; await page.evaluate(([kx, ky]) => { const P = __gnist.P; P.x = kx - 110; P.y = __gnist.B3.y - P.h; P.vy = 0; P.vx = 0; P.face = 1; }, s.k); await page.keyboard.press('ShiftLeft'); await vent(page, 400);
        if ((await page.evaluate(() => __gnist.B3.hp)) < hp0) stotTreff = true; }
      else { await page.evaluate(([kx, ky]) => { const P = __gnist.P; P.x = kx - P.w / 2; P.y = ky - 80; P.vy = 300; P.vx = 0; }, s.k); await vent(page, 400); }
      continue; }
    await vent(page, 60);
  }
  sjekk('alle tre fasene', faser.size === 3, [...faser]);
  sjekk('strømstøt fra bakken treffer brystplaten', stotTreff);
  sjekk('gulvet får strøm i fase 2', golv3);
  sjekk('rulletekst etter sluttbossen', await page.waitForFunction(() => document.querySelector('#lagRull').classList.contains('vis'), null, { timeout: 15000 }).then(() => true, () => false));
  sjekk('spillet er fullført og lagret', await page.evaluate(() => { const l = hentLagret(); return l.helt && l.boss3 && l.knust.includes(0) && l.ev.sliper; }));
  // tidsmodus
  await page.reload(); await vent(page, 400);
  sjekk('tidsmodus i menyen', await page.locator('#bTid').isVisible());
  const for_ = await page.evaluate(k => localStorage.getItem(k), KEY);
  await page.click('#bTid'); await vent(page, 1500);
  sjekk('tidsmodus starter fra begynnelsen med klokke', await page.evaluate(() => __gnist.S.tidsmodus && !__gnist.S.ev.dobbel && document.querySelector('#tidtaker').classList.contains('vis') && document.querySelector('#tidtaker').textContent !== '0:00.0'));
  await pos(page, 41, 31); await page.keyboard.down('ArrowRight'); await page.waitForFunction(() => __gnist.S.ev.dobbel, null, { timeout: 3000 }).catch(() => {}); await page.keyboard.up('ArrowRight'); await lukkKort(page);
  sjekk('tidsmodus rører ikke lagringen', (await page.evaluate(k => localStorage.getItem(k), KEY)) === for_);
  sjekk('ingen JS-feil (område 3)', errs.length === 0, errs);
  await ctx.close();
}

async function hemmeligheter(b) {
  console.log('Gjemmesteder i område 1');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 3, ev: { dobbel: true, hansker: true, stot: true, krok: true, tester: true, sliper: true }, cp: 1, cpLit: [0, 1, 2, 3], orb: [], boss: true, ferdig: true, tid: 600 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  let hule = false;
  for (let i = 0; i < 3 && !hule; i++) { await pos(page, 46, 22); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 60); await page.keyboard.press('ShiftLeft'); await vent(page, 500); await page.keyboard.up('ArrowRight');
    hule = await page.evaluate(() => __gnist.S.knust.has(2)); }
  sjekk('hulen bak den svake veggen åpnes', hule);
  await pos(page, 53, 23); await vent(page, 600); sjekk('livsgnist i hulen', await page.evaluate(() => __gnist.S.ev.liv4));
  sjekk('usynlig trapp i sjakten', await page.evaluate(() => fast(124, 15) && fast(127, 4)));
  sjekk('ingen JS-feil (gjemmesteder)', errs.length === 0, errs);
  await ctx.close();
}

async function fase6(b) {
  console.log('Område 4: kraftverket, klatrejern og Generatoren');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  const ev = { dobbel: true, hansker: true, stot: true, krok: true, liv: true, liv2: true, tester: true, sliper: true, liv4: true };
  await page.evaluate(([k, ev]) => localStorage.setItem(k, JSON.stringify({ v: 3, ev, cp: 1, cpLit: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], orb: [], boss: true, boss2: true, boss3: true, helt: true, ferdig: true, tid: 900 })), [KEY, ev]);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  sjekk('maks liv teller med livsgnist 4', await page.evaluate(() => __gnist.P.max === 7), await page.evaluate(() => __gnist.P.max));
  sjekk('luka i kjellergulvet er åpen', await page.evaluate(() => __gnist.tile(42, 32) === 0 && __gnist.tile(43, 32) === 0));
  await pos(page, 42, 31); await vent(page, 1500);
  { const t = await tilstand(page); sjekk('faller ned i inntaket', t.y > 44 && t.y <= 45.1 && __gnist_omr(await page.evaluate(() => __gnist.S.omr)) === 'Inntaket', t); }
  // pipa er for høy uten klatrejern
  await pos(page, 49, 44); await vent(page, 300);
  await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space'); await vent(page, 80);
  await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space'); await page.keyboard.press('ShiftLeft'); await vent(page, 300);
  const minY = await page.evaluate(() => __gnist.P.y / 32); await page.keyboard.up('ArrowRight'); await vent(page, 800);
  sjekk('pipa kan ikke klatres uten klatrejern', minY > 37, minY);
  // klatrejernet i verktøyrommet
  await pos(page, 5, 44); await vent(page, 600); sjekk('klatrejern plukket opp', (await tilstand(page)).ev.klatre); await lukkKort(page);
  // skli og hopp fra veggen
  await page.evaluate(() => { const P = __gnist.P; P.x = 50 * 32 - P.w - .5; P.y = 38 * 32; P.vx = 0; P.vy = 300; TS.right = true; oppdaterTaster(); }); await vent(page, 300);
  const gl = await page.evaluate(() => ({ vegg: __gnist.P.vegg, vy: __gnist.P.vy }));
  sjekk('sklir langsomt nedover veggen', gl.vegg === 1 && gl.vy <= 161, gl);
  await page.evaluate(() => { __gnist.I.jumpP = true; TS.jump = true; oppdaterTaster(); }); await vent(page, 50);
  const vh = await page.evaluate(() => ({ vx: __gnist.P.vx, vy: __gnist.P.vy })); await page.evaluate(() => { TS.right = TS.jump = false; oppdaterTaster(); });
  sjekk('veggsprett skyver ut fra veggen og opp', vh.vx < -50 && vh.vy < -300, vh);
  // tilgivende timing: hoppet virker et lite øyeblikk etter at montøren har sluppet veggen
  await page.evaluate(() => { const P = __gnist.P; P.x = 50 * 32 - P.w - .5; P.y = 38 * 32; P.vx = 0; P.vy = 300; TS.right = true; oppdaterTaster(); }); await vent(page, 250);
  await page.evaluate(() => { const P = __gnist.P; TS.right = false; oppdaterTaster(); P.x -= 12; }); await vent(page, 40);
  await page.evaluate(() => { __gnist.I.jumpP = true; TS.jump = true; oppdaterTaster(); }); await vent(page, 50);
  const ko = await page.evaluate(() => ({ vx: __gnist.P.vx, vy: __gnist.P.vy })); await page.evaluate(() => { TS.jump = false; oppdaterTaster(); });
  sjekk('veggsprett rett etter at veggen er sluppet', ko.vx < -150 && ko.vy < -300, ko);
  // klatre opp pipa med veggsprett (styrt av en enkel «spiller» i siden)
  await pos(page, 49, 44); await vent(page, 300);
  await page.evaluate(() => { let side = 1, t = 0; TS.right = true; __gnist.I.jumpP = true; oppdaterTaster();
    window.__bot = setInterval(() => { const P = __gnist.P, I = __gnist.I, n = performance.now();
      TS.jump = true; if (P.onGround && n - t > 200) { I.jumpP = true; t = n; } if (P.vegg) { side = P.vegg; TS.left = TS.right = false; I.jumpP = true; t = n; }
      else if (n - t > 120) { TS.right = side > 0; TS.left = side < 0; }
      oppdaterTaster(); }, 16); });
  const oppe = await page.waitForFunction(() => __gnist.P.y / 32 < 35.2 && __gnist.P.x / 32 > 47, null, { timeout: 8000 }).then(() => true, () => false);
  await page.evaluate(() => { clearInterval(window.__bot); TS.left = TS.right = TS.jump = false; oppdaterTaster(); });
  sjekk('klatrer opp pipa med veggsprett', oppe, await page.evaluate(() => ({ x: __gnist.P.x / 32, y: __gnist.P.y / 32 })));
  await pos(page, 57, 35); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 500); await page.keyboard.up('ArrowRight'); await page.keyboard.down('ArrowDown');
  // fagkortet i fallrøret tas i fallet
  await page.waitForFunction(() => __gnist.S.mode === 'evne', null, { timeout: 3000 }).catch(() => {}); await page.keyboard.up('ArrowDown'); await lukkKort(page); await page.keyboard.down('ArrowDown');
  await page.waitForFunction(() => __gnist.P.onGround && __gnist.P.y / 32 > 59, null, { timeout: 5000 }).catch(() => {});
  await page.keyboard.up('ArrowDown'); sjekk('ned fallrøret med fagkort', (await tilstand(page)).y > 60.9 && (await page.evaluate(() => __gnist.S.fag.has(13))), await tilstand(page));
  await vent(page, 300); sjekk('sjekkpunkt i fallrøret', (await tilstand(page)).cp === 11, await tilstand(page));
  // snarvei til pumpehallen: bare fra vest
  let snarvei = false;
  for (let i = 0; i < 3 && !snarvei; i++) { await pos(page, 66, 54); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 60); await page.keyboard.press('ShiftLeft'); await vent(page, 500); await page.keyboard.up('ArrowRight');
    snarvei = await page.evaluate(() => __gnist.S.knust.has(3)); }
  sjekk('snarvei til pumpehallen åpnes', snarvei);
  // Generatoren
  await page.evaluate(() => { __gnist.P.inv = 9999; }); await pos(page, 44, 60); await vent(page, 500);
  sjekk('Generatoren våkner', await page.evaluate(() => __gnist.B4.aktiv));
  sjekk('døra til turbinhallen stenges', await page.evaluate(() => __gnist.tile(53, 58) === 5));
  sjekk('kamp mot Generatoren', await page.waitForFunction(() => __gnist.B4.fase === 'kamp', null, { timeout: 8000 }).then(() => true, () => false));
  sjekk('bossnavn i HUD', (await page.textContent('#bossNavn')) === 'Generatoren');
  const brukt = new Set(); let golv4 = false; const tB = Date.now();
  while (Date.now() - tB < 60000) {
    const s = await page.evaluate(() => ({ fase: __gnist.B4.fase, b: __gnist.B4.borste, golv: __gnist.B4.golv, hp: __gnist.B4.hp }));
    if (s.fase !== 'kamp') break; if (s.golv) golv4 = true;
    if (s.b >= 0) { brukt.add(s.b); const hp0 = s.hp;
      await page.evaluate(i => { const [x, y, r] = __gnist.BORSTER[i], P = __gnist.P; P.x = (x + r * 3) * 32 - P.w / 2; P.y = (y + .5) * 32 - P.h / 2; P.vx = 0; P.vy = 0; P.face = -r; P.dashCd = 0; P.canDash = true; }, s.b);
      await page.keyboard.press('ShiftLeft'); await vent(page, 300);
      if ((await page.evaluate(() => __gnist.B4.hp)) === hp0) await vent(page, 200);
      continue; }
    await vent(page, 60);
  }
  sjekk('høye og lave kullbørster', [...brukt].some(i => i >= 2) && [...brukt].some(i => i < 2), [...brukt]);
  sjekk('Generatoren stanset, døra åpen', await page.waitForFunction(() => __gnist.S.boss4 && __gnist.tile(53, 58) === 0, null, { timeout: 8000 }).then(() => true, () => false));
  const max0 = await page.evaluate(() => __gnist.P.max); await page.evaluate(() => { __gnist.P.inv = 0; }); await pos(page, 36, 60); await vent(page, 600);
  sjekk('livsgnist 5 etter bossen', await page.evaluate(m => __gnist.S.ev.liv5 && __gnist.P.max === m + 1, max0));
  let gjemt = false;
  for (let i = 0; i < 3 && !gjemt; i++) { await pos(page, 22, 60); await vent(page, 300); await page.keyboard.down('ArrowLeft'); await vent(page, 60); await page.keyboard.press('ShiftLeft'); await vent(page, 500); await page.keyboard.up('ArrowLeft');
    gjemt = await page.evaluate(() => __gnist.S.knust.has(4)); }
  sjekk('gjemt rom bak turbinhallen', gjemt);
  sjekk('lagring husker område 4', await page.evaluate(() => { const l = hentLagret(); return l.boss4 && l.ev.klatre && l.ev.liv5 && l.knust.includes(3); }));
  sjekk('ingen JS-feil (område 4)', errs.length === 0, errs);
  await ctx.close();
}
const __gnist_omr = s => s;
async function fase7(b) {
  console.log('Lynpisk, bossarena og hjelpetekst');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 3, ev: { dobbel: true, hansker: true, stot: true, krok: true, liv2: true, tester: true, sliper: true }, cp: 8, cpLit: [0, 1, 2, 3, 4, 5, 6, 7, 8], orb: [], knust: [1], boss: true, boss2: true, ferdig: true, tid: 600 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  // lynpisken med F
  await page.evaluate(() => { const g = __gnist, e = g.fiender.find(f => f.type === 'lus' && f.liv); g.fiender.length = 0; g.fiender.push(e); e.x0 = 0; e.x1 = 1e6; });
  await page.evaluate(() => { const g = __gnist, e = g.fiender[0], P = g.P; P.x = e.x - 70; P.y = e.y + e.h - P.h; P.vx = P.vy = 0; P.face = 1; e.dir = 1; P.inv = 999; }); await vent(page, 60);
  await page.keyboard.press('KeyF'); await vent(page, 250);
  sjekk('lynpisken slår gnistlusa', await page.evaluate(() => !__gnist.fiender[0].liv));
  // gnister i lufta slås bort
  await page.evaluate(() => { const g = __gnist, P = g.P; g.bolter.push({ x: P.x + P.w / 2 + 50, y: P.y + P.h / 2, vx: -50, liv: 5 }); P.piskCd = 0; }); await page.keyboard.press('KeyF'); await vent(page, 150);
  sjekk('lynpisken slår bort gnister', await page.evaluate(() => __gnist.bolter.length === 0));
  // ut av gården midt i sluttbossen: kampen startes på nytt i stedet for å låse spillet
  await page.evaluate(() => { __gnist.P.inv = 9999; }); await pos(page, 152, 26); await vent(page, 500);
  await page.waitForFunction(() => __gnist.B3.fase === 'kamp', null, { timeout: 8000 }).catch(() => {});
  await pos(page, 126, 30); await vent(page, 400);
  sjekk('ut av arenaen nullstiller sluttbossen', await page.evaluate(() => !__gnist.B3.aktiv && __gnist.tile(161, 22) !== 5));
  await pos(page, 152, 26); await vent(page, 300);
  sjekk('sluttbossen kan startes igjen', await page.evaluate(() => __gnist.B3.aktiv));
  await page.waitForFunction(() => __gnist.B3.fase === 'kamp', null, { timeout: 8000 }).catch(() => {});
  let knust = false; for (let i = 0; i < 2; i++) { await pos(page, 158, 26); await vent(page, 200); await page.keyboard.down('ArrowRight'); await page.keyboard.press('ShiftLeft'); await vent(page, 400); await page.keyboard.up('ArrowRight'); knust = knust || await page.evaluate(() => __gnist.S.knust.has(0)); }
  sjekk('svak mur kan ikke skjæres opp under bosskamp', !knust);
  // hjelpetekst av/på
  await page.keyboard.press('Escape'); await vent(page, 300); await page.click('#bTips'); await vent(page, 100);
  sjekk('hjelpetekst kan slås av', await page.evaluate(k => JSON.parse(localStorage.getItem(k + '-innst')).tips === false && document.querySelector('#bTips').textContent.includes('av'), KEY));
  await page.keyboard.press('Escape'); await vent(page, 200);
  await page.evaluate(() => { document.querySelector('#hint').classList.remove('vis'); hint('testtips', 'Test'); });
  sjekk('ingen hjelpetekst når den er av', await page.evaluate(() => !document.querySelector('#hint').classList.contains('vis')));
  sjekk('ingen JS-feil (pisk)', errs.length === 0, errs);
  await ctx.close();
}

// fase 2 i Gnist 2.0: Høyspentlinja
// kjører montøren i fast tidssteg inne i siden, så rutene kan sjekkes uten at timingen i nettleseren spiller inn
const SIM = `window.__sim = (steg, pol) => { const h = 1 / 120; for (let i = 0; i < steg; i++) { pol(i); oppdaterTaster(); velgKrok(); const hp = P.hp; oppdaterSpiller(h);
  if (P.hp < hp) return { fall: true, x: P.x / 32, y: (P.y + P.h) / 32 }; } return { x: P.x / 32, y: (P.y + P.h) / 32, bakke: P.onGround }; };
window.__sett = (x, y) => { P.x = x * 32 + 7; P.y = (y + 1) * 32 - P.h; P.vx = P.vy = 0; P.onGround = true; P.krok = null; P.inv = 0; P.air = 1; P.canDash = true; S.dod = 0; TS.left = TS.right = TS.jump = TS.krok = false; };`;
async function linja(b) {
  console.log('Fase 2: Høyspentlinja');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  const ev = { dobbel: true, hansker: true, stot: true, krok: true, liv: true, liv2: true, tester: true, sliper: true, liv4: true, klatre: true, liv5: true };
  const lagring = boss4 => ({ v: 4, ev, cp: 11, cpLit: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], orb: [], boss: true, boss2: true, boss3: true, boss4, helt: true, ferdig: true, tid: 900 });
  await page.evaluate(([k, l]) => localStorage.setItem(k, JSON.stringify(l)), [KEY, lagring(false)]);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  await page.evaluate(SIM);
  // porten er låst før Generatoren er stanset
  await pos(page, 64, 60); await page.keyboard.down('ArrowRight'); await vent(page, 700); await page.keyboard.up('ArrowRight'); await vent(page, 300);
  sjekk('porten til linja er låst før Generatoren', await page.evaluate(() => !S.overgang && P.y < 72 * 32 && P.x / 32 < 66), await tilstand(page));
  // med Generatoren slått åpnes porten, og montøren havner i den nye sonen
  await page.evaluate(([k, l]) => localStorage.setItem(k, JSON.stringify(l)), [KEY, lagring(true)]);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600); await page.evaluate(SIM);
  await pos(page, 64, 60); await page.keyboard.down('ArrowRight'); await vent(page, 600); await page.keyboard.up('ArrowRight'); await vent(page, 1100);
  { const s = await page.evaluate(() => ({ sone: spillerSone(), x: P.x / 32, omr: S.omr, cam: cam.y / 32, st: ST.navn })); sjekk('porten tar montøren til Høyspentlinja', s.sone === 1 && s.x < 8 && s.omr === 'Fjellfoten', s);
    sjekk('kameraet holder seg i sonen', s.cam >= 72, s); sjekk('fjellet har sin egen stemning', s.st === 'linja', s); }
  // Gamle Ivar: snakk, og få oppdraget
  await pos(page, 11, 104); await vent(page, 300);
  sjekk('snakkeknappen vises ved Ivar', await page.evaluate(() => !document.querySelector('#verkKnapp').classList.contains('skjult') && document.querySelector('#verkKnapp').textContent.includes('Ivar')));
  await page.keyboard.press('ArrowDown'); await vent(page, 350);
  sjekk('samtalen åpnes', await page.evaluate(() => S.mode === 'dialog' && document.querySelector('#dialog').classList.contains('vis') && document.querySelector('#dlgNavn').textContent === 'Gamle Ivar'));
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Enter'); await vent(page, 320); }
  sjekk('samtalen lukkes og oppdraget er gitt', await page.evaluate(() => S.mode === 'spill' && S.oppdrag.jord === 1 && !document.querySelector('#dialog').classList.contains('vis')), await page.evaluate(() => [S.mode, S.oppdrag]));
  // juvet: kroker i linja tar montøren over
  { const r = await page.evaluate(() => { S.mode = 'pause'; fiender.length = 0; __sett(61, 99); let sist = null;
      const r = __sim(2400, i => { TS.right = true; if (i === 0) { I.jumpP = true; TS.jump = true; } if (i === 20) TS.jump = false;
        if (P.krok) TS.krok = !(P.x + P.w / 2 > P.krok.x + 30 && P.vy < 0); else TS.krok = !!S.krokMaal && !P.onGround; if (P.x / 32 > 98 && P.onGround) { TS.right = false; TS.krok = false; } });
      TS.right = TS.krok = false; return r; });
    sjekk('kan svinge seg over juvet i kroker', !r.fall && r.x > 97 && r.bakke, r); }
  { const r = await page.evaluate(() => { __sett(61, 99); const r = __sim(600, i => { TS.right = true; TS.jump = true; if (i === 0) I.jumpP = true; if (i === 40) I.jumpP = true; }); TS.right = TS.jump = false; return r; });
    sjekk('juvet er for bredt uten kroker', !!r.fall, r); }
  // glideskjermen på toppen av den høye masta
  { const r = await page.evaluate(() => { __sett(113, 99); return __sim(1500, i => { TS.jump = true; if (P.onGround && i % 40 === 0) I.jumpP = true; if (!P.onGround && P.vy > 0 && P.air > 0) I.jumpP = true; }); });
    sjekk('kan klatre opp masta på armene', r.y < 85, r); }
  await page.evaluate(() => { S.mode = 'spill'; TS.jump = false; oppdaterTaster(); }); await pos(page, 113, 83); await lukkKort(page);
  sjekk('glideskjermen plukkes opp', await page.evaluate(() => S.ev.glid && !!document.querySelector('#ev-glid')));
  // Vindskaret: for bredt uten glideskjerm, mulig med
  { const r = await page.evaluate(() => { S.mode = 'pause'; fiender.length = 0; VIND.styrke = 0; S.ev.glid = false; __sett(131, 99); let f = 0;
      const r = __sim(900, i => { TS.right = true; TS.jump = true; if (i === 0) I.jumpP = true; if (f === 0 && P.vy > 0 && i > 5) { I.jumpP = true; f = 1; } }); S.ev.glid = true; return r; });
    sjekk('Vindskaret kan ikke krysses uten glideskjerm', !!r.fall, r); }
  { const r = await page.evaluate(() => { __sett(131, 99); let f = 0;
      const r = __sim(900, i => { TS.right = true; TS.jump = true; if (i === 0) I.jumpP = true; if (f === 0 && P.vy > 0 && i > 5) { I.jumpP = true; f = 1; } if (P.x / 32 > 147.5 && P.onGround) TS.right = false; }); TS.right = TS.jump = false; return r; });
    sjekk('seiler over Vindskaret med glideskjermen', !r.fall && r.x > 147, r); }
  { const g = await page.evaluate(() => { __sett(137, 85); P.onGround = false; P.vy = 400; TS.jump = true; __sim(60, () => {}); const fall = P.vy; __sett(142, 100); P.onGround = false; P.vy = 100; TS.jump = true; __sim(60, () => {}); const opp = P.vy; TS.jump = false; return { fall, opp }; });
    sjekk('glideskjermen bremser fallet', g.fall <= 96, g); sjekk('oppvinden løfter skjermen', g.opp < -100, g); }
  // vindkast skyver
  { const v = await page.evaluate(() => { __sett(70, 99); P.onGround = false; VIND.styrke = 1; __sim(30, () => {}); const vx = P.vx; VIND.styrke = 0; return vx; });
    sjekk('vindkastet skyver montøren', v > 100, v); }
  // jordingsstanga i Vindskaret, og belønningen fra Ivar
  await page.evaluate(() => { S.mode = 'spill'; TS.left = TS.right = TS.jump = TS.krok = false; oppdaterTaster(); }); await pos(page, 163, 109); await vent(page, 300);
  sjekk('jordingsstanga plukkes opp', await page.evaluate(() => S.oppdrag.jord === 2));
  sjekk('målet peker tilbake til Ivar', await page.evaluate(() => { const b = S.boss5, l = S.ev.liv6, b6 = S.boss6, l7 = S.ev.liv7; S.boss5 = S.ev.liv6 = S.boss6 = S.ev.liv7 = true; const m = maalTekst(); S.boss5 = b; S.ev.liv6 = l; S.boss6 = b6; S.ev.liv7 = l7; return m.includes('Ivar'); }));
  await pos(page, 11, 104); await vent(page, 300); await page.keyboard.press('ArrowDown'); await vent(page, 350);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Space'); await vent(page, 320); }
  sjekk('Ivar gir lengre lynpisk', await page.evaluate(() => S.oppdrag.jord === 3 && S.kjop.pisk2 && PISK_LENGDE === 120), await page.evaluate(() => [S.oppdrag, PISK_LENGDE]));
  // nye fiender
  { const r = await page.evaluate(() => { S.mode = 'pause'; lagFiender(); const typer = new Set(fiender.map(e => e.type)); fiender.length = 0;
      const sk = nyFiende2({ type: 'skjold', x0: 30, x1: 45, y: 99 }); fiender.push(sk); sk.x = 40 * 32; sk.dir = -1; P.x = sk.x - 60; P.y = sk.y + sk.h - P.h; P.face = 1; P.piskT = .2; P.piskTraff = false; P.vx = P.vy = 0; P.inv = 99;
      oppdaterVerden(1 / 60); const forfra = sk.liv; sk.dir = 1; P.piskT = .2; P.piskTraff = false; oppdaterVerden(1 / 60); const bakfra = sk.liv;
      fiender.length = 0; const sy = nyFiende2({ type: 'skytter', x: 40, y: 99 }); fiender.push(sy); P.x = 46 * 32; P.y = 96 * 32; bolter.length = 0; for (let i = 0; i < 200; i++) oppdaterVerden(1 / 60);
      const skudd = bolter.length > 0 && bolter.some(q => q.vy && q.vx > 0);
      fiender.length = 0; const j = nyFiende2({ type: 'jager', x: 40, y: 95 }); fiender.push(j); P.x = 45 * 32; P.y = 95 * 32; const d0 = Math.hypot(j.x - P.x, j.y - P.y); for (let i = 0; i < 60; i++) oppdaterVerden(1 / 60);
      const d1 = Math.hypot(j.x - P.x, j.y - P.y); fiender.length = 0; bolter.length = 0; S.mode = 'spill'; return { typer: [...typer], forfra, bakfra, skudd, d0, d1 }; });
    sjekk('linja har de nye fiendetypene', ['jager', 'skytter', 'skjold'].every(t => r.typer.includes(t)), r.typer);
    sjekk('skjoldet tar slaget forfra', r.forfra === true, r); sjekk('skjoldfienden kan slås bakfra', r.bakfra === false, r);
    sjekk('skytteren sikter og skyter', r.skudd, r); sjekk('jageren jager montøren', r.d1 < r.d0 - 40, r); }
  // Lynfuglen
  await page.evaluate(() => { P.inv = 0; P.hp = P.max; }); await pos(page, 180, 99); await vent(page, 500);
  sjekk('Lynfuglen våkner og arenaen stenges', await page.evaluate(() => B5.aktiv && tile(171, 99) === 5 && tile(197, 99) === 5));
  sjekk('hurtigreise er stengt under bosskamp', await page.evaluate(() => !reiseTil(0)));
  await page.waitForFunction(() => B5.fase === 'kamp', null, { timeout: 5000 }).catch(() => {});
  sjekk('bosslinja viser Lynfuglen', await page.evaluate(() => document.querySelector('#boss').classList.contains('vis') && document.querySelector('#bossNavn').textContent === 'Lynfuglen' && document.querySelectorAll('#bossSik i').length === 4));
  // dør montøren, nullstilles kampen og dørene åpnes
  await page.evaluate(() => { P.inv = 0; P.hp = 1; skade(P.x + 50, false); }); await vent(page, 1800);
  sjekk('døden nullstiller Lynfuglen og åpner arenaen', await page.evaluate(() => !B5.aktiv && tile(171, 99) === 0 && tile(197, 99) === 0 && S.mode === 'spill'), await page.evaluate(() => [B5.aktiv, B5.fase, tile(171, 99)]));
  await pos(page, 180, 99); await vent(page, 300); await page.waitForFunction(() => B5.fase === 'kamp', null, { timeout: 5000 }).catch(() => {});
  // den kan bare skades når den ligger ør på bakken; slå den fire ganger
  const f0 = await page.evaluate(() => { P.inv = 999; B5.tilstand = 'sirkel'; B5.tT = 9; const hp = B5.hp; B5.x = P.x + 40; B5.y = P.y; P.face = 1; P.piskT = .2; oppdaterVerden(1 / 60); return hp - B5.hp; });
  sjekk('Lynfuglen tåler pisken i lufta', f0 === 0, f0);
  for (let i = 0; i < 4; i++) { await page.evaluate(() => { B5.tilstand = 'bakke'; B5.tT = 2; B5.x = P.x + P.w / 2 + 40; B5.y = 100 * 32 - 18; P.face = 1; P.piskT = .2; P.piskCd = 0; }); await vent(page, 120); }
  await page.waitForFunction(() => __gnist.S.boss5, null, { timeout: 6000 }).catch(() => {});
  sjekk('Lynfuglen er slått', await page.evaluate(() => S.boss5 && !B5.aktiv && tile(171, 99) === 0), await page.evaluate(() => [B5.hp, B5.fase, S.boss5]));
  await page.evaluate(() => { P.inv = 0; }); await pos(page, 184, 99); await vent(page, 400);
  sjekk('livsgnist 6 etter Lynfuglen', await page.evaluate(() => S.ev.liv6 && P.max === maksLiv()));
  // stup og lyn gjør vondt, men varsles først
  { const r = await page.evaluate(() => { const l = { x: P.x + P.w / 2, varsel: .95, aktiv: 0, seed: 1 }; B5.lyn.push(l); B5.aktiv = true; B5.fase = 'kamp'; B5.tilstand = 'opp'; B5.tT = 5; B5.x = 0; B5.y = 0; P.inv = 0; const hp0 = P.hp;
      oppdaterVerden(1 / 60); const forVarsel = P.hp; for (let i = 0; i < 70; i++) oppdaterVerden(1 / 60); const etter = P.hp; B5.aktiv = false; B5.lyn.length = 0; P.hp = P.max; return { hp0, forVarsel, etter }; });
    sjekk('lyn varsles før det slår ned', r.forVarsel === r.hp0 && r.etter < r.hp0, r); }
  // lagring: oppdrag, boss og belønning blir med videre
  await page.evaluate(() => lagre()); const l = await page.evaluate(() => hentLagret());
  sjekk('lagringen tar med Lynfuglen og oppdraget', l.boss5 === true && l.oppdrag.jord === 3 && l.kjop.pisk2 === true && l.ev.glid && l.ev.liv6, l && { b: l.boss5, o: l.oppdrag, k: l.kjop });
  // kartet: faner per sone og hurtigreise mellom sonene
  await page.evaluate(() => { for (const i of [12, 13, 14, 15, 16]) S.cpLit.add(i); }); await page.keyboard.press('Tab'); await vent(page, 300);
  sjekk('kartet har faner for sonene', await page.evaluate(() => document.querySelectorAll('#kartSoner button').length === 2 && kartSone === 1));
  await page.click('#kartSoner button[data-sone="0"]'); await vent(page, 200);
  sjekk('kan bytte til byen i kartet', await page.evaluate(() => kartSone === 0));
  await page.keyboard.press('Tab'); await vent(page, 200);
  sjekk('hurtigreise fra fjellet til byen', await page.evaluate(() => reiseTil(4) && spillerSone() === 0 && cam.y / 32 < 72));
  sjekk('hurtigreise fra byen til fjellet', await page.evaluate(() => reiseTil(14) && spillerSone() === 1 && cam.y / 32 >= 72 && S.verkNaer === -1 || spillerSone() === 1));
  // tilbake gjennom porten
  await pos(page, 5, 104); await page.keyboard.down('ArrowLeft'); await vent(page, 500); await page.keyboard.up('ArrowLeft'); await vent(page, 1100);
  sjekk('porten tilbake til byen', await page.evaluate(() => spillerSone() === 0 && Math.abs(P.x / 32 - 65) < 2.5), await tilstand(page));
  sjekk('ingen JS-feil (linja)', errs.length === 0, errs);
  await ctx.close();
}

async function dam(b) {
  console.log('Fase 3: Vannkraftdammen');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  const ev = { dobbel: true, hansker: true, stot: true, krok: true, liv: true, liv2: true, tester: true, sliper: true, liv4: true, klatre: true, liv5: true, glid: true, liv6: true };
  const lagring = { v: 4, ev, cp: 16, cpLit: [...Array(17).keys()], orb: [], boss: true, boss2: true, boss3: true, boss4: true, boss5: true, oppdrag: { jord: 3 }, helt: true, ferdig: true, tid: 1200 };
  await page.evaluate(([k, l]) => localStorage.setItem(k, JSON.stringify(l)), [KEY, lagring]);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600); await page.evaluate(SIM);
  // porten fra Toppmasta tar montøren til dammen
  await pos(page, 196, 99); await page.keyboard.down('ArrowRight'); await vent(page, 600); await page.keyboard.up('ArrowRight'); await vent(page, 1100);
  { const s = await page.evaluate(() => ({ sone: spillerSone(), x: P.x / 32, omr: S.omr, cam: cam.y / 32, st: ST.navn })); sjekk('porten tar montøren til Vannkraftdammen', s.sone === 2 && s.x < 8 && s.omr === 'Damfoten', s);
    sjekk('kameraet holder seg i damsonen', s.cam >= 118, s); sjekk('dammen har sin egen stemning', s.st === 'dam', s); }
  // Damvokter Sigrid gir oppdraget
  await pos(page, 17, 149); await vent(page, 300);
  sjekk('snakkeknappen vises ved Sigrid', await page.evaluate(() => document.querySelector('#verkKnapp').textContent.includes('Sigrid')));
  await page.keyboard.press('ArrowDown'); await vent(page, 350); for (let i = 0; i < 3; i++) { await page.keyboard.press('Enter'); await vent(page, 320); }
  sjekk('Sigrid gir oppdraget med måleren', await page.evaluate(() => S.mode === 'spill' && S.oppdrag.maaler === 1), await page.evaluate(() => [S.mode, S.oppdrag]));
  // basseng 1: veggene er glatte, vannet løfter montøren opp
  sjekk('veggene ved bassengene er glatte', await page.evaluate(() => glattVegg(45, 150) && glattVegg(29, 150) && !glattVegg(45, 130)));
  { const r = await page.evaluate(() => { S.mode = 'pause'; fiender.length = 0; __sett(40, 156); S.t = 0; const r = __sim(900, i => { TS.right = true; TS.jump = true; if (i % 30 === 0) I.jumpP = true; }); TS.right = TS.jump = false; return r; });
    sjekk('kommer ikke opp av basseng 1 når vannet er lavt', !r.fall && r.x < 45, r); }
  { const r = await page.evaluate(() => { __sett(40, 156); S.t = 0; let opp = 0; const r = __sim(120 * 14, i => { S.t += 1 / 120; if (P.x / 32 > 47 && P.onGround) opp = 1; if (opp) { TS.right = TS.jump = false; return; } if (S.t > 6) { TS.right = true; TS.jump = true; if (i % 30 === 0) I.jumpP = true; }}); TS.right = TS.jump = false; return r; });
    sjekk('vannet løfter montøren opp på hylla', !r.fall && r.x > 46 && r.y < 139.2 && r.bakke, r); }
  // basseng 2 i galleriet: følg rytmen over
  { const r = await page.evaluate(() => { __sett(67, 138); S.t = 0; const r = __sim(120 * 25, i => { S.t += 1 / 120; TS.right = true; TS.jump = true; if (P.iVann && i % 30 === 0) I.jumpP = true; if (P.x / 32 > 93 && P.onGround) TS.right = TS.jump = false; }); TS.right = TS.jump = false; return r; });
    sjekk('kommer over basseng 2 i rytme med vannet', !r.fall && r.x > 92 && r.y < 139.2, r); }
  // jordspydet i verktøylageret
  await page.evaluate(() => { S.mode = 'spill'; S.t = 0; oppdaterTaster(); }); await pos(page, 104, 138); await lukkKort(page);
  sjekk('jordspydet plukkes opp', await page.evaluate(() => S.ev.jord && !!document.querySelector('#ev-jord')));
  // basseng 3 står under spenning til det er jordet
  const stot = () => page.evaluate(() => { P.x = 120 * 32; P.y = 146 * 32; P.iVann = true; P.inv = 0; P.safeX = 111 * 32; P.safeY = 137 * 32; const hp = P.hp; for (const f of OPPDATER) f(1 / 60); const r = { skadet: P.hp < hp, x: P.x / 32 }; P.hp = P.max; P.inv = 0; P.iVann = false; return r; });
  { const r = await stot(); sjekk('vannet i basseng 3 slår før det er jordet', r.skadet && r.x < 112, r); }
  await pos(page, 112, 138); await vent(page, 300);
  sjekk('jordingspunktet kan brukes', await page.evaluate(() => document.querySelector('#verkKnapp').textContent.includes('jordingspunkt')));
  await page.keyboard.press('ArrowDown'); await vent(page, 350); for (let i = 0; i < 2; i++) { await page.keyboard.press('Enter'); await vent(page, 320); }
  sjekk('jordspydet jorder bassenget', await page.evaluate(() => S.oppdrag.jordet === 1 && S.mode === 'spill'), await page.evaluate(() => [S.mode, S.oppdrag]));
  { const r = await stot(); sjekk('jordet vann er trygt å svømme i', !r.skadet, r); }
  await pos(page, 124, 156); await vent(page, 300);
  sjekk('måleren hentes fra bunnen', await page.evaluate(() => S.oppdrag.maaler === 2));
  sjekk('målet peker tilbake til Sigrid', await page.evaluate(() => { const b = S.boss6, l = S.ev.liv7; S.boss6 = S.ev.liv7 = true; const m = maalTekst(); S.boss6 = b; S.ev.liv7 = l; return m.includes('Sigrid'); }));
  const brukt0 = await page.evaluate(() => S.brukt);
  await pos(page, 17, 149); await vent(page, 300); await page.keyboard.press('ArrowDown'); await vent(page, 350);
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Space'); await vent(page, 320); }
  sjekk('Sigrid gir ti lysorber', await page.evaluate(b0 => S.oppdrag.maaler === 3 && S.brukt === b0 - 10, brukt0), await page.evaluate(() => [S.oppdrag, S.brukt]));
  // Spenningsålen
  await page.evaluate(() => { P.inv = 0; P.hp = P.max; }); await pos(page, 170, 156); await vent(page, 400);
  sjekk('Spenningsålen våkner i magasinet', await page.evaluate(() => B6.aktiv));
  sjekk('hurtigreise er stengt under bosskamp', await page.evaluate(() => !reiseTil(0)));
  await pos(page, 154, 138); await vent(page, 300);
  sjekk('ut av magasinet nullstiller kampen', await page.evaluate(() => !B6.aktiv && B6.hp === 3 && S.mode === 'spill'));
  await pos(page, 170, 156); await vent(page, 300); await page.waitForFunction(() => B6.fase === 'kamp', null, { timeout: 5000 }).catch(() => {});
  sjekk('bosslinja viser Spenningsålen', await page.evaluate(() => document.querySelector('#boss').classList.contains('vis') && document.querySelector('#bossNavn').textContent === 'Spenningsålen' && document.querySelectorAll('#bossSik i').length === 3));
  { const r = await page.evaluate(() => { S.mode = 'pause'; Object.assign(B6, { syklus: 'hoy', sT: 9, strom: 'varsel', stromT: 1.1, t: 0, x: 185 * 32, y: 150 * 32 }); P.x = 161 * 32; P.y = 150 * 32; P.iVann = true; P.inv = 0; const hp0 = P.hp;
      oppdaterBoss6(1 / 60); const forVarsel = P.hp; for (let i = 0; i < 80 && P.hp === hp0; i++) oppdaterBoss6(1 / 60); const etter = P.hp; P.hp = P.max; P.iVann = false; S.mode = 'spill'; return { hp0, forVarsel, etter, strom: B6.strom }; });
    sjekk('strømmen i vannet varsles før den slår', r.forVarsel === r.hp0 && r.etter < r.hp0, r); }
  await pos(page, 170, 156);
  const f0 = await page.evaluate(() => { P.inv = 999; Object.assign(B6, { syklus: 'hoy', sT: 9, strom: '', stromT: 9 }); const hp = B6.hp; B6.x = P.x + 40; B6.y = P.y; P.face = 1; P.piskT = .2; oppdaterBoss6(1 / 60); return hp - B6.hp; });
  sjekk('ålen tåler pisken når vannet er høyt', f0 === 0, f0);
  for (let i = 0; i < 3; i++) { await page.evaluate(() => { Object.assign(B6, { syklus: 'lav', sT: 3, strom: '' }); B6.x = P.x + P.w / 2 + 40; P.face = 1; P.piskT = .2; P.piskCd = 0; }); await vent(page, 150); }
  await page.waitForFunction(() => __gnist.S.boss6, null, { timeout: 6000 }).catch(() => {});
  sjekk('Spenningsålen er slått', await page.evaluate(() => S.boss6 && !B6.aktiv), await page.evaluate(() => [B6.hp, B6.fase, B6.syklus, S.boss6]));
  await page.evaluate(() => { P.inv = 0; }); await pos(page, 178, 156); await vent(page, 400);
  sjekk('livsgnist 7 etter Spenningsålen', await page.evaluate(() => S.ev.liv7 && P.max === maksLiv()));
  sjekk('minst 26 fagkort', await page.evaluate(() => FAG.length >= 26), await page.evaluate(() => FAG.length));
  // lagring
  await page.evaluate(() => lagre()); const l = await page.evaluate(() => hentLagret());
  sjekk('lagringen tar med dammen', l.boss6 === true && l.oppdrag.maaler === 3 && l.oppdrag.jordet === 1 && l.ev.jord && l.ev.liv7, l && { b: l.boss6, o: l.oppdrag });
  // kartet og hurtigreise
  await page.evaluate(() => { for (const i of [17, 18, 19, 20, 21]) S.cpLit.add(i); }); await page.keyboard.press('Tab'); await vent(page, 300);
  sjekk('kartet har en fane for dammen', await page.evaluate(() => document.querySelectorAll('#kartSoner button').length === kjenteSoner().length && !!document.querySelector('#kartSoner button[data-sone="2"]') && kartSone === 2));
  await page.keyboard.press('Tab'); await vent(page, 200);
  sjekk('hurtigreise fra dammen til byen', await page.evaluate(() => reiseTil(4) && spillerSone() === 0));
  sjekk('hurtigreise fra byen til dammen', await page.evaluate(() => reiseTil(19) && spillerSone() === 2 && cam.y / 32 >= 118));
  // porten tilbake til linja
  await pos(page, 5, 149); await page.keyboard.down('ArrowLeft'); await vent(page, 500); await page.keyboard.up('ArrowLeft'); await vent(page, 1100);
  sjekk('porten tilbake til linja', await page.evaluate(() => spillerSone() === 1 && Math.abs(P.x / 32 - 195) < 2.5), await tilstand(page));
  sjekk('ingen JS-feil (dammen)', errs.length === 0, errs);
  await ctx.close();
}

async function spiker(b) {
  console.log('Spikerpistolen');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 4, ev: { dobbel: true, hansker: true, stot: true, krok: true }, cp: 2, cpLit: [0, 1, 2], orb: [], boss: false, tid: 60 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  sjekk('spikerpistolen finnes i verkstedet', await page.evaluate(() => OPPGRADERINGER.some(o => o.id === 'spiker')));
  sjekk('uten spikerpistol skjer ingenting', await page.evaluate(() => { I.spikerP = true; oppdaterVerden(1 / 60); return SPIKER.length === 0; }));
  const kjopt = await page.evaluate(() => { for (let i = 0; i < 12; i++) S.orbTatt.add(i); return kjop('spiker'); });
  sjekk('kan kjøpe spikerpistolen', kjopt && await page.evaluate(() => S.kjop.spiker));
  // en fiende foran montøren dør av en spiker
  { const r = await page.evaluate(() => { fiender.length = 0; const e = { type: 'rele', x: 0, y: 0, w: 22, h: 22, dir: 1, liv: true, t: 0, lad: 0, pause: 9 }; fiender.push(e); e.x = P.x + 160; e.y = P.y + P.h - e.h; e.dir = 1; P.face = 1; P.inv = 99;
      I.spikerP = true; for (let i = 0; i < 30; i++) oppdaterVerden(1 / 60); return { dod: !e.liv }; });
    sjekk('spikeren dreper en fiende på avstand', r.dod, r); }
  { const r = await page.evaluate(() => { fiender.length = 0; const e = nyFiende2({ type: 'skjold', x0: 40, x1: 60, y: 18 }); fiender.push(e); e.x = P.x + 160; e.x0 = e.x - 300; e.x1 = e.x + 300; e.y = P.y + P.h - e.h; e.dir = -1; P.face = 1; e.snu = 0;
      I.spikerP = true; for (let i = 0; i < 30; i++) { oppdaterVerden(1 / 60); e.dir = -1; } const forfra = e.liv; e.dir = 1; e.x = P.x + 160; SPIKER.length = 0; I.spikerP = true; for (let i = 0; i < 30; i++) { oppdaterVerden(1 / 60); e.dir = 1; } return { forfra, bakfra: e.liv }; });
    sjekk('skjoldet stopper spikeren forfra', r.forfra === true, r); sjekk('skjoldfienden faller bakfra', r.bakfra === false, r); }
  sjekk('spiker kan ikke skytes uendelig fort', await page.evaluate(() => { SPIKER.length = 0; fiender.length = 0; I.spikerP = true; oppdaterVerden(1 / 60); I.spikerP = true; oppdaterVerden(1 / 60); return SPIKER.length === 1; }));
  await page.evaluate(() => { SPIKER.length = 0; for (let i = 0; i < 40; i++) oppdaterVerden(1 / 60); });
  await page.keyboard.press('KeyG'); await vent(page, 60);
  sjekk('G skyter på PC', await page.evaluate(() => SPIKER.length + FASTE_SPIKER.length > 0));
  await page.evaluate(() => lagre());
  sjekk('spikerpistolen lagres', await page.evaluate(() => hentLagret().kjop.spiker === true));
  sjekk('ingen JS-feil (spiker)', errs.length === 0, errs);
  await ctx.close();
}

async function anim(b) {
  console.log('Animasjon: poser, overganger og bildefrekvens');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 4, ev: { dobbel: true, hansker: true }, cp: 2, cpLit: [0, 1, 2], orb: [], boss: false, tid: 60 })), KEY);
  await page.reload(); await vent(page, 400); await page.click('#bFortsett'); await vent(page, 600);
  const r = await page.evaluate(() => {
    S.mode = 'pause'; const nullstill = () => { ANIM.p = null; ANIM.sist = -1; ANIM.face = 1; ANIM.landT = ANIM.flipT = ANIM.hoppT = 0; ANIM.bakke = true; ANIM.air = 1; ANIM.vy = 0; };
    const kjor = (fps, sek, f) => { const t0 = S.t; for (let i = 0; i < Math.round(sek * fps); i++) { S.t = t0 + (i + 1) / fps; f && f(i); oppdaterAnim(P); } return JSON.parse(JSON.stringify(ANIM.p)); };
    const ut = {};
    // samme bevegelse i 30 og 120 bilder i sekundet skal gi nesten samme pose
    Object.assign(P, { vx: 0, vy: 0, onGround: true, piskT: -1, inv: 0, dashT: 0, krok: null, iVann: false, vegg: 0, face: 1, air: 1 }); I.left = I.right = false;
    nullstill(); kjor(60, .5); P.vx = 255; P.anim = 0; const a = kjor(30, .3, i => { P.anim += 13.3 / 30; });
    nullstill(); P.vx = 0; kjor(60, .5); P.vx = 255; P.anim = 0; const c = kjor(120, .3, i => { P.anim += 13.3 / 120; });
    ut.fps = Math.max(...['b1', 'b2', 'a1', 'a2'].flatMap(k => [Math.abs(a[k][0] - c[k][0]), Math.abs(a[k][1] - c[k][1])]));
    // ingen brå hopp mellom stå og løp: første bilde etter start endrer posen lite
    nullstill(); P.vx = 0; kjor(60, .5); const for_ = JSON.parse(JSON.stringify(ANIM.p)); P.vx = 255; P.anim = 1.2; const etter = kjor(60, 1 / 60);
    ut.myk = Math.max(...['b1', 'b2', 'a1', 'a2'].flatMap(k => [Math.abs(for_[k][0] - etter[k][0]), Math.abs(for_[k][1] - etter[k][1])]));
    // landing gir huk: kroppen senkes litt etter et fall
    nullstill(); Object.assign(P, { onGround: false, vx: 0, vy: 700 }); kjor(60, .1); P.onGround = true; P.vy = 0; kjor(60, 3 / 60);
    const fx = document.createElement('canvas').getContext('2d'); ut.huk = (() => { const f1 = ledd(-1.5, -12.5 + ANIM.p.bob, ANIM.p.b1[0], ANIM.p.b1[1], 6.5, 6.5)[3], f2 = ledd(1.5, -12.5 + ANIM.p.bob, ANIM.p.b2[0], ANIM.p.b2[1], 6.5, 6.5)[3]; return .5 - Math.max(f1, f2); })();
    ut.land = ANIM.landT > 0;
    // dobbelthopp gir salto
    nullstill(); Object.assign(P, { onGround: false, vy: -100, air: 1 }); kjor(60, .05); P.air = 0; P.vy = -600; kjor(60, 1 / 60); ut.salto = ANIM.flipT > 0;
    // snuing klemmer figuren i stedet for å speile den på ett bilde
    nullstill(); Object.assign(P, { onGround: true, vy: 0, vx: 0, face: 1 }); kjor(60, .2); P.face = -1; kjor(60, 2 / 60); ut.snu = ANIM.face; kjor(60, .2); ut.snuFerdig = ANIM.face;
    S.mode = 'spill'; return ut; });
  sjekk('animasjonen er lik i 30 og 120 bilder per sekund', r.fps < .2, r.fps);
  sjekk('overgangen fra stå til løp er myk', r.myk < .5, r.myk);
  sjekk('landing gir en huk', r.land && r.huk > .4, r);
  sjekk('dobbelthopp gir salto', r.salto, r);
  sjekk('snuingen går over noen bilder', Math.abs(r.snu) < 1 && r.snuFerdig === -1, r);
  sjekk('ingen JS-feil (animasjon)', errs.length === 0, errs);
  await ctx.close();
}

async function touch(b, navn, opts) {
  console.log('Touch: ' + navn);
  const { ctx, page, errs } = await nySide(b, opts);
  const cdp = await ctx.newCDPSession(page);
  await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ v: 2, ev: { dobbel: true, hansker: true }, cp: 2, cpLit: [0, 1, 2], orb: [], boss: false, tid: 60 })), KEY);
  await page.reload(); await vent(page, 500); await page.tap('#bFortsett'); await vent(page, 600);
  if (await page.locator('#lagSnu').isVisible()) { sjekk('snu-telefonen vises i stående', true); await page.tap('#bSnuOk'); await vent(page, 300); }
  const boks = async s => { const r = await page.locator(s).boundingBox(); return r && { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; };
  const berør = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  const pad = await boks('#pad'), hopp = await boks('#tHopp');
  await page.evaluate(() => { __gnist.fiender.length = 0; }); await pos(page, 51, 18); await vent(page, 300);
  const x0 = (await tilstand(page)).x;
  await berør('touchStart', [{ x: pad.x + pad.w * .3, y: pad.y, id: 1 }]); await vent(page, 700); await berør('touchEnd', []);
  sjekk('pilen flytter montøren', (await tilstand(page)).x > x0 + 1);
  await pos(page, 50, 18); await vent(page, 300);
  await berør('touchStart', [{ x: hopp.x, y: hopp.y, id: 2 }]); await vent(page, 120); await berør('touchEnd', []); await vent(page, 120);
  { const t = await tilstand(page); sjekk('hoppknappen virker', t.y < 18.9, t); }
  await pos(page, 76, 18); await vent(page, 1500); await page.waitForFunction(() => __gnist.B.fase === 'kamp', null, { timeout: 8000 }).catch(() => {});
  sjekk('bosskamp på touch', (await tilstand(page)).fase === 'kamp');
  sjekk('ingen scroll', (await page.evaluate(() => scrollY)) === 0);
  { const kk = await boks('#kartKnapp'); sjekk('kartknapp innenfor skjermen', kk && kk.x + kk.w / 2 <= (opts.viewport || {}).width + 1 && kk.x > 0, kk);
    await page.tap('#kartKnapp'); await vent(page, 300); sjekk('kartknapp åpner kartet', await page.evaluate(() => __gnist.S.mode === 'kart'));
    await page.tap('#bKartLukk'); await vent(page, 300); }
  // krok-knappen: vises med kabeltrommelen og fester kabelen
  await page.evaluate(() => { const g = __gnist; g.B.aktiv = false; g.B.fase = ''; g.S.bossDone = true; g.S.laas = 0; g.S.ev.krok = true; g.fiender.length = 0; g.prosj.length = 0; g.P.inv = 999; }); await page.evaluate(() => hud());
  await pos(page, 100, 56); await vent(page, 500);
  const krokK = await boks('#tKrok'); sjekk('krok-knapp vises', !!krokK && krokK.w > 0);
  if (krokK) { await page.evaluate(() => { const P = __gnist.P; P.x = 105 * 32; P.y = 50 * 32; P.vy = -200; P.vx = 0; P.onGround = false; });
    await berør('touchStart', [{ x: krokK.x, y: krokK.y, id: 3 }]); await vent(page, 250);
    sjekk('krok-knappen fester kabelen', await page.evaluate(() => !!__gnist.P.krok), await page.evaluate(() => ({ m: __gnist.S.mode, h: __gnist.I.krokHeld, maal: __gnist.S.krokMaal, x: __gnist.P.x / 32, y: __gnist.P.y / 32, dod: __gnist.S.dod, laas: __gnist.S.laas, ts: __gnist.TS }))); await berør('touchEnd', []); }
  { const pk = await boks('#tPisk'); sjekk('pisk-knapp vises', !!pk && pk.w > 0);
    await page.evaluate(() => { const g = __gnist; g.P.piskCd = 0; }); await berør('touchStart', [{ x: pk.x, y: pk.y, id: 7 }]); await vent(page, 60); await berør('touchEnd', []);
    sjekk('pisk-knappen slår', await page.evaluate(() => __gnist.P.piskCd > 0)); }
  // tilpass knapper: flytt og forstørr Hopp, lagres og virker etterpå
  await page.evaluate(() => { __gnist.P.krok = null; __gnist.P.inv = 999; }); await pos(page, 50, 18); await vent(page, 300);
  await page.tap('#menyKnapp'); await vent(page, 300); await page.tap('#bTilpass'); await vent(page, 300);
  sjekk('tilpass-modus åpnes', await page.evaluate(() => __gnist.S.mode === 'tilpass' && document.documentElement.classList.contains('tilpasser')));
  { const h0 = await boks('#tHopp');
    await berør('touchStart', [{ x: h0.x, y: h0.y, id: 5 }]); for (let i = 1; i <= 6; i++) { await berør('touchMove', [{ x: h0.x - 20 * i, y: h0.y - 10 * i, id: 5 }]); await vent(page, 30); } await berør('touchEnd', []);
    await page.tap('#bStorre'); await page.tap('#bStorre'); await vent(page, 100);
    const h1 = await boks('#tHopp'); sjekk('knappen flyttes og blir større', h1.x < h0.x - 80 && h1.w > h0.w * 1.1, { h0, h1 });
    await page.tap('#bFerdig'); await vent(page, 300);
    const lagret = await page.evaluate(k => JSON.parse(localStorage.getItem(k + '-innst')).knapper, KEY);
    sjekk('plasseringen lagres', !!lagret && Object.values(lagret).some(o => o.tHopp && o.tHopp.s > 1), lagret);
    await page.tap('#bPauseFortsett'); await vent(page, 300);
    const h2 = await boks('#tHopp'); await pos(page, 50, 18); await vent(page, 300);
    await berør('touchStart', [{ x: h2.x, y: h2.y, id: 6 }]); await vent(page, 120); await berør('touchEnd', []); await vent(page, 120);
    { const t = await tilstand(page); sjekk('flyttet hoppknapp virker', t.y < 18.9 && Math.abs(h2.x - h1.x) < 2, t); }
    await page.reload(); await vent(page, 500);
    await page.tap('#bFortsett'); await vent(page, 500); if (await page.locator('#lagSnu').isVisible()) { await page.tap('#bSnuOk'); await vent(page, 300); }
    const h3 = await boks('#tHopp'); sjekk('plasseringen huskes etter omlasting', Math.abs(h3.x - h1.x) < 2, { h1, h3 });
    await page.tap('#menyKnapp'); await vent(page, 300); await page.tap('#bTilpass'); await vent(page, 200); await page.tap('#bTilbake'); await page.tap('#bFerdig'); await vent(page, 200);
    await page.tap('#bPauseFortsett'); await vent(page, 200);
    const h4 = await boks('#tHopp'); sjekk('tilbakestill gir standard plassering', Math.abs(h4.x - h0.x) < 2 && Math.abs(h4.w - h0.w) < 2, { h0, h4 }); }
  const sz = navn === 'liggende' ? { width: 390, height: 844 } : { width: 844, height: 390 };
  await page.setViewportSize(sz); await vent(page, 600);
  sjekk('rotasjon tilpasser lerretet', (await page.evaluate(() => document.querySelector('#c').getBoundingClientRect().width)) === sz.width);
  sjekk('ingen JS-feil (' + navn + ')', errs.length === 0, errs);
  await ctx.close();
}

// Fase 1 av Gnist 2.0: stemning, innendørs bakgrunn, detaljer, dødsanimasjon og automatisk kvalitet
async function grafikk(b) {
  console.log('Grafikk: stemning, detaljer og kvalitet');
  for (const kval of [2, 1, 0]) {
    const { ctx, page, errs } = await nySide(b, { viewport: { width: 960, height: 540 } }, '?kval=' + kval);
    await page.click('#bNy'); await page.evaluate(() => { if (S.mode === 'intro') sluttIntro(); }); await vent(page, 500);
    const steder = [[10, 23, 'ute'], [20, 31, 'kjeller'], [86, 18, 'hall'], [110, 41, 'kabel'], [74, 56, 'pumpe'], [176, 26, 'stasjon'], [35, 44, 'kraft'], [36, 60, 'turbin']];
    const sett = [];
    for (const [x, y] of steder) { await page.evaluate(([x, y]) => { const g = __gnist; g.S.bossDone = true; g.S.boss2 = true; g.S.boss3 = true; g.S.boss4 = true; g.P.inv = 99; }, [x, y]);
      await pos(page, x, y); await vent(page, 350); sett.push(await page.evaluate(() => ST.navn)); }
    if (kval === 2) {
      sjekk('stemningen følger området', JSON.stringify(sett) === JSON.stringify(steder.map(s => s[2])), sett);
      const info = await page.evaluate(() => ({ aap: AAPNINGER.length, det: [...DETALJ.values()].reduce((s, a) => s + a.length, 0), mf: ST.mf.map(v => Math.round(v)), kval: S.kval }));
      sjekk('lysåpninger og detaljer er funnet', info.aap > 3 && info.det > 30, info);
      sjekk('kvalitet fra adressen brukes', info.kval === 2, info);
      await pos(page, 20, 31); await vent(page, 300);
      const d = await page.evaluate(() => { const e = __gnist.fiender.find(e => e.liv); drepFiende(e); return { liv: e.liv, dode: DODE.length }; });
      sjekk('fiende får dødsanimasjon', !d.liv && d.dode > 0, d);
      await vent(page, 700); sjekk('dødsanimasjonen blir borte', (await page.evaluate(() => DODE.length)) === 0);
      const h = await page.evaluate(() => { const [ax, ay] = haleAnker(); return Math.hypot(HALE[0].x - ax, HALE[0].y - ay) + Math.hypot(HALE[8].x - ax, HALE[8].y - ay); });
      sjekk('skjerfet henger etter montøren', h < 60, h);
    }
    sjekk('ingen JS-feil med kvalitet ' + kval, errs.length === 0, errs);
    await ctx.close();
  }
  // automatisk kvalitet: går ned når bildet er tregt
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 800, height: 450 } });
  await page.click('#bNy'); await page.evaluate(() => { if (S.mode === 'intro') sluttIntro(); }); await vent(page, 300);
  const k = await page.evaluate(() => { S.kval = 2; MAAL.spilt = 0; for (let i = 0; i < 400; i++) maalYtelse(1 / 25); const a = S.kval; for (let i = 0; i < 400; i++) maalYtelse(1 / 60); return [a, S.kval]; });
  sjekk('kvaliteten går ned når bildet er tregt', k[0] < 2, k);
  sjekk('ingen JS-feil (automatisk kvalitet)', errs.length === 0, errs);
  await ctx.close();
}

// Ny historie: introen spilles ved nytt spill, kan hoppes over og ender i vanlig spill med utstyret
async function intro(b) {
  console.log('Intro: den døde byen og elektrikeren');
  const steg = (page, sek) => page.evaluate(sek => { let n = performance.now(); for (let x = 0; x < sek; x += 1 / 60) { n += 1000 / 60; loop(n); } }, sek);
  let { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.removeItem(k), KEY); await page.reload(); await vent(page, 400);
  sjekk('menyen forteller den nye historien', (await page.textContent('#lagMeny')).includes('hundre år'));
  await page.evaluate(() => { requestAnimationFrame = () => 0; }); await page.click('#bNy');
  let t = await page.evaluate(() => ({ mode: S.mode, drakt: ANIM.drakt, skjult: GN.skjult, vis: $('#intro').classList.contains('vis'), hud: getComputedStyle($('#hud')).visibility }));
  sjekk('nytt spill starter introen', t.mode === 'intro' && t.vis && t.hud === 'hidden', t);
  sjekk('vandreren har ikke utstyret ennå', t.drakt === 'vandrer' && t.skjult, t);
  await steg(page, 11); t = await page.evaluate(() => ({ x: P.x / 32, tekst: $('#introTekst').textContent, tatt: INTRO.tatt }));
  sjekk('vandreren går fram til elektrikeren', t.x > 6.5 && t.x < 8.5 && !t.tatt, t);
  await steg(page, 5); t = await page.evaluate(() => ({ drakt: ANIM.drakt, skjult: GN.skjult, tatt: INTRO.tatt }));
  sjekk('han tar utstyret, og gnisten våkner', t.tatt && t.drakt === 'montor' && !t.skjult, t);
  await steg(page, 10); t = await page.evaluate(() => ({ mode: S.mode, vis: $('#intro').classList.contains('vis'), hud: getComputedStyle($('#hud')).visibility }));
  sjekk('introen ender i vanlig spill', t.mode === 'spill' && !t.vis && t.hud === 'visible', t);
  sjekk('ingen JS-feil (intro)', errs.length === 0, errs); await ctx.close();
  // hoppe over med et trykk, på mobil i stående format
  ({ ctx, page, errs } = await nySide(b, devices['iPhone 13']));
  await page.evaluate(k => localStorage.removeItem(k), KEY); await page.reload(); await vent(page, 400);
  await page.tap('#bNy'); await vent(page, 900); await page.tap('#intro'); await vent(page, 200);
  t = await page.evaluate(() => ({ mode: S.mode, drakt: ANIM.drakt, tatt: INTRO.tatt, skjult: GN.skjult }));
  sjekk('et trykk hopper over introen', t.mode !== 'intro' && t.tatt && t.drakt === 'montor' && !t.skjult, t);
  // et lagret spill hopper rett inn uten intro
  await page.evaluate(() => { S.mode = 'spill'; lagre(); }); await page.reload(); await vent(page, 400);
  await page.tap('#bFortsett'); await vent(page, 300);
  t = await page.evaluate(() => S.mode); sjekk('fortsett spiller ikke introen igjen', t !== 'intro', t);
  sjekk('ingen JS-feil (intro mobil)', errs.length === 0, errs); await ctx.close();
}

// Bossene i ny drakt: alle seks tegnes i alle tilstander uten feil, og kampene virker som før
async function bosstegning(b) {
  console.log('Bossene: ny grafikk');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 960, height: 540 } });
  await page.click('#bNy'); await page.evaluate(() => { if (S.mode === 'intro') sluttIntro(); requestAnimationFrame = () => 0; });
  const r = await page.evaluate(() => {
    const steg = sek => { let n = performance.now(); for (let x = 0; x < sek; x += 1 / 60) { n += 1000 / 60; P.inv = 1e9; P.hp = P.max; loop(n); } };
    const bosser = [[B, 'startBoss', 80, 18], [B2, 'startBoss2', ARENA2.midt - 5, ARENA2.gulv - 1], [B3, 'startBoss3', GARD.midt - 7, GARD.gulv - 1],
      [B4, 'startBoss4', TURBIN.midt - 8, TURBIN.gulv - 1], [B5, 'startBoss5', ARENA5.midt - 5, ARENA5.gulv - 1], [B6, 'startBoss6', ARENA6.x0 + 6, ARENA6.gulv - 1]];
    const ut = [];
    for (const [Bx, f, x, y] of bosser) { P.x = x * T + 7; P.y = (y + 1) * T - P.h; P.vx = P.vy = 0; oppdaterKamera(0, true); window[f](); const hp0 = Bx.hp;
      steg(4); const kamp = Bx.fase === 'kamp'; Bx.varsel = .8; Bx.lad = .5; steg(.1); Bx.stun = .5; steg(.2); Bx.fase = 'dod'; Bx.dod = 1; steg(.1);
      ut.push({ f, kamp, hp: Bx.hp === hp0 }); Bx.aktiv = false; Bx.fase = ''; }
    return ut; });
  sjekk('alle bossene kommer i kamp med ny grafikk', r.every(x => x.kamp), r);
  sjekk('ingen boss mister liv av å bare bli tegnet', r.every(x => x.hp), r);
  sjekk('ingen JS-feil (bossgrafikk)', errs.length === 0, errs);
  await ctx.close();
}

// Lydbildet: vind, fottrinn etter underlag og lyden av at strømmen kommer tilbake
async function lydbilde(b) {
  console.log('Lydbildet: vind, fottrinn og strøm tilbake');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 960, height: 540 } });
  await page.click('#bNy'); await page.evaluate(() => { if (S.mode === 'intro') sluttIntro(); }); await vent(page, 600);
  const u = await page.evaluate(() => [[10, 23], [20, 31], [86, 18]].map(([x, y]) => { P.x = x * T + 7; P.y = (y + 1) * T - P.h; return underlag(); }));
  sjekk('fottrinn følger underlaget', u[0] === 'gress' && u[1] === 'betong', u);
  sjekk('vinden er i gang', await page.evaluate(() => !!LB.vind || !A.c));
  await page.evaluate(() => { for (const n of ['metallstonn', 'rele', 'stromTilbake']) lyd(n); knirk(true); fottrinn(); S.boss = true; });
  await vent(page, 3200);
  const r = await page.evaluate(() => ({ niva: LB.niva, strom: LB.stromT }));
  sjekk('strømmen-tilbake-lyden går når en boss er slått', r.niva > 0 && r.strom <= 0, r);
  sjekk('ingen JS-feil (lyd)', errs.length === 0, errs);
  await ctx.close();
}

(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  try {
    // KUN=pc,lagring,omr2,touch kjører bare noen av testene
    const kun = process.env.KUN ? process.env.KUN.split(',') : null, med = n => !kun || kun.includes(n);
    if (med('pc')) await pcRute(b);
    if (med('lagring')) await lagring(b);
    if (med('omr2')) await omraade2(b);
    if (med('fase4')) await fase4(b);
    if (med('fase5')) await fase5(b);
    if (med('hemmelig')) await hemmeligheter(b);
    if (med('fase6')) await fase6(b);
    if (med('fase7')) await fase7(b);
    if (med('grafikk')) await grafikk(b);
    if (med('linja')) await linja(b);
    if (med('dam')) await dam(b);
    if (med('spiker')) await spiker(b);
    if (med('anim')) await anim(b);
    if (med('intro')) await intro(b);
    if (med('bosser')) await bosstegning(b);
    if (med('lyd')) await lydbilde(b);
    if (med('touch')) { await touch(b, 'liggende', { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      await touch(b, 'stående', devices['iPhone 13']); }
    if (global.ekstraTester) for (const t of global.ekstraTester) await t(b, { sjekk, nySide, pos, tilstand, vent, dobbelhopp, lukkKort, KEY });
  } finally { await b.close(); }
  console.log(`\n${ok} ok, ${feil} feil`);
  process.exit(feil ? 1 : 0);
})();
