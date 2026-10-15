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
async function lukkKort(page) { await vent(page, 900); await page.keyboard.press('Enter'); await vent(page, 300); }

async function pcRute(b) {
  console.log('PC: hele område 1 med tastatur');
  const { ctx, page, errs } = await nySide(b, { viewport: { width: 1280, height: 720 } });
  await page.evaluate(k => localStorage.removeItem(k), KEY); await page.reload(); await vent(page, 400);
  await page.click('#bNy'); await vent(page, 700);
  await pos(page, 32, 23); await vent(page, 300); await dobbelhopp(page, 'ArrowRight', 900);
  sjekk('veggen stopper uten stigesko', (await tilstand(page)).x < 35);
  await pos(page, 41, 31); await vent(page, 300); await page.keyboard.down('ArrowRight'); await vent(page, 900); await page.keyboard.up('ArrowRight');
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
  await pos(page, 104, 18); await vent(page, 400);
  await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space'); await vent(page, 300); await page.keyboard.up('Space'); await vent(page, 150);
  await page.keyboard.down('Space'); await vent(page, 250); await page.keyboard.up('Space'); await vent(page, 100);
  await page.keyboard.press('ShiftLeft'); await vent(page, 900); await page.keyboard.up('ArrowRight');
  sjekk('over sjakten med støt', (await tilstand(page)).x > 117);
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
  const sz = navn === 'liggende' ? { width: 390, height: 844 } : { width: 844, height: 390 };
  await page.setViewportSize(sz); await vent(page, 600);
  sjekk('rotasjon tilpasser lerretet', (await page.evaluate(() => document.querySelector('#c').getBoundingClientRect().width)) === sz.width);
  sjekk('ingen JS-feil (' + navn + ')', errs.length === 0, errs);
  await ctx.close();
}

(async () => {
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  try {
    await pcRute(b);
    await lagring(b);
    await touch(b, 'liggende', { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    await touch(b, 'stående', devices['iPhone 13']);
    if (global.ekstraTester) for (const t of global.ekstraTester) await t(b, { sjekk, nySide, pos, tilstand, vent, dobbelhopp, lukkKort, KEY });
  } finally { await b.close(); }
  console.log(`\n${ok} ok, ${feil} feil`);
  process.exit(feil ? 1 : 0);
})();
