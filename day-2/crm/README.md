# Activity 2 — Build and Ship a CRM

**Session 2 · Levels 5, 7 · 4 hours**

Everyone builds a working CRM with a mock backend, deploys it to a public URL,
then adds one more feature the way an engineer would — chunked into milestones and
PRs, with a design doc for each.

## What they walk out with

- A live URL they can send to a colleague
- A working mental model of front end vs back end vs data vs hosting
- A delivery plan: feature → milestones → PRs → **a design doc per PR**
- One feature shipped through that process end to end
- The knowledge that they can launch their own app

## Why a CRM

Databases are relatable to designers and researchers alike — everyone has used a
CRM, everyone understands contacts, and nobody needs the domain explained. It's
the shortest path to *"here's how you launch your own app"* without a detour
through business logic.

The framing is citizen-developer empowerment, and it's the emotional payoff of the
two days. Session 1 was context and process. This one is *you can build things now*.

## Build it outside this repo

**The CRM does not go in the hive mind.** Separate folder, own git repo.

The hive mind is shared context; an application is not context. Say this at the
start of the session — after a day of "put your work in the repo", people will
reasonably assume the opposite.

## Run sheet

| # | Block | Time | Skill in play |
|---|---|---|---|
| 0 | Full-stack anatomy — the four pieces | 25 min | — |
| 1 | **What does it do? One sentence.** | 15 min | `35-build-app-from-scratch` |
| 2 | **Something on screen in ten minutes** | 25 min | `35-build-app-from-scratch` |
| 3 | **The mock backend** — the boundary that matters | 35 min | `35-build-app-from-scratch` |
| — | *Break* | 10 min | |
| 4 | **Make it work** — add, edit, delete, persist | 30 min | `35-build-app-from-scratch` |
| 5 | **Make it look right** | 20 min | `35-build-app-from-scratch` · `15-design-system` |
| 6 | **Security check, then deploy to Netlify** | 25 min | `38-build-security-check` → `35-build-app-from-scratch` |
| — | *Break* | 10 min | |
| 7 | **Ship like an engineer** — chunk the next feature | 30 min | `33-build-break-work-into-prs` |
| 8 | **Ship one PR** end to end | 25 min | `36-build-create-a-pull-request` |
| 9 | Wrap — Monday at work | 10 min | — |

Blocks 7 and 8 are the part that transfers to their day job. Blocks 1–6 are what
earns their attention first.

## The arc, and why it's in this order

**Build fast, then build properly.** Blocks 1–6 get a real thing live in about two
and a half hours, deliberately skipping process. Blocks 7–8 then add *one* more
feature the professional way, on a codebase they now care about.

Teaching the process first would be teaching an answer to a question nobody has
asked yet. By block 7 they've felt the mess, so chunking lands as relief rather
than bureaucracy.

## Skills, and why each one

### `35-build-app-from-scratch` — blocks 1–6

Front end, mock backend, data, hosting — named, then built.

The load-bearing idea is in block 3: **the front end never touches the data
directly, it asks the back end.** Swapping the JSON file for a real database later
changes only what's behind those functions. That's the whole reason the boundary
exists, and it's the concept that makes "full-stack" stop being intimidating.

Its ordering rules matter as much as its content: something ugly on screen in ten
minutes, styling last, deploy early and often. First deploy belongs at block 2,
not block 6 — deploying is where the surprises live and you want them while the
app is tiny.

### `38-build-security-check` — block 6, before deploying

Deliberately placed *before* the deploy, not after.

**Anything in front-end code is public the moment it goes live.** A key in your
JavaScript is readable by anyone who opens dev tools. This is the single most
common way people leak credentials on their first deploy, and this room is about
to do exactly that for the first time.

The fix is never "hide the key better" — it's move the call to the back end, or
use Netlify's environment variables.

### `33-build-break-work-into-prs` — block 7, the centrepiece

The habit that separates people who ship from people with a branch open for three
weeks:

```
Feature  →  Milestones  →  Pull Requests  →  a design doc for each
```

- **Milestone test:** if we shipped only this and stopped, would anyone be better
  off?
- **PR test:** a reviewer can read it in under ten minutes, and `main` stays
  deployable. Past ~400 lines, split again. If the title needs an "and", split
  again.
- **Then a one-page design doc per PR, before any code.** This is the step people
  skip and the one that makes the rest work — writing it is where you discover the
  PR is still too big.

It writes docs, never code. That separation is the point.

### `36-build-create-a-pull-request` — block 8

Takes PR 1 and delivers it: branch, build only this slice, check, commit, open,
review, merge. **Then stops.**

One at a time is the entire discipline. The design doc becomes the PR description
via `--body-file`, which is the payoff for having written it in block 7.

### `15-design-system` — block 5, if it applies

Only if the participant is building against a real design system. Otherwise
consistent spacing, one type scale, two colours, real empty states.

## Not used in this session

`research-*`, `13-design-frame-problem`, `19-design-ux-copy-review` — day-job skills.
`pm-*` isn't taught.

## Before the day

- [ ] Netlify accounts — free tier, but confirm nothing blocks signup on
      corporate machines
- [ ] Node installed, or the browser-based path decided (see facilitator notes)
- [ ] A finished reference CRM built and deployed, to demo at block 0 and to fall
      back on
- [ ] The A/B testing content decided — keep it high-level or cut it. The
      app-building flow stays in.
