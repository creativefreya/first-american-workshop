# Day 1 participant booklet

`First-American-Day-1-Booklet.pdf` — A4 landscape, 64 pages. Every Day 1 slide in
running order, one per page with a notes lane, plus the housekeeping pages and
the six hands-on activities dropped in where the room actually does them.

## What's in it

| Pages | What |
|---|---|
| 1 | Cover |
| 2 | Goals + agenda (PDT / HST / AU, transcribed from the FigJam board) |
| 3 | Workshop activity tips — how to spot a "Prompt for Cursor" sticky |
| 4 | How to get help if you get stuck |
| 5 | How to use the booklet + the five activities |
| 6–62 | The 52 Day 1 slides, with the five activity pages interleaved (38, 39, 49, 61, 62) |
| 63 | Before Day 2 |
| 64 | Appendix — what to connect next (MCP vs API, First American's approved stack) |

Activities land after these Day 1 slide indices: 1 and 2 → 31 (Explore the AI
Brain), 3 → 40 (Create a SKILL.md), 4 and 5 → 51 (Build automations). Two
activities sharing an `after` just stack in array order, which is how 1/2 and 4/5
run back to back. All five sit directly behind one of the deck's Activity cards.

Activity 4 carries `stepGroups` rather than `steps` — two numbered lists on one
page (find the product folder, then connect the Atlassian MCP). The first group
fills the left column, the second heads the right one.

## Rebuilding it

Copy edits only need `node build.mjs` — the captures are checked in. A **deck**
change means a recapture, which needs the deck itself (it lives in the private
Augmented Designer repo, at `.../workshop-materials/First-American-2-Day-Training`).
From this folder:

```bash
npm --prefix ../First-American-2-Day-Training run dev   # port 5180, leave running
node capture.mjs ./raw 52
for f in raw/*.png; do sips -Z 2400 -s format jpeg -s formatOptions 92 "$f" \
  --out "slides/$(basename ${f%.png}).jpg"; done
node build.mjs
```

`node build.mjs --html` skips the PDF when you only want to eyeball the layout.
`node audit.mjs` runs two checks and you want both: page overflow in the DOM,
**and** whether the PDF's text pages still contain text. Run it after every copy
edit. The second check is not paranoia — see Gotchas.

## Files

| File | What |
|---|---|
| `content.js` | All the words — goals, agenda, tips, help, the activities. Edit here. |
| `build.mjs` | Page templates + CSS. Emits `day-1-booklet.html`, then the PDF. |
| `capture.mjs` | Screenshots the running deck. |
| `audit.mjs` | Overflow + broken-image check. |
| `preview.mjs` | Screenshots individual booklet pages for a visual check. |
| `slides/` | The captured slides, 2400px JPEG. Committed here, so copy edits re-render without touching the deck. |

## Gotchas

- **Day 1 is the first 52 entries of `SLIDE_ORDER`.** `App.tsx` builds that array
  through a long chain of splices — don't count by hand, re-run the array and take
  everything before virtual `191`.
- **Requires playwright.** Not a dependency of this folder; run from anywhere it
  resolves, or `npm i playwright && npx playwright install chromium` first.
- **Activity numbering and "Activity N of X" are derived** from the length of the
  `activities` array. Adding or merging one needs no other edit.
- **Screen rendering is not evidence about the PDF.** `.conn-body` was once
  `flex:1` with `min-height:0`. Correct on screen, collapsed to zero height in
  Chromium's print renderer — the entire appendix table vanished from the PDF
  while every HTML preview looked perfect. Avoid `flex:1` + `min-height:0` on a
  container that has to survive print, and check the built PDF, not the page:
  `pdftoppm -png -r 100 -f N -l N <pdf> /tmp/pg`.
- **The PDF is ~22 MB.** That's the 52 slide screenshots. Dropping the JPEG
  quality in step 3 is the lever if it needs to be smaller for email.
