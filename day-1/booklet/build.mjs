/**
 * Builds the Day 1 participant booklet.
 *
 *   node build.mjs            # HTML + PDF
 *   node build.mjs --html     # HTML only
 *
 * Inputs:  ./slides/000.jpg … (captured from the running deck — see capture.mjs)
 *          ./content.js       (the words)
 * Outputs: ./day-1-booklet.html
 *          ./First-American-Day-1-Booklet.pdf
 *
 * A4 landscape throughout: one slide per page with a notes lane, activity pages
 * interleaved at the point in the run where the room actually does them.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as C from './content.js';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SLIDES = path.join(DIR, 'slides');
const htmlOnly = process.argv.includes('--html');

const files = fs
  .readdirSync(SLIDES)
  .filter((f) => f.endsWith('.jpg'))
  .sort();
if (!files.length) throw new Error(`No slide images in ${SLIDES} — run capture.mjs first.`);

const chapterFor = (i) =>
  [...C.chapters].reverse().find((c) => i >= c.from)?.name ?? '';

/* ── page helpers ───────────────────────────────────────────────────────── */

const esc = (s) => String(s).replace(/&(?![a-z#]+;)/g, '&amp;').replace(/</g, '&lt;');

const page = (cls, inner) => `<section class="page ${cls}">${inner}</section>`;

const runningHead = (left, right) =>
  `<header class="run"><span class="run-l">${left}</span><span class="run-r">${right}</span></header>`;

const ACT_COUNT = C.activities.length;

/* ── front matter ───────────────────────────────────────────────────────── */

const cover = page(
  'cover',
  `
  <div class="cover-grid" aria-hidden="true"></div>
  <div class="cover-rail">
    <p class="kicker">// Four chapters</p>
    <ol>${C.chapters.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ol>
  </div>
  <div class="cover-inner">
    <p class="kicker">// ${esc(C.meta.client)} · ${esc(C.meta.day)}</p>
    <h1>Becoming an<br/>Augmented Designer</h1>
    <p class="cover-sub">${esc(C.meta.subtitle)}</p>
    <div class="cover-foot">
      <div><span class="lbl">Facilitators</span>${esc(C.meta.facilitators)}</div>
      <div><span class="lbl">Your copy</span>Write in it. That is the point.</div>
    </div>
  </div>
  <div class="cover-mark">THE<br/><b>AUGMENTED<br/>DESIGNER</b></div>`
);

const goalsAgenda = page(
  'plain',
  `${runningHead('Before we start', 'Day 1')}
  <div class="two-col">
    <div>
      <p class="kicker">// Goals</p>
      <h2>What you walk out with</h2>
      <ul class="goals">${C.goals.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>
      <div class="callout">
        <p class="callout-t">One rule for the whole day</p>
        <p>If it isn't saved to a file, it's gone. Chat is working memory. Files are long-term memory.</p>
      </div>
    </div>
    <div>
      <p class="kicker">// Agenda</p>
      <h2>How the four hours run</h2>
      <table class="agenda">
        <thead><tr>${C.agenda.columns
          .map((c, i) => `<th class="${i < 3 ? 'tcol' : ''}">${esc(c)}</th>`)
          .join('')}</tr></thead>
        <tbody>${C.agenda.rows
          .map(
            (r) =>
              `<tr class="${r[3].includes('Break') ? 'is-break' : ''}">${r
                .map((cell, i) => `<td class="${i < 3 ? 'tcol' : ''}${i === 3 ? ' topic' : ''}${i === 4 ? ' owner' : ''}">${esc(cell)}</td>`)
                .join('')}</tr>`
          )
          .join('')}</tbody>
      </table>
    </div>
  </div>`
);

/* The board's "Workshop activity tips" frame, redrawn: FigJam stickies, the
   handwritten section labels, and the hand-drawn "Paste into Cursor" arrow.
   Vector rather than a screenshot of the frame, so it stays sharp in print.

   The "How to spot workshop activities" block is OUT — the intro paragraph
   already says it in prose. `activityTips.spotTitle` / `.spotExample` are still
   in content.js, so restoring it is one more <div class="tips-block"> here. */

const handArrow = (flip = false) => `
  <svg class="hand-arrow${flip ? ' flip' : ''}" viewBox="0 0 220 90" fill="none" aria-hidden="true">
    <path d="M212 12 C 205 46, 176 62, 132 66 C 96 69, 66 63, 40 52"
          stroke="#9d99a8" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M56 40 L 36 52 L 58 62" stroke="#9d99a8" stroke-width="2.4"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const fjSticky = (lines, author = 'Freya') => `
  <div class="fj">
    <p class="fj-t">Prompt for Cursor</p>
    ${lines.map((l) => (l ? `<p class="fj-l">${esc(l)}</p>` : '<p class="fj-gap"></p>')).join('')}
    <p class="fj-a">${esc(author)}</p>
  </div>`;

const tips = page(
  'plain tips',
  `${runningHead('Before we start', 'Workshop activity tips')}
  <div class="tips-head">
    <p class="kicker">// ${esc(C.activityTips.standfirst)}</p>
    <h2>${esc(C.activityTips.title)}</h2>
    <p class="body">${C.activityTips.spotBody}</p>
  </div>

  <div class="tips-body">
    <div class="tips-block">
      <div class="tb-left">
        <p class="hand-label">${esc(C.activityTips.stuckTitle)}</p>
        <div class="fj-row">${C.activityTips.stuckPrompts.map((t) => fjSticky([t])).join('')}</div>
      </div>
      <div class="tb-annot">
        <span class="hand-note">Paste into Cursor</span>
        ${handArrow()}
      </div>
    </div>
  </div>

  <div class="callout tips-note">
    <p class="callout-t">A note on pace</p>
    <p>You are not behind. Every activity has more in it than the time allows —
    do the first step properly rather than all of them badly.</p>
  </div>`
);

const helpPage = page(
  'plain',
  `${runningHead('Before we start', 'Getting help')}
  <div class="two-col">
    <div>
      <p class="kicker">// Nobody gets stuck quietly</p>
      <h2>${esc(C.help.title)}</h2>
      <h3>${esc(C.help.duringTitle)}</h3>
      <ol class="numsteps">${C.help.during.map((d) => `<li>${esc(d)}</li>`).join('')}</ol>
    </div>
    <div>
      ${C.help.blocks
        .map((b) => `<div class="callout"><p class="callout-t">${esc(b.title)}</p><p>${b.body}</p></div>`)
        .join('')}
    </div>
  </div>`
);

const contents = page(
  'plain',
  `${runningHead('Before we start', 'How to use this booklet')}
  <div class="two-col">
    <div>
      <p class="kicker">// What this is</p>
      <h2>Every slide, in order,<br/>with room to write</h2>
      <p class="body">One page per slide, in the order Freya presents them. The
      ${ACT_COUNT} hands-on activities sit at the point in the run where you actually do
      them — look for the pink pages.</p>
      <p class="body">You do not need to take notes to keep up. The notes lane is
      for the one thing on each slide you want to try on Monday.</p>
    </div>
    <div>
      <p class="kicker">// The ${ACT_COUNT} activities</p>
      <ol class="toc">${C.activities
        .map((a) => `<li><span class="toc-n">${a.n}</span>${esc(a.title)}</li>`)
        .join('')}</ol>
    </div>
  </div>`
);

/* ── slide + activity pages ─────────────────────────────────────────────── */

const slidePage = (file, i) =>
  page(
    'slide',
    `${runningHead(`Day 1 · ${esc(chapterFor(i))}`, `${i + 1} / ${files.length}`)}
    <div class="shot"><img src="slides/${file}" alt="Slide ${i + 1}"/></div>
    <div class="notes"><span class="notes-lbl">Notes</span><span class="rule"></span><span class="rule"></span></div>`
  );

/* Activity page. No prompt stickies — the steps ARE the activity, and anything
   extra on the page is something the room will try to do. `examples` (activity 1)
   and `script` (the automation) are Freya's own words, so they stay.

   An activity with `stepGroups` runs two step lists on one page: the first fills
   the left column under the goal, the second heads the right column. */
const stepBlock = (title, steps, subtitle) => `
  <p class="kicker">// ${esc(title)}</p>
  ${subtitle ? `<h3 class="step-sub">${esc(subtitle)}</h3>` : ''}
  <ol class="numsteps">${steps.map((st) => `<li>${st}</li>`).join('')}</ol>`;

const activityPage = (a) =>
  page(
    'activity',
    `${runningHead(`Activity ${a.n} of ${ACT_COUNT}`, 'Day 1')}
    <div class="act-grid">
      <div class="act-main">
        <div class="act-head"><span class="act-n">${a.n}</span><h2>${esc(a.title)}</h2></div>
        ${a.intro ? `<p class="act-intro">${esc(a.intro)}</p>` : ''}
        ${
          a.goal
            ? `<p class="act-goal"><span class="lbl">Goal</span>${esc(a.goal)}${
                a.goalRef ? ` <code>${esc(a.goalRef)}</code>` : ''
              }</p>`
            : ''
        }
        ${a.steps ? stepBlock(a.stepsTitle ?? 'Steps', a.steps) : ''}
        ${a.stepGroups ? stepBlock(a.stepGroups[0].title, a.stepGroups[0].steps, a.stepGroups[0].subtitle) : ''}
      </div>
      <div class="act-side">
        ${a.stepGroups?.[1] ? stepBlock(a.stepGroups[1].title, a.stepGroups[1].steps, a.stepGroups[1].subtitle) : ''}
        ${
          a.examples
            ? `<p class="kicker">// ${esc(a.examplesTitle)}</p>
               <ul class="act-examples">${a.examples.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>`
            : ''
        }
        ${
          a.script
            ? `<p class="kicker">// Agent instructions — copy this in</p>
               <div class="script">${esc(a.script)}</div>`
            : ''
        }
      </div>
    </div>
    <div class="act-notes"><span class="notes-lbl">What I tried</span>
      <span class="rule"></span><span class="rule"></span>
      <span class="rule"></span><span class="rule"></span></div>`
  );

/* Interleave: activity pages fall immediately after their `after` slide index. */
const body = [cover, goalsAgenda, tips, helpPage, contents];
files.forEach((f, i) => {
  body.push(slidePage(f, i));
  C.activities.filter((a) => a.after === i).forEach((a) => body.push(activityPage(a)));
});

/* Any activity anchored past the last slide still gets a page. */
C.activities
  .filter((a) => a.after >= files.length)
  .forEach((a) => body.push(activityPage(a)));

const closing = page(
  'plain closing',
  `${runningHead('That was Day 1', 'See you tomorrow')}
  <div class="two-col">
    <div>
      <p class="kicker">// Before Day 2</p>
      <h2>Three things worth<br/>ten minutes tonight</h2>
      <ol class="numsteps">
        <li>Open your product brain and add one thing you know that isn't written down anywhere.</li>
        <li>Authenticate the other three MCPs — Miro, Slack, Figma. Same screen, same four steps.</li>
        <li>Run the skill you wrote once more, on a different project, and fix the line that didn't work.</li>
      </ol>
    </div>
    <div>
      <div class="callout">
        <p class="callout-t">Tomorrow</p>
        <p><strong>Day 2 — From idea to pull request.</strong> The anatomy of a full stack app,
        the 70-20-10 rule, vibe coding with guardrails, and shipping a real pull request.</p>
      </div>
      <div class="act-notes"><span class="notes-lbl">Questions for tomorrow</span>
        <span class="rule"></span><span class="rule"></span><span class="rule"></span><span class="rule"></span></div>
    </div>
  </div>`
);
body.push(closing);

/* Final reference page — what to wire into Cursor after the day. Deliberately
   last: it is a lookup, not part of the run. Tools are First American's approved
   stack only (see DELIVERY-CONSTRAINTS.md). */
const K = C.connections;
const connectPage = page(
  'plain connect',
  `${runningHead('Appendix', 'What to connect next')}
  <div class="conn-head">
    <p class="kicker">// ${esc(K.kicker)}</p>
    <h2>${esc(K.title)}</h2>
    <p class="body">${esc(K.standfirst)}</p>
  </div>
  <div class="conn-body">
    <table class="conn">
      <thead><tr>${K.columns
        .map((c, i) => `<th class="${['c-tool', 'c-via', 'c-what'][i]}">${esc(c)}</th>`)
        .join('')}</tr></thead>
      <tbody>${K.rows
        .map(
          (r) =>
            `<tr>
              <td class="c-tool">${esc(r[0])}</td>
              <td class="c-via"><span class="tag tag-${r[1].toLowerCase()}">${esc(r[1])}</span></td>
              <td class="c-what">${esc(r[2])}</td>
            </tr>`
        )
        .join('')}</tbody>
    </table>
    <div class="conn-side">
      <div class="callout">
        <p class="callout-t">${esc(K.explainer.title)}</p>
        <p>${K.explainer.mcp}</p>
        <p class="callout-gap">${K.explainer.api}</p>
      </div>
      <p class="conn-caveat">${esc(K.caveat)}</p>
    </div>
  </div>`
);
body.push(connectPage);

/* ── styles ─────────────────────────────────────────────────────────────── */

const css = `
:root{
  --ink:#1b1633; --ink-soft:#4c4668; --ink-muted:#6f6a88;
  --pink:#c25680; --purple:#9a5bb0; --teal:#0b9e8a; --blue:#4b64c4; --gold:#b9892a;
  --card:#fff; --border:rgba(27,22,51,0.12); --wash:#faf9fb;
  --display:'Clash Display','Space Grotesk',sans-serif;
  --body:'Sora',sans-serif; --pixel:'Press Start 2P',monospace;
  --mono:'JetBrains Mono',ui-monospace,monospace;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#e9e7ec}
body{font-family:var(--body);color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}

@page{size:A4 landscape;margin:0}
.page{
  position:relative;width:297mm;height:210mm;padding:13mm 15mm 11mm;
  background:linear-gradient(to top,#edebf0 0%,#fdfdfe 100%);
  overflow:hidden;page-break-after:always;break-after:page;
  display:flex;flex-direction:column;
}
.page:last-child{page-break-after:auto;break-after:auto}
@media screen{ .page{margin:0 auto 8mm;box-shadow:0 6px 28px -12px rgba(40,38,55,.4)} }

/* running head */
.run{display:flex;justify-content:space-between;align-items:baseline;
  font-family:var(--pixel);font-size:6pt;letter-spacing:.13em;text-transform:uppercase;
  color:var(--ink-muted);padding-bottom:3.2mm;margin-bottom:4mm;
  border-bottom:1px solid var(--border);flex:0 0 auto}
.run-l{color:var(--pink)}

.kicker{font-family:var(--pixel);font-size:6.4pt;letter-spacing:.13em;text-transform:uppercase;
  color:var(--pink);margin-bottom:3mm;line-height:1.7}
h2{font-family:var(--display);font-size:29pt;font-weight:600;letter-spacing:-.02em;line-height:1.06;margin-bottom:4mm}
h3{font-family:var(--display);font-size:15pt;font-weight:600;letter-spacing:-.01em;margin:0 0 2.5mm}
.body{font-size:11.4pt;line-height:1.6;color:var(--ink-soft);margin-bottom:5mm;max-width:52ch}
.lbl{display:block;font-family:var(--pixel);font-size:5.8pt;letter-spacing:.12em;
  text-transform:uppercase;color:var(--ink-muted);margin-bottom:1.6mm}
code{font-family:var(--mono);font-size:.86em;background:rgba(154,91,176,.10);
  border-radius:3px;padding:.5mm 1.2mm;color:var(--purple);word-break:break-word}

.two-col{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:15mm;align-content:center}

/* cover */
.cover{padding:0;justify-content:flex-end}
.cover-grid{position:absolute;inset:0;
  background-image:linear-gradient(rgba(205,162,238,.34) 1px,transparent 1px),
    linear-gradient(90deg,rgba(205,162,238,.34) 1px,transparent 1px);
  background-size:14mm 14mm;
  -webkit-mask-image:linear-gradient(105deg,rgba(0,0,0,.9),transparent 72%);
  mask-image:linear-gradient(105deg,rgba(0,0,0,.9),transparent 72%)}
.cover-inner{position:relative;padding:0 20mm 20mm}
.cover h1{font-family:var(--display);font-size:47pt;font-weight:600;letter-spacing:-.03em;
  line-height:1.0;margin:2mm 0 6mm}
.cover-sub{font-size:14pt;color:var(--ink-soft);max-width:62%;line-height:1.45}
.cover-foot{display:flex;gap:22mm;margin-top:14mm;padding-top:6mm;
  border-top:1px solid var(--border);font-size:9pt;color:var(--ink-soft)}
.cover-rail{position:absolute;top:20mm;left:20mm;right:20mm}
.cover-rail ol{list-style:none;counter-reset:cr;display:flex;gap:0;
  border-top:1px solid var(--border)}
.cover-rail li{counter-increment:cr;flex:1;padding:5mm 5mm 0 0;
  font-family:var(--display);font-size:11.5pt;font-weight:500;line-height:1.25;color:var(--ink-soft)}
.cover-rail li::before{content:'0' counter(cr);display:block;font-family:var(--mono);
  font-size:8pt;color:var(--pink);margin-bottom:2.5mm}
.cover-mark{position:absolute;right:20mm;bottom:20mm;text-align:right;
  font-family:var(--pixel);font-size:6pt;line-height:1.9;letter-spacing:.14em;color:var(--purple);opacity:.5}
.cover-mark b{font-size:8.4pt;letter-spacing:.1em}

/* goals + agenda */
.goals{list-style:none;margin-bottom:6mm}
.goals li{position:relative;padding-left:8.5mm;margin-bottom:4.4mm;font-size:13pt;line-height:1.4}
.goals li::before{content:'';position:absolute;left:0;top:2.2mm;width:4mm;height:4mm;
  border-radius:1mm;background:linear-gradient(135deg,var(--purple),var(--pink))}

.agenda{width:100%;border-collapse:collapse;font-size:10.4pt}
.agenda th{font-family:var(--pixel);font-size:5.6pt;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-muted);text-align:left;padding:0 2mm 3mm;border-bottom:1px solid var(--border)}
.agenda td{padding:3.6mm 2mm;border-bottom:1px solid rgba(27,22,51,.07);vertical-align:top}
.agenda .tcol{font-family:var(--mono);font-size:9.4pt;color:var(--ink-muted);white-space:nowrap}
.agenda .topic{font-weight:600;color:var(--ink)}
.agenda .owner{white-space:nowrap}
.agenda tr.is-break td{color:var(--teal)}
.agenda tr.is-break .topic{color:var(--teal)}

.callout{background:var(--card);border:1px solid var(--border);border-left:2.6mm solid var(--pink);
  border-radius:2.5mm;padding:5.5mm 6mm;margin-bottom:5.5mm;
  box-shadow:0 8px 24px -18px rgba(40,38,55,.5)}
.callout-t{font-family:var(--display);font-size:12.5pt;font-weight:600;margin-bottom:2.2mm}
.callout p{font-size:10.6pt;line-height:1.55;color:var(--ink-soft)}
.connect .callout{padding:5mm 5.5mm;margin-bottom:5mm}
.connect .callout p{font-size:9.8pt;line-height:1.5}

.numsteps{list-style:none;counter-reset:s}
.numsteps li{counter-increment:s;position:relative;padding-left:10.5mm;margin-bottom:4.6mm;
  font-size:11.6pt;line-height:1.5}
.numsteps li::before{content:counter(s);position:absolute;left:0;top:.2mm;
  width:7mm;height:7mm;border-radius:50%;border:1px solid var(--pink);color:var(--pink);
  font-family:var(--mono);font-size:8.4pt;display:flex;align-items:center;justify-content:center}

.toc{list-style:none;counter-reset:t}
.toc li{display:flex;gap:5mm;align-items:baseline;padding:4mm 0;
  border-bottom:1px solid rgba(27,22,51,.07);font-size:12pt;line-height:1.35}
.toc-n{font-family:var(--mono);font-size:10pt;color:var(--pink);flex:0 0 6mm}

/* slide pages */
.slide .shot{flex:1;display:flex;align-items:center;justify-content:center;min-height:0}
.slide .shot img{max-width:100%;max-height:100%;width:auto;height:auto;
  border:1px solid var(--border);border-radius:3mm;
  box-shadow:0 14px 40px -24px rgba(40,38,55,.55)}
.notes{flex:0 0 auto;display:flex;flex-direction:column;gap:5.5mm;padding-top:6mm}
.notes-lbl{font-family:var(--pixel);font-size:5.6pt;letter-spacing:.12em;text-transform:uppercase;
  color:var(--ink-muted)}
.rule{display:block;height:1px;background:rgba(27,22,51,.14)}

/* "Workshop activity tips" — the board frame redrawn */
.tips{padding-bottom:8mm}
.tips-head{flex:0 0 auto;max-width:150mm}
.tips .body{margin-bottom:0;max-width:150mm;font-size:10.2pt}
.tips-body{flex:1;display:flex;flex-direction:column;justify-content:center;gap:8mm;padding:4mm 0}
.tips-block{display:grid;grid-template-columns:auto auto;justify-content:start;gap:0;align-items:end}
.hand-label{font-family:'Architects Daughter',cursive;font-size:12.5pt;letter-spacing:.03em;
  text-transform:uppercase;color:var(--ink);margin-bottom:3.4mm}
.fj-row{display:flex;gap:6mm;align-items:stretch}
.fj{background:#a4d6ff;border-radius:1mm;padding:4.2mm 5mm 3.2mm;width:72mm;
  display:flex;flex-direction:column;box-shadow:2mm 2mm 0 rgba(27,22,51,.055)}
.fj-t{font-family:var(--body);font-size:9.6pt;font-weight:600;color:#12233c;margin-bottom:3.5mm}
.fj-l{font-size:9.8pt;line-height:1.45;color:#12233c;word-break:break-word}
.fj-gap{height:2.4mm}
.fj-a{margin-top:auto;padding-top:4mm;font-size:7.2pt;color:rgba(18,35,60,.5)}
.tb-annot{position:relative;width:92mm;height:100%;min-height:34mm}
.hand-note{position:absolute;right:2mm;top:0;font-family:'Caveat',cursive;font-size:24pt;
  color:var(--ink);white-space:nowrap}
.hand-arrow{position:absolute;right:6mm;top:10mm;width:84mm;height:26mm}
.tips-note{flex:0 0 auto;margin-bottom:0;padding:4.4mm 5mm}
.tips-note .callout-t{font-size:11pt;margin-bottom:1.6mm}
.tips-note p{font-size:9.8pt}

/* appendix — what to connect next */
.conn-head{flex:0 0 auto;max-width:190mm}
.connect .body{margin-bottom:0;font-size:10pt;max-width:185mm}
.conn-body{flex:1;display:grid;grid-template-columns:1.55fr 1fr;gap:12mm;align-content:center;padding:4mm 0;min-height:0}
.conn{width:100%;border-collapse:collapse;font-size:9.4pt}
.conn th{font-family:var(--pixel);font-size:5.4pt;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-muted);text-align:left;padding:0 3mm 3mm 0;border-bottom:1px solid var(--border)}
.conn td{padding:2.6mm 3mm 2.6mm 0;border-bottom:1px solid rgba(27,22,51,.07);vertical-align:top}
.conn td.c-tool{font-weight:600;white-space:nowrap}
.conn th.c-tool{width:32mm}
.conn th.c-via{width:17mm}
.conn td.c-what{color:var(--ink-soft);line-height:1.42;font-size:9pt}
.tag{display:inline-block;font-family:var(--mono);font-size:7.4pt;letter-spacing:.04em;
  padding:.9mm 2.2mm;border-radius:1.2mm}
.tag-mcp{background:rgba(11,158,138,.13);color:#08776a;border:1px solid rgba(11,158,138,.30)}
.tag-api{background:rgba(224,86,31,.11);color:#c2481a;border:1px solid rgba(224,86,31,.28)}
.conn-side{display:flex;flex-direction:column;justify-content:center}
.callout-gap{margin-top:3.2mm}
.conn-caveat{font-size:9.4pt;line-height:1.5;color:var(--ink-muted);padding-left:4mm;
  border-left:1px solid var(--border)}

/* activity pages */
.activity{background:linear-gradient(to top,#f6ecf1 0%,#fdfbfc 100%)}
.act-grid{flex:1;display:grid;grid-template-columns:1.12fr 1fr;gap:14mm;align-content:start;min-height:0}
.act-side{display:flex;flex-direction:column}
.act-head{display:flex;gap:5mm;align-items:flex-start;margin-bottom:4mm}
.act-n{flex:0 0 auto;width:13.5mm;height:13.5mm;border-radius:3.2mm;
  background:linear-gradient(135deg,var(--purple),var(--pink));color:#fff;
  font-family:var(--display);font-size:20pt;font-weight:600;
  display:flex;align-items:center;justify-content:center}
.act-head h2{font-size:25pt;margin:0;padding-top:1mm}
.act-goal{background:var(--card);border:1px solid var(--border);border-radius:2.5mm;
  padding:5mm 5.5mm;margin-bottom:6mm;font-size:11pt;line-height:1.55;color:var(--ink-soft)}
.step-sub{font-size:13pt;margin:-1mm 0 3.5mm}
.act-intro{font-size:11.6pt;line-height:1.55;color:var(--ink-soft);margin-bottom:5mm;max-width:52ch}
.act-examples{list-style:none;margin-bottom:5mm}
.act-examples li{position:relative;padding-left:6.5mm;margin-bottom:4mm;font-size:11pt;line-height:1.5;
  color:var(--ink-soft)}
.act-examples li::before{content:'';position:absolute;left:0;top:2.4mm;width:2.6mm;height:2.6mm;
  border-radius:50%;background:var(--pink)}
.act-note{font-size:10.4pt;color:var(--ink-muted);font-style:italic;margin-top:3mm}
.script{background:#17142b;color:#e6e2f2;border-radius:2.5mm;padding:4.5mm 5mm;
  font-family:var(--mono);font-size:8.4pt;line-height:1.62;white-space:pre-wrap;
  margin-bottom:4.5mm;box-shadow:0 10px 28px -18px rgba(23,20,43,.8)}
.act-notes{flex:0 0 auto;display:flex;flex-direction:column;gap:7mm;padding-top:7mm;
  border-top:1px solid rgba(27,22,51,.10)}
.closing h2{font-size:26pt}
`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>${esc(C.meta.client)} — ${esc(C.meta.course)} — Day 1 booklet</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@500;600&family=Press+Start+2P&family=Sora:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet"/>
<style>${css}</style></head><body>${body.join('\n')}</body></html>`;

const outHtml = path.join(DIR, 'day-1-booklet.html');
fs.writeFileSync(outHtml, html);
console.log(`html  → ${outHtml}  (${body.length} pages, ${files.length} slides)`);

if (!htmlOnly) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const p = await browser.newPage();
  await p.goto('file://' + outHtml, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(1200);
  const pdf = path.join(DIR, 'First-American-Day-1-Booklet.pdf');
  await p.pdf({ path: pdf, width: '297mm', height: '210mm', printBackground: true });
  await browser.close();
  console.log(`pdf   → ${pdf}  (${(fs.statSync(pdf).size / 1e6).toFixed(1)} MB)`);
}
