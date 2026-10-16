'use strict';
// Gnist – sprites, malte bakgrunner, terreng og skjermstørrelse.
// ---------- sprites ----------
function glodSprite(r, g, b) { const c = nyC(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(.25, `rgba(${r},${g},${b},.45)`); gr.addColorStop(.6, `rgba(${r},${g},${b},.12)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return c; }
const SPR = { c: glodSprite(110, 220, 255), w: glodSprite(255, 190, 110), h: glodSprite(255, 255, 255), o: glodSprite(255, 140, 60),
  p: glodSprite(190, 120, 255), r: glodSprite(255, 70, 70), g: glodSprite(110, 255, 160), m: glodSprite(255, 90, 200) };
const HULL = (() => { const c = nyC(128, 128), x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.45, 'rgba(0,0,0,.75)'); gr.addColorStop(.75, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return c; })();
const STRALE = (() => { const c = nyC(128, 512), x = c.getContext('2d'); let gr = x.createLinearGradient(0, 0, 128, 0);
  gr.addColorStop(0, 'rgba(180,220,255,0)'); gr.addColorStop(.5, 'rgba(180,220,255,1)'); gr.addColorStop(1, 'rgba(180,220,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 512); x.globalCompositeOperation = 'destination-in';
  gr = x.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 512); return c; })();
const KJEGLE = (() => { const c = nyC(128, 256), x = c.getContext('2d');
  let gr = x.createLinearGradient(0, 0, 128, 0); gr.addColorStop(0, 'rgba(255,236,190,0)'); gr.addColorStop(.5, 'rgba(255,236,190,1)'); gr.addColorStop(1, 'rgba(255,236,190,0)');
  x.fillStyle = gr; x.beginPath(); x.moveTo(56, 0); x.lineTo(72, 0); x.lineTo(128, 256); x.lineTo(0, 256); x.closePath(); x.fill();
  x.globalCompositeOperation = 'destination-in'; gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 256); return c; })();
const TAKE = (() => { const c = nyC(256, 96), x = c.getContext('2d'); x.translate(128, 48); x.scale(1, 96 / 256);
  const gr = x.createRadialGradient(0, 0, 0, 0, 0, 128); gr.addColorStop(0, 'rgba(150,185,215,.9)'); gr.addColorStop(.5, 'rgba(150,185,215,.35)'); gr.addColorStop(1, 'rgba(150,185,215,0)');
  x.fillStyle = gr; x.beginPath(); x.arc(0, 0, 128, 0, 7); x.fill(); return c; })();

// ---------- bakgrunn (malte parallakselag) ----------
const LW = 1600, LH = 900;
function flislag(fn, seed) { const c = nyC(LW, LH), g = c.getContext('2d');
  for (const off of [-LW, 0, LW]) { g.save(); g.translate(off, 0); fn(g, rng(seed)); g.restore(); } return c; }
function myk(g, x, y, rx, ry, farge, a) { g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, `rgba(${farge},${a})`); gr.addColorStop(1, `rgba(${farge},0)`); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore(); }
// et tre med stamme og en krone av mange klumper, med en svak kant av månelys øverst
function tre(g, q, x, y, h, kr, farge, kant) {
  g.strokeStyle = farge; g.lineWidth = Math.max(2, kr * .12); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (q() - .5) * kr * .4, y - h * .5, x + (q() - .5) * kr * .3, y - h); g.stroke();
  for (let i = 0; i < 3; i++) { g.lineWidth = Math.max(1, kr * .05); g.beginPath(); const yy = y - h * (.55 + q() * .3), s = q() < .5 ? -1 : 1; g.moveTo(x, yy); g.lineTo(x + s * kr * (.4 + q() * .3), yy - kr * .3); g.stroke(); }
  const n = 9 + (kr / 6 | 0);
  for (let i = 0; i < n; i++) { const a = q() * Math.PI, d = q() * kr * .8, bx = x + Math.cos(a) * d * 1.2 - (q() - .5) * 4, by = y - h - Math.sin(a) * d * .6 + kr * .2, br = kr * (.3 + q() * .3);
    if (kant) { g.fillStyle = kant; g.beginPath(); g.arc(bx, by - 1.5, br, 0, 7); g.fill(); } g.fillStyle = farge; g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); }
  g.lineCap = 'butt';
}
// tett kratt: en ujevn kant av løv langs bakken
function kratt(g, q, x0, x1, y, hMin, hMax, farge) { g.fillStyle = farge; for (let x = x0; x < x1; x += 6 + q() * 10) { const r0 = hMin + q() * (hMax - hMin); g.beginPath(); g.arc(x, y - r0 * .45, r0 * .6, 0, 7); g.fill(); } g.fillRect(x0, y - hMin * .3, x1 - x0, LH); }
// slyngplanter som henger ned fra en kant
function slynger(g, q, x, y, l, farge) { g.strokeStyle = farge; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + (q() - .5) * 10, y + l * .4, x + (q() - .5) * 10, y + l * .7, x + (q() - .5) * 6, y + l); g.stroke();
  g.fillStyle = farge; for (let b = 6; b < l; b += 5 + q() * 4) { g.beginPath(); g.ellipse(x + (q() - .5) * 5, y + b, 2.2, 1.2, q() * 3, 0, 7); g.fill(); } }
function lagHimmel() {
  const c = nyC(LW, LH), g = c.getContext('2d'), r = rng(7);
  // en død verden: kald, tung himmel uten bylys under skyene
  let gr = g.createLinearGradient(0, 0, 0, LH);
  gr.addColorStop(0, '#04070f'); gr.addColorStop(.35, '#0b1729'); gr.addColorStop(.62, '#18293d'); gr.addColorStop(.84, '#2a3546'); gr.addColorStop(1, '#3a3b48');
  g.fillStyle = gr; g.fillRect(0, 0, LW, LH);
  myk(g, LW * .3, LH * .98, LW * .62, LH * .38, '170,150,140', .1);
  for (let i = 0; i < 260; i++) { const x = r() * LW, y = r() * LH * .6, s = r() * 1.2 + .2, a = (.15 + r() * .6) * (1 - y / (LH * .65));
    g.fillStyle = `rgba(220,232,250,${a})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
  const mx = LW * .74, my = LH * .19;
  myk(g, mx, my, 420, 420, '170,196,235', .16); myk(g, mx, my, 140, 140, '200,218,245', .22);
  gr = g.createRadialGradient(mx - 10, my - 12, 4, mx, my, 50); gr.addColorStop(0, '#f4f7ff'); gr.addColorStop(.85, '#cfdaf0'); gr.addColorStop(1, 'rgba(207,218,240,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(mx, my, 50, 0, 7); g.fill();
  [[-14, -8, 9], [12, 6, 7], [-4, 16, 5], [16, -16, 4], [-20, 12, 4]].forEach(([dx, dy, s]) => { g.fillStyle = 'rgba(150,165,196,.28)'; g.beginPath(); g.arc(mx + dx, my + dy, s, 0, 7); g.fill(); });
  // tunge skybanker: mørke klumper med kant av månelys
  const sky = (cx, cy, w, h, n) => { for (let i = 0; i < n; i++) { const x = cx + (r() - .5) * w, y = cy + (r() - .5) * h * .6, rx = w * (.12 + r() * .18), ry = rx * (.35 + r() * .2);
      const nar = Math.max(0, 1 - Math.hypot(x - mx, y - my) / 700);
      myk(g, x, y - ry * .25, rx * 1.05, ry * 1.05, '150,170,205', .05 + nar * .16);
      myk(g, x, y, rx, ry, '14,20,32', .55 + r() * .25); } };
  sky(LW * .2, LH * .2, 700, 140, 26); sky(LW * .62, LH * .32, 900, 160, 30); sky(LW * .92, LH * .12, 500, 110, 16); sky(LW * .4, LH * .5, 1100, 120, 26);
  for (let i = 0; i < 22; i++) { const x = r() * LW, y = LH * (.15 + r() * .5), w = 260 + r() * 520; myk(g, x, y, w, 16 + r() * 40, i % 3 ? '120,140,175' : '100,150,165', .04 + r() * .05); }
  return c;
}
// majestetiske fjell bak ruinbyen: skarpe tinder med snø, skygge på den ene siden og skog i liene.
// Høydene er summer av periodiske bølger, så laget skjøter seg sømløst.
function lagFjell() {
  return flislag((g, r) => {
    const tinde = (x, k, f) => 1 - Math.abs(Math.sin(Math.PI * k * x / LW + f));
    const rygg = (x, ledd) => ledd.reduce((s, [k, f, a, p]) => s + a * Math.pow(tinde(x, k, f), p), 0);
    const kjede = (base, ledd, farge, sno, skog, dis) => {
      const h = x => base - rygg(x, ledd), topp = Math.min(...Array.from({ length: 160 }, (_, i) => h(i * LW / 160)));
      g.beginPath(); g.moveTo(0, LH); for (let x = 0; x <= LW; x += 4) g.lineTo(x, h(x)); g.lineTo(LW, LH); g.closePath();
      const gr = g.createLinearGradient(0, topp, 0, base + 80); gr.addColorStop(0, farge[0]); gr.addColorStop(1, farge[1]); g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      // skyggesiden: der fjellet faller mot høyre ligger i skygge fra månen
      for (let x = 0; x < LW; x += 2) { const s = h(x + 2) - h(x - 2); if (s > .5) { g.fillStyle = `rgba(4,8,16,${Math.min(.4, .15 + s * .03)})`; g.fillRect(x, h(x), 2, base - h(x) + 60); } }
      // snø over snøgrensen, med en ujevn kant
      if (sno) for (let x = 0; x < LW; x += 2) { const y = h(x), grense = sno + Math.sin(x * .05) * 12 + Math.sin(x * .013) * 18 + Math.sin(x * .21) * 4; if (y < grense) {
        const s = h(x + 2) - h(x - 2); g.fillStyle = s > 1 ? 'rgba(150,170,200,.85)' : s > 0 ? 'rgba(185,200,225,.88)' : 'rgba(216,228,244,.9)'; g.fillRect(x, y, 2, grense - y); } }
      // skog i liene: tette, små grantopper
      if (skog) for (let i = 0; i < skog; i++) { const x = r() * LW, y = h(x) + 30 + r() * 120; if (y > base + 40) continue; const s = 4 + r() * 6;
        g.fillStyle = 'rgba(10,20,24,.7)'; g.beginPath(); g.moveTo(x, y - s * 2.4); g.lineTo(x + s, y); g.lineTo(x - s, y); g.closePath(); g.fill(); }
      g.restore();
      const dg = g.createLinearGradient(0, base - 60, 0, base + 60); dg.addColorStop(0, `rgba(${dis},0)`); dg.addColorStop(1, `rgba(${dis},.55)`); g.fillStyle = dg; g.fillRect(0, base - 60, LW, 120);
    };
    kjede(580, [[2, .3, 250, .9], [5, 1.1, 120, 1.1], [11, .4, 50, 1], [29, 2, 16, 1], [67, .5, 6, 1]], ['#5f7799', '#2c3d58'], 300, 0, '70,90,120');
    kjede(620, [[3, 2.2, 160, .9], [7, .2, 80, 1.1], [17, 1.3, 30, 1], [41, .7, 10, 1], [89, 1.7, 4, 1]], ['#384b66', '#18243a'], 360, 900, '55,75,100');
    for (let i = 0; i < 6; i++) myk(g, r() * LW, 520 + r() * 90, 300 + r() * 300, 18 + r() * 14, '140,165,200', .07);
  }, 61);
}
function lagFjern() {
  return flislag((g, r) => {
    const base = 600;
    // ruinbyen i det fjerne: knekte tårn, vinduer uten lys, og trær som vokser på takene
    let x = -30;
    while (x < LW) {
      const w = 26 + r() * 70, h = 50 + Math.pow(r(), 1.6) * 270, s = r(), knekt = r() < .55;
      g.fillStyle = `rgb(${20 + s * 8 | 0},${30 + s * 9 | 0},${46 + s * 12 | 0})`;
      g.beginPath(); g.moveTo(x, base + 400); g.lineTo(x, base - h);
      if (knekt) { const n = 3 + (r() * 4 | 0); for (let i = 1; i <= n; i++) g.lineTo(x + w * i / n, base - h + (r() * .35 + (i === n ? .25 : 0)) * h * (r() < .5 ? 1 : .4)); }
      else g.lineTo(x + w, base - h);
      g.lineTo(x + w, base + 400); g.closePath(); g.fill();
      g.fillStyle = 'rgba(110,140,180,.12)'; g.fillRect(x + w - 2, base - h * (knekt ? .7 : 1), 2, h * (knekt ? .7 : 1));
      for (let yy = base - h * (knekt ? .65 : 1) + 8; yy < base - 6; yy += 9) for (let xx = x + 4; xx < x + w - 4; xx += 7)
        if (r() < .3) { g.fillStyle = 'rgba(4,7,14,.55)'; g.fillRect(xx, yy, 2.4, 3.4); }
      if (r() < .35 && !knekt) { const tx = x + w * (.2 + r() * .6), ty = base - h + 3, str = 6 + r() * 7; g.fillStyle = g.fillStyle;
        for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(tx + (r() - .5) * str * 1.6, ty - r() * str, str * (.35 + r() * .3), 0, 7); g.fill(); } }
      x += w + r() * 14;
    }
    // gamle kraftmaster langs horisonten, noen har veltet; linjene henger slakt mellom dem
    const mast = (mx, hoyde, helling) => { g.save(); g.translate(mx, base - 4); g.rotate(helling); g.strokeStyle = '#16202e'; g.lineWidth = 1.6; g.beginPath();
      g.moveTo(-9, 0); g.lineTo(-2, -hoyde); g.moveTo(9, 0); g.lineTo(2, -hoyde); for (let y = 0; y > -hoyde; y -= 12) { const b = 9 - (-y / hoyde) * 7; g.moveTo(-b, y); g.lineTo(b, y - 12); g.moveTo(b, y); g.lineTo(-b, y - 12); }
      g.moveTo(-16, -hoyde * .8); g.lineTo(16, -hoyde * .8); g.moveTo(-12, -hoyde * .92); g.lineTo(12, -hoyde * .92); g.stroke(); g.restore(); };
    const master = [[140, 120, 0], [420, 112, .05], [700, 118, 0], [980, 100, .55], [1260, 116, -.04]];
    master.forEach(([mx, h, a]) => mast(mx, h, a));
    g.strokeStyle = 'rgba(20,30,44,.8)'; g.lineWidth = 1;
    for (let i = 0; i < master.length - 1; i++) { const [a, ha, ra] = master[i], [b, hb, rb] = master[i + 1]; if (Math.abs(ra) > .2 || Math.abs(rb) > .2) continue;
      for (const s of [-16, 16]) { g.beginPath(); g.moveTo(a + s, base - 4 - ha * .8); g.quadraticCurveTo((a + b) / 2, base - 4 - Math.min(ha, hb) * .8 + 40, b + s, base - 4 - hb * .8); g.stroke(); } }
    // et stort, forlatt kraftverk med kjøletårn og piper
    g.fillStyle = '#141d2b'; const kx = 1380;
    g.beginPath(); g.moveTo(kx - 70, base); g.quadraticCurveTo(kx - 40, base - 120, kx - 52, base - 190); g.lineTo(kx + 52, base - 190); g.quadraticCurveTo(kx + 40, base - 120, kx + 70, base); g.closePath(); g.fill();
    g.fillRect(kx + 80, base - 250, 14, 250); g.fillRect(kx + 104, base - 230, 12, 230); g.fillRect(kx + 60, base - 90, 120, 90);
    g.fillStyle = 'rgba(120,150,190,.12)'; g.fillRect(kx + 80, base - 250, 14, 3); g.fillRect(kx + 104, base - 230, 12, 3);
    // naturen har tatt tilbake byen: skog i bunnen, trær som vokser ut av tårnene
    { const q = rng(91), farge = '#152a2a';
      for (let i = 0; i < 14; i++) { const x = q() * LW; if (Math.abs(x - 1400) < 120) continue; tre(g, q, x, base + 10, 40 + q() * 90, 18 + q() * 22, farge, 'rgba(90,130,140,.18)'); }
      kratt(g, q, -20, LW + 20, base + 6, 20, 70, farge); }
    const gr = g.createLinearGradient(0, base - 200, 0, base + 60);
    gr.addColorStop(0, 'rgba(60,80,105,0)'); gr.addColorStop(1, 'rgba(60,80,105,.65)'); g.fillStyle = gr; g.fillRect(0, base - 200, LW, 260);
    g.fillStyle = '#1e2a3c'; g.fillRect(0, base + 60, LW, LH);
  }, 11);
}
// posisjoner (i lagkoordinater) for blinkende varsellys på kranene i midtlaget
const KRANLYS = [[570, 92], [1530, 202], [1000, 144], [230, 254]];
function lagMidt(lit) {
  return flislag((g, r) => {
    const base = 700, mork = '#0f192b', kant = 'rgba(110,150,205,.32)';
    g.fillStyle = 'rgba(40,62,92,.35)';
    for (let i = 0; i < 6; i++) { const x = r() * LW; g.beginPath(); g.ellipse(x, base + 10, 160 + r() * 200, 40 + r() * 30, 0, 0, 7); g.fill(); }
    function bygning(x0, et, br, nk) {
      const eh = 62;
      for (let e = 0; e < et; e++) {
        const y = base - (e + 1) * eh, ufull = e === et - 1;
        if (!ufull) { g.fillStyle = mork; g.fillRect(x0 - 8, y, br + 16, 9); g.fillStyle = kant; g.fillRect(x0 - 8, y, br + 16, 1.5); }
        for (let k = 0; k <= nk; k++) {
          const cx = x0 + k * br / nk, kort = ufull && r() < .5;
          const yt = kort ? y + 30 : y + 9;
          g.fillStyle = mork; g.fillRect(cx - 5, yt, 10, y + eh - yt); g.fillStyle = kant; g.fillRect(cx + 3.5, yt, 1.4, y + eh - yt);
          if (ufull) { g.strokeStyle = 'rgba(150,90,60,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 2, yt); g.lineTo(cx - 3, yt - 12); g.moveTo(cx + 2, yt); g.lineTo(cx + 4, yt - 10); g.stroke(); }
          if (k < nk) { const vis = r(), farge = r();
            if (lit && !ufull && vis < .6) { g.fillStyle = farge < .8 ? 'rgba(255,186,110,.32)' : 'rgba(190,225,255,.3)'; g.fillRect(cx + 6, y + 12, br / nk - 12, eh - 14);
              g.fillStyle = 'rgba(255,215,150,.55)'; g.fillRect(cx + 6, y + 12, br / nk - 12, 2); }
            else if (!lit && !ufull && vis < .75) { g.fillStyle = 'rgba(3,6,12,.55)'; g.fillRect(cx + 6, y + 12, br / nk - 12, eh - 14); } }
        }
      }
      g.fillStyle = 'rgba(30,60,90,.6)'; g.fillRect(x0 + br * .2, base - eh * 2 + 9, br * .3, eh - 9);
      for (let e = 1; e < et; e++) { const y = base - e * eh + 9;
        for (let k = 0; k < 3; k++) { const vx = x0 + r() * br, l = 14 + r() * 40; g.strokeStyle = 'rgba(28,48,40,.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(vx, y); g.quadraticCurveTo(vx + 5, y + l * .5, vx - 2, y + l); g.stroke();
          g.fillStyle = 'rgba(30,54,44,.8)'; for (let b = 8; b < l; b += 7) { g.beginPath(); g.ellipse(vx + (b % 14 ? 2 : -2), y + b, 2.6, 1.4, .6, 0, 7); g.fill(); } }
        if (r() < .6) { const rx = x0 + r() * br; const rg = g.createLinearGradient(0, y, 0, y + 50); rg.addColorStop(0, 'rgba(120,70,40,.35)'); rg.addColorStop(1, 'rgba(120,70,40,0)'); g.fillStyle = rg; g.fillRect(rx, y, 3, 50); } }
      // et sammenrast hjørne øverst
      g.fillStyle = '#0a1220'; g.beginPath(); g.moveTo(x0 + br * .62, base - et * eh); g.lineTo(x0 + br * .8, base - et * eh + 46); g.lineTo(x0 + br + 9, base - et * eh + 30); g.lineTo(x0 + br + 9, base - et * eh - 4); g.closePath();
      g.globalCompositeOperation = 'destination-out'; g.fill(); g.globalCompositeOperation = 'source-over';
    }
    function kran(x, top, jl, jr) {
      const w = 20; g.strokeStyle = mork; g.lineWidth = 3; g.beginPath();
      g.moveTo(x, base); g.lineTo(x, top); g.moveTo(x + w, base); g.lineTo(x + w, top);
      for (let y = base; y > top; y -= 22) { g.moveTo(x, y); g.lineTo(x + w, y - 22); g.moveTo(x, y); g.lineTo(x + w, y); }
      g.stroke();
      g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - jl, top); g.lineTo(x + w + jr, top); g.moveTo(x - jl, top - 12); g.lineTo(x + w + jr, top - 6);
      for (let xx = x - jl; xx < x + w + jr; xx += 18) { g.moveTo(xx, top); g.lineTo(xx + 9, top - 10); g.lineTo(xx + 18, top); } g.stroke();
      g.lineWidth = 1.4; g.beginPath(); g.moveTo(x + w / 2, top - 56); g.lineTo(x - jl, top - 12); g.moveTo(x + w / 2, top - 56); g.lineTo(x + w + jr, top - 6);
      g.moveTo(x, top); g.lineTo(x + w / 2, top - 56); g.lineTo(x + w, top); g.stroke();
      g.fillStyle = mork; g.fillRect(x - jl, top, 44, 24); g.fillRect(x - 6, top + 4, 30, 20);
      g.fillStyle = lit ? 'rgba(255,200,130,.8)' : 'rgba(120,160,200,.25)'; g.fillRect(x - 2, top + 8, 10, 7);
      const hx = x + w + jr * (.45 + r() * .4), hl = 180 + r() * 160;
      g.strokeStyle = 'rgba(15,25,43,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx, top); g.lineTo(hx, top + hl); g.stroke();
      g.fillStyle = mork; g.fillRect(hx - 6, top + hl, 12, 10);
      g.strokeStyle = kant; g.lineWidth = 1; g.beginPath(); g.moveTo(x + w + 1.5, base); g.lineTo(x + w + 1.5, top); g.stroke();
      g.fillStyle = '#5a2020'; g.beginPath(); g.arc(x + w / 2, top - 58, 2.4, 0, 7); g.fill();
    }
    bygning(90, 7, 360, 6);
    bygning(1180, 4, 260, 4);
    kran(560, 150, 130, 420);
    kran(1520, 260, 90, 260);
    [[700, 520], [1100, 600], [40, 560]].forEach(([x, y]) => {
      g.strokeStyle = mork; g.lineWidth = 3; g.beginPath(); g.moveTo(x, base); g.lineTo(x, y); g.stroke();
      g.fillStyle = mork; g.fillRect(x - 12, y - 8, 24, 10);
      if (lit) { const gr = g.createLinearGradient(x, y, x, base); gr.addColorStop(0, 'rgba(255,230,170,.35)'); gr.addColorStop(1, 'rgba(255,230,170,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 10, y); g.lineTo(x + 140, base); g.lineTo(x - 140, base); g.closePath(); g.fill();
        myk(g, x, y - 3, 40, 26, '255,230,170', .8); }
    });
    { const q = rng(57), farge = '#12271f', kant = 'rgba(120,180,150,.26)';
      for (const [x, h, kr] of [[480, 300, 70], [930, 380, 90], [1430, 220, 60], [30, 160, 50]]) tre(g, q, x, base + 4, h, kr, farge, kant);
      for (let i = 0; i < 40; i++) slynger(g, q, q() * LW, 120 + q() * 400, 30 + q() * 90, 'rgba(22,44,36,.85)');
      kratt(g, q, -20, LW + 20, base + 4, 18, 48, farge); }
    g.fillStyle = '#0e1828'; g.fillRect(0, base, LW, LH);
    const gr = g.createLinearGradient(0, base - 120, 0, base + 30); gr.addColorStop(0, 'rgba(60,95,125,0)'); gr.addColorStop(1, 'rgba(60,95,125,.35)');
    g.fillStyle = gr; g.fillRect(0, base - 120, LW, 150);
  }, 23);
}
function lagNaer() {
  return flislag((g, r) => {
    const base = 812, c = '#070d18';
    let gr = g.createLinearGradient(0, base - 300, 0, base);
    gr.addColorStop(0, 'rgba(80,130,150,0)'); gr.addColorStop(1, 'rgba(80,130,150,.17)'); g.fillStyle = gr; g.fillRect(0, base - 300, LW, 300);
    g.strokeStyle = c; g.fillStyle = c;
    function stillas(x0, nivå, fag) {
      const fb = 70, nh = 64; g.lineWidth = 4; g.beginPath();
      for (let k = 0; k <= fag; k++) { g.moveTo(x0 + k * fb, base); g.lineTo(x0 + k * fb, base - nivå * nh - 20); }
      for (let n = 1; n <= nivå; n++) { g.moveTo(x0 - 6, base - n * nh); g.lineTo(x0 + fag * fb + 6, base - n * nh); }
      g.stroke(); g.lineWidth = 2; g.beginPath();
      for (let n = 0; n < nivå; n++) for (let k = 0; k < fag; k++) if (r() < .55) { g.moveTo(x0 + k * fb, base - n * nh); g.lineTo(x0 + (k + 1) * fb, base - (n + 1) * nh); }
      g.stroke();
      for (let n = 1; n <= nivå; n++) g.fillRect(x0 - 6, base - n * nh - 6, fag * fb + 12, 6);
      g.strokeStyle = 'rgba(120,160,210,.12)'; g.lineWidth = 1; g.beginPath();
      for (let k = 0; k <= fag; k++) { g.moveTo(x0 + k * fb + 2, base); g.lineTo(x0 + k * fb + 2, base - nivå * nh - 20); } g.stroke(); g.strokeStyle = c;
    }
    stillas(200, 4, 3);
    stillas(1240, 2, 2);
    for (let x = 560; x < 900; x += 68) { g.lineWidth = 3; g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - 92); g.stroke();
      g.lineWidth = .7; g.globalAlpha = .7; g.beginPath(); for (let i = 0; i < 68; i += 6) { g.moveTo(x + i, base - 90); g.lineTo(x + i, base - 4); }
      for (let j = 0; j < 90; j += 6) { g.moveTo(x, base - j); g.lineTo(x + 68, base - j); } g.stroke(); g.globalAlpha = 1;
      g.fillRect(x - 6, base - 4, 20, 6); }
    g.save(); g.translate(1000, base);
    rr(g, -10, -18, 130, 20, 8); g.fill(); g.fillRect(10, -70, 70, 52); g.fillRect(70, -56, 50, 38);
    g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(100, -60); g.lineTo(170, -150); g.lineTo(240, -70); g.stroke();
    g.beginPath(); g.moveTo(240, -70); g.lineTo(262, -30); g.lineTo(225, -30); g.closePath(); g.fill();
    g.fillStyle = 'rgba(120,160,210,.16)'; g.fillRect(18, -64, 30, 22); g.restore(); g.lineCap = 'butt'; g.fillStyle = c;
    g.lineWidth = 3; g.beginPath(); g.moveTo(410, base - 280); g.lineTo(410, base); g.stroke();
    g.lineWidth = 1.5; g.beginPath(); g.moveTo(410, base - 270); g.quadraticCurveTo(480, base - 180, 560, base - 250); g.quadraticCurveTo(620, base - 200, 700, base - 300); g.stroke();
    g.fillRect(400, base - 286, 20, 8);
    g.fillStyle = c; g.fillRect(0, base, LW, LH);
    for (let x = 0; x < LW; x += 3) { const h = 6 + Math.pow(r(), 2) * 34, l = (r() - .5) * 14;
      g.beginPath(); g.moveTo(x - 2, base + 1); g.quadraticCurveTo(x + l * .3, base - h * .5, x + l, base - h); g.lineTo(x + 2, base + 1); g.fill(); }
    for (let i = 0; i < 18; i++) { const x = r() * LW; g.beginPath(); g.ellipse(x, base + 4, 30 + r() * 70, 10 + r() * 14, 0, Math.PI, 0); g.fill(); }
    g.save(); g.translate(1420, base); g.fillStyle = c; rr(g, -70, -30, 140, 26, 8); g.fill(); g.beginPath(); g.moveTo(-40, -30); g.lineTo(-22, -54); g.lineTo(30, -54); g.lineTo(48, -30); g.closePath(); g.fill();
    g.fillStyle = 'rgba(120,160,210,.1)'; g.fillRect(-18, -50, 20, 16); g.fillRect(8, -50, 18, 16); g.fillStyle = c; g.beginPath(); g.arc(-40, -4, 13, 0, 7); g.arc(42, -4, 13, 0, 7); g.fill(); g.restore();
    for (const [bx, bh] of [[120, 120], [930, 150], [1560, 100]]) { g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.moveTo(bx, base); g.quadraticCurveTo(bx + 6, base - bh * .5, bx - 4, base - bh); g.stroke();
      for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, d = r() * 34; g.beginPath(); g.arc(bx - 4 + Math.cos(a) * d, base - bh + Math.sin(a) * d * .7, 14 + r() * 12, 0, 7); g.fill(); } }
    for (let i = 0; i < 14; i++) { const x = r() * LW, w = 26 + r() * 50; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + (r() - .5) * w, base - 6 - r() * 18, 8 + r() * 12, 0, 7); g.fill(); } }
    { const q = rng(73);
      // store blader og bregner som vokser over ruinene
      const blad = (x, y, l, a) => { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * .5, -l * .32, l, 0); g.quadraticCurveTo(l * .5, l * .22, 0, 0); g.fill(); g.restore(); };
      for (let i = 0; i < 34; i++) { const x = q() * LW, n = 4 + (q() * 4 | 0), s = 30 + q() * 60; g.fillStyle = i % 3 ? c : '#0a1a16'; for (let k = 0; k < n; k++) blad(x, base - 4, s * (.6 + q() * .5), -Math.PI / 2 + (k / (n - 1) - .5) * 2.4 + (q() - .5) * .3); }
      // lianer fra toppen
      for (let i = 0; i < 9; i++) { const x = q() * LW, l = 140 + q() * 260; g.strokeStyle = c; g.lineWidth = 2.4; g.beginPath(); g.moveTo(x, -10); g.bezierCurveTo(x + 30, l * .3, x - 30, l * .7, x + (q() - .5) * 20, l); g.stroke();
        g.fillStyle = c; for (let b = 20; b < l; b += 14 + q() * 12) blad(x + (q() - .5) * 18, b, 12 + q() * 10, q() * 6.28); }
      // en sumpdam med siv og vannliljer
      const sx = 620, sw = 300; g.fillStyle = '#0a1622'; g.beginPath(); g.ellipse(sx + sw / 2, base + 2, sw / 2, 12, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(140,180,210,.18)'; for (let i = 0; i < 8; i++) g.fillRect(sx + 30 + q() * (sw - 60), base - 2 + q() * 6, 10 + q() * 30, 1.2);
      g.fillStyle = '#0d2420'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(sx + 40 + q() * (sw - 80), base + q() * 5, 7, 2.4, 0, .3, 6.1); g.fill(); }
      g.strokeStyle = c; g.lineWidth = 1.6; for (let i = 0; i < 26; i++) { const x = sx + (q() < .5 ? q() * 50 : sw - q() * 50), h = 30 + q() * 50; g.beginPath(); g.moveTo(x, base + 4); g.quadraticCurveTo(x + 4, base - h * .5, x + (q() - .5) * 10, base - h); g.stroke();
        if (q() < .4) { g.fillStyle = '#1a120c'; g.fillRect(x + (q() - .5) * 2 - 1.6, base - h * .9, 3.2, 10); } } }
    gr = g.createLinearGradient(0, base - 40, 0, base + 30); gr.addColorStop(0, 'rgba(50,85,105,0)'); gr.addColorStop(1, 'rgba(50,85,105,.25)');
    g.fillStyle = gr; g.fillRect(0, base - 40, LW, 70);
  }, 37);
}
let BG = null;
function lagBakgrunn() { BG = { himmel: lagHimmel(), fjell: lagFjell(), fjern: lagFjern(), midt: lagMidt(false), midtLys: null, naer: lagNaer() }; }

