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

async function nySide(b, opts) {
  const ctx = await b.newContext(opts); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(URL); await vent(page, 400);
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
  await page.click('#bNy'); await vent(page, 700);
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
  await pos(page, 76, 18); await vent(page, 3800);
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
  const sz = navn === 'liggende' ? { width: 390, height: 844 } : { width: 844, height: 390 };
  await page.setViewportSize(sz); await vent(page, 600);
  sjekk('rotasjon tilpasser lerretet', (await page.evaluate(() => document.querySelector('#c').getBoundingClientRect().width)) === sz.width);
  sjekk('ingen JS-feil (' + navn + ')', errs.length === 0, errs);
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
    if (med('touch')) { await touch(b, 'liggende', { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      await touch(b, 'stående', devices['iPhone 13']); }
    if (global.ekstraTester) for (const t of global.ekstraTester) await t(b, { sjekk, nySide, pos, tilstand, vent, dobbelhopp, lukkKort, KEY });
  } finally { await b.close(); }
  console.log(`\n${ok} ok, ${feil} feil`);
  process.exit(feil ? 1 : 0);
})();
