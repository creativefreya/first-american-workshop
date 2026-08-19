import { chromium } from 'playwright';
import path from 'path';
const idxs = process.argv.slice(2).map(Number);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1.4 });
await p.goto('file://' + path.resolve('day-1-booklet.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);
const n = await p.$$eval('.page', els => els.length);
console.log('pages:', n);
for (const i of idxs) {
  const el = (await p.$$('.page'))[i];
  if (!el) { console.log('no page', i); continue; }
  await el.screenshot({ path: '/private/tmp/pv-' + String(i).padStart(3,'0') + '.png' });
}
await b.close();