// ---------- terreng (malte biter, bufret) ----------
const PAL = {
  ute: { c: ['#000', '#2c3d57', '#223046', '#1a2538', '#141d2d', '#101724', '#0c121d'], mose: '#2c6a5e', stra: ['#5cbf9f', '#7fdcbc', '#45a088'] },
  kjeller: { c: ['#000', '#3a3542', '#2e2a35', '#24202b', '#1c1922', '#17141c', '#121016'], mose: '#57515f', stra: ['#6d6676', '#857c8e', '#5d5866'] },
  hall: { c: ['#000', '#30344a', '#26293c', '#1d1f2e', '#171824', '#12131c', '#0e0f16'], mose: '#4b516b', stra: ['#5c6380', '#6b7392', '#4f5670'] },
};
PAL.kabel = { c: ['#000', '#2e3a3f', '#253035', '#1d272b', '#172024', '#12191c', '#0e1416'], mose: '#3f5559', stra: ['#56707a', '#68848d', '#4a6168'] };
PAL.kraft = { c: ['#000', '#33402f', '#293427', '#202a1f', '#192119', '#141a14', '#0f140f'], mose: '#4d6340', stra: ['#6f8a5c', '#86a26f', '#5b7349'] };
PAL.fjell = { c: ['#000', '#36404f', '#2b3443', '#222a37', '#1b212c', '#151a23', '#10141b'], mose: '#dfe8f2', stra: ['#7d8f86', '#97a89c', '#66786e'], gress: true, rim: 'rgba(230,245,255,.5)' };
PAL.betong = { c: ['#000', '#3a4446', '#2f383a', '#262e30', '#1e2527', '#181e20', '#121719'], mose: '#3f6a5c', stra: ['#5c8f7a', '#74a890', '#4a7866'], gress: true, rim: 'rgba(170,240,220,.4)' };
PAL.ute.rim = 'rgba(190,255,225,.4)'; PAL.kjeller.rim = 'rgba(255,215,170,.3)'; PAL.hall.rim = 'rgba(205,190,255,.32)'; PAL.kabel.rim = 'rgba(150,240,250,.3)'; PAL.kraft.rim = 'rgba(190,255,170,.32)';
const palAt = (x, y) => y >= 118 ? PAL.betong : y >= 72 ? PAL.fjell : iKraft(x, y) ? PAL.kraft : erHall(x, y) ? PAL.hall : iKjeller2(x, y) && y >= 21 ? PAL.kabel : (y >= 25 && x <= 52) || (x >= 45 && x <= 48 && y >= 19) ? PAL.kjeller : PAL.ute;
const CH = 12, CPX = CH * T;
let chunkRes = 1;
const chunks = new Map();

