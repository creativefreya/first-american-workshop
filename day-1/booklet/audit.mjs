/**
 * Two checks, because one of them was not enough.
 *
 *   node audit.mjs
 *
 * 1. DOM — does any page's content overflow its 297x210mm box, and are all the
 *    slide images actually loading.
 * 2. PDF — do the text pages still have text in them.
 *
 * Check 2 exists because of a real bug: `.conn-body` was `flex:1` with
 * `min-height:0`, which lays out correctly on screen and collapses to zero
 * height in Chromium's print renderer. The appendix table vanished from the PDF
 * while every HTML preview looked perfect. Screen rendering is not evidence
 * about the PDF — so this checks the PDF.
 *
 * Needs pdftotext (poppler) for check 2; it is skipped with a warning if absent.
 */

import { chromium } from 'playwright';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as C from './content.js';

// fileURLToPath, not URL.pathname — the repo path has a space in it, and the
// percent-encoded form breaks every fs call downstream.
const DIR = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(DIR, 'day-1-booklet.html');
const PDF = path.join(DIR, 'First-American-Day-1-Booklet.pdf');

/* Text pages are everything that is not a slide screenshot: the five front
   pages, each activity, the closing page and the appendix. Derived the same way
   build.mjs interleaves them, so it stays right when an activity moves. */
const slideCount = fs.readdirSync(path.join(DIR, 'slides')).filter((f) => f.endsWith('.jpg')).length;
const textPages = [1, 2, 3, 4, 5];
let pg = 5;
for (let i = 0; i < slideCount; i++) {
  pg++;
  C.activities.filter((a) => a.after === i).forEach(() => textPages.push(++pg));
}
textPages.push(pg + 1, pg + 2); // closing, appendix

/* A page carrying real copy runs to several hundred characters. A slide page is
   about forty (running head + "Notes"), so 250 separates them with room to
   spare without being so tight that a short activity trips it. */
const MIN_CHARS = 250;

/* ── 1. DOM ─────────────────────────────────────────────────────────────── */

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('file://' + HTML, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);

const overflow = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.page').forEach((pg, i) => {
    if (pg.scrollHeight > pg.clientHeight + 2 || pg.scrollWidth > pg.clientWidth + 2)
      out.push({ page: i + 1, cls: pg.className, sh: pg.scrollHeight, ch: pg.clientHeight });
    pg.querySelectorAll('.two-col, .act-grid, .conn-body, .tips-body').forEach((g) => {
      if (g.scrollHeight > g.clientHeight + 2)
        out.push({ page: i + 1, cls: 'INNER ' + g.className, sh: g.scrollHeight, ch: g.clientHeight });
    });
  });
  return out;
});
const broken = await page.evaluate(() =>
  [...document.images].filter((im) => !im.complete || im.naturalWidth === 0).map((im) => im.getAttribute('src'))
);
await browser.close();

console.log(overflow.length ? `OVERFLOW: ${JSON.stringify(overflow, null, 1)}` : 'overflow: none');
console.log(broken.length ? `BROKEN IMAGES: ${JSON.stringify(broken)}` : 'images: all loaded');

/* ── 2. PDF ─────────────────────────────────────────────────────────────── */

if (!fs.existsSync(PDF)) {
  console.log('pdf: not built yet — run `node build.mjs` to include the PDF check');
} else {
  let empty;
  try {
    empty = textPages
      .map((p) => {
        const txt = execFileSync('pdftotext', ['-f', String(p), '-l', String(p), PDF, '-'], {
          encoding: 'utf8',
        });
        return { page: p, chars: txt.replace(/\s/g, '').length };
      })
      .filter((r) => r.chars < MIN_CHARS);
  } catch (err) {
    console.log(`pdf: skipped (${err.code === 'ENOENT' ? 'pdftotext not installed' : err.message})`);
    empty = null;
  }
  if (empty)
    console.log(
      empty.length
        ? `PDF PAGES MISSING CONTENT: ${JSON.stringify(empty)}\n  ` +
            `These render on screen but came out near-empty in the PDF. Usually a\n  ` +
            `flex/grid container that collapses under print layout.`
        : `pdf: all ${textPages.length} text pages carry content`
    );
}
