'use strict';
// Gnist – flere kjøp i verkstedet. Hvert kjøp skal endre hvordan man spiller, ikke bare et tall.
OPPGRADERINGER.push(
  { id: 'sikring', navn: 'Nødsikring', tekst: 'Et treff som ville slått deg ut, løser ut sikringen i stedet, og du står igjen med ett liv. Lades ved sjekkpunkt.', pris: 20 },
  { id: 'luftstot', navn: 'Luftstøt', tekst: 'Slå ut en fiende med lynpisken i lufta, så kan du bruke strømstøtet en gang til.', pris: 16 },
  { id: 'gjenvinner', navn: 'Gjenvinner', tekst: 'Fiender du slår ut, slipper av og til en livsgnist. Oftere når du har lite liv igjen.', pris: 14 },
  { id: 'spiker2', navn: 'Gjennomslag', tekst: 'Spikeren går gjennom flere fiender, og pistolen lader raskere.', pris: 14, krever: 'spiker' },
  { id: 'magnet', navn: 'Orbmagnet', tekst: 'Lysorber i nærheten trekkes til deg.', pris: 8 },
  { id: 'soker', navn: 'Orbsøker', tekst: 'Kartet viser lysorbene du ikke har plukket i områdene du har vært.', pris: 10 },
);

// magneten trekker ikke gjennom vegger, ellers blir gjemte orber gratis
function fritSikt(x0, y0, x1, y1) { for (let k = 1; k < 8; k++) { const x = x0 + (x1 - x0) * k / 8, y = y0 + (y1 - y0) * k / 8; if (fast(Math.floor(x / T), Math.floor(y / T))) return false; } return true; }
// lysorber som trekkes inn av magneten (allerede telt, dette er bare synet av dem)
const FLYORB = [];
// livsgnister fra gjenvinneren
const LIVDROPP = [];
ETTER_DRAP.push(e => {
  if (!S.kjop.gjenvinner || P.hp >= P.max) return;
  if (Math.random() < (P.hp <= 1 ? .5 : .2)) LIVDROPP.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, vy: -220, t: 0 });
});
function oppdaterVerkstedKjop(dt) {
  if (S.mode !== 'spill') return;
  const pcx = P.x + P.w / 2, pcy = P.y + P.h / 2;
  for (let i = FLYORB.length - 1; i >= 0; i--) { const o = FLYORB[i]; o.t += dt * 4.5; const k = Math.min(1, o.t); o.x += (pcx - o.x) * k; o.y += (pcy - o.y) * k; if (o.t >= 1) FLYORB.splice(i, 1); }
  for (let i = LIVDROPP.length - 1; i >= 0; i--) { const d = LIVDROPP[i]; d.t += dt;
    // faller til den lander, svever så litt; magneten trekker den også inn
    if (!fast(Math.floor(d.x / T), Math.floor((d.y + 8) / T))) { d.vy = Math.min(d.vy + 900 * dt, 500); d.y += d.vy * dt; } else d.vy = 0;
    if (S.kjop.magnet && Math.hypot(pcx - d.x, pcy - d.y) < 2.5 * T) { d.x += (pcx - d.x) * Math.min(1, dt * 8); d.y += (pcy - d.y) * Math.min(1, dt * 8); }
    if (Math.abs(pcx - d.x) < 24 && Math.abs(pcy - d.y) < 30 && P.hp < P.max && S.dod <= 0) { P.hp++; LIVDROPP.splice(i, 1); lyd('liv'); sprut(d.x, d.y, 16, 'c', 160); hud(); pop('#liv'); continue; }
    if (d.t > 9) LIVDROPP.splice(i, 1); }
}
OPPDATER.push(oppdaterVerkstedKjop);
TEGN_GLOD.push(() => {
  for (const o of FLYORB) { glod(SPR.c, o.x, o.y, 20, .9); glod(SPR.h, o.x, o.y, 5, .9); }
  for (const d of LIVDROPP) { const a = d.t > 7 ? (Math.sin(d.t * 18) > 0 ? .9 : .3) : .9, y = d.y + (d.vy === 0 ? Math.sin(d.t * 4) * 3 : 0);
    glod(SPR.c, d.x, y, 30, a * .7); glod(SPR.h, d.x, y, 8, a); }
});
TILBAKESTILL.push(() => { FLYORB.length = 0; LIVDROPP.length = 0; });
