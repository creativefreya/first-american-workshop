# First American — Becoming an Augmented Designer

Workshop materials for the two-day First American training. Facilitator notes,
participant handouts, and the CRM prototypes the room builds against.

**Facilitators:** Freya Stockman · Alex Zinoviev
**Format:** 4 hours per day · 12:00–4:00pm PDT / 9:00am–1:00pm HST / 5:00–9:00am AU

---

## What's here

```
day-1/
└── booklet/          The participant workbook — every Day 1 slide, with the
                      activities interleaved. Ships as a PDF.
day-2/
└── crm/              Build and ship a CRM. Reference app, website mockup,
                      facilitator notes, participant steps.
```

### Day 1 — the booklet

`day-1/booklet/First-American-Day-1-Booklet.pdf` — 63 pages, A4 landscape. One
page per slide in running order with a notes lane, the housekeeping pages from
the FigJam board up front, and the five hands-on activities dropped in at the
point in the run where the room actually does them.

`day-1-booklet-contact-sheet.png` shows all 63 pages at a glance — the fastest
way to check the shape of the day.

The slides are screenshots of the live React deck, so the booklet can't drift
from what gets presented. See `day-1/booklet/README.md` for the build.

### Day 2 — the CRM

Everyone builds a working CRM with a mock backend, deploys it to a public URL,
then adds one more feature the way an engineer would — chunked into milestones
and PRs, with a design doc for each.

| | |
|---|---|
| `reference-app/` | The finished CRM, vanilla JS + CSS, no build step. Open `index.html`. This is the target, not a starter — it's what "done" looks like. |
| `website-mockup/` | Single-page marketing site mockup for the same product. |
| `participant-steps.md` | What the room follows. |
| `facilitator-notes.md` | Timings, where people get stuck, what to demo. |

Databases are relatable to designers and researchers alike — everyone has used a
CRM, so nobody needs the domain explained. It's the shortest path to *"here's how
you launch your own app"* without a detour through business logic.

---

## Related repos

| | |
|---|---|
| [first-american-product-brain](https://github.com/creativefreya/first-american-product-brain) | The product-brain repo participants clone and work in on Day 1 — product-context, skills chains, repos directory, MCP config. |
| Augmented Designer (private) | Where the slide deck itself lives, at `departments/sales/corporate-training/first-american/workshop-materials/First-American-2-Day-Training`. Not public, and not needed to run the workshop. |

## Gotchas

- **The Day 1 planning docs in the Augmented Designer repo are stale.** They
  describe an earlier deck build. The React deck is the source of truth for
  content, and this booklet is generated from it.
- **The reference app has no build step and no dependencies.** Open
  `day-2/crm/reference-app/index.html` in a browser, or serve the folder. If
  something wants `npm install`, it's the wrong folder.
