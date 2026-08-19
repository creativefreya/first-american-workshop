# First American CRM — a reference build for a real estate professional

A working CRM built in the First American design system, for
Session 2 of the First American workshop.

**Everything in it is fictional.** The agent, the clients, the properties and
the file numbers are invented. The *design tokens* and the *customer jobs* are
real, and both come from the First American product brain repo.

---

## Run it

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

**Do not open `index.html` by double-clicking.** The app loads its data with
`fetch()`, and browsers block `fetch()` on `file://` URLs. You will get a blank
screen with an unhelpful console error. The app detects this and tells you, but
it is the first thing that goes wrong for everyone.

No Node, no npm, no build step. Deploy by dragging this folder onto
[netlify.com](https://netlify.com).

---

## Who it is for

**Marisol Reyes**, a broker associate in Santa Ana, California — First
American's home city.

The features exist because of specific jobs in
`docs/customer/jobs-to-be-done.md` in the product brain repo:

| Job | Where it shows up |
|---|---|
| **P1** — Keep my deal moving | Risk flags, the stalled indicator, the row edge marker, the "needs attention" tile |
| **P2** — Look competent to my client | Notes per transaction, the transaction team panel, copy-email actions |
| **P3** — Know where every deal stands without chasing | The dashboard, the stage progress track, the activity timeline |
| **C4** — Not lose my money to fraud | The **wire instructions unverified** risk flag, which is the flag most likely to be on when you open the app |

Worth repeating what that file says about itself: **those jobs are inferred
from First American's public website, not from research.** They are hypotheses.
This app is built on hypotheses, and if the hypotheses are wrong, so is the
app. That is a feature of being honest about where requirements come from, not
a defect to hide.

---

## Three screens

**Dashboard · Contacts · Tasks.**

The dashboard is a read-only summary: four numbers and two charts, no
record-level rows. Contacts and Tasks are the working screens.

**Known consequence, stated plainly:** with no transactions list, individual
transactions are only reachable through a contact's file-number link or a
task's linked transaction. There is no screen that lists all twenty-seven. If
that turns out to matter, the fix is a Transactions route — the drawer, the
form and the data layer are all still there and unchanged.

The top bar's primary action follows the screen — **New transaction** on the
dashboard, **New contact** on contacts, **New task** on tasks. That comes from
the route definition in `src/main.js`, not from the shell: add a route, give it
an `action`, and the top bar updates itself.

## How it is put together

```
index.html                 every stylesheet, listed in cascade order
src/
├── main.js                entry point. Loads data, builds the shell, starts the router.
├── data/
│   └── seed.json          THE FAKE DATABASE — 27 transactions, 21 contacts, 17 tasks
├── lib/
│   ├── dom.js             el() — the one rendering primitive. Read this first.
│   ├── api.js             THE BOUNDARY. getDeals, addDeal, updateDeal, deleteDeal.
│   ├── store.js           the only file that knows localStorage exists
│   ├── domain.js          what the words mean: stages, risks, roles, sources
│   ├── router.js          hash routing, ~60 lines
│   ├── format.js          every date and number in the UI passes through here
│   └── csv.js             export
├── components/            THE DESIGN SYSTEM — knows nothing about real estate
│   ├── Button · Pill · Avatar · Field · Icon
│   ├── DataTable · Toolbar · StatCard · BarChart
│   ├── Drawer · Modal · Overlay · Toast · Tabs
│   └── EmptyState · Timeline · ProgressTrack · AppShell
├── views/                 THE FEATURES — know all about real estate
│   ├── DashboardView · ContactsView · TasksView
│   └── DealDrawer · DealForm · ContactForm · TaskForm
└── styles/
    ├── tokens.css         the design tokens, in three layers
    ├── base.css           reset and element defaults
    └── app.css            page layout primitives
```

### The rule that matters most

**The front end never touches the data directly. It asks.**

Every view calls functions in `src/lib/api.js`. Not one of them knows the data
lives in a JSON file and a browser key, or whether there is a server at all.
Swap the insides of those functions for `fetch('/api/deals')` and nothing else
in the app changes by a single character.

That is what "back end" means, and it is why this is something you can keep
working on rather than something you eventually rewrite.

### The rule that matters second most

**`components/` knows nothing about real estate. `views/` knows everything about it.**

`Pill` takes a *tone*, not a colour, and has never heard of escrow.
`DashboardView` decides that a stalled transaction is amber. Keep that line and
the design system stays reusable; blur it and you get a `<StagePill>` that
cannot be used anywhere except on deals.

### Tokens, in three layers

`src/styles/tokens.css`:

1. **First American brand tokens** — mirrored from the product brain. Colour,
   type, breakpoints. Provisional: extracted from the public marketing site,
   not the product design system.
2. **Product tokens (ours)** — the brand set gives no spacing scale, no
   elevation, no component specs and no dark mode. A product needs all of
   those, so we defined them and kept them separate, so nobody mistakes our
   decisions for First American's.
3. **Semantic aliases** — `--surface`, `--text-muted`, `--border-strong`.
   Components use only these. Replace layer 1 with the real design system and
   only layer 3 changes.

---

## Decisions you might reasonably question

**No framework.** No build step means no Node dependency, which matters on a
locked-down machine, and it means deploying is dragging a folder. It also keeps
a pull request diff readable: you review the change, not JSX plus hooks plus
types at the same time. The honest counter is that React is what the industry
uses — true, and the answer is that the component boundary is the idea and
React is one implementation of it.

**Types as JSDoc comments.** Editors and Cursor get full type-checking and
autocomplete, with zero syntax a beginner has not seen and zero build step. The
types are comments; you can ignore them while reading a diff.

**A real `<table>`.** Screen readers announce "row 4 of 28, column Closing" for
free. Rebuilding that with ARIA on a grid of divs is a lot of attributes to get
subtly wrong.

**No charting library.** Two charts, both categorical, both under a dozen bars.
A bar is a box with a width and CSS already draws those. Install a library the
moment there is a real axis, a time series or zooming.

**Whole-database writes.** Simpler to reason about at this size, and there is
no way to end up with a deal saved and its task lost. Revisit when the data is
big enough for the serialise cost to show up, which for a few hundred records
it is not.

**`el()` rebuilds subtrees instead of diffing them.** A few hundred rows, not a
few hundred thousand. If a view ever gets slow, that is the moment to reach for
something smarter, and not before.

---

## Things that broke while building it

Left here because they are the interesting part, and because at least two of
them will happen to you.

- **Escape stopped closing the drawer** after any save. The keydown listener
  was on the overlay; re-rendering the drawer body destroyed the focused
  element, focus fell back to `<body>`, and `<body>` is not inside the overlay.
  Moved the listener to `document`.
- **The drawer header went stale.** Moving a deal's stage re-rendered the body
  but not the header, so the pill kept saying "Lead" above a body that had
  moved on. `Drawer` now exposes `setHeader()`.
- **"Closing soonest" led with six closed deals**, because their closing dates
  are in the past and date-ascending is not the same as soonest-ahead.
- **Row 10 rendered as "1C".** The index column was 3% wide, which came to
  about 8px of content box after padding. Invisible unless you compare
  `scrollWidth` to `clientWidth`, which is worth doing on any dense table.
- **Contacts were linked to the wrong transactions.** The seed data hand-listed
  array indices. Now the links are derived from the deal records, so they
  cannot drift.
- **`api.js` derived "today" from a UTC timestamp.** `new Date().toISOString()
  .slice(0, 10)` is UTC, so a deal created in the evening in Sydney was stamped
  with tomorrow's date and opened at −1 days in stage. `format.todayISO()`
  existed precisely to prevent this, and `api.js` had quietly bypassed it.

---

## What is deliberately missing

- **No authentication.** Anyone with the URL sees everything.
- **No server.** Data lives in one browser. Open it somewhere else and you get
  the seed data back.
- **No tests.**
- **Search is substring, not fuzzy.** "nakamura camellia" finds nothing, which
  is correct behaviour for what it is, but it will surprise someone.
- **No pagination.** Fine at 27 rows, not at 2,700.
- **No transactions list.** See the note under *Three screens*.
- **The logo is a placeholder.** An abstract mark, not First American's actual
  trademark.

---

## Reset

Sidebar → **Reset demo data** throws away every local change and reloads
`seed.json`. Use it before a demo.

To change the starting data, edit `src/data/seed.json` and reset.
