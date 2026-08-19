# Session 2 — Build and Ship a CRM

Keep this open next to Cursor. By the end you'll have a real app at a real URL.

**Build this in a new folder, outside the hive mind repo.** The hive mind holds
shared context; this is an application.

---

## Step 0 — The four pieces

Every web app is these four things. That's it.

| Piece | What it is | Ours |
|---|---|---|
| **Front end** | What you see and click | HTML, CSS, JavaScript in the browser |
| **Back end** | The logic and rules | A mock API — plain JSON to start |
| **Data** | What's stored, survives a refresh | Local storage |
| **Hosting** | What puts it on the internet | Netlify |

The reason you can build this now: each piece is small. The only genuinely hard
part is the boundaries between them — and that's step 3.

---

## Step 1 — One sentence

> "A CRM that stores contacts and lets me add, edit and delete them."

Write yours. If you can't say it in one sentence, it's too big for a first build.
**Cut it down — don't plan harder.**

Then list your screens. Three or fewer.

---

## Step 2 — Something on screen in ten minutes

Ask Cursor:

> "Build me a single HTML page that shows a list of contacts. Use hardcoded fake
> data. No styling yet."

One page. Fake data. **Deliberately ugly.**

Open it in your browser. That's your app.

Resist the urge to start with folder structure or picking a framework. Seeing
something real early is what stops people bouncing off.

**Now deploy it — yes, already.** Drag the folder onto netlify.com. You have a
public URL, at step 2, with an ugly app. That's on purpose: deploying is where the
surprises are, and you want them while the app is tiny.

---

## Step 3 — The mock backend

**This is the most important step of the day.**

> "Move the contact data into a separate file, and give me functions to read and
> write it — getContacts, addContact, deleteContact. The page should call those
> functions instead of touching the data directly."

Look at what changed. Your page no longer knows where contacts come from. It
**asks**.

That's the whole idea behind "back end". Swap the JSON file for a real database
later and only the inside of those functions changes — the page doesn't care. That
boundary is what makes an app something you can keep working on instead of
something you eventually rewrite.

---

## Step 4 — Make it work

> "Add a form to create a contact, an edit button on each row, and a delete
> button. Save to local storage so the data survives a refresh."

Test it. Add someone. Refresh. Still there? Good.

**Ugly but working beats pretty but fake, every time.**

---

## Step 5 — Now make it look right

Only now.

> "Style this. Consistent spacing, one type scale, two colours, and a proper empty
> state for when there are no contacts."

If your team has a design system, ask Cursor to use it. Otherwise the four things
above will carry you a long way.

Real empty states matter more than they look — "No contacts yet. Add your first
one." is the difference between a prototype and a thing.

---

## Step 6 — Check, then deploy properly

**Before you deploy, ask:**

> "Am I leaking any keys?"

**Anything in your front-end code is public the moment it's live.** Anyone can
open dev tools and read it. This is the most common way people leak credentials
on their first deploy.

If you have a key in your code, the fix is *never* to hide it better. Move the
call to the back end, or use Netlify's environment variables.

Then:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Or drag the folder onto netlify.com. Both work.

**Send the link to someone.** The deploy isn't the finish line — watching one
person use it is.

---

## Step 7 — Now do it like an engineer

You've got a working app. Now add one more feature — properly.

Pick something real: search, tags, notes on a contact, CSV export.

Ask Cursor:

> "Break this feature down."

That fires `33-build-break-work-into-prs`, which takes you down three levels:

```
Feature  →  Milestones  →  Pull Requests  →  a design doc for each
```

**Milestone test:** if we shipped only this and stopped, would anyone be better
off? If not, it's a step, not a milestone.

**PR test:** could a reviewer read it in under ten minutes? Does `main` still work
with it merged? If the title needs an "and", split it again.

**Then a one-page design doc for each PR — before any code.** Title, why, what it
depends on, the approach, acceptance, what's out of scope.

This is the step everyone skips, and it's the one that makes the rest work.
Writing it is how you discover the PR is still too big — which is much cheaper to
find out now than after you've built it.

---

## Step 8 — Ship PR 1. Only PR 1.

> "Ship the first PR."

That fires `36-build-create-a-pull-request`: branch, build only this slice, check it, commit, open
the PR, get it reviewed, merge.

**Then stop.** Don't start PR 2 in the same breath — re-read the rest of the plan
first, because the merge you just did may have changed it.

Two things to hold onto:

- **The design doc is your PR description.** That's why you wrote it. Paste it in.
- **Out of scope is binding.** You'll spot other things worth fixing — write them
  down as future PRs. Scope creep is how a ten-minute review becomes an hour.

---

## When it breaks

It will. That's the job, not a detour.

**Read the error message.** Genuinely read it — it usually names the file and the
line. Then paste it into Cursor with "what does this mean and how do I fix it".

Stuck more than fifteen minutes? Ship the smaller version and move on.

---

## On Monday

The chunking from step 7 is the part that transfers. Next time you're handed
something too big to start, run it: milestones, then PRs, then a design doc for
each — before any code.

It works the same whether you're building it yourself or handing it to an
engineer. It's just a better way to think about work.
