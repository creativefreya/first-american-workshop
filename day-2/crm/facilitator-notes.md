# Session 2 — Facilitator Notes

## The mood is different from Session 1

Session 1 was structure, conventions and process — necessary, not thrilling. This
one is the payoff, and it should feel like it.

The framing that matters: **"here's how you launch your own app."** Citizen
developer, not junior engineer. Nobody in this room is being retrained as a
developer, and saying so out loud removes the defensiveness that otherwise sits
under the whole session.

If Session 1 went badly for someone — auth failures, fell behind — **this session
is the recovery**. It has no dependency on Session 1's output. Say that early so
anyone who had a rough Thursday knows Friday is a clean start.

## Timing, honestly

**Blocks 1–6 will overrun.** Everyone builds at different speeds and some will
gold-plate step 5 given the chance.

**Hard cutoff on block 5 (styling).** It's the most enjoyable block and the least
important — designers will happily spend an hour on it and then miss the deploy.
Give it 20 minutes and call time. Say up front that styling is capped.

**Protect blocks 7 and 8.** They're the transferable part. If you arrive at block
7 with only 30 minutes left, run block 7 fully and demo block 8 rather than
dropping both — the chunking is what they'll actually use on Monday.

**Cut in this order:** block 5 down to 10 minutes → block 8 becomes a demo → block
4 features trimmed to add and delete only.

**Never cut:** block 3 (the mock backend boundary) or block 6 (security, then
deploy). Those two are the concepts.

## Where it breaks

### Node and npm

`netlify-cli` needs Node. On locked-down corporate machines it may not be there
and may not be installable.

**Fallback:** drag-and-drop deploy on netlify.com. No Node, no terminal, same
result, works in a browser. Have this ready as the default rather than the
exception — decide at the dry run.

### Netlify signup

Free tier, but corporate SSO or email restrictions can block signup. Confirm
before the day.

**Fallback:** one shared account you deploy from, or `.zip` the folder so they
have the artefact. Losing the public URL costs the session its best moment, so
try hard to make signup work.

### Everyone's app diverges

By block 4 nobody has the same code, so you can't screen-share a fix.

- Keep **your** reference CRM at each step so you always have something correct to
  show
- Answer with the *shape* of the fix, not the exact line
- Anything longer than five minutes goes to a breakout room

### "Cursor won't do what I asked"

The most common complaint, and it's almost always the prompt.

Teach the pattern once, early, and refer back to it: **say what you want, name the
file, say what not to change.** *"In index.html, add a delete button to each row.
Don't change the styling."*

This is a genuinely transferable lesson, so treat the first occurrence as a
teaching moment rather than a support ticket.

### The first error in front of everyone

**This is the highest-leverage moment of the session.** Someone will hit an error
on screen share.

Slow down. Read it out loud. Point at the filename and the line number. Paste it
into Cursor. Fix it. Then say plainly that this is what building is — not a
detour from it.

Rushing past it teaches the room that errors are embarrassing. Half of them
already believe that.

## Things to say out loud

- **"Ugly but working beats pretty but fake."** Blocks 2 and 4, and again whenever
  someone stalls on appearance.
- **"Anything in your front-end code is public."** Block 6. Not a scare — a rule
  they'll need the first time they build something real.
- **"A pull request is a proposal, not a submission."** Block 8, same as Session 1.
- **"Out of scope is binding."** Block 8. Scope creep is the thing that will
  actually bite them at work.
- **"Getting stuck and unstuck is the skill."** Whenever it's needed, and it will
  be.

## Cohort B specifics

~40 people, 5 helpers. Everything from
[`../hive-mind/facilitator-notes.md`](../hive-mind/facilitator-notes.md) applies —
plus:

- **Checkpoints at blocks 2, 4 and 6.** "You should have a page with contacts on
  it", "you should be able to add someone and refresh", "you should have a URL".
  Public checkpoints let people self-diagnose instead of quietly falling behind.
- **Block 6 is the celebration.** Get URLs into the chat. Forty people posting
  live links is the moment the two days pay off, and it's worth spending five
  extra minutes on.
- Fast finishers get a job: add a feature, or help their group.

## Prep

- [ ] Build and deploy the reference CRM end to end — demo at block 0, fallback
      throughout
- [ ] Confirm Node availability, or default to drag-and-drop deploy
- [ ] Confirm Netlify signup works on a corporate machine
- [ ] Decide the A/B testing content — high-level or cut. App-building flow stays.
- [ ] HTML activity file generated from `participant-steps.md`
- [ ] Dry run with Alex, Mon/Tue 17–18 Aug — build the CRM start to finish at
      workshop pace and time each block
