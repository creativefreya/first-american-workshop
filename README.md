# First American — Becoming an Augmented Designer

Workshop materials for the two-day First American training. Facilitator notes,
participant steps, and the CRM prototypes the room builds against.

**Facilitators:** Freya Stockman · Alex Zinoviev
**Format:** 4 hours per day · 12:00–4:00pm PDT / 9:00am–1:00pm HST / 5:00–9:00am AU

---

## What's here

```
day-2/
└── crm/              Build and ship a CRM. Reference app, website mockup,
                      facilitator notes, participant steps.
docs/                 Reference material for the room.
```

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

## Reference

`docs/cursor-connection-options.md` — MCP vs API vs CLI vs native integrations,
tool by tool across First American's approved stack, with the distinctions that
come up in the room (a native Slack integration and a Slack MCP are not the same
feature) and the security lines worth having ready.

## Related repos

| | |
|---|---|
| [first-american-product-brain](https://github.com/creativefreya/first-american-product-brain) | The product-brain repo participants clone and work in on Day 1 — product-context, skills chains, repos directory, MCP config. |
| Augmented Designer (private) | Where the slide deck itself lives, at `departments/sales/corporate-training/first-american/workshop-materials/First-American-2-Day-Training`. Not public, and not needed to run the workshop. |

## Gotchas

- **The Day 1 planning docs in the Augmented Designer repo are stale.** They
  describe an earlier deck build. The React deck is the source of truth for
  content.
- **The Day 1 participant booklet is no longer published here.** It lives in the
  Augmented Designer repo at `workshop-materials/booklet/`, which is where it is
  built and where the PDF is generated.
- **The reference app has no build step and no dependencies.** Open
  `day-2/crm/reference-app/index.html` in a browser, or serve the folder. If
  something wants `npm install`, it's the wrong folder.
