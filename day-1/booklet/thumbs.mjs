/* Screenshots every booklet page to ./thumbs/NNN.jpg for a contact-sheet preview. */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
fs.mkdirSync('thumbs', { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 850 }, deviceScaleFactor: 1 });
await p.goto('file://' + path.resolve('day-1-booklet.html'), { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(2000);
const pages = await p.$$('.page');
for (let i = 0; i < pages.length; i++) {
  await pages[i].screenshot({ path: `thumbs/${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 72 });
}
console.log('thumbs:', pages.length);
await b.close();