// grunnfargen på bakveggen (halvgjennomsiktig, så den innendørs parallaksen synes bak)
function bakveggFarge(x, y) { if (y >= 118) return '22,30,32'; return erHall(x, y) ? '20,22,40' : iKraft(x, y) ? '22,29,24' : iKjeller2(x, y) ? '20,29,33' : '24,32,48'; }
const SKILT = ['FARE', '400 V', '230 V', 'K-12', 'K-7', 'T3', 'NØD', 'IP44'];
function bakvegg(g, x, y) {
  const X = x * T, Y = y * T;
  const hall = erHall(x, y);
  if (hall) {
    if (x % 2 === 0) { g.fillStyle = 'rgba(150,160,230,.06)'; g.fillRect(X, Y, 1.5, T); }
    if (y === 18) { g.save(); g.beginPath(); g.rect(X, Y + 18, T, 14); g.clip();
      for (let i = -2; i < 4; i++) { g.fillStyle = i % 2 ? 'rgba(240,195,60,.16)' : 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(X + i * 12, Y + 32); g.lineTo(X + i * 12 + 12, Y + 32); g.lineTo(X + i * 12 + 26, Y + 18); g.lineTo(X + i * 12 + 14, Y + 18); g.fill(); } g.restore(); }
    if (y === 8) { g.fillStyle = '#1f2236'; g.fillRect(X, Y + 10, T, 8); g.fillStyle = 'rgba(160,170,240,.1)'; g.fillRect(X, Y + 10, T, 1.5);
      if (x % 3 === 0) { g.fillStyle = '#181a2b'; g.fillRect(X + 4, Y + 18, 3, 6); } }
    if (y === 9 && x % 4 === 1) { g.strokeStyle = '#0d0f1a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X + 8, Y - 6); g.bezierCurveTo(X + 10, Y + 30, X + 2, Y + 60, X + 9, Y + 96); g.stroke(); }
    if (y === 11 && x % 6 === 0) { g.fillStyle = '#222538'; rr(g, X + 4, Y - 10, 24, 34, 3); g.fill(); g.fillStyle = 'rgba(255,200,80,.25)'; g.beginPath(); g.moveTo(X + 16, Y - 2); g.lineTo(X + 22, Y + 9); g.lineTo(X + 10, Y + 9); g.fill(); }
    if (y === 15 && x % 7 === 3) { g.fillStyle = '#1e2133'; rr(g, X + 2, Y - 4, 28, 40, 3); g.fill(); g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 4; i++) g.fillRect(X + 6, Y + 2 + i * 8, 20, 3); }
  } else if (iKraft(x, y)) {
    // det gamle kraftverket: flislagte vegger, store rør og nagler
    g.fillStyle = 'rgba(170,210,160,.04)'; g.fillRect(X, Y, T, 1); g.fillRect(X, Y, 1, T);
    if (y % 2 === 0) { g.fillStyle = 'rgba(170,210,160,.03)'; g.fillRect(X + 16, Y, 1, T); }
    if (y % 8 === 3) { g.fillStyle = '#25302a'; g.fillRect(X, Y + 4, T, 16); g.fillStyle = 'rgba(190,220,180,.12)'; g.fillRect(X, Y + 6, T, 2);
      g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(X, Y + 17, T, 3); if (x % 6 === 0) { g.fillStyle = '#323f37'; g.fillRect(X + 4, Y + 1, 6, 22); } }
    if (x % 9 === 4) { g.fillStyle = '#212b25'; g.fillRect(X + 9, Y, 14, T); g.fillStyle = 'rgba(190,220,180,.08)'; g.fillRect(X + 11, Y, 3, T);
      if (y % 4 === 0) { g.fillStyle = '#323f37'; g.fillRect(X + 7, Y + 10, 18, 5); } }
    if (hs(x, y, 95) < .1) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(X + 6, Y + 6, 1.5, 0, 7); g.arc(X + 26, Y + 6, 1.5, 0, 7); g.fill(); }
    if (y % 11 === 6 && x % 14 === 9) { g.fillStyle = '#202a23'; rr(g, X + 3, Y - 6, 26, 32, 3); g.fill(); g.strokeStyle = 'rgba(170,210,160,.15)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = 'rgba(240,200,90,.35)'; g.beginPath(); g.arc(X + 16, Y + 6, 7, Math.PI, 0); g.fill(); g.fillStyle = '#111'; g.fillRect(X + 15.3, Y - 1, 1.4, 7); }
  } else if (iKjeller2(x, y)) {
    // kabelkjelleren: betong med kabelbroer og rør
    if (x % 4 === 0) { g.fillStyle = 'rgba(160,220,230,.035)'; g.fillRect(X, Y, 1.2, T); }
    if (y % 3 === 0) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X, Y, T, 1); }
    if (y % 7 === 2) { g.fillStyle = '#223036'; g.fillRect(X, Y + 6, T, 5); g.fillStyle = 'rgba(170,220,230,.14)'; g.fillRect(X, Y + 6, T, 1.2);
      g.strokeStyle = '#0b1114'; g.lineWidth = 2.2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(X, Y + 13 + k * 3); g.quadraticCurveTo(X + T / 2, Y + 16 + k * 3 + hs(x, y, k) * 3, X + T, Y + 13 + k * 3); g.stroke(); } }
    if (x % 11 === 5) { g.fillStyle = '#1b282d'; g.fillRect(X + 10, Y, 9, T); g.fillStyle = 'rgba(170,220,230,.08)'; g.fillRect(X + 11, Y, 2, T);
      if (y % 5 === 0) { g.fillStyle = '#2b3a40'; g.fillRect(X + 8, Y + 12, 13, 4); } }
    if (y % 9 === 4 && x % 13 === 7) { g.fillStyle = '#1f2a2f'; rr(g, X + 3, Y - 4, 26, 30, 2); g.fill(); g.strokeStyle = 'rgba(140,200,210,.15)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#f2c23c'; g.beginPath(); g.moveTo(X + 16, Y + 2); g.lineTo(X + 22, Y + 12); g.lineTo(X + 10, Y + 12); g.closePath(); g.fill(); g.fillStyle = '#111'; g.fillRect(X + 15.3, Y + 5.5, 1.4, 4); }
    if (hs(x, y, 93) < .08) { g.fillStyle = 'rgba(60,110,120,.12)'; g.beginPath(); g.ellipse(X + 16, Y + 10, 6, 14, 0, 0, 7); g.fill(); }
  } else {
    if (x % 3 === 0) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(X, Y, 1.2, T); }
    if (y % 2 === 0) { g.fillStyle = 'rgba(255,255,255,.02)'; g.fillRect(X, Y, T, 1); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(X + 8, Y + 9, 1.6, 0, 7); g.arc(X + 24, Y + 25, 1.6, 0, 7); g.fill();
    if (y === 28 && x < 45 && x >= 10) { g.fillStyle = '#272d3c'; g.fillRect(X, Y + 8, T, 10); g.fillStyle = 'rgba(160,190,235,.16)'; g.fillRect(X, Y + 9, T, 1.5);
      if (x % 5 === 0) { g.fillStyle = '#1b202c'; g.fillRect(X + 12, Y + 5, 6, 16); } }
    if (y === 29 && (x === 19 || x === 38)) { g.fillStyle = '#2a2f3e'; rr(g, X + 2, Y - 6, 28, 34, 2); g.fill(); g.strokeStyle = 'rgba(160,180,220,.18)'; g.lineWidth = 1; g.stroke();
      g.fillStyle = '#f2c23c'; g.beginPath(); g.moveTo(X + 16, Y); g.lineTo(X + 22, Y + 10); g.lineTo(X + 10, Y + 10); g.closePath(); g.fill(); g.fillStyle = '#111'; g.fillRect(X + 15.3, Y + 3.5, 1.4, 4); }
    if (hs(x, y, 91) < .12) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(X + 16, Y + 22, 10, 18, 0, 0, 7); g.fill(); }
  }
  // skilt med sjablongtekst her og der på veggen
  if (erSol(x, y + 1) && x % 5 === 2 && !erSol(x + 1, y) && !erSol(x - 1, y) && !erSol(x, y - 1) && hs(x, y, 310) < .12) {
    const tekst = SKILT[(hs(x, y, 311) * SKILT.length) | 0], gul = hs(x, y, 312) < .5;
    g.fillStyle = gul ? 'rgba(200,160,50,.55)' : 'rgba(170,180,195,.32)'; rr(g, X + 1, Y + 2, T - 2, 13, 2); g.fill();
    g.fillStyle = 'rgba(10,12,16,.75)'; g.font = 'bold 7px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tekst, X + T / 2, Y + 9); }
  if (erSol(x, y - 1)) { const gr = g.createLinearGradient(0, Y, 0, Y + 14); gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X, Y, T, 14); }
  if (erSol(x - 1, y)) { const gr = g.createLinearGradient(X, 0, X + 12, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X, Y, 12, T); }
  if (erSol(x + 1, y)) { const gr = g.createLinearGradient(X + T, 0, X + T - 12, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(X + T - 12, Y, 12, T); }
}
function topp(g, x, y, pal) {
  const X = x * T, Y = y * T, hv = k => hs(x, y, k);
  if (pal === PAL.ute || pal.gress) {
    const d = pal === PAL.ute ? hv(1) : 1;
    if (d < .1) { g.strokeStyle = '#8a5236'; g.lineWidth = 2; g.beginPath(); const bx = X + 6 + hv(2) * 18;
      g.moveTo(bx, Y + 2); g.lineTo(bx - 3 + hv(3) * 6, Y - 10 - hv(4) * 10); g.moveTo(bx + 5, Y + 2); g.lineTo(bx + 4 + hv(5) * 6, Y - 8 - hv(6) * 8); g.stroke(); }
    else if (d < .16) { g.fillStyle = '#4b566c'; rr(g, X + 5, Y - 9, 18, 11, 2); g.fill(); g.fillStyle = 'rgba(200,220,255,.18)'; g.fillRect(X + 6, Y - 9, 16, 1.5); }
    else if (d < .2) { g.fillStyle = '#e2722e'; g.beginPath(); g.moveTo(X + 9, Y + 1); g.lineTo(X + 23, Y + 1); g.lineTo(X + 16, Y - 16); g.closePath(); g.fill();
      g.fillStyle = '#f2efe6'; g.fillRect(X + 12.5, Y - 8, 7, 2.5); g.fillStyle = '#2a2a2a'; g.fillRect(X + 7, Y - 1, 18, 3); }
    // spor etter folk som jobbet her før strømmen forsvant: verktøykasser, sikringsskap, skilt og aggregater
    else if (pal === PAL.ute && d < .26 && !erSol(x, y - 1) && !erSol(x + 1, y - 1)) { const v = hv(91);
      if (v < .25) { g.fillStyle = '#7a3a24'; rr(g, X + 6, Y - 9, 20, 10, 1.5); g.fill(); g.fillStyle = '#5a2a1a'; g.fillRect(X + 6, Y - 6, 20, 1.5); g.strokeStyle = '#3a2418'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X + 12, Y - 9); g.lineTo(X + 12, Y - 12); g.lineTo(X + 20, Y - 12); g.lineTo(X + 20, Y - 9); g.stroke();
        g.fillStyle = 'rgba(150,90,50,.5)'; g.fillRect(X + 9, Y - 4, 3, 3); }
      else if (v < .5) { g.fillStyle = '#3d4650'; rr(g, X + 7, Y - 24, 16, 24, 1.5); g.fill(); g.fillStyle = '#2b3138'; g.save(); g.translate(X + 23, Y - 23); g.rotate(.5); g.fillRect(0, 0, 8, 21); g.restore();
        g.fillStyle = '#1b1f24'; g.fillRect(X + 9, Y - 21, 12, 17); g.fillStyle = '#6a5a3a'; for (let i = 0; i < 4; i++) g.fillRect(X + 10 + i * 3, Y - 18, 2, 5); g.fillStyle = 'rgba(140,80,40,.6)'; g.fillRect(X + 8, Y - 24, 3, 14); }
      else if (v < .75) { g.strokeStyle = '#2c2f36'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + 16, Y); g.lineTo(X + 14, Y - 18); g.stroke(); g.save(); g.translate(X + 14, Y - 22); g.rotate(-.18);
        g.fillStyle = '#b8922a'; g.beginPath(); g.moveTo(0, -8); g.lineTo(9, 7); g.lineTo(-9, 7); g.closePath(); g.fill(); g.fillStyle = '#2a2418'; g.fillRect(-1, -3, 2, 6); g.fillRect(-1, 4, 2, 1.6);
        g.fillStyle = 'rgba(90,60,30,.5)'; g.beginPath(); g.moveTo(3, 1); g.lineTo(9, 7); g.lineTo(2, 7); g.closePath(); g.fill(); g.restore(); }
      else { g.fillStyle = '#3a4a3a'; rr(g, X + 2, Y - 14, 28, 14, 2); g.fill(); g.fillStyle = '#26302a'; for (let i = 0; i < 5; i++) g.fillRect(X + 5 + i * 4, Y - 11, 2, 8); g.fillStyle = '#1a1f1c'; g.beginPath(); g.arc(X + 7, Y, 3, 0, 7); g.arc(X + 25, Y, 3, 0, 7); g.fill();
        g.fillStyle = 'rgba(150,90,50,.55)'; g.fillRect(X + 22, Y - 14, 6, 3); g.strokeStyle = '#141414'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X + 28, Y - 6); g.quadraticCurveTo(X + 36, Y - 2, X + 34, Y + 1); g.stroke(); } }
    g.fillStyle = pal.mose; g.beginPath(); g.moveTo(X - 1, Y + 8);
    g.lineTo(X - 1, Y - 1); for (let i = 1; i <= 4; i++) g.quadraticCurveTo(X + (i - .5) * 8, Y - 2.5 - hv(20 + i) * 3, X + i * 8 + (i === 4 ? 1 : 0), Y - .5);
    g.lineTo(X + T + 1, Y + 8); g.closePath(); g.fill();
    const gr = g.createLinearGradient(0, Y, 0, Y + 12); gr.addColorStop(0, 'rgba(20,40,40,0)'); gr.addColorStop(1, 'rgba(10,20,30,.35)'); g.fillStyle = gr; g.fillRect(X, Y + 3, T, 9);
    g.strokeStyle = pal.gress ? pal.rim : 'rgba(160,240,210,.4)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X, Y - 1); g.lineTo(X + T, Y - 1); g.stroke();
    const n = 4 + (hv(30) * 6 | 0);
    for (let i = 0; i < n; i++) { const bx = X + hv(40 + i) * T, bh = 5 + hv(50 + i) * 12, l = (hv(60 + i) - .5) * 9;
      g.strokeStyle = pal.stra[i % 3]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx, Y + 1); g.quadraticCurveTo(bx + l * .3, Y - bh * .6, bx + l, Y - bh); g.stroke(); }
    if (pal === PAL.ute && hv(70) < .13) { const px = X + 8 + hv(71) * 16, ph = 10 + hv(72) * 10;
      g.strokeStyle = '#3f8f7c'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(px, Y); g.quadraticCurveTo(px + 4, Y - ph * .5, px, Y - ph); g.stroke();
      const gb = g.createRadialGradient(px, Y - ph, 0, px, Y - ph, 8); gb.addColorStop(0, '#effeff'); gb.addColorStop(.35, 'rgba(120,230,255,.9)'); gb.addColorStop(1, 'rgba(120,230,255,0)');
      g.fillStyle = gb; g.beginPath(); g.arc(px, Y - ph, 8, 0, 7); g.fill(); }
  } else {
    g.fillStyle = pal.mose; g.fillRect(X - .5, Y - 1, T + 1, 4);
    g.fillStyle = pal.rim; g.fillRect(X - .5, Y - 1, T + 1, 1.2);
    const rg = g.createLinearGradient(0, Y - 7, 0, Y - 1); rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, pal.rim.replace(/[\d.]+\)$/, '.08)')); g.fillStyle = rg; g.fillRect(X - .5, Y - 7, T + 1, 6);
    if (pal === PAL.hall) { g.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 3; i < T; i += 6) g.fillRect(X + i, Y + 3, 2, 5); }
    else { if (hv(3) < .3) { g.fillStyle = '#4a4552'; g.beginPath(); g.ellipse(X + 8 + hv(4) * 16, Y - 1, 3 + hv(5) * 4, 2.5, 0, Math.PI, 0); g.fill(); }
      if (hv(6) < .12) { g.fillStyle = 'rgba(120,170,230,.22)'; g.beginPath(); g.ellipse(X + 16, Y + 1, 14, 2, 0, 0, 7); g.fill(); } }
  }
}
function heng(g, x, y, pal) {
  const X = x * T, Y = (y + 1) * T, hv = k => hs(x, y, k);
  if (pal === PAL.ute || pal.gress) {
    if (hv(80) < .5) { const n = 1 + (hv(81) * 3 | 0); g.strokeStyle = '#0d1524'; for (let i = 0; i < n; i++) { const bx = X + hv(82 + i) * T, l = 8 + hv(85 + i) * 24;
      g.lineWidth = 1 + hv(88 + i) * 1.5; g.beginPath(); g.moveTo(bx, Y - 2); g.quadraticCurveTo(bx + 4, Y + l * .5, bx - 2, Y + l); g.stroke(); } }
  } else {
    if (hv(80) < .28 && !erSol(x + 1, y + 1)) { g.strokeStyle = '#0f1118'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(X + 4, Y); g.quadraticCurveTo(X + T, Y + 14, X + T * 2 - 4, Y); g.stroke(); }
    // lange rørløp under taket
    if (hs(Math.floor(x / 7), y, 300) < .32 && !erSol(x, y + 2)) { const ry = Y + 6, kant = pal.rim;
      g.fillStyle = '#1a1e26'; g.fillRect(X - .5, ry, T + 1, 7); g.fillStyle = kant; g.fillRect(X - .5, ry, T + 1, 1); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(X - .5, ry + 5, T + 1, 2);
      if (x % 3 === 0) { g.fillStyle = '#262c36'; g.fillRect(X + 12, Y, 4, ry - Y + 1); g.fillRect(X + 9, ry - 1, 10, 9); } }
    if (hv(83) < .07) { g.strokeStyle = '#0f1118'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X + 16, Y); g.lineTo(X + 16, Y + 16); g.stroke();
      g.fillStyle = '#3a3e4a'; g.beginPath(); g.arc(X + 16, Y + 19, 4, 0, 7); g.fill(); }
  }
}
function planke(g, x, y) {
  const X = x * T, Y = y * T;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X - .5, Y + 9, T + 1, 4);
  const gr = g.createLinearGradient(0, Y, 0, Y + 9); gr.addColorStop(0, '#a57c4c'); gr.addColorStop(1, '#5a3f27');
  g.fillStyle = gr; g.fillRect(X - .5, Y, T + 1, 9);
  g.fillStyle = 'rgba(255,230,180,.35)'; g.fillRect(X, Y, T, 1.4);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(X, Y + 1, 1, 8);
  g.fillStyle = 'rgba(60,35,15,.4)'; g.fillRect(X + 4, Y + 4, 10, 1); g.fillRect(X + 18, Y + 6, 9, 1);
  g.fillStyle = '#b8c0cc'; g.beginPath(); g.arc(X + 6, Y + 4.5, 1.2, 0, 7); g.arc(X + 26, Y + 4.5, 1.2, 0, 7); g.fill();
  for (const side of [-1, 1]) {
    if (tile(x + side, y) === ONE) continue;
    const px = side < 0 ? X + 3 : X + T - 6;
    const pg = g.createLinearGradient(0, Y + 9, 0, Y + 9 + T * 1.7); pg.addColorStop(0, 'rgba(140,152,170,.95)'); pg.addColorStop(1, 'rgba(140,152,170,0)');
    g.fillStyle = pg; g.fillRect(px, Y + 9, 3, T * 1.7);
    g.fillStyle = '#c9d0db'; g.fillRect(px - 1.5, Y + 8, 6, 3);
  }
}
function lagChunk(cx, cy) {
  const pad = 2, r = chunkRes, c = nyC(Math.ceil((CPX + pad * 2) * r), Math.ceil((CPX + pad * 2) * r)), g = c.getContext('2d');
  g.scale(r, r); g.translate(-cx * CPX + pad, -cy * CPX + pad);
  const xa = cx * CH - 1, xb = cx * CH + CH, ya = cy * CH - 1, yb = cy * CH + CH;
  const alle = f => { for (let y = ya; y <= yb; y++) for (let x = xa; x <= xb; x++) f(x, y); };
  { const a = bakveggAlfa(), stier = new Map();
    alle((x, y) => { if (erSol(x, y) || !inne(x, y)) return; const f = bakveggFarge(x, y); let p = stier.get(f); if (!p) stier.set(f, p = new Path2D()); p.rect(x * T, y * T, T, T); });
    for (const [f, p] of stier) { g.fillStyle = `rgba(${f},${a})`; g.fill(p); } }
  alle((x, y) => { if (!erSol(x, y) && inne(x, y)) bakvegg(g, x, y); });
  alle((x, y) => { if (!erSol(x, y)) return; const pal = palAt(x, y); g.fillStyle = pal.c[1]; g.fillRect(x * T - .5, y * T - .5, T + 1, T + 1);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if (!erSol(x + dx, y + dy)) { const rad = T * (.44 + hs(x, y, dx * 3 + dy + 5) * .12);
      g.beginPath(); g.arc(x * T + T / 2 + dx * T * .1, y * T + T / 2 + dy * T * .1, rad, 0, 7); g.fill(); } });
  for (let d = 2; d <= 6; d++) alle((x, y) => { if (!erSol(x, y) || dypAt(x, y) < d) return; g.fillStyle = palAt(x, y).c[d];
    g.beginPath(); g.arc(x * T + T / 2 + (hs(x, y, d) - .5) * 6, y * T + T / 2 + (hs(x, y, d + 9) - .5) * 6, T * .85, 0, 7); g.fill(); });
  alle((x, y) => { if (!erSol(x, y)) return; const d = dypAt(x, y);
    for (let k = 0; k < 3; k++) { const a = hs(x, y, 10 + k); g.fillStyle = a < .5 ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.1)';
      g.beginPath(); g.ellipse(x * T + hs(x, y, 20 + k) * T, y * T + hs(x, y, 30 + k) * T, 5 + hs(x, y, 40 + k) * 10, 1.5 + hs(x, y, 50 + k) * 3.5, (hs(x, y, 60 + k) - .5) * .8, 0, 7); g.fill(); }
    if (d >= 2 && d <= 4 && hs(x, y, 77) < .07) { g.fillStyle = 'rgba(70,90,120,.35)'; g.beginPath(); g.ellipse(x * T + 16, y * T + 16, 7, 5, .3, 0, 7); g.fill();
      g.fillStyle = 'rgba(200,220,255,.08)'; g.beginPath(); g.ellipse(x * T + 15, y * T + 13.5, 5, 2, .3, 0, 7); g.fill(); }
    if (!erSol(x + 1, y)) { g.fillStyle = 'rgba(140,180,230,.12)'; g.fillRect(x * T + T - 5, y * T, 5, T); }
    if (!erSol(x - 1, y)) { g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x * T, y * T, 6, T); }
    if (!erSol(x, y + 1)) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x * T, y * T + T - 8, T, 8); } });
  alle((x, y) => { if (erSol(x, y) && !erSol(x, y - 1)) topp(g, x, y, palAt(x, y)); });
  alle((x, y) => { if (erSol(x, y) && !erSol(x, y + 1)) heng(g, x, y, palAt(x, y)); });
  alle((x, y) => { if (tile(x, y) === ONE && !STAAL.has(x + ',' + y)) planke(g, x, y); });
  return c;
}
function hentChunk(cx, cy) {
  const key = cx + ',' + cy; let c = chunks.get(key);
  // den nye biten får dagens bildenummer før noe kastes, ellers ville den kastet seg selv når bufferen er full
  if (!c) { c = { cv: lagChunk(cx, cy), brukt: S.frame }; chunks.set(key, c);
    if (chunks.size > 32) { let eldst = null, min = Infinity; for (const [k, v] of chunks) if (v.brukt < min) { min = v.brukt; eldst = k; } chunks.delete(eldst); } }
  c.brukt = S.frame; return c.cv;
}

