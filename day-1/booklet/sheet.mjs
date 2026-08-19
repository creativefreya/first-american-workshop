/* Tiles ./thumbs into a single contact-sheet PNG. */
import { chromium } from 'playwright';
import fs from 'fs';
const files = fs.readdirSync('thumbs').filter(f => f.endsWith('.jpg')).sort();
const LABEL = { 0:'Cover',1:'Goals + agenda',2:'Activity tips',3:'Getting help',4:'How to use',62:'Before Day 2',63:'What to connect next' };
const ACT = { 37:'ACTIVITY 1', 38:'ACTIVITY 2', 48:'ACTIVITY 3', 60:'ACTIVITY 4', 61:'ACTIVITY 5' };
const cells = files.map((f, i) => `
  <figure class="${ACT[i] ? 'act' : ''}">
    <img src="thumbs/${f}"/>
    <figcaption><b>${i + 1}</b>${ACT[i] ? `<span class="tag">${ACT[i]}</span>` : LABEL[i] ? `<span>${LABEL[i]}</span>` : ''}</figcaption>
  </figure>`).join('');
const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
 body{margin:0;padding:38px 40px 46px;background:#f4f2f5;font-family:Sora,sans-serif;width:2200px}
 h1{font-size:30px;font-weight:600;color:#1b1633;margin:0 0 4px;letter-spacing:-.02em}
 p.sub{font-size:16px;color:#4c4668;margin:0 0 30px}
 .grid{display:grid;grid-template-columns:repeat(8,1fr);gap:16px 14px}
 figure{margin:0}
 img{width:100%;display:block;border:1px solid rgba(27,22,51,.14);border-radius:5px;background:#fff;
     box-shadow:0 5px 16px -10px rgba(40,38,55,.5)}
 .act img{border-color:#c25680;box-shadow:0 0 0 2px rgba(194,86,128,.28),0 5px 16px -10px rgba(40,38,55,.5)}
 figcaption{display:flex;gap:7px;align-items:baseline;margin-top:6px;font-size:11px;color:#6f6a88}
 figcaption b{font-family:'JetBrains Mono',monospace;font-size:11px;color:#1b1633}
 .tag{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.06em;color:#c25680}
</style>
<h1>First American — Day 1 booklet</h1>
<p class="sub">64 pages · A4 landscape · pink outlines are the five activity pages</p>
<div class="grid">${cells}</div>`;
fs.writeFileSync('sheet.html', html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2200, height: 1400 }, deviceScaleFactor: 1 });
await p.goto('file://' + process.cwd() + '/sheet.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1200);
await p.screenshot({ path: 'day-1-booklet-contact-sheet.png', fullPage: true });
await b.close();
console.log('sheet done');
