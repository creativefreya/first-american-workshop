import { chromium } from 'playwright';
import path from 'path';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
await p.goto('file://' + path.resolve('day-1-booklet.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);
const bad = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.page').forEach((pg, i) => {
    if (pg.scrollHeight > pg.clientHeight + 2 || pg.scrollWidth > pg.clientWidth + 2)
      out.push({ i, cls: pg.className, sh: pg.scrollHeight, ch: pg.clientHeight, sw: pg.scrollWidth, cw: pg.clientWidth });
    // also flag inner overflow
    pg.querySelectorAll('.two-col, .act-grid').forEach((g) => {
      if (g.scrollHeight > g.clientHeight + 2) out.push({ i, cls: 'INNER ' + g.className, sh: g.scrollHeight, ch: g.clientHeight });
    });
  });
  return out;
});
console.log(JSON.stringify(bad, null, 1));
const imgs = await p.evaluate(() => [...document.images].filter(im => !im.complete || im.naturalWidth === 0).map(im => im.getAttribute('src')));
console.log('broken images:', JSON.stringify(imgs));
await b.close();