// ---------- skjerm ----------
let dpr = 1, cssW = 0, cssH = 0, grunnSkala = 1, skala = 1, lysC = nyC(2, 2), lysG = lysC.getContext('2d'), vign = null;
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2); cssW = innerWidth; cssH = innerHeight;
  if (!cssW || !cssH) return;
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  // stående mobil: litt nærmere, så montøren ikke blir for liten
  grunnSkala = cssH > cssW * 1.15 ? cssW / (T * 14) : Math.min(cssW / (T * 24), cssH / (T * 14));
  grunnSkala = clamp(Math.max(grunnSkala, cssH / (T * 45), cssW / (T * MW)), .45, 3);
  skala = grunnSkala * cam.zoom;
  const nr = clamp(grunnSkala * dpr, .75, 2);
  if (Math.abs(nr - chunkRes) > .15) { chunkRes = nr; chunks.clear(); }
  lysC = nyC(Math.ceil(cv.width / 3), Math.ceil(cv.height / 3)); lysG = lysC.getContext('2d');
  vign = nyC(cv.width / 2, cv.height / 2); const vg = vign.getContext('2d'), w = vign.width, h = vign.height;
  const gr = vg.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
  gr.addColorStop(0, 'rgba(0,0,8,0)'); gr.addColorStop(1, 'rgba(0,0,8,.6)'); vg.fillStyle = gr; vg.fillRect(0, 0, w, h);
  $('#snuTips').style.display = cssH > cssW ? '' : 'none';
  if (S.mode === 'snu' && cssW > cssH) lukkSnu();
  oppdaterKamera(0, true);
}
