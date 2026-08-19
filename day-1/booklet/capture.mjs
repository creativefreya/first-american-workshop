/**
 * Captures the Day 1 slides straight out of the running deck.
 *
 *   1. start the deck:  npm --prefix ../First-American-2-Day-Training run dev   (port 5180)
 *   2. node capture.mjs ./raw 52
 *   3. downscale to JPEG for the booklet:
 *        for f in raw/*.png; do sips -Z 2400 -s format jpeg -s formatOptions 92 \
 *          "$f" --out "slides/$(basename ${f%.png}).jpg"; done
 *   4. node build.mjs
 *
 * Day 1 is the first 52 slides of SLIDE_ORDER — everything up to (not including)
 * virtual 191, "Day 2: From Idea To Pull Request". Re-derive the count after any
 * reorder in App.tsx rather than trusting this number.
 *
 * The deck has no URL routing, so navigation is ArrowRight and the wait per slide
 * is what lets framer-motion settle before the shot.
 */

import { chromium } from 'playwright';
import fs from 'fs';

const OUT = process.argv[2] ?? './raw';
const COUNT = parseInt(process.argv[3] ?? '52', 10);
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 2,
});
await page.goto('http://localhost:5180/', { waitUntil: 'networkidle' });
await page.waitForSelector('.slide-container');
// Presenter chrome is not part of the slide: drop the nav footer and the
// light/dark toggle (which has no class of its own — hence the aria-label).
await page.addStyleTag({
  content: '.nav-footer{display:none!important} button[aria-label*="Switch to"]{display:none!important}',
});
await page.waitForTimeout(3000);

for (let i = 0; i < COUNT; i++) {
  await page.waitForTimeout(2600);
  const el = await page.$('.slide-container');
  await el.screenshot({ path: `${OUT}/${String(i).padStart(3, '0')}.png` });
  process.stdout.write(`captured ${i}\n`);
  if (i < COUNT - 1) await page.keyboard.press('ArrowRight');
}
await browser.close();
